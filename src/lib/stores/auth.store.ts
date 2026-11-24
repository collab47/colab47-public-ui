import { computed, map } from 'nanostores';
import type {
  AuthTokens,
  AuthUser,
  MembershipPlanCode,
  MembershipTier,
} from '$lib/api/types';

export interface AuthStoreState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  rememberMe: boolean;
  isHydrated: boolean;
}

const STORAGE_KEY = 'c47_auth_session_v1';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface PersistedSession {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  rememberMe?: boolean;
  expiresAt?: number;
}

export const authState = map<AuthStoreState>({
  user: null,
  accessToken: null,
  refreshToken: null,
  rememberMe: false,
  isHydrated: false,
});

export const isAuthenticated = computed(
  authState,
  (state) => Boolean(state.accessToken && state.user),
);

export const currentUser = computed(authState, (state) => state.user);

export const membershipTier = computed(
  authState,
  (state): MembershipTier => state.user?.membershipTier ?? 'free',
);

export const isPremiumMember = computed(
  authState,
  (state) => state.user?.membershipTier === 'premium' && state.user?.adsEnabled === false,
);

/**
 * Google Ads visibility gate:
 * - Free membership (or unauthenticated guest) -> `true` (show Google Ads)
 * - Premium membership -> `false` (strictly ad-free)
 */
export const shouldShowAds = computed(
  authState,
  (state) => !(state.user?.membershipTier === 'premium' || state.user?.adsEnabled === false),
);

export function updateAuthUserMembership(membership: {
  tier: MembershipTier;
  planCode: MembershipPlanCode;
  adsEnabled: boolean;
  expiresAt: string | null;
}): void {
  updateAuthUser({
    membershipTier: membership.tier,
    membershipPlanCode: membership.planCode,
    adsEnabled: membership.adsEnabled,
    membershipExpiresAt: membership.expiresAt,
  });
}

function persistSession(session: PersistedSession): void {
  if (typeof window === 'undefined') return;
  try {
    if (!session.accessToken) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota / private mode failures
  }
}

export function hydrateAuth(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      authState.setKey('isHydrated', true);
      return;
    }
    const parsed = JSON.parse(raw) as PersistedSession;
    if (typeof parsed.expiresAt === 'number' && Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(STORAGE_KEY);
      authState.set({
        user: null,
        accessToken: null,
        refreshToken: null,
        rememberMe: false,
        isHydrated: true,
      });
      return;
    }
    authState.set({
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      rememberMe: Boolean(parsed.rememberMe),
      isHydrated: true,
    });
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    authState.set({
      user: null,
      accessToken: null,
      refreshToken: null,
      rememberMe: false,
      isHydrated: true,
    });
  }
}

export function setAuthSession(
  user: AuthUser,
  tokens: AuthTokens,
  options?: { rememberMe?: boolean },
): void {
  const rememberMe = options?.rememberMe ?? authState.get().rememberMe ?? false;
  const ttlMs = rememberMe ? THIRTY_DAYS_MS : SEVEN_DAYS_MS;
  authState.set({
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    rememberMe,
    isHydrated: true,
  });
  persistSession({
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    rememberMe,
    expiresAt: Date.now() + ttlMs,
  });
}

export function updateAuthUser(partial: Partial<AuthUser>): void {
  const current = authState.get();
  if (!current.user) return;
  const nextUser = { ...current.user, ...partial };
  authState.setKey('user', nextUser);
  persistSession({
    user: nextUser,
    accessToken: current.accessToken,
    refreshToken: current.refreshToken,
    rememberMe: current.rememberMe,
    expiresAt: Date.now() + (current.rememberMe ? THIRTY_DAYS_MS : SEVEN_DAYS_MS),
  });
}

export function updateAuthTokens(tokens: AuthTokens): void {
  const current = authState.get();
  authState.setKey('accessToken', tokens.accessToken);
  authState.setKey('refreshToken', tokens.refreshToken);
  persistSession({
    user: current.user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    rememberMe: current.rememberMe,
    expiresAt: Date.now() + (current.rememberMe ? THIRTY_DAYS_MS : SEVEN_DAYS_MS),
  });
}

export function clearAuthSession(): void {
  authState.set({
    user: null,
    accessToken: null,
    refreshToken: null,
    rememberMe: false,
    isHydrated: true,
  });
  persistSession({ user: null, accessToken: null, refreshToken: null });
}
