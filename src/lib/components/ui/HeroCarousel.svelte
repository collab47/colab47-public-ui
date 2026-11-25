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
  export let signInLabel = 'Sign In';
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
    class="flex min-h-[560px] w-full items-center justify-center px-14 pt-14 pb-20 text-center sm:min-h-[620px] sm:px-24"
  >
    <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-6">
      <span
        class="hero-shimmer relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#D8B4FE]/55 bg-[#2e1065]/35 px-4 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur-sm"
      >
        <span class="relative flex h-2 w-2" aria-hidden="true">
          <span class="hero-ping absolute inline-flex h-full w-full rounded-full bg-[#E9D5FF]"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-[#C084FC]"></span>
        </span>
        <span>{slide.badge}</span>
      </span>

      <svelte:element
        this={idx === 0 ? 'h1' : 'h2'}
        class="text-4xl leading-tight font-extrabold tracking-tight text-white drop-shadow-[0_6px_24px_rgba(46,16,101,0.7)] sm:text-5xl lg:text-7xl"
      >
        <span>{slide.titlePrimary}</span>
        <span
          class="block bg-gradient-to-r from-[#F3E8FF] via-[#E9D5FF] to-[#C084FC] bg-clip-text text-transparent sm:inline"
        >
          {' '}{slide.titleSecondary}
        </span>
      </svelte:element>

      <p class="text-lg font-bold text-white sm:text-2xl">{slide.subtitle}</p>
      <p class="max-w-3xl text-sm leading-relaxed text-purple-100/95 sm:text-lg">
        {slide.description}
      </p>

      <div class="grid w-full max-w-xl grid-cols-3 gap-3 border-t border-white/20 pt-5">
        {#each slide.stats as stat, i}
          <div class="text-center {i > 0 ? 'border-l border-white/20 pl-3' : ''}">
            <strong class="block text-xl font-extrabold tabular-nums text-[#E9D5FF] sm:text-2xl">
              {stat.value}
            </strong>
            <span class="text-xs font-medium text-purple-100/90">{stat.label}</span>
          </div>
        {/each}
      </div>

      {#if isAuthenticated && userName}
        <a
          href={continueHref}
          class="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/30 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#9333EA] px-6 py-2.5 text-base font-extrabold text-white no-underline shadow-[0_10px_28px_rgba(124,58,237,0.5)] transition hover:scale-[1.02] hover:brightness-110 hover:no-underline"
        >
          <Avatar name={userName} src={userAvatarUrl} size="sm" />
          <span>{userName} — Continue</span>
          <Icon name="arrow-right" size={18} />
        </a>
      {:else}
        <div class="flex flex-col items-center gap-3">
          <p class="max-w-xl text-sm font-semibold text-[#E9D5FF] sm:text-base">
            {slide.ctaPrompt}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/signup"
              class="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-white/35 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#9333EA] px-7 py-2.5 text-base font-extrabold text-white no-underline shadow-[0_10px_28px_rgba(124,58,237,0.5)] transition hover:scale-[1.02] hover:brightness-110 hover:no-underline"
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
          class="rounded-full border border-white/25 bg-[#2e1065]/30 px-4 py-1 text-xs font-medium text-purple-100 backdrop-blur-sm"
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
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <picture class="block h-full w-full">
      <source srcset="/images/carasoul-bg.webp" type="image/webp" />
      <img
        src="/images/carasoul-bg.jpg"
        alt=""
        width="1600"
        height="800"
        fetchpriority="high"
        loading="eager"
        decoding="async"
        class="h-full w-full object-cover object-center select-none"
      />
    </picture>
    <div
      class="absolute inset-0 bg-gradient-to-br from-[#2e1065]/74 via-[#5b21b6]/56 to-[#7e22ce]/68"
    ></div>
    <div class="hero-glow hero-glow-violet"></div>
    <div class="hero-glow hero-glow-purple"></div>
  </div>

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
    background: linear-gradient(125deg, #2e1065 0%, #4c1d95 38%, #6b21a8 72%, #9333ea 100%);
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

  .hero-glow {
    position: absolute;
    border-radius: 9999px;
    will-change: transform, opacity;
  }

  .hero-glow-violet {
    top: -120px;
    left: -90px;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.44) 0%, rgba(124, 58, 237, 0) 68%);
    animation: heroGlowDriftA 14s ease-in-out infinite alternate;
  }

  .hero-glow-purple {
    right: -110px;
    bottom: -140px;
    width: 560px;
    height: 560px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.44) 0%, rgba(168, 85, 247, 0) 68%);
    animation: heroGlowDriftB 16s ease-in-out infinite alternate;
  }

  @keyframes heroGlowDriftA {
    0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.7; }
    100% { transform: translate3d(48px, 32px, 0) scale(1.14); opacity: 1; }
  }

  @keyframes heroGlowDriftB {
    0% { transform: translate3d(0, 0, 0) scale(1.04); opacity: 0.68; }
    100% { transform: translate3d(-48px, -32px, 0) scale(1.16); opacity: 1; }
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
    .hero-glow,
    .hero-ping,
    .hero-shimmer::after {
      animation: none !important;
    }
  }
</style>
