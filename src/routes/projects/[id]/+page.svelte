<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { ApiError, ensureFreshSession } from '$lib/api/client';
  import {
    projectsApi,
    type ApiProject,
    type ApiProjectMedia,
    type ProjectMilestoneStatus,
  } from '$lib/api/projects.api';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import { authState, profileState, pushToast, t } from '$lib/stores';
  import { Avatar, Badge, Icon, Spinner } from '$ui';

  const MILESTONE_STATUS_OPTIONS: ReadonlyArray<{ value: ProjectMilestoneStatus; label: string }> = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
  ];

  const milestoneToneMap: Record<ProjectMilestoneStatus, 'neutral' | 'saffron' | 'moss' | 'ember'> = {
    pending: 'neutral',
    in_progress: 'saffron',
    completed: 'moss',
    on_hold: 'ember',
  };

  const projectId = $derived($page.params.id ?? '');
  const activeUser = $derived($profileState.profile ?? $authState.user);
  const dashboardHref = $derived(getDashboardPath(activeUser?.accountType ?? 'student'));

  let isLoading = $state(true);
  let loadError = $state('');
  let project = $state<ApiProject | null>(null);
  let updatingMilestoneId = $state<string | null>(null);
  let lightboxMedia = $state<ApiProjectMedia | null>(null);
  let commentDraft = $state('');
  let isPostingComment = $state(false);
  let isTogglingLike = $state(false);

  const isAuthor = $derived(
    Boolean(project && (project.canEdit || (activeUser && project.authorId === activeUser.id))),
  );

  const coverMedia = $derived(
    project?.media.find((m) => m.isCover) ?? project?.media[0] ?? null,
  );

  const completedMilestonesCount = $derived(
    (project?.milestones ?? []).filter((m) => m.status === 'completed').length,
  );

  const milestoneCompletionPercent = $derived.by(() => {
    const total = project?.milestones?.length ?? 0;
    if (total === 0) return 0;
    return Math.round((completedMilestonesCount / total) * 100);
  });

  function formatDisplayDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  async function handleMilestoneStatusChange(
    milestoneId: string,
    nextStatus: ProjectMilestoneStatus,
  ): Promise<void> {
    if (!project || !isAuthor) return;
    updatingMilestoneId = milestoneId;
    try {
      const updated = await projectsApi.updateMilestoneStatus(project.id, milestoneId, nextStatus);
      project = {
        ...project,
        milestones: project.milestones.map((m) => (m.id === updated.id ? updated : m)),
      };
      pushToast({
        tone: 'success',
        title: 'Milestone status updated',
        message: `"${updated.title}" marked as ${nextStatus.replace('_', ' ')}.`,
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not update milestone status',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      updatingMilestoneId = null;
    }
  }

  async function handleToggleLike(): Promise<void> {
    if (!project || isTogglingLike) return;
    isTogglingLike = true;
    try {
      const res = await projectsApi.toggleLike(project.id);
      project = { ...project, isLiked: res.liked, likesCount: res.likesCount };
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Action failed',
        message: err instanceof ApiError ? err.message : 'Unable to update like.',
      });
    } finally {
      isTogglingLike = false;
    }
  }

  async function handleAddComment(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!project || !commentDraft.trim() || isPostingComment) return;
    isPostingComment = true;
    try {
      const created = await projectsApi.addComment(project.id, commentDraft.trim());
      project = {
        ...project,
        commentsCount: project.commentsCount + 1,
        comments: [...project.comments, created],
      };
      commentDraft = '';
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not post comment',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      isPostingComment = false;
    }
  }

  onMount(async () => {
    const ok = await ensureFreshSession();
    if (!ok || !authState.get().accessToken) {
      await goto('/login');
      return;
    }
    try {
      project = await projectsApi.getById(projectId);
    } catch (err) {
      loadError =
        err instanceof ApiError
          ? err.message
          : 'Unable to load project details.';
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>{project?.title ?? 'Project Details'} · Collab47</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
  <!-- Top Navigation & Access Badge -->
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <a
        href="/projects"
        class="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E5F5] bg-white px-3 py-2 text-xs font-bold text-[#1E1B4B] no-underline shadow-xs transition hover:border-[#6D4AFF] hover:text-[#6D4AFF] hover:no-underline"
      >
        <Icon name="arrow-left" size={14} />
        <span>{$t.ui.myProjects}</span>
      </a>
      <a
        href={dashboardHref}
        class="inline-flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-xs font-semibold text-slate-500 no-underline transition hover:bg-white hover:text-[#1E1B4B] hover:no-underline"
      >
        <span>{$t.forms.backToDashboard}</span>
      </a>
    </div>

    {#if project}
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
          <Icon name="eye" size={13} />
          <span>{isAuthor ? 'Project Details' : 'Read-Only View'}</span>
        </span>
        {#if isAuthor}
          <a
            href={`/projects/${project.id}/edit`}
            class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-4 py-2 text-xs font-bold text-white no-underline shadow-sm transition hover:brightness-105 hover:no-underline"
          >
            <Icon name="file-text" size={14} />
            <span>{$t.forms.editProject}</span>
          </a>
        {/if}
      </div>
    {/if}
  </div>

  {#if isLoading}
    <div class="flex min-h-[45vh] flex-col items-center justify-center gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-10">
      <Spinner size="lg" />
      <p class="text-sm font-semibold text-slate-600">Loading project details...</p>
    </div>
  {:else if loadError || !project}
    <div class="flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <div class="flex items-center gap-2 text-rose-800">
        <Icon name="alert-circle" size={18} />
        <strong class="text-sm font-extrabold">Project unavailable</strong>
      </div>
      <p class="text-xs text-rose-700">{loadError || 'Project not found.'}</p>
    </div>
  {:else}
    <!-- Main Read-Only Project Details Card -->
    <article class="flex flex-col gap-6 rounded-2xl border border-[#E8EAF6] bg-white p-6 shadow-xs">
      <!-- Hero Header -->
      <div class="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1F2FA] pb-5">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <Badge tone={project.workbenchStatus === 'completed' ? 'moss' : 'saffron'}>
              {project.workbenchStatus.replace('_', ' ')}
            </Badge>
            <span class="rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-[11px] font-bold text-[#5B3DF5]">
              {project.sector}
            </span>
            {#if project.branch}
              <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {project.branch}
              </span>
            {/if}
            <span class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
              {project.visibility.replace('_', ' ')}
            </span>
            {#if project.isDraft}
              <Badge tone="neutral">Draft</Badge>
            {/if}
            {#if project.isPinned}
              <Badge tone="saffron">Pinned</Badge>
            {/if}
          </div>

          <h1 class="mt-2.5 text-2xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-3xl">
            {project.title}
          </h1>

          <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>
              Posted by
              <a
                href={`/u/${project.authorHandle}`}
                class="font-bold text-[#1E1B4B] no-underline hover:text-[#6D4AFF] hover:underline"
              >
                {project.authorName}
              </a>
              (@{project.authorHandle})
            </span>
            <span>·</span>
            <span>Published {formatDisplayDate(project.createdAt)}</span>
            <span>·</span>
            <span class="font-mono text-[11px] text-slate-400">{project.shortId}</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isTogglingLike}
            onclick={() => void handleToggleLike()}
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition {project.isLiked
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-600'}"
          >
            <Icon name="heart" size={14} />
            <span>{project.likesCount}</span>
          </button>

          {#if project.deliverableUrl}
            <a
              href={project.deliverableUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-xl border border-[#DDD6FE] bg-[#FAF9FF] px-3.5 py-2 text-xs font-bold text-[#5B3DF5] no-underline hover:bg-[#EDE9FE] hover:no-underline"
            >
              <Icon name="external-link" size={14} />
              <span>View Deliverable / Repo</span>
            </a>
          {/if}
        </div>
      </div>

      <!-- Cover Media & Gallery -->
      {#if coverMedia}
        <div class="flex flex-col gap-3">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
            {#if coverMedia.kind === 'video'}
              <video src={coverMedia.url} controls class="max-h-[480px] w-full object-contain">
                <track kind="captions" />
              </video>
            {:else}
              <button
                type="button"
                onclick={() => (lightboxMedia = coverMedia)}
                class="block w-full cursor-zoom-in border-0 bg-transparent p-0"
              >
                <img src={coverMedia.url} alt={coverMedia.title} class="max-h-[480px] w-full object-cover" />
              </button>
            {/if}
          </div>

          {#if project.media.length > 1}
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {#each project.media.filter((m) => m.id !== coverMedia?.id) as item (item.id)}
                <div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {#if item.kind === 'video'}
                    <video src={item.url} controls class="aspect-video w-full object-cover">
                      <track kind="captions" />
                    </video>
                  {:else}
                    <button
                      type="button"
                      onclick={() => (lightboxMedia = item)}
                      class="block w-full cursor-zoom-in border-0 bg-transparent p-0"
                    >
                      <img src={item.url} alt={item.title} class="aspect-video w-full object-cover" />
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Project Narrative Sections -->
      <div class="grid gap-5 border-t border-[#F1F2FA] pt-5">
        <div>
          <h2 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            {$t.forms.projectBrief}
          </h2>
          <p class="mt-1.5 text-sm leading-relaxed text-slate-700">{project.brief}</p>
        </div>

        {#if project.projectOverview && project.projectOverview !== project.brief}
          <div>
            <h2 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              {$t.forms.projectOverview}
            </h2>
            <p class="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {project.projectOverview}
            </p>
          </div>
        {/if}

        {#if project.problemStatement}
          <div>
            <h2 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              {$t.forms.problemStatement}
            </h2>
            <p class="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {project.problemStatement}
            </p>
          </div>
        {/if}

        {#if project.description}
          <div>
            <h2 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              {$t.forms.detailedDescription}
            </h2>
            <p class="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {project.description}
            </p>
          </div>
        {/if}

        {#if project.expectedDeliverables}
          <div>
            <h2 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              {$t.forms.expectedDeliverables}
            </h2>
            <p class="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {project.expectedDeliverables}
            </p>
          </div>
        {/if}
      </div>

      <!-- STEM Classification, Affiliations & Timeline (Read-Only Grid) -->
      <section class="flex flex-col gap-4 rounded-2xl border border-[#ECEAF9] bg-[#FAF9FF] p-5">
        <h2 class="text-xs font-extrabold uppercase tracking-wide text-[#1E1B4B]">
          STEM Classification, Affiliations & Schedule
        </h2>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <span class="block text-[11px] font-bold text-slate-500">{$t.forms.sector}</span>
            <strong class="text-xs font-bold text-[#1E1B4B]">{project.sector}</strong>
          </div>
          {#if project.primaryStemCategory}
            <div>
              <span class="block text-[11px] font-bold text-slate-500">{$t.forms.primaryStemCategory}</span>
              <strong class="text-xs font-bold capitalize text-[#1E1B4B]">
                {project.primaryStemCategory.replace(/_/g, ' ')}
              </strong>
            </div>
          {/if}
          {#if project.primaryStemDiscipline}
            <div>
              <span class="block text-[11px] font-bold text-slate-500">{$t.forms.primaryStemDiscipline}</span>
              <strong class="text-xs font-bold text-[#1E1B4B]">{project.primaryStemDiscipline}</strong>
            </div>
          {/if}
          {#if project.leadInstitutionName}
            <div>
              <span class="block text-[11px] font-bold text-slate-500">{$t.forms.leadInstitution}</span>
              <strong class="text-xs font-bold text-[#1E1B4B]">{project.leadInstitutionName}</strong>
            </div>
          {/if}
          {#if project.leadOrganizationName}
            <div>
              <span class="block text-[11px] font-bold text-slate-500">{$t.forms.leadOrganization}</span>
              <strong class="text-xs font-bold text-[#1E1B4B]">{project.leadOrganizationName}</strong>
            </div>
          {/if}
          <div>
            <span class="block text-[11px] font-bold text-slate-500">Project Timeline</span>
            <strong class="text-xs font-bold text-[#1E1B4B]">
              {formatDisplayDate(project.startDate)} → {project.endDate ? formatDisplayDate(project.endDate) : 'Ongoing'}
            </strong>
          </div>
          {#if project.actualCompletionDate}
            <div>
              <span class="block text-[11px] font-bold text-slate-500">{$t.forms.actualCompletionDate}</span>
              <strong class="text-xs font-bold text-[#1E1B4B]">
                {formatDisplayDate(project.actualCompletionDate)}
              </strong>
            </div>
          {/if}
        </div>

        {#if project.projectTypes.length > 0 || project.academicLevels.length > 0 || project.broadDomains.length > 0}
          <div class="flex flex-col gap-2.5 border-t border-[#E8EAF6] pt-3.5">
            {#if project.projectTypes.length > 0}
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[11px] font-bold text-slate-500">{$t.forms.projectTypes}:</span>
                {#each project.projectTypes as pt (pt)}
                  <span class="rounded-full border border-[#DDD6FE] bg-white px-2.5 py-0.5 text-[11px] font-semibold capitalize text-[#1E1B4B]">
                    {pt.replace(/_/g, ' ')}
                  </span>
                {/each}
              </div>
            {/if}
            {#if project.academicLevels.length > 0}
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[11px] font-bold text-slate-500">{$t.forms.academicLevels}:</span>
                {#each project.academicLevels as lvl (lvl)}
                  <span class="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold capitalize text-slate-700">
                    {lvl.replace(/_/g, ' ')}
                  </span>
                {/each}
              </div>
            {/if}
            {#if project.broadDomains.length > 0}
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[11px] font-bold text-slate-500">{$t.forms.broadDomains}:</span>
                {#each project.broadDomains as dom (dom)}
                  <span class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                    {dom}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </section>

      <!-- Tags, Keywords & Skills -->
      {#if project.tags.length > 0 || project.keywords.length > 0 || project.skills.length > 0}
        <div class="flex flex-col gap-3 border-t border-[#F1F2FA] pt-4">
          {#if project.tags.length > 0}
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] font-bold text-slate-500">{$t.forms.projectTags}:</span>
              {#each project.tags as tag (tag)}
                <span class="rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#5B3DF5]">
                  #{tag}
                </span>
              {/each}
            </div>
          {/if}
          {#if project.keywords.length > 0}
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] font-bold text-slate-500">Keywords:</span>
              {#each project.keywords as kw (kw)}
                <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                  {kw}
                </span>
              {/each}
            </div>
          {/if}
          {#if project.skills.length > 0}
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] font-bold text-slate-500">Skills & Tech Stack:</span>
              {#each project.skills as sk (sk)}
                <span class="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                  {sk}
                </span>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Project Milestones (from public.project_milestones) -->
      <section class="flex flex-col gap-3.5 border-t border-[#F1F2FA] pt-5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Project Milestones ({project.milestones.length})
            </h2>
            {#if project.milestones.length > 0}
              <p class="mt-0.5 text-[11px] font-medium text-slate-500">
                {completedMilestonesCount} of {project.milestones.length} completed ({milestoneCompletionPercent}%)
              </p>
            {/if}
          </div>
          {#if isAuthor && project.milestones.length > 0}
            <span class="text-[11px] font-semibold text-[#6D4AFF]">
              Update milestone status directly below
            </span>
          {/if}
        </div>

        {#if project.milestones.length > 0}
          <div class="h-2 w-full overflow-hidden rounded-full bg-[#ECEAF9]">
            <div
              class="h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#10B981] transition-all duration-300"
              style="width: {milestoneCompletionPercent}%;"
            ></div>
          </div>

          <div class="flex flex-col gap-2.5">
            {#each project.milestones as ms (ms.id)}
              <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] px-4 py-3">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EDE9FE] text-[10px] font-extrabold text-[#6D4AFF]">
                      {ms.stageNumber}
                    </span>
                    <strong class="text-xs font-extrabold text-[#1E1B4B]">{ms.title}</strong>
                  </div>
                  {#if ms.description}
                    <p class="mt-1 text-xs text-slate-600">{ms.description}</p>
                  {/if}
                  <div class="mt-1.5 flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500">
                    <span>Start: <strong class="text-slate-700">{formatDisplayDate(ms.startDate)}</strong></span>
                    <span>End: <strong class="text-slate-700">{formatDisplayDate(ms.endDate)}</strong></span>
                  </div>
                </div>

                <div class="shrink-0">
                  {#if isAuthor}
                    <select
                      aria-label={`Status for ${ms.title}`}
                      value={ms.status}
                      disabled={updatingMilestoneId === ms.id}
                      onchange={(e) =>
                        void handleMilestoneStatusChange(
                          ms.id,
                          (e.currentTarget as HTMLSelectElement).value as ProjectMilestoneStatus,
                        )}
                      class="cursor-pointer rounded-xl border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-bold text-[#1E1B4B] outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15 disabled:opacity-60"
                    >
                      {#each MILESTONE_STATUS_OPTIONS as opt (opt.value)}
                        <option value={opt.value}>{opt.label}</option>
                      {/each}
                    </select>
                  {:else}
                    <Badge tone={milestoneToneMap[ms.status]}>
                      {ms.status.replace('_', ' ')}
                    </Badge>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] px-4 py-3 text-xs text-slate-500">
            No milestones recorded for this project yet.
          </p>
        {/if}
      </section>

      <!-- Team & Contributors (from public.project_contributors, Read-Only) -->
      <section class="flex flex-col gap-3 border-t border-[#F1F2FA] pt-5">
        <h2 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
          Team & Contributors ({project.contributors.length})
        </h2>
        <div class="grid gap-2.5 sm:grid-cols-2">
          {#each project.contributors as member (member.id)}
            <a
              href={`/u/${member.handle}`}
              class="flex items-center gap-3 rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] p-3 no-underline transition hover:border-[#C4B5FD] hover:no-underline"
            >
              <Avatar name={member.name} src={member.avatarUrl} size="sm" />
              <div class="min-w-0 flex-1">
                <strong class="block truncate text-xs font-bold text-[#1E1B4B]">{member.name}</strong>
                <span class="block truncate text-[11px] text-slate-500">
                  @{member.handle} · {member.roleTitle}
                </span>
              </div>
              <span class="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-bold uppercase text-[#6D4AFF]">
                {member.role}
              </span>
            </a>
          {/each}
        </div>
      </section>

      <!-- Discussion & Comments -->
      <section class="flex flex-col gap-3 border-t border-[#F1F2FA] pt-5">
        <h2 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
          Discussion ({project.commentsCount})
        </h2>

        {#if project.comments.length > 0}
          <div class="flex flex-col gap-2">
            {#each project.comments as cmt (cmt.id)}
              <div class="rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] px-3.5 py-2.5 text-xs">
                <div class="flex items-center justify-between gap-2">
                  <strong class="text-[#1E1B4B]">{cmt.authorName}</strong>
                  <span class="text-[10px] text-slate-400">{formatDisplayDate(cmt.createdAt)}</span>
                </div>
                <p class="mt-1 text-slate-700">{cmt.body}</p>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-xs text-slate-500">No comments yet. Share feedback or questions below.</p>
        {/if}

        <form class="flex gap-2" onsubmit={handleAddComment}>
          <input
            type="text"
            bind:value={commentDraft}
            placeholder="Write a comment or technical question..."
            class="flex-1 rounded-xl border border-[#E2E5F5] bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
          />
          <button
            type="submit"
            disabled={isPostingComment || !commentDraft.trim()}
            class="cursor-pointer rounded-xl bg-[#6D4AFF] px-4 py-2 text-xs font-bold text-white transition hover:brightness-105 disabled:opacity-50"
          >
            {isPostingComment ? 'Posting...' : 'Comment'}
          </button>
        </form>
      </section>
    </article>
  {/if}
</div>

<!-- Image Lightbox Modal -->
{#if lightboxMedia}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
    aria-label="Project image preview"
  >
    <button
      type="button"
      aria-label="Close preview"
      onclick={() => (lightboxMedia = null)}
      class="fixed inset-0 cursor-zoom-out border-0 bg-transparent"
    ></button>
    <div class="relative z-10 max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
      <button
        type="button"
        onclick={() => (lightboxMedia = null)}
        aria-label="Close"
        class="absolute top-3 right-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <Icon name="x" size={18} />
      </button>
      <img src={lightboxMedia.url} alt={lightboxMedia.title} class="max-h-[85vh] w-auto object-contain" />
    </div>
  </div>
{/if}
