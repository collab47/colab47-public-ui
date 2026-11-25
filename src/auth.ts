import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type { AuthTokens, AuthUser, LoginResponse } from '$lib/api/types';

interface BackendSessionBridge {
  backendUser?: AuthUser;
  backendTokens?: AuthTokens;
  isNewUser?: boolean;
  accountRestored?: boolean;
  backendSyncError?: string;
}

async function exchangeGoogleIdTokenWithBackend(idToken: string): Promise<BackendSessionBridge> {
  const apiBase = (
    privateEnv.PRIVATE_API_BASE_URL ||
    publicEnv.PUBLIC_API_BASE_URL ||
    'http://localhost:4000/api/v1'
  ).replace(/\/+$/, '');
  const endpoint = `${apiBase}/auth/google`;

  console.info('[Collab47 Auth][Google OAuth] -> POST', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
      console.error('[Collab47 Auth][Google OAuth] x', response.status, endpoint, errorBody);
      return {
        backendSyncError: errorBody.message ?? 'Google login could not be verified by API.',
      };
    }

    const data = (await response.json()) as LoginResponse;
    console.info('[Collab47 Auth][Google OAuth] <-', response.status, endpoint, {
      userId: data.user.id,
      handle: data.user.handle,
      isNewUser: data.isNewUser ?? false,
    });
    return {
      backendUser: data.user,
      backendTokens: data.tokens,
      isNewUser: data.isNewUser ?? false,
      accountRestored: data.accountRestored ?? false,
    };
  } catch (err) {
    console.error('[Collab47 Auth][Google OAuth] NETWORK ERROR', endpoint, err);
    return {
      backendSyncError: 'Backend API unreachable during Google sign-in.',
    };
  }
}

export const { handle, signIn, signOut } = SvelteKitAuth(async () => ({
  providers: [
    Google({
      clientId: privateEnv.GOOGLE_CLIENT_ID ?? '',
      clientSecret: privateEnv.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  secret: privateEnv.AUTH_SECRET || 'dev-fallback-secret-replace-in-env-32chars',
  trustHost: privateEnv.AUTH_TRUST_HOST !== 'false',
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === 'google' && account.id_token) {
        const bridged = await exchangeGoogleIdTokenWithBackend(account.id_token);
        Object.assign(token, bridged);
      }
      return token;
    },
    async session({ session, token }) {
      const bridged = token as unknown as BackendSessionBridge;
      if (bridged.backendUser) {
        session.backendUser = bridged.backendUser;
      }
      if (bridged.backendTokens) {
        session.backendTokens = bridged.backendTokens;
      }
      session.isNewUser = bridged.isNewUser ?? false;
      session.accountRestored = bridged.accountRestored ?? false;
      if (bridged.backendSyncError) {
        session.backendSyncError = bridged.backendSyncError;
      }
      return session;
    },
  },
}));
