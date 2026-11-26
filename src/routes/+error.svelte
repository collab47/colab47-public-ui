<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { Icon, Wordmark } from '$ui';

  const statusCode = $derived($page.status || 500);
  const errorMessage = $derived(
    $page.error?.message ||
      (statusCode === 404
        ? 'The page you are looking for could not be found.'
        : 'An unexpected error occurred while loading this page.'),
  );

  onMount(() => {
    const msg = $page.error?.message ?? '';
    const isChunkMismatch =
      msg.includes('dynamically imported module') ||
      msg.includes('ChunkLoadError') ||
      msg.includes('module script failed');
    if (isChunkMismatch) {
      const key = 'c47_error_reload_at';
      const last = Number(window.sessionStorage.getItem(key) || '0');
      if (Date.now() - last > 15_000) {
        window.sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      }
    }
  });

  function handleHardReload(): void {
    window.location.reload();
  }
</script>

<svelte:head>
  <title>{statusCode} · Collab47</title>
</svelte:head>

<main
  class="flex min-h-[calc(100vh-4.25rem)] flex-col items-center justify-center bg-[#070312] px-4 py-16 text-center text-white"
>
  <div
    class="w-full max-w-md rounded-3xl border border-purple-400/25 bg-[#11072A]/90 p-8 shadow-[0_24px_80px_rgba(124,58,237,0.28)] backdrop-blur-md"
  >
    <div class="mb-5 flex justify-center">
      <Wordmark size="md" tone="light" href="/" />
    </div>

    <span
      class="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1 text-xs font-bold tracking-wider text-purple-200"
    >
      Error {statusCode}
    </span>

    <h1 class="mt-4 text-2xl font-extrabold tracking-tight text-white">
      {statusCode === 404 ? 'Page not found' : 'Something went wrong'}
    </h1>
    <p class="mt-2 text-sm leading-relaxed text-purple-200/75">
      {errorMessage}
    </p>

    <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onclick={handleHardReload}
        class="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.45)] transition hover:brightness-110"
      >
        <Icon name="arrow-right" size={15} />
        <span>Reload Page</span>
      </button>
      <a
        href="/"
        class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-purple-100 no-underline transition hover:border-purple-300/60 hover:bg-white/10 hover:text-white hover:no-underline"
      >
        <Icon name="arrow-left" size={15} />
        <span>Back to Home</span>
      </a>
    </div>
  </div>
</main>
