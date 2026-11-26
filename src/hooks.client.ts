import type { HandleClientError } from '@sveltejs/kit';

const CHUNK_RELOAD_KEY = 'c47_chunk_reload_at';

function isStaleChunkError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === 'string'
        ? error
        : '';
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('ChunkLoadError')
  );
}

export const handleError: HandleClientError = ({ error, message }) => {
  if (typeof window !== 'undefined' && isStaleChunkError(error)) {
    const lastReload = Number(window.sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0');
    if (Date.now() - lastReload > 15_000) {
      window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
      window.location.reload();
    }
  }

  console.error('[Collab47 Client Error]', error);
  return {
    message: message || 'Something went wrong while loading this page.',
  };
};
