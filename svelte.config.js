import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  vitePlugin: {
    experimental: {
      disableSvelteResolveWarnings: true,
    },
  },
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true,
    }),
    serviceWorker: {
      register: false,
    },
    version: {
      pollInterval: 30_000,
    },
    alias: {
      $ui: 'src/lib/components/ui',
    },
  },
};

export default config;
