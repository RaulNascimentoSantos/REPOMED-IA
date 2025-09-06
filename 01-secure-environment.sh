#!/bin/bash
# 01-secure-environment.sh

set -euo pipefail
IFS=$'\n\t'

echo "╔════════════════════════════════════════════════════════╗"
echo "║          REPOMED IA v4.0 - SETUP SEGURO               ║"
echo "╚════════════════════════════════════════════════════════╝"

# 1.1 - Criar estrutura de diretórios
mkdir -p {config,scripts,logs,monitoring/{prometheus,grafana/{dashboards,datasources}},tests/e2e,backups}

# 1.2 - Gerar .env.example (template sem valores)
cat > .env.example << 'EOF'
# === CORE CONFIGURATION ===
NODE_ENV=development
APP_NAME=RepoMed_IA
APP_VERSION=4.0.0

# === PORTS ===
FRONTEND_PORT=3010
BACKEND_PORT=8081
DATABASE_PORT=5432
REDIS_PORT=6379

# === DATABASE ===
DATABASE_HOST=localhost
DATABASE_USER=postgres
DATABASE_PASSWORD=
DATABASE_NAME=repomed_production
DATABASE_SSL=false
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=100

# === REDIS ===
REDIS_HOST=localhost
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600

# === SECURITY ===
JWT_SECRET=
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
ENCRYPTION_KEY=
CORS_ORIGIN=http://localhost:3010
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15m

# === API KEYS ===
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4-turbo-preview
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@repomed.com.br
SENTRY_DSN=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=

# === DIGITAL SIGNATURE ===
SIGNATURE_PROVIDER=vidaas
VIDAAS_URL=https://vidaas.cfm.org.br/api
VIDAAS_TOKEN=
BIRDID_API_KEY=
SAFEID_API_KEY=
REMOTEID_API_KEY=

# === MONITORING ===
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=
PROMETHEUS_RETENTION=30d
ELASTICSEARCH_PASSWORD=
KIBANA_PASSWORD=
JAEGER_ENABLED=false

# === STORAGE ===
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=
MINIO_BUCKET=repomed-files
STORAGE_TYPE=local
STORAGE_PATH=./uploads

# === FEATURE FLAGS ===
FEATURE_PRESCRIPTIONS=true
FEATURE_DIGITAL_SIGNATURE=true
FEATURE_WHATSAPP=false
FEATURE_AI_ASSISTANT=false
FEATURE_BILLING=false
FEATURE_TELEMEDICINE=false
FEATURE_DARK_MODE=true
FEATURE_OFFLINE_MODE=true
FEATURE_VOICE_RECOGNITION=false

# === EMAIL ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EOF

# 1.3 - Gerar .env com valores seguros se não existir
if [ ! -f .env ]; then
    echo "🔐 Gerando .env com credenciais seguras..."
    cp .env.example .env
    
    # Gerar senhas criptograficamente seguras
    generate_password() {
        openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
    }
    
    generate_secret() {
        openssl rand -base64 64 | tr -d "\n"
    }
    
    # Aplicar senhas geradas
    DB_PASS=$(generate_password)
    REDIS_PASS=$(generate_password)
    JWT_SECRET=$(generate_secret)
    ENCRYPTION_KEY=$(generate_secret)
    GRAFANA_PASS=$(generate_password)
    MINIO_PASS=$(generate_password)
    
    # Substituir no arquivo .env
    sed -i "s/DATABASE_PASSWORD=/DATABASE_PASSWORD=${DB_PASS}/g" .env
    sed -i "s/REDIS_PASSWORD=/REDIS_PASSWORD=${REDIS_PASS}/g" .env  
    sed -i "s/JWT_SECRET=/JWT_SECRET=${JWT_SECRET}/g" .env
    sed -i "s/ENCRYPTION_KEY=/ENCRYPTION_KEY=${ENCRYPTION_KEY}/g" .env
    sed -i "s/GRAFANA_ADMIN_PASSWORD=/GRAFANA_ADMIN_PASSWORD=${GRAFANA_PASS}/g" .env
    sed -i "s/MINIO_ROOT_PASSWORD=/MINIO_ROOT_PASSWORD=${MINIO_PASS}/g" .env
    
    echo "✅ .env criado com sucesso"
    echo "📋 Senhas geradas (ANOTE EM LOCAL SEGURO):"
    echo "   Database: ${DB_PASS}"
    echo "   Redis: ${REDIS_PASS}"
    echo "   Grafana: admin / ${GRAFANA_PASS}"
else
    echo "⚠️  .env já existe - mantendo configuração atual"
fi

# 1.4 - Atualizar .gitignore
cat >> .gitignore << 'EOF'
# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# Uploads
uploads/

# Backups
backups/
*.backup
*.dump

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/settings.json
*.swp
*.swo

# Dependencies
node_modules/
.pnpm-store/

# Build
dist/
build/
.next/
out/

# Test
coverage/
.nyc_output/
test-results/

# Misc
*.pem
*.key
*.crt
EOF

echo "✅ Ambiente seguro configurado"