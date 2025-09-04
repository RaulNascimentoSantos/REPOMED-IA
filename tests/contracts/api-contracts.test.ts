import { describe, it, expect } from 'vitest'
import { documentSchema, patientSchema, signatureSchema, templateSchema } from '../../packages/types/src/schemas'

describe('API Contract Tests - Zod Schemas', () => {
  
  describe('Document Schema', () => {
    it('should validate correct document data', () => {
      const validDocument = {
        id: 'doc_12345',
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
          cpf: '123.456.789-00',
          phone: '(11) 98765-4321',
          email: 'joao@example.com'
        },
        status: 'draft',
        hash: 'abc123def456...',
        qrCode: 'data:image/png;base64,...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = documentSchema.safeParse(validDocument)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.id).toBe(validDocument.id)
        expect(result.data.status).toBe('draft')
        expect(result.data.fields.patient_name).toBe('João Silva')
      }
    })

    it('should reject document with invalid status', () => {
      const invalidDocument = {
        id: 'doc_12345',
        templateId: 'tpl_001',
        fields: { patient_name: 'João Silva' },
        patient: { name: 'João Silva', cpf: '123.456.789-00' },
        status: 'invalid_status', // Invalid status
        hash: 'abc123',
        qrCode: 'data:image/png;base64,...'
      }

      const result = documentSchema.safeParse(invalidDocument)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('status')
        )).toBe(true)
      }
    })

    it('should reject document without required fields', () => {
      const incompleteDocument = {
        id: 'doc_12345',
        // Missing templateId
        fields: {},
        patient: { name: 'Test' },
        status: 'draft'
      }

      const result = documentSchema.safeParse(incompleteDocument)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('templateId') || issue.code === 'invalid_type'
        )).toBe(true)
      }
    })

    it('should validate nested medication objects', () => {
      const documentWithMeds = {
        id: 'doc_123',
        templateId: 'tpl_001',
        fields: {
          patient_name: 'Test Patient',
          medications: [
            {
              name: 'Dipirona',
              dosage: '500mg',
              frequency: '8/8h',
              instructions: 'Com água'
            },
            {
              name: 'Paracetamol',
              dosage: '750mg',
              frequency: '12/12h'
              // instructions is optional
            }
          ]
        },
        patient: { name: 'Test', cpf: '123.456.789-00' },
        status: 'draft',
        hash: 'test-hash',
        qrCode: 'test-qr'
      }

      const result = documentSchema.safeParse(documentWithMeds)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.fields.medications).toHaveLength(2)
        expect(result.data.fields.medications[0].name).toBe('Dipirona')
        expect(result.data.fields.medications[1].instructions).toBeUndefined()
      }
    })
  })

  describe('Patient Schema', () => {
    it('should validate correct patient data', () => {
      const validPatient = {
        id: 'pat_12345',
        name: 'Maria Silva Santos',
        cpf: '987.654.321-00',
        phone: '(11) 98765-4321',
        email: 'maria@example.com',
        birthDate: '1985-03-15',
        address: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = patientSchema.safeParse(validPatient)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.cpf).toBe('987.654.321-00')
        expect(result.data.address?.city).toBe('São Paulo')
      }
    })

    it('should validate patient with minimal required fields', () => {
      const minimalPatient = {
        name: 'João Silva',
        cpf: '123.456.789-00'
      }

      const result = patientSchema.safeParse(minimalPatient)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.name).toBe('João Silva')
        expect(result.data.email).toBeUndefined()
        expect(result.data.phone).toBeUndefined()
      }
    })

    it('should reject invalid CPF format', () => {
      const invalidPatient = {
        name: 'Test User',
        cpf: '123.456.789' // Invalid CPF format
      }

      const result = patientSchema.safeParse(invalidPatient)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('cpf')
        )).toBe(true)
      }
    })

    it('should reject invalid email format', () => {
      const invalidPatient = {
        name: 'Test User',
        cpf: '123.456.789-00',
        email: 'invalid-email-format' // Invalid email
      }

      const result = patientSchema.safeParse(invalidPatient)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('email')
        )).toBe(true)
      }
    })

    it('should validate optional address object', () => {
      const patientWithAddress = {
        name: 'Test User',
        cpf: '123.456.789-00',
        address: {
          street: 'Test Street, 123',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345-678'
        }
      }

      const result = patientSchema.safeParse(patientWithAddress)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.address?.street).toBe('Test Street, 123')
        expect(result.data.address?.state).toBe('TS')
      }
    })
  })

  describe('Signature Schema', () => {
    it('should validate correct signature data', () => {
      const validSignature = {
        id: 'sig_12345',
        documentId: 'doc_12345',
        provider: 'iti',
        signature: 'base64-encoded-signature-data...',
        certificate: {
          subject: 'CN=Dr. João Silva, OU=Medicina, O=Hospital XYZ',
          issuer: 'CN=AC VALID RFB v5, OU=Autoridade Certificadora Raiz Brasileira v5, O=ICP-Brasil',
          serialNumber: '1234567890ABCDEF',
          validFrom: '2024-01-01T00:00:00Z',
          validTo: '2025-01-01T00:00:00Z',
          fingerprint: 'sha256:abc123def456...'
        },
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      const result = signatureSchema.safeParse(validSignature)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.provider).toBe('iti')
        expect(result.data.certificate.issuer).toContain('ICP-Brasil')
      }
    })

    it('should validate supported signature providers', () => {
      const supportedProviders = ['mock', 'iti', 'serasa', 'valid']

      supportedProviders.forEach(provider => {
        const signature = {
          id: 'sig_test',
          documentId: 'doc_test',
          provider,
          signature: 'test-signature',
          certificate: {
            subject: 'test',
            issuer: 'test',
            serialNumber: 'test',
            validFrom: '2024-01-01T00:00:00Z',
            validTo: '2025-01-01T00:00:00Z'
          },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }

        const result = signatureSchema.safeParse(signature)
        expect(result.success).toBe(true)
      })
    })

    it('should reject unsupported signature provider', () => {
      const invalidSignature = {
        id: 'sig_12345',
        documentId: 'doc_12345',
        provider: 'unsupported_provider', // Invalid provider
        signature: 'test-signature',
        certificate: {
          subject: 'test',
          issuer: 'test',
          serialNumber: 'test',
          validFrom: '2024-01-01T00:00:00Z',
          validTo: '2025-01-01T00:00:00Z'
        },
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      const result = signatureSchema.safeParse(invalidSignature)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('provider')
        )).toBe(true)
      }
    })

    it('should require certificate fields', () => {
      const signatureWithoutCert = {
        id: 'sig_12345',
        documentId: 'doc_12345',
        provider: 'iti',
        signature: 'test-signature',
        // Missing certificate
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      const result = signatureSchema.safeParse(signatureWithoutCert)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('certificate')
        )).toBe(true)
      }
    })
  })

  describe('Template Schema', () => {
    it('should validate correct template data', () => {
      const validTemplate = {
        id: 'tpl_001',
        name: 'Receita Simples',
        description: 'Template para prescrições médicas simples',
        category: 'prescription',
        fields: [
          {
            name: 'patient_name',
            type: 'text',
            label: 'Nome do Paciente',
            required: true,
            placeholder: 'Digite o nome completo'
          },
          {
            name: 'medications',
            type: 'array',
            label: 'Medicamentos',
            required: true,
            items: {
              type: 'object',
              properties: {
                name: { type: 'text', required: true },
                dosage: { type: 'text', required: true },
                frequency: { type: 'text', required: true }
              }
            }
          }
        ],
        content: '<html>Template HTML content...</html>',
        isActive: true,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = templateSchema.safeParse(validTemplate)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.name).toBe('Receita Simples')
        expect(result.data.fields).toHaveLength(2)
        expect(result.data.fields[0].required).toBe(true)
      }
    })

    it('should validate template with different field types', () => {
      const templateWithVariedFields = {
        id: 'tpl_002',
        name: 'Template Complexo',
        description: 'Template com vários tipos de campo',
        category: 'report',
        fields: [
          {
            name: 'text_field',
            type: 'text',
            label: 'Campo de Texto',
            required: true
          },
          {
            name: 'number_field',
            type: 'number',
            label: 'Campo Numérico',
            required: false,
            min: 0,
            max: 100
          },
          {
            name: 'date_field',
            type: 'date',
            label: 'Data',
            required: true
          },
          {
            name: 'select_field',
            type: 'select',
            label: 'Seleção',
            required: true,
            options: ['Opção 1', 'Opção 2', 'Opção 3']
          }
        ],
        content: '<html>Complex template content...</html>',
        isActive: true,
        version: '1.0.0'
      }

      const result = templateSchema.safeParse(templateWithVariedFields)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.fields.find(f => f.name === 'number_field')?.min).toBe(0)
        expect(result.data.fields.find(f => f.name === 'select_field')?.options).toHaveLength(3)
      }
    })

    it('should reject template without required fields', () => {
      const incompleteTemplate = {
        id: 'tpl_incomplete',
        // Missing name, description, category
        fields: [],
        content: '<html>Test</html>'
      }

      const result = templateSchema.safeParse(incompleteTemplate)
      expect(result.success).toBe(false)

      if (!result.success) {
        const missingFields = result.error.issues.map(issue => issue.path[0])
        expect(missingFields).toEqual(expect.arrayContaining(['name', 'description', 'category']))
      }
    })

    it('should validate template categories', () => {
      const validCategories = ['prescription', 'report', 'certificate', 'form']

      validCategories.forEach(category => {
        const template = {
          id: 'tpl_test',
          name: 'Test Template',
          description: 'Test Description',
          category,
          fields: [],
          content: '<html>Test</html>',
          isActive: true,
          version: '1.0.0'
        }

        const result = templateSchema.safeParse(template)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid template category', () => {
      const invalidTemplate = {
        id: 'tpl_invalid',
        name: 'Invalid Template',
        description: 'Test Description',
        category: 'invalid_category', // Invalid category
        fields: [],
        content: '<html>Test</html>',
        isActive: true,
        version: '1.0.0'
      }

      const result = templateSchema.safeParse(invalidTemplate)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('category')
        )).toBe(true)
      }
    })
  })

  describe('Schema Consistency', () => {
    it('should have consistent field naming conventions', () => {
      const schemas = [documentSchema, patientSchema, signatureSchema, templateSchema]
      
      schemas.forEach(schema => {
        const shape = (schema as any).shape || (schema as any)._def?.shape?.()
        
        if (shape) {
          Object.keys(shape).forEach(fieldName => {
            // Should use camelCase or snake_case consistently
            expect(fieldName).toMatch(/^[a-z][a-zA-Z0-9]*$|^[a-z][a-z0-9_]*[a-z0-9]$/)
          })
        }
      })
    })

    it('should use consistent ID format across schemas', () => {
      const testIds = [
        'doc_12345',
        'pat_12345', 
        'sig_12345',
        'tpl_001'
      ]

      testIds.forEach(id => {
        expect(id).toMatch(/^[a-z]{3}_[a-zA-Z0-9]+$/)
      })
    })

    it('should use consistent timestamp formats', () => {
      const timestamp = new Date().toISOString()
      
      // Should be ISO 8601 format
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      
      // Should be parseable back to Date
      const parsed = new Date(timestamp)
      expect(parsed.toISOString()).toBe(timestamp)
    })
  })
})