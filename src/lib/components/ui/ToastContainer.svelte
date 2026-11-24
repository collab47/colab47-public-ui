<script lang="ts">
  import { toasts, dismissToast, type ToastTone } from '$lib/stores/toast.store';
  import Icon, { type IconName } from './Icon.svelte';

  const toneIcons: Record<ToastTone, IconName> = {
    info: 'info',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'alert-circle',
  };

  const toneBorder: Record<ToastTone, string> = {
    info: 'border-l-slate-800',
    success: 'border-l-emerald-600',
    warning: 'border-l-amber-500',
    error: 'border-l-rose-600',
  };

  const toneIconColor: Record<ToastTone, string> = {
    info: 'text-slate-800',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-rose-600',
  };
</script>

{#if $toasts.length > 0}
  <div
    class="fixed right-5 bottom-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2.5"
    aria-live="polite"
  >
    {#each $toasts as toast (toast.id)}
      <div
        class="flex items-start justify-between gap-3 rounded-xl border border-slate-200 border-l-4 bg-white px-4 py-3 text-sm shadow-lg {toneBorder[toast.tone]}"
        role="status"
      >
        <span class="mt-0.5 inline-flex shrink-0 {toneIconColor[toast.tone]}">
          <Icon name={toneIcons[toast.tone]} size={18} />
        </span>
        <div class="flex flex-1 flex-col gap-0.5">
          <strong class="font-semibold text-slate-900">{toast.title}</strong>
          {#if toast.message}
            <p class="text-xs text-slate-500">{toast.message}</p>
          {/if}
        </div>
        <button
          type="button"
          class="cursor-pointer rounded p-0.5 text-slate-400 transition hover:text-slate-700"
          onclick={() => dismissToast(toast.id)}
          aria-label="Close notification"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    {/each}
  </div>
{/if}
