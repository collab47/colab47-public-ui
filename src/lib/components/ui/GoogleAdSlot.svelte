<script lang="ts">
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';
  import { isAuthenticated, shouldShowAds, t } from '$lib/stores';
  import Icon from './Icon.svelte';

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

  const DEFAULT_ADSENSE_CLIENT = 'ca-pub-8499865824729612';
  const adsenseClient = $derived(
    env.PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim() || DEFAULT_ADSENSE_CLIENT,
  );
  let adPushed = $state(false);

  onMount(() => {
    if (!$shouldShowAds || !adsenseClient || typeof window === 'undefined') return;

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"], script[data-c47-adsense="true"]',
    );

    const pushAd = (): void => {
      if (adPushed) return;
      try {
        const w = window as unknown as { adsbygoogle?: unknown[] };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
        adPushed = true;
      } catch {
        // Ignore AdSense push failures in dev / ad-blocker environments
      }
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`;
      script.crossOrigin = 'anonymous';
      script.dataset.c47Adsense = 'true';
      script.onload = pushAd;
      document.head.appendChild(script);
    } else {
      pushAd();
    }
  });
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
      <a
        href={$isAuthenticated ? '/membership' : '/signup'}
        class="inline-flex items-center gap-1 text-xs font-semibold text-logo-saffron no-underline transition hover:text-logo-green hover:no-underline"
      >
        <Icon name="sparkles" size={13} />
        <span>{$t.membership.removeAdsCta}</span>
      </a>
    </div>

    {#if adsenseClient}
      <ins
        class="adsbygoogle block"
        style={variant === 'skyscraper' ? 'display:block;min-height:300px' : 'display:block'}
        data-ad-client={adsenseClient}
        data-ad-slot={slot}
        data-ad-format={variant === 'skyscraper' ? 'vertical' : 'auto'}
        data-full-width-responsive="true"
      ></ins>
    {:else}
      <div
        class="flex {variant === 'sidebar' || variant === 'skyscraper'
          ? 'flex-col items-start justify-between gap-3'
          : 'flex-wrap items-center justify-between gap-3'} {variant === 'skyscraper'
          ? 'min-h-[260px]'
          : ''} rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3.5"
      >
        <div class="flex flex-col gap-1">
          <strong class="text-sm font-bold text-slate-800">
            Google Display Ad ({slot})
          </strong>
          <p class="text-xs leading-relaxed text-slate-500">
            Served via Google AdSense on <strong>Free Membership</strong>. Upgrade to
            <strong>Premium</strong> for a 100% ad-free Collab47 workspace.
          </p>
        </div>
        <a
          href={$isAuthenticated ? '/membership' : '/signup'}
          class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-logo-saffron px-3 py-1.5 text-xs font-semibold text-white no-underline transition hover:bg-logo-saffron-hover hover:no-underline"
        >
          <span>{$t.membership.goAdFreeBtn}</span>
          <Icon name="arrow-right" size={13} />
        </a>
      </div>
    {/if}
  </aside>
{/if}
