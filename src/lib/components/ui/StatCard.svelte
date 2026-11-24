<script lang="ts">
  import { cn } from '$lib/utils';
  import Card, { type CardColor } from './Card.svelte';
  import Icon, { type IconName } from './Icon.svelte';

  interface Props {
    label: string;
    value: string | number;
    delta?: string;
    icon: IconName;
    color?: CardColor;
    class?: string;
  }

  let {
    label,
    value,
    delta,
    icon,
    color = 'blue',
    class: className = '',
  }: Props = $props();

  const paletteMap: Record<
    CardColor,
    { iconBg: string; label: string; value: string; delta: string }
  > = {
    default: {
      iconBg: 'bg-slate-100 text-slate-700',
      label: 'text-slate-600',
      value: 'text-slate-900',
      delta: 'text-slate-500',
    },
    blue: {
      iconBg: 'bg-blue-100 text-blue-700',
      label: 'text-blue-700',
      value: 'text-blue-950',
      delta: 'text-blue-600',
    },
    emerald: {
      iconBg: 'bg-emerald-100 text-emerald-700',
      label: 'text-emerald-700',
      value: 'text-emerald-950',
      delta: 'text-emerald-600',
    },
    violet: {
      iconBg: 'bg-violet-100 text-violet-700',
      label: 'text-violet-700',
      value: 'text-violet-950',
      delta: 'text-violet-600',
    },
    amber: {
      iconBg: 'bg-amber-100 text-amber-700',
      label: 'text-amber-700',
      value: 'text-amber-950',
      delta: 'text-amber-600',
    },
    rose: {
      iconBg: 'bg-rose-100 text-rose-700',
      label: 'text-rose-700',
      value: 'text-rose-950',
      delta: 'text-rose-600',
    },
    cyan: {
      iconBg: 'bg-cyan-100 text-cyan-700',
      label: 'text-cyan-700',
      value: 'text-cyan-950',
      delta: 'text-cyan-600',
    },
    indigo: {
      iconBg: 'bg-indigo-100 text-indigo-700',
      label: 'text-indigo-700',
      value: 'text-indigo-950',
      delta: 'text-indigo-600',
    },
    teal: {
      iconBg: 'bg-teal-100 text-teal-700',
      label: 'text-teal-700',
      value: 'text-teal-950',
      delta: 'text-teal-600',
    },
  };

  const palette = $derived(paletteMap[color]);
</script>

<Card {color} padding="md" class={cn('hover:-translate-y-0.5 hover:shadow-md', className)}>
  <div class="flex items-start justify-between gap-3">
    <div class="flex flex-col gap-1">
      <span class="text-xs font-semibold tracking-wide uppercase {palette.label}">{label}</span>
      <strong class="text-3xl font-extrabold tracking-tight {palette.value}">{value}</strong>
      {#if delta}
        <span class="mt-0.5 inline-flex items-center gap-1 text-xs font-medium {palette.delta}">
          <Icon name="trending-up" size={13} />
          <span>{delta}</span>
        </span>
      {/if}
    </div>
    <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl {palette.iconBg}">
      <Icon name={icon} size={20} />
    </span>
  </div>
</Card>
