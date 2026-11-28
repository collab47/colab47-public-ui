<script lang="ts">
  import { page } from '$app/state';
  import { shouldShowAds, t } from '$lib/stores';
  import AdUnit from './AdUnit.svelte';

  interface Props {
    slot?: string;
    variant?: 'banner' | 'sidebar' | 'skyscraper' | 'inline';
    label?: string;
    class?: string;
  }

  let {
    slot = 'collab47-default',
    variant = 'banner',
    label,
    class: className = '',
  }: Props = $props();
</script>

{#if $shouldShowAds}
  <aside
    aria-label="Advertisement"
    class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/90 {variant === 'sidebar' || variant === 'skyscraper'
      ? 'p-3.5'
      : 'px-5 py-4'} {className}"
  >
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <span class="text-[11px] font-bold tracking-wider uppercase text-slate-400">
        {label ?? $t.membership.sponsoredLabel}
      </span>
    </div>

    {#key page.url.pathname}
      <AdUnit
        adSlot={slot}
        {variant}
        adFormat={variant === 'skyscraper' ? 'vertical' : 'auto'}
        fullWidthResponsive={true}
        minHeight={variant === 'skyscraper' ? 300 : undefined}
      />
    {/key}
  </aside>
{/if}
