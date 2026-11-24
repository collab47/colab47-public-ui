<script lang="ts" module>
  import { tv, type VariantProps } from 'tailwind-variants';

  export const cardVariants = tv({
    base: 'rounded-2xl border transition-all duration-150',
    variants: {
      color: {
        default: 'bg-card border-border text-card-foreground',
        blue: 'bg-blue-50 border-blue-200 text-blue-900',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        violet: 'bg-violet-50 border-violet-200 text-violet-900',
        amber: 'bg-amber-50 border-amber-200 text-amber-900',
        rose: 'bg-rose-50 border-rose-200 text-rose-900',
        cyan: 'bg-cyan-50 border-cyan-200 text-cyan-900',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        teal: 'bg-teal-50 border-teal-200 text-teal-900',
      },
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      elevated: {
        true: 'shadow-md',
        false: 'shadow-xs',
      },
    },
    defaultVariants: {
      color: 'default',
      padding: 'md',
      elevated: false,
    },
  });

  export type CardColor = NonNullable<VariantProps<typeof cardVariants>['color']>;
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    title?: string;
    subtitle?: string;
    surface?: 'paper' | 'cream';
    color?: CardColor;
    padding?: 'sm' | 'md' | 'lg';
    elevated?: boolean;
    class?: string;
    children?: Snippet;
    headerActions?: Snippet;
  }

  let {
    title,
    subtitle,
    surface = 'paper',
    color = 'default',
    padding = 'md',
    elevated = false,
    class: className = '',
    children,
    headerActions,
  }: Props = $props();

  const surfaceOverride = $derived(color === 'default' && surface === 'cream' ? 'bg-muted' : '');
</script>

<section class={cn(cardVariants({ color, padding, elevated }), surfaceOverride, className)}>
  {#if title || subtitle || headerActions}
    <header class="mb-4 flex items-start justify-between gap-4 border-b border-border pb-3.5">
      <div>
        {#if title}
          <h3 class="text-lg font-bold text-foreground">{title}</h3>
        {/if}
        {#if subtitle}
          <p class="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        {/if}
      </div>
      {#if headerActions}
        <div class="flex items-center gap-2">
          {@render headerActions()}
        </div>
      {/if}
    </header>
  {/if}

  {@render children?.()}
</section>
