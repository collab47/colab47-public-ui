<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ApiError } from '$lib/api/client';
  import {
    dashboardState,
    isAuthenticated,
    loadMyInvitations,
    loadNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    notificationState,
    pushToast,
    respondToProjectInvitation,
  } from '$lib/stores';
  import Icon from './Icon.svelte';

  let open = $state(false);
  let containerEl = $state<HTMLDivElement | null>(null);
  let respondingId = $state<string | null>(null);
  const isLandingPage = $derived($page.url.pathname === '/');

  const pendingInvitationMap = $derived(
    new Map(
      $dashboardState.incomingInvitations
        .filter((inv) => inv.status === 'pending')
        .map((inv) => [inv.id, inv]),
    ),
  );

  $effect(() => {
    if ($isAuthenticated && !isLandingPage) {
      void loadNotifications(20);
      void loadMyInvitations();
    }
  });

  function toggleDropdown(): void {
    open = !open;
    if (open && $isAuthenticated) {
      void loadNotifications(20);
      void loadMyInvitations();
    }
  }

  async function handleInvitationAction(
    invitationId: string,
    notificationId: string,
    action: 'accept' | 'reject',
  ): Promise<void> {
    respondingId = invitationId;
    try {
      const res = await respondToProjectInvitation(invitationId, action);
      await markNotificationRead(notificationId);
      await loadNotifications(20);
      pushToast({
        tone: action === 'accept' ? 'success' : 'info',
        title: action === 'accept' ? 'Joined project!' : 'Invitation rejected',
        message:
          action === 'accept'
            ? `You accepted the invite and joined "${res.projectTitle}".`
            : `You declined the invitation to "${res.projectTitle}".`,
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not respond to invitation',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      respondingId = null;
    }
  }

  async function handleNotificationClick(item: {
    id: string;
    targetType: string | null;
    targetId: string | null;
  }): Promise<void> {
    await markNotificationRead(item.id);
    if (item.targetType === 'project' && item.targetId) {
      open = false;
      await goto(`/projects/${item.targetId}`);
    }
  }

  onMount(() => {
    const handleOutside = (event: MouseEvent): void => {
      if (open && containerEl && !containerEl.contains(event.target as Node)) {
        open = false;
      }
    };
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && open) {
        open = false;
      }
    };
    document.addEventListener('click', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  });
</script>

{#if $isAuthenticated && !isLandingPage}
  <div class="relative inline-block" bind:this={containerEl}>
    <button
      type="button"
      class="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-logo-saffron-border bg-logo-saffron-soft text-logo-saffron transition hover:border-logo-saffron hover:bg-logo-saffron hover:text-white"
      onclick={toggleDropdown}
      aria-label="Notifications ({$notificationState.unreadCount} unread)"
      aria-expanded={open}
      title="Notifications"
    >
      <Icon name="bell" size={18} />
      {#if $notificationState.unreadCount > 0}
        <span
          class="absolute -top-1 -right-1 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-logo-green px-1 text-[10px] font-extrabold text-white shadow-xs"
        >
          {$notificationState.unreadCount > 9 ? '9+' : $notificationState.unreadCount}
        </span>
      {/if}
    </button>

    {#if open}
      <div
        class="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96"
      >
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <strong class="text-sm font-bold text-logo-saffron">Notifications</strong>
            <span class="ml-1.5 text-xs font-medium text-logo-green">
              ({$notificationState.unreadCount} unread)
            </span>
          </div>
          {#if $notificationState.unreadCount > 0}
            <button
              type="button"
              class="cursor-pointer text-xs font-semibold text-logo-green transition hover:text-logo-saffron"
              onclick={() => void markAllNotificationsRead()}
            >
              Mark all read
            </button>
          {/if}
        </div>

        <div class="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {#if $notificationState.items.length === 0}
            <div class="px-4 py-8 text-center text-xs text-slate-500">
              No notifications yet. Activity from sign-ins, profile updates, project invitations, and
              payments will appear here.
            </div>
          {:else}
            {#each $notificationState.items as item (item.id)}
              {@const pendingInvite =
                item.type === 'project_invitation' && item.targetId
                  ? pendingInvitationMap.get(item.targetId)
                  : undefined}
              <div
                class="flex w-full flex-col items-start gap-1.5 px-4 py-3 text-left transition hover:bg-slate-50 {item.isRead
                  ? 'bg-white'
                  : 'bg-logo-saffron-soft/35'}"
              >
                <button
                  type="button"
                  onclick={() => void handleNotificationClick(item)}
                  class="flex w-full cursor-pointer flex-col items-start gap-1 text-left"
                >
                  <div class="flex w-full items-center justify-between gap-2">
                    <strong class="text-xs font-bold text-slate-900">{item.title}</strong>
                    {#if !item.isRead}
                      <span class="h-2 w-2 shrink-0 rounded-full bg-logo-saffron"></span>
                    {/if}
                  </div>
                  {#if item.body}
                    <p class="text-xs leading-relaxed text-slate-600">{item.body}</p>
                  {/if}
                </button>

                {#if pendingInvite}
                  <div class="mt-1 flex w-full items-center gap-2">
                    <button
                      type="button"
                      disabled={respondingId === pendingInvite.id}
                      onclick={() =>
                        void handleInvitationAction(pendingInvite.id, item.id, 'accept')}
                      class="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-logo-green px-2.5 py-1 text-[11px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                    >
                      <Icon name="check" size={12} />
                      <span>Accept</span>
                    </button>
                    <button
                      type="button"
                      disabled={respondingId === pendingInvite.id}
                      onclick={() =>
                        void handleInvitationAction(pendingInvite.id, item.id, 'reject')}
                      class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                    >
                      <Icon name="x" size={12} />
                      <span>Reject</span>
                    </button>
                  </div>
                {/if}

                <span class="text-[11px] text-slate-400">
                  {new Date(item.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}
