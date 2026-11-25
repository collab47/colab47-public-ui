<script lang="ts">
  import { onMount } from 'svelte';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import { currentUser, isAuthenticated, t } from '$lib/stores';
  import {
    Avatar,
    Badge,
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
      color: 'blue',
      titleClass: 'text-blue-900',
      textClass: 'text-blue-700',
      iconClass: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'taxonomy',
      icon: 'cpu',
      color: 'violet',
      titleClass: 'text-violet-900',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'proof',
      icon: 'shield-check',
      color: 'emerald',
      titleClass: 'text-emerald-900',
      textClass: 'text-emerald-700',
      iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'industry',
      icon: 'rocket',
      color: 'amber',
      titleClass: 'text-amber-900',
      textClass: 'text-amber-700',
      iconClass: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'mentors',
      icon: 'award',
      color: 'rose',
      titleClass: 'text-rose-900',
      textClass: 'text-rose-700',
      iconClass: 'bg-rose-100 text-rose-700',
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
      color: 'blue',
      titleClass: 'text-blue-900',
      textClass: 'text-blue-700',
      iconClass: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'industry_startups',
      icon: 'rocket',
      color: 'emerald',
      titleClass: 'text-emerald-900',
      textClass: 'text-emerald-700',
      iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'researchers_faculty',
      icon: 'flask',
      color: 'violet',
      titleClass: 'text-violet-900',
      textClass: 'text-violet-700',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      id: 'government_institutions',
      icon: 'landmark',
      color: 'amber',
      titleClass: 'text-amber-900',
      textClass: 'text-amber-700',
      iconClass: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'professionals_mentors',
      icon: 'award',
      color: 'rose',
      titleClass: 'text-rose-900',
      textClass: 'text-rose-700',
      iconClass: 'bg-rose-100 text-rose-700',
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
      color: 'cyan',
      titleClass: 'text-cyan-900',
      textClass: 'text-cyan-700',
      iconClass: 'bg-cyan-100 text-cyan-700',
    },
    {
      step: '02',
      icon: 'cpu',
      color: 'indigo',
      titleClass: 'text-indigo-900',
      textClass: 'text-indigo-700',
      iconClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      step: '03',
      icon: 'shield-check',
      color: 'teal',
      titleClass: 'text-teal-900',
      textClass: 'text-teal-700',
      iconClass: 'bg-teal-100 text-teal-700',
    },
  ];

  const heroParticles = [
    { left: '8%', top: '24%', size: 5, delay: '0s', duration: '9s', color: '#fb923c' },
    { left: '18%', top: '72%', size: 4, delay: '-2.2s', duration: '11s', color: '#34d399' },
    { left: '30%', top: '18%', size: 3, delay: '-4.5s', duration: '10s', color: '#ffffff' },
    { left: '42%', top: '82%', size: 4, delay: '-1.2s', duration: '12s', color: '#f59e0b' },
    { left: '58%', top: '16%', size: 4, delay: '-5.8s', duration: '9.5s', color: '#34d399' },
    { left: '70%', top: '76%', size: 5, delay: '-3.1s', duration: '11.5s', color: '#fb923c' },
    { left: '84%', top: '28%', size: 4, delay: '-6.4s', duration: '10.5s', color: '#ffffff' },
    { left: '92%', top: '66%', size: 5, delay: '-2.7s', duration: '12.5s', color: '#34d399' },
  ] as const;
</script>

<svelte:head>
  <title>Collab47: {$t.home.heroTitlePrimary} {$t.home.heroTitleSecondary}</title>
</svelte:head>

<main>
  <!-- Section 1: Rich Jewel-Toned Dark Animated Hero Section (Royal Navy · Indigo · Deep Emerald, No Black) -->
  <section
    class="hero-dark relative overflow-hidden border-b border-white/15 py-20 text-white sm:py-26"
  >
    <!-- Layer 1: Animated Saffron & Emerald Ambient Glow Orbs (GPU transform + opacity only) -->
    <div class="hero-glow hero-glow-saffron pointer-events-none" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-green pointer-events-none" aria-hidden="true"></div>
    <div class="hero-glow hero-glow-center pointer-events-none" aria-hidden="true"></div>

    <!-- Layer 2: Precision Counter-Rotating Orbital Rings -->
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <svg class="hero-orbit hero-orbit-outer h-[680px] w-[680px] opacity-30" viewBox="0 0 680 680" fill="none">
        <circle cx="340" cy="340" r="320" stroke="url(#heroOrbitSaffron)" stroke-width="1" stroke-dasharray="6 12" />
        <circle cx="340" cy="20" r="5" fill="#fb923c" />
        <circle cx="635" cy="462" r="4" fill="#34d399" />
        <defs>
          <linearGradient id="heroOrbitSaffron" x1="0" y1="0" x2="680" y2="680" gradientUnits="userSpaceOnUse">
            <stop stop-color="#D45F00" stop-opacity="0.9" />
            <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.25" />
            <stop offset="1" stop-color="#086030" stop-opacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      <svg class="hero-orbit hero-orbit-inner absolute h-[480px] w-[480px] opacity-25" viewBox="0 0 480 480" fill="none">
        <circle cx="240" cy="240" r="224" stroke="url(#heroOrbitGreen)" stroke-width="1" />
        <circle cx="240" cy="16" r="4" fill="#34d399" />
        <circle cx="48" cy="356" r="3.5" fill="#fbbf24" />
        <defs>
          <linearGradient id="heroOrbitGreen" x1="480" y1="0" x2="0" y2="480" gradientUnits="userSpaceOnUse">
            <stop stop-color="#10b981" stop-opacity="0.9" />
            <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.15" />
            <stop offset="1" stop-color="#f97316" stop-opacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Layer 3: Subtle Precision Grid & Floating Micro-Particles -->
    <div
      class="pointer-events-none absolute inset-0 opacity-20"
      style="background-image: radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px); background-size: 28px 28px;"
      aria-hidden="true"
    ></div>

    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {#each heroParticles as p, idx (idx)}
        <span
          class="hero-particle"
          style="left: {p.left}; top: {p.top}; width: {p.size}px; height: {p.size}px; background-color: {p.color}; animation-delay: {p.delay}; animation-duration: {p.duration};"
        ></span>
      {/each}
    </div>

    <!-- Foreground Content with Crisp White Border Styling & Staggered GPU Entrance -->
    <div class="c47-container relative z-10 flex max-w-4xl flex-col items-center gap-6 text-center">
      <div class="hero-enter hero-delay-1">
        <span
          class="hero-shimmer relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/45 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur-md"
        >
          <Icon name="sparkles" size={14} class="text-amber-300" />
          <span>{$t.home.heroBadge}</span>
        </span>
      </div>

      <h1
        class="hero-enter hero-delay-2 hero-title-outline text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
      >
        <span class="text-[#FF7A1A]">{$t.home.heroTitlePrimary}</span>
        <span class="text-[#10B981]"> {$t.home.heroTitleSecondary}</span>
      </h1>

      <div
        class="hero-enter hero-delay-3 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-white/30 bg-white/6 px-6 py-5 backdrop-blur-md"
      >
        <p class="hero-subtitle-outline text-lg font-bold text-white sm:text-xl">
          {$t.home.heroSubtitle}
        </p>

        <p class="text-sm leading-relaxed text-slate-200 sm:text-base">
          {$t.home.heroDescription}
        </p>
      </div>

      {#if $isAuthenticated && $currentUser}
        <div class="hero-enter hero-delay-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={continueHref}
            class="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/35 bg-logo-saffron px-6 py-2.5 text-base font-extrabold text-white no-underline shadow-xl transition hover:scale-[1.02] hover:bg-logo-saffron-hover hover:no-underline"
          >
            <Avatar name={$currentUser.name} src={$currentUser.avatarUrl} size="sm" />
            <span>{$currentUser.name} — Continue</span>
            <Icon name="arrow-right" size={18} />
          </a>
        </div>
      {:else}
        <div class="hero-enter hero-delay-4 flex flex-col items-center gap-3.5">
          <p class="max-w-xl text-sm font-semibold text-amber-100/95 sm:text-base">
            Ready to showcase your builds and collaborate across India's R&amp;D ecosystem?
            Create your free Collab47 account in under a minute.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/signup"
              class="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-white/40 bg-logo-saffron px-7 py-2.5 text-base font-extrabold text-white no-underline shadow-xl transition hover:scale-[1.02] hover:bg-logo-saffron-hover hover:no-underline"
            >
              <Icon name="user-plus" size={18} />
              <span>{$t.nav.signUp} — It's Free</span>
              <Icon name="arrow-right" size={18} />
            </a>
            <a
              href="/login"
              class="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white no-underline backdrop-blur-md transition hover:border-white/50 hover:bg-white/18 hover:no-underline"
            >
              <Icon name="log-in" size={16} />
              <span>{$t.auth.signInLink}</span>
            </a>
          </div>
        </div>
      {/if}

      <p
        id="dpdp"
        class="hero-enter hero-delay-4 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-medium text-slate-300"
      >
        {$t.home.dpdpNote}
      </p>
    </div>
  </section>

  <!-- Section 2: Dedicated Arrow-Scrolled Platform Highlights Section (Directly Below Hero) -->
  <section id="highlights" class="border-b border-slate-200 bg-slate-50/75 py-14">
    <div class="c47-container">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div class="flex max-w-2xl flex-col items-start gap-2">
          <Badge tone="moss">{$t.home.highlightsBadge}</Badge>
          <h2 class="text-2xl font-extrabold tracking-tight text-logo-saffron sm:text-3xl">
            {$t.home.highlightsTitle}
          </h2>
          <p class="text-sm font-medium text-logo-green sm:text-base">
            {$t.home.highlightsSubtitle}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-full border border-logo-saffron-border bg-logo-saffron-soft text-logo-saffron transition hover:border-logo-saffron hover:bg-logo-saffron hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            onclick={() => scrollHighlights('prev')}
            disabled={!canScrollPrev}
            aria-label="Previous highlight"
          >
            <Icon name="arrow-left" size={16} />
          </button>
          <button
            type="button"
            class="inline-flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-full border border-logo-green-border bg-logo-green-soft text-logo-green transition hover:border-logo-green hover:bg-logo-green hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
        <Badge tone="saffron">{$t.home.whoBadge}</Badge>
        <h2 class="text-2xl font-extrabold tracking-tight text-logo-saffron sm:text-3xl">
          {$t.home.whoTitle}
        </h2>
        <p class="text-base font-medium text-logo-green">
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
  <section id="how-it-works" class="border-y border-slate-200 bg-slate-50 py-16">
    <div class="c47-container">
      <div class="mb-8 flex max-w-2xl flex-col items-start gap-2.5">
        <Badge tone="moss">{$t.home.howBadge}</Badge>
        <h2 class="text-2xl font-extrabold tracking-tight text-logo-saffron sm:text-3xl">
          {$t.home.howTitle}
        </h2>
        <p class="text-base font-medium text-logo-green">
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
      <Card padding="lg" elevated class="border-logo-saffron-border">
        <div class="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-logo-saffron">
              {$t.home.ctaTitle}
            </h2>
            <p class="mt-1.5 max-w-xl text-sm font-medium text-logo-green sm:text-base">
              {$t.home.ctaSubtitle}
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            {#if $isAuthenticated && $currentUser}
              <Button variant="primary" size="lg" href={continueHref}>
                <Avatar name={$currentUser.name} src={$currentUser.avatarUrl} size="sm" />
                <span>{$currentUser.name} — Continue</span>
                <Icon name="arrow-right" size={18} />
              </Button>
            {:else}
              <Button variant="primary" size="lg" href="/signup">
                <Icon name="user-plus" size={18} />
                <span>{$t.home.ctaSignUp}</span>
              </Button>
              <Button variant="outline" size="lg" href="/login">
                <Icon name="log-in" size={18} />
                <span>{$t.home.ctaSignIn}</span>
              </Button>
            {/if}
          </div>
        </div>
      </Card>

      <!-- Google Ads Banner (Shown on Free Membership & Guests; Hidden for Premium Members) -->
      <div class="mt-8">
        <GoogleAdSlot slot="home-bottom-banner" variant="banner" />
      </div>
    </div>
  </section>
</main>

<Footer />

<style>
  .hero-dark {
    contain: layout paint;
    background: linear-gradient(135deg, #0a2558 0%, #1e2266 48%, #064e3b 100%);
  }

  /* Crisp white border outline on hero headline letters */
  .hero-title-outline {
    paint-order: stroke fill;
    -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.94);
    text-shadow:
      0 0 1px rgba(255, 255, 255, 0.85),
      0 8px 28px rgba(10, 37, 88, 0.55);
  }

  .hero-subtitle-outline {
    text-shadow: 0 1px 12px rgba(255, 255, 255, 0.2);
  }

  /* Pre-rendered radial glow orbs (GPU transform + opacity only, zero jank) */
  .hero-glow {
    position: absolute;
    border-radius: 9999px;
    will-change: transform, opacity;
  }

  .hero-glow-saffron {
    top: -120px;
    left: -90px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.38) 0%, rgba(249, 115, 22, 0) 68%);
    animation: heroGlowA 14s ease-in-out infinite alternate;
  }

  .hero-glow-green {
    right: -100px;
    bottom: -140px;
    width: 540px;
    height: 540px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.36) 0%, rgba(16, 185, 129, 0) 68%);
    animation: heroGlowB 16s ease-in-out infinite alternate;
  }

  .hero-glow-center {
    top: 50%;
    left: 50%;
    width: 620px;
    height: 380px;
    margin-top: -190px;
    margin-left: -310px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%);
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

  /* Counter-rotating orbital rings */
  .hero-orbit {
    will-change: transform;
  }

  .hero-orbit-outer {
    animation: heroSpinCW 40s linear infinite;
  }

  .hero-orbit-inner {
    animation: heroSpinCCW 28s linear infinite;
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
      transform: translate3d(0, 20px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-glow,
    .hero-orbit,
    .hero-particle,
    .hero-shimmer::after,
    .hero-enter {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
</style>
