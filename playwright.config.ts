import { defineConfig, devices } from '@playwright/test'
import fs from 'node:fs'

if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

export default defineConfig({
  testDir: './e2e',
  // Auth tests hit a real (shared) Clerk dev instance, which rate-limits and
  // bot-checks aggressively — run them one at a time rather than in parallel.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
