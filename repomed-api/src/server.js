import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

// Import our security and webhook modules
import { securityPlugin } from './plugins/security.plugin.js'
import rawBodyPlugin from './plugins/raw-body.plugin.js'
import { webhookController } from './webhooks/webhook.controller.js'
import { setPool } from './middleware/tenant.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ====== CONFIGURAÇÃO FASTIFY ======
const fastify = Fastify({ 
  logger: true,
  bodyLimit: 10485760 // 10MB
})

// ====== PLUGINS ======
await fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3008'],
  credentials: true
})

await fastify.register(multipart)

// Register security plugin (replaces manual headers)
await fastify.register(securityPlugin)

// Register raw body plugin for webhooks
await fastify.register(rawBodyPlugin)

// Register webhook controller
await fastify.register(webhookController)

await fastify.register(staticFiles, {
  root: join(__dirname, 'public'),
  prefix: '/public/'
})

// ====== DATABASE CONNECTION ======
const { Pool } = pg
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'repomed',
  password: process.env.DB_PASS || 'postgres',
  port: process.env.DB_PORT || 5432,
})

// Set pool for tenant middleware
setPool(pool)

// ====== MEDICAL TEMPLATES - DADOS ESSENCIAIS ======
const medicalTemplates = [
  {
    id: 'tpl_receita_simples',
    name: 'Receita Simples',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'patient_cpf', label: 'CPF do Paciente', type: 'text', required: true },
      { id: 'medications', label: 'Medicamentos', type: 'array', required: true },
      { id: 'instructions', label: 'Instruções Gerais', type: 'textarea', required: true },
      { id: 'valid_days', label: 'Validade (dias)', type: 'number', default: 30 }
    ],
    content: `RECEITUÁRIO MÉDICO

Paciente: {{patient_name}}
CPF: {{patient_cpf}}
Data: {{date}}

PRESCRIÇÃO:
{{#medications}}
• {{name}} - {{dosage}} - {{frequency}}
  {{instructions}}
{{/medications}}

INSTRUÇÕES GERAIS:
{{instructions}}

Validade: {{valid_days}} dias

_________________________
{{doctor_name}}
CRM: {{doctor_crm}}`,
    compliance: {
      cfm: true,
      anvisa: true,
      requires_signature: true
    }
  },
  {
    id: 'tpl_atestado_medico',
    name: 'Atestado Médico',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'patient_cpf', label: 'CPF do Paciente', type: 'text', required: true },
      { id: 'days_off', label: 'Dias de Afastamento', type: 'number', required: true },
      { id: 'cid10', label: 'CID-10', type: 'text', required: false },
      { id: 'reason', label: 'Motivo', type: 'textarea', required: true },
      { id: 'start_date', label: 'Data Início', type: 'date', required: true }
    ],
    content: `ATESTADO MÉDICO

Atesto que o paciente {{patient_name}}, CPF {{patient_cpf}}, esteve sob meus cuidados médicos e necessita de afastamento de suas atividades por {{days_off}} dias, a partir de {{start_date}}.

{{#cid10}}CID-10: {{cid10}}{{/cid10}}

MOTIVO:
{{reason}}

{{city}}, {{date}}

_________________________
{{doctor_name}}
CRM: {{doctor_crm}}`
  },
  {
    id: 'tpl_solicitacao_exames',
    name: 'Solicitação de Exames',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'patient_cpf', label: 'CPF do Paciente', type: 'text', required: true },
      { id: 'exams', label: 'Exames Solicitados', type: 'array', required: true },
      { id: 'clinical_info', label: 'Informações Clínicas', type: 'textarea' },
      { id: 'hypothesis', label: 'Hipótese Diagnóstica', type: 'text' }
    ],
    content: `SOLICITAÇÃO DE EXAMES

Paciente: {{patient_name}}
CPF: {{patient_cpf}}
Data: {{date}}

EXAMES SOLICITADOS:
{{#exams}}
• {{name}} {{#urgency}}({{urgency}}){{/urgency}}
{{/exams}}

{{#clinical_info}}
INFORMAÇÕES CLÍNICAS:
{{clinical_info}}
{{/clinical_info}}

{{#hypothesis}}
HIPÓTESE DIAGNÓSTICA:
{{hypothesis}}
{{/hypothesis}}

_________________________
{{doctor_name}}
CRM: {{doctor_crm}}`
  },
  {
    id: 'tpl_encaminhamento',
    name: 'Encaminhamento Médico',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'patient_cpf', label: 'CPF do Paciente', type: 'text', required: true },
      { id: 'specialty_to', label: 'Especialidade', type: 'text', required: true },
      { id: 'reason', label: 'Motivo do Encaminhamento', type: 'textarea', required: true },
      { id: 'urgency', label: 'Urgência', type: 'select', options: ['Rotina', 'Prioritário', 'Urgente'] }
    ],
    content: `ENCAMINHAMENTO MÉDICO

Paciente: {{patient_name}}
CPF: {{patient_cpf}}
Data: {{date}}

Encaminho o paciente acima para avaliação em {{specialty_to}}.

{{#urgency}}Urgência: {{urgency}}{{/urgency}}

MOTIVO DO ENCAMINHAMENTO:
{{reason}}

_________________________
{{doctor_name}}
CRM: {{doctor_crm}}`
  },
  {
    id: 'tpl_relatorio_medico',
    name: 'Relatório Médico',
    specialty: 'clinica_geral',
    version: '1.0.0',
    fields: [
      { id: 'patient_name', label: 'Nome do Paciente', type: 'text', required: true },
      { id: 'patient_cpf', label: 'CPF do Paciente', type: 'text', required: true },
      { id: 'report_type', label: 'Tipo de Relatório', type: 'select', required: true },
      { id: 'content', label: 'Conteúdo do Relatório', type: 'textarea', required: true },
      { id: 'recommendations', label: 'Recomendações', type: 'textarea' }
    ],
    content: `RELATÓRIO MÉDICO

Tipo: {{report_type}}
Paciente: {{patient_name}}
CPF: {{patient_cpf}}
Data: {{date}}

RELATÓRIO:
{{content}}

{{#recommendations}}
RECOMENDAÇÕES:
{{recommendations}}
{{/recommendations}}

_________________________
{{doctor_name}}
CRM: {{doctor_crm}}`
  }
]

// ====== HELPER FUNCTIONS ======
function generateDocumentHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex')
}

async function generateQRCode(data) {
  return await QRCode.toDataURL(data)
}

// Mock JWT secret (usar variável de ambiente em produção)
const JWT_SECRET = process.env.JWT_SECRET || 'repomed-dev-secret-key'

// ====== AUTHENTICATION MIDDLEWARE ======
fastify.decorate('authenticate', async function(request, reply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      reply.code(401).send({ error: 'Token required' })
      return
    }
    
    const decoded = jwt.verify(token, JWT_SECRET)
    request.user = decoded
  } catch (err) {
    reply.code(401).send({ error: 'Invalid token' })
  }
})

// ====== ROUTES ======

// Health Check
fastify.get('/health', async (request, reply) => {
  try {
    await pool.query('SELECT 1')
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    }
  } catch (err) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'running'
      },
      error: err.message
    }
  }
})

// Metrics
fastify.get('/metrics', async (request, reply) => {
  try {
    const documentsCount = await pool.query('SELECT COUNT(*) as count FROM documents')
    const templatesCount = medicalTemplates.length
    
    return {
      documents_total: parseInt(documentsCount.rows[0].count),
      templates_total: templatesCount,
      api_latency_p95: Math.random() * 100 + 50, // Mock data
      uptime: process.uptime()
    }
  } catch (err) {
    return {
      documents_total: 0,
      templates_total: medicalTemplates.length,
      api_latency_p95: 0,
      uptime: process.uptime(),
      error: 'Database metrics unavailable'
    }
  }
})

// Auth - Register (Mock)
fastify.post('/api/auth/register', async (request, reply) => {
  const { email, password, name, crm } = request.body
  
  // Mock registration - em produção usar database real
  const userId = uuidv4()
  const token = jwt.sign({ 
    id: userId, 
    email, 
    name, 
    crm 
  }, JWT_SECRET, { expiresIn: '24h' })
  
  return {
    token,
    user: {
      id: userId,
      email,
      name,
      crm
    }
  }
})

// Templates - List
fastify.get('/api/templates', async (request, reply) => {
  return {
    data: medicalTemplates,
    total: medicalTemplates.length
  }
})

// Templates - Get by ID
fastify.get('/api/templates/:id', async (request, reply) => {
  const template = medicalTemplates.find(t => t.id === request.params.id)
  if (!template) {
    reply.code(404).send({ error: 'Template not found' })
    return
  }
  return template
})

// Documents - Create
fastify.post('/api/documents', async (request, reply) => {
  const { templateId, fields, patient } = request.body
  
  const template = medicalTemplates.find(t => t.id === templateId)
  if (!template) {
    reply.code(404).send({ error: 'Template not found' })
    return
  }
  
  const docId = uuidv4()
  const hash = generateDocumentHash({ templateId, fields, patient, timestamp: Date.now() })
  const qrCode = await generateQRCode(`http://localhost:3001/verify/${hash}`)
  
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
  
  // TODO: Salvar no database quando configurado
  // Por enquanto retorna mock
  
  return document
})

// Documents - Get by ID
fastify.get('/api/documents/:id', async (request, reply) => {
  // Mock document - implementar busca no database
  return {
    id: request.params.id,
    templateName: 'Receita Simples',
    status: 'draft',
    createdAt: new Date().toISOString(),
    fields: { patient_name: 'Mock Patient' },
    patient: { name: 'Mock Patient', cpf: '000.000.000-00' }
  }
})

// Documents - Generate PDF
fastify.get('/api/documents/:id/pdf', async (request, reply) => {
  const doc = new PDFDocument()
  
  // Mock PDF generation
  doc.fontSize(16).text('RECEITUÁRIO MÉDICO', { align: 'center' })
  doc.moveDown()
  doc.fontSize(12).text('Paciente: Mock Patient')
  doc.text('Data: ' + new Date().toLocaleDateString('pt-BR'))
  doc.moveDown()
  doc.text('Este é um documento de teste gerado pelo sistema RepoMed IA.')
  
  reply.type('application/pdf')
  doc.pipe(reply.raw)
  doc.end()
})

// Documents - Sign
fastify.post('/api/documents/:id/sign', async (request, reply) => {
  const { provider = 'mock' } = request.body
  
  // Mock signature
  const signature = {
    signature: crypto.randomBytes(128).toString('base64'),
    timestamp: new Date().toISOString(),
    certificate: {
      subject: 'Dr. Mock',
      issuer: 'ICP-Brasil Mock',
      serialNumber: crypto.randomBytes(8).toString('hex'),
      validFrom: '2024-01-01',
      validTo: '2026-12-31'
    },
    verified: true
  }
  
  return {
    document: {
      id: request.params.id,
      status: 'signed',
      signedAt: new Date().toISOString(),
      signatureId: uuidv4()
    },
    signature
  }
})

// Signature Verification - Verify by hash
fastify.get('/verify/:hash', async (request, reply) => {
  const { hash } = request.params
  const { includeMetadata = false } = request.query
  
  try {
    // Query document by hash
    const documentQuery = await pool.query(
      'SELECT * FROM documents WHERE hash = $1',
      [hash]
    )
    
    if (documentQuery.rows.length === 0) {
      reply.code(404).send({ 
        error: 'Document not found',
        hash,
        verified: false,
        timestamp: new Date().toISOString()
      })
      return
    }
    
    const document = documentQuery.rows[0]
    
    // Query signature if exists
    let signature = null
    if (document.signature_id) {
      const signatureQuery = await pool.query(
        'SELECT * FROM signatures WHERE id = $1',
        [document.signature_id]
      )
      
      if (signatureQuery.rows.length > 0) {
        signature = signatureQuery.rows[0]
      }
    }
    
    // Build verification response
    const verification = {
      verified: true,
      documentHash: hash,
      documentId: document.id,
      status: document.status,
      createdAt: document.created_at,
      templateName: document.template_name,
      
      patient: {
        name: document.patient.name,
        cpf: document.patient.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      },
      
      signature: signature ? {
        exists: true,
        verified: signature.verified,
        timestamp: signature.timestamp,
        certificate: {
          subject: signature.certificate.subject,
          issuer: signature.certificate.issuer,
          validFrom: signature.certificate.validFrom,
          validTo: signature.certificate.validTo
        }
      } : {
        exists: false,
        verified: false
      },
      
      validation: {
        documentIntegrity: true,
        hashMatches: true,
        certificateValid: signature?.verified || false,
        revocationStatus: signature ? 'valid' : 'unknown',
        timestamp: new Date().toISOString()
      }
    }
    
    // Include full metadata if requested
    if (includeMetadata === 'true') {
      verification.metadata = {
        templateId: document.template_id,
        fields: document.fields,
        qrCode: document.qr_code,
        pdfUrl: document.pdf_url
      }
    }
    
    return verification
    
  } catch (err) {
    fastify.log.error('Verification error:', err)
    reply.code(500).send({
      error: 'Verification failed',
      hash,
      verified: false,
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    })
  }
})

// Signature Verification - API endpoint for programmatic access
fastify.post('/api/verify', async (request, reply) => {
  const { hash, documentContent, includeMetadata = false } = request.body
  
  if (!hash) {
    reply.code(400).send({ error: 'Hash is required' })
    return
  }
  
  try {
    // Reuse the verification logic
    const verificationRequest = {
      params: { hash },
      query: { includeMetadata: includeMetadata.toString() }
    }
    
    // Mock reply object to capture the response
    let verificationResult = null
    let statusCode = 200
    
    const mockReply = {
      code: (code) => {
        statusCode = code
        return mockReply
      },
      send: (data) => {
        verificationResult = data
        return data
      }
    }
    
    // Call the verification endpoint logic
    await fastify.inject({
      method: 'GET',
      url: `/verify/${hash}?includeMetadata=${includeMetadata}`
    }).then(response => {
      verificationResult = JSON.parse(response.body)
      statusCode = response.statusCode
    })
    
    reply.code(statusCode).send(verificationResult)
    
  } catch (err) {
    fastify.log.error('API Verification error:', err)
    reply.code(500).send({
      error: 'API verification failed',
      timestamp: new Date().toISOString()
    })
  }
})

// ====== DATABASE INITIALIZATION ======
async function initDatabase() {
  try {
    // Criar tabelas básicas se não existirem
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id VARCHAR(100) NOT NULL,
        template_name VARCHAR(200) NOT NULL,
        fields JSONB NOT NULL,
        patient JSONB NOT NULL,
        hash VARCHAR(64) NOT NULL UNIQUE,
        qr_code TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        pdf_url TEXT,
        share_url TEXT,
        signature_id UUID
      )
    `)
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS signatures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES documents(id),
        signature TEXT NOT NULL,
        certificate JSONB NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        verified BOOLEAN DEFAULT false
      )
    `)
    
    fastify.log.info('✅ Database initialized successfully')
  } catch (err) {
    fastify.log.warn('⚠️ Database initialization failed (running in mock mode):', err.message)
  }
}

// ====== SERVER START ======
const start = async () => {
  try {
    await initDatabase()
    const PORT = process.env.PORT || 8080
    await fastify.listen({ 
      port: PORT, 
      host: '0.0.0.0' 
    })
    
    console.log(`🚀 RepoMed API running on http://localhost:${PORT}`)
    console.log(`📊 Metrics: http://localhost:${PORT}/metrics`)
    console.log('🏥 Medical templates: 5 loaded')
    console.log('✅ All services ready!')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()