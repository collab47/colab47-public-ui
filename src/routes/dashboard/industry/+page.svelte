<script lang="ts">
  import { onMount } from 'svelte';
  import { ApiError } from '$lib/api/client';
  import { projectsApi } from '$lib/api/projects.api';
  import RoleDashboardShell from '$lib/components/dashboard/RoleDashboardShell.svelte';
  import {
    addDashboardOpportunity,
    dashboardState,
    pushToast,
    t,
    toggleShortlistCandidate,
  } from '$lib/stores';
  import { Avatar, Badge, Button, Card, Icon, Input, Select } from '$ui';

  let showChallengeForm = $state(false);
  let challengeTitle = $state('');
  let organization = $state('');
  let sector = $state('');
  let compensation = $state('');
  let workMode = $state('Hybrid');
  let isSubmitting = $state(false);
  let sectorOptions = $state<Array<{ value: string; label: string }>>([]);

  const workModeOptions = [
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Remote', label: 'Remote' },
    { value: 'On-Site', label: 'On-Site' },
  ];

  onMount(async () => {
    try {
      const opts = await projectsApi.getOptions();
      sectorOptions = opts.sectors.map((s) => ({ value: s.label, label: s.label }));
      if (!sector && sectorOptions[0]) {
        sector = sectorOptions[0].value;
      }
    } catch {
      // Options load on retry when backend is available
    }
  });

  const shortlistedCount = $derived(
    $dashboardState.talentCandidates.filter((c) => c.shortlisted).length,
  );

  function handleToggleShortlist(id: string, name: string, currentlyShortlisted: boolean): void {
    toggleShortlistCandidate(id);
    pushToast({
      tone: currentlyShortlisted ? 'info' : 'success',
      title: currentlyShortlisted ? 'Removed from shortlist' : 'Builder shortlisted',
      message: `${name} ${currentlyShortlisted ? 'removed from' : 'added to'} your R&D talent pipeline.`,
    });
  }

  async function handlePostChallenge(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!challengeTitle.trim() || !organization.trim() || !sector.trim() || isSubmitting) return;

    isSubmitting = true;
    try {
      await addDashboardOpportunity({
        title: challengeTitle.trim(),
        organization: organization.trim(),
        opportunityType: 'project',
        workMode,
        sector: sector.trim(),
        compensation: compensation.trim() || 'Paid Stipend / Grant',
        targetRoles: ['student', 'researcher', 'faculty'],
      });

      challengeTitle = '';
      organization = '';
      compensation = '';
      showChallengeForm = false;
      pushToast({
        tone: 'success',
        title: 'Challenge published',
        message: 'Students and researchers can now discover and apply to your brief.',
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Unable to publish challenge',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      isSubmitting = false;
    }
  }
</script>

<RoleDashboardShell role="industry">
  {#snippet roleModules()}
    <Card
      title="Verified Proof-of-Work Talent & R&D Briefs"
      subtitle="Evaluate builders by attested hardware/software deliverables instead of resumes"
    >
      {#snippet headerActions()}
        <div class="flex items-center gap-2">
          <Badge tone="moss">{shortlistedCount} Shortlisted</Badge>
          <Button variant="outline" size="sm" onclick={() => (showChallengeForm = !showChallengeForm)}>
            <Icon name={showChallengeForm ? 'x' : 'rocket'} size={15} />
            <span>{showChallengeForm ? 'Close' : 'Post R&D Challenge'}</span>
          </Button>
        </div>
      {/snippet}

      <div class="flex flex-col gap-4">
        {#if showChallengeForm}
          <form
            class="grid grid-cols-1 gap-3 rounded-xl border border-logo-saffron-border bg-logo-saffron-soft/40 p-4 md:grid-cols-2"
            onsubmit={handlePostChallenge}
          >
            <Input
              id="ind-title"
              label={$t.forms.challengeRoleTitle}
              bind:value={challengeTitle}
              placeholder="e.g., Edge Vision Defect Inspection Prototype"
              required
            />
            <Input
              id="ind-org"
              label={$t.forms.companyStartupName}
              bind:value={organization}
              placeholder="e.g., BharatRobotics Labs"
              required
            />
            <Select id="ind-sector" label={$t.forms.sector} options={sectorOptions} bind:value={sector} />
            <Select id="ind-mode" label={$t.forms.workMode} options={workModeOptions} bind:value={workMode} />
            <Input
              id="ind-comp"
              label={$t.forms.bountyStipend}
              bind:value={compensation}
              placeholder="e.g., ₹40,000 / mo or ₹3L Grant"
            />
            <div class="flex items-end justify-end">
              <Button type="submit" variant="primary" size="md">
                <Icon name="send" size={15} />
                <span>Publish Challenge</span>
              </Button>
            </div>
          </form>
        {/if}

        <div class="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {#each $dashboardState.talentCandidates as cand (cand.id)}
            <div class="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div class="flex flex-col gap-2.5">
                <div class="flex items-center gap-2.5">
                  <Avatar name={cand.name} size="sm" />
                  <div class="min-w-0">
                    <strong class="block truncate text-sm text-slate-900">{cand.name}</strong>
                    <span class="block truncate text-xs text-logo-green">@{cand.handle}</span>
                  </div>
                </div>
                <p class="text-xs text-slate-600">{cand.institution}</p>
                <div class="flex flex-wrap items-center gap-1.5">
                  <Badge tone="saffron">{cand.verifiedBuilds} Verified Builds</Badge>
                  <Badge tone="neutral">{cand.availability}</Badge>
                </div>
                <div class="flex flex-wrap gap-1">
                  {#each cand.topSkills as skill (skill)}
                    <span class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {skill}
                    </span>
                  {/each}
                </div>
              </div>

              <Button
                variant={cand.shortlisted ? 'outline' : 'primary'}
                size="sm"
                fullWidth
                onclick={() => handleToggleShortlist(cand.id, cand.name, cand.shortlisted)}
              >
                <Icon name={cand.shortlisted ? 'check-circle' : 'user-plus'} size={15} />
                <span>{cand.shortlisted ? 'Shortlisted' : 'Shortlist Builder'}</span>
              </Button>
            </div>
          {/each}
        </div>
      </div>
    </Card>
  {/snippet}

  {#snippet roleSidebar()}
    <Card title="Hiring & R&D Funnel" subtitle="Campus-to-Industry pipeline" color="emerald">
      <div class="flex flex-col gap-2.5 text-xs text-emerald-950">
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
          <span>Verified Builders Reviewed</span>
          <strong class="text-sm text-emerald-900">{$dashboardState.talentCandidates.length}</strong>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
          <span>Shortlisted for Interviews</span>
          <strong class="text-sm text-logo-saffron">{shortlistedCount}</strong>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
          <span>Active Problem Statements</span>
          <strong class="text-sm text-logo-green">{$dashboardState.opportunities.length}</strong>
        </div>
      </div>
    </Card>
  {/snippet}
</RoleDashboardShell>
