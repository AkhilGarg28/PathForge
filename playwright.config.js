import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './client/e2e',
  timeout: 35000,
  expect: {
    timeout: 7000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    headless: true,
  },
  webServer: [
    {
      command: 'node server/e2eServer.js',
      url: 'http://localhost:5000/api/health',
      reuseExistingServer: true,
      timeout: 25000,
    },
    {
      command: 'npm run dev --prefix client',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 25000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
