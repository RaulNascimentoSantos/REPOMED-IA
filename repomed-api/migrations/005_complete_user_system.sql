-- ====== ORGANIZATIONS TABLE ======
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    license_type VARCHAR(50) DEFAULT 'trial', -- trial, basic, premium, enterprise
    license_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====== PERMISSIONS TABLE ======
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====== ROLES TABLE ======
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name, organization_id)
);

-- ====== ROLE_PERMISSIONS TABLE ======
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- ====== USER_ROLES TABLE ======
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- ====== UPDATE USERS TABLE ======
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- ====== AUDIT_LOGS IMPROVEMENTS ======
ALTER TABLE audit_logs 
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
    ADD COLUMN IF NOT EXISTS ip_address INET,
    ADD COLUMN IF NOT EXISTS user_agent TEXT,
    ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS resource_id UUID,
    ADD COLUMN IF NOT EXISTS old_value JSONB,
    ADD COLUMN IF NOT EXISTS new_value JSONB;

-- ====== ADD ORGANIZATION_ID TO ALL TABLES ======
ALTER TABLE patients ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE shares ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- ====== SESSION MANAGEMENT TABLE ======
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    refresh_expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====== INDEXES FOR PERFORMANCE ======
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_templates_organization_id ON templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_patients_organization_id ON patients(organization_id);

-- ====== DEFAULT SYSTEM ROLES ======
INSERT INTO roles (name, description, is_system_role) VALUES 
    ('admin', 'Administrador do sistema com acesso total', true),
    ('medico', 'Médico com acesso a pacientes e documentos', true),
    ('secretario', 'Secretário com acesso limitado', true),
    ('enfermeiro', 'Enfermeiro com acesso a prontuários', true)
ON CONFLICT DO NOTHING;

-- ====== DEFAULT PERMISSIONS ======
INSERT INTO permissions (name, resource, action, description) VALUES 
    -- Users
    ('users.create', 'users', 'create', 'Criar novos usuários'),
    ('users.read', 'users', 'read', 'Visualizar usuários'),
    ('users.update', 'users', 'update', 'Atualizar usuários'),
    ('users.delete', 'users', 'delete', 'Deletar usuários'),
    
    -- Patients
    ('patients.create', 'patients', 'create', 'Criar novos pacientes'),
    ('patients.read', 'patients', 'read', 'Visualizar pacientes'),
    ('patients.update', 'patients', 'update', 'Atualizar pacientes'),
    ('patients.delete', 'patients', 'delete', 'Deletar pacientes'),
    
    -- Documents
    ('documents.create', 'documents', 'create', 'Criar novos documentos'),
    ('documents.read', 'documents', 'read', 'Visualizar documentos'),
    ('documents.update', 'documents', 'update', 'Atualizar documentos'),
    ('documents.delete', 'documents', 'delete', 'Deletar documentos'),
    ('documents.sign', 'documents', 'sign', 'Assinar documentos'),
    
    -- Templates
    ('templates.create', 'templates', 'create', 'Criar novos templates'),
    ('templates.read', 'templates', 'read', 'Visualizar templates'),
    ('templates.update', 'templates', 'update', 'Atualizar templates'),
    ('templates.delete', 'templates', 'delete', 'Deletar templates'),
    
    -- Prescriptions
    ('prescriptions.create', 'prescriptions', 'create', 'Criar prescrições'),
    ('prescriptions.read', 'prescriptions', 'read', 'Visualizar prescrições'),
    ('prescriptions.update', 'prescriptions', 'update', 'Atualizar prescrições'),
    ('prescriptions.delete', 'prescriptions', 'delete', 'Deletar prescrições'),
    
    -- Metrics
    ('metrics.view', 'metrics', 'view', 'Visualizar métricas'),
    
    -- Settings
    ('settings.manage', 'settings', 'manage', 'Gerenciar configurações')
ON CONFLICT DO NOTHING;

-- ====== ASSIGN PERMISSIONS TO ADMIN ROLE ======
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin' AND r.is_system_role = true
ON CONFLICT DO NOTHING;

-- ====== ASSIGN PERMISSIONS TO MEDICO ROLE ======
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'medico' AND r.is_system_role = true
AND p.name IN (
    'patients.create', 'patients.read', 'patients.update',
    'documents.create', 'documents.read', 'documents.update', 'documents.sign',
    'templates.read',
    'prescriptions.create', 'prescriptions.read', 'prescriptions.update',
    'metrics.view'
)
ON CONFLICT DO NOTHING;

-- ====== ASSIGN PERMISSIONS TO SECRETARIO ROLE ======
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'secretario' AND r.is_system_role = true
AND p.name IN (
    'patients.create', 'patients.read', 'patients.update',
    'documents.read',
    'templates.read',
    'prescriptions.read'
)
ON CONFLICT DO NOTHING;

-- ====== ASSIGN PERMISSIONS TO ENFERMEIRO ROLE ======
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'enfermeiro' AND r.is_system_role = true
AND p.name IN (
    'patients.read',
    'documents.read',
    'prescriptions.read'
)
ON CONFLICT DO NOTHING;

-- ====== ROW LEVEL SECURITY POLICIES ======
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (example for documents table)
CREATE POLICY "Users can view documents from their organization"
    ON documents FOR SELECT
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can create documents in their organization"
    ON documents FOR INSERT
    WITH CHECK (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can update documents from their organization"
    ON documents FOR UPDATE
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "Users can delete documents from their organization"
    ON documents FOR DELETE
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- ====== FUNCTIONS FOR UPDATED_AT ======
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====== TRIGGERS FOR UPDATED_AT ======
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();