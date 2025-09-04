-- Complete Medical System Tables for RepoMed IA v3.0

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
  control_type VARCHAR(10),
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

-- Inserir dados iniciais CID-10
INSERT INTO cid10 (code, description, category) VALUES
('A09', 'Diarreia e gastroenterite de origem infecciosa', 'Doenças infecciosas'),
('B34.2', 'Infecção por coronavírus', 'Doenças virais'),
('E11', 'Diabetes mellitus tipo 2', 'Doenças endócrinas'),
('F32', 'Episódios depressivos', 'Transtornos mentais'),
('F41', 'Transtornos ansiosos', 'Transtornos mentais'),
('G43', 'Enxaqueca', 'Doenças do sistema nervoso'),
('I10', 'Hipertensão essencial', 'Doenças circulatórias'),
('J00', 'Nasofaringite aguda (resfriado comum)', 'Doenças respiratórias'),
('J11', 'Influenza (gripe)', 'Doenças respiratórias'),
('J18', 'Pneumonia', 'Doenças respiratórias'),
('K29', 'Gastrite e duodenite', 'Doenças digestivas'),
('M54', 'Dorsalgia', 'Doenças musculoesqueléticas'),
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
('Metformina', 'Metformina', '500mg, 850mg', false)
ON CONFLICT DO NOTHING;
