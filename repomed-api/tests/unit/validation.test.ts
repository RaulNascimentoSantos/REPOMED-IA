import { describe, it, expect } from 'vitest'
import { validateDocumentData, validatePatientData, validateSignatureData } from '../../src/utils/validation'

describe('Validation Utils', () => {
  describe('validateDocumentData', () => {
    it('should validate correct document data', () => {
      const validData = {
        templateId: 'tpl_001',
        fields: {
          patient_name: 'João Silva',
          medications: [
            { name: 'Dipirona', dosage: '500mg', frequency: '8/8h' }
          ]
        },
        patient: {
          name: 'João Silva',
          cpf: '123.456.789-00'
        }
      }

      expect(() => validateDocumentData(validData)).not.toThrow()
    })

    it('should reject document data without templateId', () => {
      const invalidData = {
        fields: { patient_name: 'João Silva' },
        patient: { name: 'João Silva' }
      }

      expect(() => validateDocumentData(invalidData)).toThrow()
    })

    it('should reject document data without required fields', () => {
      const invalidData = {
        templateId: 'tpl_001',
        fields: {},
        patient: { name: 'João Silva' }
      }

      expect(() => validateDocumentData(invalidData)).toThrow()
    })

    it('should validate medication array format', () => {
      const validData = {
        templateId: 'tpl_001',
        fields: {
          patient_name: 'João Silva',
          medications: [
            { name: 'Dipirona', dosage: '500mg' },
            { name: 'Paracetamol', dosage: '750mg' }
          ]
        },
        patient: { name: 'João Silva', cpf: '123.456.789-00' }
      }

      expect(() => validateDocumentData(validData)).not.toThrow()
    })
  })

  describe('validatePatientData', () => {
    it('should validate correct patient data', () => {
      const validPatient = {
        name: 'João Silva Santos',
        cpf: '123.456.789-00',
        birthDate: '1990-01-01',
        phone: '(11) 98765-4321',
        email: 'joao@example.com'
      }

      expect(() => validatePatientData(validPatient)).not.toThrow()
    })

    it('should reject patient without name', () => {
      const invalidPatient = {
        cpf: '123.456.789-00'
      }

      expect(() => validatePatientData(invalidPatient)).toThrow()
    })

    it('should validate CPF format', () => {
      const validFormats = [
        '123.456.789-00',
        '12345678900'
      ]

      const invalidFormats = [
        '123.456.789',
        '123-456-789-00',
        'abc.def.ghi-jk',
        '123456789012'
      ]

      validFormats.forEach(cpf => {
        expect(() => validatePatientData({ name: 'Test', cpf })).not.toThrow()
      })

      invalidFormats.forEach(cpf => {
        expect(() => validatePatientData({ name: 'Test', cpf })).toThrow()
      })
    })

    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ]

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com'
      ]

      validEmails.forEach(email => {
        expect(() => validatePatientData({ 
          name: 'Test', 
          cpf: '123.456.789-00', 
          email 
        })).not.toThrow()
      })

      invalidEmails.forEach(email => {
        expect(() => validatePatientData({ 
          name: 'Test', 
          cpf: '123.456.789-00', 
          email 
        })).toThrow()
      })
    })

    it('should validate phone format', () => {
      const validPhones = [
        '(11) 98765-4321',
        '(11) 8765-4321',
        '11987654321',
        '1187654321'
      ]

      const invalidPhones = [
        '123',
        '(11) 123',
        'abc',
        '(ab) 12345-6789'
      ]

      validPhones.forEach(phone => {
        expect(() => validatePatientData({ 
          name: 'Test', 
          cpf: '123.456.789-00', 
          phone 
        })).not.toThrow()
      })

      invalidPhones.forEach(phone => {
        expect(() => validatePatientData({ 
          name: 'Test', 
          cpf: '123.456.789-00', 
          phone 
        })).toThrow()
      })
    })
  })

  describe('validateSignatureData', () => {
    it('should validate correct signature data', () => {
      const validSignature = {
        documentId: 'doc_123',
        provider: 'mock',
        certificate: {
          subject: 'CN=Dr. João Silva',
          issuer: 'CN=AC VALID RFB v5, OU=Autoridade Certificadora Raiz Brasileira v5, O=ICP-Brasil',
          serialNumber: '12345',
          validFrom: '2024-01-01T00:00:00Z',
          validTo: '2025-01-01T00:00:00Z'
        }
      }

      expect(() => validateSignatureData(validSignature)).not.toThrow()
    })

    it('should reject signature without documentId', () => {
      const invalidSignature = {
        provider: 'mock'
      }

      expect(() => validateSignatureData(invalidSignature)).toThrow()
    })

    it('should validate supported providers', () => {
      const validProviders = ['mock', 'iti', 'serasa', 'valid']
      const invalidProviders = ['unknown', 'test', 'invalid']

      validProviders.forEach(provider => {
        expect(() => validateSignatureData({ 
          documentId: 'doc_123', 
          provider 
        })).not.toThrow()
      })

      invalidProviders.forEach(provider => {
        expect(() => validateSignatureData({ 
          documentId: 'doc_123', 
          provider 
        })).toThrow()
      })
    })

    it('should validate certificate structure when provided', () => {
      const validCertificate = {
        subject: 'CN=Dr. João Silva',
        issuer: 'CN=AC VALID RFB v5',
        serialNumber: '12345',
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2025-01-01T00:00:00Z'
      }

      const invalidCertificate = {
        subject: 'CN=Dr. João Silva'
        // Missing required fields
      }

      expect(() => validateSignatureData({ 
        documentId: 'doc_123', 
        provider: 'mock',
        certificate: validCertificate
      })).not.toThrow()

      expect(() => validateSignatureData({ 
        documentId: 'doc_123', 
        provider: 'mock',
        certificate: invalidCertificate
      })).toThrow()
    })
  })
})