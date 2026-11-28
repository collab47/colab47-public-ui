import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const isHeadless = process.env.CI === 'true' || process.env.E2E_HEADLESS === 'true';
const slowMo = Number(process.env.E2E_SLOW_MO ?? (isHeadless ? 0 : 120));
const isBackendOnly = process.env.E2E_BACKEND_ONLY === 'true';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: {
    timeout: 12_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['./tests/e2e/helpers/collab47-reporter.ts'],
  ],
  use: {
    baseURL,
    channel: 'chrome',
    headless: isHeadless,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on',
    screenshot: 'on',
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 },
    },
    launchOptions: {
      slowMo,
    },
  },
  projects: [
    {
      name: 'chrome',
      testIgnore: /backend-api\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'backend-api',
      testMatch: /backend-api\.spec\.ts/,
      use: {
        baseURL: process.env.E2E_API_BASE_URL || 'http://localhost:4000/api/v1',
        trace: 'off',
        screenshot: 'off',
        video: 'off',
      },
    },
  ],
  webServer:
    process.env.E2E_BASE_URL || isBackendOnly
      ? undefined
      : {
          command: 'npm run dev',
          url: baseURL,
          reuseExistingServer: true,
          timeout: 60_000,
        },
});
