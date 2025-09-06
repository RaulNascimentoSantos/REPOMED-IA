================================================================================
          RAIO-X INFRAESTRUTURA - REPOMED IA
================================================================================
Data: 2025-09-04 23:49:18
Análise Profunda v1.0
================================================================================

## 1. ESTRUTURA DE DIRETÓRIOS

### Árvore de Diretórios Principal
```
```
./.claude/settings.local.json
./.env
./.env.example
./.gitignore
./.vscode/extensions.json
./.vscode/keybindings.json
./.vscode/repomed.code-snippets
./.vscode/settings.json
./01-secure-environment.sh
./apps/web/repomed-web/public/offline.html
./apps/web/repomed-web/public/sw.js
./apps/web/repomed-web/public/test.js
./ARQUITETURA_PROJETO/00_executive_summary.md
./ARQUITETURA_PROJETO/01_analise_completa.md
./ARQUITETURA_PROJETO/02_inventario_arquivos.md
./ARQUITETURA_PROJETO/03_mapa_funcionalidades.md
./ARQUITETURA_PROJETO/15_roadmap_technical.md
./ARQUITETURA_PROJETO/README.md
./config/master.config.d.ts
./config/master.config.d.ts.map
./config/master.config.js
./config/master.config.js.map
./config/master.config.ts
./debug-login-error.js
./debug-login-response.js
./debug-white-screen.js
./definitivo.txt
./diagnostico.md
./docker-compose.yml
./DOCUMENTACAO OFICIAL/01-INFRAESTRUTURA.md
./ecosystem.config.js
./GUIA_TESTE_MANUAL.md
./IMPLEMENTACAO_COMPLETA.md
./init-db.sql
./integration-report.html
./integration-results.json
./integration-validation-complete.js
./INVENTORY_COMPLETE.md
./login_response.json
./login_result.json
./MASTER-FIX-REPOMED.sh
./MELHORIASCAMILLE.TXT
./migrations/critical_001_rls_tenant_isolation.sql
./migrations/critical_002_rls_fix.sql
./mock-server/package.json
./mock-server/src/server.ts
./monitoring/alert_rules.yml
./monitoring/grafana/provisioning/dashboards/dashboard.yml
./monitoring/grafana/provisioning/dashboards/repomed-dashboard.json
./monitoring/grafana/provisioning/datasources/prometheus.yml
./monitoring/prometheus.yml
./monitoring/README.md
./novo_paciente.json
./nul
./openapi.generated.json
./paciente_ana.json
./paciente_joao_pedro.json
./package-lock.json
./package.json
./packages/backend/vitest.config.ts
./packages/contracts/package.json
./packages/contracts/src/index.ts
./packages/contracts/src/schemas/auth.ts
./packages/contracts/src/schemas/documents.ts
./packages/contracts/src/schemas/patients.ts
./packages/contracts/src/schemas/signatures.ts
./packages/contracts/src/schemas/templates.ts
./packages/contracts/src/types/common.ts
./packages/contracts/src/types/errors.ts
./packages/contracts/tsconfig.json
./packages/design-system/tokens.ts
./packages/frontend/vitest.config.ts
./packages/frontend/vitest.setup.ts
./playwright.config.ts
./RAIO-X-PROJETO-RAUL
./README.md
./RELATORIO_IMPLEMENTACAO.md
./repomed-api/.env
./repomed-api/backend-errors.log
./repomed-api/migrations/001_initial_setup.sql
./repomed-api/migrations/002_performance_optimization.sql
./repomed-api/migrations/003_create_users_table.sql
./repomed-api/migrations/004_add_multitenancy.sql
./repomed-api/migrations/005_complete_user_system.sql
./repomed-api/migrations/005_enhance_user_auth.sql
./repomed-api/migrations/007_complete_medical_system.sql
./repomed-api/package-lock.json
./repomed-api/package.json
./repomed-api/pnpm-lock.yaml
./repomed-api/src/clinical/clinical-validator.service.js
./repomed-api/src/config/index.ts
./repomed-api/src/core/logger.js
./repomed-api/src/db/config.ts
./repomed-api/src/db/index.ts
./repomed-api/src/db/runMigration.ts
./repomed-api/src/db/schema.ts
./repomed-api/src/metrics/prometheus.ts
./repomed-api/src/middleware/error-handler.ts
./repomed-api/src/middleware/errorHandler.ts
./repomed-api/src/middleware/metrics.ts
./repomed-api/src/middleware/metricsMiddleware.ts
./repomed-api/src/middleware/requestLogger.ts
./repomed-api/src/middleware/tenant-isolation.ts
./repomed-api/src/middleware/tenant.middleware.js
./repomed-api/src/middleware/zod-validator.ts
./repomed-api/src/plugins/raw-body.plugin.js
./repomed-api/src/plugins/security.plugin.js
./repomed-api/src/routes/cid10.js
./repomed-api/src/routes/medications.js
./repomed-api/src/routes/metrics.js
./repomed-api/src/routes/metrics.ts
./repomed-api/src/routes/patients.js
./repomed-api/src/routes/performance.ts
./repomed-api/src/routes/prescriptions.js
./repomed-api/src/routes/signatures.js
./repomed-api/src/routes/templates.ts
./repomed-api/src/routes/upload.js
./repomed-api/src/server.js
./repomed-api/src/server.ts
./repomed-api/src/services/AIService.js
./repomed-api/src/services/cache.service.ts
./repomed-api/src/services/CrmValidation.ts
./repomed-api/src/services/EncryptionService.ts
./repomed-api/src/services/FHIRService.js
./repomed-api/src/services/MetricsCollector.ts
./repomed-api/src/services/pdf.service.ts
./repomed-api/src/services/performance.service.ts
./repomed-api/src/services/SignatureService.js
./repomed-api/src/signature/signature.service.js
./repomed-api/src/templates/medical-templates.ts
./repomed-api/src/types/index.d.ts
./repomed-api/src/webhooks/webhook-security.js
./repomed-api/src/webhooks/webhook.controller.js
./repomed-api/test-results/assets/index-9agQl9q3.js
./repomed-api/test-results/assets/index-fUmMsp0O.css
./repomed-api/test-results/bg.png
./repomed-api/test-results/favicon.svg
./repomed-api/test-results/html.meta.json.gz
./repomed-api/test-results/index.html
./repomed-api/test-results/results.json
./repomed-api/tests/integration/documents-multitenancy.test.js
./repomed-api/tests/integration/documents-multitenancy.test.ts
./repomed-api/tests/integration/documents.test.js
./repomed-api/tests/integration/documents.test.ts
./repomed-api/tests/integration/users.test.js
./repomed-api/tests/integration/users.test.ts
./repomed-api/tests/setup.js
./repomed-api/tests/setup.ts
./repomed-api/tests/unit/cache.test.js
./repomed-api/tests/unit/cache.test.ts
./repomed-api/tests/unit/hash.test.js
./repomed-api/tests/unit/hash.test.ts
./repomed-api/tests/unit/validation.test.js
./repomed-api/tests/unit/validation.test.ts
./repomed-api/tsconfig.json
./repomed-api/vitest.config.js
./repomed-api/vitest.config.ts
./repomed-backend/package-lock.json
./repomed-backend/package.json
./repomed-backend/src/server.js
./repomed-ia/.env.example
./repomed-ia/docker-compose.yml
./repomed-ia/drizzle.config.ts
./repomed-ia/next-env.d.ts
./repomed-ia/next.config.js
./repomed-ia/package-lock.json
./repomed-ia/package.json
./repomed-ia/public/icons-needed.txt
./repomed-ia/public/manifest.json
./repomed-ia/public/sw.js
./repomed-ia/src/app/api/trpc/[trpc]/route.ts
./repomed-ia/src/app/documents/create/page.tsx
./repomed-ia/src/app/documents/page.tsx
./repomed-ia/src/app/documents/[id]/page.tsx
./repomed-ia/src/app/globals.css
./repomed-ia/src/app/layout.tsx
./repomed-ia/src/app/metrics/page.tsx
./repomed-ia/src/app/page.tsx
./repomed-ia/src/app/patients/create/page.tsx
./repomed-ia/src/app/patients/page.tsx
./repomed-ia/src/app/patients/[id]/page.tsx
./repomed-ia/src/app/settings/page.tsx
./repomed-ia/src/app/share/[token]/page.tsx
./repomed-ia/src/app/templates/create/page.tsx
./repomed-ia/src/app/templates/page.tsx
./repomed-ia/src/app/templates/[id]/page.tsx
./repomed-ia/src/app/test-routes/page.tsx
./repomed-ia/src/app/verify/[hash]/page.tsx
./repomed-ia/src/app/workspace/page.tsx
./repomed-ia/src/components/medical/MedicalWorkspace.tsx
./repomed-ia/src/components/pwa/OfflineIndicator.tsx
./repomed-ia/src/components/pwa/PWAInstaller.tsx
./repomed-ia/src/components/ui/alert.tsx
./repomed-ia/src/components/ui/badge.tsx
./repomed-ia/src/components/ui/button.tsx
./repomed-ia/src/components/ui/card.tsx
./repomed-ia/src/components/ui/input.tsx
./repomed-ia/src/components/ui/label.tsx
./repomed-ia/src/components/ui/select.tsx
./repomed-ia/src/components/ui/textarea.tsx


## 2. ESTATÍSTICAS DO PROJETO

### 2.1 Contagem de Arquivos por Tipo

- Arquivos TypeScript (.ts/.tsx): 228
- Arquivos JavaScript (.js/.jsx): 187
- Arquivos CSS: 11
- Arquivos SQL: 14
- Arquivos JSON: 41
- Arquivos Markdown: 17


## 3. STATUS DOS SERVIÇOS

### 3.1 Docker Containers

```
NAMES                       STATUS                    PORTS
repomed-postgres            Up 5 hours (healthy)      0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp
repomed-redis               Up 5 hours (healthy)      0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp
repomed-grafana             Up 19 hours               0.0.0.0:3001->3000/tcp, [::]:3001->3000/tcp
repomed-redis-exporter      Up 19 hours               0.0.0.0:9121->9121/tcp, [::]:9121->9121/tcp
repomed-postgres-exporter   Up 19 hours               0.0.0.0:9187->9187/tcp, [::]:9187->9187/tcp
repomed-prometheus          Up 19 hours               0.0.0.0:9090->9090/tcp, [::]:9090->9090/tcp
repomed-node-exporter       Up 19 hours               0.0.0.0:9100->9100/tcp, [::]:9100->9100/tcp
repomed-jaeger              Up 19 hours               0.0.0.0:14250->14250/tcp, [::]:14250->14250/tcp, 0.0.0.0:14268->14268/tcp, [::]:14268->14268/tcp, 0.0.0.0:6831->6831/udp, [::]:6831->6831/udp, 0.0.0.0:16686->16686/tcp, [::]:16686->16686/tcp
repomed-cadvisor            Up 19 hours (healthy)     0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp
repomed-minio               Up 19 hours (healthy)     0.0.0.0:9000-9001->9000-9001/tcp, [::]:9000-9001->9000-9001/tcp
dir_api                     Exited (255) 2 days ago   0.0.0.0:3000->3000/tcp
dir_redis                   Exited (255) 2 days ago   0.0.0.0:6379->6379/tcp
dir_db                      Exited (255) 2 days ago   0.0.0.0:5432->5432/tcp
dir_adminer                 Exited (255) 2 days ago   0.0.0.0:8080->8080/tcp
```


### 3.2 Portas em Uso

```
  TCP    0.0.0.0:5432           0.0.0.0:0              LISTENING
  TCP    0.0.0.0:6379           0.0.0.0:0              LISTENING
  TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING
  TCP    0.0.0.0:9000           0.0.0.0:0              LISTENING
  TCP    0.0.0.0:9090           0.0.0.0:0              LISTENING
  TCP    [::]:5432              [::]:0                 LISTENING
  TCP    [::]:6379              [::]:0                 LISTENING
  TCP    [::]:8080              [::]:0                 LISTENING
  TCP    [::]:9000              [::]:0                 LISTENING
  TCP    [::]:9090              [::]:0                 LISTENING
  TCP    [::1]:5432             [::]:0                 LISTENING
  TCP    [::1]:6379             [::]:0                 LISTENING
  TCP    [::1]:8080             [::]:0                 LISTENING
  TCP    [::1]:9000             [::]:0                 LISTENING
  TCP    [::1]:9090             [::]:0                 LISTENING
```
