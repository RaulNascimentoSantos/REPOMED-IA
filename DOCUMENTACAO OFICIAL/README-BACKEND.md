# 🏥 RepoMed IA - Backend API

API completa para sistema de documentos médicos com inteligência artificial, assinatura digital e interoperabilidade FHIR.

## 📋 Visão Geral

Backend robusto desenvolvido em Node.js + Fastify que oferece serviços especializados para documentação médica, incluindo integração com OpenAI, assinatura digital ICP-Brasil e interoperabilidade com RNDS via FHIR R4.

## 🏗️ Arquitetura

### Core Services
```
src/
├── services/
│   ├── AIService.js           # Integração OpenAI GPT-4
│   ├── SignatureService.js    # Assinatura Digital ICP-Brasil
│   └── FHIRService.js         # Interoperabilidade RNDS
├── migrations/                # PostgreSQL Database Schema
└── server.js                  # Fastify Server Principal
```

## 🤖 AIService - Inteligência Artificial

### Funcionalidades
- **Diagnóstico Médico** baseado em sintomas e histórico
- **Análise de Interações Medicamentosas** 
- **Transcrição de Áudio** para texto médico
- **OCR Médico** para digitalização de documentos
- **Análise de Risco** de pacientes

### Implementações
```javascript
class AIService {
  async suggestDiagnosis(symptoms, patientHistory)    // GPT-4 diagnosis
  async checkDrugInteractions(medications)            // Drug safety
  async transcribeAudio(audioBuffer)                  // Speech-to-text
  async performMedicalOCR(imageBuffer)                // Document OCR
  async assessPatientRisk(patientData)                // Risk analysis
  async generateMedicalReport(data)                   // Auto reports
}
```

### OpenAI Integration
- **Model**: GPT-4o-mini para eficiência
- **Temperature**: 0.1 para precisão médica
- **JSON Mode**: Respostas estruturadas
- **Token Management**: Otimizado para custo
- **Context Window**: Máximo aproveitamento

## 🔐 SignatureService - Assinatura Digital

### ICP-Brasil Compliance
- **Certificados A1/A3** suportados
- **Validação em Tempo Real** de certificados
- **Timestamp Qualificado** para documentos
- **Cadeia de Confiança** ICP-Brasil
- **Revogação Online** (OCSP/CRL)

### Funcionalidades
```javascript
class SignatureService {
  async validateCertificate(certificate)             // Certificate validation
  async signDocument(document, certificate)          // Digital signing  
  async verifySignature(signedDocument)              // Signature verification
  async addTimestamp(document)                       // Qualified timestamp
  async generateQRCode(documentHash)                 // Verification QR
}
```

### Recursos Avançados
- **PDF Signing** com PAdES-B padrão
- **XAdES** para documentos XML
- **Multi-signature** support
- **Long-term Validation** (LTV)
- **Audit Trail** completo

## 🏥 FHIRService - Interoperabilidade

### RNDS Integration
- **FHIR R4** standard compliance
- **Patient Demographics** sincronização
- **Clinical Documents** exchange
- **Terminology Services** (SNOMED, LOINC)
- **Consent Management** LGPD

### Recursos Implementados
```javascript
class FHIRService {
  async submitToRNDS(clinicalDocument)               // RNDS submission
  async queryPatientData(cpf)                       // Patient lookup
  async createFHIRBundle(documents)                 // Bundle creation
  async validateFHIRResource(resource)              // Resource validation
  async syncTerminologies()                         // Terminology sync
}
```

### FHIR Resources
- **Patient**: Demografia e identificação
- **Practitioner**: Dados do profissional
- **Organization**: Estabelecimento de saúde
- **DocumentReference**: Referências de documentos
- **Composition**: Estrutura de documentos clínicos
- **Observation**: Resultados de exames

## 🗄️ Database Architecture

### PostgreSQL com RLS
- **Row Level Security** para multi-tenancy
- **Tenant Isolation** automático
- **JSONB** para dados clínicos flexíveis
- **Full-text Search** em português
- **Audit Tables** para rastreabilidade

### Schema Principal
```sql
-- Tenants (Multi-tenant)
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users (Médicos/Staff)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  crm VARCHAR(20),
  specialty VARCHAR(100),
  role user_role DEFAULT 'doctor'
);

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  cpf VARCHAR(14) UNIQUE,
  name VARCHAR(255) NOT NULL,
  birth_date DATE,
  allergies JSONB,
  medical_conditions JSONB
);

-- Medical Documents
CREATE TABLE medical_documents (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES users(id),
  type document_type NOT NULL,
  title VARCHAR(500),
  content TEXT,
  status document_status DEFAULT 'draft',
  metadata JSONB
);

-- Digital Signatures
CREATE TABLE document_signatures (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES medical_documents(id),
  signer_id UUID REFERENCES users(id),
  certificate_info JSONB,
  signature_data BYTEA,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies
```sql
-- Tenant-based isolation
CREATE POLICY tenant_isolation ON medical_documents
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Doctor access control  
CREATE POLICY doctor_access ON medical_documents
  USING (doctor_id = current_setting('app.current_user')::UUID);
```

## 🌐 API Endpoints

### Health & Status
```
GET  /health              # System health check
GET  /status              # Detailed system status
GET  /metrics             # Prometheus metrics
```

### Authentication
```
POST /auth/login          # User authentication
POST /auth/refresh        # Token refresh
POST /auth/logout         # User logout
```

### Medical Documents
```
GET    /api/documents          # List documents
POST   /api/documents          # Create document
GET    /api/documents/:id      # Get document
PUT    /api/documents/:id      # Update document
DELETE /api/documents/:id      # Delete document
```

### AI Services
```
POST /api/ai/diagnose          # AI diagnosis
POST /api/ai/drug-check        # Drug interactions
POST /api/ai/transcribe        # Audio transcription
POST /api/ai/ocr               # Document OCR
POST /api/ai/risk-assess       # Risk assessment
```

### Digital Signature
```
POST /api/sign/document        # Sign document
POST /api/sign/verify          # Verify signature
GET  /api/sign/certificate     # Validate certificate
POST /api/sign/timestamp       # Add timestamp
```

### FHIR Integration
```
POST /api/fhir/submit          # Submit to RNDS
GET  /api/fhir/patient/:cpf    # Query patient
POST /api/fhir/bundle          # Create FHIR bundle
GET  /api/fhir/validate        # Validate resource
```

## 🔧 Tecnologias

### Core Stack
- **Node.js** 18+ LTS
- **Fastify** 4.x (high performance)
- **PostgreSQL** 14+ com JSONB
- **TypeScript** para type safety

### Bibliotecas Principais
- **OpenAI**: GPT-4 integration
- **node-forge**: Cryptographic operations
- **pg**: PostgreSQL client
- **joi/zod**: Schema validation
- **pino**: Structured logging
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT auth

### Ferramentas
- **Drizzle ORM**: Type-safe queries
- **Swagger/OpenAPI**: API documentation
- **Helmet**: Security headers
- **CORS**: Cross-origin handling
- **Multipart**: File uploads

## 🚀 Execução

### Desenvolvimento
```bash
cd repomed-api
npm install
npm run dev
# API: http://localhost:8081
```

### Produção
```bash
npm run build
npm start
```

### Configuração
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/repomed

# OpenAI
OPENAI_API_KEY=sk-...

# ICP-Brasil
ICP_CERTIFICATE_PATH=/path/to/cert.p12
ICP_CERTIFICATE_PASSWORD=password

# FHIR/RNDS
RNDS_ENDPOINT=https://rnds.saude.gov.br
RNDS_CLIENT_ID=your_client_id
RNDS_CLIENT_SECRET=your_secret

# Security
JWT_SECRET=your-super-secret-key
ENCRYPTION_KEY=32-byte-key-for-aes
```

## 📊 Performance

### Benchmarks
- **Latency**: < 100ms para operações básicas
- **Throughput**: 1000+ requests/sec
- **Concurrency**: 500+ conexões simultâneas
- **Memory**: < 512MB RAM usage
- **CPU**: Otimizado para multi-core

### Caching
- **Redis** para sessões e cache
- **Query caching** para PostgreSQL
- **CDN** para assets estáticos
- **API rate limiting** configurável

## 🛡️ Segurança

### Implementações
- **HTTPS** obrigatório em produção
- **JWT** com refresh tokens
- **Rate limiting** por IP/usuário  
- **Input validation** com Joi/Zod
- **SQL injection** prevention
- **CORS** configurado
- **Helmet** security headers

### Compliance
- **LGPD** compliance total
- **CFM** regulamentações médicas
- **ICP-Brasil** certificação digital
- **ANVISA** interoperabilidade
- **ISO 27001** security standards

## 📝 Logging & Monitoring

### Structured Logging
```javascript
// Pino structured logs
log.info({
  userId: req.user.id,
  tenantId: req.tenant.id,
  action: 'document_created',
  documentId: doc.id,
  metadata: { type: 'prescription', patient: 'xxx' }
}, 'Document created successfully')
```

### Metrics
- **Response times** por endpoint
- **Error rates** e tipos
- **Database performance** queries
- **AI service usage** e custos
- **Certificate validation** rates

## 🧪 Testes

### Test Coverage
- **Unit tests**: Services individuais
- **Integration tests**: API endpoints
- **E2E tests**: Fluxos completos
- **Load tests**: Performance under stress
- **Security tests**: Vulnerability scanning

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests
npm run test:load     # Load testing
```

---

**Backend completo e seguro para documentação médica profissional** 🚀