<script lang="ts" module>
  import { tv, type VariantProps } from 'tailwind-variants';

  export const badgeVariants = tv({
    base: 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-snug',
    variants: {
      tone: {
        saffron: 'bg-logo-saffron-soft text-logo-saffron border-logo-saffron-border',
        moss: 'bg-logo-green-soft text-logo-green border-logo-green-border',
        ember: 'bg-rose-50 text-rose-700 border-rose-200',
        neutral: 'bg-slate-100 text-logo-green border-slate-200',
        ink: 'bg-slate-900 text-white border-transparent',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  });

  export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    tone?: BadgeTone;
    class?: string;
    children?: Snippet;
  }

  let { tone = 'neutral', class: className = '', children }: Props = $props();
</script>

<span class={cn(badgeVariants({ tone }), className)}>
  {@render children?.()}
</span>
