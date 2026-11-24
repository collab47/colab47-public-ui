<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { t } from '$lib/stores';
  import Icon from './Icon.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import Wordmark from './Wordmark.svelte';

  interface Props {
    title: string;
    subtitle: string;
    heroTagline?: string;
    heroDescription?: string;
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    title,
    subtitle,
    heroTagline = 'Your Innovation. Your Identity.',
    heroDescription = 'Connecting students, researchers, academia, and industry to build verified proof of work towards Viksit Bharat 2047.',
    children,
    footer,
  }: Props = $props();

  let domainsCount = $state(25);
  let disciplinesCount = $state(86);
  let verifiedCount = $state(100);

  const particles = [
    { left: '14%', top: '26%', size: 5, delay: '0s', duration: '9s', color: '#f59e0b' },
    { left: '82%', top: '22%', size: 4, delay: '-2.5s', duration: '11s', color: '#34d399' },
    { left: '28%', top: '62%', size: 4, delay: '-4s', duration: '10s', color: '#34d399' },
    { left: '74%', top: '54%', size: 6, delay: '-1.5s', duration: '12s', color: '#fb923c' },
    { left: '48%', top: '18%', size: 3, delay: '-6s', duration: '8.5s', color: '#ffffff' },
    { left: '62%', top: '70%', size: 4, delay: '-3.2s', duration: '9.5s', color: '#f59e0b' },
    { left: '18%', top: '76%', size: 3, delay: '-5.1s', duration: '11.5s', color: '#ffffff' },
    { left: '88%', top: '64%', size: 5, delay: '-7s', duration: '10.5s', color: '#34d399' },
  ] as const;

  onMount(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const durationMs = 950;
    const start = performance.now();
    let frameId = 0;

    const tick = (now: number): void => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);

      domainsCount = Math.round(25 * eased);
      disciplinesCount = Math.round(86 * eased);
      verifiedCount = Math.round(100 * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    domainsCount = 0;
    disciplinesCount = 0;
    verifiedCount = 0;
    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  });
</script>

<main class="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
  <!-- Left Half: GPU-Composited Animated Flagship 3D Visual Panel (hidden on < lg) -->
  <aside class="auth-panel relative hidden overflow-hidden bg-[#060D1E] text-white lg:flex">
    <!-- Layer 1: Smooth Ken Burns + Orbital Drift Hero Artwork -->
    <img
      src="/images/auth-hero.jpg"
      alt=""
      aria-hidden="true"
      class="auth-hero-img pointer-events-none absolute inset-0 h-full w-full object-cover object-center select-none"
    />

    <!-- Layer 2: Pre-composited Saffron & Emerald Volumetric Ambient Glows (transform + opacity only) -->
    <div class="auth-glow auth-glow-saffron pointer-events-none" aria-hidden="true"></div>
    <div class="auth-glow auth-glow-green pointer-events-none" aria-hidden="true"></div>

    <!-- Layer 3: Precision Rotating Orbital Rings & Satellites (GPU transform rotate only) -->
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <svg class="auth-orbit auth-orbit-outer h-[520px] w-[520px] opacity-40" viewBox="0 0 520 520" fill="none">
        <circle cx="260" cy="260" r="244" stroke="url(#orbitSaffron)" stroke-width="1" stroke-dasharray="6 10" />
        <circle cx="260" cy="16" r="4.5" fill="#fb923c" />
        <circle cx="495" cy="322" r="3.5" fill="#34d399" />
        <defs>
          <linearGradient id="orbitSaffron" x1="0" y1="0" x2="520" y2="520" gradientUnits="userSpaceOnUse">
            <stop stop-color="#D45F00" stop-opacity="0.9" />
            <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.2" />
            <stop offset="1" stop-color="#086030" stop-opacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      <svg class="auth-orbit auth-orbit-inner absolute h-[380px] w-[380px] opacity-35" viewBox="0 0 380 380" fill="none">
        <circle cx="190" cy="190" r="176" stroke="url(#orbitGreen)" stroke-width="1" />
        <circle cx="190" cy="14" r="4" fill="#34d399" />
        <circle cx="40" cy="282" r="3" fill="#fbbf24" />
        <defs>
          <linearGradient id="orbitGreen" x1="380" y1="0" x2="0" y2="380" gradientUnits="userSpaceOnUse">
            <stop stop-color="#10b981" stop-opacity="0.85" />
            <stop offset="0.55" stop-color="#ffffff" stop-opacity="0.1" />
            <stop offset="1" stop-color="#f97316" stop-opacity="0.85" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Layer 4: Floating Ambient Micro-Particles -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {#each particles as p, idx (idx)}
        <span
          class="auth-particle"
          style="left: {p.left}; top: {p.top}; width: {p.size}px; height: {p.size}px; background-color: {p.color}; animation-delay: {p.delay}; animation-duration: {p.duration};"
        ></span>
      {/each}
    </div>

    <!-- Layer 5: Foreground Editorial Content with Staggered GPU Entrance -->
    <div
      class="relative z-10 flex w-full flex-col justify-between bg-gradient-to-b from-[#060D1E]/35 via-transparent to-[#060D1E]/92 p-10 xl:p-12"
    >
      <div class="auth-enter auth-delay-1 flex items-center justify-between">
        <Wordmark size="lg" tone="light" href="/" />
        <span
          class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium tracking-wide text-slate-200 backdrop-blur-md"
        >
          <span class="relative flex h-2 w-2" aria-hidden="true">
            <span class="auth-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </span>
          <span>Viksit Bharat 2047</span>
        </span>
      </div>

      <div class="mt-auto flex flex-col gap-6">
        <div class="flex max-w-lg flex-col items-start gap-3">
          <span
            class="auth-enter auth-delay-2 auth-shimmer-pill relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-amber-400/35 bg-amber-500/15 px-3.5 py-1 text-xs font-semibold tracking-wide text-amber-200 backdrop-blur-md"
          >
            <Icon name="sparkles" size={14} />
            <span>Talent × Ideas × Opportunities × Impact</span>
          </span>

          <h2
            class="auth-enter auth-delay-3 text-3xl leading-tight font-extrabold tracking-tight text-white xl:text-4xl"
          >
            {heroTagline}
          </h2>

          <p class="auth-enter auth-delay-4 text-sm leading-relaxed text-slate-300 xl:text-base">
            {heroDescription}
          </p>
        </div>

        <div
          class="auth-enter auth-delay-5 auth-float-card grid grid-cols-3 gap-4 rounded-2xl border border-white/12 bg-white/6 px-5 py-4 backdrop-blur-md"
        >
          <div>
            <strong class="block text-2xl font-extrabold tabular-nums text-amber-400">
              {domainsCount}
            </strong>
            <span class="text-xs font-medium text-slate-300">{$t.auth.statDomains}</span>
          </div>
          <div class="border-l border-white/10 pl-4">
            <strong class="block text-2xl font-extrabold tabular-nums text-emerald-400">
              {disciplinesCount}
            </strong>
            <span class="text-xs font-medium text-slate-300">{$t.auth.statDisciplines}</span>
          </div>
          <div class="border-l border-white/10 pl-4">
            <strong class="block text-2xl font-extrabold tabular-nums text-white">
              {verifiedCount}%
            </strong>
            <span class="text-xs font-medium text-slate-300">{$t.auth.statProof}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Right Half: Centered Form Panel -->
  <section class="flex min-h-screen flex-col bg-white px-5 py-6 sm:px-8">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div class="lg:hidden">
        <Wordmark size="sm" tone="dark" href="/" />
      </div>
      <div class="ml-auto flex items-center gap-3">
        <LanguageSwitcher align="right" />
        <a
          href="/"
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-logo-green no-underline transition hover:text-logo-saffron hover:no-underline"
        >
          <Icon name="arrow-left" size={15} />
          <span>{$t.auth.backToHome}</span>
        </a>
      </div>
    </div>

    <div class="m-auto w-full max-w-[420px] py-4">
      <div class="mb-6">
        <h1 class="text-3xl font-extrabold tracking-tight text-logo-saffron">{title}</h1>
        <p class="mt-1.5 text-sm font-medium text-logo-green">{subtitle}</p>
      </div>

      <div>
        {@render children?.()}
      </div>

      {#if footer}
        <div class="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
          {@render footer()}
        </div>
      {/if}

      <p class="mt-5 text-center text-xs leading-relaxed text-slate-500">
        {$t.auth.dpdpConsentNote}
      </p>
    </div>
  </section>
</main>

<style>
  .auth-panel {
    contain: layout paint;
  }

  /* 1. Cinematic Ken Burns + slow drift (GPU transform only) */
  .auth-hero-img {
    will-change: transform;
    transform-origin: center center;
    animation: authHeroDrift 22s ease-in-out infinite alternate;
  }

  @keyframes authHeroDrift {
    0% {
      transform: translate3d(0, 0, 0) scale(1.03);
    }
    50% {
      transform: translate3d(-1.2%, -1%, 0) scale(1.08);
    }
    100% {
      transform: translate3d(1.2%, 0.8%, 0) scale(1.05);
    }
  }

  /* 2. Soft pre-rendered radial light orbs (GPU transform + opacity only, no CSS blur animation) */
  .auth-glow {
    position: absolute;
    width: 440px;
    height: 440px;
    border-radius: 9999px;
    will-change: transform, opacity;
  }

  .auth-glow-saffron {
    top: 10%;
    right: -10%;
    background: radial-gradient(circle, rgba(212, 95, 0, 0.28) 0%, rgba(212, 95, 0, 0) 68%);
    animation: authGlowFloatA 14s ease-in-out infinite alternate;
  }

  .auth-glow-green {
    bottom: 16%;
    left: -12%;
    background: radial-gradient(circle, rgba(8, 96, 48, 0.34) 0%, rgba(8, 96, 48, 0) 68%);
    animation: authGlowFloatB 16s ease-in-out infinite alternate;
  }

  @keyframes authGlowFloatA {
    0% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 0.65;
    }
    100% {
      transform: translate3d(-44px, 34px, 0) scale(1.16);
      opacity: 1;
    }
  }

  @keyframes authGlowFloatB {
    0% {
      transform: translate3d(0, 0, 0) scale(1.05);
      opacity: 0.6;
    }
    100% {
      transform: translate3d(48px, -36px, 0) scale(1.18);
      opacity: 0.95;
    }
  }

  /* 3. Counter-rotating precision orbital rings (GPU transform rotate only) */
  .auth-orbit {
    will-change: transform;
  }

  .auth-orbit-outer {
    animation: authSpinCW 36s linear infinite;
  }

  .auth-orbit-inner {
    animation: authSpinCCW 26s linear infinite;
  }

  @keyframes authSpinCW {
    from {
      transform: rotate3d(0, 0, 1, 0deg);
    }
    to {
      transform: rotate3d(0, 0, 1, 360deg);
    }
  }

  @keyframes authSpinCCW {
    from {
      transform: rotate3d(0, 0, 1, 360deg);
    }
    to {
      transform: rotate3d(0, 0, 1, 0deg);
    }
  }

  /* 4. Gentle floating micro-particles */
  .auth-particle {
    position: absolute;
    border-radius: 9999px;
    will-change: transform, opacity;
    animation-name: authParticleFloat;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  @keyframes authParticleFloat {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scale(0.9);
      opacity: 0.25;
    }
    50% {
      transform: translate3d(10px, -24px, 0) scale(1.25);
      opacity: 0.85;
    }
  }

  /* 5. Live emerald pulse ring */
  .auth-ping {
    will-change: transform, opacity;
    animation: authPing 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  @keyframes authPing {
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

  /* 6. Shimmer sheen sweep across tagline pill (transform only) */
  .auth-shimmer-pill::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      transparent 20%,
      rgba(255, 255, 255, 0.26) 50%,
      transparent 80%
    );
    will-change: transform;
    animation: authShimmer 5.5s ease-in-out infinite;
  }

  @keyframes authShimmer {
    0%,
    60% {
      transform: translate3d(-120%, 0, 0);
    }
    100% {
      transform: translate3d(120%, 0, 0);
    }
  }

  /* 7. Staggered editorial entrance & gentle float on metrics card */
  .auth-enter {
    opacity: 0;
    will-change: transform, opacity;
    animation: authFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .auth-delay-1 {
    animation-delay: 0.05s;
  }

  .auth-delay-2 {
    animation-delay: 0.14s;
  }

  .auth-delay-3 {
    animation-delay: 0.22s;
  }

  .auth-delay-4 {
    animation-delay: 0.3s;
  }

  .auth-delay-5 {
    animation-delay: 0.38s;
  }

  @keyframes authFadeUp {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  .auth-float-card {
    animation:
      authFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.38s forwards,
      authCardFloat 6.5s ease-in-out 1.1s infinite alternate;
  }

  @keyframes authCardFloat {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(0, -5px, 0);
    }
  }

  /* Respect OS reduced-motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .auth-hero-img,
    .auth-glow,
    .auth-orbit,
    .auth-particle,
    .auth-ping,
    .auth-shimmer-pill::after,
    .auth-enter,
    .auth-float-card {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
</style>
