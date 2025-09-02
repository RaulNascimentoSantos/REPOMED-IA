import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker/locale/pt_BR'

const API_URL = 'http://localhost:3003'
const WEB_URL = 'http://localhost:3002'

test.describe('RepoMed IA - E2E Tests', () => {
  
  let authToken: string
  let userId: string
  let documentId: string
  
  test.beforeAll(async ({ request }) => {
    // Register a test user
    const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: {
        email: faker.internet.email(),
        password: 'Test123!@#',
        name: faker.person.fullName(),
        crm: `${faker.number.int({ min: 10000, max: 99999 })}-SP`
      }
    })
    
    const registerData = await registerResponse.json()
    authToken = registerData.token
    userId = registerData.user.id
  })
  
  test.describe('Testes de Interface', () => {
    
    test('Deve carregar a homepage corretamente', async ({ page }) => {
      await page.goto(WEB_URL)
      
      // Verificar título
      await expect(page).toHaveTitle(/RepoMed IA/)
      
      // Verificar elementos principais
      await expect(page.locator('h1')).toContainText('RepoMed IA')
      await expect(page.locator('text=Sistema de Documentos Médicos')).toBeVisible()
      await expect(page.locator('text=✅ Sistema Funcionando!')).toBeVisible()
    })
    
    test('Deve navegar para página de criação de documento', async ({ page }) => {
      await page.goto(`${WEB_URL}/documents/create`)
      
      // Verificar se carregou a página
      await expect(page.locator('h1')).toContainText('Criar Novo Documento')
      
      // Verificar campos do formulário
      await expect(page.locator('label:has-text("Nome do Paciente")')).toBeVisible()
      await expect(page.locator('label:has-text("Nome do Médico")')).toBeVisible()
      await expect(page.locator('label:has-text("CRM")')).toBeVisible()
    })
  })
  
  test.describe('Testes de API', () => {
    
    test('API deve estar funcionando', async ({ request }) => {
      const response = await request.get(`${API_URL}/health`)
      const data = await response.json()
      
      expect(response.ok()).toBeTruthy()
      expect(data.status).toBe('healthy')
      expect(data.services.database).toBe('connected')
    })
    
    test('Deve listar templates médicos', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/templates`)
      const data = await response.json()
      
      expect(response.ok()).toBeTruthy()
      expect(data.data).toHaveLength(5)
      expect(data.data[0].name).toBe('Receita Simples')
    })
    
    test('Deve criar um documento', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/documents`, {
        data: {
          templateId: 'tpl_001',
          fields: {
            patient_name: 'João da Silva',
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
            name: 'João da Silva',
            cpf: '123.456.789-00'
          }
        }
      })
      
      const data = await response.json()
      documentId = data.id
      
      expect(response.ok()).toBeTruthy()
      expect(data.id).toBeTruthy()
      expect(data.status).toBe('draft')
      expect(data.hash).toBeTruthy()
      expect(data.qrCode).toBeTruthy()
    })
    
    test('Deve assinar um documento', async ({ request }) => {
      // Criar documento primeiro
      const createResponse = await request.post(`${API_URL}/api/documents`, {
        data: {
          templateId: 'tpl_001',
          fields: { patient_name: 'Test Patient' },
          patient: { name: 'Test Patient' }
        }
      })
      
      const doc = await createResponse.json()
      
      // Assinar documento
      const signResponse = await request.post(`${API_URL}/api/documents/${doc.id}/sign`, {
        data: { provider: 'mock' }
      })
      
      const signData = await signResponse.json()
      
      expect(signResponse.ok()).toBeTruthy()
      expect(signData.document.status).toBe('signed')
      expect(signData.signature.signature).toBeTruthy()
      expect(signData.signature.certificate.issuer).toContain('ICP-Brasil')
    })
  })
  
  test.describe('Validações de Sistema', () => {
    
    test('Deve validar hash de documento', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/documents`, {
        data: {
          templateId: 'tpl_001',
          fields: { patient_name: 'Hash Test' },
          patient: { name: 'Hash Test' }
        }
      })
      
      const doc1 = await response.json()
      
      // Criar documento idêntico
      const response2 = await request.post(`${API_URL}/api/documents`, {
        data: {
          templateId: 'tpl_001',
          fields: { patient_name: 'Hash Test' },
          patient: { name: 'Hash Test' }
        }
      })
      
      const doc2 = await response2.json()
      
      // Hashes devem ser iguais para dados iguais
      expect(doc1.hash).toBe(doc2.hash)
    })
    
    test('Deve gerar métricas do sistema', async ({ request }) => {
      const response = await request.get(`${API_URL}/metrics`)
      const metrics = await response.json()
      
      expect(response.ok()).toBeTruthy()
      expect(metrics.documents_total).toBeGreaterThanOrEqual(0)
      expect(metrics.templates_total).toBe(5)
      expect(metrics.api_latency_p95).toBeGreaterThan(0)
    })
  })
})

// Testes de Performance
test.describe('Performance Tests', () => {
  
  test('API response time should be under 200ms', async ({ request }) => {
    const iterations = 10
    const times: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now()
      await request.get(`${API_URL}/api/templates`)
      const end = Date.now()
      times.push(end - start)
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    expect(avgTime).toBeLessThan(200)
  })
  
  test('Should handle concurrent requests', async ({ request }) => {
    const promises = Array.from({ length: 20 }, () => 
      request.get(`${API_URL}/api/templates`)
    )
    
    const responses = await Promise.all(promises)
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy()
    })
  })
})