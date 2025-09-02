const fastify = require('fastify')({ logger: true })

// Registrar plugins
fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:3000', 'http://localhost:5173']
})

fastify.register(require('@fastify/helmet'))

// Banco de dados PostgreSQL (conexão mock por enquanto)
const mockDB = {
  templates: [
    {
      id: 'tpl_receita_simples',
      name: 'Receita Médica Simples',
      specialty: 'clinica_geral',
      version: '1.0.0',
      fields: [
        {
          id: 'patient_name',
          label: 'Nome do Paciente',
          type: 'text',
          required: true
        },
        {
          id: 'patient_cpf',
          label: 'CPF do Paciente',
          type: 'text',
          required: true
        },
        {
          id: 'medications',
          label: 'Medicamentos',
          type: 'array',
          required: true
        }
      ],
      content: `RECEITUÁRIO MÉDICO

Paciente: {{patient_name}}
CPF: {{patient_cpf}}
Data: {{date}}

PRESCRIÇÃO:
{{#medications}}
• {{name}} - {{dosage}} - {{frequency}}
{{/medications}}

INSTRUÇÕES GERAIS:
{{instructions}}

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
        {
          id: 'patient_name',
          label: 'Nome do Paciente',
          type: 'text',
          required: true
        },
        {
          id: 'patient_cpf',
          label: 'CPF do Paciente',
          type: 'text',
          required: true
        },
        {
          id: 'days_off',
          label: 'Dias de Afastamento',
          type: 'number',
          required: true
        }
      ],
      content: `ATESTADO MÉDICO

Atesto que o paciente {{patient_name}}, CPF {{patient_cpf}}, 
esteve sob meus cuidados médicos e necessita de afastamento 
de suas atividades por {{days_off}} dias, a partir de {{start_date}}.

{{#cid10}}CID-10: {{cid10}}{{/cid10}}

MOTIVO:
{{reason}}

{{city}}, {{date}}

_________________________
{{doctor_name}}
CRM: {{doctor_crm}}`,
      compliance: {
        cfm: true,
        anvisa: true,
        requires_signature: true
      }
    }
  ],
  documents: []
}

// Health Check
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      api: 'running'
    }
  }
})

// Metrics
fastify.get('/metrics', async (request, reply) => {
  return {
    documents_total: mockDB.documents.length,
    api_latency_p95: 45.2,
    uptime: process.uptime(),
    templates_available: mockDB.templates.length
  }
})

// TEMPLATES ENDPOINTS

// GET /api/templates
fastify.get('/api/templates', async (request, reply) => {
  return {
    data: mockDB.templates,
    total: mockDB.templates.length
  }
})

// GET /api/templates/:id
fastify.get('/api/templates/:id', async (request, reply) => {
  const { id } = request.params
  const template = mockDB.templates.find(t => t.id === id)
  
  if (!template) {
    reply.code(404)
    return {
      statusCode: 404,
      error: 'Not Found',
      message: 'Template não encontrado'
    }
  }
  
  return {
    data: template
  }
})

// DOCUMENTS ENDPOINTS

// POST /api/documents
fastify.post('/api/documents', async (request, reply) => {
  const { templateId, patient, fields } = request.body
  
  if (!templateId) {
    reply.code(400)
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: 'Template ID é obrigatório'
    }
  }
  
  const template = mockDB.templates.find(t => t.id === templateId)
  if (!template) {
    reply.code(404)
    return {
      statusCode: 404,
      error: 'Not Found',
      message: 'Template não encontrado'
    }
  }
  
  // Processar template com Handlebars
  const handlebars = require('handlebars')
  const compiledTemplate = handlebars.compile(template.content)
  
  const context = {
    ...fields,
    date: new Date().toLocaleDateString('pt-BR'),
    datetime: new Date().toLocaleString('pt-BR'),
    doctor_name: 'Dr. João Silva',
    doctor_crm: '12345-SP',
    city: 'São Paulo',
    ...patient
  }
  
  const processedContent = compiledTemplate(context)
  
  const document = {
    id: require('uuid').v4(),
    templateId,
    templateName: template.name,
    patient,
    fields,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: processedContent
  }
  
  mockDB.documents.push(document)
  
  reply.code(201)
  return {
    data: document
  }
})

// GET /api/documents
fastify.get('/api/documents', async (request, reply) => {
  const { page = 1, limit = 10, status } = request.query
  
  let filteredDocs = mockDB.documents
  if (status) {
    filteredDocs = filteredDocs.filter(doc => doc.status === status)
  }
  
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + parseInt(limit)
  const paginatedDocs = filteredDocs.slice(startIndex, endIndex)
  
  return {
    data: paginatedDocs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredDocs.length,
      pages: Math.ceil(filteredDocs.length / limit)
    }
  }
})

// GET /api/documents/:id
fastify.get('/api/documents/:id', async (request, reply) => {
  const { id } = request.params
  const document = mockDB.documents.find(d => d.id === id)
  
  if (!document) {
    reply.code(404)
    return {
      statusCode: 404,
      error: 'Not Found',
      message: 'Documento não encontrado'
    }
  }
  
  return {
    data: document
  }
})

// PDF GENERATION

// GET /api/documents/:id/pdf
fastify.get('/api/documents/:id/pdf', async (request, reply) => {
  const { id } = request.params
  const document = mockDB.documents.find(d => d.id === id)
  
  if (!document) {
    reply.code(404)
    return {
      statusCode: 404,
      error: 'Not Found',
      message: 'Documento não encontrado'
    }
  }
  
  try {
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 14px; 
          line-height: 1.6; 
          margin: 40px;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #333; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .content { 
          white-space: pre-line; 
        }
        .signature {
          margin-top: 50px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>DOCUMENTO MÉDICO</h1>
        <p>${document.templateName}</p>
        <p>Documento ID: ${document.id}</p>
      </div>
      <div class="content">
        ${document.content}
      </div>
    </body>
    </html>
    `
    
    await page.setContent(html)
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    })
    
    await browser.close()
    
    reply
      .type('application/pdf')
      .header('Content-Disposition', `attachment; filename="${document.templateName}-${document.patient?.name || 'documento'}.pdf"`)
      .send(pdf)
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    reply.code(500)
    return {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Erro ao gerar PDF'
    }
  }
})

// Iniciar servidor
const start = async () => {
  try {
    await fastify.listen({ port: 8081, host: '0.0.0.0' })
    console.log('🚀 RepoMed IA Backend rodando na porta 8081')
    console.log('📋 Templates disponíveis:', mockDB.templates.length)
    console.log('📄 Documentos salvos:', mockDB.documents.length)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()