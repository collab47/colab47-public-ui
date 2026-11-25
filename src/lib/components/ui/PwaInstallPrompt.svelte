<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { useRegisterSW } from 'virtual:pwa-register/svelte';
  import {
    dismissPwaPrompt,
    initPwa,
    pushToast,
    pwaState,
    t,
    triggerPwaInstall,
  } from '$lib/stores';
  import Icon from './Icon.svelte';

  let needRefreshFlag = $state(false);
  let updateSwFn = $state<(() => Promise<void>) | null>(null);
  let showManualSteps = $state(false);
  let installing = $state(false);
  let mounted = $state(false);

  const isLandingPage = $derived($page.url.pathname === '/');

  const shouldRenderInstall = $derived(
    mounted &&
      !isLandingPage &&
      !$pwaState.isStandalone &&
      !$pwaState.isInstalled &&
      !$pwaState.isDismissed,
  );

  onMount(() => {
    mounted = true;
    initPwa();

    let unsubRefresh: (() => void) | undefined;
    if (browser) {
      try {
        const sw = useRegisterSW({
          immediate: true,
          onRegisterError(error) {
            console.warn('[PWA] Service worker registration skipped:', error);
          },
        });
        updateSwFn = () => Promise.resolve(sw.updateServiceWorker(true));
        unsubRefresh = sw.needRefresh.subscribe((val) => {
          needRefreshFlag = val;
        });
      } catch {
        // Ignore if service worker virtual module is unavailable
      }
    }

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && shouldRenderInstall) {
        dismissPwaPrompt();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      unsubRefresh?.();
      window.removeEventListener('keydown', handleKey);
    };
  });

  async function handleInstall(): Promise<void> {
    installing = true;
    try {
      const outcome = await triggerPwaInstall();
      if (outcome === 'accepted') {
        pushToast({
          tone: 'success',
          title: 'Collab47 App Installed!',
          message: 'Launch Collab47 directly from your home screen or desktop.',
        });
      } else if (outcome === 'manual') {
        showManualSteps = !showManualSteps;
      }
    } finally {
      installing = false;
    }
  }
</script>

{#if needRefreshFlag}
  <div
    role="alert"
    style="position: fixed; right: 16px; bottom: 16px; z-index: 9999;"
    class="flex items-center gap-2.5 rounded-full border border-[#DDD6FE] bg-[#1E1B4B] px-3.5 py-2 text-xs font-semibold text-white shadow-2xl"
  >
    <Icon name="sparkles" size={14} class="shrink-0 text-[#A78BFA]" />
    <span>{$t.ui.appUpdateReady}</span>
    <button
      type="button"
      onclick={() => void updateSwFn?.()}
      class="cursor-pointer rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-2.5 py-1 text-[11px] font-bold text-white transition hover:brightness-110"
    >
      {$t.ui.reload}
    </button>
    <button
      type="button"
      onclick={() => (needRefreshFlag = false)}
      aria-label="Dismiss update notice"
      class="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
    >
      <Icon name="x" size={13} />
    </button>
  </div>
{:else if shouldRenderInstall}
  <div
    role="dialog"
    aria-modal="false"
    aria-labelledby="pwa-floater-title"
    aria-describedby="pwa-floater-desc"
    style="position: fixed; right: 16px; bottom: 16px; z-index: 9999;"
    class="w-[315px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#C4B5FD] bg-white p-3.5 shadow-[0_14px_38px_rgba(30,27,75,0.22)] ring-1 ring-[#6D4AFF]/15"
  >
    <div class="flex items-start gap-2.5">
      <img
        src="/icons/icon-192.png"
        alt="Collab47"
        width="40"
        height="40"
        class="h-10 w-10 shrink-0 rounded-xl border border-[#ECEAF9] shadow-xs"
      />
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-1.5">
          <p id="pwa-floater-title" class="text-xs font-extrabold text-[#1E1B4B]">
            {$t.ui.installFloaterTitle}
          </p>
          <button
            type="button"
            onclick={dismissPwaPrompt}
            aria-label="Close install app floater"
            class="-mt-1 -mr-1 inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        <p id="pwa-floater-desc" class="mt-0.5 text-[11px] leading-snug text-slate-600">
          {$t.ui.installFloaterDesc}
        </p>

        <div class="mt-2.5 flex items-center gap-2">
          <button
            type="button"
            disabled={installing}
            onclick={() => void handleInstall()}
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#9333EA] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition hover:brightness-105 disabled:opacity-60"
          >
            <Icon name="rocket" size={12} />
            <span>{installing ? '...' : $t.ui.installApp}</span>
          </button>
          <button
            type="button"
            onclick={dismissPwaPrompt}
            class="cursor-pointer rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            {$t.ui.notNow}
          </button>
        </div>
      </div>
    </div>

    {#if showManualSteps}
      <div class="mt-2.5 rounded-xl border border-[#ECEAF9] bg-[#FAF9FF] px-2.5 py-2 text-[11px] leading-snug text-slate-600">
        {#if $pwaState.isIos}
          Tap <strong>Share</strong> in Safari, then choose <strong>"Add to Home Screen"</strong>.
        {:else}
          Click the <strong>Install</strong> icon in your browser address bar or open browser menu → <strong>"Install Collab47"</strong>.
        {/if}
      </div>
    {/if}
  </div>
{/if}
