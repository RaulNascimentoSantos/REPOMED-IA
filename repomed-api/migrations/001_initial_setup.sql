-- =====================================================
-- MIGRAÇÃO 001: Setup Inicial Multi-Tenant
-- Arquitetura avançada com Row Level Security (RLS)
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =====================================================
-- DOMÍNIOS E TIPOS PERSONALIZADOS
-- =====================================================

-- Tipo para documentos FHIR
CREATE DOMAIN fhir_resource AS jsonb
CHECK (
  value ? 'resourceType' AND
  value ? 'id' AND 
  jsonb_typeof(value->'resourceType') = 'string'
);

-- Tipo para status de documento
CREATE TYPE document_status AS ENUM ('draft', 'active', 'cancelled', 'completed', 'signed');

-- Tipo para nível de urgência
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Tipo para tipo de usuário
CREATE TYPE user_type AS ENUM ('admin', 'doctor', 'nurse', 'receptionist', 'patient');

-- =====================================================
-- TABELA DE ORGANIZAÇÕES (Multi-tenant)
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  
  -- Configurações da organização
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Limites e quotas
  max_users INTEGER DEFAULT 50,
  max_storage_gb INTEGER DEFAULT 10,
  max_documents_month INTEGER DEFAULT 1000,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Controle de ativação
  active BOOLEAN DEFAULT TRUE,
  trial_ends_at TIMESTAMPTZ,
  
  CONSTRAINT valid_cnpj CHECK (cnpj ~ '^[0-9]{14}$'),
  CONSTRAINT valid_email CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

-- Índices para organizações
CREATE INDEX idx_organizations_cnpj ON organizations(cnpj);
CREATE INDEX idx_organizations_active ON organizations(active);
CREATE INDEX idx_organizations_trial ON organizations(trial_ends_at) WHERE trial_ends_at IS NOT NULL;

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados pessoais
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cpf VARCHAR(11),
  phone VARCHAR(20),
  birth_date DATE,
  
  -- Autenticação
  password_hash VARCHAR(255),
  two_factor_secret VARCHAR(32),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  
  -- Dados profissionais
  user_type user_type NOT NULL DEFAULT 'doctor',
  crm VARCHAR(20), -- Para médicos
  specialty VARCHAR(100), -- Especialidade médica
  license_number VARCHAR(50), -- Número de registro profissional
  
  -- Certificado digital ICP-Brasil
  certificate_subject VARCHAR(500),
  certificate_serial VARCHAR(100),
  certificate_valid_until TIMESTAMPTZ,
  
  -- Configurações e preferências
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Controle de acesso
  active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_cpf CHECK (cpf ~ '^[0-9]{11}$'),
  CONSTRAINT valid_email_users CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT valid_crm CHECK (crm IS NULL OR crm ~ '^[0-9]{4,8}$')
);

-- Índices para usuários
CREATE UNIQUE INDEX idx_users_email_org ON users(email, organization_id);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_crm ON users(crm);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_certificate ON users(certificate_serial) WHERE certificate_serial IS NOT NULL;

-- =====================================================
-- TABELA DE PACIENTES
-- =====================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados pessoais
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE,
  cns VARCHAR(15), -- Cartão Nacional de Saúde
  rg VARCHAR(20),
  birth_date DATE NOT NULL,
  gender CHAR(1) CHECK (gender IN ('M', 'F')),
  
  -- Contato
  email VARCHAR(255),
  phone VARCHAR(20),
  emergency_contact JSONB, -- {name, phone, relationship}
  
  -- Endereço
  address JSONB,
  
  -- Dados clínicos
  blood_type VARCHAR(3),
  allergies TEXT[],
  chronic_conditions TEXT[],
  
  -- Dados FHIR
  fhir_id VARCHAR(64), -- ID no servidor FHIR/RNDS
  fhir_resource fhir_resource,
  
  -- Configurações
  active BOOLEAN DEFAULT TRUE,
  allow_sms BOOLEAN DEFAULT TRUE,
  allow_email BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_cpf_patients CHECK (cpf ~ '^[0-9]{11}$'),
  CONSTRAINT valid_cns CHECK (cns IS NULL OR cns ~ '^[0-9]{15}$'),
  CONSTRAINT valid_gender CHECK (gender IN ('M', 'F'))
);

-- Índices para pacientes
CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_cns ON patients(cns);
CREATE INDEX idx_patients_name ON patients USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_patients_birth_date ON patients(birth_date);
CREATE INDEX idx_patients_active ON patients(active);
CREATE INDEX idx_patients_fhir ON patients(fhir_id) WHERE fhir_id IS NOT NULL;

-- =====================================================
-- TABELA DE TEMPLATES DE DOCUMENTOS
-- =====================================================
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Metadados do template
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- receita, atestado, laudo, etc
  
  -- Template engine (Handlebars)
  template_content TEXT NOT NULL,
  template_styles TEXT, -- CSS para impressão
  
  -- Configurações
  active BOOLEAN DEFAULT TRUE,
  require_signature BOOLEAN DEFAULT TRUE,
  auto_fill_enabled BOOLEAN DEFAULT TRUE,
  
  -- Campos dinâmicos
  fields JSONB DEFAULT '[]'::jsonb, -- Array de field definitions
  
  -- Controle de versão
  version INTEGER DEFAULT 1,
  parent_template_id UUID REFERENCES document_templates(id),
  
  -- Auditoria
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_template_content CHECK (length(template_content) > 10)
);

-- Índices para templates
CREATE INDEX idx_templates_org ON document_templates(organization_id);
CREATE INDEX idx_templates_category ON document_templates(category);
CREATE INDEX idx_templates_active ON document_templates(active);
CREATE INDEX idx_templates_created_by ON document_templates(created_by);

-- =====================================================
-- TABELA DE DOCUMENTOS MÉDICOS
-- =====================================================
CREATE TABLE medical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Relacionamentos
  template_id UUID REFERENCES document_templates(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Metadados
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  status document_status DEFAULT 'draft',
  urgency urgency_level DEFAULT 'medium',
  
  -- Conteúdo
  content JSONB NOT NULL, -- Dados estruturados do documento
  rendered_html TEXT, -- HTML renderizado
  rendered_pdf BYTEA, -- PDF gerado
  
  -- Dados FHIR
  fhir_id VARCHAR(64), -- ID no servidor FHIR/RNDS
  fhir_resource fhir_resource,
  
  -- Assinatura digital
  signature_data JSONB, -- Envelope de assinatura ICP-Brasil
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES users(id),
  signature_valid_until TIMESTAMPTZ,
  
  -- Compartilhamento
  share_token VARCHAR(64) UNIQUE,
  share_expires_at TIMESTAMPTZ,
  public_verification_code VARCHAR(32),
  
  -- Timestamps e auditoria
  document_date TIMESTAMPTZ DEFAULT NOW(), -- Data do documento médico
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_share_token CHECK (share_token IS NULL OR length(share_token) = 64),
  CONSTRAINT valid_verification_code CHECK (public_verification_code IS NULL OR length(public_verification_code) = 32)
);

-- Índices para documentos médicos
CREATE INDEX idx_documents_org ON medical_documents(organization_id);
CREATE INDEX idx_documents_patient ON medical_documents(patient_id);
CREATE INDEX idx_documents_creator ON medical_documents(created_by);
CREATE INDEX idx_documents_template ON medical_documents(template_id);
CREATE INDEX idx_documents_type ON medical_documents(document_type);
CREATE INDEX idx_documents_status ON medical_documents(status);
CREATE INDEX idx_documents_date ON medical_documents(document_date);
CREATE INDEX idx_documents_share_token ON medical_documents(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_documents_verification ON medical_documents(public_verification_code) WHERE public_verification_code IS NOT NULL;
CREATE INDEX idx_documents_fhir ON medical_documents(fhir_id) WHERE fhir_id IS NOT NULL;

-- =====================================================
-- TABELA DE SESSÕES
-- =====================================================
CREATE TABLE sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dados da sessão
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Controle de acesso
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  CONSTRAINT valid_session_id CHECK (length(id) = 128)
);

-- Índices para sessões
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_last_accessed ON sessions(last_accessed_at);

-- =====================================================
-- TABELA DE AUDITORIA
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação do evento
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(128) REFERENCES sessions(id),
  
  -- Detalhes do evento
  action VARCHAR(50) NOT NULL, -- create, update, delete, sign, share, etc
  resource_type VARCHAR(50) NOT NULL, -- document, patient, user, etc
  resource_id UUID,
  
  -- Dados do evento
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_action CHECK (action ~ '^[a-z_]+$')
);

-- Índices para auditoria
CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- Política para organizações (admin pode ver todas, usuários só a sua)
CREATE POLICY org_isolation ON organizations
FOR ALL TO authenticated
USING (
  id = current_setting('app.current_organization_id')::uuid 
  OR current_setting('app.user_type') = 'admin'
);

-- Política para usuários (isolamento por organização)
CREATE POLICY user_isolation ON users
FOR ALL TO authenticated
USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- Política para pacientes (isolamento por organização)
CREATE POLICY patient_isolation ON patients
FOR ALL TO authenticated
USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- Política para templates (isolamento por organização)
CREATE POLICY template_isolation ON document_templates
FOR ALL TO authenticated
USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- Política para documentos médicos (isolamento por organização + visibilidade)
CREATE POLICY document_isolation ON medical_documents
FOR ALL TO authenticated
USING (
  organization_id = current_setting('app.current_organization_id')::uuid
  AND (
    created_by = current_setting('app.current_user_id')::uuid
    OR patient_id IN (
      SELECT id FROM patients 
      WHERE organization_id = current_setting('app.current_organization_id')::uuid
    )
    OR current_setting('app.user_type') IN ('admin', 'doctor')
  )
);

-- Política para sessões (usuário vê apenas suas próprias sessões)
CREATE POLICY session_isolation ON sessions
FOR ALL TO authenticated
USING (
  user_id = current_setting('app.current_user_id')::uuid
  OR current_setting('app.user_type') = 'admin'
);

-- Política para auditoria (isolamento por organização)
CREATE POLICY audit_isolation ON audit_logs
FOR ALL TO authenticated
USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- =====================================================
-- FUNÇÃO PARA CONFIGURAR CONTEXTO RLS
-- =====================================================
CREATE OR REPLACE FUNCTION set_user_context(
  p_user_id uuid,
  p_organization_id uuid,
  p_user_type text
) RETURNS void AS $$
BEGIN
  -- Configurar variáveis de sessão para RLS
  PERFORM set_config('app.current_user_id', p_user_id::text, true);
  PERFORM set_config('app.current_organization_id', p_organization_id::text, true);
  PERFORM set_config('app.user_type', p_user_type, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÕES DE AUDITORIA AUTOMÁTICA
-- =====================================================
CREATE OR REPLACE FUNCTION audit_trigger_function() 
RETURNS trigger AS $$
DECLARE
  audit_data jsonb;
BEGIN
  -- Preparar dados para auditoria
  audit_data := jsonb_build_object(
    'table_name', TG_TABLE_NAME,
    'operation', TG_OP,
    'old_data', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  -- Inserir log de auditoria
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    COALESCE(
      current_setting('app.current_organization_id', true)::uuid,
      CASE 
        WHEN TG_OP IN ('INSERT', 'UPDATE') THEN (to_jsonb(NEW)->>'organization_id')::uuid
        ELSE (to_jsonb(OLD)->>'organization_id')::uuid
      END
    ),
    current_setting('app.current_user_id', true)::uuid,
    lower(TG_OP),
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP IN ('INSERT', 'UPDATE') THEN (to_jsonb(NEW)->>'id')::uuid
      ELSE (to_jsonb(OLD)->>'id')::uuid
    END,
    audit_data
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS DE AUDITORIA
-- =====================================================

-- Auditoria para todas as operações nas tabelas principais
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_patients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_documents_trigger
  AFTER INSERT OR UPDATE OR DELETE ON medical_documents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_templates_trigger
  AFTER INSERT OR UPDATE OR DELETE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- FUNÇÃO UPDATED_AT AUTOMÁTICA
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON medical_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS PARA RELATÓRIOS
-- =====================================================

-- View de documentos com informações completas
CREATE VIEW v_documents_full AS
SELECT 
  d.id,
  d.title,
  d.document_type,
  d.status,
  d.urgency,
  d.document_date,
  d.created_at,
  d.signed_at,
  
  -- Paciente
  p.name as patient_name,
  p.cpf as patient_cpf,
  p.birth_date as patient_birth_date,
  
  -- Médico criador
  u.name as doctor_name,
  u.crm as doctor_crm,
  u.specialty as doctor_specialty,
  
  -- Organização
  o.name as organization_name,
  
  -- Assinatura
  CASE WHEN d.signature_data IS NOT NULL THEN true ELSE false END as is_signed,
  d.signature_valid_until

FROM medical_documents d
JOIN patients p ON d.patient_id = p.id
JOIN users u ON d.created_by = u.id  
JOIN organizations o ON d.organization_id = o.id;

-- View de estatísticas por organização
CREATE VIEW v_organization_stats AS
SELECT
  o.id as organization_id,
  o.name as organization_name,
  
  -- Contadores
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT p.id) as total_patients,
  COUNT(DISTINCT d.id) as total_documents,
  COUNT(DISTINCT CASE WHEN d.signed_at IS NOT NULL THEN d.id END) as signed_documents,
  
  -- Este mês
  COUNT(DISTINCT CASE WHEN d.created_at >= date_trunc('month', CURRENT_DATE) THEN d.id END) as documents_this_month,
  
  -- Uso de storage (simulado)
  COALESCE(SUM(octet_length(d.rendered_pdf)), 0) as storage_used_bytes

FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.active = true
LEFT JOIN patients p ON p.organization_id = o.id AND p.active = true  
LEFT JOIN medical_documents d ON d.organization_id = o.id
GROUP BY o.id, o.name;

-- =====================================================
-- DADOS INICIAIS DE TESTE
-- =====================================================

-- Organização de demonstração
INSERT INTO organizations (id, name, cnpj, email, phone, active) VALUES 
('00000000-0000-0000-0000-000000000001', 'Clínica Exemplo', '12345678000195', 'contato@clinicaexemplo.com.br', '11999999999', true);

-- Usuário administrador padrão
INSERT INTO users (id, organization_id, name, email, user_type, active, email_verified) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Dr. João Silva', 'admin@clinicaexemplo.com.br', 'admin', true, true);

-- Template básico de receita
INSERT INTO document_templates (id, organization_id, name, category, template_content, created_by) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Receita Médica Simples', 'receita', 
'<h2>RECEITA MÉDICA</h2>
<p><strong>Paciente:</strong> {{patient.name}}</p>
<p><strong>Data:</strong> {{document.date}}</p>
<div>{{content.medications}}</div>
<p><strong>Médico:</strong> {{doctor.name}} - CRM: {{doctor.crm}}</p>',
'00000000-0000-0000-0000-000000000001');

COMMIT;