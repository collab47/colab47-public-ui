/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/svelte" />

import type { Session } from '@auth/sveltekit';
import type { AuthTokens, AuthUser } from '$lib/api/types';

declare module '@auth/sveltekit' {
  interface Session {
    backendUser?: AuthUser;
    backendTokens?: AuthTokens;
    isNewUser?: boolean;
    accountRestored?: boolean;
    backendSyncError?: string;
  }
}

declare global {
  namespace App {
    interface Locals {
      auth(): Promise<Session | null>;
    }
  }
}

export {};
