import { defineConfig, devices } from '@playwright/test';

/**
 * RepoMed IA v5.2 - Playwright Configuration
 * Medical-grade UX testing with AAA accessibility compliance
 */

export default defineConfig({
  testDir: './tests/ux',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  // Global setup for medical testing environment
  globalSetup: require.resolve('./tests/ux/global-setup.ts'),

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3023',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Medical accessibility testing optimizations
    actionTimeout: 30000,
    navigationTimeout: 60000,

    // Viewport for medical professionals
    viewport: { width: 1280, height: 720 },

    // Locale for Brazilian medical system
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',

    // Accessibility-focused settings
    colorScheme: 'light',

    // Medical data isolation
    storageState: undefined,

    // Extra HTTP headers for medical API
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'X-Test-Environment': 'playwright-medical'
    }
  },

  projects: [
    {
      name: 'chromium-medical',
      use: {
        ...devices['Desktop Chrome'],
        // Medical professional viewport
        viewport: { width: 1366, height: 768 },
        // Force fonts to load for consistent testing
        launchOptions: {
          args: ['--font-render-hinting=none', '--disable-font-subpixel-positioning']
        }
      },
    },

    {
      name: 'firefox-medical',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1366, height: 768 }
      },
    },

    // High contrast testing for accessibility
    {
      name: 'high-contrast',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        viewport: { width: 1366, height: 768 },
        extraHTTPHeaders: {
          'Forced-Colors': 'active'
        }
      },
    }
  ],

  // Test output configuration
  outputDir: 'test-results/',

  // Web server for testing
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3023',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  },

  // Medical testing expectations
  expect: {
    // Timeout for medical data loading
    timeout: 30000,
    // Animation handling for medical interfaces
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.2
    },
    toMatchSnapshot: {
      threshold: 0.2
    }
  }
});