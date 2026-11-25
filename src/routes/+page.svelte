<script lang="ts">
  import { onMount } from 'svelte';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import { currentUser, isAuthenticated, t } from '$lib/stores';
  import {
    Avatar,
    Button,
    Card,
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

  type CardColor =
    | 'blue'
    | 'emerald'
    | 'violet'
    | 'amber'
    | 'rose'
    | 'cyan'
    | 'indigo'
    | 'teal';

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
      left: direction === 'next' ? 316 : -316,
      behavior: 'smooth',
    });
  }

  onMount(() => {
    syncScrollState();
    window.addEventListener('resize', syncScrollState);
    return () => window.removeEventListener('resize', syncScrollState);
  });

  const highlightStyles: ReadonlyArray<{
    id: string;
    icon: IconName;
    color: CardColor;
    titleClass: string;
    textClass: string;
    iconClass: string;
  }> = [
    {
      id: 'workbench',
      icon: 'layers',
      color: 'violet',
      titleClass: 'text-violet-950',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'taxonomy',
      icon: 'cpu',
      color: 'rose',
      titleClass: 'text-fuchsia-950',
      textClass: 'text-fuchsia-700',
      iconClass: 'bg-fuchsia-100 text-fuchsia-700',
    },
    {
      id: 'proof',
      icon: 'shield-check',
      color: 'violet',
      titleClass: 'text-purple-950',
      textClass: 'text-purple-700',
      iconClass: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'industry',
      icon: 'rocket',
      color: 'rose',
      titleClass: 'text-fuchsia-950',
      textClass: 'text-fuchsia-700',
      iconClass: 'bg-fuchsia-100 text-fuchsia-700',
    },
    {
      id: 'mentors',
      icon: 'award',
      color: 'violet',
      titleClass: 'text-violet-950',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
  ];

  const audienceStyles: ReadonlyArray<{
    id: string;
    icon: IconName;
    color: CardColor;
    titleClass: string;
    textClass: string;
    iconClass: string;
  }> = [
    {
      id: 'students',
      icon: 'graduation-cap',
      color: 'violet',
      titleClass: 'text-violet-950',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'industry_startups',
      icon: 'rocket',
      color: 'rose',
      titleClass: 'text-fuchsia-950',
      textClass: 'text-fuchsia-700',
      iconClass: 'bg-fuchsia-100 text-fuchsia-700',
    },
    {
      id: 'researchers_faculty',
      icon: 'flask',
      color: 'violet',
      titleClass: 'text-purple-950',
      textClass: 'text-purple-700',
      iconClass: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'government_institutions',
      icon: 'landmark',
      color: 'rose',
      titleClass: 'text-fuchsia-950',
      textClass: 'text-fuchsia-700',
      iconClass: 'bg-fuchsia-100 text-fuchsia-700',
    },
    {
      id: 'professionals_mentors',
      icon: 'award',
      color: 'violet',
      titleClass: 'text-violet-950',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
  ];

  const pillarStyles: ReadonlyArray<{
    step: string;
    icon: IconName;
    color: CardColor;
    titleClass: string;
    textClass: string;
    iconClass: string;
  }> = [
    {
      step: '01',
      icon: 'layers',
      color: 'violet',
      titleClass: 'text-violet-950',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      step: '02',
      icon: 'cpu',
      color: 'rose',
      titleClass: 'text-fuchsia-950',
      textClass: 'text-fuchsia-700',
      iconClass: 'bg-fuchsia-100 text-fuchsia-700',
    },
    {
      step: '03',
      icon: 'shield-check',
      color: 'violet',
      titleClass: 'text-purple-950',
      textClass: 'text-purple-700',
      iconClass: 'bg-purple-100 text-purple-700',
    },
  ];
</script>

<svelte:head>
  <title>Collab47: {$t.home.heroTitlePrimary} {$t.home.heroTitleSecondary}</title>
  <link rel="preload" as="image" type="image/webp" href="/images/carasoul-bg.webp" fetchpriority="high" />
</svelte:head>

<main class="w-full">
  <!-- Section 1: Hero Section Itself IS a Full-Width Centered svelte-carousel with carasoul-bg.webp -->
  <HeroCarousel
    slides={heroSlides}
    autoplayDuration={5500}
    isAuthenticated={$isAuthenticated}
    userName={$currentUser?.name ?? ''}
    userAvatarUrl={$currentUser?.avatarUrl}
    {continueHref}
    signUpLabel={$t.nav.signUp}
    signInLabel={$t.auth.signInLink}
    dpdpNote={$t.home.dpdpNote}
  />

  <!-- Section 2: Dedicated Arrow-Scrolled Platform Highlights Section (Magenta / Violet Soft Surface) -->
  <section id="highlights" class="border-b border-[#E9D5FF] bg-[#FAF5FF] py-14">
    <div class="c47-container">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div class="flex max-w-2xl flex-col items-start gap-2">
          <span
            class="inline-flex items-center rounded-full border border-[#E9D5FF] bg-[#F3E8FF] px-3 py-1 text-xs font-bold tracking-wide text-[#7C3AED]"
          >
            {$t.home.highlightsBadge}
          </span>
          <h2 class="text-2xl font-extrabold tracking-tight text-[#2E1065] sm:text-3xl">
            {$t.home.highlightsTitle}
          </h2>
          <p class="text-sm font-medium text-slate-600 sm:text-base">
            {$t.home.highlightsSubtitle}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-full border border-[#DDD6FE] bg-[#F3E8FF] text-[#7C3AED] transition hover:border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            onclick={() => scrollHighlights('prev')}
            disabled={!canScrollPrev}
            aria-label="Previous highlight"
          >
            <Icon name="arrow-left" size={16} />
          </button>
          <button
            type="button"
            class="inline-flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-full border border-[#F5D0FE] bg-[#FDF4FF] text-[#A21CAF] transition hover:border-[#C026D3] hover:bg-[#C026D3] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
        {#each highlightStyles as style, idx (style.id)}
          {@const copy = $t.home.highlights[idx]}
          <div class="w-[300px] shrink-0 snap-start">
            <Card color={style.color} padding="md">
              <div class="flex flex-col items-start gap-3">
                <div class="flex w-full items-center justify-between gap-2">
                  <span
                    class="inline-flex h-10.5 w-10.5 items-center justify-center rounded-xl {style.iconClass}"
                  >
                    <Icon name={style.icon} size={20} />
                  </span>
                  <span class="text-xs font-bold tracking-wide uppercase {style.textClass}">
                    {copy?.tag}
                  </span>
                </div>
                <h3 class="text-base font-bold {style.titleClass}">{copy?.title}</h3>
                <p class="text-sm leading-relaxed {style.textClass}">{copy?.subtitle}</p>
              </div>
            </Card>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Section 3: Audience Section ("Who Is It For?") -->
  <section id="who" class="bg-white py-16">
    <div class="c47-container">
      <div class="mb-8 flex max-w-2xl flex-col items-start gap-2.5">
        <span
          class="inline-flex items-center rounded-full border border-[#F5D0FE] bg-[#FDF4FF] px-3 py-1 text-xs font-bold tracking-wide text-[#A21CAF]"
        >
          {$t.home.whoBadge}
        </span>
        <h2 class="text-2xl font-extrabold tracking-tight text-[#2E1065] sm:text-3xl">
          {$t.home.whoTitle}
        </h2>
        <p class="text-base font-medium text-slate-600">
          {$t.home.whoSubtitle}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {#each audienceStyles as style, idx (style.id)}
          {@const copy = $t.home.audiences[idx]}
          <Card color={style.color} padding="md">
            <div class="flex flex-col items-start gap-3">
              <div class="flex w-full items-center justify-between gap-2">
                <span
                  class="inline-flex h-10.5 w-10.5 items-center justify-center rounded-xl {style.iconClass}"
                >
                  <Icon name={style.icon} size={20} />
                </span>
                <span class="text-xs font-bold tracking-wide uppercase {style.textClass}">
                  {copy?.badge}
                </span>
              </div>
              <h3 class="text-base font-bold {style.titleClass}">{copy?.title}</h3>
              <p class="text-sm leading-relaxed {style.textClass}">{copy?.description}</p>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Section 4: How It Works Section -->
  <section id="how-it-works" class="border-y border-[#E9D5FF] bg-[#FAF5FF] py-16">
    <div class="c47-container">
      <div class="mb-8 flex max-w-2xl flex-col items-start gap-2.5">
        <span
          class="inline-flex items-center rounded-full border border-[#E9D5FF] bg-[#F3E8FF] px-3 py-1 text-xs font-bold tracking-wide text-[#7C3AED]"
        >
          {$t.home.howBadge}
        </span>
        <h2 class="text-2xl font-extrabold tracking-tight text-[#2E1065] sm:text-3xl">
          {$t.home.howTitle}
        </h2>
        <p class="text-base font-medium text-slate-600">
          {$t.home.howSubtitle}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
        {#each pillarStyles as style, idx (style.step)}
          {@const copy = $t.home.pillars[idx]}
          <Card color={style.color} padding="md">
            <div class="flex flex-col items-start gap-3">
              <div class="flex w-full items-center justify-between gap-2">
                <span
                  class="inline-flex h-10.5 w-10.5 items-center justify-center rounded-xl {style.iconClass}"
                >
                  <Icon name={style.icon} size={20} />
                </span>
                <span class="text-2xl font-extrabold {style.titleClass}">{style.step}</span>
              </div>
              <h3 class="text-lg font-bold {style.titleClass}">{copy?.title}</h3>
              <p class="text-sm leading-relaxed {style.textClass}">{copy?.description}</p>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Section 5: Bottom CTA Banner & Free-Tier Google Ad Slot -->
  <section id="benefits" class="bg-white py-16">
    <div class="c47-container">
      <div
        class="rounded-2xl border border-[#E9D5FF] bg-gradient-to-r from-[#FAF5FF] via-white to-[#FDF4FF] p-6 shadow-[0_8px_28px_rgba(88,28,135,0.08)] sm:p-8"
      >
        <div class="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-[#2E1065]">
              {$t.home.ctaTitle}
            </h2>
            <p class="mt-1.5 max-w-xl text-sm font-medium text-slate-600 sm:text-base">
              {$t.home.ctaSubtitle}
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            {#if $isAuthenticated && $currentUser}
              <a
                href={continueHref}
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#9333EA] px-6 py-3 text-base font-bold text-white no-underline shadow-md transition hover:brightness-110 hover:no-underline"
              >
                <Avatar name={$currentUser.name} src={$currentUser.avatarUrl} size="sm" />
                <span>{$currentUser.name} — Continue</span>
                <Icon name="arrow-right" size={18} />
              </a>
            {:else}
              <a
                href="/signup"
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#9333EA] px-6 py-3 text-base font-bold text-white no-underline shadow-md transition hover:brightness-110 hover:no-underline"
              >
                <Icon name="user-plus" size={18} />
                <span>{$t.home.ctaSignUp}</span>
              </a>
              <Button variant="outline" size="lg" href="/login" class="border-[#E9D5FF] text-[#7C3AED] hover:bg-[#FAF5FF] hover:text-[#A21CAF]">
                <Icon name="log-in" size={18} />
                <span>{$t.home.ctaSignIn}</span>
              </Button>
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

<Footer />
