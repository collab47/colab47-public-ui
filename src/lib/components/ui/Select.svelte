<script lang="ts" generics="T extends string = string">
  interface SelectOption {
    value: string;
    label: string;
  }

  interface Props {
    id: string;
    label: string;
    options: readonly SelectOption[];
    value?: T;
    placeholder?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
  }

  let {
    id,
    label,
    options,
    value = $bindable('' as T),
    placeholder,
    error,
    hint,
    required = false,
    disabled = false,
  }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
  <label class="text-sm font-semibold text-slate-900" for={id}>
    {label}
    {#if required}
      <span class="ml-0.5 text-rose-600" aria-hidden="true">*</span>
    {/if}
  </label>

  <select
    {id}
    bind:value
    {required}
    {disabled}
    aria-invalid={Boolean(error)}
    class="w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-3 focus:ring-indigo-500/15 {error ? 'border-rose-500' : 'border-slate-300'}"
  >
    {#if placeholder}
      <option value="">{placeholder}</option>
    {/if}
    {#each options as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>

  {#if error}
    <p class="text-xs font-medium text-rose-600" role="alert">{error}</p>
  {:else if hint}
    <p class="text-xs text-slate-500">{hint}</p>
  {/if}
</div>
