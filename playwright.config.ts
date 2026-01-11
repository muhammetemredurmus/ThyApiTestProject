import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    baseURL: 'https://dummyjson.com',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  projects: [
    {
      name: 'api-tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  globalSetup: './src/utils/global-setup.ts',
  globalTeardown: './src/utils/global-teardown.ts',
});

