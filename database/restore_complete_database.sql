-- =====================================================
-- RESTAURAÇÃO COMPLETA DO BANCO REPOMED IA V4.0
-- Estrutura avançada com Multi-tenancy e Row Level Security
-- =====================================================

-- Criar banco e conectar
DROP DATABASE IF EXISTS repomed_ia;
CREATE DATABASE repomed_ia;
\c repomed_ia;

-- =====================================================
-- EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =====================================================
-- TIPOS PERSONALIZADOS
-- =====================================================
CREATE DOMAIN fhir_resource AS jsonb
CHECK (
  value ? 'resourceType' AND
  value ? 'id' AND
  jsonb_typeof(value->'resourceType') = 'string'
);

CREATE TYPE document_status AS ENUM ('draft', 'active', 'cancelled', 'completed', 'signed');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE user_type AS ENUM ('admin', 'doctor', 'nurse', 'receptionist', 'patient');

-- =====================================================
-- TABELA DE ORGANIZAÇÕES
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  settings JSONB DEFAULT '{}'::jsonb,
  max_users INTEGER DEFAULT 50,
  max_storage_gb INTEGER DEFAULT 10,
  max_documents_month INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  trial_ends_at TIMESTAMPTZ,
  license_type VARCHAR(50) DEFAULT 'trial',
  license_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  CONSTRAINT valid_cnpj CHECK (cnpj ~ '^[0-9]{14}$'),
  CONSTRAINT valid_email CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

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
  crm VARCHAR(20),
  specialty VARCHAR(100),
  license_number VARCHAR(50),

  -- Certificado digital ICP-Brasil
  certificate_subject VARCHAR(500),
  certificate_serial VARCHAR(100),
  certificate_valid_until TIMESTAMPTZ,

  -- Configurações e preferências
  preferences JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,

  -- Controle de acesso
  active BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  profile_image_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_cpf CHECK (cpf ~ '^[0-9]{11}$'),
  CONSTRAINT valid_email_users CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT valid_crm CHECK (crm IS NULL OR crm ~ '^[0-9]{4,8}$')
);

-- =====================================================
-- TABELA DE PACIENTES
-- =====================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Dados pessoais
  name VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE,
  cns VARCHAR(15),
  rg VARCHAR(20),
  birth_date DATE NOT NULL,
  gender CHAR(1) CHECK (gender IN ('M', 'F')),

  -- Contato
  email VARCHAR(255),
  phone VARCHAR(20),
  emergency_contact JSONB,

  -- Endereço
  address JSONB,

  -- Dados clínicos
  blood_type VARCHAR(3),
  allergies TEXT[],
  chronic_conditions TEXT[],
  medical_history TEXT,
  medications TEXT,

  -- Dados FHIR
  fhir_id VARCHAR(64),
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

-- =====================================================
-- TABELA DE TEMPLATES
-- =====================================================
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Metadados do template
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  type VARCHAR(50) NOT NULL,

  -- Template engine
  template_content TEXT NOT NULL,
  content TEXT NOT NULL,
  template_styles TEXT,

  -- Configurações
  active BOOLEAN DEFAULT TRUE,
  require_signature BOOLEAN DEFAULT TRUE,
  auto_fill_enabled BOOLEAN DEFAULT TRUE,

  -- Campos dinâmicos
  fields JSONB DEFAULT '[]'::jsonb,
  variables JSON,

  -- Controle de versão
  version INTEGER DEFAULT 1,
  parent_template_id UUID REFERENCES document_templates(id),

  -- Auditoria
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_template_content CHECK (length(template_content) > 10)
);

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
  doctor_id UUID REFERENCES users(id),

  -- Metadados
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status document_status DEFAULT 'draft',
  urgency urgency_level DEFAULT 'medium',
  signed BOOLEAN DEFAULT FALSE,

  -- Conteúdo
  content JSONB NOT NULL,
  rendered_html TEXT,
  rendered_pdf BYTEA,

  -- Dados FHIR
  fhir_id VARCHAR(64),
  fhir_resource fhir_resource,

  -- Assinatura digital
  signature_data JSONB,
  signature_hash VARCHAR(255),
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES users(id),
  signature_valid_until TIMESTAMPTZ,

  -- Compartilhamento
  share_token VARCHAR(64) UNIQUE,
  share_expires_at TIMESTAMPTZ,
  public_verification_code VARCHAR(32),

  -- Timestamps e auditoria
  document_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_share_token CHECK (share_token IS NULL OR length(share_token) = 64),
  CONSTRAINT valid_verification_code CHECK (public_verification_code IS NULL OR length(public_verification_code) = 32)
);

-- Criar alias para compatibilidade
CREATE VIEW documents AS SELECT
  id, organization_id, template_id, patient_id, created_by as doctor_id,
  title, document_type as type, status, content, signed, signature_hash,
  signed_at, created_at, updated_at
FROM medical_documents;

-- =====================================================
-- TABELA DE PRESCRIÇÕES
-- =====================================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES users(id),

  medications JSONB NOT NULL,
  instructions TEXT,
  status VARCHAR(50) DEFAULT 'active',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA DE SESSÕES
-- =====================================================
CREATE TABLE sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Dados da sessão
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  refresh_token_hash VARCHAR(255) UNIQUE,

  -- Controle de acesso
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  refresh_expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,

  CONSTRAINT valid_session_id CHECK (length(id) = 128)
);

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
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,

  -- Dados do evento
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  old_value JSONB,
  new_value JSONB,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_action CHECK (action ~ '^[a-z_]+$')
);

-- =====================================================
-- TABELA DE COMPARTILHAMENTOS
-- =====================================================
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id),

  share_token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SISTEMA DE PERMISSÕES
-- =====================================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name, organization_id)
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- =====================================================
-- TABELA DE JOBS ASSÍNCRONOS
-- =====================================================
CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  job_type VARCHAR(50) NOT NULL,
  job_queue VARCHAR(50) DEFAULT 'default',
  payload JSONB NOT NULL,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  result JSONB,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CACHE DE ESTATÍSTICAS
-- =====================================================
CREATE TABLE statistics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  cache_key VARCHAR(100) NOT NULL,
  cache_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  CONSTRAINT unique_cache_key UNIQUE (organization_id, cache_key)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Organizações
CREATE INDEX idx_organizations_cnpj ON organizations(cnpj);
CREATE INDEX idx_organizations_active ON organizations(active);

-- Usuários
CREATE UNIQUE INDEX idx_users_email_org ON users(email, organization_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_crm ON users(crm);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_email ON users(email);

-- Pacientes
CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_cns ON patients(cns);
CREATE INDEX idx_patients_name ON patients USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_patients_birth_date ON patients(birth_date);
CREATE INDEX idx_patients_active ON patients(active);

-- Templates
CREATE INDEX idx_templates_org ON document_templates(organization_id);
CREATE INDEX idx_templates_category ON document_templates(category);
CREATE INDEX idx_templates_active ON document_templates(active);
CREATE INDEX idx_templates_created_by ON document_templates(created_by);

-- Documentos
CREATE INDEX idx_documents_org ON medical_documents(organization_id);
CREATE INDEX idx_documents_patient ON medical_documents(patient_id);
CREATE INDEX idx_documents_creator ON medical_documents(created_by);
CREATE INDEX idx_documents_template ON medical_documents(template_id);
CREATE INDEX idx_documents_type ON medical_documents(document_type);
CREATE INDEX idx_documents_status ON medical_documents(status);
CREATE INDEX idx_documents_date ON medical_documents(document_date);
CREATE INDEX idx_documents_patient_date ON medical_documents(patient_id, document_date DESC, status);
CREATE INDEX idx_documents_doctor_recent ON medical_documents(created_by, created_at DESC) WHERE status IN ('draft', 'active');

-- Sessões
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);

-- Auditoria
CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Jobs
CREATE INDEX idx_jobs_status_queue ON background_jobs(status, job_queue, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_jobs_org ON background_jobs(organization_id);

-- Cache
CREATE INDEX idx_statistics_cache_org_key ON statistics_cache(organization_id, cache_key);
CREATE INDEX idx_statistics_cache_expires ON statistics_cache(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para configurar contexto RLS
CREATE OR REPLACE FUNCTION set_user_context(
  p_user_id uuid,
  p_organization_id uuid,
  p_user_type text
) RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', p_user_id::text, true);
  PERFORM set_config('app.current_organization_id', p_organization_id::text, true);
  PERFORM set_config('app.user_type', p_user_type, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função updated_at automática
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

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_background_jobs_updated_at BEFORE UPDATE ON background_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Organização exemplo
INSERT INTO organizations (id, name, cnpj, email, phone, active) VALUES
('00000000-0000-0000-0000-000000000001', 'Clínica RepoMed', '12345678000195', 'contato@repomed.com.br', '(11) 99999-9999', true);

-- Usuário administrador
INSERT INTO users (id, organization_id, name, email, user_type, crm, specialty, active, email_verified) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Dr. João Silva', 'dr.silva@repomed.com.br', 'admin', 'SP123456', 'Clínica Geral', true, true);

-- Pacientes exemplo (8 pacientes completos)
INSERT INTO patients (id, organization_id, name, cpf, birth_date, gender, email, phone, address, blood_type, medical_history) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Maria Silva Santos', '12345678901', '1985-03-15', 'F', 'maria@email.com', '(11) 98888-8888', '{"rua": "Rua A, 123", "cidade": "São Paulo", "cep": "01234-567"}', 'A+', 'Hipertensão arterial leve'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'José Oliveira', '98765432101', '1975-08-22', 'M', 'jose@email.com', '(11) 97777-7777', '{"rua": "Rua B, 456", "cidade": "São Paulo", "cep": "02345-678"}', 'O+', 'Diabetes tipo 2 controlado'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Ana Costa', '45678912301', '1990-12-10', 'F', 'ana@email.com', '(11) 96666-6666', '{"rua": "Rua C, 789", "cidade": "São Paulo", "cep": "03456-789"}', 'B+', 'Asma brônquica'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Carlos Pereira', '78912345601', '1968-06-05', 'M', 'carlos@email.com', '(11) 95555-5555', '{"rua": "Rua D, 321", "cidade": "São Paulo", "cep": "04567-890"}', 'AB+', 'Hipertensão e dislipidemia'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Fernanda Lima', '32165498701', '1982-11-30', 'F', 'fernanda@email.com', '(11) 94444-4444', '{"rua": "Rua E, 654", "cidade": "São Paulo", "cep": "05678-901"}', 'A-', 'Histórico de depressão'),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Roberto Souza', '65498732101', '1979-04-18', 'M', 'roberto@email.com', '(11) 93333-3333', '{"rua": "Rua F, 987", "cidade": "São Paulo", "cep": "06789-012"}', 'O-', 'Gastrite crônica'),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Juliana Mendes', '14725836901', '1993-07-25', 'F', 'juliana@email.com', '(11) 92222-2222', '{"rua": "Rua G, 147", "cidade": "São Paulo", "cep": "07890-123"}', 'B-', 'Enxaqueca crônica'),
('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Paulo Rodrigues', '25836914701', '1965-01-12', 'M', 'paulo@email.com', '(11) 91111-1111', '{"rua": "Rua H, 258", "cidade": "São Paulo", "cep": "08901-234"}', 'AB-', 'Artrite reumatoide');

-- Templates de documentos (6 templates avançados)
INSERT INTO document_templates (id, organization_id, name, type, category, template_content, content, variables, created_by) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Receita Médica Padrão', 'receita', 'receita',
'<h2>RECEITA MÉDICA</h2><p><strong>Paciente:</strong> {{paciente}}</p><p><strong>Medicamento:</strong> {{medicamento}}</p><p><strong>Posologia:</strong> {{posologia}}</p><p><strong>Médico:</strong> Dr. João Silva - CRM SP 123456</p>',
'Receita médica padrão com campos para medicamento e posologia',
'["paciente", "medicamento", "posologia"]', '00000000-0000-0000-0000-000000000001'),

('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Atestado Médico', 'atestado', 'atestado',
'<h2>ATESTADO MÉDICO</h2><p>Atesto que <strong>{{paciente}}</strong> necessita de <strong>{{dias}}</strong> dias de afastamento por motivo de <strong>{{motivo}}</strong>.</p><p><strong>Médico:</strong> Dr. João Silva - CRM SP 123456</p>',
'Atestado médico para afastamento do trabalho',
'["paciente", "dias", "motivo"]', '00000000-0000-0000-0000-000000000001'),

('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Laudo Médico', 'laudo', 'laudo',
'<h2>LAUDO MÉDICO</h2><p><strong>Paciente:</strong> {{paciente}}</p><p><strong>Exame:</strong> {{exame}}</p><p><strong>Resultado:</strong> {{resultado}}</p><p><strong>Conclusão:</strong> {{conclusao}}</p><p><strong>Médico:</strong> Dr. João Silva - CRM SP 123456</p>',
'Laudo médico para exames e procedimentos',
'["paciente", "exame", "resultado", "conclusao"]', '00000000-0000-0000-0000-000000000001'),

('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Relatório Médico', 'relatorio', 'relatorio',
'<h2>RELATÓRIO MÉDICO</h2><p><strong>Paciente:</strong> {{paciente}}</p><p><strong>Histórico:</strong> {{historico}}</p><p><strong>Exame Físico:</strong> {{exame_fisico}}</p><p><strong>Diagnóstico:</strong> {{diagnostico}}</p><p><strong>Conduta:</strong> {{conduta}}</p><p><strong>Médico:</strong> Dr. João Silva - CRM SP 123456</p>',
'Relatório médico completo para consultas',
'["paciente", "historico", "exame_fisico", "diagnostico", "conduta"]', '00000000-0000-0000-0000-000000000001'),

('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Declaração Médica', 'declaracao', 'declaracao',
'<h2>DECLARAÇÃO MÉDICA</h2><p>Declaro que <strong>{{paciente}}</strong> {{declaracao}}</p><p><strong>Observações:</strong> {{observacoes}}</p><p><strong>Médico:</strong> Dr. João Silva - CRM SP 123456</p>',
'Declaração médica para diversos fins',
'["paciente", "declaracao", "observacoes"]', '00000000-0000-0000-0000-000000000001'),

('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Encaminhamento', 'encaminhamento', 'encaminhamento',
'<h2>ENCAMINHAMENTO MÉDICO</h2><p><strong>Paciente:</strong> {{paciente}}</p><p><strong>Encaminhar para:</strong> {{especialidade}}</p><p><strong>Motivo:</strong> {{motivo}}</p><p><strong>Observações:</strong> {{observacoes}}</p><p><strong>Médico:</strong> Dr. João Silva - CRM SP 123456</p>',
'Encaminhamento para especialistas',
'["paciente", "especialidade", "motivo", "observacoes"]', '00000000-0000-0000-0000-000000000001');

-- Documentos exemplo (6 documentos)
INSERT INTO medical_documents (id, organization_id, patient_id, created_by, template_id, title, document_type, type, content, status, signed) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Receita - Maria Silva Santos', 'receita', 'receita', '{"medicamento": "Metformina 850mg", "posologia": "1 comprimido de 12/12h por 30 dias"}', 'draft', false),

('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Atestado - José Oliveira', 'atestado', 'atestado', '{"dias": "3", "motivo": "gripe"}', 'draft', false),

('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Laudo - Ana Costa', 'laudo', 'laudo', '{"exame": "Espirometria", "resultado": "VEF1 reduzido", "conclusao": "Compatível com asma brônquica"}', 'signed', true),

('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Receita - Carlos Pereira', 'receita', 'receita', '{"medicamento": "Losartana 50mg", "posologia": "1 comprimido pela manhã por 30 dias"}', 'signed', true),

('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Relatório - Fernanda Lima', 'relatorio', 'relatorio', '{"historico": "Paciente com quadro depressivo", "diagnostico": "Episódio depressivo moderado", "conduta": "Psicoterapia e medicação"}', 'draft', false),

('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'Encaminhamento - Roberto Souza', 'encaminhamento', 'encaminhamento', '{"especialidade": "Gastroenterologia", "motivo": "Investigação de gastrite crônica", "observacoes": "Paciente com sintomas há 6 meses"}', 'draft', false);

-- Permissões padrão
INSERT INTO permissions (name, resource, action, description) VALUES
    ('users.create', 'users', 'create', 'Criar novos usuários'),
    ('users.read', 'users', 'read', 'Visualizar usuários'),
    ('users.update', 'users', 'update', 'Atualizar usuários'),
    ('users.delete', 'users', 'delete', 'Deletar usuários'),
    ('patients.create', 'patients', 'create', 'Criar novos pacientes'),
    ('patients.read', 'patients', 'read', 'Visualizar pacientes'),
    ('patients.update', 'patients', 'update', 'Atualizar pacientes'),
    ('patients.delete', 'patients', 'delete', 'Deletar pacientes'),
    ('documents.create', 'documents', 'create', 'Criar novos documentos'),
    ('documents.read', 'documents', 'read', 'Visualizar documentos'),
    ('documents.update', 'documents', 'update', 'Atualizar documentos'),
    ('documents.delete', 'documents', 'delete', 'Deletar documentos'),
    ('documents.sign', 'documents', 'sign', 'Assinar documentos')
ON CONFLICT DO NOTHING;

-- Roles padrão
INSERT INTO roles (name, description, is_system_role) VALUES
    ('admin', 'Administrador do sistema com acesso total', true),
    ('medico', 'Médico com acesso a pacientes e documentos', true),
    ('secretario', 'Secretário com acesso limitado', true),
    ('enfermeiro', 'Enfermeiro com acesso a prontuários', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS PARA RELATÓRIOS
-- =====================================================
CREATE VIEW v_documents_full AS
SELECT
  d.id,
  d.title,
  d.document_type,
  d.status,
  d.document_date,
  d.created_at,
  d.signed_at,
  p.name as patient_name,
  p.cpf as patient_cpf,
  u.name as doctor_name,
  u.crm as doctor_crm,
  o.name as organization_name,
  CASE WHEN d.signature_data IS NOT NULL THEN true ELSE false END as is_signed
FROM medical_documents d
JOIN patients p ON d.patient_id = p.id
JOIN users u ON d.created_by = u.id
JOIN organizations o ON d.organization_id = o.id;

-- =====================================================
-- FUNCTIONS DE LIMPEZA
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

  -- Limpar jobs antigos
  DELETE FROM background_jobs
  WHERE created_at < CURRENT_DATE - interval '30 days'
    AND status IN ('completed', 'failed', 'cancelled');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  result := jsonb_set(result, '{old_jobs}', deleted_count::text::jsonb);

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================
COMMIT;