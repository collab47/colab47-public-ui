<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ensureFreshSession } from '$lib/api/client';
  import {
    authState,
    dashboardState,
    getProjectCoverMedia,
    loadMyProjects,
    profileState,
    t,
    type ProjectStatus,
  } from '$lib/stores';
  import { Badge, Icon, Spinner } from '$ui';

  const activeUser = $derived($profileState.profile ?? $authState.user);

  let ready = $state(false);
  let searchQuery = $state('');
  let statusFilter = $state<'all' | ProjectStatus>('all');

  const statusToneMap: Record<ProjectStatus, 'saffron' | 'moss' | 'neutral' | 'ink'> = {
    idea: 'neutral',
    ongoing: 'saffron',
    in_progress: 'ink',
    completed: 'moss',
  };

  const filteredProjects = $derived(
    $dashboardState.projects.filter((project) => {
      if (statusFilter !== 'all' && project.status !== statusFilter) return false;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        project.title.toLowerCase().includes(q) ||
        project.brief.toLowerCase().includes(q) ||
        project.sector.toLowerCase().includes(q) ||
        project.tags.some((tg) => tg.toLowerCase().includes(q))
      );
    }),
  );

  onMount(async () => {
    const ok = await ensureFreshSession();
    if (!ok || !authState.get().accessToken) {
      await goto('/login');
      return;
    }
    ready = true;
    await loadMyProjects();
  });
</script>

<svelte:head>
  <title>{$t.ui.myProjects} · Collab47</title>
</svelte:head>

{#if !ready}
  <div class="flex min-h-[60vh] flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <p class="text-sm font-medium text-slate-600">{$t.ui.loadingDashboard}</p>
  </div>
{:else}
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-[#1E1B4B]">
          {$t.ui.myProjects} ({$dashboardState.projects.length})
        </h1>
        <p class="mt-0.5 text-xs font-medium text-slate-500">
          Projects you created or joined as an accepted contributor
        </p>
      </div>

      <a
        href="/projects/new"
        class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-4 py-2.5 text-xs font-bold text-white no-underline shadow-[0_6px_16px_rgba(109,74,255,0.28)] transition hover:brightness-105 hover:no-underline"
      >
        <Icon name="plus" size={15} />
        <span>{$t.dashboard.addProject}</span>
      </a>
    </div>

    <!-- Search & Status Filters -->
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-3.5 shadow-xs">
      <div class="relative min-w-[220px] flex-1">
        <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
          <Icon name="search" size={15} />
        </span>
        <input
          type="search"
          bind:value={searchQuery}
          placeholder="Search your projects by title, sector, or tag..."
          class="w-full rounded-xl border border-[#E8EAF6] bg-[#F8F9FE] py-2 pr-3 pl-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
        />
      </div>

      <div class="flex flex-wrap items-center gap-1.5">
        {#each ['all', 'idea', 'ongoing', 'in_progress', 'completed'] as st (st)}
          <button
            type="button"
            onclick={() => (statusFilter = st as 'all' | ProjectStatus)}
            class="cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold capitalize transition {statusFilter === st
              ? 'bg-[#6D4AFF] text-white'
              : 'bg-[#F3F1FF] text-slate-600 hover:text-[#5B3DF5]'}"
          >
            {st.replace('_', ' ')}
          </button>
        {/each}
      </div>
    </div>

    {#if $dashboardState.projectsLoading && !$dashboardState.projectsLoaded}
      <div class="flex justify-center rounded-2xl border border-[#E8EAF6] bg-white py-14">
        <Spinner label="Loading your projects..." size="md" />
      </div>
    {:else if filteredProjects.length === 0}
      <div class="flex flex-col items-center gap-3 rounded-2xl border border-[#E8EAF6] bg-white px-6 py-14 text-center">
        <span class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F1FF] text-[#6D4AFF]">
          <Icon name="folder-open" size={26} />
        </span>
        <div>
          <h2 class="text-base font-extrabold text-[#1E1B4B]">
            {$dashboardState.projects.length === 0
              ? "You haven't created or joined any projects yet"
              : 'No projects match your current filter'}
          </h2>
          <p class="mt-1 max-w-md text-xs text-slate-500">
            Start a new project with full STEM details, cover media, and contributor invitations.
          </p>
        </div>
        <a
          href="/projects/new"
          class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-4 py-2.5 text-xs font-bold text-white no-underline shadow-sm hover:brightness-105 hover:no-underline"
        >
          <Icon name="plus" size={14} />
          <span>{$t.dashboard.addProject}</span>
        </a>
      </div>
    {:else}
      <div class="grid gap-4 md:grid-cols-2">
        {#each filteredProjects as project (project.id)}
          {@const coverMedia = getProjectCoverMedia(project)}
          {@const isAuthor =
            project.canEdit ??
            (project.authorId && activeUser
              ? project.authorId === activeUser.id
              : project.membershipRole === 'owner')}
          <article class="flex flex-col overflow-hidden rounded-2xl border border-[#E8EAF6] bg-white shadow-xs transition hover:border-[#C4B5FD]">
            <a href={`/projects/${project.id}`} class="relative block aspect-video bg-slate-900 no-underline">
              {#if coverMedia}
                {#if coverMedia.kind === 'video'}
                  <!-- svelte-ignore a11y_media_has_caption -->
                  <video src={coverMedia.url} muted playsinline preload="metadata" class="h-full w-full object-cover"></video>
                {:else}
                  <img src={coverMedia.url} alt={coverMedia.title} class="h-full w-full object-cover" />
                {/if}
              {:else}
                <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1E1B4B] to-[#6D4AFF] text-white/80">
                  <Icon name="rocket" size={32} />
                </div>
              {/if}
            </a>

            <div class="flex flex-1 flex-col gap-3 p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap items-center gap-1.5">
                  <Badge tone={statusToneMap[project.status]}>{project.status.replace('_', ' ')}</Badge>
                  <span class="rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-[10px] font-bold text-[#5B3DF5]">
                    {project.sector}
                  </span>
                  {#if project.membershipRole}
                    <Badge tone={project.membershipRole === 'owner' ? 'saffron' : 'moss'}>
                      {project.membershipRole}
                    </Badge>
                  {/if}
                </div>
                <span class="text-[11px] text-slate-400">{project.updatedLabel}</span>
              </div>

              <div>
                <a
                  href={`/projects/${project.id}`}
                  class="block text-base font-extrabold text-[#1E1B4B] no-underline hover:text-[#6D4AFF] hover:underline"
                >
                  {project.title}
                </a>
                <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{project.brief}</p>
              </div>

              {#if project.tags.length > 0}
                <div class="flex flex-wrap gap-1.5">
                  {#each project.tags.slice(0, 5) as tag (tag)}
                    <span class="rounded-full bg-[#F3F1FF] px-2 py-0.5 text-[10px] font-semibold text-[#5B3DF5]">
                      #{tag}
                    </span>
                  {/each}
                </div>
              {/if}

              <div class="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F2FA] pt-3 text-xs">
                <div class="flex items-center gap-3 text-slate-500">
                  <span class="inline-flex items-center gap-1 font-semibold">
                    <Icon name="users" size={13} />
                    <span>{project.contributorsCount}</span>
                  </span>
                  <span class="inline-flex items-center gap-1 font-semibold">
                    <Icon name="heart" size={13} />
                    <span>{project.likesCount ?? 0}</span>
                  </span>
                </div>

                <div class="flex items-center gap-2.5">
                  <a
                    href={`/projects/${project.id}`}
                    class="inline-flex items-center gap-1 font-bold text-slate-600 no-underline hover:text-[#6D4AFF] hover:underline"
                  >
                    <Icon name="eye" size={13} />
                    <span>View</span>
                  </a>
                  {#if isAuthor}
                    <a
                      href={`/projects/${project.id}/edit`}
                      class="inline-flex items-center gap-1 rounded-lg bg-[#F3F1FF] px-2.5 py-1 font-bold text-[#6D4AFF] no-underline hover:bg-[#EDE9FE] hover:no-underline"
                    >
                      <Icon name="file-text" size={13} />
                      <span>{$t.forms.editProject}</span>
                    </a>
                  {/if}
                </div>
              </div>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </div>
{/if}
