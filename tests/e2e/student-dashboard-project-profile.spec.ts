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

test.describe('Collab47 Dashboard E2E — Add Project, Multi-Role Profile, Badges & Ads', () => {
  test('1. Dashboard renders hero, metrics, checklist, feed, Badges & Level widget, and AdSense unit', async ({
    page,
  }) => {
    await installMockCollab47Api(page);
    const monitor = attachBrowserErrorMonitor(page);

    await loginAsMockStudent(page);

    await expect(page.getByRole('heading', { name: /Build • Share • Collaborate/i })).toBeVisible();
    await expect(page.locator('a[href="/projects/new"]').first()).toBeVisible();
    await expect(page.getByText('Autonomous Solar Micro-Grid Controller').first()).toBeVisible();
    await expect(page.getByText('Publish first living workbench project').first()).toBeVisible();

    // Badges & Level widget on dashboard right rail
    await expect(page.getByText('Badges & Level')).toBeVisible();
    await expect(page.locator('a[href="/profile?tab=badges"]').first()).toBeVisible();

    // Google AdSense <ins class="adsbygoogle"> unit without plan-upgrade CTA
    await expect(page.locator('ins.adsbygoogle').first()).toBeAttached();
    await expect(page.getByText('Remove ads with Premium')).toHaveCount(0);

    monitor.assertClean();
  });

  test('2. User adds a free project via 6-step wizard with quota banner, cover upload, team invite & publish', async ({
    page,
  }) => {
    await installMockCollab47Api(page);
    const monitor = attachBrowserErrorMonitor(page);

    await loginAsMockStudent(page);

    // Open Create Project wizard from Dashboard CTA
    await page.locator('a[href="/projects/new"]').first().click();
    await expect(page).toHaveURL(/\/projects\/new/);
    await expect(page.getByText(/Free Project 1 of 2/i)).toBeVisible();
    await expect(page.getByText(/₹89\/project from 3rd onwards/i)).toBeVisible();
    await expect(page.locator('#proj-title')).toBeVisible();

    // --- STEP 1: Core Identity (+ validation error detection) ---
    await page.getByRole('button', { name: /Next: Step 2/i }).click();
    await expect(page.getByText('Project Title is required to continue.')).toBeVisible();

    const projectTitle = 'Autonomous Precision Agri-Drone with Edge YOLOv8';
    await page.locator('#proj-title').fill(projectTitle);
    await page.locator('#proj-sector').selectOption('sec-robotics');
    await page.locator('#proj-branch').fill('Computer Science & Robotics');
    await page
      .locator('#proj-deliverable-url')
      .fill('https://github.com/ananya-collab47/agri-drone-yolov8');
    await page
      .locator('#proj-brief')
      .fill(
        'Edge-AI quadcopter for real-time crop stress detection and automated micro-spraying on small farms.',
      );
    await page
      .locator('#proj-overview')
      .fill(
        'Built on Jetson Orin Nano + ROS2 Humble with quantized YOLOv8n achieving 38 FPS thermal + RGB inference.',
      );

    // Verify Save Draft works right on Step 1 before advancing!
    await expect(page.getByRole('button', { name: /Save Draft/i })).toBeVisible();
    const [draftCreateRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'POST' && res.url().endsWith('/api/v1/projects'),
      ),
      page.getByRole('button', { name: /Save Draft/i }).click(),
    ]);
    expect(draftCreateRes.status()).toBe(201);
    await expect(page.getByText(/Draft saved/i).first()).toBeVisible();

    await page.getByRole('button', { name: /Next: Step 2/i }).click();

    // --- STEP 2: STEM Classification & Affiliations ---
    await expect(page.locator('#proj-stem-cat')).toBeVisible();
    await page.locator('#proj-stem-cat').selectOption('stem-eng');
    await page.locator('#proj-stem-disc').selectOption('disc-robotics');
    await page.locator('#proj-institution').selectOption('inst-iitb');
    await page.getByRole('button', { name: 'Hardware Prototype' }).click();
    await page.getByRole('button', { name: 'Undergraduate' }).click();
    await page.getByRole('button', { name: 'Artificial Intelligence & Data Science' }).click();

    await page.getByRole('button', { name: /Next: Step 3/i }).click();

    // --- STEP 3: Scope, Milestones & Timeline (+ date range validation error check) ---
    await expect(page.locator('#proj-problem')).toBeVisible();
    await page
      .locator('#proj-problem')
      .fill('Smallholder farms lose up to 28% yield due to late blight detection.');
    await page
      .locator('#proj-description')
      .fill(
        'Hybrid flight controller running PX4 autopilot coupled with Jetson Orin Nano computer vision pipeline.',
      );
    await page
      .locator('#proj-deliverables')
      .fill('Working drone prototype, open-source ROS2 stack, and field validation dataset.');

    await page.locator('#ms-title-ms-init-1').fill('Hardware Prototype Assembly');
    await page.locator('#ms-start-ms-init-1').fill('2026-11-01');
    await page.locator('#ms-end-ms-init-1').fill('2026-12-15');
    await page.locator('#ms-status-ms-init-1').selectOption('in_progress');

    // Intentionally enter invalid endDate < startDate to verify error detection
    await page.locator('#proj-start-date').fill('2026-11-01');
    await page.locator('#proj-end-date').fill('2026-10-01');
    await page.getByRole('button', { name: /Next: Step 4/i }).click();
    await expect(
      page.getByText('Target End Date must be on or after Start Date.'),
    ).toBeVisible();

    // Fix timeline dates and add tags/skills
    await page.locator('#proj-end-date').fill('2027-03-31');
    await page.locator('#proj-tags').fill('robotics, ros2, agritech, edge-ai');
    await page.locator('#proj-keywords').fill('precision-agriculture, yolov8, autonomous-drone');
    await page.locator('#proj-skills').fill('Python, ROS2, PyTorch, PX4');

    await page.getByRole('button', { name: /Next: Step 4/i }).click();

    // --- STEP 4: Mandatory Cover Image Upload ---
    const step5NextBtn = page.getByRole('button', { name: /Next: Step 5/i });
    await expect(step5NextBtn).toBeDisabled();

    const fileInput = page.locator('input[type="file"]').first();
    const [presignRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/uploads/presign-post')),
      fileInput.setInputFiles(MOCK_COVER_IMAGE_PATH),
    ]);

    expect(presignRes.status()).toBe(200);
    await expect(page.getByText('Cover Image', { exact: true }).first()).toBeVisible();
    await expect(step5NextBtn).toBeEnabled();
    await step5NextBtn.click();

    // --- STEP 5: Add Contributors ---
    await expect(page.locator('#step5-invite-email')).toBeVisible();
    await page.locator('#step5-invite-email').fill('rohan.verma@iitb.ac.in');
    await page.locator('#step5-invite-role-title').fill('ROS2 Robotics Lead');
    await page.locator('#step5-team-role').selectOption('technical_lead');
    await page.getByRole('button', { name: /Add Contributor to Queue/i }).click();
    await expect(page.getByText('rohan.verma@iitb.ac.in')).toBeVisible();

    // Verify Save Draft button is also present on Step 5 & Step 6
    await expect(page.getByRole('button', { name: /Save Draft/i })).toBeVisible();
    await page.getByRole('button', { name: /Next: Step 6/i }).click();

    // --- STEP 6: Final Preview & Publish ---
    await expect(page.getByRole('heading', { name: projectTitle })).toBeVisible();
    await expect(page.getByText('Hardware Prototype Assembly')).toBeVisible();
    await expect(page.getByText('rohan.verma@iitb.ac.in')).toBeVisible();
    await expect(page.getByRole('button', { name: /Save Draft/i })).toBeVisible();

    const [publishProjRes, inviteRes] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.request().method() === 'PATCH' && /\/api\/v1\/projects\/proj-mock-\d+$/.test(res.url()),
      ),
      page.waitForResponse(
        (res) =>
          res.request().method() === 'POST' && /\/api\/v1\/projects\/[^/]+\/invitations$/.test(res.url()),
      ),
      page.getByRole('button', { name: /Publish Project/i }).click(),
    ]);

    expect(publishProjRes.status()).toBe(200);
    expect(inviteRes.status()).toBe(201);

    await expect(page).toHaveURL(/\/projects\/proj-mock-/, { timeout: 15_000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(projectTitle).first()).toBeVisible();

    monitor.assertClean();
  });

  test('3. User selects multiple Account Persona roles, completes all 5 profile sections, and unlocks Activity Badges', async ({
    page,
  }) => {
    await installMockCollab47Api(page);
    const monitor = attachBrowserErrorMonitor(page);

    await loginAsMockStudent(page);

    // Navigate to Profile Editor
    await page.goto('/profile', { waitUntil: 'networkidle' });
    await expect(page.locator('#p-name')).toBeVisible();

    // --- TAB 1: Basic Information + Multi-Role Account Persona Selection ---
    await page
      .locator('#p-headline')
      .fill('BTech CSE @ IIT Bombay | Autonomous Robotics & Edge AI');

    // Select additional Account Persona roles alongside Student (Researcher + Startup)
    await page.getByRole('button', { name: 'Researcher', exact: true }).click();
    await page.getByRole('button', { name: 'Startup', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Researcher', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Startup', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.locator('#p-college').fill('IIT Bombay');
    await page.locator('#p-branch').fill('Computer Science & Engineering');
    await page.locator('#p-year').selectOption('4');
    await page.locator('#p-student-id').fill('23B030047');
    await page.locator('#p-city').fill('Mumbai');

    const [basicRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/profile/basic-info')),
      page.locator('form button[type="submit"]').click(),
    ]);
    expect(basicRes.status()).toBe(200);

    // Verify all selected persona badges render in Profile Summary Header
    await expect(page.locator('.profile-hero__title-row').getByText('Student')).toBeVisible();
    await expect(page.locator('.profile-hero__title-row').getByText('Researcher')).toBeVisible();
    await expect(page.locator('.profile-hero__title-row').getByText('Startup')).toBeVisible();

    // --- TAB 2: Education ---
    await page.getByRole('tab', { name: /Education/i }).click();
    await expect(page.locator('#edu-inst')).toBeVisible();

    await page.locator('#edu-qual').selectOption('undergraduate');
    await page.locator('#edu-inst').fill('IIT Bombay');
    await page.locator('#edu-deg').fill('BTech');
    await page.locator('#edu-field').fill('Computer Science & Engineering');
    await page.locator('#edu-sy').fill('2023');
    await page.locator('#edu-ey').fill('2027');
    await page.locator('#edu-grade').fill('9.2 CGPA');

    const [eduRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'POST' && res.url().includes('/profile/education'),
      ),
      page.locator('form button[type="submit"]').click(),
    ]);
    expect(eduRes.status()).toBe(201);
    await expect(page.getByText('BTech · Computer Science & Engineering')).toBeVisible();

    // --- TAB 3: Experience ---
    await page.getByRole('tab', { name: /Experience/i }).click();
    await expect(page.locator('#exp-title')).toBeVisible();

    await page.locator('#exp-type').selectOption('internship');
    await page.locator('#exp-title').fill('Robotics Research Intern');
    await page.locator('#exp-org').fill('IISc Autonomous Systems Lab');
    await page.locator('#exp-loc').fill('Bengaluru');
    await page.locator('#exp-sy').fill('2025');
    await page.locator('#exp-ey').fill('2025');
    await page.locator('#exp-skills').fill('ROS2, C++, PyTorch');
    await page
      .locator('#exp-desc')
      .fill('Implemented visual-inertial SLAM and real-time obstacle avoidance for indoor UAVs.');

    const [expRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'POST' && res.url().includes('/profile/experiences'),
      ),
      page.locator('form button[type="submit"]').click(),
    ]);
    expect(expRes.status()).toBe(201);
    await expect(page.getByText('Robotics Research Intern')).toBeVisible();

    // --- TAB 4: Expertise & Skills ---
    await page.getByRole('tab', { name: /Expertise/i }).click();
    await expect(page.locator('#exp-aoi')).toBeVisible();

    await page.getByRole('button', { name: 'Artificial Intelligence & Data Science' }).click();
    await page.locator('#exp-aoi').fill('Autonomous Drones, Precision Agriculture');
    await page.locator('#exp-tags').fill('robotics, edge-ai, open-hardware');

    const [expertiseRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'PUT' && res.url().includes('/profile/expertise'),
      ),
      page.locator('form').first().locator('button[type="submit"]').click(),
    ]);
    expect(expertiseRes.status()).toBe(200);

    await page.locator('#sk-name').fill('ROS2 & Edge AI');
    await page.locator('#sk-prof').selectOption('advanced');

    const [skillRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'POST' && res.url().includes('/profile/skills'),
      ),
      page.locator('form').nth(1).locator('button[type="submit"]').click(),
    ]);
    expect(skillRes.status()).toBe(201);
    await expect(page.getByText(/ROS2 & Edge AI/)).toBeVisible();

    // --- TAB 5: About & Social Links ---
    await page.getByRole('tab', { name: /About/i }).click();
    await expect(page.locator('#ab-bio')).toBeVisible();

    await page
      .locator('#ab-bio')
      .fill('Final-year CSE undergrad building autonomous STEM hardware prototypes for India.');
    await page
      .locator('#ab-summary')
      .fill(
        'Focused on embedded vision, ROS2 control stacks, and field-tested precision agriculture robotics.',
      );

    const [aboutRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'PATCH' && res.url().includes('/profile/about'),
      ),
      page.locator('form').first().locator('button[type="submit"]').click(),
    ]);
    expect(aboutRes.status()).toBe(200);

    await page.locator('#soc-plat').selectOption('github');
    await page.locator('#soc-lbl').fill('GitHub');
    await page.locator('#soc-url').fill('https://github.com/ananya-collab47');

    const [socialRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'PUT' && res.url().includes('/profile/social-links'),
      ),
      page.locator('form').nth(1).locator('button[type="submit"]').click(),
    ]);
    expect(socialRes.status()).toBe(200);
    await expect(page.getByText('https://github.com/ananya-collab47')).toBeVisible();

    // Verify Profile Completeness hit 100%
    await expect(page.getByText('100%').first()).toBeVisible();

    // --- TAB 6: Activity Badges & Achievements ---
    await page.getByRole('tab', { name: /Badges/i }).click();
    await expect(page.getByText('Activity Badges & Achievements')).toBeVisible();
    await expect(page.getByText('Profile Architect')).toBeVisible();
    await expect(page.getByText('Multi-Disciplinary')).toBeVisible();
    await expect(page.getByText('All-Star Portfolio')).toBeVisible();

    // Verify category filters work cleanly
    await page.getByRole('button', { name: 'Profile', exact: true }).click();
    await expect(page.getByText('Multi-Disciplinary')).toBeVisible();

    monitor.assertClean();
  });
});
