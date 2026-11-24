<script lang="ts">
  interface Props {
    value: number;
    max?: number;
    label?: string;
    showPercent?: boolean;
  }

  let { value, max = 100, label, showPercent = true }: Props = $props();

  const percent = $derived(Math.min(100, Math.max(0, Math.round((value / max) * 100))));
</script>

<div class="flex flex-col gap-1.5">
  {#if label || showPercent}
    <div class="flex justify-between text-xs font-semibold">
      {#if label}
        <span class="text-slate-600">{label}</span>
      {/if}
      {#if showPercent}
        <span class="text-brand">{percent}%</span>
      {/if}
    </div>
  {/if}
  <div
    class="h-2 w-full overflow-hidden rounded-full bg-slate-200"
    role="progressbar"
    aria-valuenow={percent}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      class="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-200"
      style="width: {percent}%"
    ></div>
  </div>
</div>
