import { expect, test, type Page } from '@playwright/test';
import { installMockCollab47Api } from './helpers/api-mocker';
import { attachBrowserErrorMonitor } from './helpers/error-monitor';

const MOCK_COVER_IMAGE_PATH = 'static/images/carasoul-bg.png';

async function loginAsMockStudent(page: Page): Promise<void> {
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
}

async function publishMinimalProject(page: Page, title: string): Promise<void> {
  await expect(page.locator('#proj-title')).toBeVisible();
  await page.locator('#proj-title').fill(title);
  await page.locator('#proj-sector').selectOption('sec-robotics');
  await page.locator('#proj-brief').fill(`Brief description for ${title}.`);

  await page.getByRole('button', { name: /Next: Step 2/i }).click();
  await page.getByRole('button', { name: /Next: Step 3/i }).click();
  await page.getByRole('button', { name: /Next: Step 4/i }).click();

  const fileInput = page.locator('input[type="file"]').first();
  const [presignRes] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/uploads/presign-post')),
    fileInput.setInputFiles(MOCK_COVER_IMAGE_PATH),
  ]);
  expect(presignRes.status()).toBe(200);

  await page.getByRole('button', { name: /Next: Step 5/i }).click();
  await page.getByRole('button', { name: /Next: Step 6/i }).click();

  const [createRes] = await Promise.all([
    page.waitForResponse(
      (res) => res.request().method() === 'POST' && res.url().endsWith('/api/v1/projects'),
    ),
    page.getByRole('button', { name: /Publish Project/i }).click(),
  ]);
  expect(createRes.status()).toBe(201);
  await expect(page).toHaveURL(/\/projects\/proj-mock-/, { timeout: 15_000 });
}

test.describe('Collab47 Pay-Per-Project (₹89 from 3rd), Billing, Badges & AdSense E2E', () => {
  test('1. 2 free projects succeed -> 3rd project hits ₹89 upfront paywall -> UPI unlocks form -> receipt linked on /membership', async ({
    page,
  }) => {
    await installMockCollab47Api(page);
    const monitor = attachBrowserErrorMonitor(page);

    await loginAsMockStudent(page);

    // Project #1 (Free 1 of 2)
    await page.goto('/projects/new', { waitUntil: 'networkidle' });
    await expect(page.getByText(/Free Project 1 of 2/i)).toBeVisible();
    await publishMinimalProject(page, 'Free Project One — Micro-Satellite Telemetry');

    // Project #2 (Free 2 of 2)
    await page.goto('/projects/new', { waitUntil: 'networkidle' });
    await expect(page.getByText(/Free Project 2 of 2/i)).toBeVisible();
    await publishMinimalProject(page, 'Free Project Two — Smart Grid Inverter');

    // Project #3 -> Must display upfront ₹89 paywall BEFORE project form
    await page.goto('/projects/new', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /Unlock Project #3/i })).toBeVisible();
    await expect(page.getByText('Free Project Quota Used (2 / 2)')).toBeVisible();
    await expect(page.locator('#proj-title')).toHaveCount(0);

    // Start ₹89 INR order & pay via UPI sandbox checkout
    const [orderRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/membership/payments/create-project-order')),
      page.getByRole('button', { name: /Pay ₹89 & Unlock Project Form/i }).click(),
    ]);
    expect(orderRes.status()).toBe(201);

    await expect(page.locator('#pay-upi-vpa')).toBeVisible();
    await page.locator('#pay-upi-vpa').fill('ananya@okicici');

    const [verifyRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/membership/payments/verify')),
      page.getByRole('button', { name: /Pay Now \(₹89\)/i }).click(),
    ]);
    expect(verifyRes.status()).toBe(200);

    // Project editor form unlocks immediately with Paid Project Credit banner!
    await expect(page.getByText(/Paid Project Credit Unlocked/i)).toBeVisible();
    await publishMinimalProject(page, 'Paid Project Three — Sovereign Quantum Sensor');

    // Navigate to repurposed /membership (Billing & Payments) and confirm receipt is linked to Project #3
    await page.goto('/membership', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Billing & Payments' })).toBeVisible();
    await expect(page.getByText('Free Membership')).toHaveCount(0);
    await expect(page.getByText('Upgrade to Premium')).toHaveCount(0);
    await expect(page.getByText('₹89').first()).toBeVisible();
    await expect(
      page.getByText('Used on: Paid Project Three — Sovereign Quantum Sensor'),
    ).toBeVisible();

    // Check Badges tab: Project Pioneer, Serial Builder, Power Innovator & Visual Storyteller unlocked!
    await page.goto('/profile?tab=badges', { waitUntil: 'networkidle' });
    await expect(page.getByText('Power Innovator')).toBeVisible();
    await expect(page.getByText('Visual Storyteller')).toBeVisible();

    monitor.assertClean();
  });

  test('2. Billing & Payments (/membership) allows pre-purchasing a ₹89 project credit without any subscription plans', async ({
    page,
  }) => {
    await installMockCollab47Api(page);
    const monitor = attachBrowserErrorMonitor(page);

    await loginAsMockStudent(page);
    await page.goto('/membership', { waitUntil: 'networkidle' });

    await expect(page.getByText('Pay-Per-Project · No Subscriptions')).toBeVisible();
    await expect(page.getByText('0 / 2')).toBeVisible();
    await expect(page.getByText('₹89').first()).toBeVisible();

    // Buy a project credit using NetBanking / Online Transfer rail
    const [orderRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/membership/payments/create-project-order')),
      page.getByRole('button', { name: /Buy Project Credit \(₹89\)/i }).click(),
    ]);
    expect(orderRes.status()).toBe(201);

    await page.getByRole('button', { name: /Online Transfer/i }).click();
    const [verifyRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/membership/payments/verify')),
      page.getByRole('button', { name: /Pay Now \(₹89\)/i }).click(),
    ]);
    expect(verifyRes.status()).toBe(200);

    await expect(page.getByText('Unused Project Credit')).toBeVisible();
    monitor.assertClean();
  });

  test('3. Multi-role persona & Activity Badges render on Public Portfolio (/u/:handle) and AdSense remounts cleanly across routes', async ({
    page,
  }) => {
    await installMockCollab47Api(page);
    const monitor = attachBrowserErrorMonitor(page);

    await loginAsMockStudent(page);

    // Update profile with multiple account personas
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Scientist', exact: true }).click();
    const [saveRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/profile/basic-info')),
      page.locator('form button[type="submit"]').click(),
    ]);
    expect(saveRes.status()).toBe(200);

    // Visit Public Portfolio via header CTA
    await page.locator('a[href^="/u/"]').first().click();
    await expect(page).toHaveURL(/\/u\//);
    await page.waitForLoadState('networkidle');

    // Confirm multiple persona badges + Activity Badges section appear on public portfolio
    await expect(page.locator('.hero-card__top').getByText('Student')).toBeVisible();
    await expect(page.locator('.hero-card__top').getByText('Scientist')).toBeVisible();
    await expect(page.getByText('Badges & Achievements')).toBeVisible();
    await expect(page.getByText('Multi-Disciplinary')).toBeVisible();

    // Navigate back to Home -> Dashboard and verify AdSense <ins class="adsbygoogle"> remounts cleanly
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('ins.adsbygoogle').first()).toBeAttached();
    await page.goto('/dashboard/student', { waitUntil: 'networkidle' });
    await expect(page.locator('ins.adsbygoogle').first()).toBeAttached();

    monitor.assertClean();
  });
});
