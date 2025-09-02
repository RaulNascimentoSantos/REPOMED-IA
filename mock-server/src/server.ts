import Fastify from 'fastify'
import cors from '@fastify/cors'
import { faker } from '@faker-js/faker/locale/pt_BR'
import QRCode from 'qrcode'
import PDFDocument from 'pdfkit'
import crypto from 'crypto'

const server = Fastify({ logger: true })

// ====== CONFIGURAÇÃO ======
server.register(cors, { origin: true })

// ====== DATABASES MOCK ======
const mockDB = {
  users: new Map(),
  templates: new Map(),
  documents: new Map(),
  patients: new Map(),
  prescriptions: new Map(),
  signatures: new Map(),
  auditLogs: new Map(),
  workspaces: new Map(),
  analytics: new Map(),
  whatsappMessages: new Map()
}

// ====== SEED DATA - TEMPLATES MÉDICOS ======
const medicalTemplates = [
  {
    id: 'tpl_001',
    name: 'Receita Simples',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'medications', label: 'Medicamentos', type: 'array', required: true },
      { id: 'instructions', label: 'Instruções', type: 'textarea', required: true },
      { id: 'valid_days', label: 'Validade (dias)', type: 'number', default: 30 }
    ],
    content: `
      RECEITUÁRIO MÉDICO
      
      Paciente: {{patient_name}}
      Data: {{date}}
      
      Prescrição:
      {{#medications}}
      - {{name}} - {{dosage}} - {{frequency}}
        {{instructions}}
      {{/medications}}
      
      Instruções Gerais:
      {{instructions}}
      
      Validade: {{valid_days}} dias
      
      _______________________
      {{doctor_name}}
      CRM: {{doctor_crm}}
    `,
    compliance: {
      cfm: true,
      anvisa: true,
      requires_signature: true
    }
  },
  {
    id: 'tpl_002',
    name: 'Atestado Médico',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'days_off', label: 'Dias de Afastamento', type: 'number', required: true },
      { id: 'cid10', label: 'CID-10', type: 'text', required: false },
      { id: 'reason', label: 'Motivo', type: 'textarea', required: true },
      { id: 'start_date', label: 'Data Início', type: 'date', required: true }
    ]
  },
  {
    id: 'tpl_003',
    name: 'Solicitação de Exames',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'exams', label: 'Exames', type: 'array', required: true },
      { id: 'clinical_info', label: 'Informações Clínicas', type: 'textarea' },
      { id: 'hypothesis', label: 'Hipótese Diagnóstica', type: 'text' }
    ]
  },
  {
    id: 'tpl_004',
    name: 'Encaminhamento',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'specialty_to', label: 'Especialidade', type: 'select', required: true },
      { id: 'reason', label: 'Motivo do Encaminhamento', type: 'textarea', required: true },
      { id: 'urgency', label: 'Urgência', type: 'select', options: ['Rotina', 'Prioritário', 'Urgente'] }
    ]
  },
  {
    id: 'tpl_005',
    name: 'Relatório Médico',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'report_type', label: 'Tipo de Relatório', type: 'select', required: true },
      { id: 'content', label: 'Conteúdo', type: 'richtext', required: true },
      { id: 'recommendations', label: 'Recomendações', type: 'textarea' }
    ]
  }
]

// Seed templates on startup
medicalTemplates.forEach(t => mockDB.templates.set(t.id, t))

// ====== SEED DATA - MÉDICOS ======
const mockDoctors = Array.from({ length: 10 }, (_, i) => ({
  id: `doc_${i + 1}`,
  name: faker.person.fullName(),
  crm: faker.number.int({ min: 10000, max: 99999 }) + '-SP',
  email: faker.internet.email(),
  specialty: faker.helpers.arrayElement(['Clínica Geral', 'Pediatria', 'Cardiologia', 'Ortopedia']),
  phone: faker.phone.number(),
  digitalCertificate: {
    status: 'active',
    type: 'A1',
    validUntil: '2026-12-31',
    issuer: 'AC Soluti'
  }
}))

// ====== SEED DATA - PACIENTES ======
const mockPatients = Array.from({ length: 50 }, (_, i) => ({
  id: `pat_${i + 1}`,
  name: faker.person.fullName(),
  cpf: faker.string.numeric('###.###.###-##'),
  birthDate: faker.date.birthdate({ min: 1, max: 90, mode: 'age' }),
  phone: faker.phone.number(),
  email: faker.internet.email(),
  allergies: faker.helpers.arrayElements(['Dipirona', 'Penicilina', 'Iodo', 'Látex', 'Nenhuma'], 2),
  chronicConditions: faker.helpers.arrayElements(['Hipertensão', 'Diabetes', 'Asma', 'Nenhuma'], 1),
  medications: faker.helpers.arrayElements([
    'Losartana 50mg',
    'Metformina 850mg',
    'AAS 100mg',
    'Omeprazol 20mg',
    'Nenhum'
  ], 2)
}))

mockPatients.forEach(p => mockDB.patients.set(p.id, p))

// ====== HELPER FUNCTIONS ======

function generateHash(data: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data)
}

function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.length === 11
}

function validateCRM(crm: string): boolean {
  return /^\d{4,6}-[A-Z]{2}$/.test(crm)
}

// ====== MOCK ICP-BRASIL SIGNATURE ======
class MockICPBrasilSigner {
  static async sign(documentHash: string, certificate: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
    
    return {
      signature: crypto.randomBytes(256).toString('base64'),
      timestamp: new Date().toISOString(),
      certificate: {
        subject: certificate.subject || 'CN=Dr. João Silva, OU=Médico, O=ICP-Brasil',
        issuer: 'CN=AC Soluti, O=ICP-Brasil',
        serialNumber: crypto.randomBytes(8).toString('hex'),
        validFrom: '2024-01-01',
        validTo: '2026-12-31'
      },
      signatureAlgorithm: 'RSA-SHA256',
      verified: true,
      ocspResponse: 'valid'
    }
  }

  static async verify(signature: string, documentHash: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return true // Always valid in mock
  }
}

// ====== API ROUTES ======

// Health check
server.get('/health', async () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  services: {
    database: 'connected',
    redis: 'connected',
    s3: 'connected',
    whatsapp: 'connected',
    ai: 'ready'
  }
}))

// Metrics
server.get('/metrics', async () => ({
  documents_total: mockDB.documents.size,
  users_total: mockDB.users.size,
  templates_total: mockDB.templates.size,
  signatures_total: mockDB.signatures.size,
  api_latency_p95: Math.random() * 100 + 50,
  api_requests_per_second: Math.random() * 100 + 10,
  error_rate: Math.random() * 0.01
}))

// ====== TEMPLATES ======
server.get('/api/templates', async (request) => {
  const templates = Array.from(mockDB.templates.values())
  return {
    data: templates,
    total: templates.length
  }
})

server.get('/api/templates/:id', async (request) => {
  const { id } = request.params as any
  return mockDB.templates.get(id) || { error: 'Template not found' }
})

// ====== DOCUMENTS ======
server.post('/api/documents', async (request) => {
  const { templateId, fields, patient } = request.body as any
  
  const template = mockDB.templates.get(templateId)
  if (!template) {
    return { error: 'Template not found' }
  }
  
  const docId = `doc_${Date.now()}`
  const hash = generateHash({ templateId, fields, patient })
  const qrCode = await generateQRCode(`https://repomed.health/verify/${docId}`)
  
  const document = {
    id: docId,
    templateId,
    templateName: template.name,
    fields,
    patient,
    hash,
    qrCode,
    status: 'draft',
    createdAt: new Date().toISOString(),
    pdfUrl: `/api/documents/${docId}/pdf`,
    shareUrl: null,
    signatureId: null
  }
  
  mockDB.documents.set(docId, document)
  
  // Add audit log
  mockDB.auditLogs.set(`audit_${Date.now()}`, {
    documentId: docId,
    action: 'document_created',
    actor: 'user_123',
    timestamp: new Date().toISOString(),
    metadata: { templateId, patientId: patient?.id }
  })
  
  return document
})

server.get('/api/documents/:id', async (request) => {
  const { id } = request.params as any
  return mockDB.documents.get(id) || { error: 'Document not found' }
})

// ====== SIGNATURE ======
server.post('/api/documents/:id/sign', async (request) => {
  const { id } = request.params as any
  const { provider = 'mock' } = request.body as any
  
  const document = mockDB.documents.get(id)
  if (!document) {
    return { error: 'Document not found' }
  }
  
  const signature = await MockICPBrasilSigner.sign(
    document.hash,
    { subject: 'Dr. João Silva' }
  )
  
  const signatureId = `sig_${Date.now()}`
  mockDB.signatures.set(signatureId, {
    id: signatureId,
    documentId: id,
    ...signature
  })
  
  document.status = 'signed'
  document.signatureId = signatureId
  document.signedAt = new Date().toISOString()
  
  return {
    document,
    signature
  }
})

// Start server
const start = async () => {
  try {
    await server.listen({ port: 3003, host: '0.0.0.0' })
    console.log('🚀 Mock Server running on http://localhost:3003')
    console.log('📊 Metrics: http://localhost:3003/metrics')
    console.log('✅ All mock services ready!')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()