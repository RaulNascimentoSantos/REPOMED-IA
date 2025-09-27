-- =====================================================
-- MIGRAÇÃO 002: Otimizações de Performance
-- Índices avançados, particionamento e caching
-- =====================================================

-- =====================================================
-- ÍNDICES COMPOSTOS OTIMIZADOS
-- =====================================================

-- Índice composto para busca de documentos por paciente + data
CREATE INDEX CONCURRENTLY idx_documents_patient_date 
ON medical_documents(patient_id, document_date DESC, status);

-- Índice composto para dashboard médico
CREATE INDEX CONCURRENTLY idx_documents_doctor_recent 
ON medical_documents(created_by, created_at DESC) 
WHERE status IN ('draft', 'active');

-- Índice para busca full-text em pacientes (nome + CPF)
CREATE INDEX CONCURRENTLY idx_patients_search 
ON patients USING gin(
  to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(cpf, ''))
);

-- Índice para busca full-text em documentos
CREATE INDEX CONCURRENTLY idx_documents_search 
ON medical_documents USING gin(
  to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(document_type, ''))
);

-- Índice parcial para documentos não assinados (crítico para workflow)
CREATE INDEX CONCURRENTLY idx_documents_unsigned 
ON medical_documents(created_by, created_at DESC) 
WHERE signature_data IS NULL AND status = 'draft';

-- Índice para compartilhamentos ativos
CREATE INDEX CONCURRENTLY idx_documents_shared_active 
ON medical_documents(share_token, share_expires_at) 
WHERE share_token IS NOT NULL AND share_expires_at > NOW();

-- =====================================================
-- PARTICIONAMENTO DA TABELA DE AUDITORIA
-- =====================================================

-- Converter tabela de auditoria para particionada por mês
BEGIN;

-- Criar nova tabela particionada
CREATE TABLE audit_logs_partitioned (
  LIKE audit_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Criar partições para os próximos 12 meses
DO $$
DECLARE
  start_date date;
  end_date date;
  partition_name text;
BEGIN
  FOR i IN 0..11 LOOP
    start_date := date_trunc('month', CURRENT_DATE + (i || ' months')::interval);
    end_date := start_date + interval '1 month';
    partition_name := 'audit_logs_y' || to_char(start_date, 'YYYY') || 'm' || to_char(start_date, 'MM');
    
    EXECUTE format('
      CREATE TABLE %I PARTITION OF audit_logs_partitioned
      FOR VALUES FROM (%L) TO (%L)
    ', partition_name, start_date, end_date);
    
    -- Índices nas partições
    EXECUTE format('
      CREATE INDEX %I ON %I(organization_id, created_at DESC)
    ', partition_name || '_org_date_idx', partition_name);
    
    EXECUTE format('
      CREATE INDEX %I ON %I(user_id, created_at DESC)
    ', partition_name || '_user_date_idx', partition_name);
  END LOOP;
END $$;

-- Migrar dados existentes
INSERT INTO audit_logs_partitioned SELECT * FROM audit_logs;

-- Renomear tabelas
DROP TABLE audit_logs;
ALTER TABLE audit_logs_partitioned RENAME TO audit_logs;

-- Recriar RLS na nova tabela
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_isolation ON audit_logs
FOR ALL TO authenticated
USING (organization_id = current_setting('app.current_organization_id')::uuid);

COMMIT;

-- =====================================================
-- FUNÇÃO PARA CRIAÇÃO AUTOMÁTICA DE PARTIÇÕES
-- =====================================================
CREATE OR REPLACE FUNCTION create_monthly_partition() RETURNS void AS $$
DECLARE
  partition_date date;
  partition_name text;
  start_date date;
  end_date date;
BEGIN
  -- Próximo mês
  partition_date := date_trunc('month', CURRENT_DATE + interval '1 month');
  partition_name := 'audit_logs_y' || to_char(partition_date, 'YYYY') || 'm' || to_char(partition_date, 'MM');
  start_date := partition_date;
  end_date := partition_date + interval '1 month';
  
  -- Verificar se partição já existe
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = partition_name) THEN
    EXECUTE format('
      CREATE TABLE %I PARTITION OF audit_logs
      FOR VALUES FROM (%L) TO (%L)
    ', partition_name, start_date, end_date);
    
    -- Índices na nova partição
    EXECUTE format('
      CREATE INDEX %I ON %I(organization_id, created_at DESC)
    ', partition_name || '_org_date_idx', partition_name);
    
    EXECUTE format('
      CREATE INDEX %I ON %I(user_id, created_at DESC)  
    ', partition_name || '_user_date_idx', partition_name);
    
    RAISE NOTICE 'Created partition: %', partition_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABELA DE CACHE PARA ESTATÍSTICAS
-- =====================================================
CREATE TABLE statistics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificador do cache
  cache_key VARCHAR(100) NOT NULL,
  cache_type VARCHAR(50) NOT NULL, -- 'dashboard', 'reports', 'analytics'
  
  -- Dados em cache
  data JSONB NOT NULL,
  
  -- Controle de validade
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  CONSTRAINT unique_cache_key UNIQUE (organization_id, cache_key)
);

-- Índices para cache
CREATE INDEX idx_statistics_cache_org_key ON statistics_cache(organization_id, cache_key);
CREATE INDEX idx_statistics_cache_expires ON statistics_cache(expires_at);
CREATE INDEX idx_statistics_cache_type ON statistics_cache(cache_type);

-- =====================================================
-- FUNÇÃO DE LIMPEZA AUTOMÁTICA DE CACHE
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache() RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM statistics_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS MATERIALIZADAS PARA RELATÓRIOS
-- =====================================================

-- View materializada para estatísticas diárias por organização
CREATE MATERIALIZED VIEW mv_daily_stats AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  date_trunc('day', d.created_at) as stat_date,
  
  -- Contadores diários
  COUNT(d.id) as documents_created,
  COUNT(CASE WHEN d.status = 'signed' THEN 1 END) as documents_signed,
  COUNT(DISTINCT d.patient_id) as unique_patients,
  COUNT(DISTINCT d.created_by) as active_doctors,
  
  -- Por tipo de documento
  COUNT(CASE WHEN d.document_type = 'receita' THEN 1 END) as prescriptions,
  COUNT(CASE WHEN d.document_type = 'atestado' THEN 1 END) as certificates,
  COUNT(CASE WHEN d.document_type = 'laudo' THEN 1 END) as reports,
  
  -- Tempo médio até assinatura (em horas)
  AVG(EXTRACT(EPOCH FROM (d.signed_at - d.created_at))/3600) as avg_signature_time_hours

FROM organizations o
LEFT JOIN medical_documents d ON d.organization_id = o.id
WHERE d.created_at >= CURRENT_DATE - interval '30 days'
GROUP BY o.id, o.name, date_trunc('day', d.created_at);

-- Índices na view materializada
CREATE UNIQUE INDEX mv_daily_stats_pk ON mv_daily_stats(organization_id, stat_date);
CREATE INDEX mv_daily_stats_date ON mv_daily_stats(stat_date DESC);

-- View materializada para ranking de médicos
CREATE MATERIALIZED VIEW mv_doctor_performance AS
SELECT
  u.id as doctor_id,
  u.organization_id,
  u.name as doctor_name,
  u.crm,
  u.specialty,
  
  -- Métricas de performance (últimos 30 dias)
  COUNT(d.id) as documents_created,
  COUNT(CASE WHEN d.signed_at IS NOT NULL THEN 1 END) as documents_signed,
  COUNT(DISTINCT d.patient_id) as unique_patients,
  
  -- Tempo médio de assinatura
  AVG(EXTRACT(EPOCH FROM (d.signed_at - d.created_at))/3600) as avg_signature_time_hours,
  
  -- Distribuição por tipo
  jsonb_object_agg(
    d.document_type, 
    COUNT(d.id)
  ) as documents_by_type,
  
  -- Última atividade
  MAX(d.created_at) as last_document_created

FROM users u
JOIN medical_documents d ON d.created_by = u.id
WHERE u.user_type = 'doctor' 
  AND d.created_at >= CURRENT_DATE - interval '30 days'
GROUP BY u.id, u.organization_id, u.name, u.crm, u.specialty;

-- Índices na view materializada
CREATE UNIQUE INDEX mv_doctor_performance_pk ON mv_doctor_performance(doctor_id);
CREATE INDEX mv_doctor_performance_org ON mv_doctor_performance(organization_id);
CREATE INDEX mv_doctor_performance_docs ON mv_doctor_performance(documents_created DESC);

-- =====================================================
-- FUNÇÕES PARA REFRESH DAS VIEWS MATERIALIZADAS
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_materialized_views() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_doctor_performance;
  
  -- Log da atualização
  INSERT INTO audit_logs (organization_id, action, resource_type, details)
  SELECT 
    id,
    'refresh_materialized_views',
    'system',
    jsonb_build_object('timestamp', NOW())
  FROM organizations;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABELA PARA JOBS ASSÍNCRONOS
-- =====================================================
CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação do job
  job_type VARCHAR(50) NOT NULL, -- 'pdf_generation', 'email_send', 'fhir_sync', etc
  job_queue VARCHAR(50) DEFAULT 'default',
  
  -- Dados do job
  payload JSONB NOT NULL,
  
  -- Estado do job
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Timing
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Resultado
  result JSONB,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para jobs
CREATE INDEX idx_jobs_status_queue ON background_jobs(status, job_queue, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_jobs_org ON background_jobs(organization_id);
CREATE INDEX idx_jobs_type ON background_jobs(job_type);
CREATE INDEX idx_jobs_created ON background_jobs(created_at);

-- Trigger para updated_at nos jobs
CREATE TRIGGER update_background_jobs_updated_at BEFORE UPDATE ON background_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO PARA LIMPEZA DE DADOS ANTIGOS
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_data() RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  deleted_count integer;
BEGIN
  -- Limpar sessões expiradas
  DELETE FROM sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{expired_sessions}', deleted_count::text::jsonb);
  
  -- Limpar jobs antigos (mais de 30 dias)
  DELETE FROM background_jobs 
  WHERE created_at < CURRENT_DATE - interval '30 days'
    AND status IN ('completed', 'failed', 'cancelled');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{old_jobs}', deleted_count::text::jsonb);
  
  -- Limpar cache expirado
  SELECT cleanup_expired_cache() INTO deleted_count;
  result := jsonb_set(result, '{expired_cache}', deleted_count::text::jsonb);
  
  -- Limpar tokens de compartilhamento expirados
  UPDATE medical_documents 
  SET share_token = NULL, share_expires_at = NULL
  WHERE share_expires_at IS NOT NULL AND share_expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{expired_shares}', deleted_count::text::jsonb);
  
  -- Limpar partições de auditoria antigas (mais de 1 ano)
  DO $$
  DECLARE
    partition_name text;
    cutoff_date date := CURRENT_DATE - interval '1 year';
  BEGIN
    FOR partition_name IN 
      SELECT tablename 
      FROM pg_tables 
      WHERE tablename LIKE 'audit_logs_y%'
        AND tablename < 'audit_logs_y' || to_char(cutoff_date, 'YYYY') || 'm' || to_char(cutoff_date, 'MM')
    LOOP
      EXECUTE 'DROP TABLE IF EXISTS ' || partition_name;
      RAISE NOTICE 'Dropped old audit partition: %', partition_name;
    END LOOP;
  END $$;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================

-- Configurar work_mem para queries complexas
SET work_mem = '256MB';

-- Configurar maintenance_work_mem para operações de manutenção
SET maintenance_work_mem = '1GB';

-- Configurar random_page_cost para SSD
SET random_page_cost = 1.1;

-- Habilitar parallel query
SET max_parallel_workers_per_gather = 4;
SET parallel_tuple_cost = 0.1;
SET parallel_setup_cost = 1000.0;

-- =====================================================
-- JOBS AUTOMÁTICOS (usando pg_cron se disponível)
-- =====================================================

-- Criar função para agendar tarefas automáticas
CREATE OR REPLACE FUNCTION schedule_maintenance_tasks() RETURNS text AS $$
BEGIN
  -- Esta função seria usada com pg_cron para agendar:
  -- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data();');
  -- SELECT cron.schedule('refresh-views', '*/15 * * * *', 'SELECT refresh_materialized_views();');
  -- SELECT cron.schedule('create-partitions', '0 1 1 * *', 'SELECT create_monthly_partition();');
  
  RETURN 'Maintenance tasks scheduled (requires pg_cron extension)';
END;
$$ LANGUAGE plpgsql;

COMMIT;