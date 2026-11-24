<script lang="ts">
  import RoleDashboardShell from '$lib/components/dashboard/RoleDashboardShell.svelte';
  import {
    dashboardState,
    pushToast,
    updateAttestationStatus,
    type AttestationRequest,
  } from '$lib/stores';
  import { Badge, Button, Card, Icon } from '$ui';

  const pendingCount = $derived(
    $dashboardState.attestationQueue.filter((item) => item.status === 'pending').length,
  );
  const attestedCount = $derived(
    $dashboardState.attestationQueue.filter((item) => item.status === 'attested').length,
  );

  const statusTone: Record<AttestationRequest['status'], 'saffron' | 'moss' | 'ember'> = {
    pending: 'saffron',
    attested: 'moss',
    revision_requested: 'ember',
  };

  function handleDecision(
    req: AttestationRequest,
    decision: 'attested' | 'revision_requested',
  ): void {
    updateAttestationStatus(req.id, decision);
    pushToast({
      tone: decision === 'attested' ? 'success' : 'info',
      title: decision === 'attested' ? 'Deliverable attested' : 'Revision requested',
      message:
        decision === 'attested'
          ? `Verified proof-of-work badge granted to @${req.studentHandle}.`
          : `Sent revision notes back to @${req.studentHandle}.`,
    });
  }
</script>

<RoleDashboardShell role="faculty">
  {#snippet roleModules()}
    <Card
      title="Student Proof-of-Work Attestation Queue"
      subtitle="Verify campus capstone deliverables, lab experiments, and contributor attribution"
    >
      {#snippet headerActions()}
        <div class="flex items-center gap-2">
          <Badge tone="saffron">{pendingCount} Pending</Badge>
          <Badge tone="moss">{attestedCount} Attested</Badge>
        </div>
      {/snippet}

      <div class="flex flex-col gap-3">
        {#each $dashboardState.attestationQueue as req (req.id)}
          <div
            class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div class="flex flex-col gap-1">
              <div class="flex flex-wrap items-center gap-2">
                <strong class="text-sm text-slate-900">{req.studentName}</strong>
                <span class="text-xs font-medium text-logo-green">@{req.studentHandle}</span>
                <Badge tone={statusTone[req.status]}>{req.status.replace('_', ' ')}</Badge>
                <span class="text-xs text-slate-400">· {req.submittedLabel}</span>
              </div>
              <p class="text-sm font-semibold text-logo-saffron">{req.projectTitle}</p>
              <p class="text-xs text-slate-600">Deliverable: {req.deliverable}</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              {#if req.status !== 'attested'}
                <Button
                  variant="primary"
                  size="sm"
                  onclick={() => handleDecision(req, 'attested')}
                >
                  <Icon name="shield-check" size={15} />
                  <span>Attest Deliverable</span>
                </Button>
              {/if}
              {#if req.status === 'pending'}
                <Button
                  variant="outline"
                  size="sm"
                  onclick={() => handleDecision(req, 'revision_requested')}
                >
                  <Icon name="message-square" size={15} />
                  <span>Request Revision</span>
                </Button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </Card>
  {/snippet}

  {#snippet roleSidebar()}
    <Card title="Faculty Lab Summary" subtitle="Supervised cohorts & grants" color="indigo">
      <div class="flex flex-col gap-2.5 text-xs text-indigo-950">
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
          <span>Active Capstone Teams</span>
          <strong class="text-sm text-indigo-900">{$dashboardState.facultySummary.activeCapstoneTeams}</strong>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
          <span>Verified Deliverables Signed</span>
          <strong class="text-sm text-logo-green">
            {attestedCount || $dashboardState.facultySummary.verifiedDeliverablesSigned}
          </strong>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
          <span>Sponsored Industry Grants</span>
          <strong class="text-sm text-logo-saffron">
            {$dashboardState.facultySummary.sponsoredGrantsCount} Active
          </strong>
        </div>
      </div>
    </Card>
  {/snippet}
</RoleDashboardShell>
