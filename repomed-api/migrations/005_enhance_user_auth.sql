-- Migration: Enhance User Authentication
-- Date: 2025-01-04
-- Description: Add CRM validation, UF, and authentication tracking fields

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS uf VARCHAR(2),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS crm_validated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Update CRM column length for consistency
ALTER TABLE users ALTER COLUMN crm TYPE VARCHAR(20);

-- Create index for faster CRM lookups
CREATE INDEX IF NOT EXISTS idx_users_crm_uf ON users(crm, uf) WHERE crm IS NOT NULL;

-- Create index for active users
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

-- Create index for email lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update existing users to be active by default
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- Add comment to table
COMMENT ON TABLE users IS 'Sistema de usuários com validação CRM/CFM';
COMMENT ON COLUMN users.crm IS 'Número do CRM do médico';
COMMENT ON COLUMN users.uf IS 'Estado de registro do CRM';
COMMENT ON COLUMN users.is_active IS 'Usuário ativo no sistema';
COMMENT ON COLUMN users.crm_validated_at IS 'Data da última validação CRM com CFM';
COMMENT ON COLUMN users.last_login_at IS 'Data do último login';