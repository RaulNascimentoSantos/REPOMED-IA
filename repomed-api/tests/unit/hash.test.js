"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const hash_1 = require("../../src/utils/hash");
(0, vitest_1.describe)('Hash Utils', () => {
    (0, vitest_1.describe)('calculateDocumentHash', () => {
        (0, vitest_1.it)('should generate consistent hash for same content', () => {
            const data = {
                templateId: 'tpl_001',
                fields: { patient_name: 'João Silva' },
                patient: { name: 'João Silva', cpf: '123.456.789-00' }
            };
            const hash1 = (0, hash_1.calculateDocumentHash)(data);
            const hash2 = (0, hash_1.calculateDocumentHash)(data);
            (0, vitest_1.expect)(hash1).toBe(hash2);
            (0, vitest_1.expect)(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
        });
        (0, vitest_1.it)('should generate different hashes for different content', () => {
            const data1 = {
                templateId: 'tpl_001',
                fields: { patient_name: 'João Silva' },
                patient: { name: 'João Silva', cpf: '123.456.789-00' }
            };
            const data2 = {
                templateId: 'tpl_001',
                fields: { patient_name: 'Maria Silva' },
                patient: { name: 'Maria Silva', cpf: '123.456.789-00' }
            };
            const hash1 = (0, hash_1.calculateDocumentHash)(data1);
            const hash2 = (0, hash_1.calculateDocumentHash)(data2);
            (0, vitest_1.expect)(hash1).not.toBe(hash2);
        });
        (0, vitest_1.it)('should be order-independent for object properties', () => {
            const data1 = {
                templateId: 'tpl_001',
                fields: { patient_name: 'João Silva', age: '30' },
                patient: { name: 'João Silva', cpf: '123.456.789-00' }
            };
            const data2 = {
                templateId: 'tpl_001',
                fields: { age: '30', patient_name: 'João Silva' },
                patient: { cpf: '123.456.789-00', name: 'João Silva' }
            };
            const hash1 = (0, hash_1.calculateDocumentHash)(data1);
            const hash2 = (0, hash_1.calculateDocumentHash)(data2);
            (0, vitest_1.expect)(hash1).toBe(hash2);
        });
        (0, vitest_1.it)('should handle nested objects correctly', () => {
            const data = {
                templateId: 'tpl_001',
                fields: {
                    patient_name: 'João Silva',
                    medications: [
                        { name: 'Dipirona', dosage: '500mg' },
                        { name: 'Paracetamol', dosage: '750mg' }
                    ]
                }
            };
            const hash = (0, hash_1.calculateDocumentHash)(data);
            (0, vitest_1.expect)(hash).toMatch(/^[a-f0-9]{64}$/);
        });
        (0, vitest_1.it)('should handle undefined and null values consistently', () => {
            const data1 = {
                templateId: 'tpl_001',
                fields: { patient_name: 'João Silva', optional: undefined }
            };
            const data2 = {
                templateId: 'tpl_001',
                fields: { patient_name: 'João Silva', optional: null }
            };
            const data3 = {
                templateId: 'tpl_001',
                fields: { patient_name: 'João Silva' }
            };
            const hash1 = (0, hash_1.calculateDocumentHash)(data1);
            const hash2 = (0, hash_1.calculateDocumentHash)(data2);
            const hash3 = (0, hash_1.calculateDocumentHash)(data3);
            // All should be the same since undefined/null values are normalized
            (0, vitest_1.expect)(hash1).toBe(hash2);
            (0, vitest_1.expect)(hash2).toBe(hash3);
        });
    });
});
