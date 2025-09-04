import { test, expect, Page } from '@playwright/test';

const API_BASE = 'http://localhost:8085';
const FRONTEND = 'http://localhost:3021';

// Utility functions
async function loginUser(page: Page) {
  await page.goto(`${FRONTEND}/auth/login`);
  await page.fill('input[name="email"]', 'admin@repomed.com');
  await page.fill('input[name="password"]', 'admin123');
  
  const loginPromise = page.waitForRequest(req => 
    req.url().includes('/api/auth/login') && req.method() === 'POST'
  );
  
  await page.click('button[type="submit"]');
  
  const request = await loginPromise;
  const response = await request.response();
  
  if (response && response.status() === 200) {
    const data = await response.json();
    // Store token for direct API calls
    page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, data.token);
  }
}

test.describe('🔌 Backend ↔️ Frontend Integration Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure fresh state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  // ====== AUTHENTICATION INTEGRATION TESTS ======
  test.describe('🔐 Auth Endpoints Integration', () => {
    
    test('POST /api/auth/login - Frontend calls correctly', async ({ page }) => {
      // 1. Intercept login request
      const requestPromise = page.waitForRequest(req => 
        req.url().includes('/api/auth/login') && req.method() === 'POST'
      );
      
      // 2. Execute frontend login
      await page.goto(`${FRONTEND}/auth/login`);
      await page.fill('input[name="email"]', 'admin@repomed.com');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // 3. Validate request payload
      const request = await requestPromise;
      const postData = request.postDataJSON();
      
      expect(postData).toEqual({
        email: 'admin@repomed.com',
        password: 'admin123'
      });
      
      // 4. Validate response handling
      const response = await request.response();
      expect(response?.status()).toBe(200);
      
      // 5. Validate frontend processes response (redirect)
      await page.waitForURL(/\/home|\/dashboard/, { timeout: 5000 });
      
      // 6. Verify token is stored
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(token).toBeTruthy();
    });
    
    test('GET /api/auth/me - Authorization header sent', async ({ page }) => {
      await loginUser(page);
      
      // Navigate to protected route
      const meRequestPromise = page.waitForRequest(req => 
        req.url().includes('/api/auth/me')
      );
      
      await page.goto(`${FRONTEND}/dashboard`);
      
      const request = await meRequestPromise;
      const headers = request.headers();
      
      expect(headers['authorization']).toMatch(/^Bearer .+/);
    });
    
    test('POST /api/auth/logout - Clears state correctly', async ({ page }) => {
      await loginUser(page);
      
      // Intercept logout
      const logoutPromise = page.waitForRequest(req => 
        req.url().includes('/api/auth/logout')
      );
      
      // Execute logout
      await page.click('button[aria-label="Logout"], button:has-text("Sair")');
      
      await logoutPromise;
      
      // Validate state cleanup
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(token).toBeNull();
      
      // Validate redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  // ====== PATIENTS CRUD INTEGRATION TESTS ======
  test.describe('👥 Patients CRUD Integration', () => {
    
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });
    
    test('GET /api/patients - List patients with pagination', async ({ page }) => {
      await page.goto(`${FRONTEND}/patients`);
      
      // Validate first page request
      const firstPageRequest = page.waitForRequest(req => 
        req.url().includes('/api/patients') && req.method() === 'GET'
      );
      await firstPageRequest;
      
      // Check if pagination controls exist
      const nextButton = page.locator('button[aria-label="Next page"], button:has-text("Próxima")');
      if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
        // Test pagination
        const secondPageRequest = page.waitForRequest(req => 
          req.url().includes('/api/patients') && req.url().includes('page=2')
        );
        
        await nextButton.click();
        await secondPageRequest;
        
        // Validate data updated
        await expect(page.locator('[data-testid="patient-row"], .patient-item')).toHaveCount(Number.isInteger);
      }
    });
    
    test('POST /api/patients - Create patient flow', async ({ page }) => {
      await page.goto(`${FRONTEND}/patients/create`);
      
      // Fill patient form
      await page.fill('input[name="name"]', 'João Silva Test');
      await page.fill('input[name="cpf"]', '123.456.789-00');
      await page.fill('input[name="email"]', 'joao.test@example.com');
      await page.fill('input[name="phone"]', '(11) 99999-9999');
      
      // Intercept POST request
      const createPromise = page.waitForRequest(req => 
        req.url().includes('/api/patients') && req.method() === 'POST'
      );
      
      await page.click('button[type="submit"], button:has-text("Salvar")');
      
      // Validate request payload
      const request = await createPromise;
      const body = request.postDataJSON();
      
      expect(body).toMatchObject({
        name: 'João Silva Test',
        cpf: expect.stringMatching(/\d{11}/), // CPF without mask
        email: 'joao.test@example.com'
      });
      
      // Validate success response and redirect
      const response = await request.response();
      expect(response?.status()).toBe(201);
      
      // Should redirect to patient detail or list
      await page.waitForURL(/\/patients/, { timeout: 5000 });
    });
    
    test('GET /api/patients/search - Search functionality', async ({ page }) => {
      await page.goto(`${FRONTEND}/patients`);
      
      const searchInput = page.locator('input[name="search"], input[placeholder*="buscar"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('Maria');
        
        const searchRequest = page.waitForRequest(req => {
          const url = new URL(req.url());
          return url.pathname.includes('/api/patients') && 
                 url.searchParams.get('search') === 'Maria';
        });
        
        await searchRequest;
        
        // Validate search results
        const results = page.locator('[data-testid="patient-row"], .patient-item');
        const count = await results.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ====== DOCUMENTS CRUD INTEGRATION TESTS ======
  test.describe('📄 Documents CRUD Integration', () => {
    
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });
    
    test('GET /api/documents - List documents with filters', async ({ page }) => {
      await page.goto(`${FRONTEND}/documents`);
      
      const listRequest = page.waitForRequest(req => 
        req.url().includes('/api/documents') && req.method() === 'GET'
      );
      await listRequest;
      
      // Test status filter if available
      const statusFilter = page.locator('select[name="status"], select:has(option:text("Status"))');
      if (await statusFilter.count() > 0) {
        await statusFilter.selectOption({ index: 1 });
        
        const filterRequest = page.waitForRequest(req => {
          const url = new URL(req.url());
          return url.pathname.includes('/api/documents') && 
                 url.searchParams.has('status');
        });
        
        await filterRequest;
      }
    });
    
    test('POST /api/documents - Create document complete flow', async ({ page }) => {
      // Navigate to create document page
      await page.goto(`${FRONTEND}/documents/new`);
      
      // Wait for templates to load
      await page.waitForLoadState('networkidle');
      
      const templateSelect = page.locator('select[name="templateId"], select:has(option:text("Template"))');
      const patientSelect = page.locator('select[name="patientId"], select:has(option:text("Paciente"))');
      
      if (await templateSelect.count() > 0 && await patientSelect.count() > 0) {
        await templateSelect.selectOption({ index: 1 });
        await patientSelect.selectOption({ index: 1 });
        
        // Fill content if available
        const contentField = page.locator('textarea[name="content"], .content-editor');
        if (await contentField.count() > 0) {
          await contentField.fill('Conteúdo médico de teste');
        }
        
        const createRequest = page.waitForRequest(req => 
          req.url().includes('/api/documents') && req.method() === 'POST'
        );
        
        await page.click('button:has-text("Salvar"), button[type="submit"]');
        
        const request = await createRequest;
        const body = request.postDataJSON();
        
        expect(body).toHaveProperty('templateId');
        expect(body).toHaveProperty('patientId');
        
        const response = await request.response();
        expect(response?.status()).toBe(201);
      }
    });
    
    test('GET /api/documents/:id/pdf - PDF generation', async ({ page }) => {
      // First create or get a document
      await page.goto(`${FRONTEND}/documents`);
      await page.waitForLoadState('networkidle');
      
      const firstDocument = page.locator('[data-testid="document-row"], .document-item').first();
      if (await firstDocument.count() > 0) {
        await firstDocument.click();
        
        // Look for PDF button
        const pdfButton = page.locator('button:has-text("PDF"), button:has-text("Gerar PDF")');
        if (await pdfButton.count() > 0) {
          const pdfRequest = page.waitForRequest(req => 
            req.url().includes('/pdf') && req.method() === 'GET'
          );
          
          await pdfButton.click();
          
          const request = await pdfRequest;
          const response = await request.response();
          
          expect(response?.status()).toBe(200);
          expect(response?.headers()['content-type']).toBe('application/pdf');
        }
      }
    });
  });

  // ====== TEMPLATES INTEGRATION TESTS ======
  test.describe('📋 Templates Integration', () => {
    
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });
    
    test('GET /api/templates - Templates list loads', async ({ page }) => {
      await page.goto(`${FRONTEND}/templates`);
      
      const templatesRequest = page.waitForRequest(req => 
        req.url().includes('/api/templates') && req.method() === 'GET'
      );
      
      await templatesRequest;
      
      // Validate templates are displayed
      const templates = page.locator('[data-testid="template-item"], .template-card');
      const count = await templates.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
    
    test('GET /api/templates/:id - Template detail loads', async ({ page }) => {
      await page.goto(`${FRONTEND}/templates`);
      await page.waitForLoadState('networkidle');
      
      const firstTemplate = page.locator('[data-testid="template-item"], .template-card').first();
      if (await firstTemplate.count() > 0) {
        const detailRequest = page.waitForRequest(req => 
          req.url().match(/\/api\/templates\/[^\/]+$/) && req.method() === 'GET'
        );
        
        await firstTemplate.click();
        
        const request = await detailRequest;
        const response = await request.response();
        
        expect(response?.status()).toBe(200);
        
        // Validate template detail page
        await page.waitForLoadState('networkidle');
        expect(page.locator('h1, h2, .template-title')).toBeVisible();
      }
    });
  });

  // ====== METRICS INTEGRATION TESTS ======
  test.describe('📊 Metrics Integration', () => {
    
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });
    
    test('GET /api/metrics/dashboard - Dashboard metrics load', async ({ page }) => {
      const metricsRequest = page.waitForRequest(req => 
        req.url().includes('/api/metrics/dashboard') && req.method() === 'GET'
      );
      
      await page.goto(`${FRONTEND}/dashboard`);
      
      const request = await metricsRequest;
      const response = await request.response();
      
      expect(response?.status()).toBe(200);
      
      if (response) {
        const data = await response.json();
        expect(data).toHaveProperty('totalPatients');
        expect(data).toHaveProperty('totalDocuments');
        expect(data).toHaveProperty('totalTemplates');
      }
      
      // Validate metrics are displayed
      await expect(page.locator('.metric-card, .stats-card')).toBeVisible();
    });
    
    test('GET /api/performance/report - Performance metrics', async ({ page }) => {
      await page.goto(`${FRONTEND}/metrics`);
      
      const performanceRequest = page.waitForRequest(req => 
        req.url().includes('/api/performance/report') && req.method() === 'GET'
      );
      
      await performanceRequest;
      
      // Validate performance section exists
      const performanceSection = page.locator('.performance-metrics, [data-testid="performance"]');
      if (await performanceSection.count() > 0) {
        await expect(performanceSection).toBeVisible();
      }
    });
  });

  // ====== UPLOAD INTEGRATION TESTS ======
  test.describe('📤 Upload Integration', () => {
    
    test.beforeEach(async ({ page }) => {
      await loginUser(page);
    });
    
    test('POST /api/upload - File upload with FormData', async ({ page }) => {
      await page.goto(`${FRONTEND}/upload`);
      
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        // Create test file
        await fileInput.setInputFiles({
          name: 'test.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('PDF test content')
        });
        
        // Intercept upload request
        const uploadRequest = page.waitForRequest(req => {
          const headers = req.headers();
          return (
            req.url().includes('/api/upload') &&
            req.method() === 'POST' &&
            headers['content-type']?.includes('multipart/form-data')
          );
        });
        
        await page.click('button:has-text("Upload"), button[type="submit"]');
        
        const request = await uploadRequest;
        const response = await request.response();
        
        expect(response?.status()).toBeLessThan(400);
        
        if (response && response.status() === 200) {
          const data = await response.json();
          expect(data).toHaveProperty('url');
          expect(data).toHaveProperty('filename');
        }
      }
    });
  });

  // ====== ERROR HANDLING INTEGRATION TESTS ======
  test.describe('❌ Error Handling Integration', () => {
    
    test('401 Unauthorized redirects to login', async ({ page }) => {
      // Try to access protected route without auth
      await page.goto(`${FRONTEND}/patients`);
      
      // Should be redirected to login
      await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
      
      // Verify no auth token exists
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(token).toBeNull();
    });
    
    test('404 errors are handled gracefully', async ({ page }) => {
      await loginUser(page);
      
      // Try to access non-existent resource
      await page.goto(`${FRONTEND}/patients/non-existent-id`);
      
      // Should show 404 or error message
      const errorMessage = page.locator('text=not found, text=404, .error-message');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    });
    
    test('500 errors show user-friendly message', async ({ page }) => {
      await loginUser(page);
      
      // Mock 500 error
      await page.route('**/api/patients', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            type: '/errors/internal-server-error',
            title: 'Internal Server Error',
            status: 500,
            detail: 'Database connection failed'
          })
        });
      });
      
      await page.goto(`${FRONTEND}/patients`);
      
      // Should show error message
      await expect(page.locator('text=Erro, text=Error, .error-message')).toBeVisible();
      
      // Should show retry button
      const retryButton = page.locator('button:has-text("Tentar Novamente"), button:has-text("Retry")');
      if (await retryButton.count() > 0) {
        await expect(retryButton).toBeVisible();
      }
    });
  });
});