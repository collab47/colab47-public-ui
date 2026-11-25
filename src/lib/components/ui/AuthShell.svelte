<script lang="ts">
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
    heroTagline: _heroTagline = 'Your Innovation. Your Identity.',
    heroDescription: _heroDescription = '',
    children,
    footer,
  }: Props = $props();
</script>

<main
  class="auth-centered-bg relative flex min-h-screen flex-col overflow-hidden bg-[#FAF5FF] px-4 py-6 sm:px-8"
>
  <!-- Subtle Violet & Purple Ambient Corner Glows -->
  <div
    class="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-[#7C3AED]/14 blur-3xl"
    aria-hidden="true"
  ></div>
  <div
    class="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-[#9333EA]/14 blur-3xl"
    aria-hidden="true"
  ></div>

  <!-- Top Bar -->
  <header class="relative z-10 mx-auto mb-4 flex w-full max-w-5xl items-center justify-between gap-3">
    <Wordmark size="sm" tone="dark" href="/" />
    <div class="flex items-center gap-3">
      <LanguageSwitcher align="right" />
      <a
        href="/"
        class="inline-flex items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-white px-3.5 py-1.5 text-xs font-bold text-[#7C3AED] no-underline shadow-2xs transition hover:border-[#9333EA] hover:bg-[#F5F3FF] hover:text-[#6B21A8] hover:no-underline sm:text-sm"
      >
        <Icon name="arrow-left" size={15} />
        <span>{$t.auth.backToHome}</span>
      </a>
    </div>
  </header>

  <!-- Centered Auth Card -->
  <section class="relative z-10 m-auto w-full max-w-[496px] py-4">
    <div
      class="overflow-hidden rounded-2xl border border-[#E9D5FF] bg-white shadow-[0_16px_42px_rgba(76,29,149,0.09)]"
    >
      <!-- Violet-Purple Accent Top Strip -->
      <div
        class="h-1.5 w-full bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#A855F7]"
        aria-hidden="true"
      ></div>

      <div class="p-6 sm:p-8">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-extrabold tracking-tight text-[#2E1065] sm:text-3xl">
            {title}
          </h1>
          <p class="mt-1.5 text-sm font-medium text-purple-900/75">{subtitle}</p>
        </div>

        <div>
          {@render children?.()}
        </div>

        {#if footer}
          <div class="mt-6 border-t border-[#E9D5FF] pt-4 text-center text-sm text-slate-600">
            {@render footer()}
          </div>
        {/if}

        <p class="mt-5 text-center text-xs leading-relaxed text-slate-500">
          {$t.auth.dpdpConsentNote}
        </p>
      </div>
    </div>
  </section>
</main>
