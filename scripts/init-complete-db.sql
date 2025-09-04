-- RepoMed IA - Complete Database Schema
-- Compatible with the Drizzle schema defined in TypeScript

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (multi-tenancy support)
DROP TABLE IF EXISTS organizations CASCADE;
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Users table with CRM validation and authentication
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    crm VARCHAR(20),
    uf VARCHAR(2),
    role VARCHAR(50) NOT NULL DEFAULT 'medico',
    is_active BOOLEAN DEFAULT true,
    crm_validated_at TIMESTAMP,
    last_login_at TIMESTAMP,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Templates médicos
DROP TABLE IF EXISTS templates CASCADE;
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Documents gerados
DROP TABLE IF EXISTS documents CASCADE;
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content JSONB DEFAULT '{}',
    patient_name VARCHAR(255),
    doctor_name VARCHAR(255),
    doctor_crm VARCHAR(20),
    data_json JSONB,
    pdf_url TEXT,
    hash VARCHAR(64),
    qr_code TEXT,
    is_signed BOOLEAN DEFAULT false,
    signed_at TIMESTAMP,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Shares (compartilhamentos)
DROP TABLE IF EXISTS shares CASCADE;
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Audit logs
DROP TABLE IF EXISTS audit_logs CASCADE;
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id),
    action VARCHAR(50) NOT NULL,
    actor_name VARCHAR(255),
    actor_email VARCHAR(255),
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_crm_uf ON users(crm, uf) WHERE crm IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert default organization
INSERT INTO organizations (name) VALUES ('RepoMed IA - Organização Padrão');

-- Insert sample templates
INSERT INTO templates (name, description, fields) VALUES
(
    'Receita Simples',
    'Template para receita médica simples',
    '[
        {"key": "medicamento", "label": "Medicamento", "type": "text", "required": true},
        {"key": "dosagem", "label": "Dosagem", "type": "text", "required": true},
        {"key": "frequencia", "label": "Frequência", "type": "text", "required": true},
        {"key": "instrucoes", "label": "Instruções de Uso", "type": "textarea"}
    ]'::jsonb
),
(
    'Atestado Médico',
    'Template para atestado médico',
    '[
        {"key": "paciente", "label": "Nome do Paciente", "type": "text", "required": true},
        {"key": "cpf", "label": "CPF", "type": "text", "required": true},
        {"key": "dias_afastamento", "label": "Dias de Afastamento", "type": "number", "required": true},
        {"key": "motivo", "label": "Motivo", "type": "textarea", "required": true},
        {"key": "cid", "label": "CID-10", "type": "text"}
    ]'::jsonb
),
(
    'Laudo Médico',
    'Template para laudo médico completo',
    '[
        {"key": "paciente", "label": "Paciente", "type": "text", "required": true},
        {"key": "exame", "label": "Tipo de Exame", "type": "text", "required": true},
        {"key": "data_exame", "label": "Data do Exame", "type": "date", "required": true},
        {"key": "resultado", "label": "Resultado", "type": "textarea", "required": true},
        {"key": "conclusao", "label": "Conclusão", "type": "textarea", "required": true}
    ]'::jsonb
);

-- Create a demo user for testing
INSERT INTO users (name, email, password, crm, uf, role, is_active, crm_validated_at) VALUES
(
    'Dr. João Silva Demo',
    'demo@repomed.com',
    '$2a$10$rBYtHhGbk6oUb9XmqQJ5S.d0WbRnJEGdP8B2VKqXcCqPNyHvJzNhO', -- password: demo123
    '123456',
    'SP',
    'medico',
    true,
    CURRENT_TIMESTAMP
);

-- Enable Row Level Security (optional, commented out for now)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE templates ENABLE ROW LEVEL SECURITY;