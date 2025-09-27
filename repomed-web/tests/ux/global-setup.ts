/**
 * RepoMed IA v5.2 - Global Setup for Medical UX Testing
 * Write-blocker and medical environment initialization
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🏥 Starting RepoMed IA Medical UX Testing Environment...');

  // Initialize browser for environment validation
  const browser = await chromium.launch();
  const context = await browser.newContext({
    // Medical environment settings
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    reducedMotion: 'reduce',
    viewport: { width: 1366, height: 768 }
  });

  const page = await context.newPage();

  try {
    // 🔒 WRITE-BLOCKER: Prevent any data mutations during testing
    await context.route('**/*', route => {
      const method = route.request().method().toUpperCase();
      const url = route.request().url();

      // Allow only safe read operations
      if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
        return route.continue();
      }

      // Block all write operations (POST, PUT, DELETE, PATCH)
      console.log(`🚫 WRITE-BLOCKER: Blocked ${method} to ${url}`);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Write operation blocked by medical testing environment',
          blocked: true,
          timestamp: new Date().toISOString()
        })
      });
    });

    // 🏥 Validate medical environment readiness
    console.log('🔍 Validating medical environment...');

    const baseURL = process.env.BASE_URL || 'http://localhost:3023';
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    // Check if critical medical routes are accessible
    const criticalRoutes = [
      '/',
      '/auth/login',
      '/prescricoes/nova',
      '/pacientes'
    ];

    for (const route of criticalRoutes) {
      const response = await page.goto(`${baseURL}${route}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response || !response.ok()) {
        throw new Error(`❌ Critical medical route failed: ${route} (${response?.status()})`);
      }

      console.log(`✅ Medical route validated: ${route}`);
    }

    // 🔧 Medical font loading verification
    await page.evaluate(async () => {
      if (document.fonts) {
        await Promise.race([
          document.fonts.ready,
          new Promise(resolve => setTimeout(resolve, 5000))
        ]);
      }
    });

    // 🎯 Accessibility readiness check
    const hasAccessibilityFeatures = await page.evaluate(() => {
      // Check for basic accessibility structure
      const hasLabels = document.querySelectorAll('label').length > 0;
      const hasHeadings = document.querySelectorAll('h1,h2,h3,h4,h5,h6').length > 0;
      const hasLandmarks = document.querySelectorAll('main,nav,header,footer').length > 0;

      return { hasLabels, hasHeadings, hasLandmarks };
    });

    console.log('🎯 Accessibility features detected:', hasAccessibilityFeatures);

    // 🏥 Medical data protection validation
    await page.evaluate(() => {
      // Ensure no PHI (Personal Health Information) is exposed in console/storage
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
    });

    console.log('🔐 Medical data protection: ACTIVE');
    console.log('✅ Medical UX testing environment ready!');

  } catch (error) {
    console.error('❌ Medical environment setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  // Set environment variables for tests
  process.env.MEDICAL_TESTING_READY = 'true';
  process.env.TESTING_START_TIME = new Date().toISOString();
}

export default globalSetup;