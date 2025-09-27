ALTER TABLE users ADD COLUMN organization_id UUID;
ALTER TABLE templates ADD COLUMN organization_id UUID;
ALTER TABLE documents ADD COLUMN organization_id UUID;
