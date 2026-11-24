import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      scope: '/',
      base: '/',
      manifest: {
        name: 'Collab47: Your Innovation, Your Identity',
        short_name: 'Collab47',
        description:
          'Connecting students, researchers, faculty, industry, and institutions to build verified STEM projects.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#6D4AFF',
        background_color: '#F5F6FB',
        categories: ['education', 'productivity', 'social'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
      },
      kit: {
        includeVersionFile: true,
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        type: 'module',
        navigateFallback: '/',
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: false,
  },
});
