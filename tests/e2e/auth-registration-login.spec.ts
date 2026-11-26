import { expect, test, type Page } from '@playwright/test';
import { installMockCollab47Api, type MockApiController } from './helpers/api-mocker';
import { attachBrowserErrorMonitor } from './helpers/error-monitor';

const nodeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env;
const USE_LIVE_API = nodeEnv?.E2E_USE_LIVE_API === 'true';

const CANONICAL_PUBLIC_ROLES = [
  'Student',
  'Researcher',
  'Scientist',
  'Faculty',
  'Industry',
  'Startup',
  'Government',
  'Others',
] as const;

async function setupApiIfMocked(page: Page): Promise<MockApiController | null> {
  if (USE_LIVE_API) {
    return null;
  }
  return installMockCollab47Api(page);
}

async function clearBrowserSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

test.describe('Collab47 Auth E2E — Registration & Login (Mocked Test Data + Error Detection)', () => {
  test('1. Home page navigates cleanly to /signup and /login with all 8 public roles and zero errors', async ({
    page,
  }) => {
    await setupApiIfMocked(page);
    const monitor = attachBrowserErrorMonitor(page);

    const homeResponse = await page.goto('/', { waitUntil: 'networkidle' });
    expect(homeResponse?.status(), 'Home page should return HTTP 200').toBe(200);

    for (const role of CANONICAL_PUBLIC_ROLES) {
      await expect(page.getByRole('link', { name: role }).first()).toBeVisible();
    }

    await page.locator('a[href="/signup"]').first().click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.locator('#register-name')).toBeVisible();

    await page.locator('a[href="/login"]').first().click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('#login-email')).toBeVisible();

    monitor.assertClean();
  });

  test('2. Registration page detects all client-side validation errors without runtime crashes', async ({
    page,
  }) => {
    await setupApiIfMocked(page);
    const monitor = attachBrowserErrorMonitor(page);

    const response = await page.goto('/signup', { waitUntil: 'networkidle' });
    expect(response?.status(), '/signup should return HTTP 200').toBe(200);

    for (const role of CANONICAL_PUBLIC_ROLES) {
      await expect(page.getByRole('button', { name: role })).toBeVisible();
    }

    // Empty form submission
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('Full name is required.')).toBeVisible();
    await expect(page.getByText('Email address is required.')).toBeVisible();
    await expect(page.getByText('Mobile number is required.')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
    await expect(page.getByText('Please confirm your password.')).toBeVisible();

    // Malformed field inputs
    await page.locator('#register-name').fill('A');
    await page.locator('#register-email').fill('invalid-email-format');
    await page.locator('#register-mobile-number').fill('123');
    await page.locator('#register-password').fill('weak');
    await page.locator('#register-confirm-password').fill('different');
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText('Full name must be at least 2 characters long.')).toBeVisible();
    await expect(page.getByText('That email does not look valid. Check for typos.')).toBeVisible();
    await expect(page.getByText('Mobile number must contain 6 to 15 digits.')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters long.')).toBeVisible();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();

    // Password complexity checks
    await page.locator('#register-password').fill('alllowercase1!');
    await expect(
      page.getByText('Password must include at least one uppercase letter.'),
    ).toBeVisible();

    await page.locator('#register-password').fill('NoDigitsHere!');
    await expect(page.getByText('Password must include at least one digit.')).toBeVisible();

    await page.locator('#register-password').fill('NoSymbolHere1');
    await expect(
      page.getByText('Password must include at least one special character.'),
    ).toBeVisible();

    monitor.assertClean();
  });

  test('3. Login page detects validation errors, 401 invalid credentials, and graceful 500 error recovery', async ({
    page,
  }) => {
    const mockApi = await setupApiIfMocked(page);
    const monitor = attachBrowserErrorMonitor(page);

    const response = await page.goto('/login', { waitUntil: 'networkidle' });
    expect(response?.status(), '/login should return HTTP 200').toBe(200);

    // Empty login form validation
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('Email address is required.')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();

    // Invalid email & short password validation
    await page.locator('#login-email').fill('not-an-email');
    await page.locator('#login-password').fill('123');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('That email does not look valid. Check for typos.')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters long.')).toBeVisible();

    // Invalid credentials (401)
    await page.locator('#login-email').fill('unknown.user@collab47.test');
    await page.locator('#login-password').fill('WrongPass@2026!');

    const [invalidLoginRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.locator('form button[type="submit"]').click(),
    ]);

    expect(invalidLoginRes.status()).toBe(401);
    await expect(page.getByRole('alert')).toContainText('Sign in failed');
    await expect(page.getByRole('alert')).toContainText('Invalid email address or password.');

    monitor.assertClean({
      allowedHttpErrors: [{ urlPattern: /\/auth\/login/, statuses: [401] }],
      allowedConsoleErrors: [
        /\[Collab47 UI\]\[Login\] Login failed/,
        /\[Collab47 API\].*401.*\/auth\/login/,
      ],
    });

    // Simulated backend 500 error (mocked mode only) — verify UI shows alert & error detector catches 500
    if (mockApi) {
      monitor.reset();
      mockApi.failNext(/^\/auth\/login$/, 500, {
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Simulated backend outage for error detection test.',
      });

      await page.locator('#login-email').fill('ananya.sharma@iitb.ac.in');
      await page.locator('#login-password').fill('MockUser@2026!');

      const [serverErrRes] = await Promise.all([
        page.waitForResponse((res) => res.url().includes('/auth/login')),
        page.locator('form button[type="submit"]').click(),
      ]);

      expect(serverErrRes.status()).toBe(500);
      await expect(page.getByRole('alert')).toContainText(
        'Simulated backend outage for error detection test.',
      );
      expect(
        monitor.httpErrors.some((err) => err.status === 500 && err.url.includes('/auth/login')),
        'Error monitor should detect the simulated HTTP 500 response',
      ).toBe(true);
      expect(monitor.pageErrors, 'UI should handle HTTP 500 without uncaught page errors').toEqual(
        [],
      );
    }
  });

  test('4. Seeded mock student login succeeds and loads dashboard with zero errors', async ({
    page,
  }) => {
    test.skip(USE_LIVE_API, 'Seeded mock account test runs in mocked API mode');

    await setupApiIfMocked(page);
    const monitor = attachBrowserErrorMonitor(page);

    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.locator('#login-email').fill('ananya.sharma@iitb.ac.in');
    await page.locator('#login-password').fill('MockUser@2026!');

    const [loginRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.locator('form button[type="submit"]').click(),
    ]);

    expect(loginRes.status()).toBe(200);
    await expect(page).toHaveURL(/\/dashboard\/student/, { timeout: 15_000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Autonomous Solar Micro-Grid Controller').first()).toBeVisible();

    monitor.assertClean();
  });

  test('5. Full Registration -> Duplicate Email Error -> Wrong Password Error -> Valid Login -> Dashboard', async ({
    page,
  }) => {
    await setupApiIfMocked(page);
    const monitor = attachBrowserErrorMonitor(page);

    const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newUser = {
      name: `Dr. Meera Iyer ${uniqueSuffix.slice(-4)}`,
      email: `meera.iyer.${uniqueSuffix}@collab47.test`,
      mobile: `98${uniqueSuffix.slice(-8)}`,
      password: 'Collab47@E2E!2026',
      role: 'Researcher' as const,
    };

    // Step 1: Register brand-new Researcher
    await page.goto('/signup', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: newUser.role }).click();
    await expect(page.getByRole('button', { name: newUser.role })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.locator('#register-name').fill(newUser.name);
    await page.locator('#register-email').fill(newUser.email);
    await page.locator('#register-mobile-number').fill(newUser.mobile);
    await page.locator('#register-password').fill(newUser.password);
    await page.locator('#register-confirm-password').fill(newUser.password);

    const [registerRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/register')),
      page.locator('form button[type="submit"]').click(),
    ]);

    expect(registerRes.status()).toBeGreaterThanOrEqual(200);
    expect(registerRes.status()).toBeLessThan(300);
    await expect(page).toHaveURL(/\/signup\/plan/, { timeout: 15_000 });
    await expect(page.getByText('Free Membership').first()).toBeVisible();
    monitor.assertClean();

    // Step 2: Clear session & verify duplicate registration returns 409 error cleanly
    await clearBrowserSession(page);
    monitor.reset();

    await page.goto('/signup', { waitUntil: 'networkidle' });
    await page.locator('#register-name').fill(newUser.name);
    await page.locator('#register-email').fill(newUser.email);
    await page.locator('#register-mobile-number').fill(newUser.mobile);
    await page.locator('#register-password').fill(newUser.password);
    await page.locator('#register-confirm-password').fill(newUser.password);

    const [duplicateRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/register')),
      page.locator('form button[type="submit"]').click(),
    ]);

    expect([400, 409]).toContain(duplicateRes.status());
    await expect(
      page.getByRole('alert').filter({ hasText: 'Registration failed' }),
    ).toBeVisible();
    await expect(page.locator('#register-email-error')).toBeVisible();

    monitor.assertClean({
      allowedHttpErrors: [{ urlPattern: /\/auth\/register/, statuses: [400, 409] }],
      allowedConsoleErrors: [
        /\[Collab47 UI\]\[Register\] Registration failed/,
        /\[Collab47 API\].*(400|409).*\/auth\/register/,
      ],
    });

    // Step 3: Navigate to /login & verify wrong password rejection (401)
    monitor.reset();
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.locator('#login-email').fill(newUser.email);
    await page.locator('#login-password').fill('WrongPassword@999!');

    const [wrongPassRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.locator('form button[type="submit"]').click(),
    ]);

    expect([400, 401]).toContain(wrongPassRes.status());
    await expect(page.getByRole('alert')).toContainText('Sign in failed');

    monitor.assertClean({
      allowedHttpErrors: [{ urlPattern: /\/auth\/login/, statuses: [400, 401] }],
      allowedConsoleErrors: [
        /\[Collab47 UI\]\[Login\] Login failed/,
        /\[Collab47 API\].*(400|401).*\/auth\/login/,
      ],
    });

    // Step 4: Log in with correct password & confirm Researcher dashboard loads cleanly
    monitor.reset();
    await page.locator('#login-password').fill(newUser.password);

    const [validLoginRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.locator('form button[type="submit"]').click(),
    ]);

    expect(validLoginRes.status()).toBe(200);
    await expect(page).toHaveURL(/\/dashboard\/researcher/, { timeout: 15_000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    monitor.assertClean();
  });
});
