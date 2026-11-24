<script lang="ts">
  import { Icon } from '$ui';

  interface Props {
    tags: string[];
    label?: string;
    placeholder?: string;
    suggestions?: readonly string[];
    maxTags?: number;
  }

  let {
    tags = $bindable<string[]>([]),
    label = 'Tags',
    placeholder = 'Type a tag and press Enter or comma (e.g. ai, robotics)',
    suggestions = ['ai', 'webdev', 'robotics', 'ml', 'iot', 'opensource', 'mobile', 'cleantech'],
    maxTags = 12,
  }: Props = $props();

  let draft = $state('');

  function normalizeTag(raw: string): string {
    return raw
      .trim()
      .toLowerCase()
      .replace(/^#+/, '')
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32);
  }

  function addTag(raw: string): void {
    const clean = normalizeTag(raw);
    if (!clean || tags.includes(clean) || tags.length >= maxTags) return;
    tags = [...tags, clean];
  }

  function commitDraft(): void {
    if (!draft.trim()) return;
    const parts = draft.split(/[\s,]+/);
    for (const part of parts) {
      addTag(part);
    }
    draft = '';
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitDraft();
    } else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      tags = tags.slice(0, -1);
    }
  }

  function removeTag(tag: string): void {
    tags = tags.filter((t) => t !== tag);
  }

  const unusedSuggestions = $derived(suggestions.filter((s) => !tags.includes(s)).slice(0, 6));
</script>

<div class="flex flex-col gap-1.5">
  {#if label}
    <span class="text-xs font-semibold text-slate-700">
      {label} <span class="font-normal text-slate-400">({tags.length}/{maxTags})</span>
    </span>
  {/if}

  <div class="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#E2E5F5] bg-white px-2.5 py-2 focus-within:border-[#6D4AFF] focus-within:ring-2 focus-within:ring-[#6D4AFF]/15">
    {#each tags as tag (tag)}
      <span class="inline-flex items-center gap-1 rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-xs font-semibold text-[#5B3DF5]">
        <span>#{tag}</span>
        <button
          type="button"
          onclick={() => removeTag(tag)}
          aria-label="Remove tag {tag}"
          class="cursor-pointer rounded-full p-0.5 text-[#5B3DF5]/70 transition hover:bg-[#5B3DF5]/15 hover:text-[#5B3DF5]"
        >
          <Icon name="x" size={11} />
        </button>
      </span>
    {/each}
    <input
      type="text"
      bind:value={draft}
      onkeydown={handleKeydown}
      onblur={commitDraft}
      {placeholder}
      disabled={tags.length >= maxTags}
      class="min-w-[140px] flex-1 border-0 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
    />
  </div>

  {#if unusedSuggestions.length > 0 && tags.length < maxTags}
    <div class="flex flex-wrap items-center gap-1 text-[11px]">
      <span class="text-slate-400">Quick add:</span>
      {#each unusedSuggestions as sug (sug)}
        <button
          type="button"
          onclick={() => addTag(sug)}
          class="cursor-pointer rounded-full border border-[#E8EAF6] bg-[#FAF9FF] px-2 py-0.5 font-semibold text-slate-600 transition hover:border-[#C4B5FD] hover:bg-[#F3F1FF] hover:text-[#5B3DF5]"
        >
          +#{sug}
        </button>
      {/each}
    </div>
  {/if}
</div>
