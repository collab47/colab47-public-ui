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
  import Avatar from './Avatar.svelte';
  import Icon from './Icon.svelte';

  export let slides: readonly HeroCarouselSlide[] = [];
  export let autoplayDuration = 5500;
  export let isAuthenticated = false;
  export let userName = '';
  export let userAvatarUrl: string | null | undefined = undefined;
  export let continueHref = '/dashboard';
  export let signUpLabel = 'Sign Up';
  export let dpdpNote = '';

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
  <div
    class="hero-slide-bg flex min-h-[560px] w-full items-center justify-center px-14 pt-14 pb-20 text-center sm:min-h-[620px] sm:px-24"
  >
    <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-6">
      <span
        class="hero-shimmer relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-fuchsia-300/60 bg-[#1B0638]/75 px-4 py-1.5 text-xs font-bold tracking-wide text-fuchsia-200 shadow-[0_4px_16px_rgba(15,5,36,0.6)] backdrop-blur-sm"
      >
        <span class="relative flex h-2 w-2" aria-hidden="true">
          <span class="hero-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-300"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-400"></span>
        </span>
        <span>{slide.badge}</span>
      </span>

      <svelte:element
        this={idx === 0 ? 'h1' : 'h2'}
        class="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-7xl"
      >
        <span class="hero-text-shine">{slide.titlePrimary}</span>
        <span class="hero-text-shine-accent block sm:inline">
          {' '}{slide.titleSecondary}
        </span>
      </svelte:element>

      <p class="hero-subtitle-glow text-lg font-extrabold text-fuchsia-200 sm:text-2xl">
        {slide.subtitle}
      </p>
      <p class="hero-text-shadow max-w-3xl text-sm leading-relaxed font-semibold text-fuchsia-100 sm:text-lg">
        {slide.description}
      </p>

      <div class="grid w-full max-w-xl grid-cols-3 gap-3 border-t border-fuchsia-300/35 pt-5">
        {#each slide.stats as stat, i}
          <div class="text-center {i > 0 ? 'border-l border-fuchsia-300/35 pl-3' : ''}">
            <strong class="hero-text-shine-accent block text-xl font-extrabold tabular-nums sm:text-2xl">
              {stat.value}
            </strong>
            <span class="hero-text-shadow text-xs font-bold text-fuchsia-100">{stat.label}</span>
          </div>
        {/each}
      </div>

      {#if isAuthenticated && userName}
        <a
          href={continueHref}
          class="hero-btn-shine relative inline-flex min-h-12 items-center gap-3 overflow-hidden rounded-full border border-fuchsia-300/60 bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-purple-600 px-6 py-2.5 text-base font-extrabold text-fuchsia-50 no-underline shadow-[0_10px_28px_rgba(15,5,36,0.65)] transition hover:scale-[1.02] hover:brightness-110 hover:no-underline"
        >
          <Avatar name={userName} src={userAvatarUrl} size="sm" />
          <span>{userName} — Continue</span>
          <Icon name="arrow-right" size={18} />
        </a>
      {:else}
        <div class="flex flex-col items-center gap-3">
          <p class="hero-text-shadow max-w-xl text-sm font-bold text-fuchsia-200 sm:text-base">
            {slide.ctaPrompt}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/signup"
              class="hero-btn-shine relative inline-flex min-h-12 items-center gap-2.5 overflow-hidden rounded-full border border-fuchsia-300/60 bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-purple-600 px-7 py-2.5 text-base font-extrabold text-fuchsia-50 no-underline shadow-[0_10px_28px_rgba(15,5,36,0.65)] transition hover:scale-[1.02] hover:brightness-110 hover:no-underline"
            >
              <Icon name="user-plus" size={18} />
              <span>{signUpLabel} — It's Free</span>
              <Icon name="arrow-right" size={18} />
            </a>
          </div>
        </div>
      {/if}

      {#if dpdpNote}
        <p
          id={idx === 0 ? 'dpdp' : undefined}
          class="rounded-full border border-fuchsia-300/45 bg-[#1B0638]/75 px-4 py-1 text-xs font-semibold text-fuchsia-100 shadow-[0_4px_14px_rgba(15,5,36,0.55)] backdrop-blur-sm"
        >
          {dpdpNote}
        </p>
      {/if}
    </div>
  </div>
{/snippet}

<section
  class="hero-carousel-section relative w-full overflow-hidden border-b border-white/15 text-white"
  aria-label="Collab47 hero carousel"
>
  <div class="hero-sc-root relative z-10 w-full">
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
          class="absolute top-1/2 left-3 z-20 -translate-y-1/2 sm:left-6"
        >
          <button
            type="button"
            on:click={showPrevPage}
            aria-label="Previous slide"
            class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#2e1065]/55 text-white backdrop-blur-md transition hover:border-white/55 hover:bg-[#7C3AED] sm:h-11 sm:w-11"
          >
            <Icon name="chevron-left" size={20} />
          </button>
        </div>

        {#each slides as slide, idx (slide.id)}
          {@render slideContent(slide, idx)}
        {/each}

        <div
          slot="next"
          let:showNextPage
          class="absolute top-1/2 right-3 z-20 -translate-y-1/2 sm:right-6"
        >
          <button
            type="button"
            on:click={showNextPage}
            aria-label="Next slide"
            class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-[#2e1065]/55 text-white backdrop-blur-md transition hover:border-white/55 hover:bg-[#7C3AED] sm:h-11 sm:w-11"
          >
            <Icon name="chevron-right" size={20} />
          </button>
        </div>

        <div
          slot="dots"
          let:currentPageIndex
          let:pagesCount
          let:showPage
          class="absolute right-0 bottom-5 left-0 z-20 flex items-center justify-center gap-2.5"
        >
          {#each Array(pagesCount || slides.length) as _, pageIndex (pageIndex)}
            <button
              type="button"
              on:click={() => showPage(pageIndex)}
              aria-label="Go to slide {pageIndex + 1}"
              aria-current={currentPageIndex === pageIndex ? 'true' : undefined}
              class="h-2.5 cursor-pointer rounded-full transition-all duration-300 {currentPageIndex ===
              pageIndex
                ? 'w-9 bg-gradient-to-r from-[#E9D5FF] to-[#A855F7] shadow-[0_0_12px_rgba(192,132,252,0.85)]'
                : 'w-2.5 bg-white/40 hover:bg-white/75'}"
            ></button>
          {/each}
        </div>
      </svelte:component>
    {:else if slides[0]}
      {@render slideContent(slides[0], 0)}

      <div
        class="pointer-events-none absolute right-0 bottom-5 left-0 z-20 flex items-center justify-center gap-2.5"
        aria-hidden="true"
      >
        {#each slides as slide, idx (slide.id)}
          <span
            class="h-2.5 rounded-full {idx === 0
              ? 'w-9 bg-gradient-to-r from-[#E9D5FF] to-[#A855F7]'
              : 'w-2.5 bg-white/40'}"
          ></span>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .hero-carousel-section {
    contain: layout paint;
    background-color: #1a0b2e;
  }

  .hero-slide-bg {
    background-image: url('/images/carasoul-bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .hero-text-shine {
    background-image: linear-gradient(
      180deg,
      #fae8ff 0%,
      #f5d0fe 32%,
      #ffffff 48%,
      #f0abfc 56%,
      #fae8ff 100%
    );
    background-size: 240% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 2px 6px rgba(15, 5, 36, 0.95))
      drop-shadow(0 6px 20px rgba(15, 5, 36, 0.85));
    animation: heroTextShine 4.2s linear infinite;
  }

  .hero-text-shine-accent {
    background-image: linear-gradient(
      180deg,
      #f0abfc 0%,
      #e879f9 28%,
      #ffffff 48%,
      #f5d0fe 58%,
      #f0abfc 100%
    );
    background-size: 240% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 2px 6px rgba(15, 5, 36, 0.95))
      drop-shadow(0 6px 22px rgba(15, 5, 36, 0.9));
    animation: heroTextShine 3.6s linear infinite;
    animation-delay: -0.9s;
  }

  @keyframes heroTextShine {
    0% {
      background-position: 200% center;
    }
    100% {
      background-position: -200% center;
    }
  }

  .hero-subtitle-glow {
    text-shadow:
      0 1px 6px rgba(15, 5, 36, 0.98),
      0 3px 18px rgba(15, 5, 36, 0.9),
      0 0 14px rgba(240, 171, 252, 0.45);
    animation: heroSubtitleGlow 3.2s ease-in-out infinite alternate;
  }

  @keyframes heroSubtitleGlow {
    0% {
      text-shadow:
        0 1px 6px rgba(15, 5, 36, 0.98),
        0 3px 18px rgba(15, 5, 36, 0.9),
        0 0 8px rgba(240, 171, 252, 0.25);
    }
    100% {
      text-shadow:
        0 1px 6px rgba(15, 5, 36, 0.98),
        0 3px 18px rgba(15, 5, 36, 0.9),
        0 0 22px rgba(245, 208, 254, 0.85);
    }
  }

  .hero-text-shadow {
    text-shadow:
      0 1px 6px rgba(15, 5, 36, 0.98),
      0 3px 18px rgba(15, 5, 36, 0.9);
  }

  .hero-btn-shine::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-120%) skewX(-18deg);
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.35) 50%,
      transparent 100%
    );
    animation: heroBtnShine 3.6s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes heroBtnShine {
    0%, 55% {
      transform: translateX(-120%) skewX(-18deg);
    }
    100% {
      transform: translateX(140%) skewX(-18deg);
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

  .hero-ping {
    will-change: transform, opacity;
    animation: heroPing 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  @keyframes heroPing {
    0% { transform: scale(1); opacity: 0.8; }
    75%, 100% { transform: scale(2.4); opacity: 0; }
  }

  .hero-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.24) 50%, transparent 100%);
    animation: heroShimmer 4.5s ease-in-out infinite;
  }

  @keyframes heroShimmer {
    0%, 60% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-ping,
    .hero-shimmer::after,
    .hero-text-shine,
    .hero-text-shine-accent,
    .hero-subtitle-glow,
    .hero-btn-shine::after {
      animation: none !important;
    }
  }
</style>