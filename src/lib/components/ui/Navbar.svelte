<script lang="ts">
  import { signOut } from '@auth/sveltekit/client';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import {
    clearAuthSession,
    clearNotifications,
    clearProfileState,
    currentUser,
    isAuthenticated,
    isPrivateSidebarRoute,
    pushToast,
    setMobileSidebarOpen,
    t,
  } from '$lib/stores';
  import Avatar from './Avatar.svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import NotificationBell from './NotificationBell.svelte';
  import Wordmark from './Wordmark.svelte';

  let mobileOpen = $state(false);
  const isLandingPage = $derived($page.url.pathname === '/');
  const showSidebarToggle = $derived(
    $isAuthenticated && isPrivateSidebarRoute($page.url.pathname),
  );
  const userDashboardHref = $derived(
    $currentUser ? getDashboardPath($currentUser.accountType) : '/dashboard',
  );

  async function handleLogout(): Promise<void> {
    clearAuthSession();
    clearProfileState();
    clearNotifications();
    mobileOpen = false;
    try {
      await signOut({ redirect: false });
    } catch {
      // Ignore if user signed in via email/password without an Auth.js cookie
    }
    pushToast({ tone: 'info', title: 'Signed out', message: 'You have been signed out safely.' });
    await goto('/login');
  }
</script>

<header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
  <div class="flex h-17 w-full items-center justify-between gap-6 px-3 sm:px-4">
    <div class="flex items-center gap-2.5">
      {#if showSidebarToggle}
        <button
          type="button"
          onclick={() => setMobileSidebarOpen(true)}
          aria-label="Open workspace sidebar"
          class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-logo-saffron-border hover:bg-logo-saffron-soft hover:text-logo-saffron lg:hidden"
        >
          <Icon name="panel-left" size={18} />
        </button>
      {/if}
      <Wordmark size="md" href="/" />
    </div>

    <nav class="hidden items-center gap-6 md:flex" aria-label="Primary Navigation">
      <a
        href="/#how-it-works"
        class="text-sm font-semibold text-logo-saffron no-underline transition hover:text-logo-green hover:no-underline"
      >
        {$t.nav.about}
      </a>
      <a
        href="/#who"
        class="text-sm font-semibold text-logo-saffron no-underline transition hover:text-logo-green hover:no-underline"
      >
        {$t.nav.career}
      </a>
      <a
        href="/#benefits"
        class="text-sm font-semibold text-logo-saffron no-underline transition hover:text-logo-green hover:no-underline"
      >
        {$t.nav.events}
      </a>
    </nav>

    <div class="hidden items-center gap-2.5 md:flex">
      <LanguageSwitcher align="right" />
      {#if !isLandingPage}
        <NotificationBell />
      {/if}

      {#if $isAuthenticated && $currentUser}
        {#if isLandingPage}
          <Button variant="primary" size="sm" href={userDashboardHref}>
            <Avatar name={$currentUser.name} src={$currentUser.avatarUrl} size="sm" />
            <span>{$currentUser.name} · Continue</span>
            <Icon name="arrow-right" size={15} />
          </Button>
        {:else}
          <a
            href="/profile"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1 text-sm font-semibold text-slate-900 no-underline transition hover:border-brand hover:no-underline"
          >
            <Avatar name={$currentUser.name} src={$currentUser.avatarUrl} size="sm" />
            <span>@{$currentUser.handle}</span>
          </a>
        {/if}
        <Button variant="outline" size="sm" onclick={handleLogout}>
          <Icon name="log-out" size={15} />
          <span>{$t.nav.signOut}</span>
        </Button>
      {:else}
        <Button variant="outline" size="sm" href="/login">
          <Icon name="log-in" size={15} />
          <span>{$t.nav.signIn}</span>
        </Button>
        <Button variant="primary" size="sm" href="/signup">
          <Icon name="user-plus" size={15} />
          <span>{$t.nav.signUp}</span>
        </Button>
      {/if}
    </div>

    <div class="flex items-center gap-2 md:hidden">
      <LanguageSwitcher align="right" />
      {#if !isLandingPage}
        <NotificationBell />
      {/if}
      <button
        type="button"
        class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-900"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        onclick={() => (mobileOpen = !mobileOpen)}
      >
        <Icon name={mobileOpen ? 'x' : 'menu'} size={20} />
      </button>
    </div>
  </div>

  {#if mobileOpen}
    <div class="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 md:hidden">
      <a href="/#how-it-works" class="font-semibold text-logo-saffron" onclick={() => (mobileOpen = false)}>
        {$t.nav.about}
      </a>
      <a href="/#who" class="font-semibold text-logo-saffron" onclick={() => (mobileOpen = false)}>
        {$t.nav.career}
      </a>
      <a href="/#benefits" class="font-semibold text-logo-saffron" onclick={() => (mobileOpen = false)}>
        {$t.nav.events}
      </a>
      {#if $isAuthenticated && $currentUser}
        {#if isLandingPage}
          <Button
            variant="primary"
            fullWidth
            href={userDashboardHref}
            onclick={() => (mobileOpen = false)}
          >
            <span>{$currentUser.name} · Continue</span>
            <Icon name="arrow-right" size={15} />
          </Button>
        {/if}
        <Button variant="outline" fullWidth onclick={handleLogout}>{$t.nav.signOut}</Button>
      {:else}
        <div class="mt-1 grid grid-cols-2 gap-2.5">
          <Button variant="outline" fullWidth href="/login" onclick={() => (mobileOpen = false)}>
            {$t.nav.signIn}
          </Button>
          <Button variant="primary" fullWidth href="/signup" onclick={() => (mobileOpen = false)}>
            {$t.nav.signUp}
          </Button>
        </div>
      {/if}
    </div>
  {/if}
</header>
