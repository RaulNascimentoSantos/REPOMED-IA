import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { FastifyInstance } from 'fastify'
import { build } from '../../src/app'

describe('Documents API Integration', () => {
  let app: FastifyInstance
  let authToken: string

  beforeAll(async () => {
    app = build({
      logger: false,
      disableRequestLogging: true
    })

    await app.ready()

    // Create test user and get auth token
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'test@example.com',
        password: 'Test123!@#',
        name: 'Test User',
        crm: '12345-SP'
      }
    })

    const registerData = JSON.parse(registerResponse.payload)
    authToken = registerData.token
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    // Clean up test data before each test
    await app.inject({
      method: 'DELETE',
      url: '/api/test/cleanup',
      headers: { Authorization: `Bearer ${authToken}` }
    })
  })

  describe('POST /api/documents', () => {
    it('should create a new document successfully', async () => {
      const documentData = {
        templateId: 'tpl_001',
        fields: {
          patient_name: 'João Silva',
          medications: [
            {
              name: 'Dipirona 500mg',
              dosage: '1 comprimido',
              frequency: 'de 6/6 horas'
            }
          ],
          instructions: 'Tomar com água'
        },
        patient: {
          name: 'João Silva',
          cpf: '123.456.789-00'
        }
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: documentData
      })

      expect(response.statusCode).toBe(201)
      
      const data = JSON.parse(response.payload)
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('hash')
      expect(data).toHaveProperty('qrCode')
      expect(data.status).toBe('draft')
      expect(data.templateId).toBe('tpl_001')
    })

    it('should reject invalid document data', async () => {
      const invalidData = {
        // Missing required templateId
        fields: { patient_name: 'João Silva' }
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: invalidData
      })

      expect(response.statusCode).toBe(400)
      
      const data = JSON.parse(response.payload)
      expect(data).toHaveProperty('type')
      expect(data.type).toBe('https://tools.ietf.org/html/rfc7231#section-6.5.1')
    })

    it('should require authentication', async () => {
      const documentData = {
        templateId: 'tpl_001',
        fields: { patient_name: 'João Silva' },
        patient: { name: 'João Silva' }
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/documents',
        payload: documentData
      })

      expect(response.statusCode).toBe(401)
    })

    it('should generate deterministic hash for same content', async () => {
      const documentData = {
        templateId: 'tpl_001',
        fields: { patient_name: 'Test Patient' },
        patient: { name: 'Test Patient', cpf: '123.456.789-00' }
      }

      const response1 = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: documentData
      })

      const response2 = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: documentData
      })

      expect(response1.statusCode).toBe(201)
      expect(response2.statusCode).toBe(201)

      const data1 = JSON.parse(response1.payload)
      const data2 = JSON.parse(response2.payload)

      expect(data1.hash).toBe(data2.hash)
    })
  })

  describe('GET /api/documents', () => {
    it('should list documents with pagination', async () => {
      // Create test documents first
      const testDocs = Array.from({ length: 5 }, (_, i) => ({
        templateId: 'tpl_001',
        fields: { patient_name: `Patient ${i}` },
        patient: { name: `Patient ${i}`, cpf: `${i}23.456.789-00` }
      }))

      for (const doc of testDocs) {
        await app.inject({
          method: 'POST',
          url: '/api/documents',
          headers: { Authorization: `Bearer ${authToken}` },
          payload: doc
        })
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/documents?page=1&limit=3',
        headers: { Authorization: `Bearer ${authToken}` }
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.payload)
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('pagination')
      expect(data.data.length).toBeLessThanOrEqual(3)
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(3)
    })

    it('should filter documents by status', async () => {
      // Create and sign one document
      const docResponse = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          templateId: 'tpl_001',
          fields: { patient_name: 'Signed Patient' },
          patient: { name: 'Signed Patient' }
        }
      })

      const doc = JSON.parse(docResponse.payload)

      await app.inject({
        method: 'POST',
        url: `/api/documents/${doc.id}/sign`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { provider: 'mock' }
      })

      // Filter by signed status
      const response = await app.inject({
        method: 'GET',
        url: '/api/documents?status=signed',
        headers: { Authorization: `Bearer ${authToken}` }
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.payload)
      expect(data.data.every((doc: any) => doc.status === 'signed')).toBe(true)
    })

    it('should search documents by patient name', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          templateId: 'tpl_001',
          fields: { patient_name: 'João Searchable' },
          patient: { name: 'João Searchable' }
        }
      })

      const response = await app.inject({
        method: 'GET',
        url: '/api/documents?search=Searchable',
        headers: { Authorization: `Bearer ${authToken}` }
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.payload)
      expect(data.data.length).toBeGreaterThan(0)
      expect(data.data.some((doc: any) => 
        doc.fields.patient_name.includes('Searchable')
      )).toBe(true)
    })
  })

  describe('GET /api/documents/:id', () => {
    it('should get document by id', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          templateId: 'tpl_001',
          fields: { patient_name: 'Get Test Patient' },
          patient: { name: 'Get Test Patient' }
        }
      })

      const createdDoc = JSON.parse(createResponse.payload)

      const response = await app.inject({
        method: 'GET',
        url: `/api/documents/${createdDoc.id}`,
        headers: { Authorization: `Bearer ${authToken}` }
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.payload)
      expect(data.id).toBe(createdDoc.id)
      expect(data.fields.patient_name).toBe('Get Test Patient')
    })

    it('should return 404 for non-existent document', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/documents/non-existent-id',
        headers: { Authorization: `Bearer ${authToken}` }
      })

      expect(response.statusCode).toBe(404)

      const data = JSON.parse(response.payload)
      expect(data.type).toBe('https://tools.ietf.org/html/rfc7231#section-6.5.4')
    })
  })

  describe('POST /api/documents/:id/sign', () => {
    it('should sign document successfully', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          templateId: 'tpl_001',
          fields: { patient_name: 'Sign Test Patient' },
          patient: { name: 'Sign Test Patient' }
        }
      })

      const doc = JSON.parse(createResponse.payload)

      const signResponse = await app.inject({
        method: 'POST',
        url: `/api/documents/${doc.id}/sign`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { provider: 'mock' }
      })

      expect(signResponse.statusCode).toBe(200)

      const signData = JSON.parse(signResponse.payload)
      expect(signData.document.status).toBe('signed')
      expect(signData.signature).toHaveProperty('signature')
      expect(signData.signature).toHaveProperty('certificate')
      expect(signData.signature.certificate.issuer).toContain('ICP-Brasil')
    })

    it('should reject signing already signed document', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          templateId: 'tpl_001',
          fields: { patient_name: 'Double Sign Test' },
          patient: { name: 'Double Sign Test' }
        }
      })

      const doc = JSON.parse(createResponse.payload)

      // First signature
      await app.inject({
        method: 'POST',
        url: `/api/documents/${doc.id}/sign`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { provider: 'mock' }
      })

      // Second signature attempt
      const secondSignResponse = await app.inject({
        method: 'POST',
        url: `/api/documents/${doc.id}/sign`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { provider: 'mock' }
      })

      expect(secondSignResponse.statusCode).toBe(400)

      const data = JSON.parse(secondSignResponse.payload)
      expect(data.detail).toContain('already signed')
    })

    it('should validate signature provider', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          templateId: 'tpl_001',
          fields: { patient_name: 'Provider Test' },
          patient: { name: 'Provider Test' }
        }
      })

      const doc = JSON.parse(createResponse.payload)

      const response = await app.inject({
        method: 'POST',
        url: `/api/documents/${doc.id}/sign`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { provider: 'invalid_provider' }
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /api/documents/:id/pdf', () => {
    it('should generate PDF for document', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/documents',
        headers: { Authorization: `Bearer ${authToken}` },
        payload: {
          templateId: 'tpl_001',
          fields: { patient_name: 'PDF Test Patient' },
          patient: { name: 'PDF Test Patient' }
        }
      })

      const doc = JSON.parse(createResponse.payload)

      const pdfResponse = await app.inject({
        method: 'GET',
        url: `/api/documents/${doc.id}/pdf`,
        headers: { Authorization: `Bearer ${authToken}` }
      })

      expect(pdfResponse.statusCode).toBe(200)
      expect(pdfResponse.headers['content-type']).toBe('application/pdf')
      expect(pdfResponse.headers['content-disposition']).toContain('filename=')
    })

    it('should generate same PDF for identical documents', async () => {
      const docData = {
        templateId: 'tpl_001',
        fields: { patient_name: 'Identical PDF Test' },
        patient: { name: 'Identical PDF Test', cpf: '123.456.789-00' }
      }

      const [response1, response2] = await Promise.all([
        app.inject({
          method: 'POST',
          url: '/api/documents',
          headers: { Authorization: `Bearer ${authToken}` },
          payload: docData
        }),
        app.inject({
          method: 'POST',
          url: '/api/documents',
          headers: { Authorization: `Bearer ${authToken}` },
          payload: docData
        })
      ])

      const [doc1, doc2] = [
        JSON.parse(response1.payload),
        JSON.parse(response2.payload)
      ]

      const [pdf1, pdf2] = await Promise.all([
        app.inject({
          method: 'GET',
          url: `/api/documents/${doc1.id}/pdf`,
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        app.inject({
          method: 'GET',
          url: `/api/documents/${doc2.id}/pdf`,
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ])

      expect(pdf1.statusCode).toBe(200)
      expect(pdf2.statusCode).toBe(200)
      
      // PDFs should be identical for same content
      expect(pdf1.body.length).toBe(pdf2.body.length)
    })
  })
})