-- RepoMed IA - Database Initialization Script
-- Este script inicializa a estrutura básica do banco de dados PostgreSQL

-- Criação do banco de dados
CREATE DATABASE repomed_ia;

-- Conectar ao banco
\c repomed_ia;

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    crm VARCHAR(50),
    specialty VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pacientes
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    medical_history TEXT,
    allergies TEXT,
    medications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de consultas
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de documentos médicos
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- receita, atestado, laudo, etc.
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending_signature',
    signed BOOLEAN DEFAULT FALSE,
    signature_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de templates
CREATE TABLE document_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    variables JSON,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO users (email, name, crm, specialty, phone, address) VALUES
('dr.silva@repomed.com.br', 'Dr. João Silva', 'CRM SP 123456', 'Clínica Geral', '(11) 99999-9999', 'São Paulo, SP');

INSERT INTO patients (name, cpf, email, phone, birth_date, address) VALUES
('Maria Silva Santos', '123.456.789-00', 'maria@email.com', '(11) 88888-8888', '1985-03-15', 'São Paulo, SP'),
('José Oliveira', '987.654.321-00', 'jose@email.com', '(11) 77777-7777', '1975-08-22', 'São Paulo, SP'),
('Ana Costa', '456.789.123-00', 'ana@email.com', '(11) 66666-6666', '1990-12-10', 'São Paulo, SP'),
('Carlos Pereira', '789.123.456-00', 'carlos@email.com', '(11) 55555-5555', '1968-06-05', 'São Paulo, SP'),
('Fernanda Lima', '321.654.987-00', 'fernanda@email.com', '(11) 44444-4444', '1982-11-30', 'São Paulo, SP'),
('Roberto Souza', '654.987.321-00', 'roberto@email.com', '(11) 33333-3333', '1979-04-18', 'São Paulo, SP'),
('Juliana Mendes', '147.258.369-00', 'juliana@email.com', '(11) 22222-2222', '1993-07-25', 'São Paulo, SP'),
('Paulo Rodrigues', '258.369.147-00', 'paulo@email.com', '(11) 11111-1111', '1965-01-12', 'São Paulo, SP');

INSERT INTO document_templates (name, type, content, variables, created_by) VALUES
('Receita Médica Padrão', 'receita', 'Prescrevo: {{medicamento}} - {{posologia}} - {{quantidade}}', '["medicamento", "posologia", "quantidade"]', 1),
('Atestado Médico', 'atestado', 'Atesto que {{paciente}} necessita de {{dias}} dias de afastamento por motivo de {{motivo}}.', '["paciente", "dias", "motivo"]', 1),
('Laudo Médico', 'laudo', 'Após exame clínico de {{paciente}}, concluo: {{conclusao}}', '["paciente", "conclusao"]', 1);

INSERT INTO documents (patient_id, doctor_id, type, title, content, status, signed) VALUES
(1, 1, 'receita', 'Receita - Maria Silva Santos', 'Prescrevo: Metformina 850mg - 1 comprimido de 12/12h por 30 dias', 'pending_signature', false),
(2, 1, 'atestado', 'Atestado - José Oliveira', 'Atesto que José Oliveira necessita de 3 dias de repouso por gripe.', 'pending_signature', false),
(3, 1, 'laudo', 'Laudo - Ana Costa', 'Após exame clínico, paciente apresenta quadro compatível com hipertensão arterial leve.', 'signed', true),
(4, 1, 'receita', 'Receita - Carlos Pereira', 'Prescrevo: Losartana 50mg - 1 comprimido pela manhã por 30 dias', 'signed', true);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO repomed_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO repomed_user;