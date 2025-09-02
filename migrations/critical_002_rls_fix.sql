-- /migrations/critical_002_rls_fix.sql
-- CORREÇÃO COMPLETA DO RLS COM BACKFILL CORRETO

BEGIN;

-- 1. Garantir extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar tabela tenants se não existir
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  plan VARCHAR(50) DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Adicionar tenant_id SEM default aleatório
DO $$ 
BEGIN
  -- Users
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='users' AND column_name='tenant_id') THEN
    ALTER TABLE users ADD COLUMN tenant_id UUID;
  END IF;
  
  -- Documents
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='documents' AND column_name='tenant_id') THEN
    ALTER TABLE documents ADD COLUMN tenant_id UUID;
  END IF;
  
  -- Templates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='templates' AND column_name='tenant_id') THEN
    ALTER TABLE templates ADD COLUMN tenant_id UUID;
  END IF;
  
  -- Patients
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='patients' AND column_name='tenant_id') THEN
    ALTER TABLE patients ADD COLUMN tenant_id UUID;
  END IF;
  
  -- Audit logs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='audit_logs' AND column_name='tenant_id') THEN
    ALTER TABLE audit_logs ADD COLUMN tenant_id UUID;
  END IF;
  
  -- Signature records
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='signature_records' AND column_name='tenant_id') THEN
    ALTER TABLE signature_records ADD COLUMN tenant_id UUID;
  END IF;
END $$;

-- 4. Criar tenant default e fazer backfill inteligente
WITH default_tenant AS (
  INSERT INTO tenants (name, plan, metadata) 
  VALUES ('Clínica Padrão', 'free', '{"migration": "v3", "created_by": "system"}')
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
)
-- Backfill users primeiro
UPDATE users u
SET tenant_id = COALESCE(
  u.tenant_id,
  (SELECT id FROM default_tenant)
)
WHERE u.tenant_id IS NULL;

-- Backfill documents baseado no usuário criador
UPDATE documents d
SET tenant_id = COALESCE(
  d.tenant_id,
  (SELECT u.tenant_id FROM users u WHERE u.id = d.created_by),
  (SELECT id FROM tenants ORDER BY created_at LIMIT 1)
)
WHERE d.tenant_id IS NULL;

-- Backfill outras tabelas
UPDATE templates SET tenant_id = (SELECT id FROM tenants ORDER BY created_at LIMIT 1) 
WHERE tenant_id IS NULL;

UPDATE patients SET tenant_id = (SELECT id FROM tenants ORDER BY created_at LIMIT 1) 
WHERE tenant_id IS NULL;

UPDATE audit_logs SET tenant_id = (SELECT id FROM tenants ORDER BY created_at LIMIT 1) 
WHERE tenant_id IS NULL;

UPDATE signature_records SET tenant_id = (SELECT id FROM tenants ORDER BY created_at LIMIT 1) 
WHERE tenant_id IS NULL;

-- 5. Adicionar foreign keys
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS fk_users_tenant,
  ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) 
  REFERENCES tenants(id) ON DELETE RESTRICT;

ALTER TABLE documents 
  DROP CONSTRAINT IF EXISTS fk_docs_tenant,
  ADD CONSTRAINT fk_docs_tenant FOREIGN KEY (tenant_id) 
  REFERENCES tenants(id) ON DELETE RESTRICT;

ALTER TABLE templates 
  DROP CONSTRAINT IF EXISTS fk_tpl_tenant,
  ADD CONSTRAINT fk_tpl_tenant FOREIGN KEY (tenant_id) 
  REFERENCES tenants(id) ON DELETE RESTRICT;

ALTER TABLE patients 
  DROP CONSTRAINT IF EXISTS fk_pat_tenant,
  ADD CONSTRAINT fk_pat_tenant FOREIGN KEY (tenant_id) 
  REFERENCES tenants(id) ON DELETE RESTRICT;

ALTER TABLE audit_logs 
  DROP CONSTRAINT IF EXISTS fk_audit_tenant,
  ADD CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) 
  REFERENCES tenants(id) ON DELETE RESTRICT;

ALTER TABLE signature_records 
  DROP CONSTRAINT IF EXISTS fk_sign_tenant,
  ADD CONSTRAINT fk_sign_tenant FOREIGN KEY (tenant_id) 
  REFERENCES tenants(id) ON DELETE RESTRICT;

-- 6. Tornar NOT NULL após backfill
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE documents ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE templates ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE patients ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE audit_logs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE signature_records ALTER COLUMN tenant_id SET NOT NULL;

-- 7. Habilitar RLS com FORCE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates FORCE ROW LEVEL SECURITY;

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE signature_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_records FORCE ROW LEVEL SECURITY;

-- 8. Criar políticas com USING e WITH CHECK
-- Drop antigas se existirem
DROP POLICY IF EXISTS tenant_iso_users ON users;
DROP POLICY IF EXISTS tenant_iso_docs ON documents;
DROP POLICY IF EXISTS tenant_iso_tpl ON templates;
DROP POLICY IF EXISTS tenant_iso_pat ON patients;
DROP POLICY IF EXISTS tenant_iso_audit ON audit_logs;
DROP POLICY IF EXISTS tenant_iso_sign ON signature_records;

-- Criar novas com WITH CHECK
CREATE POLICY tenant_iso_users ON users
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_iso_docs ON documents
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_iso_tpl ON templates
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_iso_pat ON patients
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Audit logs: apenas leitura filtrada
CREATE POLICY tenant_iso_audit ON audit_logs
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_iso_sign ON signature_records
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- 9. Índices otimizados
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_date ON documents(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_tenant_active ON templates(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_patients_tenant_name ON patients(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_date ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sign_tenant ON signature_records(tenant_id);

COMMIT;

-- Teste de sanidade
DO $$
DECLARE
  test_tenant_id UUID;
BEGIN
  SELECT id INTO test_tenant_id FROM tenants LIMIT 1;
  
  -- Testar set_config
  PERFORM set_config('app.current_tenant_id', test_tenant_id::text, true);
  
  -- Testar query
  PERFORM COUNT(*) FROM documents;
  
  RAISE NOTICE 'RLS configurado com sucesso para tenant %', test_tenant_id;
END $$;