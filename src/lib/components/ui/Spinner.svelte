<script lang="ts">
  interface Props {
    label?: string;
    size?: 'sm' | 'md' | 'lg';
  }

  let { label = 'Loading...', size = 'md' }: Props = $props();

  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-9 w-9 border-[3px]',
  };
</script>

<div class="inline-flex items-center gap-2.5 text-sm text-slate-500" role="status" aria-live="polite">
  <span
    class="animate-spin rounded-full border-slate-300 border-t-brand {sizeClasses[size]}"
    aria-hidden="true"
  ></span>
  {#if label}
    <span>{label}</span>
  {/if}
</div>
