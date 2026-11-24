<script lang="ts">
  import { uploadsApi } from '$lib/api/uploads.api';
  import {
    addProjectMedia,
    emitActivityNotification,
    formatMediaFileSize,
    pushToast,
    removeProjectMedia,
    setProjectCoverMedia,
    t,
    type DashboardProject,
    type ProjectMediaKind,
  } from '$lib/stores';
  import { Badge, Button, Icon, Input, Select } from '$ui';

  interface Props {
    project: DashboardProject;
    onClose: () => void;
    onShareToWall: (projectId: string, selectedMediaIds: string[]) => void;
  }

  let { project, onClose, onShareToWall }: Props = $props();

  let isDragging = $state(false);
  let isUploading = $state(false);
  let urlInput = $state('');
  let urlTitle = $state('');
  let urlKind = $state<ProjectMediaKind>('image');
  let fileInputEl = $state<HTMLInputElement | null>(null);

  const photoCount = $derived(project.media.filter((m) => m.kind === 'image').length);
  const videoCount = $derived(project.media.filter((m) => m.kind === 'video').length);

  async function ingestFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );

    if (validFiles.length === 0) {
      pushToast({
        tone: 'error',
        title: 'Unsupported files',
        message: 'Please select photo (PNG, JPG, WebP, GIF) or video (MP4, WebM, MOV) files.',
      });
      return;
    }

    isUploading = true;
    try {
      const uploadedItems = await uploadsApi.uploadFiles(validFiles, 'projects');
      const accepted = uploadedItems.map((u) => ({
        kind: u.kind as ProjectMediaKind,
        url: u.url,
        title: u.originalName.replace(/\.[^.]+$/, ''),
        mimeType: u.contentType,
        fileSizeLabel: formatMediaFileSize(u.sizeBytes),
      }));

      addProjectMedia(project.id, accepted);
      void emitActivityNotification({
        type: 'project_updated',
        title: `Media uploaded to ${project.title}`,
        body: `Uploaded ${accepted.length} file${accepted.length > 1 ? 's' : ''} to project gallery.`,
        targetType: 'project',
        sendEmail: false,
      });
      pushToast({
        tone: 'success',
        title: `${accepted.length} file${accepted.length > 1 ? 's' : ''} uploaded`,
        message: 'You can now set any photo or video as cover or reuse them on wall posts.',
      });
    } catch {
      // Fallback to local browser object URL if API is unreachable
      const accepted = validFiles.map((file) => ({
        kind: (file.type.startsWith('video/') ? 'video' : 'image') as ProjectMediaKind,
        url: URL.createObjectURL(file),
        title: file.name.replace(/\.[^.]+$/, ''),
        mimeType: file.type,
        fileSizeLabel: formatMediaFileSize(file.size),
      }));
      addProjectMedia(project.id, accepted);
      pushToast({
        tone: 'info',
        title: `${accepted.length} file${accepted.length > 1 ? 's' : ''} attached locally`,
        message: 'Backend upload endpoint was unreachable; previewing locally.',
      });
    } finally {
      isUploading = false;
    }
  }

  function handleFileChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    ingestFiles(input.files);
    input.value = '';
  }

  function handleDrop(event: DragEvent): void {
    event.preventDefault();
    isDragging = false;
    ingestFiles(event.dataTransfer?.files ?? null);
  }

  function handleAddByUrl(event: SubmitEvent): void {
    event.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    const detectedVideo = /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(trimmed);
    const kind: ProjectMediaKind = detectedVideo ? 'video' : urlKind;

    addProjectMedia(project.id, [
      {
        kind,
        url: trimmed,
        title: urlTitle.trim() || (kind === 'video' ? 'Uploaded Demo Video' : 'Project Photo'),
        mimeType: kind === 'video' ? 'video/mp4' : 'image/jpeg',
      },
    ]);

    urlInput = '';
    urlTitle = '';
    pushToast({
      tone: 'success',
      title: `${kind === 'video' ? 'Video' : 'Photo'} added`,
      message: 'Added to the project gallery and ready for cover or wall post reuse.',
    });
  }

  function handleSetCover(mediaId: string, kind: ProjectMediaKind): void {
    setProjectCoverMedia(project.id, mediaId);
    void emitActivityNotification({
      type: 'project_updated',
      title: `Cover ${kind === 'video' ? 'video' : 'photo'} updated`,
      body: `Updated the cover ${kind === 'video' ? 'video' : 'photo'} for "${project.title}".`,
      targetType: 'project',
      sendEmail: false,
    });
    pushToast({
      tone: 'success',
      title: `Cover ${kind === 'video' ? 'video' : 'photo'} updated`,
      message: `"${project.title}" now displays this ${kind} as its cover.`,
    });
  }

  function handleRemove(mediaId: string): void {
    removeProjectMedia(project.id, mediaId);
    pushToast({
      tone: 'info',
      title: 'Media removed',
      message: 'Removed from project gallery.',
    });
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
  role="dialog"
  aria-modal="true"
  aria-label="Manage Project Media and Cover"
>
  <div
    class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
  >
    <!-- Modal Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <Badge tone="saffron">Project Media &amp; Cover</Badge>
          <Badge tone="moss">{photoCount} Photos · {videoCount} Videos</Badge>
        </div>
        <h2 class="mt-1 truncate text-lg font-extrabold text-slate-900">{project.title}</h2>
        <p class="text-xs text-slate-500">
          Upload multiple photos &amp; videos, update the cover photo/video anytime, and reuse them directly on wall posts.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-logo-saffron-border hover:text-logo-saffron"
        onclick={onClose}
        aria-label="Close media manager"
      >
        <Icon name="x" size={18} />
      </button>
    </div>

    <!-- Scrollable Body -->
    <div class="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
      <!-- Drag & Drop Multi-File Uploader -->
      <div
        role="region"
        aria-label="Upload multiple photos and videos"
        ondragover={(e) => {
          e.preventDefault();
          isDragging = true;
        }}
        ondragleave={() => (isDragging = false)}
        ondrop={handleDrop}
        class="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-6 text-center transition {isDragging
          ? 'border-logo-saffron bg-logo-saffron-soft/60'
          : 'border-slate-300 bg-slate-50/70 hover:border-logo-saffron-border'}"
      >
        <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-logo-saffron-soft text-logo-saffron">
          <Icon name="upload" size={22} />
        </span>
        <div>
          <p class="text-sm font-bold text-slate-900">
            Drop multiple photos &amp; videos here, or browse from your device
          </p>
          <p class="mt-0.5 text-xs text-slate-500">
            {$t.ui.supportedMediaFormats}
          </p>
        </div>
        <input
          bind:this={fileInputEl}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov"
          multiple
          class="hidden"
          onchange={handleFileChange}
        />
        <Button variant="primary" size="sm" loading={isUploading} onclick={() => fileInputEl?.click()}>
          <Icon name="upload" size={15} />
          <span>{isUploading ? 'Uploading media...' : $t.forms.uploadMedia}</span>
        </Button>
      </div>

      <!-- Optional Add Media by URL -->
      <form
        class="grid grid-cols-1 items-end gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 sm:grid-cols-[120px_1fr_180px_auto]"
        onsubmit={handleAddByUrl}
      >
        <Select
          id="mgr-media-kind"
          label={$t.forms.mediaType}
          options={[
            { value: 'image', label: 'Photo' },
            { value: 'video', label: 'Video' },
          ]}
          bind:value={urlKind}
        />
        <Input
          id="mgr-media-url"
          label={$t.forms.pastePhotoVideoUrl}
          bind:value={urlInput}
          placeholder="https://example.com/demo.mp4 or photo.jpg"
        />
        <Input
          id="mgr-media-title"
          label={$t.forms.caption}
          bind:value={urlTitle}
          placeholder="Flight demo video"
        />
        <Button type="submit" variant="outline" size="md" disabled={!urlInput.trim()}>
          <Icon name="plus" size={15} />
          <span>{$t.ui.addUrlBtn}</span>
        </Button>
      </form>

      <!-- Existing Gallery Grid with Cover Switcher -->
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-extrabold text-slate-900">
            Project Media Gallery ({project.media.length})
          </h3>
          <span class="text-xs text-slate-500">
            Click <strong>Set as Cover</strong> on any photo or video to update the project cover
          </span>
        </div>

        {#if project.media.length === 0}
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No photos or videos uploaded yet. Upload your first photo or video above!
          </div>
        {:else}
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {#each project.media as item (item.id)}
              <div
                class="flex flex-col overflow-hidden rounded-xl border transition {item.isCover
                  ? 'border-logo-saffron ring-2 ring-logo-saffron/25'
                  : 'border-slate-200 bg-white'}"
              >
                <div class="relative aspect-video bg-slate-900">
                  {#if item.kind === 'video'}
                    <!-- svelte-ignore a11y_media_has_caption -->
                    <video
                      src={item.url}
                      controls
                      playsinline
                      preload="metadata"
                      class="h-full w-full object-cover"
                    ></video>
                  {:else}
                    <img
                      src={item.url}
                      alt={item.title}
                      class="h-full w-full object-cover"
                    />
                  {/if}

                  <div class="pointer-events-none absolute top-2 left-2 flex flex-wrap gap-1">
                    {#if item.isCover}
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-logo-saffron px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm"
                      >
                        <Icon name="star" size={11} />
                        <span>COVER {item.kind === 'video' ? 'VIDEO' : 'PHOTO'}</span>
                      </span>
                    {:else}
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2 py-0.5 text-[10px] font-bold text-white uppercase"
                      >
                        <Icon name={item.kind === 'video' ? 'video' : 'image'} size={10} />
                        <span>{item.kind}</span>
                      </span>
                    {/if}
                  </div>
                </div>

                <div class="flex flex-1 flex-col justify-between gap-2.5 p-3">
                  <div>
                    <p class="truncate text-xs font-bold text-slate-900" title={item.title}>
                      {item.title}
                    </p>
                    <span class="text-[11px] text-slate-500">
                      {item.fileSizeLabel ? `${item.fileSizeLabel} · ` : ''}{item.uploadedAtLabel}
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                    {#if item.isCover}
                      <span class="inline-flex items-center gap-1 text-[11px] font-bold text-logo-green">
                        <Icon name="check-circle" size={13} />
                        <span>Active Cover</span>
                      </span>
                    {:else}
                      <button
                        type="button"
                        class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-logo-saffron-border bg-logo-saffron-soft/60 px-2 py-1 text-[11px] font-bold text-logo-saffron transition hover:bg-logo-saffron hover:text-white"
                        onclick={() => handleSetCover(item.id, item.kind)}
                      >
                        <Icon name="star" size={12} />
                        <span>Set as Cover</span>
                      </button>
                    {/if}

                    <button
                      type="button"
                      class="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
                      onclick={() => handleRemove(item.id)}
                      aria-label="Remove {item.title}"
                    >
                      <Icon name="trash" size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
      <Button
        variant="outline"
        size="sm"
        disabled={project.media.length === 0}
        onclick={() => {
          onShareToWall(
            project.id,
            project.media.map((m) => m.id),
          );
          onClose();
        }}
      >
        <Icon name="send" size={14} />
        <span>Reuse All Media in Wall Post</span>
      </Button>
      <Button variant="primary" size="sm" onclick={onClose}>
        <Icon name="check" size={15} />
        <span>Done</span>
      </Button>
    </div>
  </div>
</div>
