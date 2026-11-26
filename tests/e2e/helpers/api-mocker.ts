import type { Page, Route } from '@playwright/test';
import type {
  AccountType,
  AuthUser,
  EducationItem,
  ExperienceItem,
  FullProfile,
  ProfileEditorOptions,
  PublicRoleOption,
  SkillItem,
  SocialLinkItem,
} from '../../../src/lib/api/types';
import type { ApiProject, ProjectEditorOptions } from '../../../src/lib/api/projects.api';

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

function buildMockProjectOptions(): ProjectEditorOptions {
  return {
    sectors: [
      { id: 'sec-cleantech', code: 'clean_energy', label: 'Clean Energy & Sustainability' },
      { id: 'sec-robotics', code: 'robotics_ai', label: 'Robotics & Autonomous Systems' },
      { id: 'sec-agritech', code: 'agritech', label: 'Precision Agriculture & Drones' },
      { id: 'sec-healthtech', code: 'healthtech', label: 'Healthcare & MedTech' },
    ],
    stemCategories: [
      {
        id: 'stem-eng',
        code: 'engineering_and_technology',
        label: 'Engineering & Technology',
      },
      {
        id: 'stem-cs',
        code: 'computer_science_and_digital_technologies',
        label: 'Computer Science & Digital Technologies',
      },
    ],
    stemDisciplines: [
      {
        id: 'disc-robotics',
        code: 'robotics_autonomous_systems',
        label: 'Robotics & Autonomous Systems',
        parentId: 'stem-eng',
      },
      {
        id: 'disc-ai',
        code: 'artificial_intelligence',
        label: 'Artificial Intelligence & Machine Learning',
        parentId: 'stem-cs',
      },
    ],
    broadDomains: [
      { id: 'dom-ai', code: 'ai_data', label: 'Artificial Intelligence & Data Science' },
      { id: 'dom-robotics', code: 'robotics', label: 'Robotics & Autonomous Systems' },
      { id: 'dom-cleantech', code: 'cleantech', label: 'Clean Energy & Climate Tech' },
    ],
    projectTypes: [
      { id: 'pt-hw', code: 'hardware_prototype', label: 'Hardware Prototype' },
      { id: 'pt-sw', code: 'software_system', label: 'Software / AI System' },
      { id: 'pt-research', code: 'research_paper', label: 'Research & Publication' },
    ],
    academicLevels: [
      { id: 'al-ug', code: 'undergraduate', label: 'Undergraduate' },
      { id: 'al-pg', code: 'postgraduate', label: 'Postgraduate' },
      { id: 'al-phd', code: 'doctoral', label: 'PhD / Doctoral' },
    ],
    institutions: [
      { id: 'inst-iitb', code: 'iit_bombay', label: 'IIT Bombay' },
      { id: 'inst-iisc', code: 'iisc_bengaluru', label: 'IISc Bengaluru' },
      { id: 'inst-iitm', code: 'iit_madras', label: 'IIT Madras' },
    ],
    organizations: [
      { id: 'org-isro', code: 'isro_hub', label: 'ISRO-Academia Innovation Hub' },
      { id: 'org-drdo', code: 'drdo_lab', label: 'DRDO Young Scientist Lab' },
    ],
    skills: [
      { id: 'sk-ros2', code: 'ros2', label: 'ROS2' },
      { id: 'sk-pytorch', code: 'pytorch', label: 'PyTorch' },
      { id: 'sk-python', code: 'python', label: 'Python' },
      { id: 'sk-stm32', code: 'stm32', label: 'STM32' },
    ],
  };
}

function buildMockProfileOptions(): ProfileEditorOptions {
  return {
    roles: MOCK_PUBLIC_ROLES,
    occupations: [
      { id: 'occ-ug', code: 'undergraduate_student', label: 'Undergraduate Student' },
      { id: 'occ-pg', code: 'postgraduate_student', label: 'Postgraduate Student' },
      { id: 'occ-phd', code: 'research_scholar_phd', label: 'PhD Research Scholar' },
    ],
    qualificationLevels: [
      { id: 'ql-ug', code: 'undergraduate', label: 'Undergraduate' },
      { id: 'ql-pg', code: 'postgraduate', label: 'Postgraduate' },
      { id: 'ql-phd', code: 'phd_doctorate', label: 'PhD / Doctorate' },
    ],
    degrees: [
      { id: 'deg-btech', code: 'btech', label: 'BTech' },
      { id: 'deg-mtech', code: 'mtech', label: 'MTech' },
    ],
    employmentTypes: [
      { id: 'emp-intern', code: 'internship', label: 'Internship' },
      { id: 'emp-ft', code: 'full_time', label: 'Full Time' },
      { id: 'emp-pt', code: 'part_time', label: 'Part Time' },
    ],
    experienceTypes: [
      { id: 'exp-intern', code: 'internship', label: 'Internship' },
      { id: 'exp-research', code: 'research', label: 'Research' },
      { id: 'exp-project', code: 'project', label: 'Project' },
    ],
    sectors: [
      { id: 'sec-cleantech', code: 'clean_energy', label: 'Clean Energy & Sustainability' },
      { id: 'sec-robotics', code: 'robotics_ai', label: 'Robotics & Autonomous Systems' },
    ],
    stemCategories: [
      {
        id: 'stem-eng',
        code: 'engineering_and_technology',
        label: 'Engineering & Technology',
      },
      {
        id: 'stem-cs',
        code: 'computer_science_and_digital_technologies',
        label: 'Computer Science & Digital Technologies',
      },
    ],
    broadDomains: [
      {
        id: 'dom-ai',
        domainNumber: 1,
        slug: 'artificial-intelligence',
        label: 'Artificial Intelligence & Data Science',
      },
      {
        id: 'dom-robotics',
        domainNumber: 2,
        slug: 'robotics-autonomous-systems',
        label: 'Robotics & Autonomous Systems',
      },
      {
        id: 'dom-cleantech',
        domainNumber: 3,
        slug: 'clean-energy-climate-tech',
        label: 'Clean Energy & Climate Tech',
      },
    ],
    skillCategories: [
      { id: 'sc-digital', code: 'digital_analytical', label: 'Digital & Analytical' },
      { id: 'sc-eng', code: 'engineering_technical', label: 'Engineering & Technical' },
      { id: 'sc-res', code: 'research_scientific', label: 'Research & Scientific' },
    ],
    socialPlatforms: [
      { id: 'sp-github', code: 'github', label: 'GitHub', urlPrefix: 'https://github.com/' },
      { id: 'sp-linkedin', code: 'linkedin', label: 'LinkedIn', urlPrefix: 'https://linkedin.com/in/' },
      { id: 'sp-scholar', code: 'google_scholar', label: 'Google Scholar' },
    ],
  };
}

function recomputeProfileCompleteness(profile: FullProfile): number {
  let score = 20; // Basic identity registered
  if (profile.headline && profile.college && profile.city) score += 15;
  if (profile.education.length > 0) score += 15;
  if (profile.experiences.length > 0) score += 15;
  if (profile.expertise.broadDomains.length > 0 && profile.skills.length > 0) score += 15;
  if (profile.bio && profile.professionalSummary) score += 10;
  if (profile.socialLinks.length > 0) score += 10;
  return Math.min(100, score);
}

function createInitialMockProfile(user: AuthUser): FullProfile {
  const nowIso = new Date().toISOString();
  const profile: FullProfile = {
    id: user.id,
    email: user.email,
    mobileCountryCode: user.mobileCountryCode ?? '+91',
    mobileNumber: user.mobileNumber ?? '9876543210',
    handle: user.handle,
    name: user.name,
    headline: 'Deep-Tech Innovator · Collab47',
    avatarUrl: user.avatarUrl,
    coverImageUrl: null,
    dateOfBirth: null,
    dobPrivacy: 'private',
    accountType: user.accountType,
    primaryRole: user.primaryRole,
    roles: user.roles,
    occupations: user.occupations,
    occupationOther: null,
    bio: null,
    professionalSummary: null,
    college: user.college,
    branch: user.branch,
    yearOfStudy: user.yearOfStudy,
    studentId: null,
    city: user.city,
    country: 'India',
    countryCode: 'IN',
    latitude: null,
    longitude: null,
    geoSource: 'mock',
    geoDetectedAt: nowIso,
    primaryInstitutionId: null,
    primaryOrganizationId: null,
    primaryStemDisciplineId: null,
    visibility: user.visibility,
    openToCollaborations: user.openToCollaborations,
    isEmailVerified: user.isEmailVerified,
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
    completenessPercent: 35,
    createdAt: user.createdAt,
    updatedAt: nowIso,
  };
  profile.completenessPercent = recomputeProfileCompleteness(profile);
  return profile;
}

/**
 * Installs a stateful Playwright network mock for all `/api/v1/**` calls.
 * Supports pre-seeded mock accounts, live registration, duplicate email detection,
 * credential verification, membership plan selection, project creation wizard,
 * media uploads, 5-section profile completion, and full dashboard hydration
 * without touching the production database.
 */
export async function installMockCollab47Api(page: Page): Promise<MockApiController> {
  const accounts = new Map<string, MockRegisteredAccount>();
  const profilesByUserId = new Map<string, FullProfile>();
  const mockProjects: ApiProject[] = [];
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
  profilesByUserId.set(seededStudent.id, createInitialMockProfile(seededStudent));

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
  profilesByUserId.set(seededResearcher.id, createInitialMockProfile(seededResearcher));

  let activeUser: AuthUser = seededStudent;
  let userCounter = 2000;
  let entityCounter = 100;

  function getOrCreateActiveProfile(): FullProfile {
    let profile = profilesByUserId.get(activeUser.id);
    if (!profile) {
      profile = createInitialMockProfile(activeUser);
      profilesByUserId.set(activeUser.id, profile);
    }
    return profile;
  }

  // Intercept mocked direct-to-bucket uploads cleanly so zero real network upload is attempted
  await page.route('**/mock-bucket-upload', async (route: Route) => {
    await route.fulfill({
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST,OPTIONS',
        'access-control-allow-headers': '*',
      },
    });
  });

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

    // --- Uploads endpoints ---
    if (method === 'GET' && apiPath === '/uploads/config') {
      await fulfillJson(
        route,
        200,
        {
          bucketConfigured: true,
          s3Configured: true,
          storageMode: 'railway_bucket',
          region: 'auto',
          bucket: 'mock-e2e-bucket',
          endpoint: 'http://localhost:5173/mock-bucket-upload',
          maxImageSizeBytes: 10 * 1024 * 1024,
          maxVideoSizeBytes: 100 * 1024 * 1024,
          allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
          allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
        },
        apiPath,
      );
      return;
    }

    if (method === 'POST' && apiPath === '/uploads/presign-post') {
      const payload = (req.postDataJSON() ?? {}) as {
        fileName?: string;
        contentType?: string;
        folder?: string;
      };
      entityCounter += 1;
      const folder = payload.folder || 'projects';
      const fileName = payload.fileName || `upload-${entityCounter}.png`;
      const contentType = payload.contentType || 'image/png';
      const key = `${folder}/${entityCounter}-${fileName}`;
      await fulfillJson(
        route,
        200,
        {
          url: 'http://localhost:5173/mock-bucket-upload',
          uploadUrl: 'http://localhost:5173/mock-bucket-upload',
          fields: { key, 'Content-Type': contentType },
          publicUrl: '/images/carasoul-bg.png',
          key,
          method: 'POST',
          expiresInSeconds: 3600,
          contentType,
          kind: contentType.startsWith('video/') ? 'video' : 'image',
          storage: 'railway_bucket',
        },
        apiPath,
      );
      return;
    }

    if (method === 'POST' && apiPath === '/uploads/media') {
      entityCounter += 1;
      await fulfillJson(
        route,
        201,
        {
          items: [
            {
              key: `projects/${entityCounter}-cover.png`,
              url: '/images/carasoul-bg.png',
              contentType: 'image/png',
              sizeBytes: 2048,
              kind: 'image',
              originalName: 'cover.png',
              folder: 'projects',
              storage: 'railway_bucket',
            },
          ],
        },
        apiPath,
      );
      return;
    }

    // --- Profile endpoints (5 progressive sections) ---
    if (method === 'GET' && apiPath === '/profile/options') {
      await fulfillJson(route, 200, buildMockProfileOptions(), apiPath);
      return;
    }

    if (method === 'GET' && apiPath === '/profile/options/specializations') {
      await fulfillJson(route, 200, [], apiPath);
      return;
    }

    if (
      method === 'GET' &&
      (apiPath === '/profile' || apiPath === '/profile/me' || apiPath === '/profiles/me')
    ) {
      await fulfillJson(route, 200, getOrCreateActiveProfile(), apiPath);
      return;
    }

    if (method === 'PATCH' && apiPath === '/profile/basic-info') {
      const payload = (req.postDataJSON() ?? {}) as Partial<FullProfile>;
      const profile = getOrCreateActiveProfile();
      Object.assign(profile, payload, { updatedAt: new Date().toISOString() });
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      activeUser = {
        ...activeUser,
        name: profile.name,
        handle: profile.handle,
        college: profile.college,
        branch: profile.branch,
        yearOfStudy: profile.yearOfStudy,
        city: profile.city,
        visibility: profile.visibility,
        openToCollaborations: profile.openToCollaborations,
      };
      await fulfillJson(route, 200, profile, apiPath);
      return;
    }

    if (method === 'PATCH' && apiPath === '/profile/about') {
      const payload = (req.postDataJSON() ?? {}) as {
        headline?: string | null;
        bio?: string | null;
        professionalSummary?: string | null;
      };
      const profile = getOrCreateActiveProfile();
      if (payload.headline !== undefined) profile.headline = payload.headline;
      if (payload.bio !== undefined) profile.bio = payload.bio;
      if (payload.professionalSummary !== undefined) {
        profile.professionalSummary = payload.professionalSummary;
      }
      profile.updatedAt = new Date().toISOString();
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 200, profile, apiPath);
      return;
    }

    if (method === 'POST' && apiPath === '/profile/education') {
      const payload = (req.postDataJSON() ?? {}) as Partial<EducationItem>;
      const profile = getOrCreateActiveProfile();
      entityCounter += 1;
      const item: EducationItem = {
        id: `edu-mock-${entityCounter}`,
        qualificationLevel: payload.qualificationLevel ?? 'undergraduate',
        institution: payload.institution ?? 'IIT Bombay',
        institutionOther: null,
        degree: payload.degree ?? 'BTech',
        degreeOther: null,
        fieldOfStudy: payload.fieldOfStudy ?? 'Computer Science',
        disciplineCategory: payload.disciplineCategory ?? null,
        discipline: payload.discipline ?? null,
        disciplineOther: null,
        startYear: payload.startYear ?? 2023,
        endYear: payload.currentlyStudying ? null : (payload.endYear ?? 2027),
        startDate: null,
        endDate: null,
        currentlyStudying: Boolean(payload.currentlyStudying),
        grade: payload.grade ?? null,
        description: payload.description ?? null,
      };
      profile.education = [item, ...profile.education];
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 201, item, apiPath);
      return;
    }

    if (method === 'DELETE' && apiPath.startsWith('/profile/education/')) {
      const id = decodeURIComponent(apiPath.replace('/profile/education/', ''));
      const profile = getOrCreateActiveProfile();
      profile.education = profile.education.filter((e) => e.id !== id);
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 200, { id, deleted: true }, apiPath);
      return;
    }

    if (method === 'POST' && apiPath === '/profile/experiences') {
      const payload = (req.postDataJSON() ?? {}) as Partial<ExperienceItem>;
      const profile = getOrCreateActiveProfile();
      entityCounter += 1;
      const item: ExperienceItem = {
        id: `exp-mock-${entityCounter}`,
        type: payload.type ?? 'internship',
        employmentType: payload.employmentType ?? null,
        title: payload.title ?? 'Research Intern',
        organization: payload.organization ?? 'IISc Lab',
        organizationOther: null,
        location: payload.location ?? null,
        startYear: payload.startYear ?? 2025,
        endYear: payload.currentlyWorkingHere ? null : (payload.endYear ?? 2025),
        startDate: null,
        endDate: null,
        currentlyWorkingHere: Boolean(payload.currentlyWorkingHere),
        description: payload.description ?? null,
        skills: payload.skills ?? [],
        url: payload.url ?? null,
      };
      profile.experiences = [item, ...profile.experiences];
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 201, item, apiPath);
      return;
    }

    if (method === 'DELETE' && apiPath.startsWith('/profile/experiences/')) {
      const id = decodeURIComponent(apiPath.replace('/profile/experiences/', ''));
      const profile = getOrCreateActiveProfile();
      profile.experiences = profile.experiences.filter((e) => e.id !== id);
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 200, { id, deleted: true }, apiPath);
      return;
    }

    if (method === 'PUT' && apiPath === '/profile/expertise') {
      const payload = (req.postDataJSON() ?? {}) as {
        broadDomainIds?: string[];
        areasOfInterest?: string[];
        interests?: string[];
      };
      const profile = getOrCreateActiveProfile();
      const opts = buildMockProfileOptions();
      const selectedDomains = (payload.broadDomainIds ?? [])
        .map((id, idx) => {
          const found = opts.broadDomains.find((d) => d.id === id);
          if (!found) return null;
          return {
            broadDomainId: found.id,
            domainNumber: found.domainNumber,
            slug: found.slug,
            label: found.label,
            isPrimary: idx === 0,
          };
        })
        .filter((d): d is NonNullable<typeof d> => Boolean(d));

      profile.expertise = {
        broadDomains: selectedDomains,
        specializations: [],
        areasOfInterest: (payload.areasOfInterest ?? []).map((label, idx) => ({
          id: `aoi-${idx + 1}`,
          interestId: null,
          label,
        })),
        interests: payload.interests ?? [],
      };
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 200, profile.expertise, apiPath);
      return;
    }

    if (method === 'POST' && apiPath === '/profile/skills') {
      const payload = (req.postDataJSON() ?? {}) as Partial<SkillItem>;
      const profile = getOrCreateActiveProfile();
      entityCounter += 1;
      const item: SkillItem = {
        id: `skill-mock-${entityCounter}`,
        skillId: null,
        category: payload.category ?? 'digital_analytical',
        skillName: payload.skillName ?? 'ROS2',
        proficiencyLevel: payload.proficiencyLevel ?? 'advanced',
      };
      profile.skills = [...profile.skills, item];
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 201, item, apiPath);
      return;
    }

    if (method === 'DELETE' && apiPath.startsWith('/profile/skills/')) {
      const id = decodeURIComponent(apiPath.replace('/profile/skills/', ''));
      const profile = getOrCreateActiveProfile();
      profile.skills = profile.skills.filter((s) => s.id !== id);
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 200, { id, deleted: true }, apiPath);
      return;
    }

    if (method === 'PUT' && apiPath === '/profile/social-links') {
      const payload = (req.postDataJSON() ?? {}) as {
        links?: Array<{ platform: SocialLinkItem['platform']; label: string; url: string }>;
      };
      const profile = getOrCreateActiveProfile();
      profile.socialLinks = (payload.links ?? []).map((link, idx) => ({
        id: `soc-mock-${idx + 1}`,
        platformId: `sp-${link.platform}`,
        platform: link.platform,
        label: link.label,
        url: link.url,
        isVerified: false,
      }));
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 200, profile.socialLinks, apiPath);
      return;
    }

    if (method === 'DELETE' && apiPath.startsWith('/profile/social-links/')) {
      const id = decodeURIComponent(apiPath.replace('/profile/social-links/', ''));
      const profile = getOrCreateActiveProfile();
      profile.socialLinks = profile.socialLinks.filter((l) => l.id !== id);
      profile.completenessPercent = recomputeProfileCompleteness(profile);
      await fulfillJson(route, 200, { id, deleted: true }, apiPath);
      return;
    }

    // --- Projects endpoints ---
    if (method === 'GET' && apiPath === '/projects/options') {
      await fulfillJson(route, 200, buildMockProjectOptions(), apiPath);
      return;
    }

    if (method === 'GET' && apiPath === '/projects/invitations/mine') {
      await fulfillJson(route, 200, [], apiPath);
      return;
    }

    if (method === 'GET' && (apiPath === '/projects/mine' || apiPath === '/projects')) {
      await fulfillJson(route, 200, mockProjects, apiPath);
      return;
    }

    if (method === 'POST' && apiPath === '/projects') {
      const payload = (req.postDataJSON() ?? {}) as Record<string, unknown>;
      entityCounter += 1;
      const nowIso = new Date().toISOString();
      const projectId = `proj-mock-${entityCounter}`;
      const rawMedia = Array.isArray(payload.media)
        ? (payload.media as Array<{
            kind: 'image' | 'video';
            url: string;
            title?: string;
            mimeType?: string;
            fileSizeBytes?: number;
            isCover?: boolean;
          }>)
        : [];
      const rawMilestones = Array.isArray(payload.milestones)
        ? (payload.milestones as Array<{
            title: string;
            description?: string;
            startDate?: string;
            endDate?: string;
            status?: 'pending' | 'in_progress' | 'completed' | 'on_hold';
          }>)
        : [];

      const createdProject: ApiProject = {
        id: projectId,
        shortId: `C47-${entityCounter}`,
        title: String(payload.title ?? 'Untitled Project'),
        brief: String(payload.brief ?? ''),
        projectOverview: (payload.projectOverview as string | undefined) ?? null,
        description: (payload.description as string | undefined) ?? null,
        problemStatement: (payload.problemStatement as string | undefined) ?? null,
        expectedDeliverables: (payload.expectedDeliverables as string | undefined) ?? null,
        sector: String(payload.sector ?? 'Robotics & Autonomous Systems'),
        sectorId: (payload.sectorId as string | undefined) ?? null,
        primaryStemCategory: (payload.primaryStemCategory as string | undefined) ?? null,
        primaryStemCategoryId: (payload.primaryStemCategoryId as string | undefined) ?? null,
        primaryStemDiscipline: (payload.primaryStemDiscipline as string | undefined) ?? null,
        primaryStemDisciplineId: (payload.primaryStemDisciplineId as string | undefined) ?? null,
        leadInstitutionId: (payload.leadInstitutionId as string | undefined) ?? null,
        leadInstitutionName: payload.leadInstitutionId ? 'IIT Bombay' : null,
        leadOrganizationId: (payload.leadOrganizationId as string | undefined) ?? null,
        leadOrganizationName: null,
        branch: (payload.branch as string | undefined) ?? null,
        projectTypes: Array.isArray(payload.projectTypes) ? (payload.projectTypes as string[]) : [],
        academicLevels: Array.isArray(payload.academicLevels)
          ? (payload.academicLevels as string[])
          : [],
        broadDomains: Array.isArray(payload.broadDomains) ? (payload.broadDomains as string[]) : [],
        keywords: Array.isArray(payload.keywords) ? (payload.keywords as string[]) : [],
        skills: Array.isArray(payload.skills) ? (payload.skills as string[]) : [],
        startDate: (payload.startDate as string | undefined) ?? null,
        endDate: (payload.endDate as string | undefined) ?? null,
        actualCompletionDate: (payload.actualCompletionDate as string | undefined) ?? null,
        status: 'ongoing',
        workbenchStatus: String(payload.workbenchStatus ?? 'ongoing'),
        visibility: String(payload.visibility ?? 'public'),
        isDraft: Boolean(payload.isDraft),
        confidentialityWarningAcknowledged: true,
        isPinned: Boolean(payload.isPinned),
        deliverableUrl: (payload.deliverableUrl as string | undefined) ?? null,
        authorId: activeUser.id,
        authorName: activeUser.name,
        authorHandle: activeUser.handle,
        membershipRole: 'owner',
        canEdit: true,
        contributorsCount: 1,
        tags: Array.isArray(payload.tags) ? (payload.tags as string[]) : [],
        media: rawMedia.map((m, idx) => ({
          id: `media-mock-${entityCounter}-${idx + 1}`,
          projectId,
          kind: m.kind,
          url: m.url,
          title: m.title ?? `media-${idx + 1}`,
          mimeType: m.mimeType ?? 'image/png',
          fileSizeBytes: m.fileSizeBytes ?? 2048,
          isCover: Boolean(m.isCover),
          createdAt: nowIso,
        })),
        milestones: rawMilestones.map((ms, idx) => ({
          id: `ms-mock-${entityCounter}-${idx + 1}`,
          projectId,
          stageNumber: idx + 1,
          title: ms.title,
          description: ms.description ?? null,
          startDate: ms.startDate ?? null,
          endDate: ms.endDate ?? null,
          status: ms.status ?? 'pending',
          updatedAt: nowIso,
        })),
        contributors: [
          {
            id: `contrib-owner-${entityCounter}`,
            userId: activeUser.id,
            name: activeUser.name,
            handle: activeUser.handle,
            email: activeUser.email,
            avatarUrl: activeUser.avatarUrl,
            role: activeUser.accountType,
            teamRole: 'project_lead',
            roleTitle: 'Project Creator',
            invitationStatus: 'accepted',
          },
        ],
        invitations: [],
        likesCount: 0,
        isLiked: false,
        commentsCount: 0,
        comments: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      mockProjects.unshift(createdProject);
      await fulfillJson(route, 201, createdProject, apiPath);
      return;
    }

    if (method === 'POST' && /^\/projects\/[^/]+\/invitations$/.test(apiPath)) {
      const projectId = apiPath.split('/')[2] ?? '';
      const targetProject = mockProjects.find((p) => p.id === projectId);
      const payload = (req.postDataJSON() ?? {}) as {
        email?: string;
        roleTitle?: string;
        teamRole?: string;
        message?: string;
      };
      entityCounter += 1;
      const nowIso = new Date().toISOString();
      const invitation = {
        id: `inv-mock-${entityCounter}`,
        projectId,
        projectTitle: targetProject?.title ?? 'Mock Project',
        projectSector: targetProject?.sector ?? 'Robotics',
        inviterId: activeUser.id,
        inviterName: activeUser.name,
        inviterHandle: activeUser.handle,
        inviteeUserId: null,
        inviteeEmail: payload.email ?? 'teammate@iitb.ac.in',
        inviteeRegistered: false,
        roleTitle: payload.roleTitle ?? 'Core Contributor',
        teamRole: payload.teamRole ?? 'team_member',
        message: payload.message ?? null,
        status: 'pending',
        inviteToken: `mock-invite-token-${entityCounter}`,
        inviteUrl: `http://localhost:5173/signup?invite=mock-invite-token-${entityCounter}`,
        expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
        createdAt: nowIso,
      };
      if (targetProject) {
        targetProject.invitations = [invitation, ...targetProject.invitations];
      }
      await fulfillJson(
        route,
        201,
        {
          invitation,
          inviteeRegistered: false,
          inviteUrl: invitation.inviteUrl,
          message: `Invitation dispatched to ${invitation.inviteeEmail}.`,
        },
        apiPath,
      );
      return;
    }

    if (method === 'GET' && /^\/projects\/[^/]+$/.test(apiPath)) {
      const projectId = apiPath.split('/')[2] ?? '';
      const found = mockProjects.find((p) => p.id === projectId) ?? mockProjects[0];
      if (found) {
        await fulfillJson(route, 200, found, apiPath);
        return;
      }
      await fulfillJson(
        route,
        404,
        {
          statusCode: 404,
          errorCode: 'PROJECT_NOT_FOUND',
          message: 'Project not found.',
        },
        apiPath,
      );
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
