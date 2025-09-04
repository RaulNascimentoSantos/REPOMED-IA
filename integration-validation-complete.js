// 🔌 Complete Integration Validation Script
// Tests Backend ↔️ Frontend connectivity manually

import { chromium } from 'playwright';
import axios from 'axios';
import { writeFileSync } from 'fs';

const API_BASE = 'http://localhost:8085';
const FRONTEND = 'http://localhost:3021';

// Integration test results
const results = {
  connectivity: [],
  authentication: [],
  endpoints: [],
  cors: [],
  errors: [],
  performance: [],
  summary: {}
};

async function testBackendConnectivity() {
  console.log('🔗 Testing Backend Connectivity...');
  
  try {
    const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    results.connectivity.push({
      test: 'Backend Health Check',
      status: 'success',
      data: response.data,
      responseTime: response.headers['response-time'] || 'N/A'
    });
    console.log('✅ Backend is reachable');
  } catch (error) {
    results.connectivity.push({
      test: 'Backend Health Check', 
      status: 'failed',
      error: error.message
    });
    console.log('❌ Backend connection failed:', error.message);
  }
}

async function testFrontendConnectivity() {
  console.log('🖥️  Testing Frontend Connectivity...');
  
  try {
    const response = await axios.get(FRONTEND, { timeout: 5000 });
    results.connectivity.push({
      test: 'Frontend Health Check',
      status: 'success',
      statusCode: response.status
    });
    console.log('✅ Frontend is reachable');
  } catch (error) {
    results.connectivity.push({
      test: 'Frontend Health Check',
      status: 'failed', 
      error: error.message
    });
    console.log('❌ Frontend connection failed:', error.message);
  }
}

async function testCORSConfiguration() {
  console.log('🌐 Testing CORS Configuration...');
  
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
      
      results.cors.push({
        endpoint,
        status: 'success',
        corsHeaders: {
          origin: response.headers['access-control-allow-origin'],
          methods: response.headers['access-control-allow-methods'],
          headers: response.headers['access-control-allow-headers']
        }
      });
      console.log(`✅ CORS OK for ${endpoint}`);
      
    } catch (error) {
      results.cors.push({
        endpoint,
        status: 'failed',
        error: error.response?.status === 404 ? 'Endpoint not found' : error.message
      });
      console.log(`⚠️  CORS test failed for ${endpoint}: ${error.message}`);
    }
  }
}

async function testAuthenticationFlow() {
  console.log('🔐 Testing Authentication Flow...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test login endpoint connectivity
    await page.goto(`${FRONTEND}/auth/login`);
    await page.waitForLoadState('networkidle');
    
    // Check if login form exists
    const emailInput = await page.locator('input[name="email"], input[type="email"]').count();
    const passwordInput = await page.locator('input[name="password"], input[type="password"]').count();
    
    if (emailInput > 0 && passwordInput > 0) {
      // Intercept login request
      const loginRequestPromise = page.waitForRequest(req => 
        req.url().includes('/api/auth/login') && req.method() === 'POST',
        { timeout: 10000 }
      );
      
      // Fill and submit login form
      await page.fill('input[name="email"], input[type="email"]', 'admin@repomed.com');
      await page.fill('input[name="password"], input[type="password"]', 'admin123');
      await page.click('button[type="submit"], button:has-text("Entrar")');
      
      try {
        const request = await loginRequestPromise;
        const response = await request.response();
        
        results.authentication.push({
          test: 'Login Request',
          status: response?.status() < 400 ? 'success' : 'failed',
          statusCode: response?.status(),
          endpoint: request.url(),
          method: request.method()
        });
        
        console.log(`✅ Login request: ${request.method()} ${request.url()} - ${response?.status()}`);
        
        // Test if redirected after login
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        
        if (!currentUrl.includes('/auth/login')) {
          results.authentication.push({
            test: 'Login Redirect',
            status: 'success',
            redirectedTo: currentUrl
          });
          console.log(`✅ Login redirect to: ${currentUrl}`);
        }
        
      } catch (error) {
        results.authentication.push({
          test: 'Login Request',
          status: 'failed',
          error: error.message
        });
        console.log(`❌ Login request failed: ${error.message}`);
      }
      
    } else {
      results.authentication.push({
        test: 'Login Form',
        status: 'failed',
        error: 'Login form not found'
      });
      console.log('❌ Login form not found');
    }
    
  } catch (error) {
    results.authentication.push({
      test: 'Authentication Flow',
      status: 'failed',
      error: error.message
    });
    console.log(`❌ Authentication test failed: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function testCriticalEndpoints() {
  console.log('🎯 Testing Critical Endpoints...');
  
  const criticalEndpoints = [
    { method: 'GET', path: '/api/templates', name: 'Templates List' },
    { method: 'GET', path: '/api/patients', name: 'Patients List' },  
    { method: 'GET', path: '/api/documents', name: 'Documents List' },
    { method: 'GET', path: '/api/metrics/dashboard', name: 'Dashboard Metrics' },
    { method: 'POST', path: '/api/auth/login', name: 'Login Endpoint', data: { email: 'test@test.com', password: 'test123' }},
  ];
  
  for (const endpoint of criticalEndpoints) {
    try {
      let response;
      const config = { timeout: 10000 };
      
      if (endpoint.method === 'POST') {
        response = await axios.post(`${API_BASE}${endpoint.path}`, endpoint.data, config);
      } else {
        response = await axios.get(`${API_BASE}${endpoint.path}`, config);
      }
      
      results.endpoints.push({
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        status: 'success',
        statusCode: response.status,
        responseTime: response.headers['response-time'] || 'N/A',
        dataSize: JSON.stringify(response.data).length
      });
      
      console.log(`✅ ${endpoint.name}: ${endpoint.method} ${endpoint.path} - ${response.status}`);
      
    } catch (error) {
      results.endpoints.push({
        name: endpoint.name,
        method: endpoint.method, 
        path: endpoint.path,
        status: 'failed',
        statusCode: error.response?.status || 0,
        error: error.message
      });
      
      console.log(`❌ ${endpoint.name}: ${error.response?.status || 'Connection failed'} - ${error.message}`);
    }
  }
}

async function testFrontendToBackendIntegration() {
  console.log('🔗 Testing Frontend → Backend Integration...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    const apiCalls = [];
    
    // Intercept all API calls
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const call = apiCalls.find(c => c.url === response.url());
        if (call) {
          call.status = response.status();
          call.responseTime = Date.now() - call.timestamp;
        }
      }
    });
    
    // Navigate through key pages
    const testPages = [
      '/',
      '/auth/login', 
      '/patients',
      '/documents',
      '/templates',
      '/dashboard'
    ];
    
    for (const testPage of testPages) {
      try {
        await page.goto(`${FRONTEND}${testPage}`, { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Allow API calls to complete
        
        console.log(`✅ Loaded page: ${testPage}`);
        
      } catch (error) {
        console.log(`⚠️  Failed to load page ${testPage}: ${error.message}`);
      }
    }
    
    // Analyze intercepted API calls
    const successfulCalls = apiCalls.filter(call => call.status && call.status < 400);
    const failedCalls = apiCalls.filter(call => call.status && call.status >= 400);
    const noResponseCalls = apiCalls.filter(call => !call.status);
    
    results.endpoints.push({
      name: 'Frontend Integration',
      status: 'success',
      totalApiCalls: apiCalls.length,
      successfulCalls: successfulCalls.length,
      failedCalls: failedCalls.length,
      noResponseCalls: noResponseCalls.length,
      avgResponseTime: successfulCalls.length > 0 ? 
        Math.round(successfulCalls.reduce((sum, call) => sum + (call.responseTime || 0), 0) / successfulCalls.length) : 0
    });
    
    console.log(`✅ Frontend Integration: ${successfulCalls.length}/${apiCalls.length} API calls successful`);
    
  } catch (error) {
    results.endpoints.push({
      name: 'Frontend Integration',
      status: 'failed',
      error: error.message
    });
    console.log(`❌ Frontend integration test failed: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function testPerformance() {
  console.log('⚡ Testing Performance...');
  
  const performanceTests = [
    { url: `${API_BASE}/health`, name: 'Backend Health' },
    { url: `${API_BASE}/api/templates`, name: 'Templates API' },
    { url: `${FRONTEND}/`, name: 'Frontend Home' },
  ];
  
  for (const test of performanceTests) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(test.url, { timeout: 10000 });
      const responseTime = Date.now() - startTime;
      
      results.performance.push({
        name: test.name,
        url: test.url,
        status: 'success',
        responseTime,
        size: JSON.stringify(response.data).length,
        rating: responseTime < 500 ? 'excellent' : responseTime < 1000 ? 'good' : responseTime < 2000 ? 'fair' : 'poor'
      });
      
      const emoji = responseTime < 500 ? '🚀' : responseTime < 1000 ? '✅' : responseTime < 2000 ? '⚠️' : '🐌';
      console.log(`${emoji} ${test.name}: ${responseTime}ms`);
      
    } catch (error) {
      results.performance.push({
        name: test.name,
        url: test.url,
        status: 'failed',
        error: error.message
      });
      console.log(`❌ ${test.name}: Failed - ${error.message}`);
    }
  }
}

async function generateReport() {
  console.log('📊 Generating Integration Report...');
  
  const totalTests = Object.values(results).flat().length - 1; // Exclude summary
  const successfulTests = Object.values(results).flat().filter(test => test.status === 'success').length;
  const failedTests = Object.values(results).flat().filter(test => test.status === 'failed').length;
  
  results.summary = {
    totalTests,
    successfulTests,
    failedTests,
    successRate: Math.round((successfulTests / totalTests) * 100),
    timestamp: new Date().toISOString(),
    backendUrl: API_BASE,
    frontendUrl: FRONTEND
  };
  
  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>Integration Report - RepoMed IA</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .metric { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; }
    .metric h3 { margin: 0 0 10px 0; color: #1e293b; }
    .metric .value { font-size: 2em; font-weight: bold; color: #2563eb; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
    .test-result { display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; border-radius: 6px; }
    .success { background: #dcfce7; border-left: 4px solid #16a34a; }
    .failed { background: #fee2e2; border-left: 4px solid #dc2626; }
    .endpoint { font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
    .badge { padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
    .badge.excellent { background: #16a34a; color: white; }
    .badge.good { background: #22c55e; color: white; }
    .badge.fair { background: #f59e0b; color: white; }
    .badge.poor { background: #dc2626; color: white; }
    .timestamp { text-align: center; margin-top: 30px; color: #64748b; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔌 Backend ↔️ Frontend Integration Report</h1>
      <p>RepoMed IA System Integration Validation</p>
    </div>
    
    <div class="summary">
      <div class="metric">
        <h3>Success Rate</h3>
        <div class="value">${results.summary.successRate}%</div>
      </div>
      <div class="metric">
        <h3>Total Tests</h3>
        <div class="value">${results.summary.totalTests}</div>
      </div>
      <div class="metric">
        <h3>Successful</h3>
        <div class="value" style="color: #16a34a;">${results.summary.successfulTests}</div>
      </div>
      <div class="metric">
        <h3>Failed</h3>
        <div class="value" style="color: #dc2626;">${results.summary.failedTests}</div>
      </div>
    </div>
    
    <div class="section">
      <h2>🔗 Connectivity Tests</h2>
      ${results.connectivity.map(test => `
        <div class="test-result ${test.status}">
          <span><strong>${test.test}</strong></span>
          <span>${test.status === 'success' ? '✅' : '❌'} ${test.error || 'OK'}</span>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h2>🔐 Authentication Tests</h2>
      ${results.authentication.map(test => `
        <div class="test-result ${test.status}">
          <span><strong>${test.test}</strong></span>
          <span>${test.status === 'success' ? '✅' : '❌'} ${test.error || test.statusCode || 'OK'}</span>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h2>🎯 Endpoint Tests</h2>
      ${results.endpoints.map(test => `
        <div class="test-result ${test.status}">
          <div>
            <strong>${test.name}</strong>
            ${test.path ? `<br><span class="endpoint">${test.method} ${test.path}</span>` : ''}
          </div>
          <div>
            ${test.status === 'success' ? '✅' : '❌'} 
            ${test.statusCode || ''} 
            ${test.responseTime ? `(${test.responseTime}ms)` : ''}
            ${test.error || ''}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h2>🌐 CORS Tests</h2>
      ${results.cors.map(test => `
        <div class="test-result ${test.status}">
          <span><span class="endpoint">${test.endpoint}</span></span>
          <span>${test.status === 'success' ? '✅' : '❌'} ${test.error || 'OK'}</span>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h2>⚡ Performance Tests</h2>
      ${results.performance.map(test => `
        <div class="test-result ${test.status}">
          <span><strong>${test.name}</strong></span>
          <div>
            ${test.status === 'success' ? '✅' : '❌'} 
            ${test.responseTime ? `${test.responseTime}ms` : ''}
            ${test.rating ? `<span class="badge ${test.rating}">${test.rating.toUpperCase()}</span>` : ''}
            ${test.error || ''}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="timestamp">
      Report generated: ${new Date(results.summary.timestamp).toLocaleString()}<br>
      Backend: <span class="endpoint">${API_BASE}</span> | Frontend: <span class="endpoint">${FRONTEND}</span>
    </div>
  </div>
</body>
</html>
  `;
  
  writeFileSync('integration-report.html', htmlReport);
  writeFileSync('integration-results.json', JSON.stringify(results, null, 2));
  
  console.log('\n📊 INTEGRATION VALIDATION COMPLETE!');
  console.log(`📈 Success Rate: ${results.summary.successRate}%`);
  console.log(`✅ Successful Tests: ${results.summary.successfulTests}/${results.summary.totalTests}`);
  console.log(`❌ Failed Tests: ${results.summary.failedTests}/${results.summary.totalTests}`);
  console.log(`📄 Report saved to: integration-report.html`);
  console.log(`📋 Raw data saved to: integration-results.json`);
}

// Main execution
async function runCompleteValidation() {
  console.log('🚀 Starting Complete Integration Validation...\n');
  
  await testBackendConnectivity();
  await testFrontendConnectivity();
  await testCORSConfiguration();
  await testAuthenticationFlow();
  await testCriticalEndpoints();
  await testFrontendToBackendIntegration();
  await testPerformance();
  await generateReport();
  
  console.log('\n🏁 Integration validation completed!');
}

runCompleteValidation().catch(console.error);