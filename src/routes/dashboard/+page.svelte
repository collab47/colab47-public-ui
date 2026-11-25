<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ensureFreshSession } from '$lib/api/client';
  import {
    EXTERNAL_DASHBOARD_ROLES,
    ROLE_DASHBOARD_MAP,
    getDashboardPath,
  } from '$lib/dashboards/role-dashboards';
  import { authState, isAuthenticated, loadMyProfile, profileState, t } from '$lib/stores';
  import { Badge, Button, Card, Footer, Icon, Spinner } from '$ui';

  let resolving = $state(true);

  onMount(async () => {
    const hasSession = await ensureFreshSession();
    if (!hasSession) {
      await goto('/login?next=/dashboard', { replaceState: true });
      return;
    }

    const currentUser = authState.get().user;
    if (currentUser?.accountType) {
      await goto(getDashboardPath(currentUser.accountType), { replaceState: true });
      return;
    }

    await loadMyProfile();
    const resolvedRole =
      profileState.get().profile?.accountType ?? authState.get().user?.accountType ?? 'student';
    await goto(getDashboardPath(resolvedRole), { replaceState: true });
    resolving = false;
  });
</script>

<svelte:head>
  <title>Role Dashboards · Collab47</title>
</svelte:head>

<main class="c47-container flex-1 py-12">
  {#if resolving}
    <div class="flex min-h-[55vh] items-center justify-center">
      <Spinner label={$t.ui.loadingDashboard} size="lg" />
    </div>
  {:else if $isAuthenticated}
    <div class="flex flex-col gap-6">
      <div>
        <Badge tone="saffron">{$t.dashboard.externalWorkspacesLabel}</Badge>
        <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-logo-saffron">
          {$t.dashboard.chooseWorkspaceTitle}
        </h1>
        <p class="mt-1 text-sm font-medium text-logo-green">
          Dedicated dashboards for all 8 public roles (excluding private staff &amp; corporate operations roles).
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each EXTERNAL_DASHBOARD_ROLES as role (role)}
          {@const def = ROLE_DASHBOARD_MAP[role]}
          <Card padding="md" class="hover:border-logo-saffron-border hover:shadow-md">
            <div class="flex h-full flex-col justify-between gap-4">
              <div class="flex flex-col gap-2">
                <Badge tone="moss">
                  <Icon name={def.icon} size={13} />
                  <span>{def.badgeLabel}</span>
                </Badge>
                <h2 class="text-lg font-bold text-logo-saffron">{def.title}</h2>
                <p class="text-sm text-logo-green/85">{def.subtitle}</p>
              </div>
              <Button variant="primary" size="sm" href={def.href} fullWidth>
                <span>Open {def.shortLabel} Dashboard</span>
                <Icon name="arrow-right" size={15} />
              </Button>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  {/if}
</main>

<Footer />
