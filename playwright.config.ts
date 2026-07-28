import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: process.env.BASE_URL ? 30_000 : 15_000,
  retries: 0,
  fullyParallel: true,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4322',
    headless: true,
  },
  expect: {
    timeout: process.env.BASE_URL ? 10_000 : 5_000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' }, timeout: 30_000 },
  ],
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npx serve dist -l 4322',
    port: 4322,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
})
