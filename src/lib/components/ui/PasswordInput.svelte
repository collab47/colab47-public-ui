<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import Icon from './Icon.svelte';

  interface Props {
    id: string;
    label: string;
    value?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    autocomplete?: HTMLInputAttributes['autocomplete'];
    showStrengthMeter?: boolean;
    onblur?: () => void;
    oninput?: (value: string) => void;
  }

  let {
    id,
    label,
    value = $bindable(''),
    placeholder = 'Enter password',
    error,
    required = false,
    disabled = false,
    autocomplete = 'current-password',
    showStrengthMeter = false,
    onblur,
    oninput,
  }: Props = $props();

  let revealed = $state(false);

  const checks = $derived({
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /\d/.test(value),
    special: /[^A-Za-z0-9\s]/.test(value),
  });

  const strengthMessage = $derived.by(() => {
    const len = value.length;
    if (len === 0) return '';
    if (len < 8) {
      const rem = 8 - len;
      return `${rem} more character${rem === 1 ? '' : 's'} to reach the 8-character minimum.`;
    }
    if (!checks.upper || !checks.lower || !checks.digit || !checks.special) {
      return 'Add uppercase, lowercase, a digit, and a special character.';
    }
    if (len < 12) return 'Good - meets the 8-character minimum.';
    return 'Nice and long.';
  });

  const strengthLevel = $derived.by(() => {
    if (value.length === 0) return 0;
    const passed = Object.values(checks).filter(Boolean).length;
    if (value.length >= 12 && passed === 5) return 3;
    if (passed === 5) return 2;
    return 1;
  });
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
    <span class="inline-flex items-center pl-3 text-slate-400" aria-hidden="true">
      <Icon name="lock" size={17} />
    </span>
    <input
      {id}
      type={revealed ? 'text' : 'password'}
      bind:value
      {placeholder}
      {required}
      {disabled}
      {autocomplete}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      class="w-full border-0 bg-transparent px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
      {onblur}
      oninput={(e) => oninput?.((e.currentTarget as HTMLInputElement).value)}
    />
    <button
      type="button"
      class="inline-flex cursor-pointer items-center px-3 text-slate-400 transition hover:text-slate-800"
      onclick={() => (revealed = !revealed)}
      aria-label={revealed ? 'Hide password' : 'Show password'}
    >
      <Icon name={revealed ? 'eye-off' : 'eye'} size={17} />
    </button>
  </div>

  {#if showStrengthMeter && value.length > 0}
    <div class="mt-0.5 flex flex-col gap-1">
      <div class="grid grid-cols-3 gap-1.5" aria-hidden="true">
        <span class="h-1 rounded-full {strengthLevel >= 1 ? 'bg-rose-500' : 'bg-slate-200'}"></span>
        <span class="h-1 rounded-full {strengthLevel >= 2 ? 'bg-brand' : 'bg-slate-200'}"></span>
        <span class="h-1 rounded-full {strengthLevel >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}"></span>
      </div>
      <p class="text-xs {strengthLevel >= 2 ? 'text-emerald-600 font-medium' : 'text-slate-500'}">
        {strengthMessage}
      </p>
    </div>
  {/if}

  {#if error}
    <p id="{id}-error" class="inline-flex items-center gap-1 text-xs font-medium text-rose-600" role="alert">
      <Icon name="alert-circle" size={13} />
      <span>{error}</span>
    </p>
  {/if}
</div>
