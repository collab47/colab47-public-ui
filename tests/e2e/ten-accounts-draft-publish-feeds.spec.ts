import { expect, test } from '@playwright/test';
import { installMockCollab47Api } from './helpers/api-mocker';
import { attachBrowserErrorMonitor } from './helpers/error-monitor';
import { SHARED_E2E_PASSWORD, TEN_E2E_ACCOUNTS } from './helpers/ten-accounts';

const MOCK_COVER_IMAGE_PATH = 'static/images/carasoul-bg.png';

test.describe('Collab47 10-Account E2E (Password123@) — Save Drafts, Publish Projects & Feeds', () => {
  for (const account of TEN_E2E_ACCOUNTS) {
    test(`Account ${account.index}/10 (${account.email}): login with Password123@, save drafts, publish project & publish feed post`, async ({
      page,
    }) => {
      await installMockCollab47Api(page);
      const monitor = attachBrowserErrorMonitor(page);

      // 1. Login with Password123@
      await page.goto('/login', { waitUntil: 'networkidle' });
      await page.locator('#login-email').fill(account.email);
      await page.locator('#login-password').fill(SHARED_E2E_PASSWORD);

      const [loginRes] = await Promise.all([
        page.waitForResponse((res) => res.url().includes('/auth/login')),
        page.locator('form button[type="submit"]').click(),
      ]);

      expect(loginRes.status(), `Login failed for ${account.email}`).toBe(200);
      await expect(page).toHaveURL(/\/dashboard\//, { timeout: 15_000 });
      await page.waitForLoadState('networkidle');
      const userDashboardUrl = page.url();

      // 2. Create Project Wizard: Save Draft on Step 1 -> Save Draft on Step 3 -> Upload Cover on Step 4 -> Publish on Step 6
      await page.goto('/projects/new', { waitUntil: 'networkidle' });
      await expect(page.locator('#proj-title')).toBeVisible();

      await page.locator('#proj-title').fill(account.projectTitle);
      await page.locator('#proj-sector').selectOption('sec-robotics');
      await page.locator('#proj-brief').fill(account.projectBrief);

      // Step 1 Save Draft (POST /projects with isDraft: true)
      const [draftStep1Res] = await Promise.all([
        page.waitForResponse(
          (res) => res.request().method() === 'POST' && res.url().endsWith('/api/v1/projects'),
        ),
        page.getByRole('button', { name: /Save Draft/i }).click(),
      ]);
      expect(draftStep1Res.status(), `Step 1 Save Draft failed for ${account.email}`).toBe(201);
      await expect(page.getByText(/Draft saved/i).first()).toBeVisible();

      // Step 2 -> Step 3 -> Save Draft again (PATCH /projects/:id)
      await page.getByRole('button', { name: /Next: Step 2/i }).click();
      await expect(page.getByRole('button', { name: /Save Draft/i })).toBeVisible();
      await page.getByRole('button', { name: /Next: Step 3/i }).click();

      await page.locator('#proj-tags').fill(`${account.feedTag}, collab47, viksitbharat`);
      const [draftStep3Res] = await Promise.all([
        page.waitForResponse(
          (res) =>
            res.request().method() === 'PATCH' &&
            /\/api\/v1\/projects\/proj-mock-\d+$/.test(res.url()),
        ),
        page.getByRole('button', { name: /Save Draft/i }).click(),
      ]);
      expect(draftStep3Res.status(), `Step 3 Save Draft failed for ${account.email}`).toBe(200);

      // Step 4: Upload mandatory Cover Image
      await page.getByRole('button', { name: /Next: Step 4/i }).click();
      await expect(page.getByRole('button', { name: /Save Draft/i })).toBeVisible();

      const projectFileInput = page.locator('input[type="file"]').first();
      const [presignProjRes] = await Promise.all([
        page.waitForResponse((res) => res.url().includes('/uploads/presign-post')),
        projectFileInput.setInputFiles(MOCK_COVER_IMAGE_PATH),
      ]);
      expect(presignProjRes.status()).toBe(200);

      // Step 5 -> Step 6 (Final Preview & Publish)
      await page.getByRole('button', { name: /Next: Step 5/i }).click();
      await expect(page.getByRole('button', { name: /Save Draft/i })).toBeVisible();
      await page.getByRole('button', { name: /Next: Step 6/i }).click();

      await expect(page.getByRole('heading', { name: account.projectTitle })).toBeVisible();
      await expect(page.getByRole('button', { name: /Save Draft/i })).toBeVisible();

      const [publishRes] = await Promise.all([
        page.waitForResponse(
          (res) =>
            res.request().method() === 'PATCH' &&
            /\/api\/v1\/projects\/proj-mock-\d+$/.test(res.url()),
        ),
        page.getByRole('button', { name: /Publish Project/i }).click(),
      ]);
      expect(publishRes.status(), `Step 6 Publish failed for ${account.email}`).toBe(200);
      await expect(page).toHaveURL(/\/projects\/proj-mock-/, { timeout: 15_000 });
      await expect(page.getByText(account.projectTitle).first()).toBeVisible();

      // 3. Dashboard Feed: Open Composer via Hero "Share Post" -> Upload Cover & Publish Feed Post
      await page.goto(userDashboardUrl, { waitUntil: 'networkidle' });
      const sharePostBtn = page.getByRole('button', { name: /Share Post/i }).first();
      await expect(sharePostBtn).toBeVisible();
      await sharePostBtn.click();

      await expect(page.locator('#dash-post-body')).toBeVisible();
      await page.locator('#dash-post-body').fill(account.feedPostBody);

      const postFileInput = page.locator('input[type="file"]').first();
      const [presignPostRes] = await Promise.all([
        page.waitForResponse((res) => res.url().includes('/uploads/presign-post')),
        postFileInput.setInputFiles(MOCK_COVER_IMAGE_PATH),
      ]);
      expect(presignPostRes.status()).toBe(200);

      const publishPostBtn = page.getByRole('button', { name: /Publish Post/i });
      await publishPostBtn.evaluate((el) =>
        el.scrollIntoView({ block: 'center', behavior: 'instant' }),
      );
      const [publishPostRes] = await Promise.all([
        page.waitForResponse(
          (res) =>
            res.request().method() === 'POST' && res.url().endsWith('/api/v1/dashboard/posts'),
        ),
        publishPostBtn.click(),
      ]);
      expect(publishPostRes.status(), `Feed post failed for ${account.email}`).toBe(201);
      await expect(page.getByText(account.feedPostBody).first()).toBeVisible();

      // 4. Comment on feed post
      const commentInput = page.locator('input[placeholder="Write a comment..."]').first();
      if (await commentInput.isVisible()) {
        await commentInput.evaluate((el) =>
          el.scrollIntoView({ block: 'center', behavior: 'instant' }),
        );
        await commentInput.fill(`Great milestone from ${account.name}!`);
        const [commentRes] = await Promise.all([
          page.waitForResponse(
            (res) =>
              res.request().method() === 'POST' &&
              /\/api\/v1\/dashboard\/posts\/[^/]+\/comments$/.test(res.url()),
          ),
          commentInput.press('Enter'),
        ]);
        expect([200, 201]).toContain(commentRes.status());
      }

      monitor.assertClean();
    });
  }
});
