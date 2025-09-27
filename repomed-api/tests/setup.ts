import { afterAll, beforeAll, afterEach, beforeEach } from 'vitest'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/repomed_test'
process.env.REDIS_URL = 'redis://localhost:6379/1'
process.env.JWT_SECRET = 'test-jwt-secret-key'
process.env.LOG_LEVEL = 'silent'

// Mock global console methods if needed
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(async () => {
  // Suprimir logs durante os testes
  console.error = (...args: any[]) => {
    if (!args[0]?.toString().includes('vitest')) {
      // Permitir apenas logs do Vitest
    }
  }
  
  console.warn = (...args: any[]) => {
    if (!args[0]?.toString().includes('vitest')) {
      // Permitir apenas logs do Vitest
    }
  }

  // Setup test database
  try {
    execSync('npm run db:migrate', { 
      stdio: 'ignore',
      cwd: path.dirname(fileURLToPath(import.meta.url || __dirname)) 
    })
  } catch (error) {
    console.log('Warning: Could not run migrations. Ensure database is set up.')
  }
})

afterAll(async () => {
  // Restaurar console methods
  console.error = originalConsoleError
  console.warn = originalConsoleWarn

  // Cleanup test database if needed
  try {
    execSync('npm run db:reset', { 
      stdio: 'ignore',
      cwd: path.dirname(fileURLToPath(import.meta.url || __dirname))
    })
  } catch (error) {
    // Ignore cleanup errors
  }
})

beforeEach(() => {
  // Reset any mocks or state before each test
})

afterEach(() => {
  // Cleanup after each test
})

// Global test utilities
export const createTestContext = () => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
  }
})

export const createMockUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  crm: '12345-SP'
})

export const createMockDocument = () => ({
  id: 'test-doc-id',
  templateId: 'tpl_001',
  fields: { patient_name: 'Test Patient' },
  patient: { name: 'Test Patient', cpf: '123.456.789-00' },
  status: 'draft'
})