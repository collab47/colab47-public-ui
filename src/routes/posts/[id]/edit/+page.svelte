<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { ApiError, ensureFreshSession } from '$lib/api/client';
  import { dashboardApi, type LiveFeedPost } from '$lib/api/dashboard.api';
  import { uploadsApi } from '$lib/api/uploads.api';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import {
    authState,
    dashboardState,
    loadMyProjects,
    profileState,
    pushToast,
    t,
    updateLiveFeedPost,
  } from '$lib/stores';
  import { Button, Icon, Input, Spinner, Textarea } from '$ui';

  interface EditableMediaItem {
    localId: string;
    kind: 'image' | 'video' | 'document' | 'code_snippet';
    url: string;
    title: string;
    isCover: boolean;
  }

  const POST_TYPES = [
    { value: 'project_showcase', label: 'Project Showcase' },
    { value: 'milestone_update', label: 'Milestone Update' },
    { value: 'article', label: 'Build Note / Article' },
    { value: 'opportunity', label: 'Opportunity / Call' },
  ];

  const postId = $derived($page.params.id ?? '');
  const activeUser = $derived($profileState.profile ?? $authState.user);
  const dashboardHref = $derived(getDashboardPath(activeUser?.accountType ?? 'student'));

  let isLoading = $state(true);
  let loadError = $state('');
  let post = $state<LiveFeedPost | null>(null);

  let postType = $state('project_showcase');
  let body = $state('');
  let attachedProjectId = $state('');
  let locationLabel = $state('');
  let tagsInput = $state('');
  let mediaItems = $state<EditableMediaItem[]>([]);
  let mediaFileInput = $state<HTMLInputElement | null>(null);
  let isUploading = $state(false);
  let isSaving = $state(false);
  let formError = $state('');

  const hasCoverImage = $derived(mediaItems.some((m) => m.kind === 'image' && m.isCover));

  onMount(async () => {
    const ok = await ensureFreshSession();
    if (!ok || !authState.get().accessToken) {
      await goto('/login');
      return;
    }
    try {
      const [loaded] = await Promise.all([
        dashboardApi.getPost(postId),
        loadMyProjects().catch(() => []),
      ]);
      const user = authState.get().user;
      const canEdit = Boolean(loaded.canEdit ?? (user && loaded.authorId === user.id));
      if (!canEdit) {
        pushToast({
          tone: 'info',
          title: 'Read-only access',
          message: 'Only the author who posted this update can edit it.',
        });
        await goto(`/posts/${loaded.id}`, { replaceState: true });
        return;
      }

      post = loaded;
      postType = loaded.postType || 'project_showcase';
      body = loaded.body;
      attachedProjectId = loaded.projectId ?? '';
      locationLabel = loaded.locationLabel ?? '';
      tagsInput = (loaded.tags ?? []).join(', ');
      let assignedCover = false;
      mediaItems = (loaded.media ?? []).map((m, idx) => {
        const isImg = m.kind === 'image';
        const makeCover = !assignedCover && isImg;
        if (makeCover) assignedCover = true;
        return {
          localId: m.id || `m-${idx}`,
          kind: (m.kind === 'video' ? 'video' : 'image') as 'image' | 'video',
          url: m.url,
          title: m.title || `Media ${idx + 1}`,
          isCover: makeCover,
        };
      });
    } catch (err) {
      loadError = err instanceof ApiError ? err.message : 'Unable to load post for editing.';
    } finally {
      isLoading = false;
    }
  });

  async function handleFilesSelected(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (files.length === 0) return;

    isUploading = true;
    formError = '';
    try {
      const uploaded = await uploadsApi.uploadFiles(files, 'posts');
      let hasCover = mediaItems.some((m) => m.kind === 'image' && m.isCover);
      const added: EditableMediaItem[] = uploaded.map((item, idx) => {
        const makeCover = !hasCover && item.kind === 'image';
        if (makeCover) hasCover = true;
        return {
          localId: `up-${Date.now()}-${idx}`,
          kind: item.kind,
          url: item.url,
          title: item.originalName,
          isCover: makeCover,
        };
      });
      mediaItems = [...mediaItems, ...added];
    } catch (err) {
      formError = err instanceof ApiError ? err.message : 'Unable to upload media.';
    } finally {
      isUploading = false;
    }
  }

  function markCover(localId: string): void {
    const target = mediaItems.find((m) => m.localId === localId);
    if (!target || target.kind !== 'image') return;
    mediaItems = mediaItems.map((m) => ({ ...m, isCover: m.localId === localId }));
  }

  function removeMedia(localId: string): void {
    const remaining = mediaItems.filter((m) => m.localId !== localId);
    if (!remaining.some((m) => m.kind === 'image' && m.isCover)) {
      const firstImgIdx = remaining.findIndex((m) => m.kind === 'image');
      if (firstImgIdx !== -1 && remaining[firstImgIdx]) {
        remaining[firstImgIdx] = { ...remaining[firstImgIdx], isCover: true };
      }
    }
    mediaItems = remaining;
  }

  async function handleSave(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!post) return;
    formError = '';

    if (!body.trim()) {
      formError = 'Post content cannot be empty.';
      return;
    }
    if (!hasCoverImage) {
      formError = 'A cover image is required. Upload at least one image and mark it as Cover Image.';
      return;
    }

    isSaving = true;
    try {
      const tags = Array.from(
        new Set(
          tagsInput
            .split(',')
            .map((tg) => tg.trim().replace(/^#+/, ''))
            .filter(Boolean),
        ),
      );
      await updateLiveFeedPost(post.id, {
        postType,
        body: body.trim(),
        attachedProjectId: attachedProjectId || null,
        locationLabel: locationLabel.trim() || null,
        tags,
        media: mediaItems.map((m) => ({
          kind: m.kind,
          url: m.url,
          title: m.title,
          isCover: m.isCover,
        })),
      });
      pushToast({
        tone: 'success',
        title: 'Post updated',
        message: 'Your post changes have been saved.',
      });
      await goto(dashboardHref);
    } catch (err) {
      formError = err instanceof ApiError ? err.message : 'Unable to save post changes.';
    } finally {
      isSaving = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Post · Collab47</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
  <div class="flex items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <a
        href={dashboardHref}
        class="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E5F5] bg-white px-3 py-2 text-xs font-bold text-[#1E1B4B] no-underline shadow-xs transition hover:border-[#6D4AFF] hover:text-[#6D4AFF] hover:no-underline"
      >
        <Icon name="arrow-left" size={14} />
        <span>{$t.forms.backToDashboard}</span>
      </a>
      <h1 class="text-xl font-extrabold text-[#1E1B4B]">Edit Post</h1>
    </div>
  </div>

  {#if isLoading}
    <div class="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-10">
      <Spinner size="lg" />
      <p class="text-sm font-semibold text-slate-600">Loading post editor...</p>
    </div>
  {:else if loadError || !post}
    <div class="flex flex-col items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700">
      <strong class="text-sm font-extrabold text-rose-800">Unable to edit post</strong>
      <p>{loadError || 'Post not found.'}</p>
    </div>
  {:else}
    <form class="flex flex-col gap-5 rounded-2xl border border-[#E8EAF6] bg-white p-6 shadow-xs" onsubmit={handleSave}>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <label for="edit-post-type" class="text-xs font-bold text-[#1E1B4B]">{$t.forms.postType}</label>
          <select
            id="edit-post-type"
            bind:value={postType}
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
          >
            {#each POST_TYPES as pt (pt.value)}
              <option value={pt.value}>{pt.label}</option>
            {/each}
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="edit-post-project" class="text-xs font-bold text-[#1E1B4B]">{$t.forms.attachProject}</label>
          <select
            id="edit-post-project"
            bind:value={attachedProjectId}
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
          >
            <option value="">None</option>
            {#each $dashboardState.projects as prj (prj.id)}
              <option value={prj.id}>{prj.title}</option>
            {/each}
          </select>
        </div>
      </div>

      <Textarea
        id="edit-post-body"
        label={$t.forms.whatAreYouBuilding}
        bind:value={body}
        rows={5}
        maxlength={2000}
        required
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <Input
          id="edit-post-tags"
          label={$t.forms.postTags}
          bind:value={tagsInput}
          placeholder="ai, robotics, prototype"
        />
        <Input
          id="edit-post-location"
          label={$t.forms.location}
          bind:value={locationLabel}
          placeholder="e.g. IIT Bombay Robotics Lab"
        />
      </div>

      <!-- Media Gallery & Mandatory Cover Image -->
      <div class="flex flex-col gap-3 rounded-xl border border-[#ECEAF9] bg-[#FAF9FF] p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="block text-xs font-bold text-[#1E1B4B]">Post Cover Image & Media *</span>
            <span class="text-[11px] text-slate-500">{$t.ui.supportedMediaFormats}</span>
          </div>
          <input
            bind:this={mediaFileInput}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov"
            class="hidden"
            onchange={handleFilesSelected}
          />
          <Button variant="outline" size="sm" loading={isUploading} onclick={() => mediaFileInput?.click()}>
            <Icon name="upload" size={14} />
            <span>{isUploading ? 'Uploading...' : $t.forms.uploadMedia}</span>
          </Button>
        </div>

        {#if mediaItems.length > 0}
          <div class="grid gap-3 sm:grid-cols-2">
            {#each mediaItems as item (item.localId)}
              <div
                class="flex flex-col overflow-hidden rounded-xl border {item.isCover
                  ? 'border-[#6D4AFF] ring-2 ring-[#6D4AFF]/20'
                  : 'border-slate-200'} bg-white"
              >
                <div class="relative aspect-video bg-slate-100">
                  {#if item.kind === 'video'}
                    <video src={item.url} controls class="h-full w-full object-cover">
                      <track kind="captions" />
                    </video>
                  {:else}
                    <img src={item.url} alt={item.title} class="h-full w-full object-cover" />
                  {/if}
                  {#if item.isCover}
                    <span class="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#6D4AFF] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                      <Icon name="star" size={10} />
                      <span>Cover Image</span>
                    </span>
                  {/if}
                </div>
                <div class="flex items-center justify-between gap-2 p-2 text-[11px]">
                  <span class="truncate font-semibold text-slate-700">{item.title}</span>
                  <div class="flex shrink-0 items-center gap-1.5">
                    {#if item.kind === 'image' && !item.isCover}
                      <button
                        type="button"
                        onclick={() => markCover(item.localId)}
                        class="cursor-pointer rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-0.5 text-[10px] font-bold text-[#6D4AFF]"
                      >
                        Mark as Cover
                      </button>
                    {/if}
                    <button
                      type="button"
                      onclick={() => removeMedia(item.localId)}
                      aria-label="Remove media"
                      class="cursor-pointer rounded-lg p-1 text-rose-500 hover:bg-rose-50"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      {#if formError}
        <p class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {formError}
        </p>
      {/if}

      <div class="flex items-center justify-between border-t border-slate-100 pt-4">
        <a href={dashboardHref} class="text-xs font-bold text-slate-500 no-underline hover:text-[#1E1B4B]">
          {$t.ui.cancel}
        </a>
        <Button type="submit" variant="primary" size="md" loading={isSaving} disabled={!hasCoverImage}>
          <Icon name="save" size={15} />
          <span>{$t.forms.saveChanges}</span>
        </Button>
      </div>
    </form>
  {/if}
</div>
