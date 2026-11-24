<script lang="ts">
  import { cn } from '$lib/utils';
  import Icon from './Icon.svelte';

  interface Props {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    class?: string;
    onclear?: () => void;
  }

  let {
    value = $bindable(''),
    placeholder = 'Search projects, posts, opportunities, tags...',
    ariaLabel = 'Search workspace',
    class: className = '',
    onclear,
  }: Props = $props();

  function clear(): void {
    value = '';
    onclear?.();
  }
</script>

<div
  class={cn(
    'flex items-center gap-2.5 rounded-2xl border border-input bg-background px-4 py-2.5 shadow-xs transition focus-within:border-primary focus-within:ring-3 focus-within:ring-indigo-500/15',
    className,
  )}
>
  <span class="text-muted-foreground" aria-hidden="true">
    <Icon name="search" size={18} />
  </span>
  <input
    type="search"
    bind:value
    {placeholder}
    aria-label={ariaLabel}
    class="w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
  />
  {#if value}
    <button
      type="button"
      onclick={clear}
      class="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-secondary text-muted-foreground transition hover:text-foreground"
      aria-label="Clear search"
    >
      <Icon name="x" size={14} />
    </button>
  {/if}
</div>
