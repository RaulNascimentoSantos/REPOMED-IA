import { describe, it, expect } from 'vitest'
import { calculateDocumentHash } from '../../src/utils/hash'

describe('Hash Utils', () => {
  describe('calculateDocumentHash', () => {
    it('should generate consistent hash for same content', () => {
      const data = {
        templateId: 'tpl_001',
        fields: { patient_name: 'João Silva' },
        patient: { name: 'João Silva', cpf: '123.456.789-00' }
      }

      const hash1 = calculateDocumentHash(data)
      const hash2 = calculateDocumentHash(data)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^[a-f0-9]{64}$/) // SHA-256 hex format
    })

    it('should generate different hashes for different content', () => {
      const data1 = {
        templateId: 'tpl_001',
        fields: { patient_name: 'João Silva' },
        patient: { name: 'João Silva', cpf: '123.456.789-00' }
      }

      const data2 = {
        templateId: 'tpl_001',
        fields: { patient_name: 'Maria Silva' },
        patient: { name: 'Maria Silva', cpf: '123.456.789-00' }
      }

      const hash1 = calculateDocumentHash(data1)
      const hash2 = calculateDocumentHash(data2)

      expect(hash1).not.toBe(hash2)
    })

    it('should be order-independent for object properties', () => {
      const data1 = {
        templateId: 'tpl_001',
        fields: { patient_name: 'João Silva', age: '30' },
        patient: { name: 'João Silva', cpf: '123.456.789-00' }
      }

      const data2 = {
        templateId: 'tpl_001',
        fields: { age: '30', patient_name: 'João Silva' },
        patient: { cpf: '123.456.789-00', name: 'João Silva' }
      }

      const hash1 = calculateDocumentHash(data1)
      const hash2 = calculateDocumentHash(data2)

      expect(hash1).toBe(hash2)
    })

    it('should handle nested objects correctly', () => {
      const data = {
        templateId: 'tpl_001',
        fields: {
          patient_name: 'João Silva',
          medications: [
            { name: 'Dipirona', dosage: '500mg' },
            { name: 'Paracetamol', dosage: '750mg' }
          ]
        }
      }

      const hash = calculateDocumentHash(data)
      expect(hash).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should handle undefined and null values consistently', () => {
      const data1 = {
        templateId: 'tpl_001',
        fields: { patient_name: 'João Silva', optional: undefined }
      }

      const data2 = {
        templateId: 'tpl_001',
        fields: { patient_name: 'João Silva', optional: null }
      }

      const data3 = {
        templateId: 'tpl_001',
        fields: { patient_name: 'João Silva' }
      }

      const hash1 = calculateDocumentHash(data1)
      const hash2 = calculateDocumentHash(data2)
      const hash3 = calculateDocumentHash(data3)

      // All should be the same since undefined/null values are normalized
      expect(hash1).toBe(hash2)
      expect(hash2).toBe(hash3)
    })
  })
})