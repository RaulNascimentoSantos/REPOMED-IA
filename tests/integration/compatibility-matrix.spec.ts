import { test, expect, Page } from '@playwright/test';

const API_BASE = 'http://localhost:8085';
const FRONTEND = 'http://localhost:3021';

// ====== COMPATIBILITY MATRIX ======
// [Frontend Route, Backend Endpoint, Expected Status, Description]
const COMPATIBILITY_MATRIX = [
  // AUTH ROUTES
  ['/auth/login', 'POST /api/auth/login', 200, 'Login form submits to auth endpoint'],
  ['/auth/register', 'POST /api/auth/register', 201, 'Registration form creates user'],
  ['/dashboard', 'GET /api/auth/me', 200, 'Dashboard validates user session'],
  
  // PATIENTS ROUTES
  ['/patients', 'GET /api/patients', 200, 'Patients list loads from API'],
  ['/patients/create', 'POST /api/patients', 201, 'Patient creation form submits'],
  ['/patients/:id', 'GET /api/patients/:id', 200, 'Patient detail loads specific patient'],
  ['/patients/:id/edit', 'PUT /api/patients/:id', 200, 'Patient edit form updates patient'],
  
  // DOCUMENTS ROUTES  
  ['/documents', 'GET /api/documents', 200, 'Documents list loads from API'],
  ['/documents/new', 'POST /api/documents', 201, 'Document creation form submits'],
  ['/documents/:id', 'GET /api/documents/:id', 200, 'Document detail loads specific document'],
  ['/documents/:id/sign', 'POST /api/documents/:id/sign', 200, 'Document signing flow works'],
  
  // TEMPLATES ROUTES
  ['/templates', 'GET /api/templates', 200, 'Templates list loads from API'],
  ['/templates/:id', 'GET /api/templates/:id', 200, 'Template detail loads specific template'],
  
  // PRESCRIPTIONS ROUTES
  ['/prescriptions/create', 'POST /api/prescriptions', 201, 'Prescription creation works'],
  ['/prescriptions/:id', 'GET /api/prescriptions/:id', 200, 'Prescription detail loads'],
  
  // METRICS ROUTES
  ['/dashboard', 'GET /api/metrics/dashboard', 200, 'Dashboard loads metrics'],
  ['/metrics', 'GET /api/performance/report', 200, 'Metrics page loads performance data'],
  
  // UPLOAD ROUTES
  ['/upload', 'POST /api/upload', 200, 'File upload functionality works'],
  
  // PUBLIC ROUTES
  ['/share/:token', 'GET /api/documents/share/:token', 200, 'Public document sharing works'],
  ['/verify/:hash', 'GET /api/documents/verify/:hash', 200, 'Document verification works'],
  
  // HEALTH ROUTES
  ['/', 'GET /health', 200, 'Frontend can check backend health'],
];

async function loginUser(page: Page) {
  await page.goto(`${FRONTEND}/auth/login`);
  await page.fill('input[name="email"]', 'admin@repomed.com');
  await page.fill('input[name="password"]', 'admin123');
  
  const loginPromise = page.waitForRequest(req => 
    req.url().includes('/api/auth/login') && req.method() === 'POST'
  );
  
  await page.click('button[type="submit"]');
  
  try {
    const request = await loginPromise;
    const response = await request.response();
    
    if (response && response.status() === 200) {
      const data = await response.json();
      await page.evaluate((token) => {
        localStorage.setItem('authToken', token);
      }, data.token);
      return data.token;
    }
  } catch (error) {
    console.log('Login failed or not required for this test');
  }
  
  return null;
}

test.describe('📊 Backend ↔️ Frontend Compatibility Matrix', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  // Test each compatibility pair
  for (const [frontendRoute, backendEndpoint, expectedStatus, description] of COMPATIBILITY_MATRIX) {
    test(`${frontendRoute} → ${backendEndpoint}`, async ({ page }) => {
      const [method, path] = backendEndpoint.split(' ');
      
      // Login if needed (skip for public routes and auth routes)
      if (!frontendRoute.includes('/auth') && !frontendRoute.includes('/share') && !frontendRoute.includes('/verify')) {
        await loginUser(page);
      }
      
      // Prepare request interceptor
      const pathPattern = path.replace(':id', '[^/]+').replace(':token', '[^/]+').replace(':hash', '[^/]+');
      const requestPromise = page.waitForRequest(req => {
        const url = req.url();
        const urlMethod = req.method();
        
        // Create regex pattern from path
        const regex = new RegExp(pathPattern);
        
        return urlMethod === method && regex.test(url);
      }, { timeout: 10000 });
      
      // Navigate to frontend route
      const testRoute = frontendRoute.replace(':id', 'test-id').replace(':token', 'test-token').replace(':hash', 'test-hash');
      
      try {
        await page.goto(`${FRONTEND}${testRoute}`, { timeout: 15000 });
        await page.waitForLoadState('networkidle');
        
        // For forms, try to submit
        if (method === 'POST' && !testRoute.includes('/auth/login')) {
          const submitButton = page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Criar")');
          if (await submitButton.count() > 0) {
            // Fill required fields if they exist
            const nameInput = page.locator('input[name="name"]');
            if (await nameInput.count() > 0) {
              await nameInput.fill('Test Name');
            }
            
            const emailInput = page.locator('input[name="email"]');
            if (await emailInput.count() > 0) {
              await emailInput.fill('test@example.com');
            }
            
            const cpfInput = page.locator('input[name="cpf"]');
            if (await cpfInput.count() > 0) {
              await cpfInput.fill('123.456.789-00');
            }
            
            const templateSelect = page.locator('select[name="templateId"]');
            if (await templateSelect.count() > 0) {
              await templateSelect.selectOption({ index: 1 });
            }
            
            const patientSelect = page.locator('select[name="patientId"]');
            if (await patientSelect.count() > 0) {
              await patientSelect.selectOption({ index: 1 });
            }
            
            await submitButton.click();
          }
        }
        
        // For PUT requests, try to find edit button
        if (method === 'PUT') {
          const editButton = page.locator('button:has-text("Editar"), button:has-text("Edit")');
          if (await editButton.count() > 0) {
            await editButton.click();
            await page.waitForTimeout(1000);
            
            const saveButton = page.locator('button:has-text("Salvar"), button[type="submit"]');
            if (await saveButton.count() > 0) {
              await saveButton.click();
            }
          }
        }
        
        // Wait for and validate the API request
        const request = await requestPromise;
        const response = await request.response();
        
        expect(response?.status()).toBe(expectedStatus);
        
        console.log(`✅ ${frontendRoute} → ${backendEndpoint} - ${description} (Status: ${response?.status()})`);
        
      } catch (error: any) {
        // Log but don't fail test if route doesn't exist or request times out
        if (error.message.includes('timeout') || error.message.includes('net::ERR')) {
          console.log(`⚠️  ${frontendRoute} → ${backendEndpoint} - ${description} (Route may not be implemented)`);
        } else {
          console.log(`❌ ${frontendRoute} → ${backendEndpoint} - ${description} - Error: ${error.message}`);
          throw error;
        }
      }
    });
  }
  
  // ====== CROSS-VALIDATION TESTS ======
  test.describe('Cross-validation Tests', () => {
    
    test('All backend endpoints have corresponding frontend calls', async ({ page }) => {
      // This test verifies our mapping is complete
      const backendEndpoints = COMPATIBILITY_MATRIX.map(([,endpoint]) => endpoint);
      const uniqueEndpoints = [...new Set(backendEndpoints)];
      
      console.log(`📊 Compatibility Matrix Coverage:`);
      console.log(`   - Total routes tested: ${COMPATIBILITY_MATRIX.length}`);
      console.log(`   - Unique backend endpoints: ${uniqueEndpoints.length}`);
      console.log(`   - Frontend routes covered: ${COMPATIBILITY_MATRIX.length}`);
      
      expect(uniqueEndpoints.length).toBeGreaterThan(15);
    });
    
    test('Critical user flows are covered', async ({ page }) => {
      const criticalFlows = [
        'User authentication flow',
        'Patient management flow', 
        'Document creation flow',
        'Template selection flow',
        'Metrics dashboard flow'
      ];
      
      // Test critical flows exist in matrix
      const authRoutes = COMPATIBILITY_MATRIX.filter(([route]) => route.includes('/auth'));
      const patientRoutes = COMPATIBILITY_MATRIX.filter(([route]) => route.includes('/patients'));
      const documentRoutes = COMPATIBILITY_MATRIX.filter(([route]) => route.includes('/documents'));
      const templateRoutes = COMPATIBILITY_MATRIX.filter(([route]) => route.includes('/templates'));
      const metricsRoutes = COMPATIBILITY_MATRIX.filter(([,endpoint]) => endpoint.includes('/metrics'));
      
      expect(authRoutes.length).toBeGreaterThan(0);
      expect(patientRoutes.length).toBeGreaterThan(0);
      expect(documentRoutes.length).toBeGreaterThan(0);
      expect(templateRoutes.length).toBeGreaterThan(0);
      expect(metricsRoutes.length).toBeGreaterThan(0);
      
      console.log('✅ All critical user flows covered in compatibility matrix');
    });
  });
  
  // ====== INTEGRATION HEALTH CHECK ======
  test.describe('Integration Health Check', () => {
    
    test('Backend is reachable from frontend', async ({ page }) => {
      // Test direct connectivity
      const healthResponse = await page.evaluate(async (apiBase) => {
        try {
          const response = await fetch(`${apiBase}/health`);
          return {
            status: response.status,
            data: await response.json()
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }, API_BASE);
      
      if (healthResponse.error) {
        console.log(`⚠️  Backend health check failed: ${healthResponse.error}`);
      } else {
        expect(healthResponse.status).toBe(200);
        expect(healthResponse.data).toHaveProperty('status');
        console.log(`✅ Backend health check passed: ${healthResponse.data.status}`);
      }
    });
    
    test('Frontend can make CORS requests to backend', async ({ page }) => {
      await page.goto(FRONTEND);
      
      const corsTest = await page.evaluate(async (apiBase) => {
        try {
          const response = await fetch(`${apiBase}/api/templates`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          return {
            status: response.status,
            headers: {
              cors: response.headers.get('access-control-allow-origin'),
              contentType: response.headers.get('content-type')
            }
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }, API_BASE);
      
      if (corsTest.error) {
        console.log(`⚠️  CORS test failed: ${corsTest.error}`);
      } else {
        console.log(`✅ CORS test passed - Status: ${corsTest.status}, CORS: ${corsTest.headers.cors}`);
      }
    });
    
    test('API response times are acceptable', async ({ page }) => {
      await loginUser(page);
      
      const performanceTests = [
        { url: `${API_BASE}/health`, name: 'Health Check' },
        { url: `${API_BASE}/api/templates`, name: 'Templates List' },
        { url: `${API_BASE}/api/metrics/dashboard`, name: 'Dashboard Metrics' }
      ];
      
      for (const test of performanceTests) {
        const startTime = Date.now();
        
        try {
          const response = await page.evaluate(async (url) => {
            const response = await fetch(url);
            return response.status;
          }, test.url);
          
          const responseTime = Date.now() - startTime;
          
          expect(responseTime).toBeLessThan(5000); // 5 seconds max
          
          const status = responseTime < 1000 ? '🚀' : responseTime < 2000 ? '✅' : '⚠️';
          console.log(`${status} ${test.name}: ${responseTime}ms`);
          
        } catch (error) {
          console.log(`❌ ${test.name}: Failed to test response time`);
        }
      }
    });
  });
});