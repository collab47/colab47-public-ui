<script lang="ts">
  import RoleDashboardShell from '$lib/components/dashboard/RoleDashboardShell.svelte';
  import {
    dashboardState,
    pushToast,
    updateMentorshipStatus,
    type MentorshipRequest,
  } from '$lib/stores';
  import { Badge, Button, Card, Icon } from '$ui';

  const pendingCount = $derived(
    $dashboardState.mentorshipRequests.filter((r) => r.status === 'pending').length,
  );
  const scheduledCount = $derived(
    $dashboardState.mentorshipRequests.filter(
      (r) => r.status === 'accepted' || r.status === 'scheduled',
    ).length,
  );

  const statusTone: Record<MentorshipRequest['status'], 'saffron' | 'moss' | 'neutral'> = {
    pending: 'saffron',
    accepted: 'moss',
    scheduled: 'moss',
    completed: 'neutral',
  };

  function handleAction(
    req: MentorshipRequest,
    nextStatus: MentorshipRequest['status'],
  ): void {
    updateMentorshipStatus(req.id, nextStatus);
    const messages: Record<MentorshipRequest['status'], string> = {
      pending: 'Moved back to pending.',
      accepted: `Accepted mentorship request from ${req.teamName}.`,
      scheduled: `Scheduled technical review session with ${req.teamName}.`,
      completed: `Marked review for ${req.projectTitle} as completed.`,
    };
    pushToast({
      tone: 'success',
      title: `Mentorship ${nextStatus}`,
      message: messages[nextStatus],
    });
  }
</script>

<RoleDashboardShell role="mentor">
  {#snippet roleModules()}
    <Card
      title="Prototype Review & Mentorship Requests"
      subtitle="Guide student and startup teams through architecture, hardware, and validation reviews"
    >
      {#snippet headerActions()}
        <div class="flex items-center gap-2">
          <Badge tone="saffron">{pendingCount} Pending</Badge>
          <Badge tone="moss">{scheduledCount} Active</Badge>
        </div>
      {/snippet}

      <div class="flex flex-col gap-3">
        {#each $dashboardState.mentorshipRequests as req (req.id)}
          <div
            class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div class="flex max-w-2xl flex-col gap-1">
              <div class="flex flex-wrap items-center gap-2">
                <strong class="text-sm text-slate-900">{req.teamName}</strong>
                <span class="text-xs font-medium text-logo-green">@{req.leadHandle}</span>
                <Badge tone="neutral">{req.domain}</Badge>
                <Badge tone={statusTone[req.status]}>{req.status}</Badge>
              </div>
              <p class="text-sm font-semibold text-logo-saffron">{req.projectTitle}</p>
              <p class="text-xs text-slate-600">{req.topic}</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              {#if req.status === 'pending'}
                <Button variant="primary" size="sm" onclick={() => handleAction(req, 'accepted')}>
                  <Icon name="check" size={15} />
                  <span>Accept</span>
                </Button>
                <Button variant="outline" size="sm" onclick={() => handleAction(req, 'scheduled')}>
                  <Icon name="calendar" size={15} />
                  <span>Schedule Review</span>
                </Button>
              {:else if req.status === 'accepted' || req.status === 'scheduled'}
                <Button variant="primary" size="sm" onclick={() => handleAction(req, 'completed')}>
                  <Icon name="check-circle" size={15} />
                  <span>Mark Reviewed</span>
                </Button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </Card>
  {/snippet}

  {#snippet roleSidebar()}
    <Card title="Advisor Office Hours" subtitle="Upcoming mentorship & review sessions" color="rose">
      <div class="flex flex-col gap-2.5 text-xs text-rose-950">
        {#if $dashboardState.advisorSlots.length === 0}
          <p class="rounded-lg bg-white/80 px-3 py-2 text-slate-600">
            No upcoming review sessions scheduled yet.
          </p>
        {:else}
          {#each $dashboardState.advisorSlots as slot (slot.id)}
            <div class="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2">
              <span class="inline-flex min-w-0 items-center gap-1.5 font-medium">
                <Icon name="calendar" size={14} class="shrink-0 text-logo-saffron" />
                <span class="truncate">{slot.label}</span>
              </span>
              <Badge tone="moss">{slot.badge}</Badge>
            </div>
          {/each}
        {/if}
      </div>
    </Card>
  {/snippet}
</RoleDashboardShell>
