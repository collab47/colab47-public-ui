<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Icon, { type IconName } from './Icon.svelte';

  interface Props {
    id: string;
    label: string;
    type?: 'text' | 'email' | 'url' | 'date' | 'number' | 'search';
    value?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    autocomplete?: HTMLInputAttributes['autocomplete'];
    maxlength?: number;
    prefix?: string;
    icon?: IconName;
    onblur?: () => void;
    oninput?: (value: string) => void;
  }

  let {
    id,
    label,
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    hint,
    error,
    required = false,
    disabled = false,
    autocomplete,
    maxlength,
    prefix,
    icon,
    onblur,
    oninput,
  }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
  <label class="text-sm font-semibold text-slate-900" for={id}>
    {label}
    {#if required}
      <span class="ml-0.5 text-rose-600" aria-hidden="true">*</span>
    {/if}
  </label>

  <div
    class="flex items-center overflow-hidden rounded-xl border bg-white transition {error
      ? 'border-rose-500 focus-within:border-rose-500 focus-within:ring-3 focus-within:ring-rose-500/15'
      : 'border-slate-300 focus-within:border-brand focus-within:ring-3 focus-within:ring-logo-saffron/15'}"
  >
    {#if prefix}
      <span
        class="flex items-center self-stretch border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
      >
        {prefix}
      </span>
    {:else if icon}
      <span class="inline-flex items-center pl-3 text-slate-400" aria-hidden="true">
        <Icon name={icon} size={17} />
      </span>
    {/if}
    <input
      {id}
      {type}
      bind:value
      {placeholder}
      {required}
      {disabled}
      {autocomplete}
      {maxlength}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      class="w-full border-0 bg-transparent px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50"
      {onblur}
      oninput={(e) => oninput?.((e.currentTarget as HTMLInputElement).value)}
    />
  </div>

  {#if error}
    <p id="{id}-error" class="inline-flex items-center gap-1 text-xs font-medium text-rose-600" role="alert">
      <Icon name="alert-circle" size={13} />
      <span>{error}</span>
    </p>
  {:else if hint}
    <p id="{id}-hint" class="text-xs text-slate-500">{hint}</p>
  {/if}
</div>
