<script lang="ts">
  import RoleDashboardShell from '$lib/components/dashboard/RoleDashboardShell.svelte';
  import WorkbenchStepFixModal from '$lib/components/dashboard/WorkbenchStepFixModal.svelte';
  import { dashboardState, liveDashboardState, t, type StudentMilestone } from '$lib/stores';
  import { Badge, Button, Card, Icon } from '$ui';

  let activeStepId = $state<string | null>(null);

  const activeMilestone = $derived<StudentMilestone | null>(
    activeStepId
      ? $dashboardState.studentMilestones.find((m) => m.id === activeStepId) ?? null
      : null,
  );

  const completedCount = $derived(
    $dashboardState.studentMilestones.filter((m) => m.completed).length,
  );
  const milestonePercent = $derived(
    $dashboardState.studentMilestones.length > 0
      ? Math.round((completedCount / $dashboardState.studentMilestones.length) * 100)
      : 0,
  );

  const nextPendingMilestones = $derived(
    $dashboardState.studentMilestones.filter((m) => !m.completed),
  );
  const completedProjectsCount = $derived(
    $dashboardState.projects.filter((p) => p.status === 'completed').length,
  );

  function openStepFixFlow(step: StudentMilestone): void {
    activeStepId = step.id;
  }

  function scrollToWall(): void {
    document.getElementById('workspace-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<RoleDashboardShell role="student">
  {#snippet headerExtra()}
    <button
      type="button"
      onclick={scrollToWall}
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20"
    >
      <Icon name="message-square" size={14} />
      <span>{$t.studentDash.studentWall} ({$liveDashboardState.feed.length})</span>
    </button>
  {/snippet}

  {#snippet roleModules()}
    <section class="overflow-hidden rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h2 class="text-sm leading-snug font-extrabold text-[#1E1B4B]">
            {$t.studentDash.checklistTitle}
          </h2>
          <p class="mt-0.5 text-[11px] leading-snug text-slate-500">
            {$t.studentDash.checklistSubtitle}
          </p>
        </div>
        <span class="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
          {completedCount}/{($dashboardState.studentMilestones).length}
        </span>
      </div>

      <div class="mt-3 flex flex-col gap-2.5">
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-[#ECEAF9]">
          <div
            class="h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#A855F7] transition-all duration-300"
            style="width: {milestonePercent}%;"
          ></div>
        </div>

        <div class="flex flex-col gap-2">
          {#each $dashboardState.studentMilestones as item (item.id)}
            <button
              type="button"
              onclick={() => openStepFixFlow(item)}
              class="flex w-full min-w-0 cursor-pointer flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition {item.completed
                ? 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-300'
                : 'border-[#E8EAF6] bg-[#FAF9FF] hover:border-[#C4B5FD] hover:bg-[#F3F1FF]'}"
            >
              <div class="flex w-full items-center justify-between gap-2">
                <span
                  class="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase {item.completed
                    ? 'text-emerald-700'
                    : 'text-[#6D4AFF]'}"
                >
                  <Icon name={item.completed ? 'check-circle' : 'layers'} size={13} />
                  <span>Step {item.step}</span>
                </span>
                {#if item.completed}
                  <span class="truncate text-[10px] font-semibold text-emerald-700">{$t.ui.completed}</span>
                {:else}
                  <span class="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-[#EDE9FE] px-1.5 py-0.5 text-[10px] font-bold text-[#6D4AFF]">
                    <span>{$t.ui.fixStep}</span>
                    <Icon name="arrow-right" size={10} />
                  </span>
                {/if}
              </div>
              <strong
                class="w-full truncate text-xs font-bold {item.completed
                  ? 'text-emerald-950 line-through decoration-emerald-600/60'
                  : 'text-[#1E1B4B]'}"
              >
                {item.title}
              </strong>
              <span class="w-full truncate text-[11px] text-slate-500">
                {item.completed ? item.projectTitle : item.dueLabel}
              </span>
            </button>
          {/each}
        </div>
      </div>
    </section>
  {/snippet}

  {#snippet roleSidebar()}
    <Card
      title={$t.studentDash.nextMilestonesTitle}
      subtitle={$t.studentDash.nextMilestonesSubtitle}
    >
      <div class="flex flex-col gap-2.5">
        {#if nextPendingMilestones.length === 0}
          <div class="flex items-center gap-2 rounded-xl border border-logo-green-border bg-logo-green-soft/60 p-3 text-xs font-semibold text-logo-green">
            <Icon name="check-circle" size={16} />
            <span>All 5 workbench steps completed! Ready for PI Attestation.</span>
          </div>
        {:else}
          {#each nextPendingMilestones as pending (pending.id)}
            <div class="flex items-start justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
              <div class="min-w-0">
                <span class="text-[10px] font-bold uppercase text-logo-saffron">
                  Step {pending.step} · {pending.dueLabel}
                </span>
                <strong class="block truncate text-xs font-bold text-slate-900">
                  {pending.title}
                </strong>
              </div>
              <button
                type="button"
                onclick={() => openStepFixFlow(pending)}
                class="shrink-0 cursor-pointer rounded-lg border border-[#C4B5FD] bg-white px-2.5 py-1 text-[10px] font-bold text-[#6D4AFF] transition hover:bg-[#6D4AFF] hover:text-white"
              >
                {$t.ui.fixStep} →
              </button>
            </div>
          {/each}
        {/if}

        <div class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span>Completed Verified Builds</span>
          <Badge tone="moss">{completedProjectsCount} Attested</Badge>
        </div>
      </div>
    </Card>

    <Card
      title={$t.studentDash.readinessTitle}
      subtitle={$t.studentDash.readinessSubtitle}
      color="amber"
    >
      <div class="flex flex-col gap-3 text-sm text-amber-950">
        <div class="flex items-start gap-2.5">
          <Icon name="shield-check" size={17} class="mt-0.5 shrink-0 text-logo-saffron" />
          <span>Request Faculty PI attestation once Step 4 telemetry logs are uploaded.</span>
        </div>
        <div class="flex items-start gap-2.5">
          <Icon name="cpu" size={17} class="mt-0.5 shrink-0 text-logo-green" />
          <span>Tag at least 3 STEM skills from your 5-section profile to match internships.</span>
        </div>
        <Button variant="primary" size="sm" fullWidth href="/onboarding">
          <Icon name="sparkles" size={15} />
          <span>{$t.studentDash.updateInterestsBtn}</span>
        </Button>
      </div>
    </Card>
  {/snippet}
</RoleDashboardShell>

<WorkbenchStepFixModal milestone={activeMilestone} onClose={() => (activeStepId = null)} />
