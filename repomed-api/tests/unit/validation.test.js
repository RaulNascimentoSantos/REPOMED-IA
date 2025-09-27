"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const validation_1 = require("../../src/utils/validation");
(0, vitest_1.describe)('Validation Utils', () => {
    (0, vitest_1.describe)('validateDocumentData', () => {
        (0, vitest_1.it)('should validate correct document data', () => {
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
            };
            (0, vitest_1.expect)(() => (0, validation_1.validateDocumentData)(validData)).not.toThrow();
        });
        (0, vitest_1.it)('should reject document data without templateId', () => {
            const invalidData = {
                fields: { patient_name: 'João Silva' },
                patient: { name: 'João Silva' }
            };
            (0, vitest_1.expect)(() => (0, validation_1.validateDocumentData)(invalidData)).toThrow();
        });
        (0, vitest_1.it)('should reject document data without required fields', () => {
            const invalidData = {
                templateId: 'tpl_001',
                fields: {},
                patient: { name: 'João Silva' }
            };
            (0, vitest_1.expect)(() => (0, validation_1.validateDocumentData)(invalidData)).toThrow();
        });
        (0, vitest_1.it)('should validate medication array format', () => {
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
            };
            (0, vitest_1.expect)(() => (0, validation_1.validateDocumentData)(validData)).not.toThrow();
        });
    });
    (0, vitest_1.describe)('validatePatientData', () => {
        (0, vitest_1.it)('should validate correct patient data', () => {
            const validPatient = {
                name: 'João Silva Santos',
                cpf: '123.456.789-00',
                birthDate: '1990-01-01',
                phone: '(11) 98765-4321',
                email: 'joao@example.com'
            };
            (0, vitest_1.expect)(() => (0, validation_1.validatePatientData)(validPatient)).not.toThrow();
        });
        (0, vitest_1.it)('should reject patient without name', () => {
            const invalidPatient = {
                cpf: '123.456.789-00'
            };
            (0, vitest_1.expect)(() => (0, validation_1.validatePatientData)(invalidPatient)).toThrow();
        });
        (0, vitest_1.it)('should validate CPF format', () => {
            const validFormats = [
                '123.456.789-00',
                '12345678900'
            ];
            const invalidFormats = [
                '123.456.789',
                '123-456-789-00',
                'abc.def.ghi-jk',
                '123456789012'
            ];
            validFormats.forEach(cpf => {
                (0, vitest_1.expect)(() => (0, validation_1.validatePatientData)({ name: 'Test', cpf })).not.toThrow();
            });
            invalidFormats.forEach(cpf => {
                (0, vitest_1.expect)(() => (0, validation_1.validatePatientData)({ name: 'Test', cpf })).toThrow();
            });
        });
        (0, vitest_1.it)('should validate email format', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@example.org'
            ];
            const invalidEmails = [
                'invalid-email',
                '@example.com',
                'user@',
                'user@.com'
            ];
            validEmails.forEach(email => {
                (0, vitest_1.expect)(() => (0, validation_1.validatePatientData)({
                    name: 'Test',
                    cpf: '123.456.789-00',
                    email
                })).not.toThrow();
            });
            invalidEmails.forEach(email => {
                (0, vitest_1.expect)(() => (0, validation_1.validatePatientData)({
                    name: 'Test',
                    cpf: '123.456.789-00',
                    email
                })).toThrow();
            });
        });
        (0, vitest_1.it)('should validate phone format', () => {
            const validPhones = [
                '(11) 98765-4321',
                '(11) 8765-4321',
                '11987654321',
                '1187654321'
            ];
            const invalidPhones = [
                '123',
                '(11) 123',
                'abc',
                '(ab) 12345-6789'
            ];
            validPhones.forEach(phone => {
                (0, vitest_1.expect)(() => (0, validation_1.validatePatientData)({
                    name: 'Test',
                    cpf: '123.456.789-00',
                    phone
                })).not.toThrow();
            });
            invalidPhones.forEach(phone => {
                (0, vitest_1.expect)(() => (0, validation_1.validatePatientData)({
                    name: 'Test',
                    cpf: '123.456.789-00',
                    phone
                })).toThrow();
            });
        });
    });
    (0, vitest_1.describe)('validateSignatureData', () => {
        (0, vitest_1.it)('should validate correct signature data', () => {
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
            };
            (0, vitest_1.expect)(() => (0, validation_1.validateSignatureData)(validSignature)).not.toThrow();
        });
        (0, vitest_1.it)('should reject signature without documentId', () => {
            const invalidSignature = {
                provider: 'mock'
            };
            (0, vitest_1.expect)(() => (0, validation_1.validateSignatureData)(invalidSignature)).toThrow();
        });
        (0, vitest_1.it)('should validate supported providers', () => {
            const validProviders = ['mock', 'iti', 'serasa', 'valid'];
            const invalidProviders = ['unknown', 'test', 'invalid'];
            validProviders.forEach(provider => {
                (0, vitest_1.expect)(() => (0, validation_1.validateSignatureData)({
                    documentId: 'doc_123',
                    provider
                })).not.toThrow();
            });
            invalidProviders.forEach(provider => {
                (0, vitest_1.expect)(() => (0, validation_1.validateSignatureData)({
                    documentId: 'doc_123',
                    provider
                })).toThrow();
            });
        });
        (0, vitest_1.it)('should validate certificate structure when provided', () => {
            const validCertificate = {
                subject: 'CN=Dr. João Silva',
                issuer: 'CN=AC VALID RFB v5',
                serialNumber: '12345',
                validFrom: '2024-01-01T00:00:00Z',
                validTo: '2025-01-01T00:00:00Z'
            };
            const invalidCertificate = {
                subject: 'CN=Dr. João Silva'
                // Missing required fields
            };
            (0, vitest_1.expect)(() => (0, validation_1.validateSignatureData)({
                documentId: 'doc_123',
                provider: 'mock',
                certificate: validCertificate
            })).not.toThrow();
            (0, vitest_1.expect)(() => (0, validation_1.validateSignatureData)({
                documentId: 'doc_123',
                provider: 'mock',
                certificate: invalidCertificate
            })).toThrow();
        });
    });
});
