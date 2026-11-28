export type Locale = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn' | 'bn' | 'gu';

export interface LanguageOption {
  readonly code: Locale;
  readonly nativeName: string;
  readonly englishName: string;
  readonly shortCode: string;
}

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', shortCode: 'EN' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', shortCode: 'हिं' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', shortCode: 'मरा' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', shortCode: 'தமி' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', shortCode: 'తెలు' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', shortCode: 'ಕನ್ನ' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', shortCode: 'বাং' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', shortCode: 'ગુજ' },
] as const;

export interface TranslationSchema {
  nav: {
    about: string;
    career: string;
    events: string;
    dashboard: string;
    myProfile: string;
    onboarding: string;
    plans: string;
    premium: string;
    signIn: string;
    signUp: string;
    signOut: string;
    switchLanguage: string;
  };
  footer: {
    tagline: string;
    general: string;
    yourAccount: string;
    legal: string;
    howItWorks: string;
    whoIsItFor: string;
    onboardingWizard: string;
    dpdpRights: string;
    privacyPolicy: string;
    termsOfUse: string;
    copyright: string;
    builtFor: string;
  };
  home: {
    heroBadge: string;
    heroTitlePrimary: string;
    heroTitleSecondary: string;
    heroSubtitle: string;
    heroDescription: string;
    dpdpNote: string;
    highlightsBadge: string;
    highlightsTitle: string;
    highlightsSubtitle: string;
    highlights: ReadonlyArray<{ tag: string; title: string; subtitle: string }>;
    whoBadge: string;
    whoTitle: string;
    whoSubtitle: string;
    audiences: ReadonlyArray<{ badge: string; title: string; description: string }>;
    howBadge: string;
    howTitle: string;
    howSubtitle: string;
    pillars: ReadonlyArray<{ title: string; description: string }>;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaSignUp: string;
    ctaSignIn: string;
  };
  auth: {
    backToHome: string;
    dpdpConsentNote: string;
    statDomains: string;
    statDisciplines: string;
    statProof: string;
    loginTitle: string;
    loginSubtitle: string;
    loginHeroTagline: string;
    continueWithGoogle: string;
    orContinueEmail: string;
    emailLabel: string;
    passwordLabel: string;
    rememberMe: string;
    signInBtn: string;
    newToCollab: string;
    createAccountLink: string;
    signupTitle: string;
    signupSubtitle: string;
    step1Label: string;
    step2Label: string;
    signupWithGoogle: string;
    orRegisterEmail: string;
    fullNameLabel: string;
    confirmPasswordLabel: string;
    continueToPlansBtn: string;
    alreadyHaveAccount: string;
    signInLink: string;
    joiningAsLabel: string;
    joiningAsHint: string;
  };
  membership: {
    step1Done: string;
    step2Active: string;
    chooseTitle: string;
    chooseSubtitle: string;
    monthlyLabel: string;
    yearlyLabel: string;
    saveBadge: string;
    freeBadge: string;
    includesAds: string;
    foreverLabel: string;
    continueFreeBtn: string;
    recommendedBadge: string;
    noAdsBadge: string;
    perMonth: string;
    perYear: string;
    payGoAdFreeBtn: string;
    supportedMethodsNote: string;
    billingTitle: string;
    billingSubtitle: string;
    backToDashboard: string;
    paymentHistoryTitle: string;
    paymentHistorySubtitle: string;
    noPaymentsYet: string;
    switchToFree: string;
    upgradeToPremium: string;
    checkoutTitle: string;
    checkoutSubtitle: string;
    payNow: string;
    cancel: string;
    removeAdsCta: string;
    goAdFreeBtn: string;
    sponsoredLabel: string;
  };
  dashboard: {
    externalWorkspacesLabel: string;
    myRoleBadge: string;
    editProfile: string;
    searchPlaceholder: string;
    filterBySector: string;
    allFeed: string;
    projects: string;
    posts: string;
    opportunities: string;
    addProject: string;
    shareUpdatePrompt: string;
    publishPost: string;
    communityPosts: string;
    openOpportunities: string;
    applyNow: string;
    yourIdentity: string;
    syncedWithDb: string;
    completeProfileBtn: string;
    publicPortfolioBtn: string;
    recommendedFor: string;
    chooseWorkspaceTitle: string;
    roles: Record<
      'student' | 'researcher' | 'faculty' | 'industry' | 'institution' | 'mentor',
      { shortLabel: string; badgeLabel: string; title: string; subtitle: string; action: string }
    >;
  };
  onboarding: {
    stepOf: string;
    title: string;
    subtitle: string;
    progressLabel: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    step4Title: string;
    back: string;
    next: string;
    completeBtn: string;
  };
  profile: {
    title: string;
    subtitle: string;
    viewPublicPortfolio: string;
    tabBasic: string;
    tabEducation: string;
    tabExperience: string;
    tabExpertise: string;
    tabAbout: string;
    saveChanges: string;
  };
  portfolio: {
    loading: string;
    unavailable: string;
    backToHome: string;
    openToCollabs: string;
    about: string;
    expertiseAndSkills: string;
    broadDomains: string;
    skills: string;
    education: string;
    experience: string;
    socialLinks: string;
  };
  sidebar: {
    navigation: string;
    account: string;
    newProject: string;
    collapse: string;
    expand: string;
    publicPortfolio: string;
    membershipPlans: string;
    onboardingSkills: string;
    workspaceMenu: string;
    language: string;
  };
  studentDash: {
    checklistTitle: string;
    checklistSubtitle: string;
    nextMilestonesTitle: string;
    nextMilestonesSubtitle: string;
    readinessTitle: string;
    readinessSubtitle: string;
    updateInterestsBtn: string;
    studentWall: string;
    buildsMediaTitle: string;
    buildsMediaSubtitle: string;
  };
  verifyEmail: {
    pageTitle: string;
    verifying: string;
    verifiedTitle: string;
    goToDashboard: string;
    signInToContinue: string;
    failedTitle: string;
    backToSignIn: string;
  };
}

const EN: TranslationSchema = {
  nav: {
    about: 'About Us',
    career: 'Career',
    events: 'Events',
    dashboard: 'Dashboard',
    myProfile: 'My Profile',
    onboarding: 'Onboarding',
    plans: 'Billing & Payments',
    premium: 'Billing',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    switchLanguage: 'Switch Language',
  },
  footer: {
    tagline: 'Connecting students, academia, and industry to drive innovation towards Viksit Bharat 2047.',
    general: 'General',
    yourAccount: 'Your Account',
    legal: 'Legal & DPDP',
    howItWorks: 'How It Works',
    whoIsItFor: 'Who Is It For',
    onboardingWizard: 'Onboarding Wizard',
    dpdpRights: 'DPDP Act 2023 Rights',
    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Use',
    copyright: '© 2026 Collab47 Technologies Private Limited',
    builtFor: 'Built for Proof of Work · Viksit Bharat 2047',
  },
  home: {
    heroBadge: 'Talent × Ideas × Opportunities × Impact',
    heroTitlePrimary: 'Your Innovation.',
    heroTitleSecondary: 'Your Identity.',
    heroSubtitle: 'Connecting students, academia and industry to drive innovation towards Viksit Bharat 2047.',
    heroDescription:
      'Collab47 connects students, academia, industry, startups, institutions, and mentors to showcase innovation, solve real-world challenges, and turn ideas into impact.',
    dpdpNote: 'Protected under India DPDP Act 2023 statutory data rights · Built for Viksit Bharat 2047.',
    highlightsBadge: 'Platform Highlights',
    highlightsTitle: 'Everything you need to prove what you build',
    highlightsSubtitle: 'Use the arrows to browse core workbench, taxonomy, and verification capabilities.',
    highlights: [
      {
        tag: 'Project Workspace',
        title: '5-Step Living Workbench',
        subtitle: 'Document concepts, CAD/code, BOMs, validation tests, and final prototypes.',
      },
      {
        tag: 'STEM Taxonomy',
        title: '25 Broad Domains · 86 Disciplines',
        subtitle: 'Match talent and problem statements across every engineering & science domain.',
      },
      {
        tag: 'Verified Identity',
        title: 'Attested Proof of Work',
        subtitle: 'Earn verified contributor badges backed by real deliverables, not resume claims.',
      },
      {
        tag: 'Real Challenges',
        title: 'Industry & Lab Collabs',
        subtitle: 'Bridge campus prototypes with startups, R&D labs, and national missions.',
      },
      {
        tag: 'Mentorship',
        title: 'Faculty & Domain Advisors',
        subtitle: 'Get structured technical reviews and guidance from experienced practitioners.',
      },
    ],
    whoBadge: 'Who Is It For?',
    whoTitle: "Built for every builder in India's innovation ecosystem",
    whoSubtitle:
      'Whether you are shipping your first campus prototype or leading national R&D initiatives, Collab47 gives your work a verified home.',
    audiences: [
      { badge: 'Students', title: 'Students', description: 'Showcase what you have built and find opportunities.' },
      { badge: 'Industry', title: 'Industry & Startups', description: 'Solve problems, find the right people, and build teams.' },
      { badge: 'Academia', title: 'Researchers & Faculty', description: 'Present technology, expertise, and connect with collaborators.' },
      { badge: 'Institutions', title: 'Government & Institutions', description: 'Connect real-world challenges with proven capability.' },
      { badge: 'Mentors', title: 'Professionals & Mentors', description: 'Provide expertise, knowledge, and experience.' },
    ],
    howBadge: 'How It Works',
    howTitle: 'From campus build to verified national impact',
    howSubtitle:
      'Register in seconds, sign in to complete your 5-section expertise profile, and publish verified proof of work.',
    pillars: [
      {
        title: 'Proof of Work over Resume Claims',
        description:
          'Document prototypes, codebases, hardware builds, BOMs, test results, and research papers inside a structured 5-step Project Workspace.',
      },
      {
        title: '25 Broad Domains & 86 STEM Disciplines',
        description:
          'Build a searchable, progressive 5-section profile mapped to canonical domains, specializations, and verified skills.',
      },
      {
        title: 'Verified Contributor Attribution',
        description:
          'Invite teammates, mentors, and labs to co-create deliverables with attested proof-of-work badges on public portfolios.',
      },
    ],
    ctaTitle: 'Ready to build your verified innovation identity?',
    ctaSubtitle:
      'Create your account in seconds, post your first 2 projects for free, and collaborate across India’s R&D ecosystem.',
    ctaSignUp: 'Sign Up Free',
    ctaSignIn: 'Sign In',
  },
  auth: {
    backToHome: 'Back to home',
    dpdpConsentNote:
      "By continuing, you agree to Collab47's Terms of Use, Privacy Policy, and India DPDP Act 2023 data protection rights.",
    statDomains: 'Broad Domains',
    statDisciplines: 'STEM Disciplines',
    statProof: 'Verified Proof',
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in to update your profile, showcase projects, and collaborate.',
    loginHeroTagline: 'Build in the open. Prove what you can ship.',
    continueWithGoogle: 'Continue with Google',
    orContinueEmail: 'or continue with email',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    rememberMe: 'Keep me signed in (30 days)',
    signInBtn: 'Sign In',
    newToCollab: 'New to Collab47?',
    createAccountLink: 'Create an account',
    signupTitle: 'Create your account',
    signupSubtitle: 'Create your account in seconds. Post your first 2 projects for free.',
    step1Label: 'Account Details',
    step2Label: 'Onboarding',
    signupWithGoogle: 'Sign up with Google',
    orRegisterEmail: 'or register with email',
    fullNameLabel: 'Full Name',
    confirmPasswordLabel: 'Confirm Password',
    continueToPlansBtn: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    signInLink: 'Sign in',
    joiningAsLabel: 'Joining Collab47',
    joiningAsHint: 'Synced with your profile & workspace',
  },
  membership: {
    step1Done: '1. Account Created',
    step2Active: '2. Project Payment',
    chooseTitle: 'Project Posting Billing',
    chooseSubtitle:
      'Post your first 2 projects for free. From the 3rd project onwards, pay per project via UPI, Credit/Debit Card, or Online Bank Transfer.',
    monthlyLabel: 'Monthly',
    yearlyLabel: 'Annual',
    saveBadge: 'Save',
    freeBadge: 'Free Quota',
    includesAds: 'Standard Access',
    foreverLabel: '/ forever',
    continueFreeBtn: 'Continue',
    recommendedBadge: 'Pay Per Project',
    noAdsBadge: 'Instant Credit',
    perMonth: '/ month',
    perYear: '/ year',
    payGoAdFreeBtn: 'Pay Now',
    supportedMethodsNote: 'Supports UPI (GPay, PhonePe, Paytm), Credit Card, Debit Card & Online Bank Transfer',
    billingTitle: 'Billing & Payments',
    billingSubtitle: 'Track your 2 free project posts, pay-per-project credits, and INR payment receipts.',
    backToDashboard: 'Back to Dashboard',
    paymentHistoryTitle: 'INR Payment History',
    paymentHistorySubtitle: 'UPI, Credit/Debit Card & Online Bank Transfer receipts',
    noPaymentsYet: 'No payment transactions recorded yet.',
    switchToFree: 'Back',
    upgradeToPremium: 'Buy Project Credit',
    checkoutTitle: 'Indian Payment Gateway Checkout',
    checkoutSubtitle: '100% secure INR checkout · UPI, Credit Card, Debit Card & Online Bank Transfer',
    payNow: 'Pay Now',
    cancel: 'Cancel',
    removeAdsCta: 'Billing & Receipts',
    goAdFreeBtn: 'Billing',
    sponsoredLabel: 'Sponsored · Google Ads',
  },
  dashboard: {
    externalWorkspacesLabel: '6 External Persona Dashboards',
    myRoleBadge: 'My Role',
    editProfile: 'Edit Profile',
    searchPlaceholder: 'Search projects, posts, #tags, people, or opportunities...',
    filterBySector: 'Filter by Sector',
    allFeed: 'All Feed',
    projects: 'Projects',
    posts: 'Posts',
    opportunities: 'Opportunities',
    addProject: 'Add Project',
    shareUpdatePrompt: 'Share a milestone, prototype update, or call for collaborators',
    publishPost: 'Publish Post',
    communityPosts: 'Community Posts',
    openOpportunities: 'Open Opportunities',
    applyNow: 'Apply Now',
    yourIdentity: 'Your Identity',
    syncedWithDb: 'Synced live with PostgreSQL',
    completeProfileBtn: 'Complete 5-Section Profile',
    publicPortfolioBtn: 'Public Portfolio',
    recommendedFor: 'Recommended for',
    chooseWorkspaceTitle: 'Choose Your Role Workspace',
    roles: {
      student: {
        shortLabel: 'Student',
        badgeLabel: 'Student Workspace',
        title: 'Student Innovation Dashboard',
        subtitle: 'Track your 5-step living workbench, share verified milestone proof, and land R&D opportunities.',
        action: 'New Project',
      },
      researcher: {
        shortLabel: 'Researcher',
        badgeLabel: 'Researcher Workspace',
        title: 'Research & Lab Collaboration Dashboard',
        subtitle: 'Manage preprints, open datasets, and patent drafts while recruiting student co-researchers.',
        action: 'Publish Study',
      },
      faculty: {
        shortLabel: 'Faculty',
        badgeLabel: 'Faculty & PI Workspace',
        title: 'Faculty & Laboratory PI Dashboard',
        subtitle: 'Attest student deliverables, supervise capstone labs, and coordinate sponsored industry R&D.',
        action: 'New Lab Project',
      },
      industry: {
        shortLabel: 'Industry',
        badgeLabel: 'Industry & Startup Workspace',
        title: 'Industry Innovation & Talent Dashboard',
        subtitle: 'Post real-world R&D problem statements, inspect verified proof of work, and shortlist builders.',
        action: 'New R&D Brief',
      },
      institution: {
        shortLabel: 'Institution',
        badgeLabel: 'Government & Institution Workspace',
        title: 'Institutional & National Mission Dashboard',
        subtitle: 'Track campus & Viksit Bharat 2047 innovation missions, incubation cohorts, and grant pipelines.',
        action: 'New Campus Build',
      },
      mentor: {
        shortLabel: 'Mentor',
        badgeLabel: 'Mentor & Advisor Workspace',
        title: 'Mentor & Technical Advisory Dashboard',
        subtitle: 'Review student prototypes, accept mentorship requests, and guide high-potential innovation teams.',
        action: 'Share Insight',
      },
    },
  },
  onboarding: {
    stepOf: 'Step',
    title: 'Set up your Collab47 identity',
    subtitle: 'Personalize your persona, affiliation, domains, and public handle.',
    progressLabel: 'Onboarding progress',
    step1Title: '1. Account Persona & Occupations',
    step2Title: '2. Institutional / Academic Affiliation',
    step3Title: '3. Broad Domains & Areas of Interest',
    step4Title: '4. Public @handle & Avatar',
    back: 'Back',
    next: 'Continue',
    completeBtn: 'Complete Setup',
  },
  profile: {
    title: 'My 5-Section Profile',
    subtitle: 'Keep your education, experience, STEM domains, skills, and portfolio links up to date.',
    viewPublicPortfolio: 'Public Portfolio',
    tabBasic: 'Basic Info',
    tabEducation: 'Education',
    tabExperience: 'Experience',
    tabExpertise: 'Expertise & Skills',
    tabAbout: 'About & Social',
    saveChanges: 'Save Changes',
  },
  portfolio: {
    loading: 'Loading portfolio...',
    unavailable: 'Portfolio unavailable',
    backToHome: 'Back to Home',
    openToCollabs: 'Open to Collaborations',
    about: 'About',
    expertiseAndSkills: 'Expertise & Skills',
    broadDomains: 'Broad Domains',
    skills: 'Skills',
    education: 'Education',
    experience: 'Experience',
    socialLinks: 'Social & Portfolio Links',
  },
  sidebar: {
    navigation: 'Navigation',
    account: 'Account',
    newProject: 'New Project',
    collapse: 'Collapse sidebar',
    expand: 'Expand sidebar',
    publicPortfolio: 'Public Portfolio',
    membershipPlans: 'Billing & Payments',
    onboardingSkills: 'Onboarding & Skills',
    workspaceMenu: 'Workspace Menu',
    language: 'Language',
  },
  studentDash: {
    checklistTitle: '5-Step Living Workbench Checklist',
    checklistSubtitle: 'Build verified proof of work step by step for faculty & industry attestation',
    nextMilestonesTitle: 'Next Milestones & Attestation',
    nextMilestonesSubtitle: 'Pending steps to unlock Faculty PI verification',
    readinessTitle: 'Proof-of-Work Readiness',
    readinessSubtitle: 'Actions that boost campus & recruiter discovery',
    updateInterestsBtn: 'Update Interests & Skills',
    studentWall: 'Student Wall',
    buildsMediaTitle: 'Builds & Media Overview',
    buildsMediaSubtitle: 'Projects, wall posts & shared media',
  },
  verifyEmail: {
    pageTitle: 'Verify Email',
    verifying: 'Verifying your email address...',
    verifiedTitle: 'Email Verified!',
    goToDashboard: 'Go to Dashboard',
    signInToContinue: 'Sign In to Continue',
    failedTitle: 'Verification Failed',
    backToSignIn: 'Back to Sign In',
  },
};

function mergeLocale(overrides: DeepPartial<TranslationSchema>): TranslationSchema {
  return deepMerge(EN, overrides);
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends ReadonlyArray<unknown>
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

function deepMerge<T extends object>(base: T, patch: DeepPartial<T>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const [key, val] of Object.entries(patch as Record<string, unknown>)) {
    if (val === undefined) continue;
    const baseVal = result[key];
    if (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      baseVal !== null &&
      typeof baseVal === 'object' &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(baseVal as Record<string, unknown>, val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

export const TRANSLATIONS: Record<Locale, TranslationSchema> = {
  en: EN,

  hi: mergeLocale({
    nav: {
      about: 'हमारे बारे में',
      career: 'करियर',
      events: 'इवेंट्स',
      dashboard: 'डैशबोर्ड',
      myProfile: 'मेरी प्रोफ़ाइल',
      onboarding: 'ऑनबोर्डिंग',
      plans: 'प्लान्स',
      premium: 'प्रीमियम',
      signIn: 'साइन इन',
      signUp: 'साइन अप',
      signOut: 'साइन आउट',
      switchLanguage: 'भाषा बदलें',
    },
    footer: {
      tagline: 'विकसित भारत 2047 की दिशा में नवाचार को गति देने के लिए छात्रों, शिक्षा जगत और उद्योग को जोड़ना।',
      general: 'सामान्य',
      yourAccount: 'आपका खाता',
      legal: 'कानूनी एवं DPDP',
      howItWorks: 'यह कैसे काम करता है',
      whoIsItFor: 'यह किसके लिए है',
      onboardingWizard: 'ऑनबोर्डिंग विज़ार्ड',
      dpdpRights: 'DPDP अधिनियम 2023 अधिकार',
      privacyPolicy: 'गोपनीयता नीति',
      termsOfUse: 'उपयोग की शर्तें',
      builtFor: 'प्रमाणित कार्य के लिए निर्मित · विकसित भारत 2047',
    },
    home: {
      heroBadge: 'प्रतिभा × विचार × अवसर × प्रभाव',
      heroTitlePrimary: 'आपका नवाचार।',
      heroTitleSecondary: 'आपकी पहचान।',
      heroSubtitle: 'विकसित भारत 2047 की दिशा में नवाचार को गति देने के लिए छात्रों, शिक्षा जगत और उद्योग को जोड़ना।',
      heroDescription:
        'Collab47 छात्रों, शिक्षा जगत, उद्योग, स्टार्टअप्स, संस्थानों और मेंटर्स को जोड़ता है ताकि नवाचार प्रदर्शित हो, वास्तविक चुनौतियाँ हल हों और विचार प्रभाव में बदलें।',
      dpdpNote: 'भारत के DPDP अधिनियम 2023 के अंतर्गत डेटा अधिकार सुरक्षित · विकसित भारत 2047।',
      highlightsBadge: 'प्लेटफ़ॉर्म की विशेषताएँ',
      highlightsTitle: 'अपने कार्य को प्रमाणित करने के लिए सब कुछ एक स्थान पर',
      highlightsSubtitle: 'तीरों का उपयोग करके वर्कबेंच, STEM वर्गीकरण और सत्यापन सुविधाएँ देखें।',
      highlights: [
        { tag: 'प्रोजेक्ट वर्कस्पेस', title: '5-चरणीय लाइव वर्कबेंच', subtitle: 'अवधारणा, CAD/कोड, BOM, परीक्षण और अंतिम प्रोटोटाइप दस्तावेज़ करें।' },
        { tag: 'STEM वर्गीकरण', title: '25 व्यापक क्षेत्र · 86 विषय', subtitle: 'हर इंजीनियरिंग और विज्ञान क्षेत्र में प्रतिभा और समस्याओं को जोड़ें।' },
        { tag: 'सत्यापित पहचान', title: 'प्रमाणित कार्य (Proof of Work)', subtitle: 'केवल रिज़्यूमे नहीं, वास्तविक डिलिवरेबल्स से सत्यापित बैज अर्जित करें।' },
        { tag: 'वास्तविक चुनौतियाँ', title: 'उद्योग एवं लैब सहयोग', subtitle: 'कैंपस प्रोटोटाइप को स्टार्टअप्स, R&D लैब्स और राष्ट्रीय मिशनों से जोड़ें।' },
        { tag: 'मेंटरशिप', title: 'फैकल्टी और डोमेन सलाहकार', subtitle: 'अनुभवी विशेषज्ञों से संरचित तकनीकी समीक्षा और मार्गदर्शन प्राप्त करें।' },
      ],
      whoBadge: 'यह किसके लिए है?',
      whoTitle: 'भारत के नवाचार इकोसिस्टम के हर निर्माता के लिए निर्मित',
      whoSubtitle: 'चाहे आप अपना पहला कैंपस प्रोटोटाइप बना रहे हों या राष्ट्रीय R&D का नेतृत्व कर रहे हों, Collab47 आपके कार्य को सत्यापित मंच देता है।',
      audiences: [
        { badge: 'छात्र', title: 'छात्र', description: 'जो आपने बनाया है उसे प्रदर्शित करें और अवसर खोजें।' },
        { badge: 'उद्योग', title: 'उद्योग और स्टार्टअप्स', description: 'समस्याएँ हल करें, सही प्रतिभा खोजें और टीम बनाएँ।' },
        { badge: 'शिक्षा जगत', title: 'शोधकर्ता और फैकल्टी', description: 'तकनीक व विशेषज्ञता प्रस्तुत करें और सहयोगियों से जुड़ें।' },
        { badge: 'संस्थान', title: 'सरकार और संस्थान', description: 'वास्तविक चुनौतियों को प्रमाणित क्षमता से जोड़ें।' },
        { badge: 'मेंटर्स', title: 'पेशेवर और मेंटर्स', description: 'अपनी विशेषज्ञता, ज्ञान और अनुभव साझा करें।' },
      ],
      howBadge: 'यह कैसे काम करता है',
      howTitle: 'कैंपस निर्माण से सत्यापित राष्ट्रीय प्रभाव तक',
      howSubtitle: 'कुछ सेकंड में पंजीकरण करें, अपनी 5-खंड प्रोफ़ाइल पूरी करें और प्रमाणित कार्य प्रकाशित करें।',
      pillars: [
        { title: 'रिज़्यूमे से बढ़कर प्रमाणित कार्य', description: '5-चरणीय प्रोजेक्ट वर्कस्पेस में प्रोटोटाइप, कोडबेस, हार्डवेयर बिल्ड, BOM और शोध पत्र दर्ज करें।' },
        { title: '25 व्यापक क्षेत्र और 86 STEM विषय', description: 'मानक क्षेत्रों, विशेषज्ञताओं और सत्यापित कौशलों से जुड़ी खोजने योग्य प्रोफ़ाइल बनाएँ।' },
        { title: 'सत्यापित योगदानकर्ता श्रेय', description: 'टीम, मेंटर्स और लैब्स को आमंत्रित करें और पब्लिक पोर्टफोलियो पर सत्यापित बैज पाएँ।' },
      ],
      ctaTitle: 'क्या आप अपनी सत्यापित नवाचार पहचान बनाने के लिए तैयार हैं?',
      ctaSubtitle: 'अपना खाता बनाएँ, फ्री या प्रीमियम सदस्यता चुनें और पूरा वर्कस्पेस अनलॉक करें।',
      ctaSignUp: 'मुफ़्त साइन अप करें',
      ctaSignIn: 'साइन इन करें',
    },
    auth: {
      backToHome: 'होम पर वापस जाएँ',
      dpdpConsentNote: 'आगे बढ़कर, आप Collab47 की उपयोग शर्तों, गोपनीयता नीति और भारत DPDP अधिनियम 2023 के अधिकारों से सहमत होते हैं।',
      statDomains: 'व्यापक क्षेत्र',
      statDisciplines: 'STEM विषय',
      statProof: 'सत्यापित प्रमाण',
      loginTitle: 'वापसी पर स्वागत है',
      loginSubtitle: 'प्रोफ़ाइल अपडेट करने, प्रोजेक्ट दिखाने और सहयोग करने के लिए साइन इन करें।',
      loginHeroTagline: 'खुले में निर्माण करें। जो बनाया है उसे प्रमाणित करें।',
      continueWithGoogle: 'Google के साथ जारी रखें',
      orContinueEmail: 'या ईमेल के साथ जारी रखें',
      emailLabel: 'ईमेल पता',
      passwordLabel: 'पासवर्ड',
      rememberMe: 'मुझे साइन इन रखें (30 दिन)',
      signInBtn: 'साइन इन',
      newToCollab: 'Collab47 पर नए हैं?',
      createAccountLink: 'खाता बनाएँ',
      signupTitle: 'अपना खाता बनाएँ',
      signupSubtitle: 'चरण 1 / 2 · लॉगिन बनाएँ, फिर फ्री या प्रीमियम प्लान चुनें।',
      step1Label: 'खाता विवरण',
      step2Label: 'प्लान चुनें',
      signupWithGoogle: 'Google के साथ साइन अप करें',
      orRegisterEmail: 'या ईमेल से पंजीकरण करें',
      fullNameLabel: 'पूरा नाम',
      confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
      continueToPlansBtn: 'प्लान चयन पर आगे बढ़ें',
      alreadyHaveAccount: 'पहले से खाता है?',
      signInLink: 'साइन इन करें',
    },
    membership: {
      step1Done: '1. खाता बन गया',
      step2Active: '2. प्लान और भुगतान चुनें',
      chooseTitle: 'अपनी Collab47 सदस्यता चुनें',
      chooseSubtitle: 'Google Ads के साथ मुफ़्त शुरू करें, या UPI, क्रेडिट/डेबिट कार्ड या ऑनलाइन बैंक ट्रांसफ़र से 100% विज्ञापन-मुक्त प्रीमियम पाएँ।',
      monthlyLabel: 'मासिक (₹499/माह)',
      yearlyLabel: 'वार्षिक (₹4,999/वर्ष)',
      saveBadge: '17% बचत',
      freeBadge: 'विज्ञापन समर्थित',
      includesAds: 'Google Ads शामिल',
      foreverLabel: '/ हमेशा मुफ़्त',
      continueFreeBtn: 'फ्री सदस्यता के साथ जारी रखें',
      recommendedBadge: 'अनुशंसित · बिना विज्ञापन',
      noAdsBadge: 'कोई Google Ads नहीं',
      perMonth: '/ माह',
      perYear: '/ वर्ष',
      payGoAdFreeBtn: 'विज्ञापन-मुक्त बनें',
      supportedMethodsNote: 'UPI (GPay, PhonePe, Paytm), क्रेडिट कार्ड, डेबिट कार्ड और ऑनलाइन बैंक ट्रांसफ़र समर्थित',
      billingTitle: 'सदस्यता और भारतीय भुगतान',
      billingSubtitle: 'अपनी Collab47 सदस्यता, विज्ञापन-मुक्त स्थिति और INR रसीदें प्रबंधित करें।',
      backToDashboard: 'डैशबोर्ड पर वापस जाएँ',
      paymentHistoryTitle: 'INR भुगतान इतिहास',
      paymentHistorySubtitle: 'UPI, क्रेडिट/डेबिट कार्ड और ऑनलाइन बैंक ट्रांसफ़र रसीदें',
      noPaymentsYet: 'अभी तक कोई भुगतान दर्ज नहीं है।',
      switchToFree: 'फ्री प्लान पर स्विच करें',
      upgradeToPremium: 'प्रीमियम में अपग्रेड करें',
      checkoutTitle: 'भारतीय पेमेंट गेटवे चेकआउट',
      checkoutSubtitle: '100% सुरक्षित INR भुगतान · UPI, क्रेडिट कार्ड, डेबिट कार्ड और ऑनलाइन ट्रांसफ़र',
      payNow: 'अभी भुगतान करें',
      cancel: 'रद्द करें',
      removeAdsCta: 'प्रीमियम से विज्ञापन हटाएँ',
      goAdFreeBtn: 'विज्ञापन-मुक्त बनें',
      sponsoredLabel: 'प्रायोजित · Google Ads',
    },
    dashboard: {
      externalWorkspacesLabel: '6 भूमिका-आधारित डैशबोर्ड',
      myRoleBadge: 'मेरी भूमिका',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      searchPlaceholder: 'प्रोजेक्ट्स, पोस्ट्स, #टैग्स, लोग या अवसर खोजें...',
      filterBySector: 'सेक्टर चुनें',
      allFeed: 'सभी फ़ीड',
      projects: 'प्रोजेक्ट्स',
      posts: 'पोस्ट्स',
      opportunities: 'अवसर',
      addProject: 'प्रोजेक्ट जोड़ें',
      shareUpdatePrompt: 'प्रगति, प्रोटोटाइप अपडेट या सहयोग का आह्वान साझा करें',
      publishPost: 'पोस्ट प्रकाशित करें',
      communityPosts: 'कम्युनिटी पोस्ट्स',
      openOpportunities: 'उपलब्ध अवसर',
      applyNow: 'आवेदन करें',
      yourIdentity: 'आपकी पहचान',
      syncedWithDb: 'PostgreSQL से लाइव सिंक',
      completeProfileBtn: '5-खंड प्रोफ़ाइल पूरी करें',
      publicPortfolioBtn: 'पब्लिक पोर्टफोलियो',
      recommendedFor: 'अनुशंसित:',
      chooseWorkspaceTitle: 'अपना भूमिका वर्कस्पेस चुनें',
      roles: {
        student: { shortLabel: 'छात्र', badgeLabel: 'छात्र वर्कस्पेस', title: 'छात्र नवाचार डैशबोर्ड', subtitle: '5-चरणीय वर्कबेंच ट्रैक करें, प्रगति साझा करें और R&D अवसर पाएँ।', action: 'नया प्रोजेक्ट' },
        researcher: { shortLabel: 'शोधकर्ता', badgeLabel: 'शोधकर्ता वर्कस्पेस', title: 'शोध और लैब सहयोग डैशबोर्ड', subtitle: 'प्रीप्रिंट, ओपन डेटासेट और पेटेंट ड्राफ्ट प्रबंधित करें।', action: 'अध्ययन प्रकाशित करें' },
        faculty: { shortLabel: 'फैकल्टी', badgeLabel: 'फैकल्टी और PI वर्कस्पेस', title: 'फैकल्टी और प्रयोगशाला डैशबोर्ड', subtitle: 'छात्र डिलिवरेबल्स सत्यापित करें और लैब टीमों का मार्गदर्शन करें।', action: 'नया लैब प्रोजेक्ट' },
        industry: { shortLabel: 'उद्योग', badgeLabel: 'उद्योग और स्टार्टअप वर्कस्पेस', title: 'उद्योग नवाचार और प्रतिभा डैशबोर्ड', subtitle: 'R&D चुनौतियाँ पोस्ट करें और सत्यापित प्रतिभा को शॉर्टलिस्ट करें।', action: 'नई R&D चुनौती' },
        institution: { shortLabel: 'संस्थान', badgeLabel: 'सरकार और संस्थान वर्कस्पेस', title: 'संस्थागत और राष्ट्रीय मिशन डैशबोर्ड', subtitle: 'कैंपस और विकसित भारत 2047 मिशन तथा अनुदान ट्रैक करें।', action: 'नया कैंपस मिशन' },
        mentor: { shortLabel: 'मेंटर', badgeLabel: 'मेंटर और सलाहकार वर्कस्पेस', title: 'मेंटर और तकनीकी सलाहकार डैशबोर्ड', subtitle: 'प्रोटोटाइप समीक्षा करें और नवाचार टीमों का मार्गदर्शन करें।', action: 'सुझाव साझा करें' },
      },
    },
    onboarding: {
      stepOf: 'चरण',
      title: 'अपनी Collab47 पहचान सेट करें',
      subtitle: 'अपनी भूमिका, संस्थान, डोमेन और पब्लिक @handle चुनें।',
      progressLabel: 'ऑनबोर्डिंग प्रगति',
      step1Title: '1. भूमिका और व्यवसाय',
      step2Title: '2. संस्थान / शैक्षणिक संबद्धता',
      step3Title: '3. व्यापक क्षेत्र और रुचियाँ',
      step4Title: '4. पब्लिक @handle और अवतार',
      back: 'पीछे',
      next: 'आगे बढ़ें',
      completeBtn: 'सेटअप पूरा करें',
    },
    profile: {
      title: 'मेरी 5-खंड प्रोफ़ाइल',
      subtitle: 'अपनी शिक्षा, अनुभव, STEM क्षेत्र, कौशल और लिंक अपडेट रखें।',
      viewPublicPortfolio: 'पब्लिक पोर्टफोलियो',
      tabBasic: 'बुनियादी जानकारी',
      tabEducation: 'शिक्षा',
      tabExperience: 'अनुभव',
      tabExpertise: 'विशेषज्ञता व कौशल',
      tabAbout: 'परिचय व सोशल',
      saveChanges: 'परिवर्तन सहेजें',
    },
    portfolio: {
      loading: 'पोर्टफोलियो लोड हो रहा है...',
      unavailable: 'पोर्टफोलियो उपलब्ध नहीं है',
      backToHome: 'होम पर वापस जाएँ',
      openToCollabs: 'सहयोग के लिए उपलब्ध',
      about: 'परिचय',
      expertiseAndSkills: 'विशेषज्ञता और कौशल',
      broadDomains: 'व्यापक क्षेत्र',
      skills: 'कौशल',
      education: 'शिक्षा',
      experience: 'अनुभव',
      socialLinks: 'सोशल और पोर्टफोलियो लिंक',
    },
    sidebar: {
      navigation: 'नेविगेशन',
      account: 'खाता',
      newProject: 'नया प्रोजेक्ट',
      collapse: 'साइडबार समेटें',
      expand: 'साइडबार खोलें',
      publicPortfolio: 'पब्लिक पोर्टफोलियो',
      membershipPlans: 'सदस्यता और प्लान',
      onboardingSkills: 'ऑनबोर्डिंग और कौशल',
      workspaceMenu: 'वर्कस्पेस मेनू',
      language: 'भाषा',
    },
    studentDash: {
      checklistTitle: '5-चरणीय लिविंग वर्कबेंच चेकलिस्ट',
      checklistSubtitle: 'फैकल्टी और उद्योग सत्यापन के लिए चरणबद्ध प्रमाण तैयार करें',
      nextMilestonesTitle: 'अगले माइलस्टोन और सत्यापन',
      nextMilestonesSubtitle: 'फैकल्टी PI सत्यापन के लिए शेष चरण',
      readinessTitle: 'प्रूफ-ऑफ-वर्क तैयारी',
      readinessSubtitle: 'कैंपस और भर्ती खोज को बढ़ाने वाले कदम',
      updateInterestsBtn: 'रुचियाँ और कौशल अपडेट करें',
      studentWall: 'स्टूडेंट वॉल',
      buildsMediaTitle: 'प्रोजेक्ट और मीडिया सारांश',
      buildsMediaSubtitle: 'प्रोजेक्ट्स, वॉल पोस्ट्स और साझा मीडिया',
    },
    verifyEmail: {
      pageTitle: 'ईमेल सत्यापित करें',
      verifying: 'आपका ईमेल पता सत्यापित किया जा रहा है...',
      verifiedTitle: 'ईमेल सत्यापित हो गया!',
      goToDashboard: 'डैशबोर्ड पर जाएँ',
      signInToContinue: 'जारी रखने के लिए साइन इन करें',
      failedTitle: 'सत्यापन विफल',
      backToSignIn: 'साइन इन पर वापस जाएँ',
    },
  }),

  mr: mergeLocale({
    nav: {
      about: 'आमच्याबद्दल',
      career: 'करिअर',
      events: 'कार्यक्रम',
      dashboard: 'डॅशबोर्ड',
      myProfile: 'माझी प्रोफाईल',
      onboarding: 'ऑनबोर्डिंग',
      plans: 'प्लॅन्स',
      premium: 'प्रीमियम',
      signIn: 'साइन इन',
      signUp: 'साइन अप',
      signOut: 'साइन आउट',
      switchLanguage: 'भाषा बदला',
    },
    footer: {
      tagline: 'विकसित भारत 2047 साठी विद्यार्थी, शैक्षणिक संस्था आणि उद्योग यांना जोडणारे नवोपक्रम व्यासपीठ.',
      general: 'सामान्य',
      yourAccount: 'तुमचे खाते',
      legal: 'कायदेशीर व DPDP',
      howItWorks: 'हे कसे कार्य करते',
      whoIsItFor: 'हे कोणासाठी आहे',
      onboardingWizard: 'ऑनबोर्डिंग विझार्ड',
      dpdpRights: 'DPDP कायदा 2023 हक्क',
      privacyPolicy: 'गोपनीयता धोरण',
      termsOfUse: 'वापर अटी',
      builtFor: 'प्रमाणित कामासाठी निर्मित · विकसित भारत 2047',
    },
    home: {
      heroBadge: 'प्रतिभा × कल्पना × संधी × प्रभाव',
      heroTitlePrimary: 'तुमचा नवोपक्रम.',
      heroTitleSecondary: 'तुमची ओळख.',
      heroSubtitle: 'विकसित भारत 2047 च्या दिशेने नवोपक्रमाला गती देण्यासाठी विद्यार्थी, शैक्षणिक जगत आणि उद्योग यांना जोडणे.',
      heroDescription:
        'Collab47 विद्यार्थी, संशोधक, उद्योग, स्टार्टअप्स, संस्था आणि मेंटर्सना एकत्र आणून नवोपक्रम सादर करण्यास आणि प्रत्यक्ष आव्हाने सोडविण्यास मदत करते.',
      dpdpNote: 'भारत DPDP कायदा 2023 अंतर्गत डेटा अधिकार सुरक्षित · विकसित भारत 2047.',
      highlightsBadge: 'प्लॅटफॉर्म वैशिष्ट्ये',
      highlightsTitle: 'तुमचे काम सिद्ध करण्यासाठी आवश्यक सर्व काही एकाच ठिकाणी',
      highlightsSubtitle: 'वर्कबेंच, STEM वर्गीकरण आणि पडताळणी वैशिष्ट्ये पाहण्यासाठी बाणांचा वापर करा.',
      whoBadge: 'हे कोणासाठी आहे?',
      whoTitle: 'भारताच्या नवोपक्रम परिसंस्थेतील प्रत्येक निर्मात्यासाठी',
      howBadge: 'हे कसे कार्य करते',
      howTitle: 'कॅम्पस प्रकल्पापासून राष्ट्रीय प्रभावापर्यंत',
      ctaTitle: 'तुमची प्रमाणित नवोपक्रम ओळख तयार करण्यास सज्ज आहात का?',
      ctaSignUp: 'मोफत साइन अप करा',
      ctaSignIn: 'साइन इन करा',
    },
    auth: {
      backToHome: 'मुख्यपृष्ठावर जा',
      statDomains: 'व्यापक क्षेत्रे',
      statDisciplines: 'STEM शाखा',
      statProof: 'प्रमाणित कार्य',
      loginTitle: 'पुन्हा स्वागत आहे',
      loginSubtitle: 'प्रोफाईल अद्यतनित करण्यासाठी आणि प्रकल्प दाखवण्यासाठी साइन इन करा.',
      continueWithGoogle: 'Google सह सुरू ठेवा',
      orContinueEmail: 'किंवा ईमेलने सुरू ठेवा',
      emailLabel: 'ईमेल पत्ता',
      passwordLabel: 'पासवर्ड',
      rememberMe: 'मला साइन इन ठेवा (30 दिवस)',
      signInBtn: 'साइन इन',
      newToCollab: 'Collab47 वर नवीन आहात?',
      createAccountLink: 'खाते तयार करा',
      signupTitle: 'तुमचे खाते तयार करा',
      signupSubtitle: 'टप्पा 1 / 2 · खाते तयार करा, नंतर फ्री किंवा प्रीमियम प्लॅन निवडा.',
      step1Label: 'खाते तपशील',
      step2Label: 'प्लॅन निवडा',
      signupWithGoogle: 'Google सह साइन अप करा',
      orRegisterEmail: 'किंवा ईमेलने नोंदणी करा',
      fullNameLabel: 'पूर्ण नाव',
      confirmPasswordLabel: 'पासवर्डची पुष्टी करा',
      continueToPlansBtn: 'प्लॅन निवडीकडे पुढे जा',
      alreadyHaveAccount: 'आधीच खाते आहे?',
      signInLink: 'साइन इन करा',
    },
    membership: {
      step1Done: '1. खाते तयार झाले',
      step2Active: '2. प्लॅन व पेमेंट निवडा',
      chooseTitle: 'तुमची Collab47 सदस्यता निवडा',
      continueFreeBtn: 'फ्री सदस्यतेसह सुरू ठेवा',
      payGoAdFreeBtn: 'जाहिरात-मुक्त व्हा',
      billingTitle: 'सदस्यता आणि भारतीय पेमेंट',
      backToDashboard: 'डॅशबोर्डवर परत जा',
      removeAdsCta: 'प्रीमियमसह जाहिराती काढून टाका',
      goAdFreeBtn: 'जाहिरात-मुक्त व्हा',
      sponsoredLabel: 'प्रायोजित · Google Ads',
    },
    dashboard: {
      externalWorkspacesLabel: '6 भूमिका-आधारित डॅशबोर्ड्स',
      myRoleBadge: 'माझी भूमिका',
      editProfile: 'प्रोफाईल संपादित करा',
      searchPlaceholder: 'प्रकल्प, पोस्ट्स, #टॅग्स किंवा संधी शोधा...',
      filterBySector: 'क्षेत्र निवडा',
      allFeed: 'सर्व फीड',
      projects: 'प्रकल्प',
      posts: 'पोस्ट्स',
      opportunities: 'संधी',
      addProject: 'प्रकल्प जोडा',
      publishPost: 'पोस्ट प्रकाशित करा',
      communityPosts: 'कम्युनिटी पोस्ट्स',
      openOpportunities: 'उपलब्ध संधी',
      applyNow: 'अर्ज करा',
      yourIdentity: 'तुमची ओळख',
      completeProfileBtn: '5-भाग प्रोफाईल पूर्ण करा',
      publicPortfolioBtn: 'पब्लिक पोर्टफोलिओ',
      recommendedFor: 'शिफारस केलेले:',
      chooseWorkspaceTitle: 'तुमचे भूमिका वर्कस्पेस निवडा',
      roles: {
        student: { shortLabel: 'विद्यार्थी', badgeLabel: 'विद्यार्थी वर्कस्पेस', title: 'विद्यार्थी नवोपक्रम डॅशबोर्ड', subtitle: 'तुमचे प्रकल्प ट्रॅक करा आणि प्रमाणित संधी मिळवा.', action: 'नवीन प्रकल्प' },
        researcher: { shortLabel: 'संशोधक', badgeLabel: 'संशोधक वर्कस्पेस', title: 'संशोधन व लॅब डॅशबोर्ड', subtitle: 'संशोधन निबंध, ओपन डेटासेट व पेटंट व्यवस्थापित करा.', action: 'संशोधन जोडा' },
        faculty: { shortLabel: 'प्राध्यापक', badgeLabel: 'प्राध्यापक वर्कस्पेस', title: 'प्राध्यापक व लॅब डॅशबोर्ड', subtitle: 'विद्यार्थ्यांचे प्रकल्प प्रमाणित करा आणि लॅबचे मार्गदर्शन करा.', action: 'नवीन लॅब प्रकल्प' },
        industry: { shortLabel: 'उद्योग', badgeLabel: 'उद्योग व स्टार्टअप वर्कस्पेस', title: 'उद्योग नवोपक्रम व प्रतिभा डॅशबोर्ड', subtitle: 'R&D आव्हाने पोस्ट करा आणि प्रमाणित प्रतिभा निवडा.', action: 'नवीन R&D आव्हान' },
        institution: { shortLabel: 'संस्था', badgeLabel: 'सरकार व संस्था वर्कस्पेस', title: 'संस्थात्मक व राष्ट्रीय मिशन डॅशबोर्ड', subtitle: 'कॅम्पस व विकसित भारत 2047 मिशन ट्रॅक करा.', action: 'नवीन मिशन' },
        mentor: { shortLabel: 'मेंटर', badgeLabel: 'मेंटर व सल्लागार वर्कस्पेस', title: 'मेंटर व तांत्रिक सल्लागार डॅशबोर्ड', subtitle: 'प्रोटोटाइप तपासा आणि नवोपक्रम संघांना मार्गदर्शन करा.', action: 'सल्ला सामायिक करा' },
      },
    },
    onboarding: {
      title: 'तुमची Collab47 ओळख सेट करा',
      back: 'मागे',
      next: 'पुढे जा',
      completeBtn: 'सेटअप पूर्ण करा',
    },
    profile: {
      title: 'माझी 5-भाग प्रोफाईल',
      tabBasic: 'मूलभूत माहिती',
      tabEducation: 'शिक्षण',
      tabExperience: 'अनुभव',
      tabExpertise: 'कौशल्ये व क्षेत्र',
      tabAbout: 'परिचय व लिंक्स',
      saveChanges: 'बदल जतन करा',
    },
    sidebar: {
      navigation: 'नेव्हिगेशन',
      account: 'खाते',
      newProject: 'नवीन प्रकल्प',
      collapse: 'साइडबार लपवा',
      expand: 'साइडबार उघडा',
      publicPortfolio: 'पब्लिक पोर्टफोलिओ',
      membershipPlans: 'सदस्यत्व व योजना',
      onboardingSkills: 'ऑनबोर्डिंग व कौशल्ये',
      workspaceMenu: 'वर्कस्पेस मेनू',
      language: 'भाषा',
    },
    studentDash: {
      checklistTitle: '५-टप्प्यांची वर्कबेंच चेकलिस्ट',
      checklistSubtitle: 'प्राध्यापक व उद्योग पडताळणीसाठी टप्प्याटप्प्याने पुरावे तयार करा',
      nextMilestonesTitle: 'पुढील टप्पे व पडताळणी',
      nextMilestonesSubtitle: 'प्रलंबित टप्पे पूर्ण करा',
      readinessTitle: 'प्रूफ-ऑफ-वर्क तयारी',
      readinessSubtitle: 'कॅम्पस व करिअर संधी वाढवणारी पावले',
      updateInterestsBtn: 'आवडी व कौशल्ये अद्यतनित करा',
      studentWall: 'विद्यार्थी वॉल',
      buildsMediaTitle: 'प्रकल्प व मीडिया आढावा',
      buildsMediaSubtitle: 'प्रकल्प, वॉल पोस्ट्स व मीडिया',
    },
    verifyEmail: {
      pageTitle: 'ईमेल पडताळणी',
      verifying: 'तुमचा ईमेल पडताळला जात आहे...',
      verifiedTitle: 'ईमेल पडताळणी पूर्ण!',
      goToDashboard: 'डॅशबोर्डवर जा',
      signInToContinue: 'पुढे जाण्यासाठी साइन इन करा',
      failedTitle: 'पडताळणी अयशस्वी',
      backToSignIn: 'साइन इनवर परत जा',
    },
  }),

  ta: mergeLocale({
    nav: {
      about: 'எங்களைப் பற்றி',
      career: 'வேலைவாய்ப்பு',
      events: 'நிகழ்வுகள்',
      dashboard: 'டாஷ்போர்டு',
      myProfile: 'என் சுயவிவரம்',
      onboarding: 'தொடக்க அமைப்பு',
      plans: 'திட்டங்கள்',
      premium: 'பிரீமியம்',
      signIn: 'உள்நுழைக',
      signUp: 'பதிவு செய்க',
      signOut: 'வெளியேறு',
      switchLanguage: 'மொழியை மாற்றுக',
    },
    footer: {
      tagline: 'விக்சித் பாரத் 2047 இலக்கை நோக்கி மாணவர்கள், கல்வி மற்றும் தொழில்துறையை இணைக்கிறது.',
      general: 'பொது',
      yourAccount: 'உங்கள் கணக்கு',
      legal: 'சட்டம் & DPDP',
      howItWorks: 'எப்படி செயல்படுகிறது',
      whoIsItFor: 'யாருக்கானது',
      builtFor: 'நிரூபிக்கப்பட்ட பணிக்காக · விக்சித் பாரத் 2047',
    },
    home: {
      heroBadge: 'திறமை × யோசனைகள் × வாய்ப்புகள் × தாக்கம்',
      heroTitlePrimary: 'உங்கள் புதுமை.',
      heroTitleSecondary: 'உங்கள் அடையாளம்.',
      heroSubtitle: 'விக்சித் பாரத் 2047 நோக்கி புதுமையை இயக்க மாணவர்கள், கல்வி மற்றும் தொழில்துறையை இணைத்தல்.',
      heroDescription:
        'மாணவர்கள், ஆராய்ச்சியாளர்கள், தொழில்துறை, ஸ்டார்ட்அப்கள் மற்றும் வழிகாட்டிகளை இணைத்து உண்மையான சவால்களைத் தீர்க்க Collab47 உதவுகிறது.',
      dpdpNote: 'இந்திய DPDP சட்டம் 2023 தரவு உரிமைகளால் பாதுகாக்கப்பட்டது · விக்சித் பாரத் 2047.',
      highlightsBadge: 'தள சிறப்பம்சங்கள்',
      highlightsTitle: 'உங்கள் படைப்பை நிரூபிக்க தேவையான அனைத்தும்',
      highlightsSubtitle: 'அம்புக்குறிகள் மூலம் முக்கிய வசதிகளைப் பார்க்கவும்.',
      whoBadge: 'யாருக்கானது?',
      whoTitle: 'இந்தியாவின் புதுமை சூழலின் ஒவ்வொரு படைப்பாளருக்கும்',
      howBadge: 'எப்படி செயல்படுகிறது',
      howTitle: 'கல்லூரி படைப்பிலிருந்து தேசிய தாக்கம் வரை',
      ctaTitle: 'உங்கள் சரிபார்க்கப்பட்ட புதுமை அடையாளத்தை உருவாக்கத் தயாரா?',
      ctaSignUp: 'இலவசமாக பதிவு செய்க',
      ctaSignIn: 'உள்நுழைக',
    },
    auth: {
      backToHome: 'முகப்புக்குத் திரும்பு',
      statDomains: 'முதன்மை துறைகள்',
      statDisciplines: 'STEM பிரிவுகள்',
      statProof: 'சரிபார்க்கப்பட்ட சான்று',
      loginTitle: 'மீண்டும் வருக',
      loginSubtitle: 'உங்கள் சுயவிவரத்தை புதுப்பிக்கவும் திட்டங்களை பகிரவும் உள்நுழைக.',
      continueWithGoogle: 'Google உடன் தொடரவும்',
      orContinueEmail: 'அல்லது மின்னஞ்சல் மூலம் தொடரவும்',
      emailLabel: 'மின்னஞ்சல் முகவரி',
      passwordLabel: 'கடவுச்சொல்',
      rememberMe: 'உள்நுழைந்திருக்கவும் (30 நாட்கள்)',
      signInBtn: 'உள்நுழைக',
      newToCollab: 'Collab47-இல் புதியவரா?',
      createAccountLink: 'கணக்கு உருவாக்கவும்',
      signupTitle: 'உங்கள் கணக்கை உருவாக்கவும்',
      signupSubtitle: 'படி 1 / 2 · கணக்கை உருவாக்கி இலவச அல்லது பிரீமியம் திட்டத்தைத் தேர்வுசெய்யவும்.',
      step1Label: 'கணக்கு விவரம்',
      step2Label: 'திட்டத் தேர்வு',
      signupWithGoogle: 'Google உடன் பதிவு செய்க',
      orRegisterEmail: 'அல்லது மின்னஞ்சலில் பதிவு செய்க',
      fullNameLabel: 'முழுப் பெயர்',
      confirmPasswordLabel: 'கடவுச்சொல்லை உறுதி செய்க',
      continueToPlansBtn: 'திட்டத் தேர்வுக்குச் செல்லவும்',
      alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
      signInLink: 'உள்நுழைக',
    },
    membership: {
      step1Done: '1. கணக்கு உருவாக்கப்பட்டது',
      step2Active: '2. திட்டம் & கட்டணம்',
      chooseTitle: 'உங்கள் Collab47 உறுப்பினர் திட்டத்தைத் தேர்வுசெய்யவும்',
      continueFreeBtn: 'இலவச திட்டத்துடன் தொடரவும்',
      payGoAdFreeBtn: 'விளம்பரமில்லா பிரீமியம்',
      billingTitle: 'உறுப்பினர் திட்டம் & இந்திய கட்டணங்கள்',
      backToDashboard: 'டாஷ்போர்டுக்குத் திரும்பு',
      removeAdsCta: 'பிரீமியத்தில் விளம்பரங்களை அகற்றவும்',
      goAdFreeBtn: 'விளம்பரமில்லா அனுபவம்',
      sponsoredLabel: 'விளம்பரம் · Google Ads',
    },
    dashboard: {
      externalWorkspacesLabel: '6 பங்கு அடிப்படையிலான டாஷ்போர்டுகள்',
      myRoleBadge: 'என் பங்கு',
      editProfile: 'சுயவிவரத்தைத் திருத்து',
      searchPlaceholder: 'திட்டங்கள், பதிவுகள், #குறிச்சொற்கள் அல்லது வாய்ப்புகளைத் தேடுங்கள்...',
      filterBySector: 'துறை வடிகட்டி',
      allFeed: 'அனைத்தும்',
      projects: 'திட்டங்கள்',
      posts: 'பதிவுகள்',
      opportunities: 'வாய்ப்புகள்',
      addProject: 'திட்டம் சேர்',
      publishPost: 'பதிவை வெளியிடு',
      communityPosts: 'சமூகப் பதிவுகள்',
      openOpportunities: 'திறந்த வாய்ப்புகள்',
      applyNow: 'விண்ணப்பிக்கவும்',
      yourIdentity: 'உங்கள் அடையாளம்',
      completeProfileBtn: '5-பிரிவு சுயவிவரத்தை நிறைவு செய்',
      publicPortfolioBtn: 'பொது போர்ட்ஃபோலியோ',
      recommendedFor: 'பரிந்துரை:',
      roles: {
        student: { shortLabel: 'மாணவர்', badgeLabel: 'மாணவர் தளம்', title: 'மாணவர் புதுமை டாஷ்போர்டு', subtitle: 'உங்கள் திட்டங்களை கண்காணித்து வாய்ப்புகளைக் கண்டறியுங்கள்.', action: 'புதிய திட்டம்' },
        researcher: { shortLabel: 'ஆய்வாளர்', badgeLabel: 'ஆய்வாளர் தளம்', title: 'ஆராய்ச்சி & ஆய்வக டாஷ்போர்டு', subtitle: 'ஆய்வுக்கட்டுரைகள் மற்றும் திறந்த தரவுகளை நிர்வகிக்கவும்.', action: 'ஆய்வை வெளியிடு' },
        faculty: { shortLabel: 'பேராசிரியர்', badgeLabel: 'பேராசிரியர் தளம்', title: 'பேராசிரியர் & ஆய்வக டாஷ்போர்டு', subtitle: 'மாணவர் படைப்புகளை சரிபார்த்து வழிகாட்டவும்.', action: 'புதிய ஆய்வகத் திட்டம்' },
        industry: { shortLabel: 'தொழில்துறை', badgeLabel: 'தொழில்துறை தளம்', title: 'தொழில்துறை & திறமை டாஷ்போர்டு', subtitle: 'R&D சவால்களை வெளியிட்டு திறமையாளர்களைத் தேர்ந்தெடுக்கவும்.', action: 'புதிய R&D சவால்' },
        institution: { shortLabel: 'நிறுவனம்', badgeLabel: 'அரசு & நிறுவன தளம்', title: 'நிறுவன & தேசிய மிஷன் டாஷ்போர்டு', subtitle: 'விக்சித் பாரத் 2047 திட்டங்கள் மற்றும் மானியங்களைக் கண்காணிக்கவும்.', action: 'புதிய மிஷன்' },
        mentor: { shortLabel: 'வழிகாட்டி', badgeLabel: 'வழிகாட்டி தளம்', title: 'வழிகாட்டி & ஆலோசனை டாஷ்போர்டு', subtitle: 'மாதிரிகளை மதிப்பாய்வு செய்து குழுக்களை வழிநடத்தவும்.', action: 'கருத்து பகிர்' },
      },
    },
    sidebar: {
      navigation: 'வழிசெலுத்தல்',
      account: 'கணக்கு',
      newProject: 'புதிய திட்டம்',
      collapse: 'பக்கப்பட்டியைச் சுருக்கு',
      expand: 'பக்கப்பட்டியை விரி',
      publicPortfolio: 'பொது போர்ட்ஃபோலியோ',
      membershipPlans: 'உறுப்பினர் திட்டங்கள்',
      onboardingSkills: 'திறன்கள் & தொடக்கம்',
      workspaceMenu: 'பணியிட மெனு',
      language: 'மொழி',
    },
    studentDash: {
      checklistTitle: '5-படி செயல்பாட்டு சரிபார்ப்பு பட்டியல்',
      checklistSubtitle: 'ஆசிரியர் மற்றும் தொழில் சரிபார்ப்புக்கான ஆதாரங்களை உருவாக்குங்கள்',
      nextMilestonesTitle: 'அடுத்த மைல்கற்கள்',
      nextMilestonesSubtitle: 'நிலுவையில் உள்ள படிகள்',
      readinessTitle: 'பணிச்சான்று தயார்நிலை',
      readinessSubtitle: 'வாய்ப்புகளை மேம்படுத்தும் படிகள்',
      updateInterestsBtn: 'திறன்களை புதுப்பிக்கவும்',
      studentWall: 'மாணவர் சுவர்',
      buildsMediaTitle: 'திட்டங்கள் & மீடியா சுருக்கம்',
      buildsMediaSubtitle: 'திட்டங்கள், சுவர் இடுகைகள் & மீடியா',
    },
    verifyEmail: {
      pageTitle: 'மின்னஞ்சல் சரிபார்ப்பு',
      verifying: 'மின்னஞ்சல் சரிபார்க்கப்படுகிறது...',
      verifiedTitle: 'மின்னஞ்சல் சரிபார்க்கப்பட்டது!',
      goToDashboard: 'டாஷ்போர்டுக்குச் செல்லவும்',
      signInToContinue: 'தொடர உள்நுழையவும்',
      failedTitle: 'சரிபார்ப்பு தோல்வி',
      backToSignIn: 'உள்நுழைவுக்குத் திரும்பவும்',
    },
  }),

  te: mergeLocale({
    nav: {
      about: 'మా గురించి',
      career: 'కెరీర్',
      events: 'ఈవెంట్స్',
      dashboard: 'డాష్‌బోర్డ్',
      myProfile: 'నా ప్రొఫైల్',
      onboarding: 'ఆన్‌బోర్డింగ్',
      plans: 'ప్లాన్స్',
      premium: 'ప్రీమియం',
      signIn: 'సైన్ ఇన్',
      signUp: 'సైన్ అప్',
      signOut: 'సైన్ అవుట్',
      switchLanguage: 'భాష మార్చండి',
    },
    footer: {
      tagline: 'వికసిత్ భారత్ 2047 లక్ష్యంగా విద్యార్థులు, విద్యాసంస్థలు మరియు పరిశ్రమలను అనుసంధానిస్తుంది.',
      general: 'సాధారణం',
      yourAccount: 'మీ ఖాతా',
      legal: 'చట్టపరమైన & DPDP',
      builtFor: 'నిరూపితమైన పని కోసం · వికసిత్ భారత్ 2047',
    },
    home: {
      heroBadge: 'ప్రతిభ × ఆలోచనలు × అవకాశాలు × ప్రభావం',
      heroTitlePrimary: 'మీ ఆవిష్కరణ.',
      heroTitleSecondary: 'మీ గుర్తింపు.',
      heroSubtitle: 'వికసిత్ భారత్ 2047 దిశగా ఆవిష్కరణలను వేగవంతం చేయడానికి విద్యార్థులు, విద్యాసంస్థలు మరియు పరిశ్రమలను అనుసంధానించడం.',
      heroDescription:
        'విద్యార్థులు, పరిశోధకులు, పరిశ్రమలు, స్టార్టప్‌లు మరియు మెంటర్‌లను కలిపి ఆవిష్కరణలను ప్రదర్శించడానికి Collab47 తోడ్పడుతుంది.',
      dpdpNote: 'భారత DPDP చట్టం 2023 డేటా హక్కులతో రక్షించబడింది · వికసిత్ భారత్ 2047.',
      highlightsBadge: 'ప్లాట్‌ఫారమ్ ముఖ్యాంశాలు',
      highlightsTitle: 'మీరు నిర్మించిన దాన్ని నిరూపించడానికి అన్నీ ఇక్కడే',
      highlightsSubtitle: 'బాణాలను ఉపయోగించి ప్రధాన ఫీచర్లను చూడండి.',
      whoBadge: 'ఇది ఎవరి కోసం?',
      whoTitle: 'భారతదేశ ఆవిష్కరణ వ్యవస్థలోని ప్రతి నిర్మాత కోసం',
      howBadge: 'ఇది ఎలా పనిచేస్తుంది',
      howTitle: 'క్యాంపస్ ప్రోటోటైప్ నుండి జాతీయ ప్రభావం వరకు',
      ctaTitle: 'మీ ధృవీకరించబడిన ఆవిష్కరణ గుర్తింపును నిర్మించడానికి సిద్ధమా?',
      ctaSignUp: 'ఉచితంగా సైన్ అప్ చేయండి',
      ctaSignIn: 'సైన్ ఇన్ చేయండి',
    },
    auth: {
      backToHome: 'హోమ్‌కు వెళ్ళండి',
      loginTitle: 'తిరిగి స్వాగతం',
      loginSubtitle: 'మీ ప్రొఫైల్ మరియు ప్రాజెక్టులను నిర్వహించడానికి సైన్ ఇన్ చేయండి.',
      continueWithGoogle: 'Google తో కొనసాగండి',
      orContinueEmail: 'లేదా ఇమెయిల్‌తో కొనసాగండి',
      emailLabel: 'ఇమెయిల్ చిరునామా',
      passwordLabel: 'పాస్‌వర్డ్',
      rememberMe: 'నన్ను సైన్ ఇన్‌లో ఉంచండి (30 రోజులు)',
      signInBtn: 'సైన్ ఇన్',
      newToCollab: 'Collab47 లో కొత్తవారా?',
      createAccountLink: 'ఖాతా సృష్టించండి',
      signupTitle: 'మీ ఖాతాను సృష్టించండి',
      signupSubtitle: 'దశ 1 / 2 · ఖాతా సృష్టించి, ఉచిత లేదా ప్రీమియం ప్లాన్ ఎంచుకోండి.',
      step1Label: 'ఖాతా వివరాలు',
      step2Label: 'ప్లాన్ ఎంపిక',
      signupWithGoogle: 'Google తో సైన్ అప్ చేయండి',
      orRegisterEmail: 'లేదా ఇమెయిల్‌తో నమోదు చేసుకోండి',
      fullNameLabel: 'పూర్తి పేరు',
      confirmPasswordLabel: 'పాస్‌వర్డ్ నిర్ధారించండి',
      continueToPlansBtn: 'ప్లాన్ ఎంపికకు వెళ్ళండి',
      alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      signInLink: 'సైన్ ఇన్',
    },
    membership: {
      step1Done: '1. ఖాతా సృష్టించబడింది',
      step2Active: '2. ప్లాన్ & చెల్లింపు',
      chooseTitle: 'మీ Collab47 మెంబర్‌షిప్ ఎంచుకోండి',
      continueFreeBtn: 'ఉచిత ప్లాన్‌తో కొనసాగండి',
      payGoAdFreeBtn: 'యాడ్-ఫ్రీ ప్రీమియం',
      billingTitle: 'మెంబర్‌షిప్ & భారతీయ చెల్లింపులు',
      backToDashboard: 'డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి',
      removeAdsCta: 'ప్రీమియంతో ప్రకటనలు తొలగించండి',
      goAdFreeBtn: 'యాడ్-ఫ్రీ పొందండి',
      sponsoredLabel: 'ప్రకటన · Google Ads',
    },
    dashboard: {
      externalWorkspacesLabel: '6 పాత్ర-ఆధారిత డాష్‌బోర్డ్‌లు',
      myRoleBadge: 'నా పాత్ర',
      editProfile: 'ప్రొఫైల్ సవరించండి',
      searchPlaceholder: 'ప్రాజెక్టులు, పోస్ట్‌లు, #ట్యాగ్‌లు లేదా అవకాశాలను శోధించండి...',
      filterBySector: 'రంగం ఎంచుకోండి',
      allFeed: 'అన్నీ',
      projects: 'ప్రాజెక్టులు',
      posts: 'పోస్ట్‌లు',
      opportunities: 'అవకాశాలు',
      addProject: 'ప్రాజెక్ట్ జోడించు',
      publishPost: 'పోస్ట్ ప్రచురించు',
      communityPosts: 'కమ్యూనిటీ పోస్ట్‌లు',
      openOpportunities: 'అందుబాటులో ఉన్న అవకాశాలు',
      applyNow: 'దరఖాస్తు చేయండి',
      yourIdentity: 'మీ గుర్తింపు',
      completeProfileBtn: '5-విభాగాల ప్రొఫైల్ పూర్తి చేయండి',
      publicPortfolioBtn: 'పబ్లిక్ పోర్ట్‌ఫోలియో',
      recommendedFor: 'సిఫార్సు:',
      roles: {
        student: { shortLabel: 'విద్యార్థి', badgeLabel: 'విద్యార్థి వర్క్‌స్పేస్', title: 'విద్యార్థి ఆవిష్కరణ డాష్‌బోర్డ్', subtitle: 'మీ ప్రాజెక్టులను ట్రాక్ చేసి అవకాశాలను పొందండి.', action: 'కొత్త ప్రాజెక్ట్' },
        researcher: { shortLabel: 'పరిశోధకుడు', badgeLabel: 'పరిశోధన వర్క్‌స్పేస్', title: 'పరిశోధన & ల్యాబ్ డాష్‌బోర్డ్', subtitle: 'పబ్లికేషన్లు మరియు ఓపెన్ డేటాసెట్లను నిర్వహించండి.', action: 'అధ్యయనం జోడించు' },
        faculty: { shortLabel: 'ఫ్యాకల్టీ', badgeLabel: 'ఫ్యాకల్టీ వర్క్‌స్పేస్', title: 'ఫ్యాకల్టీ & ల్యాబ్ డాష్‌బోర్డ్', subtitle: 'విద్యార్థుల ప్రాజెక్టులను ధృవీకరించండి.', action: 'కొత్త ల్యాబ్ ప్రాజెక్ట్' },
        industry: { shortLabel: 'పరిశ్రమ', badgeLabel: 'పరిశ్రమ వర్క్‌స్పేస్', title: 'పరిశ్రమ & ప్రతిభ డాష్‌బోర్డ్', subtitle: 'R&D సవాళ్లను పోస్ట్ చేసి ప్రతిభావంతులను ఎంపిక చేయండి.', action: 'కొత్త R&D ఛాలెంజ్' },
        institution: { shortLabel: 'సంస్థ', badgeLabel: 'ప్రభుత్వ & సంస్థ వర్క్‌స్పేస్', title: 'సంస్థాగత & జాతీయ మిషన్ డాష్‌బోర్డ్', subtitle: 'వికసిత్ భారత్ 2047 మిషన్లను ట్రాక్ చేయండి.', action: 'కొత్త మిషన్' },
        mentor: { shortLabel: 'మెంటర్', badgeLabel: 'మెంటర్ వర్క్‌స్పేస్', title: 'మెంటర్ & సలహాదారు డాష్‌బోర్డ్', subtitle: 'ప్రోటోటైప్‌లను సమీక్షించి బృందాలకు మార్గనిర్దేశం చేయండి.', action: 'సూచన పంచుకోండి' },
      },
    },
    sidebar: {
      navigation: 'నావిగేషన్',
      account: 'ఖాతా',
      newProject: 'కొత్త ప్రాజెక్ట్',
      collapse: 'సైడ్‌బార్ మూయండి',
      expand: 'సైడ్‌బార్ తెరవండి',
      publicPortfolio: 'పబ్లిక్ పోర్ట్‌ఫోలియో',
      membershipPlans: 'సభ్యత్వ ప్రణాళికలు',
      onboardingSkills: 'ఆన్‌బోర్డింగ్ & నైపుణ్యాలు',
      workspaceMenu: 'వర్క్‌స్పేస్ మెనూ',
      language: 'భాష',
    },
    studentDash: {
      checklistTitle: '5-దశల వర్క్‌బెంచ్ చెక్‌లిస్ట్',
      checklistSubtitle: 'అధ్యాపక & పరిశ్రమ ధృవీకరణ కోసం దశలవారీ ఆధారాలు నిర్మించండి',
      nextMilestonesTitle: 'తదుపరి మైలురాళ్ళు',
      nextMilestonesSubtitle: 'పెండింగ్ దశలను పూర్తి చేయండి',
      readinessTitle: 'ప్రూఫ్-ఆఫ్-వర్క్ సిద్ధత',
      readinessSubtitle: 'క్యాంపస్ & రిక్రూటర్ గుర్తింపును పెంచే చర్యలు',
      updateInterestsBtn: 'నైపుణ్యాలు అప్‌డేట్ చేయండి',
      studentWall: 'స్టూడెంట్ వాల్',
      buildsMediaTitle: 'ప్రాజెక్ట్‌లు & మీడియా అవలోకనం',
      buildsMediaSubtitle: 'ప్రాజెక్ట్‌లు, వాల్ పోస్ట్‌లు & మీడియా',
    },
    verifyEmail: {
      pageTitle: 'ఇమెయిల్ ధృవీకరణ',
      verifying: 'మీ ఇమెయిల్ ధృవీకరించబడుతోంది...',
      verifiedTitle: 'ఇమెయిల్ ధృవీకరించబడింది!',
      goToDashboard: 'డాష్‌బోర్డ్‌కు వెళ్లండి',
      signInToContinue: 'కొనసాగించడానికి సైన్ ఇన్ చేయండి',
      failedTitle: 'ధృవీకరణ విఫలమైంది',
      backToSignIn: 'సైన్ ఇన్‌కు తిరిగి వెళ్లండి',
    },
  }),

  kn: mergeLocale({
    nav: {
      about: 'ನಮ್ಮ ಬಗ್ಗೆ',
      career: 'ವೃತ್ತಿ',
      events: 'ಕಾರ್ಯಕ್ರಮಗಳು',
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      myProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
      onboarding: 'ಆನ್‌ಬೋರ್ಡಿಂಗ್',
      plans: 'ಯೋಜನೆಗಳು',
      premium: 'ಪ್ರೀಮಿಯಂ',
      signIn: 'ಸೈನ್ ಇನ್',
      signUp: 'ಸೈನ್ ಅಪ್',
      signOut: 'ಸೈನ್ ಔಟ್',
      switchLanguage: 'ಭಾಷೆ ಬದಲಿಸಿ',
    },
    footer: {
      tagline: 'ವಿಕಸಿತ ಭಾರತ 2047 ಗುರಿಯತ್ತ ವಿದ್ಯಾರ್ಥಿಗಳು, ಶಿಕ್ಷಣ ಮತ್ತು ಉದ್ಯಮವನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ.',
      general: 'ಸಾಮಾನ್ಯ',
      yourAccount: 'ನಿಮ್ಮ ಖಾತೆ',
      legal: 'ಕಾನೂನು & DPDP',
      builtFor: 'ಪ್ರಮಾಣಿತ ಕಾರ್ಯಕ್ಕಾಗಿ · ವಿಕಸಿತ ಭಾರತ 2047',
    },
    home: {
      heroBadge: 'ಪ್ರತಿಭೆ × ಆಲೋಚನೆಗಳು × ಅವಕಾಶಗಳು × ಪ್ರಭಾವ',
      heroTitlePrimary: 'ನಿಮ್ಮ ನಾವೀನ್ಯತೆ.',
      heroTitleSecondary: 'ನಿಮ್ಮ ಗುರುತು.',
      heroSubtitle: 'ವಿಕಸಿತ ಭಾರತ 2047 ಕಡೆಗೆ ನಾವೀನ್ಯತೆಯನ್ನು ಮುನ್ನಡೆಸಲು ವಿದ್ಯಾರ್ಥಿಗಳು, ಶಿಕ್ಷಣ ಮತ್ತು ಉದ್ಯಮವನ್ನು ಜೋಡಿಸುವುದು.',
      dpdpNote: 'ಭಾರತದ DPDP ಕಾಯ್ದೆ 2023 ರ ಅಡಿಯಲ್ಲಿ ಡೇಟಾ ಹಕ್ಕುಗಳು ರಕ್ಷಿತ · ವಿಕಸಿತ ಭಾರತ 2047.',
      highlightsBadge: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಮುಖ್ಯಾಂಶಗಳು',
      highlightsTitle: 'ನಿಮ್ಮ ನಿರ್ಮಾಣವನ್ನು ಸಾಬೀತುಪಡಿಸಲು ಬೇಕಾದ ಎಲ್ಲವೂ',
      whoBadge: 'ಇದು ಯಾರಿಗಾಗಿ?',
      whoTitle: 'ಭಾರತದ ನಾವೀನ್ಯತೆ ಪರಿಸರದ ಪ್ರತಿಯೊಬ್ಬ ನಿರ್ಮಾತೃವಿಗಾಗಿ',
      howBadge: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
      howTitle: 'ಕ್ಯಾಂಪಸ್ ನಿರ್ಮಾಣದಿಂದ ರಾಷ್ಟ್ರೀಯ ಪ್ರಭಾವದವರೆಗೆ',
      ctaTitle: 'ನಿಮ್ಮ ಪ್ರಮಾಣಿತ ನಾವೀನ್ಯತೆ ಗುರುತನ್ನು ನಿರ್ಮಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
      ctaSignUp: 'ಉಚಿತವಾಗಿ ಸೈನ್ ಅಪ್ ಮಾಡಿ',
      ctaSignIn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ',
    },
    auth: {
      backToHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      loginTitle: 'ಮರಳಿ ಸ್ವಾಗತ',
      continueWithGoogle: 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಸಿ',
      emailLabel: 'ಇಮೇಲ್ ವಿಳಾಸ',
      passwordLabel: 'ಪಾಸ್‌ವರ್ಡ್',
      signInBtn: 'ಸೈನ್ ಇನ್',
      signupTitle: 'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ',
      step1Label: 'ಖಾತೆ ವಿವರಗಳು',
      step2Label: 'ಯೋಜನೆ ಆಯ್ಕೆ',
      fullNameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
      confirmPasswordLabel: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
      continueToPlansBtn: 'ಯೋಜನೆ ಆಯ್ಕೆಗೆ ಮುಂದುವರಿಯಿರಿ',
    },
    membership: {
      chooseTitle: 'ನಿಮ್ಮ Collab47 ಸದಸ್ಯತ್ವ ಆಯ್ಕೆಮಾಡಿ',
      continueFreeBtn: 'ಉಚಿತ ಯೋಜನೆಯೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ',
      billingTitle: 'ಸದಸ್ಯತ್ವ ಮತ್ತು ಭಾರತೀಯ ಪಾವತಿಗಳು',
      backToDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
      removeAdsCta: 'ಪ್ರೀಮಿಯಂನೊಂದಿಗೆ ಜಾಹೀರಾತು ತೆಗೆದುಹಾಕಿ',
      goAdFreeBtn: 'ಜಾಹೀರಾತು ಮುಕ್ತ',
      sponsoredLabel: 'ಪ್ರಾಯೋಜಿತ · Google Ads',
    },
    dashboard: {
      externalWorkspacesLabel: '6 ಪಾತ್ರ-ಆಧಾರಿತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗಳು',
      myRoleBadge: 'ನನ್ನ ಪಾತ್ರ',
      editProfile: 'ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ',
      allFeed: 'ಎಲ್ಲಾ ಫೀಡ್',
      projects: 'ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು',
      posts: 'ಪೋಸ್ಟ್‌ಗಳು',
      opportunities: 'ಅವಕಾಶಗಳು',
      applyNow: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    },
    sidebar: {
      navigation: 'ನ್ಯಾವಿಗೇಷನ್',
      account: 'ಖಾತೆ',
      newProject: 'ಹೊಸ ಪ್ರಾಜೆಕ್ಟ್',
      collapse: 'ಸೈಡ್‌ಬಾರ್ ಕುಗ್ಗಿಸಿ',
      expand: 'ಸೈಡ್‌ಬಾರ್ ವಿಸ್ತರಿಸಿ',
      publicPortfolio: 'ಸಾರ್ವಜನಿಕ ಪೋರ್ಟ್‌ಫೋಲಿಯೋ',
      membershipPlans: 'ಸದಸ್ಯತ್ವ ಯೋಜನೆಗಳು',
      onboardingSkills: 'ಆನ್‌ಬೋರ್ಡಿಂಗ್ & ಕೌಶಲ್ಯಗಳು',
      workspaceMenu: 'ವರ್ಕ್‌ಸ್ಪೇಸ್ ಮೆನು',
      language: 'ಭಾಷೆ',
    },
    studentDash: {
      checklistTitle: '5-ಹಂತದ ವರ್ಕ್‌ಬೆಂಚ್ ಪಟ್ಟಿ',
      checklistSubtitle: 'ಪ್ರಾಧ್ಯಾಪಕರು ಮತ್ತು ಉದ್ಯಮ ದೃಢೀಕರಣಕ್ಕಾಗಿ ಹಂತ ಹಂತವಾಗಿ ನಿರ್ಮಿಸಿ',
      nextMilestonesTitle: 'ಮುಂದಿನ ಮೈಲಿಗಲ್ಲುಗಳು',
      nextMilestonesSubtitle: 'ಬಾಕಿ ಇರುವ ಹಂತಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ',
      readinessTitle: 'ಪ್ರೂಫ್-ಆಫ್-ವರ್ಕ್ ಸಿದ್ಧತೆ',
      readinessSubtitle: 'ಕ್ಯಾಂಪಸ್ ಮತ್ತು ಉದ್ಯೋಗ ಅವಕಾಶಗಳನ್ನು ಹೆಚ್ಚಿಸಿ',
      updateInterestsBtn: 'ಆಸಕ್ತಿ & ಕೌಶಲ್ಯ ನವೀಕರಿಸಿ',
      studentWall: 'ವಿದ್ಯಾರ್ಥಿ ಗೋಡೆ',
      buildsMediaTitle: 'ಪ್ರಾಜೆಕ್ಟ್ & ಮೀಡಿಯಾ ಸಾರಾಂಶ',
      buildsMediaSubtitle: 'ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು, ಪೋಸ್ಟ್‌ಗಳು ಮತ್ತು ಮೀಡಿಯಾ',
    },
    verifyEmail: {
      pageTitle: 'ಇಮೇಲ್ ದೃಢೀಕರಣ',
      verifying: 'ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
      verifiedTitle: 'ಇಮೇಲ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ!',
      goToDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
      signInToContinue: 'ಮುಂದುವರಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ',
      failedTitle: 'ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ',
      backToSignIn: 'ಸೈನ್ ಇನ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    },
  }),

  bn: mergeLocale({
    nav: {
      about: 'আমাদের সম্পর্কে',
      career: 'ক্যারিয়ার',
      events: 'ইভেন্টস',
      dashboard: 'ড্যাশবোর্ড',
      myProfile: 'আমার প্রোফাইল',
      onboarding: 'অনবোর্ডিং',
      plans: 'প্ল্যানস',
      premium: 'প্রিমিয়াম',
      signIn: 'সাইন ইন',
      signUp: 'সাইন আপ',
      signOut: 'সাইন আউট',
      switchLanguage: 'ভাষা পরিবর্তন করুন',
    },
    footer: {
      tagline: 'বিকশিত ভারত ২০৪৭-এর লক্ষ্যে শিক্ষার্থী, শিক্ষাবিদ ও শিল্পকে একত্রে যুক্ত করছে।',
      general: 'সাধারণ',
      yourAccount: 'আপনার অ্যাকাউন্ট',
      legal: 'আইন ও DPDP',
      builtFor: 'প্রমাণিত কাজের জন্য · বিকশিত ভারত ২০৪৭',
    },
    home: {
      heroBadge: 'প্রতিভা × ভাবনা × সুযোগ × প্রভাব',
      heroTitlePrimary: 'আপনার উদ্ভাবন।',
      heroTitleSecondary: 'আপনার পরিচয়।',
      heroSubtitle: 'বিকশিত ভারত ২০৪৭-এর পথে উদ্ভাবনকে এগিয়ে নিতে শিক্ষার্থী, শিক্ষাজগৎ ও শিল্পকে সংযুক্ত করা।',
      dpdpNote: 'ভারতের DPDP আইন ২০২৩ দ্বারা ডেটা অধিকার সুরক্ষিত · বিকশিত ভারত ২০৪৭।',
      highlightsBadge: 'প্ল্যাটফর্ম বৈশিষ্ট্য',
      highlightsTitle: 'আপনার কাজ প্রমাণ করার সবকিছু এক জায়গায়',
      whoBadge: 'এটি কাদের জন্য?',
      whoTitle: 'ভারতের উদ্ভাবন ইকোসিস্টেমের প্রতিটি নির্মাতার জন্য',
      howBadge: 'কীভাবে কাজ করে',
      howTitle: 'ক্যাম্পাস প্রোটোটাইপ থেকে জাতীয় প্রভাব পর্যন্ত',
      ctaTitle: 'আপনার যাচাইকৃত উদ্ভাবন পরিচয় গড়তে প্রস্তুত?',
      ctaSignUp: 'বিনামূল্যে সাইন আপ করুন',
      ctaSignIn: 'সাইন ইন করুন',
    },
    auth: {
      backToHome: 'হোমে ফিরে যান',
      loginTitle: 'স্বাগতম',
      continueWithGoogle: 'Google দিয়ে চালিয়ে যান',
      emailLabel: 'ইমেল ঠিকানা',
      passwordLabel: 'পাসওয়ার্ড',
      signInBtn: 'সাইন ইন',
      signupTitle: 'আপনার অ্যাকাউন্ট তৈরি করুন',
      step1Label: 'অ্যাকাউন্ট তথ্য',
      step2Label: 'প্ল্যান নির্বাচন',
      fullNameLabel: 'পূর্ণ নাম',
      confirmPasswordLabel: 'পাসওয়ার্ড নিশ্চিত করুন',
      continueToPlansBtn: 'প্ল্যান নির্বাচনে এগিয়ে যান',
    },
    membership: {
      chooseTitle: 'আপনার Collab47 সদস্যপদ বেছে নিন',
      continueFreeBtn: 'ফ্রি সদস্যপদে চালিয়ে যান',
      billingTitle: 'সদস্যপদ ও ভারতীয় পেমেন্ট',
      backToDashboard: 'ড্যাশবোর্ডে ফিরে যান',
      removeAdsCta: 'প্রিমিয়ামে বিজ্ঞাপন সরান',
      goAdFreeBtn: 'বিজ্ঞাপন-মুক্ত হন',
      sponsoredLabel: 'বিজ্ঞাপন · Google Ads',
    },
    dashboard: {
      externalWorkspacesLabel: '৬টি ভূমিকা-ভিত্তিক ড্যাশবোর্ড',
      myRoleBadge: 'আমার ভূমিকা',
      editProfile: 'প্রোফাইল সম্পাদনা',
      allFeed: 'সব ফিড',
      projects: 'প্রজেক্ট',
      posts: 'পোস্ট',
      opportunities: 'সুযোগ',
      applyNow: 'আবেদন করুন',
    },
    sidebar: {
      navigation: 'নেভিগেশন',
      account: 'অ্যাকাউন্ট',
      newProject: 'নতুন প্রজেক্ট',
      collapse: 'সাইডবার সংকুচিত করুন',
      expand: 'সাইডবার প্রসারিত করুন',
      publicPortfolio: 'পাবলিক পোর্টফোলিও',
      membershipPlans: 'সদস্যপদ ও প্ল্যান',
      onboardingSkills: 'অনবোর্ডিং ও দক্ষতা',
      workspaceMenu: 'ওয়ার্কস্পেস মেনু',
      language: 'ভাষা',
    },
    studentDash: {
      checklistTitle: '৫-ধাপের ওয়ার্কবেঞ্চ চেকলিস্ট',
      checklistSubtitle: 'অনুষদ ও শিল্প যাচাইকরণের জন্য ধাপে ধাপে প্রমাণ তৈরি করুন',
      nextMilestonesTitle: 'পরবর্তী মাইলফলক',
      nextMilestonesSubtitle: 'বাকি ধাপগুলি সম্পূর্ণ করুন',
      readinessTitle: 'প্রুফ-অফ-ওয়ার্ক প্রস্তুতি',
      readinessSubtitle: 'ক্যাম্পাস ও নিয়োগের সুযোগ বাড়ান',
      updateInterestsBtn: 'আগ্রহ ও দক্ষতা আপডেট করুন',
      studentWall: 'স্টুডেন্ট ওয়াল',
      buildsMediaTitle: 'প্রজেক্ট ও মিডিয়া সারাংশ',
      buildsMediaSubtitle: 'প্রজেক্ট, ওয়াল পোস্ট ও শেয়ার করা মিডিয়া',
    },
    verifyEmail: {
      pageTitle: 'ইমেইল যাচাইকরণ',
      verifying: 'আপনার ইমেইল যাচাই করা হচ্ছে...',
      verifiedTitle: 'ইমেইল যাচাই সম্পন্ন!',
      goToDashboard: 'ড্যাশবোর্ডে যান',
      signInToContinue: 'চালিয়ে যেতে সাইন ইন করুন',
      failedTitle: 'যাচাইকরণ ব্যর্থ হয়েছে',
      backToSignIn: 'সাইন ইনে ফিরে যান',
    },
  }),

  gu: mergeLocale({
    nav: {
      about: 'અમારા વિશે',
      career: 'કારકિર્દી',
      events: 'ઇવેન્ટ્સ',
      dashboard: 'ડેશબોર્ડ',
      myProfile: 'મારી પ્રોફાઇલ',
      onboarding: 'ઓનબોર્ડિંગ',
      plans: 'પ્લાન્સ',
      premium: 'પ્રીમિયમ',
      signIn: 'સાઇન ઇન',
      signUp: 'સાઇન અપ',
      signOut: 'સાઇન આઉટ',
      switchLanguage: 'ભાષા બદલો',
    },
    footer: {
      tagline: 'વિકસિત ભારત 2047 તરફ નવીનતાને વેગ આપવા વિદ્યાર્થીઓ, શિક્ષણ અને ઉદ્યોગને જોડે છે.',
      general: 'સામાન્ય',
      yourAccount: 'તમારું ખાતું',
      legal: 'કાનૂની અને DPDP',
      builtFor: 'પ્રમાણિત કાર્ય માટે · વિકસિત ભારત 2047',
    },
    home: {
      heroBadge: 'પ્રતિભા × વિચાર × તકો × પ્રભાવ',
      heroTitlePrimary: 'તમારી નવીનતા.',
      heroTitleSecondary: 'તમારી ઓળખ.',
      heroSubtitle: 'વિકસિત ભારત 2047 ની દિશામાં નવીનતા લાવવા વિદ્યાર્થીઓ, શિક્ષણ અને ઉદ્યોગને જોડતું મંચ.',
      dpdpNote: 'ભારતના DPDP કાયદા 2023 હેઠળ ડેટા અધિકારો સુરક્ષિત · વિકસિત ભારત 2047.',
      highlightsBadge: 'પ્લેટફોર્મ વિશેષતાઓ',
      highlightsTitle: 'તમે બનાવેલું કાર્ય સાબિત કરવા માટે બધું એક સ્થળે',
      whoBadge: 'આ કોના માટે છે?',
      whoTitle: 'ભારતના નવીનતા ઇકોસિસ્ટમના દરેક સર્જક માટે',
      howBadge: 'આ કેવી રીતે કામ કરે છે',
      howTitle: 'કેમ્પસ પ્રોટોટાઇપથી રાષ્ટ્રીય પ્રભાવ સુધી',
      ctaTitle: 'શું તમે તમારી પ્રમાણિત નવીનતા ઓળખ બનાવવા તૈયાર છો?',
      ctaSignUp: 'મફત સાઇન અપ કરો',
      ctaSignIn: 'સાઇન ઇન કરો',
    },
    auth: {
      backToHome: 'હોમ પર પાછા જાઓ',
      loginTitle: 'ફરી સ્વાગત છે',
      continueWithGoogle: 'Google સાથે ચાલુ રાખો',
      emailLabel: 'ઇમેઇલ સરનામું',
      passwordLabel: 'પાસવર્ડ',
      signInBtn: 'સાઇન ઇન',
      signupTitle: 'તમારું ખાતું બનાવો',
      step1Label: 'ખાતાની વિગતો',
      step2Label: 'પ્લાન પસંદ કરો',
      fullNameLabel: 'પૂરું નામ',
      confirmPasswordLabel: 'પાસવર્ડની પુષ્ટિ કરો',
      continueToPlansBtn: 'પ્લાન પસંદગી પર આગળ વધો',
    },
    membership: {
      chooseTitle: 'તમારી Collab47 સભ્યપદ પસંદ કરો',
      continueFreeBtn: 'ફ્રી સભ્યપદ સાથે ચાલુ રાખો',
      billingTitle: 'સભ્યપદ અને ભારતીય ચુકવણી',
      backToDashboard: 'ડેશબોર્ડ પર પાછા જાઓ',
      removeAdsCta: 'પ્રીમિયમ સાથે જાહેરાતો દૂર કરો',
      goAdFreeBtn: 'જાહેરાત-મુક્ત બનો',
      sponsoredLabel: 'જાહેરાત · Google Ads',
    },
    dashboard: {
      externalWorkspacesLabel: '6 ભૂમિકા-આધારિત ડેશબોર્ડ્સ',
      myRoleBadge: 'મારી ભૂમિકા',
      editProfile: 'પ્રોફાઇલ સંપાદિત કરો',
      allFeed: 'બધું ફીડ',
      projects: 'પ્રોજેક્ટ્સ',
      posts: 'પોસ્ટ્સ',
      opportunities: 'તકો',
      applyNow: 'અરજી કરો',
    },
    sidebar: {
      navigation: 'નેવિગેશન',
      account: 'ખાતું',
      newProject: 'નવો પ્રોજેક્ટ',
      collapse: 'સાઇડબાર સંકુચિત કરો',
      expand: 'સાઇડબાર વિસ્તૃત કરો',
      publicPortfolio: 'પબ્લિક પોર્ટફોલિયો',
      membershipPlans: 'સભ્યપદ અને પ્લાન',
      onboardingSkills: 'ઓનબોર્ડિંગ અને કૌશલ્યો',
      workspaceMenu: 'વર્કસ્પેસ મેનુ',
      language: 'ભાષા',
    },
    studentDash: {
      checklistTitle: '૫-પગલાની વર્કબેન્ચ ચેકલિસ્ટ',
      checklistSubtitle: 'ફેકલ્ટી અને ઉદ્યોગ ચકાસણી માટે પગલાવાર પુરાવા બનાવો',
      nextMilestonesTitle: 'આગળના માઇલસ્ટોન્સ',
      nextMilestonesSubtitle: 'બાકી પગલાં પૂર્ણ કરો',
      readinessTitle: 'પ્રૂફ-ઓફ-વર્ક તૈયારી',
      readinessSubtitle: 'કેમ્પસ અને ભરતી તકો વધારવાનાં પગલાં',
      updateInterestsBtn: 'રસ અને કૌશલ્યો અપડેટ કરો',
      studentWall: 'વિદ્યાર્થી વોલ',
      buildsMediaTitle: 'પ્રોજેક્ટ્સ અને મીડિયા ઝાંખી',
      buildsMediaSubtitle: 'પ્રોજેક્ટ્સ, વોલ પોસ્ટ્સ અને મીડિયા',
    },
    verifyEmail: {
      pageTitle: 'ઇમેઇલ ચકાસણી',
      verifying: 'તમારું ઇમેઇલ ચકાસાઈ રહ્યું છે...',
      verifiedTitle: 'ઇમેઇલ ચકાસાઈ ગયું!',
      goToDashboard: 'ડેશબોર્ડ પર જાઓ',
      signInToContinue: 'ચાલુ રાખવા માટે સાઇન ઇન કરો',
      failedTitle: 'ચકાસણી નિષ્ફળ',
      backToSignIn: 'સાઇન ઇન પર પાછા જાઓ',
    },
  }),
};
