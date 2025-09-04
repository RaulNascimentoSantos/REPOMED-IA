-- RepoMed IA - Script de Inicialização do Banco
-- Criar tabelas conforme schema definido

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Templates médicos
DROP TABLE IF EXISTS templates CASCADE;
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Documentos gerados
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Compartilhamentos
DROP TABLE IF EXISTS shares CASCADE;
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    password VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Logs de auditoria
DROP TABLE IF EXISTS audit_logs CASCADE;
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID,
    action VARCHAR(50) NOT NULL,
    actor_name VARCHAR(255),
    actor_email VARCHAR(255),
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Inserir templates de exemplo
INSERT INTO templates (name, description, fields) VALUES
(
    'Receita Simples',
    'Template para receita médica simples',
    '[{"key": "medicamento", "label": "Medicamento", "type": "text"}, {"key": "dosagem", "label": "Dosagem", "type": "text"}, {"key": "instrucoes", "label": "Instruções", "type": "text"}]'::jsonb
),
(
    'Atestado Médico',
    'Template para atestado médico',
    '[{"key": "dias_afastamento", "label": "Dias de Afastamento", "type": "number"}, {"key": "motivo", "label": "Motivo", "type": "text"}, {"key": "cid", "label": "CID", "type": "text"}]'::jsonb
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);