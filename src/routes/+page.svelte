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

  interface HeroSlide {
    id: string;
    image: string;
    imagePosition: string;
    overlayTint: string;
    pill: string;
    title: string;
    caption: string;
    stats: ReadonlyArray<{ value: string; label: string; tone: string }>;
  }

  const heroSlides: readonly HeroSlide[] = [
    {
      id: 'viksit-bharat',
      image: '/images/auth-hero.jpg',
      imagePosition: 'object-center',
      overlayTint: 'from-[#1a1744]/82 via-[#37298a]/70 to-[#581c87]/82',
      pill: 'Talent × Ideas × Opportunities × Impact',
      title: 'Your Innovation. Your Identity.',
      caption:
        'Connecting students, researchers, scientists, faculty, industry, startups & government to build verified proof of work.',
      stats: [
        { value: '25', label: 'Domains', tone: 'text-[#F0ABFC]' },
        { value: '86', label: 'STEM Fields', tone: 'text-[#A5B4FC]' },
        { value: '100%', label: 'Proof of Work', tone: 'text-white' },
      ],
    },
    {
      id: 'living-workbench',
      image: '/images/auth-hero.jpg',
      imagePosition: 'object-left-top',
      overlayTint: 'from-[#1e1b4b]/84 via-[#4c1d95]/72 to-[#86198f]/78',
      pill: '5-Step Living Workbench',
      title: 'Build • Share • Collaborate',
      caption:
        'Document Idea, Architecture, Prototype, Testing & Final Demo with faculty PI attestation and rich media.',
      stats: [
        { value: '5 Steps', label: 'Verified Flow', tone: 'text-[#F0ABFC]' },
        { value: 'PI Sign', label: 'Attestation', tone: 'text-[#C4B5FD]' },
        { value: 'Live', label: 'Project Wall', tone: 'text-white' },
      ],
    },
    {
      id: 'public-roles',
      image: '/images/auth-hero.jpg',
      imagePosition: 'object-right-bottom',
      overlayTint: 'from-[#1a1744]/84 via-[#5b21b6]/70 to-[#701a75]/82',
      pill: '8 Public Ecosystem Roles',
      title: 'One Network for India’s Builders',
      caption:
        'Dedicated workspaces for Students, Researchers, Scientists, Faculty, Industry, Startups, Government & Ecosystem Contributors.',
      stats: [
        { value: '8', label: 'Public Roles', tone: 'text-[#F0ABFC]' },
        { value: '100%', label: 'DPDP Ready', tone: 'text-[#A5B4FC]' },
        { value: 'Free', label: 'To Start', tone: 'text-white' },
      ],
    },
  ];

  let activeSlide = $state(0);
  let carouselPaused = $state(false);
  let highlightsScrollEl = $state<HTMLDivElement | null>(null);
  let canScrollPrev = $state(false);
  let canScrollNext = $state(true);

  function goToSlide(index: number): void {
    activeSlide = (index + heroSlides.length) % heroSlides.length;
  }

  function nextSlide(): void {
    goToSlide(activeSlide + 1);
  }

  function prevSlide(): void {
    goToSlide(activeSlide - 1);
  }

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

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = prefersReduced
      ? null
      : window.setInterval(() => {
          if (!carouselPaused) {
            activeSlide = (activeSlide + 1) % heroSlides.length;
          }
        }, 5500);

    return () => {
      window.removeEventListener('resize', syncScrollState);
      if (timer !== null) window.clearInterval(timer);
    };
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
      color: 'indigo',
      titleClass: 'text-indigo-950',
      textClass: 'text-indigo-700',
      iconClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'taxonomy',
      icon: 'cpu',
      color: 'violet',
      titleClass: 'text-violet-950',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'proof',
      icon: 'shield-check',
      color: 'rose',
      titleClass: 'text-fuchsia-950',
      textClass: 'text-fuchsia-700',
      iconClass: 'bg-fuchsia-100 text-fuchsia-700',
    },
    {
      id: 'industry',
      icon: 'rocket',
      color: 'blue',
      titleClass: 'text-indigo-950',
      textClass: 'text-indigo-700',
      iconClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'mentors',
      icon: 'award',
      color: 'violet',
      titleClass: 'text-purple-950',
      textClass: 'text-purple-700',
      iconClass: 'bg-purple-100 text-purple-700',
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
      color: 'indigo',
      titleClass: 'text-indigo-950',
      textClass: 'text-indigo-700',
      iconClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'industry_startups',
      icon: 'rocket',
      color: 'violet',
      titleClass: 'text-violet-950',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'researchers_faculty',
      icon: 'flask',
      color: 'rose',
      titleClass: 'text-fuchsia-950',
      textClass: 'text-fuchsia-700',
      iconClass: 'bg-fuchsia-100 text-fuchsia-700',
    },
    {
      id: 'government_institutions',
      icon: 'landmark',
      color: 'blue',
      titleClass: 'text-indigo-950',
      textClass: 'text-indigo-700',
      iconClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'professionals_mentors',
      icon: 'award',
      color: 'violet',
      titleClass: 'text-purple-950',
      textClass: 'text-purple-700',
      iconClass: 'bg-purple-100 text-purple-700',
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
      color: 'indigo',
      titleClass: 'text-indigo-950',
      textClass: 'text-indigo-700',
      iconClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      step: '02',
      icon: 'cpu',
      color: 'violet',
      titleClass: 'text-violet-950',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      step: '03',
      icon: 'shield-check',
      color: 'rose',
      titleClass: 'text-fuchsia-950',
      textClass: 'text-fuchsia-700',
      iconClass: 'bg-fuchsia-100 text-fuchsia-700',
    },
  ];

  const heroParticles = [
    { left: '6%', top: '22%', size: 5, delay: '0s', duration: '9s', color: '#E879F9' },
    { left: '16%', top: '76%', size: 4, delay: '-2.2s', duration: '11s', color: '#818CF8' },
    { left: '28%', top: '16%', size: 3, delay: '-4.5s', duration: '10s', color: '#ffffff' },
    { left: '44%', top: '84%', size: 4, delay: '-1.2s', duration: '12s', color: '#C084FC' },
    { left: '56%', top: '14%', size: 4, delay: '-5.8s', duration: '9.5s', color: '#F0ABFC' },
    { left: '72%', top: '80%', size: 5, delay: '-3.1s', duration: '11.5s', color: '#A5B4FC' },
    { left: '86%', top: '24%', size: 4, delay: '-6.4s', duration: '10.5s', color: '#ffffff' },
    { left: '94%', top: '68%', size: 5, delay: '-2.7s', duration: '12.5s', color: '#E879F9' },
  ] as const;
</script>

<svelte:head>
  <title>Collab47: {$t.home.heroTitlePrimary} {$t.home.heroTitleSecondary}</title>
</svelte:head>

<main class="w-full">
  <!-- Section 1: True Full-Width Edge-to-Edge Background Image Hero Carousel (Student Dashboard Magenta / Indigo Palette) -->
  <section
    class="hero-indigo relative w-full overflow-hidden border-b border-white/15 text-white"
    aria-roledescription="carousel"
    aria-label="Collab47 featured hero carousel"
    onmouseenter={() => (carouselPaused = true)}
    onmouseleave={() => (carouselPaused = false)}
  >
    <!-- Full-Width Horizontal Sliding Carousel Track -->
    <div
      class="flex w-full transition-transform duration-700 ease-out will-change-transform"
      style="transform: translate3d(-{activeSlide * 100}%, 0, 0);"
    >
      {#each heroSlides as slide, idx (slide.id)}
        {@const isActive = idx === activeSlide}
        <div
          class="relative flex min-h-[540px] w-full min-w-full shrink-0 items-center justify-center overflow-hidden px-4 py-16 sm:min-h-[600px] sm:px-12 sm:py-22"
          aria-hidden={!isActive}
        >
          <!-- Layer 0: Full-Width Ambient Backdrop + Full-Height Fitted Hero Image (Zero Vertical Cropping) -->
          <img
            src={slide.image}
            alt=""
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl select-none"
          />
          <div
            class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            <img
              src={slide.image}
              alt=""
              class="hero-carousel-img-fit h-full w-auto max-w-full object-contain object-center opacity-85 select-none"
            />
          </div>
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br {slide.overlayTint}"
            aria-hidden="true"
          ></div>

          <!-- Layer 1: Animated Indigo, Violet & Magenta Ambient Glow Orbs -->
          <div class="hero-glow hero-glow-indigo pointer-events-none" aria-hidden="true"></div>
          <div class="hero-glow hero-glow-magenta pointer-events-none" aria-hidden="true"></div>
          <div class="hero-glow hero-glow-center pointer-events-none" aria-hidden="true"></div>

          <!-- Layer 2: Precision Counter-Rotating Orbital Rings -->
          <div
            class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-30"
            aria-hidden="true"
          >
            <svg class="hero-orbit hero-orbit-outer h-[680px] w-[680px]" viewBox="0 0 680 680" fill="none">
              <circle cx="340" cy="340" r="320" stroke="url(#carouselOrbitA-{idx})" stroke-width="1" stroke-dasharray="6 12" />
              <circle cx="340" cy="20" r="5" fill="#F0ABFC" />
              <circle cx="635" cy="462" r="4" fill="#818CF8" />
              <defs>
                <linearGradient id="carouselOrbitA-{idx}" x1="0" y1="0" x2="680" y2="680" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#E879F9" stop-opacity="0.9" />
                  <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.22" />
                  <stop offset="1" stop-color="#6366F1" stop-opacity="0.9" />
                </linearGradient>
              </defs>
            </svg>
            <svg class="hero-orbit hero-orbit-inner absolute h-[480px] w-[480px]" viewBox="0 0 480 480" fill="none">
              <circle cx="240" cy="240" r="224" stroke="url(#carouselOrbitB-{idx})" stroke-width="1" />
              <circle cx="240" cy="16" r="4" fill="#C4B5FD" />
              <defs>
                <linearGradient id="carouselOrbitB-{idx}" x1="480" y1="0" x2="0" y2="480" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#818CF8" stop-opacity="0.85" />
                  <stop offset="1" stop-color="#C026D3" stop-opacity="0.85" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <!-- Layer 3: Subtle Dot Grid & Floating Micro-Particles -->
          <div
            class="pointer-events-none absolute inset-0 opacity-20"
            style="background-image: radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px); background-size: 28px 28px;"
            aria-hidden="true"
          ></div>

          <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {#each heroParticles as p, pIdx (pIdx)}
              <span
                class="hero-particle"
                style="left: {p.left}; top: {p.top}; width: {p.size}px; height: {p.size}px; background-color: {p.color}; animation-delay: {p.delay}; animation-duration: {p.duration};"
              ></span>
            {/each}
          </div>

          <!-- Foreground Slide Content -->
          <div class="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-center">
            <div class="flex flex-wrap items-center justify-center gap-2.5">
              <span
                class="hero-shimmer relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#E879F9]/55 bg-transparent px-4 py-1.5 text-xs font-bold tracking-wide text-white"
              >
                <span class="relative flex h-2 w-2" aria-hidden="true">
                  <span class="hero-ping absolute inline-flex h-full w-full rounded-full bg-[#F0ABFC]"></span>
                  <span class="relative inline-flex h-2 w-2 rounded-full bg-[#E879F9]"></span>
                </span>
                <span>{$t.home.heroBadge}</span>
              </span>
              <span
                class="inline-flex items-center gap-1.5 rounded-full border border-[#F0ABFC]/45 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-[#FAE8FF]"
              >
                <Icon name="sparkles" size={13} />
                <span>{slide.pill}</span>
              </span>
            </div>

            {#if idx === 0}
              <h1
                class="text-4xl leading-tight font-extrabold tracking-tight text-white drop-shadow-[0_6px_24px_rgba(10,7,38,0.55)] sm:text-5xl lg:text-6xl"
              >
                <span>{$t.home.heroTitlePrimary}</span>
                <span
                  class="block bg-gradient-to-r from-[#F0ABFC] via-[#C4B5FD] to-[#818CF8] bg-clip-text text-transparent sm:inline"
                >
                  {' '}{$t.home.heroTitleSecondary}
                </span>
              </h1>
            {:else}
              <h2
                class="text-4xl leading-tight font-extrabold tracking-tight text-white drop-shadow-[0_6px_24px_rgba(10,7,38,0.55)] sm:text-5xl lg:text-6xl"
              >
                <span class="bg-gradient-to-r from-white via-[#F5D0FE] to-[#C4B5FD] bg-clip-text text-transparent">
                  {slide.title}
                </span>
              </h2>
            {/if}

            <div
              class="flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border border-white/25 bg-transparent px-6 py-5 drop-shadow-[0_2px_12px_rgba(10,7,38,0.6)]"
            >
              <p class="text-lg font-bold text-white sm:text-xl">
                {idx === 0 ? $t.home.heroSubtitle : slide.pill}
              </p>
              <p class="text-sm leading-relaxed text-indigo-100/95 sm:text-base">
                {idx === 0 ? $t.home.heroDescription : slide.caption}
              </p>

              <!-- Dynamic Slide Metrics Bar -->
              <div class="mt-1 grid w-full max-w-md grid-cols-3 gap-3 border-t border-white/20 bg-transparent pt-3.5">
                {#each slide.stats as stat, sIdx (stat.label)}
                  <div class={sIdx > 0 ? 'border-l border-white/20 pl-3' : ''}>
                    <strong class="block text-lg font-extrabold tabular-nums sm:text-xl {stat.tone}">
                      {stat.value}
                    </strong>
                    <span class="text-[11px] font-medium text-indigo-100/90">{stat.label}</span>
                  </div>
                {/each}
              </div>
            </div>

            {#if $isAuthenticated && $currentUser}
              <div class="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={continueHref}
                  tabindex={isActive ? 0 : -1}
                  class="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/30 bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#C026D3] px-6 py-2.5 text-base font-extrabold text-white no-underline shadow-[0_10px_28px_rgba(124,58,237,0.45)] transition hover:scale-[1.02] hover:brightness-110 hover:no-underline"
                >
                  <Avatar name={$currentUser.name} src={$currentUser.avatarUrl} size="sm" />
                  <span>{$currentUser.name} — Continue</span>
                  <Icon name="arrow-right" size={18} />
                </a>
              </div>
            {:else}
              <div class="flex flex-col items-center gap-3.5">
                <p class="max-w-xl text-sm font-semibold text-[#F5D0FE] sm:text-base">
                  Ready to showcase your builds and collaborate across India's R&amp;D ecosystem?
                  Create your free Collab47 account in under a minute.
                </p>
                <div class="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="/signup"
                    tabindex={isActive ? 0 : -1}
                    class="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-white/35 bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#C026D3] px-7 py-2.5 text-base font-extrabold text-white no-underline shadow-[0_10px_28px_rgba(192,38,211,0.45)] transition hover:scale-[1.02] hover:brightness-110 hover:no-underline"
                  >
                    <Icon name="user-plus" size={18} />
                    <span>{$t.nav.signUp} — It's Free</span>
                    <Icon name="arrow-right" size={18} />
                  </a>
                  <a
                    href="/login"
                    tabindex={isActive ? 0 : -1}
                    class="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 bg-transparent px-5 py-2.5 text-sm font-bold text-white no-underline transition hover:border-white/70 hover:bg-white/10 hover:no-underline"
                  >
                    <Icon name="log-in" size={16} />
                    <span>{$t.auth.signInLink}</span>
                  </a>
                </div>
              </div>
            {/if}

            <p
              id={idx === 0 ? 'dpdp' : undefined}
              class="rounded-full border border-white/25 bg-transparent px-4 py-1 text-xs font-medium text-indigo-100"
            >
              {$t.home.dpdpNote}
            </p>
          </div>
        </div>
      {/each}
    </div>

    <!-- Edge-to-Edge Left / Right Carousel Controls -->
    <button
      type="button"
      onclick={prevSlide}
      aria-label="Previous hero slide"
      class="absolute top-1/2 left-3 z-20 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#1a1744]/55 text-white backdrop-blur-md transition hover:border-white/55 hover:bg-[#6D4AFF] sm:left-6 sm:h-11 sm:w-11"
    >
      <Icon name="chevron-left" size={20} />
    </button>
    <button
      type="button"
      onclick={nextSlide}
      aria-label="Next hero slide"
      class="absolute top-1/2 right-3 z-20 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#1a1744]/55 text-white backdrop-blur-md transition hover:border-white/55 hover:bg-[#6D4AFF] sm:right-6 sm:h-11 sm:w-11"
    >
      <Icon name="chevron-right" size={20} />
    </button>

    <!-- Bottom Slide Indicator Dots -->
    <div class="absolute right-0 bottom-5 left-0 z-20 flex items-center justify-center gap-2.5">
      {#each heroSlides as slide, idx (slide.id)}
        <button
          type="button"
          onclick={() => goToSlide(idx)}
          aria-label="Go to slide {idx + 1}: {slide.title}"
          aria-current={idx === activeSlide ? 'true' : undefined}
          class="h-2.5 cursor-pointer rounded-full transition-all duration-300 {idx === activeSlide
            ? 'w-9 bg-gradient-to-r from-[#F0ABFC] to-[#818CF8] shadow-[0_0_12px_rgba(240,171,252,0.75)]'
            : 'w-2.5 bg-white/40 hover:bg-white/75'}"
        ></button>
      {/each}
    </div>
  </section>

  <!-- Section 2: Dedicated Arrow-Scrolled Platform Highlights Section (Student Dashboard Lavender Surface) -->
  <section id="highlights" class="border-b border-[#E8EAF6] bg-[#F5F6FB] py-14">
    <div class="c47-container">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div class="flex max-w-2xl flex-col items-start gap-2">
          <span
            class="inline-flex items-center rounded-full border border-[#DDD6FE] bg-[#F3F1FF] px-3 py-1 text-xs font-bold tracking-wide text-[#5B3DF5]"
          >
            {$t.home.highlightsBadge}
          </span>
          <h2 class="text-2xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-3xl">
            {$t.home.highlightsTitle}
          </h2>
          <p class="text-sm font-medium text-slate-600 sm:text-base">
            {$t.home.highlightsSubtitle}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-full border border-[#DDD6FE] bg-[#F3F1FF] text-[#5B3DF5] transition hover:border-[#6D4AFF] hover:bg-[#6D4AFF] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
        <h2 class="text-2xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-3xl">
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
  <section id="how-it-works" class="border-y border-[#E8EAF6] bg-[#F5F6FB] py-16">
    <div class="c47-container">
      <div class="mb-8 flex max-w-2xl flex-col items-start gap-2.5">
        <span
          class="inline-flex items-center rounded-full border border-[#DDD6FE] bg-[#F3F1FF] px-3 py-1 text-xs font-bold tracking-wide text-[#5B3DF5]"
        >
          {$t.home.howBadge}
        </span>
        <h2 class="text-2xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-3xl">
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
        class="rounded-2xl border border-[#DDD6FE] bg-gradient-to-r from-[#FAF9FF] via-white to-[#FDF4FF] p-6 shadow-[0_8px_28px_rgba(30,27,75,0.06)] sm:p-8"
      >
        <div class="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-[#1E1B4B]">
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
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#C026D3] px-6 py-3 text-base font-bold text-white no-underline shadow-md transition hover:brightness-110 hover:no-underline"
              >
                <Avatar name={$currentUser.name} src={$currentUser.avatarUrl} size="sm" />
                <span>{$currentUser.name} — Continue</span>
                <Icon name="arrow-right" size={18} />
              </a>
            {:else}
              <a
                href="/signup"
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#C026D3] px-6 py-3 text-base font-bold text-white no-underline shadow-md transition hover:brightness-110 hover:no-underline"
              >
                <Icon name="user-plus" size={18} />
                <span>{$t.home.ctaSignUp}</span>
              </a>
              <Button variant="outline" size="lg" href="/login" class="border-[#DDD6FE] text-[#5B3DF5] hover:bg-[#F3F1FF]">
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

<style>
  /* Student Dashboard Indigo -> Violet -> Magenta Hero Gradient */
  .hero-indigo {
    contain: layout paint;
    background: linear-gradient(125deg, #1a1744 0%, #37298a 46%, #6d4aff 78%, #9333ea 100%);
  }

  /* Subtle full-height image presentation with soft side edge feathering */
  .hero-carousel-img-fit {
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 14%,
      black 86%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 14%,
      black 86%,
      transparent 100%
    );
  }

  /* Pre-rendered Indigo & Magenta radial glow orbs (GPU transform + opacity only) */
  .hero-glow {
    position: absolute;
    border-radius: 9999px;
    will-change: transform, opacity;
  }

  .hero-glow-indigo {
    top: -120px;
    left: -90px;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(99, 102, 241, 0) 68%);
    animation: heroGlowA 14s ease-in-out infinite alternate;
  }

  .hero-glow-magenta {
    right: -110px;
    bottom: -140px;
    width: 560px;
    height: 560px;
    background: radial-gradient(circle, rgba(217, 70, 239, 0.42) 0%, rgba(217, 70, 239, 0) 68%);
    animation: heroGlowB 16s ease-in-out infinite alternate;
  }

  .hero-glow-center {
    top: 50%;
    left: 50%;
    width: 620px;
    height: 380px;
    margin-top: -190px;
    margin-left: -310px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.34) 0%, rgba(139, 92, 246, 0) 70%);
    animation: heroGlowPulse 10s ease-in-out infinite alternate;
  }

  @keyframes heroGlowA {
    0% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 0.72;
    }
    100% {
      transform: translate3d(56px, 36px, 0) scale(1.16);
      opacity: 1;
    }
  }

  @keyframes heroGlowB {
    0% {
      transform: translate3d(0, 0, 0) scale(1.04);
      opacity: 0.68;
    }
    100% {
      transform: translate3d(-56px, -38px, 0) scale(1.18);
      opacity: 1;
    }
  }

  @keyframes heroGlowPulse {
    0% {
      transform: scale(0.95);
      opacity: 0.55;
    }
    100% {
      transform: scale(1.12);
      opacity: 0.95;
    }
  }

  /* Counter-rotating orbital rings inside carousel */
  .hero-orbit {
    will-change: transform;
  }

  .hero-orbit-outer {
    animation: heroSpinCW 38s linear infinite;
  }

  .hero-orbit-inner {
    animation: heroSpinCCW 26s linear infinite;
  }

  @keyframes heroSpinCW {
    from {
      transform: rotate3d(0, 0, 1, 0deg);
    }
    to {
      transform: rotate3d(0, 0, 1, 360deg);
    }
  }

  @keyframes heroSpinCCW {
    from {
      transform: rotate3d(0, 0, 1, 360deg);
    }
    to {
      transform: rotate3d(0, 0, 1, 0deg);
    }
  }

  /* Live magenta pulse ring */
  .hero-ping {
    will-change: transform, opacity;
    animation: heroPing 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  @keyframes heroPing {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    75%,
    100% {
      transform: scale(2.4);
      opacity: 0;
    }
  }

  /* Floating ambient micro-particles */
  .hero-particle {
    position: absolute;
    border-radius: 9999px;
    will-change: transform, opacity;
    animation-name: heroParticleFloat;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  @keyframes heroParticleFloat {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scale(0.9);
      opacity: 0.25;
    }
    50% {
      transform: translate3d(12px, -26px, 0) scale(1.25);
      opacity: 0.85;
    }
  }

  /* Shimmer sweep on hero badge */
  .hero-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      transparent 20%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 80%
    );
    will-change: transform;
    animation: heroShimmer 5.2s ease-in-out infinite;
  }

  @keyframes heroShimmer {
    0%,
    58% {
      transform: translate3d(-120%, 0, 0);
    }
    100% {
      transform: translate3d(120%, 0, 0);
    }
  }

  /* Staggered smooth entrance */
  .hero-enter {
    opacity: 0;
    will-change: transform, opacity;
    animation: heroFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .hero-delay-1 {
    animation-delay: 0.05s;
  }

  .hero-delay-2 {
    animation-delay: 0.14s;
  }

  .hero-delay-3 {
    animation-delay: 0.24s;
  }

  .hero-delay-4 {
    animation-delay: 0.34s;
  }

  @keyframes heroFadeUp {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-glow,
    .hero-orbit,
    .hero-ping,
    .hero-particle,
    .hero-shimmer::after {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
</style>
