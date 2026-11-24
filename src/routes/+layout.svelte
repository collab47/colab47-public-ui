<script lang="ts">
  import '$lib/styles/tokens.css';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ensureFreshSession } from '$lib/api/client';
  import DashboardSidebar from '$lib/components/dashboard/DashboardSidebar.svelte';
  import {
    authState,
    clearLiveDashboardState,
    clearUserProjectsState,
    countryCodeToFlag,
    detectUserLocation,
    geoState,
    hydrateAuth,
    hydrateLocale,
    hydrateSidebar,
    initPwa,
    isAuthenticated,
    isPrivateSidebarRoute,
    locale,
    pushToast,
    setAuthSession,
  } from '$lib/stores';
  import { Navbar, PwaInstallPrompt, ToastContainer } from '$ui';
  import type { LayoutData } from './$types';

  interface Props {
    data: LayoutData;
    children?: Snippet;
  }

  let { data, children }: Props = $props();
  let lastSyncedToken = $state<string | null>(null);
  let lastUserId = $state<string | null>(null);

  const isAuthSplitRoute = $derived(
    $page.url.pathname === '/login' ||
      $page.url.pathname === '/signup' ||
      $page.url.pathname === '/forgot-password' ||
      $page.url.pathname === '/reset-password',
  );
  const showPrivateSidebar = $derived(
    $isAuthenticated && isPrivateSidebarRoute($page.url.pathname),
  );
  const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

  onMount(() => {
    hydrateAuth();
    hydrateLocale();
    hydrateSidebar();
    initPwa();
    void ensureFreshSession();
    void detectUserLocation();
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = $locale;
    }
  });

  $effect(() => {
    const currentUserId = $authState.user?.id ?? null;
    if (currentUserId !== lastUserId) {
      lastUserId = currentUserId;
      clearUserProjectsState();
      clearLiveDashboardState();
      if (currentUserId) {
        void detectUserLocation();
      }
    }
  });

  $effect(() => {
    const session = data.session;
    if (!session) return;

    if (session.backendSyncError) {
      pushToast({
        tone: 'error',
        title: 'Google sign-in error',
        message: session.backendSyncError,
      });
      return;
    }

    if (
      session.backendUser &&
      session.backendTokens &&
      session.backendTokens.accessToken !== lastSyncedToken
    ) {
      lastSyncedToken = session.backendTokens.accessToken;
      const alreadyHasSameToken =
        authState.get().accessToken === session.backendTokens.accessToken;
      if (!alreadyHasSameToken) {
        setAuthSession(session.backendUser, session.backendTokens);
        if (session.accountRestored) {
          pushToast({
            tone: 'success',
            title: 'Account Restored',
            message: 'Welcome back! Your account and portfolio have been restored.',
          });
        }
        if (
          session.isNewUser &&
          $page.url.pathname !== '/signup/plan' &&
          $page.url.pathname !== '/onboarding'
        ) {
          void goto('/signup/plan');
        }
      }
    }
  });
</script>

<svelte:head>
  {@html webManifestLink}
</svelte:head>

<div class="c47-app">
  <a href="#main-content" class="c47-skip-link">Skip to main content</a>
  {#if $geoState.hasDetected && !$geoState.isAllowed}
    <main
      id="main-content"
      class="flex min-h-screen w-full items-center justify-center bg-[#F5F6FB] p-6"
    >
      <div class="max-w-md rounded-2xl border border-[#E8EAF6] bg-white p-8 text-center shadow-xl">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F1FF] text-3xl">
          {countryCodeToFlag($geoState.countryCode)}
        </div>
        <h1 class="text-xl font-extrabold text-[#1E1B4B]">Region Not Available</h1>
        <p class="mt-2 text-sm leading-relaxed text-slate-600">
          {$geoState.blockedReason ?? 'Collab47 is currently not available in your detected country.'}
        </p>
      </div>
    </main>
  {:else}
    {#if !isAuthSplitRoute}
      <Navbar />
    {/if}
    {#if showPrivateSidebar}
      <div class="flex w-full flex-1">
        <DashboardSidebar />
        <div id="main-content" tabindex="-1" class="flex min-w-0 flex-1 flex-col outline-none">
          {@render children?.()}
        </div>
      </div>
    {:else}
      <div id="main-content" tabindex="-1" class="flex min-w-0 flex-1 flex-col outline-none">
        {@render children?.()}
      </div>
    {/if}
  {/if}
  <PwaInstallPrompt />
  <ToastContainer />
</div>

<style>
  .c47-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--c47-paper);
  }
</style>
