-- RepoMed IA - Database Initialization
-- Version: 4.0.0

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create schema
CREATE SCHEMA IF NOT EXISTS repomed;
SET search_path TO repomed, public;

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'secretary', 'patient');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('draft', 'signed', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Health check table
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    service VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details JSONB,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO system_config (key, value, description) VALUES
    ('db_version', '4.0.0', 'Database schema version'),
    ('maintenance_mode', 'false', 'System maintenance mode flag'),
    ('max_file_size', '10485760', 'Maximum file upload size in bytes')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_check_checked_at ON health_check(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);

-- Initial health check
INSERT INTO health_check (service, status) VALUES ('database', 'initialized');

-- Grant permissions
GRANT USAGE ON SCHEMA repomed TO PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA repomed TO PUBLIC;

COMMENT ON SCHEMA repomed IS 'RepoMed IA Production Schema';