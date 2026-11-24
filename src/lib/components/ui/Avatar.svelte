<script lang="ts">
  interface Props {
    name: string;
    src?: string | null;
    size?: 'sm' | 'md' | 'lg';
  }

  let { name, src = null, size = 'md' }: Props = $props();

  const initials = $derived(
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'C47',
  );

  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-8.5 w-8.5 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-19 w-19 text-xl',
  };
</script>

<div
  class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-indigo-50 font-bold text-indigo-700 {sizeClasses[size]}"
  aria-label={name}
>
  {#if src}
    <img {src} alt={name} class="h-full w-full object-cover" />
  {:else}
    <span>{initials}</span>
  {/if}
</div>
