<script lang="ts">
  interface Props {
    id: string;
    label: string;
    value?: string;
    placeholder?: string;
    rows?: number;
    maxlength?: number;
    hint?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
  }

  let {
    id,
    label,
    value = $bindable(''),
    placeholder = '',
    rows = 4,
    maxlength,
    hint,
    error,
    required = false,
    disabled = false,
  }: Props = $props();

  const nearLimit = $derived(Boolean(maxlength && value.length >= maxlength * 0.9));
</script>

<div class="flex flex-col gap-1.5">
  <div class="flex items-center justify-between">
    <label class="text-sm font-semibold text-slate-900" for={id}>
      {label}
      {#if required}
        <span class="ml-0.5 text-rose-600" aria-hidden="true">*</span>
      {/if}
    </label>
    {#if maxlength}
      <span class="text-xs {nearLimit ? 'font-semibold text-rose-600' : 'text-slate-500'}">
        {value.length} / {maxlength}
      </span>
    {/if}
  </div>

  <textarea
    {id}
    bind:value
    {placeholder}
    {rows}
    {maxlength}
    {required}
    {disabled}
    aria-invalid={Boolean(error)}
    class="w-full resize-y rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-3 focus:ring-indigo-500/15 {error ? 'border-rose-500' : 'border-slate-300'}"
  ></textarea>

  {#if error}
    <p class="text-xs font-medium text-rose-600" role="alert">{error}</p>
  {:else if hint}
    <p class="text-xs text-slate-500">{hint}</p>
  {/if}
</div>
