<script lang="ts">
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';

  interface Props {
    adSlot: string;
    adClient?: string;
    adFormat?: 'auto' | 'vertical' | 'horizontal' | 'rectangle';
    fullWidthResponsive?: boolean;
    minHeight?: number;
    variant?: 'banner' | 'sidebar' | 'skyscraper' | 'inline';
  }

  const DEFAULT_ADSENSE_CLIENT = 'ca-pub-8499865824729612';
  const NUMERIC_SLOT_RE = /^\d{6,20}$/;

  let {
    adSlot,
    adClient,
    adFormat = 'auto',
    fullWidthResponsive = true,
    minHeight,
    variant = 'banner',
  }: Props = $props();

  const resolvedClient = $derived(
    adClient?.trim() || env.PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim() || DEFAULT_ADSENSE_CLIENT,
  );

  // Google AdSense strictly requires a numeric 10-digit Ad Unit Slot ID (e.g. 1234567890).
  // Map logical slot names (e.g. "home-bottom-banner") to env-configured numeric slot IDs.
  const resolvedNumericSlot = $derived.by(() => {
    const raw = adSlot?.trim() ?? '';
    if (NUMERIC_SLOT_RE.test(raw)) return raw;

    const envSlotByVariant: Record<string, string | undefined> = {
      banner: env.PUBLIC_GOOGLE_ADSENSE_SLOT_BANNER,
      sidebar: env.PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR,
      skyscraper: env.PUBLIC_GOOGLE_ADSENSE_SLOT_SKYSCRAPER,
      inline: env.PUBLIC_GOOGLE_ADSENSE_SLOT_INLINE,
    };

    const candidate =
      envSlotByVariant[variant]?.trim() ||
      env.PUBLIC_GOOGLE_ADSENSE_SLOT_DEFAULT?.trim() ||
      '';

    return NUMERIC_SLOT_RE.test(candidate) ? candidate : '';
  });

  let insEl: HTMLElement | undefined = $state();
  let adStatus: 'loading' | 'filled' | 'unfilled' = $state('loading');
  let isLocalhost = $state(false);

  onMount(() => {
    const host = window.location.hostname;
    isLocalhost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.');

    // If no numeric Google AdSense slot ID is configured yet, show branded fallback cleanly
    // instead of sending an invalid non-numeric data-ad-slot (which causes HTTP 400 + blank box).
    if (!resolvedNumericSlot) {
      adStatus = 'unfilled';
      return;
    }

    const syncAdState = (): void => {
      if (!insEl) return;
      const statusAttr = insEl.getAttribute('data-ad-status');
      const hasIframe = Boolean(insEl.querySelector('iframe'));
      const renderedHeight = insEl.getBoundingClientRect().height;

      if (statusAttr === 'filled' || (hasIframe && renderedHeight > 20)) {
        adStatus = 'filled';
      } else if (statusAttr === 'unfilled') {
        adStatus = 'unfilled';
      }
    };

    let observer: MutationObserver | null = null;
    if (insEl && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(syncAdState);
      observer.observe(insEl, {
        attributes: true,
        attributeFilter: ['data-ad-status', 'style'],
        childList: true,
        subtree: true,
      });
    }

    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense blocked or failed to load:', e);
      adStatus = 'unfilled';
    }

    // AdSense returns unfilled / blank on localhost, when ad-blocked, or before site approval.
    // After 1.8s, if no creative rendered, display the branded Collab47 sponsor fallback card.
    const fallbackTimer = window.setTimeout(() => {
      syncAdState();
      if (adStatus === 'loading') {
        adStatus = 'unfilled';
      }
    }, 1800);

    return () => {
      window.clearTimeout(fallbackTimer);
      observer?.disconnect();
    };
  });

  const isCompact = $derived(variant === 'sidebar' || variant === 'skyscraper');
</script>

<div class="ad-container relative w-full">
  <ins
    bind:this={insEl}
    class="adsbygoogle"
    style={adStatus === 'unfilled'
      ? 'display:block;height:0;overflow:hidden'
      : minHeight
        ? `display:block;min-height:${minHeight}px`
        : 'display:block;min-height:90px'}
    data-ad-client={resolvedClient}
    data-ad-slot={resolvedNumericSlot || undefined}
    data-ad-format={adFormat}
    data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    data-adtest={isLocalhost ? 'on' : undefined}
  ></ins>

  {#if adStatus === 'loading'}
    <div
      class="flex items-center justify-center rounded-xl border border-dashed border-purple-200 bg-purple-50/50 text-xs font-medium text-purple-600/80 {isCompact
        ? 'min-h-[160px] p-4 text-center'
        : 'min-h-[90px] px-4 py-5'}"
    >
      Loading Google AdSense unit…
    </div>
  {:else if adStatus === 'unfilled'}
    <div
      class="rounded-xl border border-purple-200/80 bg-gradient-to-br from-[#faf5ff] via-white to-[#f3e8ff]/70 {isCompact
        ? 'p-4'
        : 'flex flex-wrap items-center justify-between gap-4 px-5 py-4'}"
    >
      <div class={isCompact ? 'space-y-2' : 'min-w-0 flex-1 space-y-1'}>
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase text-purple-700"
          >
            Collab47 Spotlight
          </span>
          {#if isLocalhost || !resolvedNumericSlot}
            <span class="text-[10px] font-semibold text-slate-400">
              {!resolvedNumericSlot
                ? 'Set PUBLIC_GOOGLE_ADSENSE_SLOT_* for live AdSense'
                : 'Google AdSense Preview (localhost)'}
            </span>
          {/if}
        </div>
        <p class="text-sm font-bold text-slate-900">
          Publish your first 2 innovation projects free on Collab47
        </p>
        <p class="text-xs leading-relaxed text-slate-600">
          Build verified proof of work with students, researchers, startups &amp; R&amp;D labs across
          India. Earn activity badges for every upload, post &amp; project.
        </p>
      </div>

      <div class={isCompact ? 'mt-3' : 'shrink-0'}>
        <a
          href="/projects/new"
          class="inline-flex items-center justify-center rounded-full bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white no-underline shadow-sm transition hover:bg-[#6D28D9] hover:no-underline"
        >
          Launch a Project →
        </a>
      </div>
    </div>
  {/if}
</div>
