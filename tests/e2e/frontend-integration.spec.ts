import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker/locale/pt_BR'

const API_URL = process.env.API_URL || 'http://localhost:8082'
const WEB_URL = process.env.WEB_URL || 'http://localhost:3002'

test.describe('Frontend Integration Tests', () => {
  let testUser: any
  let authToken: string

  test.beforeAll(async ({ request }) => {
    // Create test user
    testUser = {
      email: faker.internet.email(),
      password: 'Test123!@#',
      name: faker.person.fullName(),
      crm: `${faker.number.int({ min: 10000, max: 99999 })}-SP`
    }

    const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: testUser
    })

    expect(registerResponse.ok()).toBeTruthy()
    const registerData = await registerResponse.json()
    authToken = registerData.token
  })

  test.describe('Patient Management Flow', () => {
    test('should create, view and edit patient', async ({ page }) => {
      await page.goto(`${WEB_URL}/patients`)
      
      // Mock authentication for frontend
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)
      
      await page.reload()

      // Navigate to create patient
      await page.click('text=Novo Paciente')
      await expect(page).toHaveURL(/.*\/patients\/create/)

      // Fill patient form
      const patientName = faker.person.fullName()
      const patientCPF = '123.456.789-00'
      const patientPhone = '(11) 98765-4321'
      const patientEmail = faker.internet.email()

      await page.fill('input[name="name"]', patientName)
      await page.fill('input[name="cpf"]', patientCPF)
      await page.fill('input[name="phone"]', patientPhone)
      await page.fill('input[name="email"]', patientEmail)
      await page.fill('input[name="birthDate"]', '1990-01-01')

      // Submit form
      await page.click('button[type="submit"]')

      // Should redirect to patient list
      await expect(page).toHaveURL(/.*\/patients/)
      
      // Should see success message
      await expect(page.locator('text=Paciente criado com sucesso')).toBeVisible({ timeout: 5000 })
      
      // Should find patient in list
      await expect(page.locator(`text=${patientName}`)).toBeVisible()

      // Click on patient to view details
      await page.click(`text=${patientName}`)
      await expect(page).toHaveURL(/.*\/patients\/.*/)
      
      // Verify patient details
      await expect(page.locator(`text=${patientName}`)).toBeVisible()
      await expect(page.locator(`text=${patientCPF}`)).toBeVisible()
      await expect(page.locator(`text=${patientEmail}`)).toBeVisible()

      // Edit patient
      await page.click('text=Editar')
      await expect(page).toHaveURL(/.*\/patients\/.*\/edit/)

      // Update patient name
      const updatedName = patientName + ' Updated'
      await page.fill('input[name="name"]', updatedName)
      await page.click('button[type="submit"]')

      // Should redirect back to patient details
      await expect(page).toHaveURL(/.*\/patients\/.*/)
      await expect(page.locator(`text=${updatedName}`)).toBeVisible()
    })
  })

  test.describe('Document Workflow', () => {
    test('should create prescription document', async ({ page, request }) => {
      // First create a patient via API
      const patientResponse = await request.post(`${API_URL}/api/patients`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Document Test Patient',
          cpf: '987.654.321-00',
          phone: '(11) 99999-9999',
          email: faker.internet.email()
        }
      })
      const patient = await patientResponse.json()

      await page.goto(`${WEB_URL}/prescription/create`)
      
      // Mock authentication
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)
      
      await page.reload()

      // Fill prescription form
      await page.selectOption('select[name="templateId"]', 'tpl_001')
      await page.selectOption('select[name="patientId"]', patient.id)

      // Add medications
      await page.click('button:has-text("Adicionar Medicamento")')
      await page.fill('input[name="medications.0.name"]', 'Dipirona 500mg')
      await page.fill('input[name="medications.0.dosage"]', '1 comprimido')
      await page.fill('input[name="medications.0.frequency"]', 'de 6/6 horas')

      // Add instructions
      await page.fill('textarea[name="instructions"]', 'Tomar com água, após as refeições')

      // Submit form
      await page.click('button[type="submit"]')

      // Should redirect to document view
      await expect(page).toHaveURL(/.*\/prescription\/.*/)
      
      // Verify document content
      await expect(page.locator('text=Document Test Patient')).toBeVisible()
      await expect(page.locator('text=Dipirona 500mg')).toBeVisible()
      await expect(page.locator('text=1 comprimido')).toBeVisible()
      await expect(page.locator('text=de 6/6 horas')).toBeVisible()

      // Verify document status
      await expect(page.locator('text=Rascunho')).toBeVisible()
    })

    test('should sign document', async ({ page, request }) => {
      // Create document via API
      const docResponse = await request.post(`${API_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          templateId: 'tpl_001',
          fields: {
            patient_name: 'Sign Test Patient',
            medications: [
              { name: 'Paracetamol', dosage: '750mg', frequency: '8/8h' }
            ]
          },
          patient: {
            name: 'Sign Test Patient',
            cpf: '111.222.333-44'
          }
        }
      })
      const document = await docResponse.json()

      await page.goto(`${WEB_URL}/prescription/${document.id}`)
      
      // Mock authentication
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)
      
      await page.reload()

      // Should see sign button
      await expect(page.locator('button:has-text("Assinar Documento")')).toBeVisible()

      // Click sign button
      await page.click('button:has-text("Assinar Documento")')

      // Should show signing modal/form
      await expect(page.locator('text=Assinar com Certificado Digital')).toBeVisible()

      // Select mock provider for testing
      await page.selectOption('select[name="provider"]', 'mock')
      
      // Confirm signature
      await page.click('button:has-text("Confirmar Assinatura")')

      // Should show success message
      await expect(page.locator('text=Documento assinado com sucesso')).toBeVisible({ timeout: 10000 })

      // Document status should change to signed
      await expect(page.locator('text=Assinado')).toBeVisible()

      // Should show signature info
      await expect(page.locator('text=ICP-Brasil')).toBeVisible()

      // Sign button should be disabled/hidden
      await expect(page.locator('button:has-text("Assinar Documento")')).toBeHidden()
    })
  })

  test.describe('Metrics Dashboard', () => {
    test('should display system metrics', async ({ page }) => {
      await page.goto(`${WEB_URL}/metrics`)
      
      // Mock authentication
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)
      
      await page.reload()

      // Should display metrics cards
      await expect(page.locator('text=Total de Documentos')).toBeVisible()
      await expect(page.locator('text=Documentos Assinados')).toBeVisible()
      await expect(page.locator('text=Documentos Pendentes')).toBeVisible()
      await expect(page.locator('text=Pacientes Ativos')).toBeVisible()

      // Should display performance metrics
      await expect(page.locator('text=Performance do Sistema')).toBeVisible()
      await expect(page.locator('text=Tempo de Resposta')).toBeVisible()
      await expect(page.locator('text=Taxa de Sucesso')).toBeVisible()

      // Should display cache metrics
      await expect(page.locator('text=Performance do Cache')).toBeVisible()

      // Test refresh functionality
      await page.click('button:has-text("Atualizar")')
      
      // Should show loading state briefly
      await expect(page.locator('[class*="animate-spin"]')).toBeVisible()
      await expect(page.locator('[class*="animate-spin"]')).toBeHidden({ timeout: 5000 })

      // Test period selector
      await page.selectOption('select', '30days')
      await expect(page.locator('option[value="30days"]:checked')).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto(`${WEB_URL}/patients`)
      
      // Mock authentication
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)

      // Intercept network requests and simulate error
      await page.route('**/api/**', route => {
        route.abort('internetdisconnected')
      })
      
      await page.reload()

      // Should show error message
      await expect(page.locator('text=Erro ao carregar')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('button:has-text("Tentar Novamente")')).toBeVisible()

      // Remove route interception
      await page.unroute('**/api/**')

      // Test retry functionality
      await page.click('button:has-text("Tentar Novamente")')
      
      // Should load successfully after retry
      await expect(page.locator('text=Pacientes')).toBeVisible({ timeout: 10000 })
    })

    test('should handle 404 errors', async ({ page }) => {
      await page.goto(`${WEB_URL}/patients/nonexistent-id`)
      
      // Mock authentication
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)

      // Should show 404 message
      await expect(page.locator('text=não encontrado')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('a:has-text("Voltar")')).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE

      await page.goto(`${WEB_URL}/patients`)
      
      // Mock authentication
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)
      
      await page.reload()

      // Should display mobile navigation
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

      // Should have responsive layout
      const container = page.locator('[data-testid="main-container"]')
      await expect(container).toHaveCSS('padding', /8px|16px/)

      // Should stack cards vertically on mobile
      const cards = page.locator('[data-testid="patient-card"]')
      const firstCard = cards.first()
      const secondCard = cards.nth(1)
      
      if (await cards.count() > 1) {
        const firstCardBox = await firstCard.boundingBox()
        const secondCardBox = await secondCard.boundingBox()
        
        // Cards should be stacked vertically
        expect(secondCardBox!.y).toBeGreaterThan(firstCardBox!.y + firstCardBox!.height)
      }
    })

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad

      await page.goto(`${WEB_URL}/metrics`)
      
      // Mock authentication
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)
      
      await page.reload()

      // Should display metrics in grid layout
      const metricsContainer = page.locator('[data-testid="metrics-grid"]')
      await expect(metricsContainer).toHaveCSS('display', /grid|flex/)

      // Should have appropriate spacing for tablet
      await expect(metricsContainer).toHaveCSS('gap', /16px|24px/)
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto(`${WEB_URL}/patients/create`)
      
      // Mock authentication
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)
      
      await page.reload()

      // Form should have proper labels
      await expect(page.locator('label[for="name"]')).toBeVisible()
      await expect(page.locator('input[name="name"]')).toHaveAttribute('aria-required', 'true')

      // Required fields should be marked
      await expect(page.locator('input[name="cpf"]')).toHaveAttribute('aria-required', 'true')

      // Form should have proper heading structure
      await expect(page.locator('h1')).toBeVisible()
      
      // Submit button should have descriptive text
      await expect(page.locator('button[type="submit"]')).toContainText(/Criar|Salvar/)
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(`${WEB_URL}/patients`)
      
      // Mock authentication
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token)
      }, authToken)
      
      await page.reload()

      // Should be able to navigate with Tab key
      await page.keyboard.press('Tab')
      await expect(page.locator(':focus')).toBeVisible()

      // Navigation links should be focusable
      const navigationLinks = page.locator('nav a')
      const linkCount = await navigationLinks.count()
      
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        await page.keyboard.press('Tab')
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()
      }
    })
  })
})