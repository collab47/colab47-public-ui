<script lang="ts">
  import type { ProjectMediaItem } from '$lib/stores';
  import { Icon } from '$ui';

  interface Props {
    items: ProjectMediaItem[];
    sourceProjectTitle?: string;
  }

  let { items, sourceProjectTitle }: Props = $props();
  let activeLightboxItem = $state<ProjectMediaItem | null>(null);
</script>

{#if items.length > 0}
  <div class="flex flex-col gap-2">
    <div
      class="grid gap-2 {items.length === 1
        ? 'grid-cols-1'
        : items.length === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-2 sm:grid-cols-3'}"
    >
      {#each items as item (item.id)}
        <div
          class="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 {items.length === 1
            ? 'aspect-video max-h-[360px]'
            : 'aspect-video'}"
        >
          {#if item.kind === 'video'}
            <!-- svelte-ignore a11y_media_has_caption -->
            <video
              src={item.url}
              controls
              playsinline
              preload="metadata"
              class="h-full w-full bg-slate-950 object-cover"
            ></video>
            <span
              class="pointer-events-none absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-xs"
            >
              <Icon name="video" size={11} />
              <span>Video</span>
            </span>
          {:else}
            <button
              type="button"
              class="block h-full w-full cursor-pointer border-0 bg-transparent p-0"
              onclick={() => (activeLightboxItem = item)}
              aria-label="Inspect photo: {item.title}"
            >
              <img
                src={item.url}
                alt={item.title}
                loading="lazy"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </button>
            <span
              class="pointer-events-none absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-xs"
            >
              <Icon name="image" size={11} />
              <span>{item.isCover ? 'Cover Photo' : 'Photo'}</span>
            </span>
          {/if}

          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent px-2.5 pt-6 pb-2"
          >
            <span class="block truncate text-[11px] font-medium text-white/95">
              {item.title}
            </span>
          </div>
        </div>
      {/each}
    </div>

    {#if sourceProjectTitle}
      <div class="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
        <Icon name="layers" size={12} class="text-logo-green" />
        <span>
          Shared directly from project gallery:
          <strong class="text-slate-700">{sourceProjectTitle}</strong>
          ({items.filter((m) => m.kind === 'image').length} photos,
          {items.filter((m) => m.kind === 'video').length} videos)
        </span>
      </div>
    {/if}
  </div>
{/if}

{#if activeLightboxItem}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label={activeLightboxItem.title}
  >
    <div class="relative flex max-h-[90vh] max-w-4xl flex-col gap-3">
      <div class="flex items-center justify-between gap-4 text-white">
        <div class="flex items-center gap-2 text-sm font-semibold">
          <Icon name="image" size={16} />
          <span>{activeLightboxItem.title}</span>
        </div>
        <button
          type="button"
          class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          onclick={() => (activeLightboxItem = null)}
          aria-label="Close preview"
        >
          <Icon name="x" size={18} />
        </button>
      </div>
      <img
        src={activeLightboxItem.url}
        alt={activeLightboxItem.title}
        class="max-h-[80vh] w-auto rounded-2xl border border-white/20 object-contain shadow-2xl"
      />
    </div>
  </div>
{/if}
