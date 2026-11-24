import { env } from '$env/dynamic/public';
import {
  authState,
  clearAuthSession,
  hydrateAuth,
  updateAuthTokens,
} from '$lib/stores/auth.store';
import type { ApiErrorPayload, AuthTokens } from './types';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly fieldErrors: Record<string, string>;
  readonly requestId?: string;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.statusCode = payload.statusCode;
    this.errorCode = payload.errorCode;
    this.requestId = payload.requestId;
    this.fieldErrors = {};

    if (payload.details) {
      for (const item of payload.details) {
        if (item.messages.length > 0 && !this.fieldErrors[item.field]) {
          this.fieldErrors[item.field] = item.messages[0];
        }
      }
    }
  }
}

export function getApiBaseUrl(): string {
  const configured = env.PUBLIC_API_BASE_URL?.trim();
  return (configured || 'http://localhost:4000/api/v1').replace(/\/+$/, '');
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

let refreshPromise: Promise<AuthTokens | null> | null = null;

async function attemptTokenRefresh(): Promise<AuthTokens | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = authState.get().refreshToken;
  if (!refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        clearAuthSession();
        return null;
      }

      const data = (await response.json()) as { tokens: AuthTokens };
      updateAuthTokens(data.tokens);
      return data.tokens;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function isJwtExpiredOrExpiring(token: string, bufferSeconds = 60): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return Date.now() >= (payload.exp - bufferSeconds) * 1000;
  } catch {
    return false;
  }
}

/**
 * Hydrates persisted 30-day (or 7-day) session from localStorage if not yet hydrated,
 * silently rotates an expired 15-minute access token using the valid refresh token,
 * and returns true when an active authenticated session is ready.
 */
export async function ensureFreshSession(): Promise<boolean> {
  if (!authState.get().isHydrated) {
    hydrateAuth();
  }
  const { accessToken, refreshToken } = authState.get();
  if (!accessToken) return false;
  if (refreshToken && isJwtExpiredOrExpiring(accessToken, 60)) {
    const refreshed = await attemptTokenRefresh();
    return Boolean(refreshed ?? authState.get().accessToken);
  }
  return Boolean(authState.get().accessToken);
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, auth = false, retryOnUnauthorized = true } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = authState.get().accessToken;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      return apiRequest<TResponse>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  if (!response.ok) {
    let payload: ApiErrorPayload;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = {
        statusCode: response.status,
        errorCode: 'HTTP_ERROR',
        message: response.statusText || 'Request failed.',
      };
    }
    throw new ApiError(payload);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
