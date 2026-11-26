import type { Page, Route } from '@playwright/test';
import type {
  AccountType,
  AuthUser,
  PublicRoleOption,
} from '../../../src/lib/api/types';

export interface MockRegisteredAccount {
  user: AuthUser;
  password: string;
}

export interface MockApiController {
  readonly accounts: Map<string, MockRegisteredAccount>;
  readonly requests: Array<{ method: string; path: string; status: number }>;
  /** Inject a one-time fault for a matching API path (e.g. simulate HTTP 500 or 429). */
  failNext(
    pathPattern: RegExp,
    status: number,
    errorPayload: { errorCode: string; message: string },
  ): void;
  clearFaults(): void;
}

const MOCK_PUBLIC_ROLES: PublicRoleOption[] = [
  {
    id: 'role-student',
    roleCode: 'student',
    roleName: 'Student',
    roleCategory: 'public',
    roleDescription: 'UG/PG student building projects & proof of work.',
    badgeLabel: 'Student',
    hierarchyLevel: 1,
  },
  {
    id: 'role-researcher',
    roleCode: 'researcher',
    roleName: 'Researcher',
    roleCategory: 'public',
    roleDescription: 'PhD scholar, fellow & open lab researcher.',
    badgeLabel: 'Researcher',
    hierarchyLevel: 2,
  },
  {
    id: 'role-scientist',
    roleCode: 'scientist',
    roleName: 'Scientist',
    roleCategory: 'public',
    roleDescription: 'Applied scientist & R&D specialist.',
    badgeLabel: 'Scientist',
    hierarchyLevel: 3,
  },
  {
    id: 'role-faculty',
    roleCode: 'faculty',
    roleName: 'Faculty',
    roleCategory: 'public',
    roleDescription: 'Professor, academic faculty & principal investigator.',
    badgeLabel: 'Faculty',
    hierarchyLevel: 4,
  },
  {
    id: 'role-industry',
    roleCode: 'industry',
    roleName: 'Industry',
    roleCategory: 'public',
    roleDescription: 'Industry R&D partner, engineer & technical recruiter.',
    badgeLabel: 'Industry',
    hierarchyLevel: 5,
  },
  {
    id: 'role-startup',
    roleCode: 'startup',
    roleName: 'Startup',
    roleCategory: 'public',
    roleDescription: 'Startup founder, deep-tech builder & innovation team.',
    badgeLabel: 'Startup',
    hierarchyLevel: 6,
  },
  {
    id: 'role-government',
    roleCode: 'government',
    roleName: 'Government',
    roleCategory: 'public',
    roleDescription: 'Government agency, national lab & public mission steward.',
    badgeLabel: 'Government',
    hierarchyLevel: 7,
  },
  {
    id: 'role-others',
    roleCode: 'others',
    roleName: 'Others',
    roleCategory: 'public',
    roleDescription: 'Independent innovator, mentor & ecosystem contributor.',
    badgeLabel: 'Others',
    hierarchyLevel: 8,
  },
];

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function createMockJwt(userId: string, email: string): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(
    JSON.stringify({
      sub: userId,
      email,
      iat: nowSec,
      exp: nowSec + 3600,
    }),
  );
  return `${header}.${payload}.mock-playwright-signature`;
}

function createMockUser(input: {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
  mobileCountryCode?: string;
  mobileNumber?: string;
}): AuthUser {
  const roleOption =
    MOCK_PUBLIC_ROLES.find((role) => role.roleCode === input.accountType) ?? MOCK_PUBLIC_ROLES[0];
  const handleBase = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);

  return {
    id: input.id,
    email: input.email.toLowerCase(),
    handle: `${handleBase || 'innovator'}_${input.id.slice(-4)}`,
    name: input.name,
    mobileCountryCode: input.mobileCountryCode ?? '+91',
    mobileNumber: input.mobileNumber ?? '9876543210',
    accountType: input.accountType,
    primaryRole: roleOption.roleCode,
    primaryRoleId: roleOption.id,
    roles: [
      {
        roleId: roleOption.id,
        roleCode: roleOption.roleCode,
        roleName: roleOption.roleName,
        badgeLabel: roleOption.badgeLabel,
        isPrimary: true,
        scopeType: 'global',
      },
    ],
    occupations: [],
    occupationOther: null,
    college: 'IIT Bombay',
    branch: 'Computer Science & Engineering',
    yearOfStudy: '3',
    city: 'Mumbai',
    avatarUrl: null,
    isEmailVerified: true,
    visibility: 'public',
    openToCollaborations: true,
    membershipTier: 'free',
    membershipPlanCode: 'free',
    adsEnabled: false,
    membershipExpiresAt: null,
    primaryIndustryId: null,
    createdAt: new Date().toISOString(),
  };
}

function buildMockOverview() {
  return {
    metrics: {
      projectsPosted: 4,
      projectsGrowthLabel: '+2 this month',
      followersCount: 128,
      followersGrowthLabel: '+14% this week',
      followingCount: 42,
      postViews: 1940,
      postViewsGrowthLabel: '+18% this week',
      likesCount: 312,
      githubReposCount: 6,
    },
    activityBreakdown: {
      totalProjects: 4,
      codeCount: 12,
      mediaCount: 7,
      documentsCount: 5,
      otherCount: 3,
    },
    trendingTags: [
      { tag: 'AI', count: 42 },
      { tag: 'Robotics', count: 29 },
      { tag: 'ViksitBharat2047', count: 24 },
      { tag: 'CleanTech', count: 18 },
    ],
    communities: [
      {
        id: 'comm-1',
        slug: 'ai-systems-india',
        name: 'AI Systems & Edge ML India',
        description: 'Open benchmarks, sovereign datasets, and embedded AI prototypes.',
        category: 'Artificial Intelligence',
        membersCount: 1420,
        isJoined: true,
      },
    ],
    upcomingEvents: [
      {
        id: 'evt-1',
        title: 'National Deep-Tech Proof-of-Work Demo Day',
        organizer: 'Collab47 Research Guild',
        type: 'demo_day',
        mode: 'hybrid',
        venue: 'IIT Madras Research Park / Live Stream',
        startTime: new Date(Date.now() + 86_400_000 * 3).toISOString(),
        endTime: new Date(Date.now() + 86_400_000 * 3 + 7_200_000).toISOString(),
        rsvpCount: 285,
        userRsvpStatus: null,
      },
    ],
    suggestedPeople: [
      {
        id: 'u-suggested-1',
        name: 'Dr. Kavita Nair',
        handle: 'kavita_nair_iisc',
        accountType: 'scientist',
        headline: 'Principal Scientist · Quantum Photonics',
        college: 'IISc Bengaluru',
        avatarUrl: null,
        isFollowing: false,
      },
    ],
    featuredProject: {
      id: 'proj-featured-1',
      title: 'Autonomous Solar Micro-Grid Controller',
      brief: 'Edge-AI inverter telemetry and predictive load balancing for rural micro-grids.',
      sector: 'Clean Energy',
      tags: ['CleanTech', 'Embedded', 'IoT'],
      coverUrl: null,
      coverType: null,
      authorName: 'Ananya Sharma',
      authorHandle: 'ananya_sharma_1001',
      authorSubtitle: 'Researcher · IIT Bombay',
      authorAvatarUrl: null,
      viewsCount: 840,
      contributorsCount: 4,
    },
    projectShowcase: [],
  };
}

function buildMockWorkspace() {
  return {
    opportunities: [
      {
        id: 'opp-1',
        title: 'Winter R&D Fellowship — Autonomous Systems',
        organization: 'ISRO-Academia Innovation Hub',
        opportunityType: 'fellowship',
        workMode: 'hybrid',
        sector: 'Aerospace & Robotics',
        compensation: '₹45,000 / month',
        targetRoles: ['student', 'researcher', 'scientist'],
      },
    ],
    studentMilestones: [
      {
        id: 'ms-1',
        step: 1,
        title: 'Publish first living workbench project',
        projectTitle: 'Autonomous Solar Micro-Grid Controller',
        completed: true,
        dueLabel: 'Completed',
        description: 'Document problem statement, architecture, and initial code deliverables.',
        missingActionHint: '',
        fixActionType: 'create_project',
        fixActionLabel: 'Create Project',
      },
    ],
    researchArtifacts: [
      {
        id: 'art-1',
        title: 'Low-Power Edge Inference on RISC-V Telemetry Nodes',
        artifactType: 'preprint',
        venue: 'arXiv / IEEE IndiaCom',
        domain: 'Embedded AI',
        status: 'under_review',
        coAuthorsCount: 3,
      },
    ],
    attestationQueue: [],
    talentCandidates: [],
    institutionalMissions: [],
    mentorshipRequests: [],
    facultySummary: {
      activeCapstoneTeams: 2,
      verifiedDeliverablesSigned: 5,
      sponsoredGrantsCount: 1,
    },
    advisorSlots: [],
  };
}

function buildMockFeedPosts() {
  return [
    {
      id: 'post-mock-1',
      authorId: 'user-demo-student',
      authorName: 'Ananya Sharma',
      authorHandle: 'ananya_sharma_1001',
      authorRole: 'student',
      authorSubtitle: 'B.Tech CSE · IIT Bombay',
      authorAvatarUrl: null,
      postType: 'project_update',
      projectId: 'proj-featured-1',
      projectTitle: 'Autonomous Solar Micro-Grid Controller',
      locationLabel: 'Mumbai, India',
      body: 'Completed hardware-in-the-loop testing for our solar micro-grid load predictor with 96.4% accuracy.',
      tags: ['CleanTech', 'AI', 'Hardware'],
      media: [],
      likesCount: 24,
      commentsCount: 0,
      repostCount: 3,
      viewsCount: 192,
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
      isFollowingAuthor: false,
      canEdit: false,
      comments: [],
      createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    },
  ];
}

function buildMockPlans() {
  return [
    {
      id: 'plan-free',
      planCode: 'free',
      tier: 'free',
      name: 'Free Membership',
      description: 'Start building your verified proof-of-work identity at zero cost.',
      billingCycle: 'forever',
      amountPaise: 0,
      amountInr: 0,
      currency: 'INR',
      adsEnabled: true,
      features: [
        'Full 5-section progressive profile & @handle portfolio',
        'Role-based workspace dashboard & community feed',
        'Publish up to 5 active living workbench projects',
      ],
    },
    {
      id: 'plan-premium-monthly',
      planCode: 'premium_monthly',
      tier: 'premium',
      name: 'Premium Membership (Monthly)',
      description: '100% ad-free innovation workspace with priority discovery.',
      billingCycle: 'monthly',
      amountPaise: 49900,
      amountInr: 499,
      currency: 'INR',
      adsEnabled: false,
      features: [
        '100% Ad-Free experience',
        'Unlimited living workbench projects & deliverables',
        'Verified Premium Innovator badge',
      ],
    },
    {
      id: 'plan-premium-yearly',
      planCode: 'premium_yearly',
      tier: 'premium',
      name: 'Premium Membership (Annual)',
      description: 'Best value annual plan — 2 months free.',
      billingCycle: 'yearly',
      amountPaise: 499900,
      amountInr: 4999,
      currency: 'INR',
      adsEnabled: false,
      features: [
        '100% Ad-Free experience',
        'Save ₹989/year compared to monthly billing',
        'Priority Proof-of-Work placement',
      ],
    },
  ];
}

/**
 * Installs a stateful Playwright network mock for all `/api/v1/**` calls.
 * Supports pre-seeded mock accounts, live registration, duplicate email detection,
 * credential verification, membership plan selection, and full dashboard hydration
 * without touching the production database.
 */
export async function installMockCollab47Api(page: Page): Promise<MockApiController> {
  const accounts = new Map<string, MockRegisteredAccount>();
  const requests: Array<{ method: string; path: string; status: number }> = [];
  const faults: Array<{
    pathPattern: RegExp;
    status: number;
    errorPayload: { errorCode: string; message: string };
  }> = [];

  // Seed default mock accounts for direct login tests
  const seededStudent = createMockUser({
    id: 'user-mock-1001',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@iitb.ac.in',
    accountType: 'student',
    mobileCountryCode: '+91',
    mobileNumber: '9876543210',
  });
  accounts.set(seededStudent.email, {
    user: seededStudent,
    password: 'MockUser@2026!',
  });

  const seededResearcher = createMockUser({
    id: 'user-mock-1002',
    name: 'Dr. Arjun Rao',
    email: 'arjun.rao@iisc.ac.in',
    accountType: 'researcher',
    mobileCountryCode: '+91',
    mobileNumber: '9811223344',
  });
  accounts.set(seededResearcher.email, {
    user: seededResearcher,
    password: 'MockUser@2026!',
  });

  let activeUser: AuthUser = seededStudent;
  let userCounter = 2000;

  async function fulfillJson(route: Route, status: number, body: unknown, path: string): Promise<void> {
    requests.push({ method: route.request().method(), path, status });
    await route.fulfill({
      status,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': 'true',
        'x-request-id': `mock-req-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });
  }

  await page.route('**/api/v1/**', async (route: Route) => {
    const req = route.request();
    const method = req.method().toUpperCase();
    const url = new URL(req.url());
    const apiPath = url.pathname.replace(/^.*\/api\/v1/, '') || '/';

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'access-control-allow-headers': 'Content-Type,Authorization',
        },
      });
      return;
    }

    // Check injected one-time faults first
    const faultIndex = faults.findIndex((f) => f.pathPattern.test(apiPath));
    if (faultIndex !== -1) {
      const [fault] = faults.splice(faultIndex, 1);
      await fulfillJson(
        route,
        fault.status,
        {
          statusCode: fault.status,
          errorCode: fault.errorPayload.errorCode,
          message: fault.errorPayload.message,
          timestamp: new Date().toISOString(),
          path: `/api/v1${apiPath}`,
        },
        apiPath,
      );
      return;
    }

    // --- Auth endpoints ---
    if (method === 'GET' && apiPath === '/auth/public-roles') {
      await fulfillJson(
        route,
        200,
        { roles: MOCK_PUBLIC_ROLES, total: MOCK_PUBLIC_ROLES.length },
        apiPath,
      );
      return;
    }

    if (method === 'POST' && apiPath === '/auth/register') {
      const payload = (req.postDataJSON() ?? {}) as {
        name?: string;
        email?: string;
        password?: string;
        accountType?: AccountType;
        mobileCountryCode?: string;
        mobileNumber?: string;
      };
      const normalizedEmail = (payload.email ?? '').trim().toLowerCase();

      if (!normalizedEmail || !payload.password || !payload.name) {
        await fulfillJson(
          route,
          400,
          {
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
            message: 'Please provide all required registration fields.',
          },
          apiPath,
        );
        return;
      }

      if (accounts.has(normalizedEmail)) {
        await fulfillJson(
          route,
          409,
          {
            statusCode: 409,
            errorCode: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email address already exists.',
            details: [{ field: 'email', messages: ['This email is already registered.'] }],
          },
          apiPath,
        );
        return;
      }

      userCounter += 1;
      const newUser = createMockUser({
        id: `user-mock-${userCounter}`,
        name: payload.name.trim(),
        email: normalizedEmail,
        accountType: payload.accountType ?? 'student',
        mobileCountryCode: payload.mobileCountryCode,
        mobileNumber: payload.mobileNumber,
      });

      accounts.set(normalizedEmail, {
        user: newUser,
        password: payload.password,
      });
      activeUser = newUser;

      await fulfillJson(
        route,
        201,
        {
          user: newUser,
          tokens: {
            accessToken: createMockJwt(newUser.id, newUser.email),
            refreshToken: `mock-refresh-${newUser.id}`,
            expiresIn: 3600,
            tokenType: 'Bearer',
          },
          redirectTo: '/signup/plan',
          joinedProjectTitles: [],
        },
        apiPath,
      );
      return;
    }

    if (method === 'POST' && apiPath === '/auth/login') {
      const payload = (req.postDataJSON() ?? {}) as { email?: string; password?: string };
      const normalizedEmail = (payload.email ?? '').trim().toLowerCase();
      const record = accounts.get(normalizedEmail);

      if (!record || record.password !== payload.password) {
        await fulfillJson(
          route,
          401,
          {
            statusCode: 401,
            errorCode: 'INVALID_CREDENTIALS',
            message: 'Invalid email address or password.',
          },
          apiPath,
        );
        return;
      }

      activeUser = record.user;
      await fulfillJson(
        route,
        200,
        {
          user: record.user,
          tokens: {
            accessToken: createMockJwt(record.user.id, record.user.email),
            refreshToken: `mock-refresh-${record.user.id}`,
            expiresIn: 3600,
            tokenType: 'Bearer',
          },
          accountRestored: false,
        },
        apiPath,
      );
      return;
    }

    if (method === 'POST' && apiPath === '/auth/refresh') {
      await fulfillJson(
        route,
        200,
        {
          tokens: {
            accessToken: createMockJwt(activeUser.id, activeUser.email),
            refreshToken: `mock-refresh-${activeUser.id}`,
            expiresIn: 3600,
            tokenType: 'Bearer',
          },
        },
        apiPath,
      );
      return;
    }

    if (method === 'GET' && apiPath === '/auth/me') {
      await fulfillJson(route, 200, activeUser, apiPath);
      return;
    }

    if (method === 'POST' && apiPath === '/auth/logout') {
      await fulfillJson(route, 200, { success: true }, apiPath);
      return;
    }

    // --- Membership endpoints ---
    if (method === 'GET' && apiPath === '/membership/plans') {
      await fulfillJson(route, 200, buildMockPlans(), apiPath);
      return;
    }

    if (method === 'GET' && apiPath === '/membership/me') {
      await fulfillJson(
        route,
        200,
        {
          tier: 'free',
          planCode: 'free',
          planName: 'Free Membership',
          status: 'active',
          adsEnabled: false,
          startedAt: new Date().toISOString(),
          expiresAt: null,
          autoRenew: false,
          recentPayments: [],
        },
        apiPath,
      );
      return;
    }

    if (method === 'POST' && apiPath === '/membership/select-free') {
      await fulfillJson(
        route,
        200,
        {
          tier: 'free',
          planCode: 'free',
          planName: 'Free Membership',
          status: 'active',
          adsEnabled: false,
          startedAt: new Date().toISOString(),
          expiresAt: null,
          autoRenew: false,
          recentPayments: [],
        },
        apiPath,
      );
      return;
    }

    if (method === 'GET' && apiPath === '/membership/industries') {
      await fulfillJson(
        route,
        200,
        [
          {
            id: 'ind-1',
            code: 'ai_ml',
            name: 'Artificial Intelligence & ML',
            category: 'Deep Tech',
            description: 'Applied AI, robotics, and machine learning systems.',
            displayOrder: 1,
          },
        ],
        apiPath,
      );
      return;
    }

    // --- Dashboard endpoints ---
    if (method === 'GET' && apiPath === '/dashboard/overview') {
      await fulfillJson(route, 200, buildMockOverview(), apiPath);
      return;
    }

    if (method === 'GET' && apiPath === '/dashboard/workspace') {
      await fulfillJson(route, 200, buildMockWorkspace(), apiPath);
      return;
    }

    if (method === 'GET' && apiPath === '/dashboard/feed') {
      await fulfillJson(route, 200, buildMockFeedPosts(), apiPath);
      return;
    }

    if (method === 'GET' && apiPath.startsWith('/dashboard/network/')) {
      await fulfillJson(route, 200, [], apiPath);
      return;
    }

    // --- Supporting endpoints (geo, notifications, profile, projects) ---
    if (method === 'GET' && apiPath === '/geo/detect') {
      await fulfillJson(
        route,
        200,
        {
          countryCode: 'IN',
          countryName: 'India',
          city: 'Mumbai',
          region: 'Maharashtra',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          source: 'mock',
        },
        apiPath,
      );
      return;
    }

    if (method === 'GET' && apiPath.startsWith('/notifications')) {
      await fulfillJson(route, 200, { items: [], unreadCount: 0, total: 0 }, apiPath);
      return;
    }

    if (method === 'GET' && (apiPath === '/profile' || apiPath === '/profile/me' || apiPath === '/profiles/me')) {
      const nowIso = new Date().toISOString();
      await fulfillJson(
        route,
        200,
        {
          id: activeUser.id,
          email: activeUser.email,
          mobileCountryCode: activeUser.mobileCountryCode ?? '+91',
          mobileNumber: activeUser.mobileNumber ?? '9876543210',
          handle: activeUser.handle,
          name: activeUser.name,
          headline: 'Deep-Tech Innovator · Collab47',
          avatarUrl: activeUser.avatarUrl,
          coverImageUrl: null,
          dateOfBirth: null,
          dobPrivacy: 'private',
          accountType: activeUser.accountType,
          primaryRole: activeUser.primaryRole,
          roles: activeUser.roles,
          occupations: activeUser.occupations,
          occupationOther: null,
          bio: 'Building verified STEM proof-of-work on Collab47.',
          professionalSummary: 'Applied AI and hardware systems researcher.',
          college: activeUser.college,
          branch: activeUser.branch,
          yearOfStudy: activeUser.yearOfStudy,
          studentId: null,
          city: activeUser.city,
          country: 'India',
          countryCode: 'IN',
          latitude: null,
          longitude: null,
          geoSource: 'mock',
          geoDetectedAt: nowIso,
          primaryInstitutionId: null,
          primaryOrganizationId: null,
          primaryStemDisciplineId: null,
          visibility: activeUser.visibility,
          openToCollaborations: activeUser.openToCollaborations,
          isEmailVerified: activeUser.isEmailVerified,
          education: [],
          experiences: [],
          skills: [
            {
              id: 'skill-mock-1',
              skillId: 'sk-1',
              category: 'engineering_technical',
              skillName: 'Embedded Systems',
              proficiencyLevel: 'advanced',
            },
          ],
          expertise: {
            broadDomains: [],
            specializations: [],
            areasOfInterest: [],
            interests: ['CleanTech', 'AI'],
          },
          socialLinks: [],
          completenessPercent: 65,
          createdAt: activeUser.createdAt,
          updatedAt: nowIso,
        },
        apiPath,
      );
      return;
    }

    if (method === 'GET' && apiPath.startsWith('/projects')) {
      await fulfillJson(route, 200, [], apiPath);
      return;
    }

    // Safe JSON fallback for any auxiliary read endpoints
    if (method === 'GET') {
      await fulfillJson(route, 200, {}, apiPath);
      return;
    }

    await fulfillJson(route, 200, { success: true }, apiPath);
  });

  return {
    accounts,
    requests,
    failNext(pathPattern, status, errorPayload) {
      faults.push({ pathPattern, status, errorPayload });
    },
    clearFaults() {
      faults.length = 0;
    },
  };
}
