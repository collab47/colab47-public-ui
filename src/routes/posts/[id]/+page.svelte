<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { ApiError, ensureFreshSession } from '$lib/api/client';
  import { dashboardApi, type LiveFeedPost } from '$lib/api/dashboard.api';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import MediaGalleryGrid from '$lib/components/dashboard/MediaGalleryGrid.svelte';
  import { authState, profileState, t } from '$lib/stores';
  import { Avatar, Icon, Spinner } from '$ui';

  const postId = $derived($page.params.id ?? '');
  const activeUser = $derived($profileState.profile ?? $authState.user);
  const dashboardHref = $derived(getDashboardPath(activeUser?.accountType ?? 'student'));

  let isLoading = $state(true);
  let loadError = $state('');
  let post = $state<LiveFeedPost | null>(null);

  const isAuthor = $derived(
    Boolean(post && (post.canEdit || (activeUser && post.authorId === activeUser.id))),
  );

  onMount(async () => {
    const ok = await ensureFreshSession();
    if (!ok || !authState.get().accessToken) {
      await goto('/login');
      return;
    }
    try {
      post = await dashboardApi.getPost(postId);
    } catch (err) {
      loadError = err instanceof ApiError ? err.message : 'Unable to load post.';
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>Post · Collab47</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <a
      href={dashboardHref}
      class="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E5F5] bg-white px-3 py-2 text-xs font-bold text-[#1E1B4B] no-underline shadow-xs transition hover:border-[#6D4AFF] hover:text-[#6D4AFF] hover:no-underline"
    >
      <Icon name="arrow-left" size={14} />
      <span>{$t.forms.backToDashboard}</span>
    </a>

    {#if post}
      {#if isAuthor}
        <a
          href={`/posts/${post.id}/edit`}
          class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-4 py-2 text-xs font-bold text-white no-underline shadow-sm transition hover:brightness-105 hover:no-underline"
        >
          <Icon name="file-text" size={14} />
          <span>Edit Post</span>
        </a>
      {:else}
        <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
          <Icon name="eye" size={13} />
          <span>Read-only view</span>
        </span>
      {/if}
    {/if}
  </div>

  {#if isLoading}
    <div class="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-10">
      <Spinner size="lg" />
      <p class="text-sm font-semibold text-slate-600">Loading post...</p>
    </div>
  {:else if loadError || !post}
    <div class="flex flex-col items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
      <strong class="text-sm font-extrabold text-rose-800">Post unavailable</strong>
      <p>{loadError || 'Post not found.'}</p>
    </div>
  {:else}
    <article class="flex flex-col gap-4 rounded-2xl border border-[#E8EAF6] bg-white p-6 shadow-xs">
      <div class="flex items-center gap-3">
        <Avatar name={post.authorName} src={post.authorAvatarUrl} size="md" />
        <div class="min-w-0">
          <strong class="block truncate text-sm font-extrabold text-[#1E1B4B]">{post.authorName}</strong>
          <span class="block truncate text-xs text-slate-500">
            {post.authorSubtitle ?? `@${post.authorHandle} · ${post.authorRole}`}
          </span>
        </div>
      </div>

      {#if post.projectTitle && post.projectId}
        <a
          href={`/projects/${post.projectId}`}
          class="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#F3F1FF] px-3 py-1 text-xs font-bold text-[#5B3DF5] no-underline hover:bg-[#EDE9FE] hover:no-underline"
        >
          <Icon name="rocket" size={13} />
          <span>{post.projectTitle}</span>
        </a>
      {/if}

      <p class="whitespace-pre-line text-sm leading-relaxed text-slate-700">{post.body}</p>

      {#if post.media.length > 0}
        <MediaGalleryGrid
          sourceProjectTitle={post.projectTitle ?? undefined}
          items={post.media.map((m, idx) => ({
            id: m.id,
            projectId: post?.projectId ?? 'feed',
            kind: m.kind === 'video' ? 'video' : 'image',
            url: m.url,
            title: m.title,
            isCover: idx === 0 && m.kind === 'image',
            uploadedAtLabel: '',
          }))}
        />
      {/if}

      {#if post.tags.length > 0}
        <div class="flex flex-wrap gap-1.5">
          {#each post.tags as tag (tag)}
            <span class="rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#5B3DF5]">
              #{tag}
            </span>
          {/each}
        </div>
      {/if}

      <div class="flex items-center gap-5 border-t border-[#F1F2FA] pt-3 text-xs font-semibold text-slate-500">
        <span>{post.likesCount} Likes</span>
        <span>{post.commentsCount} Comments</span>
        <span>{post.viewsCount} Views</span>
      </div>
    </article>
  {/if}
</div>
