<script lang="ts">
  import { onMount } from 'svelte';
  import { ApiError } from '$lib/api/client';
  import { projectsApi } from '$lib/api/projects.api';
  import RoleDashboardShell from '$lib/components/dashboard/RoleDashboardShell.svelte';
  import { addInstitutionalMission, dashboardState, pushToast, t } from '$lib/stores';
  import { Badge, Button, Card, Icon, Input, ProgressBar, Select } from '$ui';

  let showMissionForm = $state(false);
  let missionTitle = $state('');
  let missionDomain = $state('');
  let grantPool = $state('');
  let isSubmitting = $state(false);
  let domainOptions = $state<Array<{ value: string; label: string }>>([]);

  onMount(async () => {
    try {
      const opts = await projectsApi.getOptions();
      domainOptions = opts.sectors.map((s) => ({ value: s.label, label: s.label }));
      if (!missionDomain && domainOptions[0]) {
        missionDomain = domainOptions[0].value;
      }
    } catch {
      // Loaded from API
    }
  });

  const totalTeams = $derived(
    $dashboardState.institutionalMissions.reduce((acc, m) => acc + m.teamsParticipating, 0),
  );

  async function handleCreateMission(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!missionTitle.trim() || !missionDomain.trim() || isSubmitting) return;

    isSubmitting = true;
    try {
      await addInstitutionalMission({
        title: missionTitle.trim(),
        domain: missionDomain.trim(),
        grantPool: grantPool.trim() || '₹25 Lakhs',
      });

      missionTitle = '';
      grantPool = '';
      showMissionForm = false;
      pushToast({
        tone: 'success',
        title: 'Innovation mission launched',
        message: 'Open for campus teams and researchers to submit prototypes.',
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Unable to launch mission',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      isSubmitting = false;
    }
  }
</script>

<RoleDashboardShell role="institution">
  {#snippet roleModules()}
    <Card
      title="Institutional & National Innovation Missions"
      subtitle="Coordinate Viksit Bharat 2047 cohorts, campus incubators, and grant disbursements"
    >
      {#snippet headerActions()}
        <div class="flex items-center gap-2">
          <Badge tone="moss">{totalTeams} Teams Active</Badge>
          <Button variant="outline" size="sm" onclick={() => (showMissionForm = !showMissionForm)}>
            <Icon name={showMissionForm ? 'x' : 'landmark'} size={15} />
            <span>{showMissionForm ? 'Close' : 'Launch Mission'}</span>
          </Button>
        </div>
      {/snippet}

      <div class="flex flex-col gap-4">
        {#if showMissionForm}
          <form
            class="grid grid-cols-1 gap-3 rounded-xl border border-logo-saffron-border bg-logo-saffron-soft/40 p-4 md:grid-cols-3"
            onsubmit={handleCreateMission}
          >
            <Input
              id="mis-title"
              label={$t.forms.missionTitle}
              bind:value={missionTitle}
              placeholder="e.g., Clean-Energy Microgrid Campus Challenge"
              required
            />
            <Select
              id="mis-domain"
              label={$t.forms.focusDomain}
              options={domainOptions}
              bind:value={missionDomain}
            />
            <Input
              id="mis-grant"
              label={$t.forms.grantPool}
              bind:value={grantPool}
              placeholder="e.g., ₹50 Lakhs"
            />
            <div class="flex justify-end md:col-span-3">
              <Button type="submit" variant="primary" size="md">
                <Icon name="check" size={16} />
                <span>Launch Mission</span>
              </Button>
            </div>
          </form>
        {/if}

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          {#each $dashboardState.institutionalMissions as mission (mission.id)}
            <div class="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                  <Badge tone={mission.status === 'active' ? 'moss' : 'saffron'}>
                    {mission.status}
                  </Badge>
                  <span class="text-xs font-bold text-logo-saffron">{mission.grantPool}</span>
                </div>
                <h3 class="text-sm font-bold text-slate-900">{mission.title}</h3>
                <span class="text-xs font-medium text-logo-green">{mission.domain}</span>
              </div>

              <div class="flex flex-col gap-2 pt-2">
                <ProgressBar value={mission.progressPercent} label={$t.forms.cohortMilestoneCompletion} />
                <span class="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Icon name="users" size={13} />
                  {mission.teamsParticipating} participating teams
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </Card>
  {/snippet}

  {#snippet roleSidebar()}
    <Card title="Ecosystem Impact Snapshot" subtitle="Institution & mission KPIs" color="teal">
      <div class="flex flex-col gap-2.5 text-xs text-teal-950">
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
          <span>Participating Innovation Teams</span>
          <strong class="text-sm text-teal-900">{totalTeams}</strong>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
          <span>Active Grants & Missions</span>
          <strong class="text-sm text-logo-saffron">{$dashboardState.institutionalMissions.length}</strong>
        </div>
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
          <span>DPDP Governance Compliance</span>
          <Badge tone="moss">Verified</Badge>
        </div>
      </div>
    </Card>
  {/snippet}
</RoleDashboardShell>
