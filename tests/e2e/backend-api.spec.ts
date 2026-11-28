import { expect, test } from '@playwright/test';
import { SHARED_E2E_PASSWORD, TEN_E2E_ACCOUNTS } from './helpers/ten-accounts';

const runtimeEnv =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const API_BASE = (runtimeEnv.E2E_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, '');

test.describe('Collab47 Backend REST API E2E — Auth, Pay-Per-Project (₹89), Multi-Persona & Activity Badges', () => {
  test('Full backend lifecycle: register (no role/plan) -> multi-role profile -> 2 free projects -> 3rd project HTTP 402 -> ₹89 payment -> 3rd project 201 -> badges', async ({
    request,
  }) => {
    // 1. Health check
    const healthRes = await request.get(`${API_BASE}/health`);
    expect(healthRes.status(), 'GET /health should return 200').toBe(200);

    // 2. Register fresh user WITHOUT accountType — must redirect directly to /onboarding (no /signup/plan)
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const email = `pw.e2e.${suffix}@collab47.test`;
    const password = 'Collab47@E2E!2026';

    const registerRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        name: `Playwright Innovator ${suffix.slice(-4)}`,
        email,
        mobileCountryCode: '+91',
        mobileNumber: `98${suffix.slice(-8)}`,
        password,
        confirmPassword: password,
      },
    });
    expect(registerRes.status(), 'POST /auth/register should return 201').toBe(201);
    const registerBody = (await registerRes.json()) as {
      user: { id: string; email: string; handle: string; accountType: string };
      tokens: { accessToken: string; refreshToken: string };
      redirectTo: string;
    };
    expect(registerBody.redirectTo).toBe('/onboarding');
    expect(registerBody.tokens.accessToken).toBeTruthy();

    const authHeaders = {
      Authorization: `Bearer ${registerBody.tokens.accessToken}`,
    };

    // Duplicate registration rejected with 409
    const dupRes = await request.post(`${API_BASE}/auth/register`, {
      data: {
        name: 'Duplicate User',
        email,
        mobileCountryCode: '+91',
        mobileNumber: '9876543210',
        password,
        confirmPassword: password,
      },
    });
    expect(dupRes.status()).toBe(409);

    // Login wrong password -> 401; valid password -> 200
    const badLogin = await request.post(`${API_BASE}/auth/login`, {
      data: { email, password: 'WrongPassword@999!' },
    });
    expect(badLogin.status()).toBe(401);

    const goodLogin = await request.post(`${API_BASE}/auth/login`, {
      data: { email, password },
    });
    expect(goodLogin.status()).toBe(200);

    // 3. Multi-role Account Persona selection via PATCH /profile/basic-info
    const privateRoleRes = await request.patch(`${API_BASE}/profile/basic-info`, {
      headers: authHeaders,
      data: {
        accountTypes: ['admin'],
      },
    });
    expect(privateRoleRes.status(), 'Private role must be rejected').toBe(400);

    const multiRoleRes = await request.patch(`${API_BASE}/profile/basic-info`, {
      headers: authHeaders,
      data: {
        headline: 'Full-Stack R&D Builder',
        city: 'Bengaluru',
        college: 'IISc Bengaluru',
        accountType: 'researcher',
        accountTypes: ['researcher', 'student', 'startup'],
      },
    });
    expect(multiRoleRes.status(), 'Multi-role profile update should return 200').toBe(200);
    const updatedProfile = (await multiRoleRes.json()) as {
      accountType: string;
      handle: string;
      roles: Array<{ roleCode: string; isPrimary: boolean }>;
    };
    expect(updatedProfile.accountType).toBe('researcher');
    const roleCodes = updatedProfile.roles.map((r) => r.roleCode);
    expect(roleCodes).toEqual(expect.arrayContaining(['researcher', 'student', 'startup']));
    expect(updatedProfile.roles.find((r) => r.roleCode === 'researcher')?.isPrimary).toBe(true);

    // 4. Check DB-configured project posting quota (2 free projects, ₹89 from 3rd onwards)
    const initialQuotaRes = await request.get(`${API_BASE}/projects/posting-quota`, {
      headers: authHeaders,
    });
    expect(initialQuotaRes.status()).toBe(200);
    const initialQuota = (await initialQuotaRes.json()) as {
      freeProjectLimit: number;
      authoredProjectsCount: number;
      freeProjectsRemaining: number;
      availablePaidSlots: number;
      pricePerProjectPaise: number;
      pricePerProjectInr: number;
      requiresPaymentForNextProject: boolean;
      canCreateProjectNow: boolean;
    };
    expect(initialQuota.freeProjectLimit).toBe(2);
    expect(initialQuota.authoredProjectsCount).toBe(0);
    expect(initialQuota.freeProjectsRemaining).toBe(2);
    expect(initialQuota.pricePerProjectPaise).toBe(8900);
    expect(initialQuota.pricePerProjectInr).toBe(89);
    expect(initialQuota.requiresPaymentForNextProject).toBe(false);
    expect(initialQuota.canCreateProjectNow).toBe(true);

    const makeProjectPayload = (num: number) => ({
      title: `Playwright API Project #${num} (${suffix.slice(-4)})`,
      brief: `Automated backend E2E verification project #${num}.`,
      sector: 'Computing & AI',
      media: [
        {
          kind: 'image',
          url: `https://cdn.collab47.test/projects/pw-${suffix}-${num}.png`,
          title: `Cover ${num}`,
          isCover: true,
        },
        ...(num === 1
          ? [
              {
                kind: 'video',
                url: `https://cdn.collab47.test/projects/pw-${suffix}-${num}.mp4`,
                title: `Demo Video ${num}`,
                isCover: false,
              },
            ]
          : []),
      ],
    });

    // Save Draft on Step 1 (no cover image / brief yet) -> 201 and must NOT consume free quota!
    const draftRes = await request.post(`${API_BASE}/projects`, {
      headers: authHeaders,
      data: {
        title: `Playwright Draft Project ${suffix}`,
        sector: 'Computing & AI',
        isDraft: true,
      },
    });
    expect(draftRes.status(), 'Draft save without media must succeed').toBe(201);
    const createdDraft = (await draftRes.json()) as { id: string; isDraft: boolean };
    expect(createdDraft.isDraft).toBe(true);

    // Quota should still show 0 published projects used (2 free remaining)
    const afterDraftQuotaRes = await request.get(`${API_BASE}/projects/posting-quota`, {
      headers: authHeaders,
    });
    expect(afterDraftQuotaRes.status()).toBe(200);
    const afterDraftQuota = (await afterDraftQuotaRes.json()) as typeof initialQuota;
    expect(afterDraftQuota.authoredProjectsCount).toBe(0);
    expect(afterDraftQuota.freeProjectsRemaining).toBe(2);

    // Upload media to draft & publish it on Step 6 -> becomes Free Project #1
    const draftMediaRes = await request.post(`${API_BASE}/projects/${createdDraft.id}/media`, {
      headers: authHeaders,
      data: {
        items: [
          {
            kind: 'image',
            url: `https://cdn.collab47.test/projects/pw-${suffix}-1.jpg`,
            title: 'Cover 1',
            isCover: true,
          },
          {
            kind: 'video',
            url: `https://cdn.collab47.test/projects/pw-${suffix}-1.mp4`,
            title: 'Demo Video 1',
            isCover: false,
          },
        ],
      },
    });
    expect(draftMediaRes.status()).toBe(201);

    const p1Res = await request.patch(`${API_BASE}/projects/${createdDraft.id}`, {
      headers: authHeaders,
      data: {
        title: `Playwright Project #1 (${suffix})`,
        brief: 'End-to-end verified project #1 built for Viksit Bharat 2047.',
        sector: 'Computing & AI',
        isDraft: false,
      },
    });
    expect(p1Res.status(), 'Publishing saved draft #1 must succeed for free').toBe(200);
    const publishedP1 = (await p1Res.json()) as { isDraft: boolean };
    expect(publishedP1.isDraft).toBe(false);

    // Post Free Project #2 -> 201
    const p2Res = await request.post(`${API_BASE}/projects`, {
      headers: authHeaders,
      data: makeProjectPayload(2),
    });
    expect(p2Res.status(), '2nd project must succeed for free').toBe(201);

    // Quota now requires payment
    const exhaustedQuotaRes = await request.get(`${API_BASE}/projects/posting-quota`, {
      headers: authHeaders,
    });
    expect(exhaustedQuotaRes.status()).toBe(200);
    const exhaustedQuota = (await exhaustedQuotaRes.json()) as typeof initialQuota;
    expect(exhaustedQuota.freeProjectsRemaining).toBe(0);
    expect(exhaustedQuota.requiresPaymentForNextProject).toBe(true);
    expect(exhaustedQuota.canCreateProjectNow).toBe(false);

    // Attempt Project #3 without paying -> HTTP 402 PROJECT_PAYMENT_REQUIRED
    const p3BlockedRes = await request.post(`${API_BASE}/projects`, {
      headers: authHeaders,
      data: makeProjectPayload(3),
    });
    expect(p3BlockedRes.status(), '3rd unpaid project must be blocked with HTTP 402').toBe(402);
    const blockedBody = (await p3BlockedRes.json()) as {
      errorCode: string;
      message: string;
    };
    expect(blockedBody.errorCode).toBe('PROJECT_PAYMENT_REQUIRED');
    expect(blockedBody.message).toContain('₹89');

    // Create ₹89 INR project order -> verify HMAC sandbox signature -> unlock 1 credit
    const createOrderRes = await request.post(`${API_BASE}/membership/payments/create-project-order`, {
      headers: authHeaders,
      data: { preferredMethod: 'upi' },
    });
    expect(createOrderRes.status()).toBe(201);
    const order = (await createOrderRes.json()) as {
      purpose: string;
      gatewayOrderId: string;
      amountPaise: number;
      amountInr: number;
      isSandbox: boolean;
      sandboxPaymentId?: string;
      sandboxSignature?: string;
      receiptNumber: string;
    };
    expect(order.purpose).toBe('project_post');
    expect(order.amountPaise).toBe(8900);
    expect(order.amountInr).toBe(89);

    if (order.isSandbox && order.sandboxPaymentId && order.sandboxSignature) {
      const verifyRes = await request.post(`${API_BASE}/membership/payments/verify`, {
        headers: authHeaders,
        data: {
          gatewayOrderId: order.gatewayOrderId,
          gatewayPaymentId: order.sandboxPaymentId,
          gatewaySignature: order.sandboxSignature,
          paymentMethod: 'upi',
          paymentMethodDetails: { upiApp: 'gpay', upiVpaMasked: 'pw***@okicici' },
        },
      });
      expect(verifyRes.status()).toBe(200);
      const verified = (await verifyRes.json()) as {
        verified: boolean;
        purpose: string;
        quota: typeof initialQuota;
      };
      expect(verified.verified).toBe(true);
      expect(verified.purpose).toBe('project_post');
      expect(verified.quota.availablePaidSlots).toBe(1);
      expect(verified.quota.canCreateProjectNow).toBe(true);

      // Post Project #3 -> succeeds (201) and atomically consumes paid credit
      const p3SuccessRes = await request.post(`${API_BASE}/projects`, {
        headers: authHeaders,
        data: makeProjectPayload(3),
      });
      expect(p3SuccessRes.status(), '3rd project should succeed after ₹89 payment').toBe(201);
      const p3 = (await p3SuccessRes.json()) as { id: string; title: string };

      // Check GET /membership/billing -> slot consumed & receipt linked to Project #3
      const billingRes = await request.get(`${API_BASE}/membership/billing`, {
        headers: authHeaders,
      });
      expect(billingRes.status()).toBe(200);
      const billing = (await billingRes.json()) as {
        quota: typeof initialQuota;
        recentPayments: Array<{
          receiptNumber: string;
          status: string;
          purpose: string;
          projectId: string | null;
          projectTitle: string | null;
          amountInr: number;
        }>;
      };
      expect(billing.quota.availablePaidSlots).toBe(0);
      expect(billing.quota.authoredProjectsCount).toBe(3);
      const matchedTx = billing.recentPayments.find((t) => t.receiptNumber === order.receiptNumber);
      expect(matchedTx).toBeTruthy();
      expect(matchedTx?.status).toBe('captured');
      expect(matchedTx?.projectId).toBe(p3.id);
      expect(matchedTx?.projectTitle).toBe(p3.title);
      expect(matchedTx?.amountInr).toBe(89);

      // Attempting Project #4 without paying must return HTTP 402 again
      const p4BlockedRes = await request.post(`${API_BASE}/projects`, {
        headers: authHeaders,
        data: makeProjectPayload(4),
      });
      expect(p4BlockedRes.status(), '4th unpaid project must require payment again').toBe(402);
    }

    // 5. Activity Badges — publish a post, like it, and verify badges across images, videos, posts, projects & profile
    const catalogRes = await request.get(`${API_BASE}/badges/catalog`);
    expect(catalogRes.status()).toBe(200);
    const catalog = (await catalogRes.json()) as Array<{ badgeCode: string; category: string }>;
    expect(catalog.length).toBeGreaterThanOrEqual(14);
    const categories = new Set(catalog.map((b) => b.category));
    for (const cat of ['images', 'videos', 'posts', 'feeds', 'projects', 'profile']) {
      expect(categories.has(cat), `Badge catalog should include category '${cat}'`).toBe(true);
    }

    const postRes = await request.post(`${API_BASE}/dashboard/posts`, {
      headers: authHeaders,
      data: {
        body: 'Launching our Playwright verified build update on Collab47!',
        postType: 'project_showcase',
        tags: ['playwright', 'e2e'],
        media: [
          {
            kind: 'image',
            url: 'https://cdn.collab47.in/e2e/post-cover.jpg',
            title: 'Playwright Build Cover',
            isCover: true,
          },
        ],
      },
    });
    expect(postRes.status()).toBe(201);
    const createdPost = (await postRes.json()) as { id: string };

    const likeRes = await request.post(`${API_BASE}/dashboard/posts/${createdPost.id}/like`, {
      headers: authHeaders,
    });
    expect([200, 201]).toContain(likeRes.status());

    const myBadgesRes = await request.get(`${API_BASE}/badges/me`, {
      headers: authHeaders,
    });
    expect(myBadgesRes.status()).toBe(200);
    const myBadges = (await myBadgesRes.json()) as {
      totalPoints: number;
      earnedCount: number;
      totalBadges: number;
      level: number;
      badges: Array<{ badgeCode: string; earned: boolean }>;
    };

    const earnedCodes = myBadges.badges.filter((b) => b.earned).map((b) => b.badgeCode);
    expect(earnedCodes).toEqual(
      expect.arrayContaining([
        'first_image_upload',
        'first_video_upload',
        'first_post',
        'first_project',
        'serial_builder',
        'profile_architect',
        'multi_persona_creator',
      ]),
    );
    expect(myBadges.totalPoints).toBeGreaterThanOrEqual(100);

    // Public portfolio badges endpoint
    const publicBadgesRes = await request.get(
      `${API_BASE}/badges/u/${encodeURIComponent(updatedProfile.handle)}`,
    );
    expect(publicBadgesRes.status()).toBe(200);
    const publicBadges = (await publicBadgesRes.json()) as {
      earnedCount: number;
      badges: Array<{ badgeCode: string; earned: boolean }>;
    };
    expect(publicBadges.earnedCount).toBe(myBadges.earnedCount);
    expect(publicBadges.badges.every((b) => b.earned)).toBe(true);
  });

  test('10-Account Multi-User Lifecycle (Password123@): register/login, save drafts, publish projects, publish feeds & cross-account engagement', async ({
    request,
  }) => {
    const runTag = `${Date.now().toString().slice(-6)}`;
    const sessions: Array<{
      email: string;
      name: string;
      token: string;
      userId: string;
      publishedProjectId: string;
      draftOnlyProjectId: string;
      feedPostId: string;
    }> = [];

    for (const acc of TEN_E2E_ACCOUNTS) {
      // 1. Login with Password123@ if already registered, else register with Password123@
      let token = '';
      let userId = '';
      const clientIpHeader = { 'x-forwarded-for': `203.0.113.${10 + acc.index}` };

      const initialLoginRes = await request.post(`${API_BASE}/auth/login`, {
        headers: clientIpHeader,
        data: {
          email: acc.email,
          password: SHARED_E2E_PASSWORD,
          rememberMe: true,
        },
      });

      if (initialLoginRes.status() === 200) {
        const loginBody = (await initialLoginRes.json()) as {
          user: { id: string };
          tokens: { accessToken: string };
        };
        token = loginBody.tokens.accessToken;
        userId = loginBody.user.id;
      } else {
        const regRes = await request.post(`${API_BASE}/auth/register`, {
          headers: clientIpHeader,
          data: {
            name: acc.name,
            email: acc.email,
            mobileCountryCode: '+91',
            mobileNumber: acc.mobileNumber,
            password: SHARED_E2E_PASSWORD,
            confirmPassword: SHARED_E2E_PASSWORD,
          },
        });
        expect(regRes.status(), `Registration failed for ${acc.email}`).toBe(201);
        const regBody = (await regRes.json()) as {
          user: { id: string };
          tokens: { accessToken: string };
          redirectTo: string;
        };
        expect(regBody.redirectTo).toBe('/onboarding');
        token = regBody.tokens.accessToken;
        userId = regBody.user.id;
      }

      const authHeaders = { Authorization: `Bearer ${token}` };

      // 2. Update profile with multi-role account personas
      const profileRes = await request.patch(`${API_BASE}/profile/basic-info`, {
        headers: authHeaders,
        data: {
          name: acc.name,
          headline: `${acc.primaryPersona.toUpperCase()} & ${acc.extraPersona.toUpperCase()} · Collab47 Innovator`,
          accountType: acc.primaryPersona,
          accountTypes: [acc.primaryPersona, acc.extraPersona],
        },
      });
      expect(profileRes.status(), `Profile update failed for ${acc.email}`).toBe(200);

      // 3. Save Draft on Step 1 (no cover image / brief yet) -> 201
      const draft1Res = await request.post(`${API_BASE}/projects`, {
        headers: authHeaders,
        data: {
          title: `${acc.projectTitle} (${runTag})`,
          sector: 'Computing & AI',
          isDraft: true,
        },
      });
      expect(draft1Res.status(), `Step 1 draft save failed for ${acc.email}`).toBe(201);
      const draft1 = (await draft1Res.json()) as { id: string; isDraft: boolean };
      expect(draft1.isDraft).toBe(true);

      // 4. Update Draft on Step 3 (tags + milestones + problem statement)
      const draftUpdateRes = await request.patch(`${API_BASE}/projects/${draft1.id}`, {
        headers: authHeaders,
        data: {
          brief: acc.projectBrief,
          problemStatement: `Solving critical Viksit Bharat 2047 challenge for ${acc.projectTitle}.`,
          tags: [acc.feedTag, 'viksit-bharat', 'collab47'],
          milestones: [
            { title: 'Architecture & BOM', status: 'completed' },
            { title: 'Field Pilot Validation', status: 'in_progress' },
          ],
          isDraft: true,
        },
      });
      expect(draftUpdateRes.status(), `Step 3 draft update failed for ${acc.email}`).toBe(200);

      // 5. Upload Cover Image on Step 4
      const mediaRes = await request.post(`${API_BASE}/projects/${draft1.id}/media`, {
        headers: authHeaders,
        data: {
          items: [
            {
              kind: 'image',
              url: `https://cdn.collab47.test/e2e/u${acc.index}-${runTag}-cover.jpg`,
              title: `${acc.projectTitle} Cover`,
              isCover: true,
            },
          ],
        },
      });
      expect(mediaRes.status(), `Media attach failed for ${acc.email}`).toBe(201);

      // 6. Check quota — if user already used 2 free slots from earlier runs, unlock ₹89 sandbox slot automatically
      const quotaRes = await request.get(`${API_BASE}/projects/posting-quota`, {
        headers: authHeaders,
      });
      expect(quotaRes.status()).toBe(200);
      const quota = (await quotaRes.json()) as { requiresPaymentForNextProject: boolean };
      if (quota.requiresPaymentForNextProject) {
        const orderRes = await request.post(`${API_BASE}/membership/payments/create-project-order`, {
          headers: authHeaders,
          data: { preferredMethod: 'upi' },
        });
        expect(orderRes.status()).toBe(201);
        const order = (await orderRes.json()) as {
          gatewayOrderId: string;
          isSandbox: boolean;
          sandboxPaymentId?: string;
          sandboxSignature?: string;
        };
        if (order.isSandbox && order.sandboxPaymentId && order.sandboxSignature) {
          const verifyRes = await request.post(`${API_BASE}/membership/payments/verify`, {
            headers: authHeaders,
            data: {
              gatewayOrderId: order.gatewayOrderId,
              gatewayPaymentId: order.sandboxPaymentId,
              gatewaySignature: order.sandboxSignature,
              paymentMethod: 'upi',
            },
          });
          expect(verifyRes.status()).toBe(200);
        }
      }

      // 7. Publish the saved draft on Step 6 (isDraft: false)
      const publishRes = await request.patch(`${API_BASE}/projects/${draft1.id}`, {
        headers: authHeaders,
        data: {
          title: `${acc.projectTitle} (${runTag})`,
          brief: acc.projectBrief,
          sector: 'Computing & AI',
          isDraft: false,
        },
      });
      expect(publishRes.status(), `Step 6 publish failed for ${acc.email}`).toBe(200);
      const published = (await publishRes.json()) as { id: string; isDraft: boolean };
      expect(published.isDraft).toBe(false);

      // 8. Also save a second project strictly as Draft (must stay draft and not consume quota)
      const draftOnlyRes = await request.post(`${API_BASE}/projects`, {
        headers: authHeaders,
        data: {
          title: `${acc.draftOnlyTitle} (${runTag})`,
          sector: 'Other',
          isDraft: true,
        },
      });
      expect(draftOnlyRes.status(), `Draft-only save failed for ${acc.email}`).toBe(201);
      const draftOnly = (await draftOnlyRes.json()) as { id: string; isDraft: boolean };
      expect(draftOnly.isDraft).toBe(true);

      // 9. Publish a Feed Post showcasing the published project
      const postRes = await request.post(`${API_BASE}/dashboard/posts`, {
        headers: authHeaders,
        data: {
          body: `${acc.feedPostBody} [${runTag}]`,
          postType: 'project_showcase',
          attachedProjectId: published.id,
          tags: [acc.feedTag, 'collab47'],
          media: [
            {
              kind: 'image',
              url: `https://cdn.collab47.test/e2e/u${acc.index}-${runTag}-post.jpg`,
              title: `${acc.name} Feed Showcase`,
              isCover: true,
            },
          ],
        },
      });
      expect(postRes.status(), `Feed post failed for ${acc.email}`).toBe(201);
      const createdPost = (await postRes.json()) as { id: string };

      sessions.push({
        email: acc.email,
        name: acc.name,
        token,
        userId,
        publishedProjectId: published.id,
        draftOnlyProjectId: draftOnly.id,
        feedPostId: createdPost.id,
      });
    }

    expect(sessions.length).toBe(10);

    // 10. Cross-account feed engagement across all 10 accounts (Like + Comment + Bookmark + Repost)
    for (let i = 0; i < sessions.length; i += 1) {
      const actor = sessions[i]!;
      const target = sessions[(i + 1) % sessions.length]!;
      const headers = { Authorization: `Bearer ${actor.token}` };

      const likeRes = await request.post(`${API_BASE}/dashboard/posts/${target.feedPostId}/like`, {
        headers,
      });
      expect([200, 201]).toContain(likeRes.status());

      const commentRes = await request.post(
        `${API_BASE}/dashboard/posts/${target.feedPostId}/comments`,
        {
          headers,
          data: { body: `Awesome build, ${target.name}! Looking forward to collaborating.` },
        },
      );
      expect([200, 201]).toContain(commentRes.status());

      const bookmarkRes = await request.post(
        `${API_BASE}/dashboard/posts/${target.feedPostId}/bookmark`,
        { headers },
      );
      expect([200, 201]).toContain(bookmarkRes.status());

      const repostRes = await request.post(
        `${API_BASE}/dashboard/posts/${target.feedPostId}/repost`,
        { headers },
      );
      expect([200, 201]).toContain(repostRes.status());

      // Verify feed returns posts & badges are unlocked for every one of the 10 accounts
      const feedRes = await request.get(`${API_BASE}/dashboard/feed`, { headers });
      expect(feedRes.status()).toBe(200);
      const feedItems = (await feedRes.json()) as Array<{ id: string }>;
      expect(feedItems.length).toBeGreaterThanOrEqual(1);

      const badgesRes = await request.get(`${API_BASE}/badges/me`, { headers });
      expect(badgesRes.status()).toBe(200);
      const badgeSummary = (await badgesRes.json()) as {
        earnedCount: number;
        badges: Array<{ badgeCode: string; earned: boolean }>;
      };
      const earned = badgeSummary.badges.filter((b) => b.earned).map((b) => b.badgeCode);
      expect(earned).toEqual(
        expect.arrayContaining([
          'first_project',
          'first_post',
          'first_image_upload',
          'profile_architect',
          'multi_persona_creator',
        ]),
      );
    }
  });
});
