#!/bin/bash
# MASTER-FIX-REPOMED.sh - Script de estabilização completa

set -e
clear

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     REPOMED IA - ESTABILIZAÇÃO ENTERPRISE v3.0            ║"
echo "║     TEMPO ESTIMADO: 15-20 minutos                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Função de log colorido
log() {
  echo -e "\033[1;32m✓\033[0m $1"
}

error() {
  echo -e "\033[1;31m✗\033[0m $1"
  exit 1
}

# 1. VERIFICAR DEPENDÊNCIAS
log "[1/10] Verificando dependências..."
command -v node >/dev/null 2>&1 || error "Node.js não encontrado"
command -v npm >/dev/null 2>&1 || error "npm não encontrado" 
command -v docker >/dev/null 2>&1 || error "Docker não encontrado"
command -v docker-compose >/dev/null 2>&1 || error "docker-compose não encontrado"

# 2. CONFIGURAR VARIÁVEIS DE AMBIENTE
log "[2/10] Configurando variáveis de ambiente..."
cat > .env << 'EOF'
NODE_ENV=development
PORT=8081
FRONTEND_PORT=3010

# Database
DATABASE_URL=postgresql://postgres:repomed@2025@localhost:5432/repomed_production
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=repomed@2025
DB_NAME=repomed_production

# Redis
REDIS_URL=redis://:repomed@2025@localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=repomed@2025

# Security
JWT_SECRET=repomed-jwt-secret-change-in-production
ENCRYPTION_KEY=repomed-aes-256-key

# CORS
CORS_ORIGIN=http://localhost:3010

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
GRAFANA_URL=http://localhost:3000
EOF

# 3. INICIAR INFRAESTRUTURA
log "[3/10] Iniciando infraestrutura Docker..."
docker-compose down -v 2>/dev/null || true
docker-compose up -d postgres redis minio prometheus grafana
sleep 30

# Verificar se PostgreSQL está rodando
log "[4/10] Verificando PostgreSQL..."
until docker-compose exec postgres pg_isready -U postgres >/dev/null 2>&1; do
  echo "Aguardando PostgreSQL..."
  sleep 5
done

# 4. INSTALAR DEPENDÊNCIAS
log "[5/10] Instalando dependências..."
npm install

cd repomed-api
npm install
cd ..

cd repomed-web  
npm install
cd ..

# 5. EXECUTAR MIGRAÇÕES
log "[6/10] Executando migrações do banco..."
cd repomed-api
if [ -f "migrations/007_complete_medical_system.sql" ]; then
  PGPASSWORD=repomed@2025 psql -h localhost -U postgres -d repomed_production -f migrations/007_complete_medical_system.sql
fi
cd ..

# 6. BUILD DO BACKEND
log "[7/10] Compilando backend..."
cd repomed-api
npm run build || error "Falha no build do backend"
cd ..

# 7. BUILD DO FRONTEND
log "[8/10] Compilando frontend..."
cd repomed-web
npm run build || error "Falha no build do frontend"
cd ..

# 8. INICIAR APLICAÇÕES
log "[9/10] Iniciando aplicações..."

# Parar processos existentes
pkill -f "node.*8081" 2>/dev/null || true
pkill -f "vite.*3010" 2>/dev/null || true

# Iniciar backend
cd repomed-api
npm run dev &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 10

# Iniciar frontend  
cd repomed-web
PORT=3010 npm run dev &
FRONTEND_PID=$!
cd ..

# Aguardar frontend iniciar
sleep 10

# 9. TESTES DE VERIFICAÇÃO
log "[10/10] Executando verificações..."

# Verificar serviços
check_service() {
  local service=$1
  local port=$2
  local url="http://localhost:$port"
  
  if curl -s -f "$url" >/dev/null 2>&1; then
    log "$service rodando na porta $port ✓"
  else
    error "$service NÃO está rodando na porta $port!"
  fi
}

check_service "Frontend" 3010
check_service "Backend" 8081
check_service "PostgreSQL" 5432
check_service "Redis" 6379
check_service "Grafana" 3000

# Verificar API Health
if curl -s http://localhost:8081/health | grep -q "OK"; then
  log "API Health Check ✓"
else
  error "API Health Check falhou!"
fi

# RESULTADO FINAL
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    REPOMED IA v3.0 READY                  ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ 🏥 Frontend:    http://localhost:3010                     ║"
echo "║ 🔧 Backend:     http://localhost:8081                     ║"
echo "║ 📊 Grafana:     http://localhost:3000 (admin/repomed@2025)║"
echo "║ 📈 Prometheus:  http://localhost:9090                     ║"
echo "║ 📦 MinIO:       http://localhost:9001                     ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ 📧 Login Demo:  medico@demo.com / demo123                 ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Abrir no navegador (Windows)
if command -v start >/dev/null 2>&1; then
  start http://localhost:3010
fi

echo ""
log "🎉 REPOMED IA ENTERPRISE EDITION - PRONTO PARA PRODUÇÃO!"
log "📚 Documentação completa em: ./docs/README.md"
log "🚀 Para parar: Ctrl+C"

# Salvar PIDs para cleanup
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid
echo "SUCCESS" > .last-build-status
date > .last-build-date

# Aguardar sinal de parada
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM

wait