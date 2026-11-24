<script lang="ts">
  interface ChipOption {
    value: string;
    label: string;
  }

  interface Props {
    label?: string;
    hint?: string;
    options: readonly ChipOption[];
    selected?: string[];
    max?: number;
  }

  let {
    label,
    hint,
    options,
    selected = $bindable([]),
    max,
  }: Props = $props();

  function toggle(value: string): void {
    if (selected.includes(value)) {
      selected = selected.filter((v) => v !== value);
      return;
    }
    if (max && selected.length >= max) {
      return;
    }
    selected = [...selected, value];
  }
</script>

<div class="flex flex-col gap-2">
  {#if label}
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-slate-900">{label}</span>
      {#if max}
        <span class="text-xs text-slate-500">{selected.length} / {max}</span>
      {/if}
    </div>
  {/if}

  {#if hint}
    <p class="text-xs text-slate-500">{hint}</p>
  {/if}

  <div class="flex flex-wrap gap-2" role="group" aria-label={label ?? 'Options'}>
    {#each options as option (option.value)}
      {@const isSelected = selected.includes(option.value)}
      {@const limitReached = Boolean(max && !isSelected && selected.length >= max)}
      <button
        type="button"
        class="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 {isSelected ? 'border-brand bg-brand text-white hover:bg-brand-hover' : 'border-slate-300 bg-white text-slate-700 hover:border-brand hover:text-slate-900'}"
        disabled={limitReached}
        aria-pressed={isSelected}
        onclick={() => toggle(option.value)}
      >
        {option.label}
      </button>
    {/each}
  </div>
</div>
