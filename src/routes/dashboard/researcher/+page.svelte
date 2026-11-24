<script lang="ts">
  import { onMount } from 'svelte';
  import { ApiError } from '$lib/api/client';
  import { projectsApi } from '$lib/api/projects.api';
  import RoleDashboardShell from '$lib/components/dashboard/RoleDashboardShell.svelte';
  import { addResearchArtifact, dashboardState, pushToast, t, type ResearchArtifact } from '$lib/stores';
  import { Badge, Button, Card, Icon, Input, Select } from '$ui';

  let showForm = $state(false);
  let title = $state('');
  let venue = $state('');
  let domain = $state('');
  let artifactType = $state<ResearchArtifact['artifactType']>('preprint');
  let status = $state<ResearchArtifact['status']>('drafting');
  let isSubmitting = $state(false);
  let domainOptions = $state<Array<{ value: string; label: string }>>([]);

  const artifactTypeOptions = [
    { value: 'preprint', label: 'Preprint / Paper' },
    { value: 'dataset', label: 'Open Dataset' },
    { value: 'patent_draft', label: 'Patent Draft' },
    { value: 'open_code', label: 'Open Code / Benchmark' },
  ];

  const statusOptions = [
    { value: 'drafting', label: 'Drafting' },
    { value: 'under_review', label: 'Under Peer Review' },
    { value: 'published', label: 'Published / Open' },
  ];

  onMount(async () => {
    try {
      const opts = await projectsApi.getOptions();
      domainOptions = opts.sectors.map((s) => ({ value: s.label, label: s.label }));
      if (!domain && domainOptions[0]) {
        domain = domainOptions[0].value;
      }
    } catch {
      // Loaded from API
    }
  });

  const statusTone: Record<ResearchArtifact['status'], 'neutral' | 'saffron' | 'moss'> = {
    drafting: 'neutral',
    under_review: 'saffron',
    published: 'moss',
  };

  async function handleAddArtifact(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!title.trim() || !venue.trim() || isSubmitting) return;
    isSubmitting = true;
    try {
      await addResearchArtifact({
        title: title.trim(),
        venue: venue.trim(),
        domain: domain.trim(),
        artifactType,
        status,
        coAuthorsCount: 1,
      });
      title = '';
      venue = '';
      showForm = false;
      pushToast({
        tone: 'success',
        title: 'Research output logged',
        message: 'Saved to your publications & open artifacts pipeline.',
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not log research artifact',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      isSubmitting = false;
    }
  }
</script>

<RoleDashboardShell role="researcher">
  {#snippet roleModules()}
    <Card
      title="Publications, Open Datasets & IP Pipeline"
      subtitle="Track peer reviews, open benchmarks, and recruit student co-authors"
    >
      {#snippet headerActions()}
        <Button variant="outline" size="sm" onclick={() => (showForm = !showForm)}>
          <Icon name={showForm ? 'x' : 'plus'} size={15} />
          <span>{showForm ? 'Close' : 'Log Artifact'}</span>
        </Button>
      {/snippet}

      <div class="flex flex-col gap-4">
        {#if showForm}
          <form
            class="grid grid-cols-1 gap-3 rounded-xl border border-logo-saffron-border bg-logo-saffron-soft/40 p-4 md:grid-cols-2"
            onsubmit={handleAddArtifact}
          >
            <Input
              id="res-title"
              label={$t.forms.artifactTitle}
              bind:value={title}
              placeholder="e.g., High-Efficiency Perovskite Tandem Dataset"
              required
            />
            <Input
              id="res-venue"
              label={$t.forms.journalRepoFiling}
              bind:value={venue}
              placeholder="e.g., arXiv / IEEE / Indian Patent Office"
              required
            />
            <Select id="res-type" label={$t.forms.mediaType} options={artifactTypeOptions} bind:value={artifactType} />
            <Select id="res-domain" label={$t.forms.domain} options={domainOptions} bind:value={domain} />
            <Select id="res-status" label={$t.forms.stage} options={statusOptions} bind:value={status} />
            <div class="flex items-end justify-end">
              <Button type="submit" variant="primary" size="md">
                <Icon name="check" size={16} />
                <span>Add to Pipeline</span>
              </Button>
            </div>
          </form>
        {/if}

        <div class="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {#each $dashboardState.researchArtifacts as item (item.id)}
            <div class="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                  <Badge tone="saffron">{item.artifactType.replace('_', ' ')}</Badge>
                  <Badge tone={statusTone[item.status]}>{item.status.replace('_', ' ')}</Badge>
                </div>
                <h3 class="text-sm font-bold text-slate-900">{item.title}</h3>
                <p class="text-xs font-medium text-logo-green">{item.venue}</p>
              </div>
              <div class="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
                <span>{item.domain}</span>
                <span class="inline-flex items-center gap-1">
                  <Icon name="users" size={13} />
                  {item.coAuthorsCount} authors
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </Card>
  {/snippet}

  {#snippet roleSidebar()}
    <Card title="Open Lab Collaborators" subtitle="Recruit verified student builders" color="violet">
      <div class="flex flex-col gap-2.5 text-sm text-violet-950">
        <p class="text-xs leading-relaxed text-violet-800">
          Publish open benchmark datasets or reproducibility tasks to attract high-intent UG/PG
          research fellows across India.
        </p>
        <div class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 text-xs">
          <span class="font-semibold text-violet-900">ORCID &amp; Scholar Sync</span>
          <Badge tone="moss">Active</Badge>
        </div>
      </div>
    </Card>
  {/snippet}
</RoleDashboardShell>
