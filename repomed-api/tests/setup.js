"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockDocument = exports.createMockUser = exports.createTestContext = void 0;
const vitest_1 = require("vitest");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/repomed_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.LOG_LEVEL = 'silent';
// Mock global console methods if needed
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
(0, vitest_1.beforeAll)(async () => {
    // Suprimir logs durante os testes
    console.error = (...args) => {
        if (!args[0]?.toString().includes('vitest')) {
            // Permitir apenas logs do Vitest
        }
    };
    console.warn = (...args) => {
        if (!args[0]?.toString().includes('vitest')) {
            // Permitir apenas logs do Vitest
        }
    };
    // Setup test database
    try {
        (0, child_process_1.execSync)('npm run db:migrate', {
            stdio: 'ignore',
            cwd: path_1.default.dirname((0, url_1.fileURLToPath)(import.meta.url || __dirname))
        });
    }
    catch (error) {
        console.log('Warning: Could not run migrations. Ensure database is set up.');
    }
});
(0, vitest_1.afterAll)(async () => {
    // Restaurar console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    // Cleanup test database if needed
    try {
        (0, child_process_1.execSync)('npm run db:reset', {
            stdio: 'ignore',
            cwd: path_1.default.dirname((0, url_1.fileURLToPath)(import.meta.url || __dirname))
        });
    }
    catch (error) {
        // Ignore cleanup errors
    }
});
(0, vitest_1.beforeEach)(() => {
    // Reset any mocks or state before each test
});
(0, vitest_1.afterEach)(() => {
    // Cleanup after each test
});
// Global test utilities
const createTestContext = () => ({
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
    }
});
exports.createTestContext = createTestContext;
const createMockUser = () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    crm: '12345-SP'
});
exports.createMockUser = createMockUser;
const createMockDocument = () => ({
    id: 'test-doc-id',
    templateId: 'tpl_001',
    fields: { patient_name: 'Test Patient' },
    patient: { name: 'Test Patient', cpf: '123.456.789-00' },
    status: 'draft'
});
exports.createMockDocument = createMockDocument;
