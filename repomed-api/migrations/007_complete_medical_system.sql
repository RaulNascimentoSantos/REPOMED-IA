-- CID-10 completo
CREATE TABLE IF NOT EXISTS cid10 (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  chapter VARCHAR(10),
  searchable tsvector GENERATED ALWAYS AS (
    to_tsvector('portuguese', code || ' ' || description)
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cid10_code ON cid10(code);
CREATE INDEX IF NOT EXISTS idx_cid10_search ON cid10 USING GIN(searchable);

-- Medicamentos ANVISA
CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  active_ingredient VARCHAR(255),
  manufacturer VARCHAR(255),
  presentation VARCHAR(255),
  dosage VARCHAR(100),
  anvisa_registry VARCHAR(50),
  controlled BOOLEAN DEFAULT false,
  control_type VARCHAR(10), -- A1, A2, A3, B1, B2, C1, C2, C3, C4, C5
  max_dosage VARCHAR(100),
  pediatric_dosage VARCHAR(100),
  contraindications TEXT[],
  interactions TEXT[],
  side_effects TEXT[],
  searchable tsvector GENERATED ALWAYS AS (
    to_tsvector('portuguese', name || ' ' || COALESCE(active_ingredient, ''))
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_search ON medications USING GIN(searchable);

-- Interações medicamentosas
CREATE TABLE IF NOT EXISTS drug_interactions (
  id SERIAL PRIMARY KEY,
  drug1_id INTEGER REFERENCES medications(id),
  drug2_id INTEGER REFERENCES medications(id),
  severity VARCHAR(20), -- MINOR, MODERATE, MAJOR, CONTRAINDICATED
  description TEXT,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(drug1_id, drug2_id)
);

-- Prescrições
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  diagnosis TEXT,
  cid10_codes VARCHAR(10)[],
  notes TEXT,
  valid_until DATE,
  status VARCHAR(20) DEFAULT 'draft', -- draft, signed, cancelled
  signed_at TIMESTAMPTZ,
  signature_hash VARCHAR(256),
  pdf_url TEXT,
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens da prescrição
CREATE TABLE IF NOT EXISTS prescription_items (
  id SERIAL PRIMARY KEY,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  medication_id INTEGER REFERENCES medications(id),
  custom_medication VARCHAR(255),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  quantity INTEGER,
  instructions TEXT,
  substitutable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de prescrição
CREATE TABLE IF NOT EXISTS prescription_templates (
  id SERIAL PRIMARY KEY,
  doctor_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  diagnosis VARCHAR(255),
  cid10_codes VARCHAR(10)[],
  items JSONB,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos médicos
CREATE TABLE IF NOT EXISTS medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  type VARCHAR(50), -- prescription, certificate, report, exam_request, referral
  title VARCHAR(255),
  content TEXT,
  data JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  signature_hash VARCHAR(256),
  pdf_url TEXT,
  shared_token VARCHAR(100) UNIQUE,
  shared_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auditoria médica
CREATE TABLE IF NOT EXISTS medical_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON medical_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON medical_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON medical_audit_log(created_at DESC);

-- Métricas e analytics
CREATE TABLE IF NOT EXISTS medical_metrics (
  id SERIAL PRIMARY KEY,
  doctor_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  metric_date DATE NOT NULL,
  patients_attended INTEGER DEFAULT 0,
  prescriptions_created INTEGER DEFAULT 0,
  documents_generated INTEGER DEFAULT 0,
  avg_consultation_time INTERVAL,
  most_prescribed_medications JSONB,
  most_common_diagnoses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, metric_date)
);

-- Inserir dados iniciais CID-10 (principais)
INSERT INTO cid10 (code, description, category) VALUES
('A09', 'Diarreia e gastroenterite de origem infecciosa', 'Doenças infecciosas'),
('B34.2', 'Infecção por coronavírus', 'Doenças virais'),
('E11', 'Diabetes mellitus tipo 2', 'Doenças endócrinas'),
('F32', 'Episódios depressivos', 'Transtornos mentais'),
('F41', 'Transtornos ansiosos', 'Transtornos mentais'),
('G43', 'Enxaqueca', 'Doenças do sistema nervoso'),
('H10', 'Conjuntivite', 'Doenças do olho'),
('H66', 'Otite média', 'Doenças do ouvido'),
('I10', 'Hipertensão essencial', 'Doenças circulatórias'),
('J00', 'Nasofaringite aguda (resfriado comum)', 'Doenças respiratórias'),
('J03', 'Amigdalite aguda', 'Doenças respiratórias'),
('J06', 'Infecções agudas das vias aéreas superiores', 'Doenças respiratórias'),
('J11', 'Influenza (gripe)', 'Doenças respiratórias'),
('J18', 'Pneumonia', 'Doenças respiratórias'),
('J45', 'Asma', 'Doenças respiratórias'),
('K29', 'Gastrite e duodenite', 'Doenças digestivas'),
('L50', 'Urticária', 'Doenças da pele'),
('M54', 'Dorsalgia', 'Doenças musculoesqueléticas'),
('N30', 'Cistite', 'Doenças geniturinárias'),
('N39.0', 'Infecção do trato urinário', 'Doenças geniturinárias'),
('R05', 'Tosse', 'Sintomas gerais'),
('R50', 'Febre', 'Sintomas gerais'),
('R51', 'Cefaleia', 'Sintomas gerais')
ON CONFLICT (code) DO NOTHING;

-- Inserir medicamentos comuns
INSERT INTO medications (name, active_ingredient, presentation, controlled) VALUES
('Paracetamol', 'Paracetamol', '500mg, 750mg', false),
('Dipirona', 'Dipirona sódica', '500mg, 1g', false),
('Ibuprofeno', 'Ibuprofeno', '200mg, 400mg, 600mg', false),
('Amoxicilina', 'Amoxicilina', '500mg, 875mg', false),
('Azitromicina', 'Azitromicina', '500mg', false),
('Omeprazol', 'Omeprazol', '20mg, 40mg', false),
('Losartana', 'Losartana potássica', '50mg, 100mg', false),
('Metformina', 'Metformina', '500mg, 850mg', false),
('Sinvastatina', 'Sinvastatina', '20mg, 40mg', false),
('Rivotril', 'Clonazepam', '0.5mg, 2mg', true),
('Diazepam', 'Diazepam', '5mg, 10mg', true),
('Alprazolam', 'Alprazolam', '0.25mg, 0.5mg, 1mg', true)
ON CONFLICT DO NOTHING;