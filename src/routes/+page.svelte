<script lang="ts">
  import { onMount } from 'svelte';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import { currentUser, isAuthenticated, t } from '$lib/stores';
  import {
    Avatar,
    Footer,
    GoogleAdSlot,
    HeroCarousel,
    type HeroCarouselSlide,
    Icon,
    type IconName,
  } from '$ui';

  const continueHref = $derived(
    $currentUser ? getDashboardPath($currentUser.accountType) : '/dashboard',
  );

  const heroSlides = $derived<readonly HeroCarouselSlide[]>([
    {
      id: 'hero-slide-1',
      badge: $t.home.heroBadge,
      titlePrimary: $t.home.heroTitlePrimary,
      titleSecondary: $t.home.heroTitleSecondary,
      subtitle: $t.home.heroSubtitle,
      description: $t.home.heroDescription,
      stats: [
        { value: '25', label: 'Domains' },
        { value: '86', label: 'STEM Fields' },
        { value: '100%', label: 'Proof of Work' },
      ],
      ctaPrompt:
        "Ready to showcase your builds and collaborate across India's R&D ecosystem? Create your free Collab47 account in under a minute.",
    },
    {
      id: 'hero-slide-2',
      badge: '5-Step Living Workbench',
      titlePrimary: 'Build & Document',
      titleSecondary: 'Real Deliverables.',
      subtitle: 'Proof of work over resume claims — from campus idea to verified impact.',
      description:
        'Document prototypes, codebases, hardware builds, BOMs, test results, and research papers inside a structured 5-step Project Workspace.',
      stats: [
        { value: '5 Steps', label: 'Project Flow' },
        { value: 'BOM & Code', label: 'Deliverables' },
        { value: 'Verified', label: 'Contributor Badges' },
      ],
      ctaPrompt:
        'Turn every prototype, experiment, and research paper into an attested public innovation portfolio.',
    },
    {
      id: 'hero-slide-3',
      badge: "India's R&D & Innovation Network",
      titlePrimary: 'Collaborate Across',
      titleSecondary: 'Academia & Industry.',
      subtitle: 'Bridge students, researchers, startups, mentors, and national missions.',
      description:
        'Connect across 8 ecosystem roles with structured mentorship, real-world challenges, and verified contributor attribution for Viksit Bharat 2047.',
      stats: [
        { value: '8 Roles', label: 'Ecosystem' },
        { value: 'Mentors', label: '& Labs' },
        { value: 'DPDP', label: '2023 Compliant' },
      ],
      ctaPrompt:
        'Join builders, scientists, faculty, and startups solving real-world challenges together.',
    },
  ]);

  let highlightsScrollEl = $state<HTMLDivElement | null>(null);
  let canScrollPrev = $state(false);
  let canScrollNext = $state(true);

  function syncScrollState(): void {
    if (!highlightsScrollEl) return;
    const { scrollLeft, scrollWidth, clientWidth } = highlightsScrollEl;
    canScrollPrev = scrollLeft > 2;
    canScrollNext = scrollLeft + clientWidth < scrollWidth - 2;
  }

  function scrollHighlights(direction: 'prev' | 'next'): void {
    if (!highlightsScrollEl) return;
    highlightsScrollEl.scrollBy({
      left: direction === 'next' ? 324 : -324,
      behavior: 'smooth',
    });
  }

  onMount(() => {
    syncScrollState();
    window.addEventListener('resize', syncScrollState);
    return () => window.removeEventListener('resize', syncScrollState);
  });

  const highlightMeta: ReadonlyArray<{
    id: string;
    icon: IconName;
    accentClass: string;
    tagClass: string;
  }> = [
    {
      id: 'workbench',
      icon: 'layers',
      accentClass: 'bg-violet-500/15 text-violet-300 border-violet-400/25',
      tagClass: 'text-violet-300',
    },
    {
      id: 'taxonomy',
      icon: 'cpu',
      accentClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/25',
      tagClass: 'text-fuchsia-300',
    },
    {
      id: 'proof',
      icon: 'shield-check',
      accentClass: 'bg-purple-500/15 text-purple-300 border-purple-400/25',
      tagClass: 'text-purple-300',
    },
    {
      id: 'industry',
      icon: 'rocket',
      accentClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/25',
      tagClass: 'text-fuchsia-300',
    },
    {
      id: 'mentors',
      icon: 'award',
      accentClass: 'bg-violet-500/15 text-violet-300 border-violet-400/25',
      tagClass: 'text-violet-300',
    },
  ];

  const publicRoleCards: ReadonlyArray<{
    roleCode: string;
    name: string;
    badge: string;
    description: string;
    icon: IconName;
    iconClass: string;
    tagClass: string;
  }> = [
    {
      roleCode: 'student',
      name: 'Student',
      badge: 'Role 01',
      description: 'UG/PG student building projects & verified proof of work.',
      icon: 'graduation-cap',
      iconClass: 'bg-violet-500/15 text-violet-300 border-violet-400/25',
      tagClass: 'text-violet-300',
    },
    {
      roleCode: 'researcher',
      name: 'Researcher',
      badge: 'Role 02',
      description: 'PhD scholar, fellow & open lab researcher publishing artifacts.',
      icon: 'flask',
      iconClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/25',
      tagClass: 'text-fuchsia-300',
    },
    {
      roleCode: 'scientist',
      name: 'Scientist',
      badge: 'Role 03',
      description: 'Applied scientist & R&D specialist leading deep-tech builds.',
      icon: 'cpu',
      iconClass: 'bg-purple-500/15 text-purple-300 border-purple-400/25',
      tagClass: 'text-purple-300',
    },
    {
      roleCode: 'faculty',
      name: 'Faculty',
      badge: 'Role 04',
      description: 'Professor, academic faculty & principal investigator attesting work.',
      icon: 'landmark',
      iconClass: 'bg-violet-500/15 text-violet-300 border-violet-400/25',
      tagClass: 'text-violet-300',
    },
    {
      roleCode: 'industry',
      name: 'Industry',
      badge: 'Role 05',
      description: 'Industry R&D partner, engineer & technical recruiter solving challenges.',
      icon: 'briefcase',
      iconClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/25',
      tagClass: 'text-fuchsia-300',
    },
    {
      roleCode: 'startup',
      name: 'Startup',
      badge: 'Role 06',
      description: 'Startup founder, deep-tech builder & innovation team hiring builders.',
      icon: 'rocket',
      iconClass: 'bg-purple-500/15 text-purple-300 border-purple-400/25',
      tagClass: 'text-purple-300',
    },
    {
      roleCode: 'government',
      name: 'Government',
      badge: 'Role 07',
      description: 'Government agency, national lab & public mission steward for 2047.',
      icon: 'building',
      iconClass: 'bg-violet-500/15 text-violet-300 border-violet-400/25',
      tagClass: 'text-violet-300',
    },
    {
      roleCode: 'others',
      name: 'Others',
      badge: 'Role 08',
      description: 'Independent innovator, mentor & ecosystem contributor.',
      icon: 'sparkles',
      iconClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/25',
      tagClass: 'text-fuchsia-300',
    },
  ];

  const pillarMeta: ReadonlyArray<{
    step: string;
    icon: IconName;
    iconClass: string;
  }> = [
    {
      step: '01',
      icon: 'layers',
      iconClass: 'bg-violet-500/15 text-violet-300 border-violet-400/25',
    },
    {
      step: '02',
      icon: 'cpu',
      iconClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/25',
    },
    {
      step: '03',
      icon: 'shield-check',
      iconClass: 'bg-purple-500/15 text-purple-300 border-purple-400/25',
    },
  ];
</script>

<svelte:head>
  <title>Collab47: {$t.home.heroTitlePrimary} {$t.home.heroTitleSecondary}</title>
  <link
    rel="preload"
    as="image"
    type="image/png"
    href="/images/carasoul-bg.png"
    fetchpriority="high"
  />
</svelte:head>

<main class="w-full bg-[#070312] text-white">
  <!-- Section 1: Revamped Dark Futuristic Hero Carousel (styled after new-dashboard.jpeg) -->
  <HeroCarousel
    slides={heroSlides}
    autoplayDuration={6000}
    isAuthenticated={$isAuthenticated}
    userName={$currentUser?.name ?? ''}
    userAvatarUrl={$currentUser?.avatarUrl}
    {continueHref}
    signUpLabel={$t.nav.signUp}
    signInLabel={$t.auth.signInLink}
    dpdpNote={$t.home.dpdpNote}
  />

  <!-- Section 2: Platform Highlights (Dark Obsidian-Violet Glass Cards) -->
  <section id="highlights" class="relative border-b border-white/10 bg-[#090418] py-18">
    <div class="c47-container">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div class="flex max-w-2xl flex-col items-start gap-2.5">
          <span
            class="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-purple-200"
          >
            {$t.home.highlightsBadge}
          </span>
          <h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {$t.home.highlightsTitle}
          </h2>
          <p class="text-sm font-normal text-purple-200/70 sm:text-base">
            {$t.home.highlightsSubtitle}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-purple-200 transition hover:border-purple-400/60 hover:bg-[#7C3AED] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            onclick={() => scrollHighlights('prev')}
            disabled={!canScrollPrev}
            aria-label="Previous highlight"
          >
            <Icon name="arrow-left" size={16} />
          </button>
          <button
            type="button"
            class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-fuchsia-200 transition hover:border-fuchsia-400/60 hover:bg-[#A855F7] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            onclick={() => scrollHighlights('next')}
            disabled={!canScrollNext}
            aria-label="Next highlight"
          >
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>

      <div
        class="c47-no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-0.5 py-1"
        bind:this={highlightsScrollEl}
        onscroll={syncScrollState}
        role="region"
        aria-label="Platform highlights"
      >
        {#each highlightMeta as style, idx (style.id)}
          {@const copy = $t.home.highlights[idx]}
          <article
            class="w-[308px] shrink-0 snap-start rounded-2xl border border-white/10 bg-[#12082B]/75 p-5 backdrop-blur-md transition duration-300 hover:border-purple-400/45 hover:bg-[#170B36] hover:shadow-[0_12px_40px_rgba(124,58,237,0.22)]"
          >
            <div class="flex flex-col items-start gap-3.5">
              <div class="flex w-full items-center justify-between gap-2">
                <span
                  class="inline-flex h-11 w-11 items-center justify-center rounded-xl border {style.accentClass}"
                >
                  <Icon name={style.icon} size={20} />
                </span>
                <span class="text-[11px] font-bold tracking-wider uppercase {style.tagClass}">
                  {copy?.tag}
                </span>
              </div>
              <h3 class="text-base font-bold text-white">{copy?.title}</h3>
              <p class="text-sm leading-relaxed text-purple-200/70">{copy?.subtitle}</p>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <!-- Section 3: Public Roles Section ("Who Is It For?" — Synced with Signup Public Roles) -->
  <section id="who" class="relative border-b border-white/10 bg-[#070312] py-18">
    <div class="c47-container">
      <div class="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div class="flex max-w-2xl flex-col items-start gap-2.5">
          <span
            class="inline-flex items-center rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-fuchsia-200"
          >
            {$t.home.whoBadge} · {$t.auth.joiningAsHint}
          </span>
          <h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {$t.home.whoTitle}
          </h2>
          <p class="text-sm font-normal text-purple-200/75 sm:text-base">
            {$t.home.whoSubtitle}
          </p>
        </div>
        <span class="text-xs font-semibold text-purple-200/80">
          {$t.auth.joiningAsLabel} → Click any role to sign up
        </span>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each publicRoleCards as role (role.roleCode)}
          <a
            href="/signup?role={role.roleCode}"
            class="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#100726]/85 p-5 no-underline transition duration-300 hover:border-fuchsia-400/50 hover:bg-[#170B36] hover:shadow-[0_14px_40px_rgba(147,51,234,0.24)] hover:no-underline"
          >
            <div
              class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500/0 via-purple-400/70 to-fuchsia-400/0 opacity-0 transition group-hover:opacity-100"
              aria-hidden="true"
            ></div>
            <div class="flex flex-col items-start gap-3.5">
              <div class="flex w-full items-center justify-between gap-2">
                <span
                  class="inline-flex h-11 w-11 items-center justify-center rounded-xl border {role.iconClass}"
                >
                  <Icon name={role.icon} size={20} />
                </span>
                <span class="text-[11px] font-bold tracking-wider uppercase {role.tagClass}">
                  {role.badge}
                </span>
              </div>
              <h3 class="text-base font-bold text-white">{role.name}</h3>
              <p class="text-sm leading-relaxed text-purple-100/75">{role.description}</p>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <!-- Section 4: How It Works Section -->
  <section id="how-it-works" class="relative border-b border-white/10 bg-[#090418] py-18">
    <div class="c47-container">
      <div class="mb-10 flex max-w-2xl flex-col items-start gap-2.5">
        <span
          class="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-purple-200"
        >
          {$t.home.howBadge}
        </span>
        <h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {$t.home.howTitle}
        </h2>
        <p class="text-sm font-normal text-purple-200/70 sm:text-base">
          {$t.home.howSubtitle}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
        {#each pillarMeta as style, idx (style.step)}
          {@const copy = $t.home.pillars[idx]}
          <article
            class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#140A2E]/90 to-[#0D0620]/90 p-6 transition duration-300 hover:border-purple-400/45 hover:shadow-[0_18px_50px_rgba(124,58,237,0.22)]"
          >
            <div class="flex flex-col items-start gap-4">
              <div class="flex w-full items-center justify-between gap-2">
                <span
                  class="inline-flex h-11 w-11 items-center justify-center rounded-xl border {style.iconClass}"
                >
                  <Icon name={style.icon} size={20} />
                </span>
                <span
                  class="bg-gradient-to-r from-purple-300 to-fuchsia-300 bg-clip-text text-3xl font-extrabold text-transparent"
                >
                  {style.step}
                </span>
              </div>
              <h3 class="text-lg font-bold text-white">{copy?.title}</h3>
              <p class="text-sm leading-relaxed text-purple-200/70">{copy?.description}</p>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <!-- Section 5: Bottom Glowing CTA Banner & Free-Tier Google Ad Slot -->
  <section id="benefits" class="bg-[#070312] py-18">
    <div class="c47-container">
      <div
        class="relative overflow-hidden rounded-3xl border border-purple-400/30 bg-gradient-to-br from-[#1B0C3D] via-[#11072A] to-[#290B4E] p-7 shadow-[0_0_70px_rgba(139,92,246,0.22)] sm:p-10"
      >
        <div
          class="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl"
          aria-hidden="true"
        ></div>
        <div class="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {$t.home.ctaTitle}
            </h2>
            <p class="mt-2 max-w-xl text-sm font-normal text-purple-200/75 sm:text-base">
              {$t.home.ctaSubtitle}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3.5">
            {#if $isAuthenticated && $currentUser}
              <a
                href={continueHref}
                class="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] px-6 py-3 text-sm font-semibold text-white no-underline shadow-[0_0_28px_rgba(139,92,246,0.5)] transition hover:brightness-110 hover:no-underline sm:text-base"
              >
                <Avatar name={$currentUser.name} src={$currentUser.avatarUrl} size="sm" />
                <span>{$currentUser.name} — Continue</span>
                <Icon name="arrow-right" size={18} />
              </a>
            {:else}
              <a
                href="/signup"
                class="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] px-7 py-3 text-sm font-semibold text-white no-underline shadow-[0_0_28px_rgba(139,92,246,0.55)] transition hover:brightness-110 hover:no-underline sm:text-base"
              >
                <Icon name="user-plus" size={17} />
                <span>{$t.home.ctaSignUp}</span>
              </a>
              <a
                href="/login"
                class="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-purple-100 no-underline transition hover:border-purple-300/60 hover:bg-white/10 hover:text-white hover:no-underline sm:text-base"
              >
                <Icon name="log-in" size={17} />
                <span>{$t.home.ctaSignIn}</span>
              </a>
            {/if}
          </div>
        </div>
      </div>

      <!-- Google Ads Banner (Shown on Free Membership & Guests; Hidden for Premium Members) -->
      <div class="mt-8">
        <GoogleAdSlot slot="home-bottom-banner" variant="banner" />
      </div>
    </div>
  </section>
</main>

<Footer variant="dark" />
