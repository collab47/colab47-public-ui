<script lang="ts" module>
  export interface HeroSlideStat {
    value: string;
    label: string;
  }

  export interface HeroCarouselSlide {
    id: string;
    badge: string;
    titlePrimary: string;
    titleSecondary: string;
    subtitle: string;
    description: string;
    stats: readonly [HeroSlideStat, HeroSlideStat, HeroSlideStat];
    ctaPrompt: string;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { t } from '$lib/stores';
  import Avatar from './Avatar.svelte';
  import Icon, { type IconName } from './Icon.svelte';

  export let slides: readonly HeroCarouselSlide[] = [];
  export let autoplayDuration = 6000;
  export let isAuthenticated = false;
  export let userName = '';
  export let userAvatarUrl: string | null | undefined = undefined;
  export let continueHref = '/dashboard';
  export let signUpLabel = 'Sign Up';
  export let signInLabel = 'Sign In';
  export let dpdpNote = '';

  const ecosystemStrip: ReadonlyArray<{ roleCode: string; label: string; icon: IconName }> = [
    { roleCode: 'student', label: 'Student', icon: 'graduation-cap' },
    { roleCode: 'researcher', label: 'Researcher', icon: 'flask' },
    { roleCode: 'scientist', label: 'Scientist', icon: 'cpu' },
    { roleCode: 'faculty', label: 'Faculty', icon: 'landmark' },
    { roleCode: 'industry', label: 'Industry', icon: 'briefcase' },
    { roleCode: 'startup', label: 'Startup', icon: 'rocket' },
    { roleCode: 'government', label: 'Government', icon: 'building' },
    { roleCode: 'others', label: 'Others', icon: 'sparkles' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let CarouselComponent: any = null;

  onMount(async () => {
    if (!browser) return;
    try {
      const mod = await import('svelte-carousel');
      CarouselComponent = mod.default;
    } catch (err) {
      console.warn('[Collab47] Failed to load svelte-carousel:', err);
    }
  });
</script>

{#snippet slideContent(slide: HeroCarouselSlide, idx: number)}
  <div class="w-full py-12 sm:py-16 lg:py-20">
    <div
      class="c47-container grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12"
    >
      <!-- Left Column: Display Headline, Existing Slogans, Glowing Pill CTA, & Hairline Stats -->
      <div class="flex flex-col items-start text-left lg:col-span-7">
        <span
          class="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-purple-200 backdrop-blur-sm"
        >
          <span class="relative flex h-2 w-2" aria-hidden="true">
            <span
              class="hero-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400"
            ></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-300"></span>
          </span>
          <span>{slide.badge}</span>
        </span>

        <svelte:element
          this={idx === 0 ? 'h1' : 'h2'}
          class="text-4xl leading-[1.08] font-semibold tracking-tight text-white sm:text-5xl lg:text-[62px]"
        >
          <span class="block">{slide.titlePrimary}</span>
          <span class="hero-headline-shine block">{slide.titleSecondary}</span>
        </svelte:element>

        <p class="mt-5 max-w-xl text-base leading-relaxed font-medium text-purple-100/90 sm:text-lg">
          {slide.subtitle}
        </p>
        <p class="mt-2.5 max-w-xl text-sm leading-relaxed text-purple-200/70 sm:text-base">
          {slide.description}
        </p>

        <!-- Primary Glowing Purple Pill CTA + Inline Secondary Link -->
        <div class="mt-7 flex flex-wrap items-center gap-5">
          {#if isAuthenticated && userName}
            <a
              href={continueHref}
              class="hero-btn-shine relative inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] px-7 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_0_32px_rgba(139,92,246,0.55)] transition hover:scale-[1.02] hover:brightness-110 hover:no-underline sm:text-base"
            >
              <Avatar name={userName} src={userAvatarUrl} size="sm" />
              <span>{userName} — Continue</span>
              <Icon name="arrow-right" size={17} />
            </a>
          {:else}
            <a
              href="/signup"
              class="hero-btn-shine relative inline-flex min-h-12 items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] px-7 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_0_32px_rgba(139,92,246,0.55)] transition hover:scale-[1.02] hover:brightness-110 hover:no-underline sm:text-base"
            >
              <span>{signUpLabel} — It's Free</span>
              <Icon name="arrow-right" size={16} />
            </a>
            <a
              href="/login"
              class="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-purple-100/90 no-underline transition hover:text-white hover:no-underline sm:text-base"
            >
              <span>{signInLabel}</span>
            </a>
          {/if}
        </div>

        <!-- Bottom Hairline-Divided Stats Row (matching new-dashboard.jpeg) -->
        <div class="mt-10 flex flex-wrap items-center gap-6 sm:gap-8">
          {#each slide.stats as stat, i}
            <div class={i > 0 ? 'border-l border-white/15 pl-6 sm:pl-8' : ''}>
              <strong
                class="block text-2xl leading-none font-semibold tracking-tight tabular-nums text-white sm:text-3xl"
              >
                {stat.value}
              </strong>
              <span class="mt-1.5 block text-xs font-medium text-purple-200/65">
                {stat.label}
              </span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Right Column: Rounded Neon-Lit Showcase Visual Card (matching new-dashboard.jpeg) -->
      <div class="lg:col-span-5">
        <div
          class="group relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-[24px] border border-purple-400/30 bg-[#12072B] shadow-[0_24px_80px_rgba(124,58,237,0.38)]"
        >
          <img
            src="/images/carasoul-bg.png"
            alt="Collab47 Innovation Workspace"
            width="1600"
            height="800"
            fetchpriority={idx === 0 ? 'high' : 'low'}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
            class="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105 select-none"
          />
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090418]/85 via-transparent to-purple-900/15"
          ></div>

          <!-- Top-Left Live Status Chip inside Showcase Frame -->
          <div class="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#0A041C]/70 px-3 py-1 text-[11px] font-semibold text-purple-100 backdrop-blur-md"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-fuchsia-400"></span>
              <span>Viksit Bharat 2047</span>
            </span>
            <span
              class="rounded-full border border-purple-300/25 bg-[#0A041C]/70 px-2.5 py-1 text-[11px] font-semibold text-purple-200 backdrop-blur-md"
            >
              0{idx + 1} / 0{slides.length}
            </span>
          </div>

          <!-- Bottom Glass Caption Strip inside Showcase Frame -->
          <div
            class="absolute right-4 bottom-4 left-4 rounded-2xl border border-white/15 bg-[#0B051E]/75 px-4 py-3 backdrop-blur-md"
          >
            <p class="text-xs leading-relaxed font-medium text-purple-100/95">
              {slide.ctaPrompt}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/snippet}

<section
  class="hero-shell relative w-full overflow-hidden bg-[#070312] text-white"
  aria-label="Collab47 hero section"
>
  <!-- Flowing Neon Purple & Magenta Silk-Wave Ribbons (matching new-dashboard.jpeg) -->
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div class="hero-orb hero-orb-top"></div>
    <div class="hero-orb hero-orb-right"></div>
    <div class="hero-orb hero-orb-bottom"></div>

    <svg
      class="absolute inset-0 h-full w-full opacity-85"
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <linearGradient id="silkWaveA" x1="25%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stop-color="#4C1D95" stop-opacity="0" />
          <stop offset="35%" stop-color="#9333EA" stop-opacity="0.55" />
          <stop offset="65%" stop-color="#D946EF" stop-opacity="0.72" />
          <stop offset="100%" stop-color="#6D28D9" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="silkWaveB" x1="10%" y1="30%" x2="95%" y2="90%">
          <stop offset="0%" stop-color="#6D28D9" stop-opacity="0" />
          <stop offset="45%" stop-color="#A855F7" stop-opacity="0.48" />
          <stop offset="75%" stop-color="#E879F9" stop-opacity="0.58" />
          <stop offset="100%" stop-color="#3B0764" stop-opacity="0" />
        </linearGradient>
        <filter id="silkBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="24" />
        </filter>
      </defs>

      <!-- Sweeping diagonal silk wave ribbon -->
      <path
        d="M 520 -60 C 660 220, 860 440, 1260 820 L 1460 820 C 1100 450, 880 210, 740 -60 Z"
        fill="url(#silkWaveA)"
        filter="url(#silkBlur)"
      />
      <!-- Soft horizontal-curved lower neon wave -->
      <path
        d="M -120 620 C 260 360, 740 310, 1340 780 L 1120 840 C 660 490, 260 520, -120 740 Z"
        fill="url(#silkWaveB)"
        filter="url(#silkBlur)"
      />
      <!-- Fine bright magenta silk highlight edge -->
      <path
        d="M 610 -40 C 740 230, 960 450, 1380 790"
        stroke="#F0ABFC"
        stroke-opacity="0.45"
        stroke-width="2"
      />
      <path
        d="M -60 660 C 310 420, 740 390, 1260 770"
        stroke="#C084FC"
        stroke-opacity="0.35"
        stroke-width="1.5"
      />
    </svg>
  </div>

  <!-- Hero Carousel Slides -->
  <div class="hero-sc-root relative z-10 w-full pb-8">
    {#if browser && CarouselComponent}
      <svelte:component
        this={CarouselComponent}
        autoplay={true}
        {autoplayDuration}
        pauseOnFocus={true}
        infinite={true}
        swiping={true}
        arrows={true}
        dots={true}
        duration={650}
        timingFunction="ease-in-out"
      >
        <div
          slot="prev"
          let:showPrevPage
          class="absolute top-1/2 left-2 z-20 hidden -translate-y-1/2 xl:block xl:left-4"
        >
          <button
            type="button"
            on:click={showPrevPage}
            aria-label="Previous slide"
            class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#12082A]/70 text-purple-100 backdrop-blur-md transition hover:border-purple-400/60 hover:bg-[#7C3AED] hover:text-white"
          >
            <Icon name="chevron-left" size={18} />
          </button>
        </div>

        {#each slides as slide, idx (slide.id)}
          {@render slideContent(slide, idx)}
        {/each}

        <div
          slot="next"
          let:showNextPage
          class="absolute top-1/2 right-2 z-20 hidden -translate-y-1/2 xl:block xl:right-4"
        >
          <button
            type="button"
            on:click={showNextPage}
            aria-label="Next slide"
            class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#12082A]/70 text-purple-100 backdrop-blur-md transition hover:border-purple-400/60 hover:bg-[#7C3AED] hover:text-white"
          >
            <Icon name="chevron-right" size={18} />
          </button>
        </div>

        <div
          slot="dots"
          let:currentPageIndex
          let:pagesCount
          let:showPage
          class="mt-1 flex items-center justify-center gap-2.5"
        >
          {#each Array(pagesCount || slides.length) as _, pageIndex (pageIndex)}
            <button
              type="button"
              on:click={() => showPage(pageIndex)}
              aria-label="Go to slide {pageIndex + 1}"
              aria-current={currentPageIndex === pageIndex ? 'true' : undefined}
              class="h-2 cursor-pointer rounded-full transition-all duration-300 {currentPageIndex ===
              pageIndex
                ? 'w-8 bg-gradient-to-r from-[#A855F7] to-[#E879F9] shadow-[0_0_12px_rgba(192,132,252,0.85)]'
                : 'w-2 bg-white/25 hover:bg-white/60'}"
            ></button>
          {/each}
        </div>
      </svelte:component>
    {:else if slides[0]}
      {@render slideContent(slides[0], 0)}
      <div class="mt-1 flex items-center justify-center gap-2.5" aria-hidden="true">
        {#each slides as slide, idx (slide.id)}
          <span
            class="h-2 rounded-full {idx === 0
              ? 'w-8 bg-gradient-to-r from-[#A855F7] to-[#E879F9]'
              : 'w-2 bg-white/25'}"
          ></span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Bottom Ecosystem Role Bar (8 Canonical Public Roles + Crisp High-Contrast Text) -->
  <div class="relative z-10 border-t border-purple-400/20 bg-[#0D0622]/95 backdrop-blur-md">
    <div class="c47-container py-5">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-bold tracking-wider uppercase text-fuchsia-300">
          {$t.auth.joiningAsLabel}
        </span>
        <span class="text-xs font-medium text-purple-200/90">
          {$t.auth.joiningAsHint}
        </span>
      </div>
      <div
        class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 text-xs font-semibold tracking-wide"
      >
        {#each ecosystemStrip as item (item.roleCode)}
          <a
            href="/signup?role={item.roleCode}"
            class="inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1.5 text-white no-underline transition hover:border-fuchsia-400/70 hover:bg-purple-500/25 hover:text-fuchsia-100 hover:no-underline"
          >
            <Icon name={item.icon} size={15} class="text-fuchsia-300" />
            <span>{item.label}</span>
          </a>
        {/each}
      </div>
      {#if dpdpNote}
        <p id="dpdp" class="mt-3.5 text-center text-xs font-medium text-purple-100/90 lg:text-left">
          {dpdpNote}
        </p>
      {/if}
    </div>
  </div>
</section>

<style>
  .hero-shell {
    contain: layout paint;
  }

  .hero-orb {
    position: absolute;
    border-radius: 9999px;
    will-change: transform, opacity;
  }

  .hero-orb-top {
    top: -180px;
    left: 26%;
    width: 620px;
    height: 620px;
    background: radial-gradient(circle, rgba(147, 51, 234, 0.36) 0%, rgba(147, 51, 234, 0) 70%);
  }

  .hero-orb-right {
    top: 10%;
    right: -140px;
    width: 580px;
    height: 580px;
    background: radial-gradient(circle, rgba(217, 70, 239, 0.34) 0%, rgba(217, 70, 239, 0) 68%);
  }

  .hero-orb-bottom {
    bottom: -220px;
    left: 12%;
    width: 720px;
    height: 460px;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.32) 0%, rgba(124, 58, 237, 0) 72%);
  }

  .hero-headline-shine {
    background-image: linear-gradient(
      110deg,
      #ffffff 0%,
      #e9d5ff 34%,
      #ffffff 50%,
      #d8b4fe 62%,
      #ffffff 100%
    );
    background-size: 240% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: heroHeadlineShine 5s linear infinite;
  }

  @keyframes heroHeadlineShine {
    0% {
      background-position: 200% center;
    }
    100% {
      background-position: -200% center;
    }
  }

  .hero-btn-shine::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-120%) skewX(-18deg);
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.32) 50%,
      transparent 100%
    );
    animation: heroBtnSweep 3.8s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes heroBtnSweep {
    0%,
    55% {
      transform: translateX(-120%) skewX(-18deg);
    }
    100% {
      transform: translateX(140%) skewX(-18deg);
    }
  }

  .hero-ping {
    will-change: transform, opacity;
    animation: heroPing 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  @keyframes heroPing {
    0% {
      transform: scale(1);
      opacity: 0.85;
    }
    75%,
    100% {
      transform: scale(2.4);
      opacity: 0;
    }
  }

  .hero-sc-root :global(.sc-carousel__carousel-container),
  .hero-sc-root :global(.sc-carousel__content-container),
  .hero-sc-root :global(.sc-carousel__pages-window),
  .hero-sc-root :global(.sc-carousel__pages-container) {
    position: relative;
    width: 100%;
  }

  .hero-sc-root :global(.sc-carousel__pages-container > *) {
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-headline-shine,
    .hero-btn-shine::after,
    .hero-ping {
      animation: none !important;
    }
  }
</style>
