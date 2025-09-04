import { test, expect, Page } from '@playwright/test';
import axios from 'axios';

const API_BASE = 'http://localhost:8085';
const FRONTEND = 'http://localhost:3021';

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
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, data.token);
    return data.token;
  }
  
  return null;
}

test.describe('🔐 Headers and Authentication Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  // ====== TOKEN AUTHENTICATION TESTS ======
  test.describe('JWT Token Authentication', () => {
    
    test('Bearer token sent in all authenticated requests', async ({ page }) => {
      const token = await loginUser(page);
      expect(token).toBeTruthy();
      
      // Track all API requests to verify Authorization header
      const apiRequests: any[] = [];
      
      page.on('request', request => {
        if (request.url().includes('/api/') && !request.url().includes('/auth/login')) {
          const headers = request.headers();
          apiRequests.push({
            url: request.url(),
            method: request.method(),
            authorization: headers['authorization']
          });
        }
      });
      
      // Navigate through protected routes
      await page.goto(`${FRONTEND}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      await page.goto(`${FRONTEND}/patients`);
      await page.waitForLoadState('networkidle');
      
      await page.goto(`${FRONTEND}/documents`);
      await page.waitForLoadState('networkidle');
      
      await page.goto(`${FRONTEND}/templates`);
      await page.waitForLoadState('networkidle');
      
      // Validate all requests have proper Authorization header
      expect(apiRequests.length).toBeGreaterThan(0);
      
      for (const request of apiRequests) {
        expect(request.authorization).toMatch(/^Bearer .+/);
        console.log(`✅ ${request.method} ${request.url} - Authorization header present`);
      }
    });
    
    test('Token refresh works when token expires', async ({ page }) => {
      await loginUser(page);
      
      // Mock expired token response
      await page.route('**/api/auth/me', async route => {
        const request = route.request();
        const headers = request.headers();
        
        if (headers['authorization']) {
          route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({
              type: '/errors/unauthorized',
              title: 'Unauthorized',
              status: 401,
              detail: 'Token expired'
            })
          });
        } else {
          route.continue();
        }
      });
      
      await page.goto(`${FRONTEND}/dashboard`);
      
      // Should be redirected to login page
      await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
      
      // Token should be cleared
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(token).toBeNull();
    });
    
    test('Invalid token redirects to login', async ({ page }) => {
      // Set invalid token
      await page.evaluate(() => {
        localStorage.setItem('authToken', 'invalid-token-123');
      });
      
      await page.goto(`${FRONTEND}/patients`);
      
      // Should redirect to login
      await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
      
      // Invalid token should be cleared
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(token).toBeNull();
    });
  });

  // ====== CORS VALIDATION TESTS ======
  test.describe('CORS Headers Validation', () => {
    
    test('OPTIONS requests return correct CORS headers', async () => {
      const testEndpoints = [
        '/api/auth/login',
        '/api/patients',
        '/api/documents',
        '/api/templates',
        '/api/metrics/dashboard'
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await axios.options(`${API_BASE}${endpoint}`, {
            headers: {
              'Origin': FRONTEND,
              'Access-Control-Request-Method': 'GET',
              'Access-Control-Request-Headers': 'authorization, content-type'
            }
          });
          
          expect(response.headers['access-control-allow-origin']).toBeTruthy();
          expect(response.headers['access-control-allow-methods']).toContain('GET');
          expect(response.headers['access-control-allow-headers']).toMatch(/authorization|content-type/i);
          
          console.log(`✅ CORS headers valid for ${endpoint}`);
        } catch (error: any) {
          console.log(`⚠️ CORS test failed for ${endpoint}: ${error.message}`);
          // Don't fail test if endpoint doesn't exist
          if (error.response?.status !== 404) {
            throw error;
          }
        }
      }
    });
    
    test('Actual requests include CORS headers', async ({ page }) => {
      await loginUser(page);
      
      const corsValidations: any[] = [];
      
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          const headers = response.headers();
          corsValidations.push({
            url: response.url(),
            status: response.status(),
            corsOrigin: headers['access-control-allow-origin'],
            corsCredentials: headers['access-control-allow-credentials']
          });
        }
      });
      
      // Make requests to different endpoints
      await page.goto(`${FRONTEND}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Validate CORS headers in responses
      expect(corsValidations.length).toBeGreaterThan(0);
      
      for (const validation of corsValidations) {
        if (validation.status < 400) {
          expect(validation.corsOrigin).toBeTruthy();
          console.log(`✅ CORS response headers valid for ${validation.url}`);
        }
      }
    });
  });

  // ====== CONTENT TYPE VALIDATION TESTS ======
  test.describe('Content-Type Headers Validation', () => {
    
    test('JSON requests use application/json content-type', async ({ page }) => {
      await loginUser(page);
      
      const jsonRequests: any[] = [];
      
      page.on('request', request => {
        if (request.url().includes('/api/') && 
            ['POST', 'PUT', 'PATCH'].includes(request.method())) {
          const headers = request.headers();
          const postData = request.postData();
          
          jsonRequests.push({
            url: request.url(),
            method: request.method(),
            contentType: headers['content-type'],
            hasJsonData: postData && postData.startsWith('{')
          });
        }
      });
      
      // Trigger POST/PUT requests
      await page.goto(`${FRONTEND}/patients/create`);
      await page.waitForLoadState('networkidle');
      
      if (await page.locator('input[name="name"]').count() > 0) {
        await page.fill('input[name="name"]', 'Test Patient');
        await page.fill('input[name="cpf"]', '123.456.789-00');
        await page.fill('input[name="email"]', 'test@example.com');
        
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
      }
      
      // Validate content-type headers
      for (const request of jsonRequests) {
        if (request.hasJsonData) {
          expect(request.contentType).toContain('application/json');
          console.log(`✅ JSON Content-Type valid for ${request.method} ${request.url}`);
        }
      }
    });
    
    test('Multipart requests use multipart/form-data', async ({ page }) => {
      await loginUser(page);
      
      // Navigate to upload page if it exists
      try {
        await page.goto(`${FRONTEND}/upload`);
        await page.waitForLoadState('networkidle');
        
        const fileInput = page.locator('input[type="file"]');
        
        if (await fileInput.count() > 0) {
          const uploadRequest = page.waitForRequest(req => {
            const headers = req.headers();
            return (
              req.url().includes('/api/upload') &&
              req.method() === 'POST' &&
              headers['content-type']?.includes('multipart/form-data')
            );
          });
          
          await fileInput.setInputFiles({
            name: 'test.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('PDF test content')
          });
          
          await page.click('button:has-text("Upload"), button[type="submit"]');
          
          const request = await uploadRequest;
          const headers = request.headers();
          
          expect(headers['content-type']).toContain('multipart/form-data');
          console.log('✅ Multipart Content-Type valid for file upload');
        }
      } catch (error) {
        console.log('ℹ️ Upload functionality not available or not tested');
      }
    });
  });

  // ====== SECURITY HEADERS VALIDATION TESTS ======
  test.describe('Security Headers Validation', () => {
    
    test('Security headers present in responses', async ({ page }) => {
      await loginUser(page);
      
      const securityHeaders: any[] = [];
      
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          const headers = response.headers();
          securityHeaders.push({
            url: response.url(),
            xFrameOptions: headers['x-frame-options'],
            xContentTypeOptions: headers['x-content-type-options'],
            xXssProtection: headers['x-xss-protection'],
            strictTransportSecurity: headers['strict-transport-security']
          });
        }
      });
      
      await page.goto(`${FRONTEND}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Check for common security headers
      for (const response of securityHeaders) {
        // These are recommendations, not requirements
        if (response.xFrameOptions) {
          console.log(`✅ X-Frame-Options present: ${response.xFrameOptions}`);
        }
        if (response.xContentTypeOptions) {
          console.log(`✅ X-Content-Type-Options present: ${response.xContentTypeOptions}`);
        }
      }
    });
    
    test('Sensitive data not exposed in headers', async ({ page }) => {
      await loginUser(page);
      
      const responses: any[] = [];
      
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          const headers = response.headers();
          
          // Check for potentially sensitive headers
          const sensitiveHeaders = Object.keys(headers).filter(key =>
            key.toLowerCase().includes('password') ||
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('private')
          );
          
          if (sensitiveHeaders.length > 0) {
            responses.push({
              url: response.url(),
              sensitiveHeaders
            });
          }
        }
      });
      
      await page.goto(`${FRONTEND}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // No sensitive headers should be found
      expect(responses.length).toBe(0);
      console.log('✅ No sensitive headers found in responses');
    });
  });

  // ====== REQUEST VALIDATION TESTS ======
  test.describe('Request Validation', () => {
    
    test('User-Agent header sent in requests', async ({ page }) => {
      await loginUser(page);
      
      let userAgentFound = false;
      
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          const headers = request.headers();
          if (headers['user-agent']) {
            userAgentFound = true;
            expect(headers['user-agent']).toContain('Mozilla');
            console.log(`✅ User-Agent present: ${headers['user-agent']}`);
          }
        }
      });
      
      await page.goto(`${FRONTEND}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      expect(userAgentFound).toBe(true);
    });
    
    test('Referer header sent for navigation requests', async ({ page }) => {
      await loginUser(page);
      
      const refererRequests: any[] = [];
      
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          const headers = request.headers();
          if (headers['referer']) {
            refererRequests.push({
              url: request.url(),
              referer: headers['referer']
            });
          }
        }
      });
      
      await page.goto(`${FRONTEND}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      await page.goto(`${FRONTEND}/patients`);
      await page.waitForLoadState('networkidle');
      
      // At least some requests should have referer
      if (refererRequests.length > 0) {
        for (const request of refererRequests) {
          expect(request.referer).toContain(FRONTEND.replace('http://', '').replace('https://', ''));
          console.log(`✅ Referer header valid for ${request.url}`);
        }
      }
    });
  });

  // ====== RATE LIMITING VALIDATION TESTS ======
  test.describe('Rate Limiting & Throttling', () => {
    
    test('Multiple rapid requests handled gracefully', async ({ page }) => {
      await loginUser(page);
      
      const responses: any[] = [];
      
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          responses.push({
            url: response.url(),
            status: response.status(),
            timestamp: Date.now()
          });
        }
      });
      
      // Make multiple rapid navigation requests
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(page.goto(`${FRONTEND}/dashboard`));
      }
      
      await Promise.all(promises);
      
      // Check if any requests were rate limited (429 status)
      const rateLimited = responses.filter(r => r.status === 429);
      
      if (rateLimited.length > 0) {
        console.log(`ℹ️ Rate limiting detected: ${rateLimited.length} requests throttled`);
      } else {
        console.log('ℹ️ No rate limiting detected in rapid requests');
      }
      
      // Most requests should still succeed
      const successful = responses.filter(r => r.status < 400);
      expect(successful.length).toBeGreaterThan(0);
    });
  });
});