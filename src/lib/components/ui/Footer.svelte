<script lang="ts">
  import { t } from '$lib/stores';
  import Wordmark from './Wordmark.svelte';

  interface Props {
    variant?: 'light' | 'dark';
  }

  let { variant = 'light' }: Props = $props();
  const isDark = $derived(variant === 'dark');
</script>

<footer
  class="border-t pt-12 pb-8 {isDark
    ? 'border-white/10 bg-[#05020D] text-purple-100'
    : 'mt-16 border-slate-200 bg-white'}"
>
  <div
    class="c47-container grid grid-cols-2 gap-8 border-b pb-8 md:grid-cols-5 {isDark
      ? 'border-white/10'
      : 'border-slate-200'}"
  >
    <div class="col-span-2">
      <Wordmark size="lg" tone={isDark ? 'light' : 'dark'} href="/" />
      <p class="mt-3 max-w-xs text-sm font-medium {isDark ? 'text-purple-200/70' : 'text-logo-green'}">
        {$t.footer.tagline}
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <h4
        class="mb-1 text-xs font-bold tracking-wider uppercase {isDark
          ? 'text-purple-300'
          : 'text-logo-saffron'}"
      >
        {$t.footer.general}
      </h4>
      <a
        href="/signup"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.nav.signUp}
      </a>
      <a
        href="/login"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.nav.signIn}
      </a>
      <a
        href="/#how-it-works"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.footer.howItWorks}
      </a>
      <a
        href="/#who"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.footer.whoIsItFor}
      </a>
    </div>

    <div class="flex flex-col gap-2">
      <h4
        class="mb-1 text-xs font-bold tracking-wider uppercase {isDark
          ? 'text-purple-300'
          : 'text-logo-saffron'}"
      >
        {$t.footer.yourAccount}
      </h4>
      <a
        href="/profile"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.nav.myProfile}
      </a>
      <a
        href="/onboarding"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.footer.onboardingWizard}
      </a>
      <a
        href="/membership"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.nav.plans}
      </a>
    </div>

    <div class="flex flex-col gap-2">
      <h4
        class="mb-1 text-xs font-bold tracking-wider uppercase {isDark
          ? 'text-purple-300'
          : 'text-logo-saffron'}"
      >
        {$t.footer.legal}
      </h4>
      <a
        href="/#dpdp"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.footer.dpdpRights}
      </a>
      <a
        href="/#dpdp"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.footer.privacyPolicy}
      </a>
      <a
        href="/#dpdp"
        class="text-sm {isDark
          ? 'text-purple-100/75 hover:text-white'
          : 'text-logo-green/85 hover:text-logo-saffron'}"
      >
        {$t.footer.termsOfUse}
      </a>
    </div>
  </div>

  <div
    class="c47-container flex flex-wrap justify-between gap-3 pt-5 text-xs {isDark
      ? 'text-purple-200/50'
      : 'text-slate-500'}"
  >
    <span>{$t.footer.copyright}</span>
    <span>{$t.footer.builtFor}</span>
  </div>
</footer>
