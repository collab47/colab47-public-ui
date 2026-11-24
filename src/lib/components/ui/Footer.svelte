<script lang="ts">
  import { t } from '$lib/stores';
  import Wordmark from './Wordmark.svelte';
</script>

<footer class="mt-16 border-t border-slate-200 bg-white pt-12 pb-8">
  <div class="c47-container grid grid-cols-2 gap-8 border-b border-slate-200 pb-8 md:grid-cols-5">
    <div class="col-span-2">
      <Wordmark size="lg" href="/" />
      <p class="mt-3 max-w-xs text-sm font-medium text-logo-green">
        {$t.footer.tagline}
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <h4 class="mb-1 text-xs font-bold tracking-wider uppercase text-logo-saffron">
        {$t.footer.general}
      </h4>
      <a href="/signup" class="text-sm text-logo-green/85 hover:text-logo-saffron">{$t.nav.signUp}</a>
      <a href="/login" class="text-sm text-logo-green/85 hover:text-logo-saffron">{$t.nav.signIn}</a>
      <a href="/#how-it-works" class="text-sm text-logo-green/85 hover:text-logo-saffron">
        {$t.footer.howItWorks}
      </a>
      <a href="/#who" class="text-sm text-logo-green/85 hover:text-logo-saffron">
        {$t.footer.whoIsItFor}
      </a>
    </div>

    <div class="flex flex-col gap-2">
      <h4 class="mb-1 text-xs font-bold tracking-wider uppercase text-logo-saffron">
        {$t.footer.yourAccount}
      </h4>
      <a href="/profile" class="text-sm text-logo-green/85 hover:text-logo-saffron">
        {$t.nav.myProfile}
      </a>
      <a href="/onboarding" class="text-sm text-logo-green/85 hover:text-logo-saffron">
        {$t.footer.onboardingWizard}
      </a>
      <a href="/membership" class="text-sm text-logo-green/85 hover:text-logo-saffron">
        {$t.nav.plans}
      </a>
    </div>

    <div class="flex flex-col gap-2">
      <h4 class="mb-1 text-xs font-bold tracking-wider uppercase text-logo-saffron">
        {$t.footer.legal}
      </h4>
      <a href="/#dpdp" class="text-sm text-logo-green/85 hover:text-logo-saffron">
        {$t.footer.dpdpRights}
      </a>
      <a href="/#dpdp" class="text-sm text-logo-green/85 hover:text-logo-saffron">
        {$t.footer.privacyPolicy}
      </a>
      <a href="/#dpdp" class="text-sm text-logo-green/85 hover:text-logo-saffron">
        {$t.footer.termsOfUse}
      </a>
    </div>
  </div>

  <div class="c47-container flex flex-wrap justify-between gap-3 pt-5 text-xs text-slate-500">
    <span>{$t.footer.copyright}</span>
    <span>{$t.footer.builtFor}</span>
  </div>
</footer>
