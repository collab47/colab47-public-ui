<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon, { type IconName } from './Icon.svelte';

  type AlertTone = 'info' | 'success' | 'warning' | 'error';

  interface Props {
    tone?: AlertTone;
    title?: string;
    dismissible?: boolean;
    ondismiss?: () => void;
    children?: Snippet;
  }

  let {
    tone = 'info',
    title,
    dismissible = false,
    ondismiss,
    children,
  }: Props = $props();

  const toneIcon: Record<AlertTone, IconName> = {
    info: 'info',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'alert-circle',
  };

  const toneClasses: Record<AlertTone, string> = {
    info: 'bg-slate-50 border-slate-200 text-slate-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
  };
</script>

<div
  class="flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm {toneClasses[tone]}"
  role={tone === 'error' ? 'alert' : 'status'}
>
  <span class="mt-0.5 inline-flex shrink-0" aria-hidden="true">
    <Icon name={toneIcon[tone]} size={18} />
  </span>
  <div class="flex flex-1 flex-col gap-0.5">
    {#if title}
      <strong class="font-bold">{title}</strong>
    {/if}
    <div>
      {@render children?.()}
    </div>
  </div>
  {#if dismissible}
    <button
      type="button"
      class="inline-flex cursor-pointer rounded-md p-1 text-current opacity-70 transition hover:opacity-100"
      onclick={ondismiss}
      aria-label="Dismiss alert"
    >
      <Icon name="x" size={16} />
    </button>
  {/if}
</div>
