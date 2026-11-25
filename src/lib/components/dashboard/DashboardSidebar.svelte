<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { AccountType } from '$lib/api/types';
  import {
    ROLE_DASHBOARD_MAP,
    getDashboardPath,
    resolveDashboardTranslationKey,
  } from '$lib/dashboards/role-dashboards';
  import {
    authState,
    dashboardState,
    liveDashboardState,
    profileState,
    setDashboardActiveTab,
    setMobileSidebarOpen,
    sidebarState,
    t,
    toggleSidebarCollapsed,
  } from '$lib/stores';
  import { Avatar, Icon, type IconName } from '$ui';

  const activeUser = $derived($profileState.profile ?? $authState.user);
  const userAccountRole = $derived<AccountType>(activeUser?.accountType ?? 'student');
  const userRoleDef = $derived(ROLE_DASHBOARD_MAP[userAccountRole] ?? ROLE_DASHBOARD_MAP.student);
  const userRoleCopy = $derived(
    $t.dashboard.roles[resolveDashboardTranslationKey(userAccountRole)],
  );
  const userDashboardHref = $derived(getDashboardPath(userAccountRole));
  const membershipTier = $derived<'free' | 'premium'>($authState.user?.membershipTier ?? 'free');
  const completeness = $derived($profileState.profile?.completenessPercent ?? 30);
  const pathname = $derived($page.url.pathname);
  const isOnMyDashboard = $derived(
    pathname === userDashboardHref || pathname === '/dashboard',
  );
  const collapsed = $derived($sidebarState.collapsed);
  const mobileOpen = $derived($sidebarState.mobileOpen);
  const activeTab = $derived($sidebarState.activeTab);
  let projectsMenuOpen = $state(true);

  const isMyProjectsPage = $derived(pathname === '/projects');
  const isAddProjectPage = $derived(pathname === '/projects/new');
  const isProjectsSectionActive = $derived(
    pathname === '/projects' || pathname.startsWith('/projects/'),
  );

  const roleFeedNavItems = $derived<Array<{ id: string; label: string; icon: IconName; count?: number }>>([
    {
      id: 'all',
      label: $t.nav.dashboard,
      icon: 'layout-dashboard',
    },
    {
      id: 'posts',
      label: 'Feed',
      icon: 'message-square',
      count: $liveDashboardState.feed.length,
    },
    {
      id: 'saved',
      label: 'Bookmarks & Saved',
      icon: 'bookmark',
      count: $liveDashboardState.feed.filter((p) => p.isBookmarked).length,
    },
    {
      id: 'opportunities',
      label: $t.dashboard.opportunities,
      icon: 'briefcase',
      count:
        $dashboardState.opportunities.filter((o) => o.targetRoles.includes(userAccountRole)).length ||
        $dashboardState.opportunities.length,
    },
  ]);

  const workspaceLinks = $derived<
    Array<{ href: string; label: string; icon: IconName; pill?: string }>
  >([
    { href: '/profile', label: $t.nav.myProfile, icon: 'user' },
    ...(activeUser
      ? [
          {
            href: `/u/${activeUser.handle}`,
            label: $t.sidebar.publicPortfolio,
            icon: 'external-link' as IconName,
          },
        ]
      : []),
    { href: '/onboarding', label: $t.sidebar.onboardingSkills, icon: 'sparkles' },
    {
      href: '/membership',
      label: $t.sidebar.membershipPlans,
      icon: 'award',
      pill: membershipTier === 'premium' ? 'PRO' : 'FREE',
    },
  ]);

  async function handleFeedNavClick(tabId: string): Promise<void> {
    setDashboardActiveTab(tabId);
    setMobileSidebarOpen(false);
    if (!isOnMyDashboard) {
      await goto(userDashboardHref);
      return;
    }
    if (tabId !== 'all') {
      document.getElementById('workspace-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
</script>

{#if activeUser}
  <!-- Extreme-Left Collapsible / Expandable Sidebar (student-dashboard.png Violet/Lavender Palette, Strictly Role-Based) -->
  <aside
    aria-label={$t.sidebar.navigation}
    class="sticky top-[69px] z-30 hidden h-[calc(100vh-69px)] shrink-0 flex-col border-r border-[#E8EAF6] bg-white shadow-[1px_0_12px_rgba(30,27,75,0.03)] transition-[width] duration-250 ease-out lg:flex {collapsed
      ? 'w-[72px]'
      : 'w-[244px]'}"
  >
    <!-- Edge Collapse / Expand Toggle -->
    <button
      type="button"
      onclick={toggleSidebarCollapsed}
      title={collapsed ? $t.sidebar.expand : $t.sidebar.collapse}
      aria-label={collapsed ? $t.sidebar.expand : $t.sidebar.collapse}
      aria-expanded={!collapsed}
      class="absolute top-6 -right-3.5 z-40 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#E2E5F5] bg-white text-[#5B3DF5] shadow-sm transition hover:border-[#6D4AFF] hover:bg-[#6D4AFF] hover:text-white"
    >
      <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={15} />
    </button>

    <!-- User Profile Identity Header (matches top-left of student-dashboard.png) -->
    <a
      href="/profile"
      title={collapsed ? `${activeUser.name} · ${userRoleCopy.shortLabel}` : undefined}
      class="flex shrink-0 items-center border-b border-[#F1F2FA] px-3 py-3.5 no-underline transition hover:bg-[#F8F7FF] hover:no-underline {collapsed
        ? 'justify-center'
        : 'gap-2.5'}"
    >
      <Avatar name={activeUser.name} src={activeUser.avatarUrl} size="md" />
      {#if !collapsed}
        <div class="min-w-0 flex-1">
          <strong class="block truncate text-sm font-bold text-[#1E1B4B]">{activeUser.name}</strong>
          <span class="block truncate text-xs font-medium text-slate-500">
            {userRoleCopy.shortLabel}
          </span>
        </div>
        <Icon name="chevron-right" size={15} class="shrink-0 text-slate-400" />
      {/if}
    </a>

    <!-- Primary Purple Gradient CTA Link (+ Add Project -> /projects/new) -->
    <div class="shrink-0 px-3 pt-3 pb-2">
      <a
        href="/projects/new"
        onclick={() => setMobileSidebarOpen(false)}
        title={$t.dashboard.addProject}
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-3 py-2.5 text-xs font-bold text-white no-underline shadow-[0_6px_16px_rgba(109,74,255,0.28)] transition hover:brightness-105 hover:no-underline"
      >
        <Icon name="plus" size={16} />
        {#if !collapsed}
          <span class="truncate">{$t.dashboard.addProject}</span>
        {/if}
      </a>
    </div>

    <!-- Scrollable Role-Filtered Navigation -->
    <nav class="flex flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-2.5 py-2">
      <div class="flex flex-col gap-0.5">
        {#each roleFeedNavItems as item (item.id)}
          {@const active = isOnMyDashboard && activeTab === item.id}
          <button
            type="button"
            onclick={() => handleFeedNavClick(item.id)}
            title={collapsed ? item.label : undefined}
            class="flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-[13px] font-semibold transition {collapsed
              ? 'justify-center'
              : 'justify-between gap-2'} {active
              ? 'bg-[#F1EEFF] text-[#6D4AFF]'
              : 'text-slate-600 hover:bg-[#F7F6FE] hover:text-[#1E1B4B]'}"
          >
            <span class="flex items-center gap-2.5 truncate">
              <Icon
                name={item.icon}
                size={17}
                class={active ? 'text-[#6D4AFF]' : 'text-slate-400'}
              />
              {#if !collapsed}
                <span class="truncate">{item.label}</span>
              {/if}
            </span>
            {#if !collapsed && typeof item.count === 'number'}
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-bold {active
                  ? 'bg-[#6D4AFF]/15 text-[#6D4AFF]'
                  : 'bg-slate-100 text-slate-500'}"
              >
                {item.count}
              </span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Projects Submenu Section (My Projects + Add Project) -->
      <div class="flex flex-col gap-0.5 border-t border-[#F1F2FA] pt-3">
        {#if !collapsed}
          <button
            type="button"
            onclick={() => (projectsMenuOpen = !projectsMenuOpen)}
            aria-expanded={projectsMenuOpen}
            class="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-1.5 text-[11px] font-bold transition {isProjectsSectionActive
              ? 'text-[#6D4AFF]'
              : 'text-[#1E1B4B] hover:bg-[#F7F6FE]'}"
          >
            <span class="flex items-center gap-2">
              <Icon name="folder-open" size={14} class={isProjectsSectionActive ? 'text-[#6D4AFF]' : 'text-slate-400'} />
              <span>{$t.dashboard.projects}</span>
            </span>
            <Icon
              name="chevron-right"
              size={13}
              class="text-slate-400 transition-transform duration-150 {projectsMenuOpen ? 'rotate-90' : ''}"
            />
          </button>

          {#if projectsMenuOpen}
            <div class="mt-0.5 flex flex-col gap-0.5 pl-2">
              <a
                href="/projects"
                class="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold no-underline transition hover:no-underline {isMyProjectsPage
                  ? 'bg-[#F1EEFF] text-[#6D4AFF]'
                  : 'text-slate-600 hover:bg-[#F7F6FE] hover:text-[#1E1B4B]'}"
              >
                <span class="flex items-center gap-2.5 truncate">
                  <Icon
                    name="layers"
                    size={15}
                    class={isMyProjectsPage ? 'text-[#6D4AFF]' : 'text-slate-400'}
                  />
                  <span class="truncate">{$t.ui.myProjects}</span>
                </span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold {isMyProjectsPage
                    ? 'bg-[#6D4AFF]/15 text-[#6D4AFF]'
                    : 'bg-slate-100 text-slate-500'}"
                >
                  {$dashboardState.projects.length}
                </span>
              </a>

              <a
                href="/projects/new"
                class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold no-underline transition hover:no-underline {isAddProjectPage
                  ? 'bg-[#F1EEFF] text-[#6D4AFF]'
                  : 'text-slate-600 hover:bg-[#F7F6FE] hover:text-[#1E1B4B]'}"
              >
                <Icon
                  name="plus"
                  size={15}
                  class={isAddProjectPage ? 'text-[#6D4AFF]' : 'text-slate-400'}
                />
                <span class="truncate">{$t.dashboard.addProject}</span>
              </a>
            </div>
          {/if}
        {:else}
          <a
            href="/projects"
            title={$t.ui.myProjects}
            class="flex items-center justify-center rounded-xl px-3 py-2.5 no-underline transition hover:no-underline {isMyProjectsPage
              ? 'bg-[#F1EEFF] text-[#6D4AFF]'
              : 'text-slate-600 hover:bg-[#F7F6FE] hover:text-[#1E1B4B]'}"
          >
            <Icon name="folder-open" size={17} class={isMyProjectsPage ? 'text-[#6D4AFF]' : 'text-slate-400'} />
          </a>
          <a
            href="/projects/new"
            title={$t.dashboard.addProject}
            class="flex items-center justify-center rounded-xl px-3 py-2.5 no-underline transition hover:no-underline {isAddProjectPage
              ? 'bg-[#F1EEFF] text-[#6D4AFF]'
              : 'text-slate-600 hover:bg-[#F7F6FE] hover:text-[#1E1B4B]'}"
          >
            <Icon name="plus" size={17} class={isAddProjectPage ? 'text-[#6D4AFF]' : 'text-slate-400'} />
          </a>
        {/if}
      </div>

      <!-- My Workspace Section -->
      <div class="flex flex-col gap-0.5 border-t border-[#F1F2FA] pt-3">
        {#if !collapsed}
          <span class="px-3 pb-1.5 text-[11px] font-bold text-[#1E1B4B]">
            My Workspace
          </span>
        {/if}
        {#each workspaceLinks as link (link.href)}
          {@const isCurrentPage = pathname === link.href || pathname.startsWith(`${link.href}/`)}
          <a
            href={link.href}
            title={collapsed ? link.label : undefined}
            class="flex items-center rounded-xl px-3 py-2 text-[13px] font-semibold no-underline transition hover:no-underline {collapsed
              ? 'justify-center'
              : 'justify-between gap-2'} {isCurrentPage
              ? 'bg-[#F1EEFF] text-[#6D4AFF]'
              : 'text-slate-600 hover:bg-[#F7F6FE] hover:text-[#1E1B4B]'}"
          >
            <span class="flex items-center gap-2.5 truncate">
              <Icon
                name={link.icon}
                size={17}
                class={isCurrentPage ? 'text-[#6D4AFF]' : 'text-slate-400'}
              />
              {#if !collapsed}
                <span class="truncate">{link.label}</span>
              {/if}
            </span>
            {#if !collapsed && link.pill}
              <span
                class="rounded-full px-2 py-0.5 text-[9px] font-extrabold {link.pill === 'PRO'
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white'
                  : 'bg-[#F1EEFF] text-[#6D4AFF]'}"
              >
                {link.pill}
              </span>
            {/if}
          </a>
        {/each}
      </div>
    </nav>

    <!-- Bottom Profile Strength Card (matches bottom-left of student-dashboard.png) -->
    {#if !collapsed}
      <div class="shrink-0 p-3">
        <div class="rounded-2xl border border-[#E8EAF6] bg-[#FAF9FF] p-3">
          <div class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-1.5 text-xs font-bold text-[#1E1B4B]">
              <Icon name="award" size={15} class="text-amber-500" />
              <span>Profile Strength</span>
            </span>
            <strong class="text-xs font-extrabold text-[#6D4AFF]">{completeness}%</strong>
          </div>
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E5E3F8]">
            <div
              class="dash-progress-shimmer h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#A855F7] transition-all duration-500"
              style="width: {Math.min(100, Math.max(8, completeness))}%;"
            ></div>
          </div>
          <p class="mt-2 text-[11px] leading-snug text-slate-500">
            Complete your profile to get better opportunities
          </p>
          <a
            href="/profile"
            class="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl border border-[#DDD7FE] bg-[#F3F0FF] px-3 py-1.5 text-xs font-bold text-[#5B3DF5] no-underline transition hover:bg-[#E8E2FF] hover:no-underline"
          >
            <span>Improve Profile</span>
            <Icon name="arrow-right" size={13} />
          </a>
        </div>
      </div>
    {:else}
      <div class="shrink-0 border-t border-[#F1F2FA] p-2.5">
        <a
          href="/profile"
          title="Profile Strength: {completeness}%"
          class="flex h-10 w-full items-center justify-center rounded-xl bg-[#F1EEFF] text-[11px] font-extrabold text-[#6D4AFF] no-underline"
        >
          {completeness}%
        </a>
      </div>
    {/if}
  </aside>

  <!-- Mobile Slide-Over Sidebar Drawer -->
  {#if mobileOpen}
    <div
      class="fixed inset-0 z-50 flex lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={$t.sidebar.workspaceMenu}
    >
      <button
        type="button"
        aria-label={$t.sidebar.collapse}
        class="fixed inset-0 border-0 bg-[#1E1B4B]/50 backdrop-blur-xs"
        onclick={() => setMobileSidebarOpen(false)}
      ></button>

      <div class="relative z-10 flex h-full w-[275px] max-w-[85vw] flex-col border-r border-[#E8EAF6] bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#F1F2FA] px-4 py-3.5">
          <div class="flex items-center gap-2.5">
            <Avatar name={activeUser.name} src={activeUser.avatarUrl} size="sm" />
            <div class="min-w-0">
              <strong class="block truncate text-sm font-bold text-[#1E1B4B]">{activeUser.name}</strong>
              <span class="block truncate text-[11px] text-slate-500">{userRoleCopy.shortLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onclick={() => setMobileSidebarOpen(false)}
            aria-label="Close"
            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-[#6D4AFF]"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
          <a
            href="/projects/new"
            onclick={() => setMobileSidebarOpen(false)}
            class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-3 py-2.5 text-xs font-bold text-white no-underline shadow-sm hover:no-underline"
          >
            <Icon name="plus" size={15} />
            <span>{$t.dashboard.addProject}</span>
          </a>

          <div class="flex flex-col gap-1">
            {#each roleFeedNavItems as item (item.id)}
              {@const active = isOnMyDashboard && activeTab === item.id}
              <button
                type="button"
                onclick={() => handleFeedNavClick(item.id)}
                class="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold {active
                  ? 'bg-[#F1EEFF] text-[#6D4AFF]'
                  : 'text-slate-700 hover:bg-[#F7F6FE]'}"
              >
                <span class="flex items-center gap-2.5">
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </span>
                {#if typeof item.count === 'number'}
                  <span class="rounded-full bg-[#6D4AFF]/10 px-2 py-0.5 text-[10px] font-bold text-[#6D4AFF]">
                    {item.count}
                  </span>
                {/if}
              </button>
            {/each}
          </div>

          <!-- Mobile Projects Links (My Projects + Add Project) -->
          <div class="flex flex-col gap-1 border-t border-[#F1F2FA] pt-3">
            <span class="px-2 pb-1 text-[11px] font-bold text-[#1E1B4B]">{$t.dashboard.projects}</span>
            <a
              href="/projects"
              onclick={() => setMobileSidebarOpen(false)}
              class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold no-underline {isMyProjectsPage
                ? 'bg-[#F1EEFF] text-[#6D4AFF]'
                : 'text-slate-600 hover:bg-[#F7F6FE]'}"
            >
              <span class="flex items-center gap-2.5">
                <Icon name="layers" size={15} />
                <span>{$t.ui.myProjects}</span>
              </span>
              <span class="rounded-full bg-[#6D4AFF]/10 px-2 py-0.5 text-[10px] font-bold text-[#6D4AFF]">
                {$dashboardState.projects.length}
              </span>
            </a>
            <a
              href="/projects/new"
              onclick={() => setMobileSidebarOpen(false)}
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold no-underline {isAddProjectPage
                ? 'bg-[#F1EEFF] text-[#6D4AFF]'
                : 'text-slate-600 hover:bg-[#F7F6FE]'}"
            >
              <Icon name="plus" size={15} />
              <span>{$t.dashboard.addProject}</span>
            </a>
          </div>

          <div class="flex flex-col gap-1 border-t border-[#F1F2FA] pt-3">
            <span class="px-2 pb-1 text-[11px] font-bold text-[#1E1B4B]">My Workspace</span>
            {#each workspaceLinks as link (link.href)}
              {@const isCurrentPage = pathname === link.href || pathname.startsWith(`${link.href}/`)}
              <a
                href={link.href}
                onclick={() => setMobileSidebarOpen(false)}
                class="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold no-underline {isCurrentPage
                  ? 'bg-[#F1EEFF] text-[#6D4AFF]'
                  : 'text-slate-600 hover:bg-[#F7F6FE]'}"
              >
                <span class="flex items-center gap-2.5">
                  <Icon name={link.icon} size={16} />
                  <span>{link.label}</span>
                </span>
                {#if link.pill}
                  <span class="rounded-full bg-[#F1EEFF] px-2 py-0.5 text-[9px] font-extrabold text-[#6D4AFF]">
                    {link.pill}
                  </span>
                {/if}
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}
