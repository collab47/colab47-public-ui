<script lang="ts" module>
  import { tv, type VariantProps } from 'tailwind-variants';

  export const buttonVariants = tv({
    base: 'inline-flex items-center justify-center gap-2 rounded-xl border font-semibold whitespace-nowrap no-underline transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-55 disabled:cursor-not-allowed hover:no-underline',
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground border-transparent shadow-xs hover:bg-brand-hover',
        secondary: 'bg-slate-900 text-white border-transparent hover:bg-slate-800',
        outline: 'bg-background text-foreground border-input hover:bg-muted hover:border-slate-400',
        ghost: 'bg-transparent text-slate-700 border-transparent hover:bg-secondary',
        danger: 'bg-destructive text-destructive-foreground border-transparent hover:bg-rose-700',
      },
      size: {
        sm: 'px-3.5 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  });

  export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
  export type ButtonSize = VariantProps<typeof buttonVariants>['size'];
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    ariaLabel?: string;
    class?: string;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    href,
    disabled = false,
    loading = false,
    fullWidth = false,
    ariaLabel,
    class: className = '',
    onclick,
    children,
  }: Props = $props();

  const isDisabled = $derived(disabled || loading);
  const classes = $derived(cn(buttonVariants({ variant, size, fullWidth }), className));
</script>

{#if href && !isDisabled}
  <a {href} class={classes} aria-label={ariaLabel} {onclick}>
    {@render children?.()}
  </a>
{:else}
  <button
    {type}
    disabled={isDisabled}
    class={classes}
    aria-label={ariaLabel}
    aria-busy={loading}
    {onclick}
  >
    {#if loading}
      <span
        class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      ></span>
    {/if}
    {@render children?.()}
  </button>
{/if}
