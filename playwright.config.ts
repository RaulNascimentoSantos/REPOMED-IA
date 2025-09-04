import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  timeout: 60_000,
  testDir: 'tests/e2e',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  reporter: [['list']]
});