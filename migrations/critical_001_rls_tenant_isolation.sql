-- CORREÇÃO CRÍTICA 1: ROW LEVEL SECURITY + ISOLAMENTO POR TENANT
-- Data: 31/08/2025
-- Prioridade: P0 (CRÍTICA)

-- 1. Adicionar tenant_id em TODAS as tabelas
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE templates ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE patients ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE signature_records ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();

-- 2. Criar tabela de tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  plan VARCHAR(50) DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS em TODAS as tabelas
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_records ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de isolamento
CREATE POLICY tenant_isolation_documents ON documents
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_templates ON templates
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_patients ON patients
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_audit ON audit_logs
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_signatures ON signature_records
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_tenant ON templates(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);

-- 6. Criar tabelas se não existirem (compatibilidade)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  crm VARCHAR(20),
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  fields JSONB NOT NULL,
  patient JSONB NOT NULL,
  hash VARCHAR(64) NOT NULL UNIQUE,
  qr_code TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  specialty VARCHAR(100),
  version VARCHAR(10),
  fields JSONB,
  content TEXT,
  compliance JSONB,
  is_active BOOLEAN DEFAULT true,
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(20),
  birth_date DATE,
  allergies TEXT[],
  chronic_conditions TEXT[],
  medications TEXT[],
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  user_id UUID,
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signature_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  signer_id UUID,
  signature_data TEXT NOT NULL,
  certificate_serial VARCHAR(100),
  certificate_subject TEXT,
  certificate_issuer TEXT,
  provider VARCHAR(50),
  tenant_id UUID NOT NULL DEFAULT gen_random_uuid(),
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Inserir tenant padrão para desenvolvimento
INSERT INTO tenants (id, name, plan, is_active) 
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Desenvolvimento Local',
  'development',
  true
) ON CONFLICT (id) DO NOTHING;

-- 8. Configurar função para setar tenant automaticamente
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', p_tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;