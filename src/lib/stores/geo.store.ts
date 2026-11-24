import { map } from 'nanostores';
import { geoApi } from '$lib/api/geo.api';
import { authState } from './auth.store';
import { profileState } from './profile.store';

export interface GeoStoreState {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  source: string | null;
  isAllowed: boolean;
  blockedReason: string | null;
  blockedCountries: string[];
  allowedCountries: string[];
  isDetecting: boolean;
  hasDetected: boolean;
}

export const geoState = map<GeoStoreState>({
  country: null,
  countryCode: null,
  region: null,
  city: null,
  latitude: null,
  longitude: null,
  source: null,
  isAllowed: true,
  blockedReason: null,
  blockedCountries: [],
  allowedCountries: [],
  isDetecting: false,
  hasDetected: false,
});

interface ClientIpWhoResponse {
  success?: boolean;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '🌍';
  const upper = code.toUpperCase();
  return String.fromCodePoint(...[...upper].map((c) => 127397 + c.charCodeAt(0)));
}

export function formatCoordinates(lat: number | null, lng: number | null): string | null {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

function evaluateCountryPolicy(
  countryCode: string | null,
  countryName: string | null,
  blockedCountries: string[],
  allowedCountries: string[],
): { isAllowed: boolean; blockedReason: string | null } {
  const code = countryCode?.trim().toUpperCase() || null;
  if (!code) return { isAllowed: true, blockedReason: null };

  if (blockedCountries.includes(code)) {
    return {
      isAllowed: false,
      blockedReason: `Collab47 is currently unavailable in ${countryName || code} (${code}).`,
    };
  }
  if (allowedCountries.length > 0 && !allowedCountries.includes(code)) {
    return {
      isAllowed: false,
      blockedReason: `Collab47 is currently restricted to supported regions and is not available in ${countryName || code} (${code}).`,
    };
  }
  return { isAllowed: true, blockedReason: null };
}

async function fetchClientIpGeo(): Promise<ClientIpWhoResponse | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as ClientIpWhoResponse;
    return data.success === false ? null : data;
  } catch {
    return null;
  }
}

async function persistLocationSilently(): Promise<void> {
  if (!authState.get().accessToken) return;
  const current = geoState.get();
  if (!current.country && current.latitude === null && current.longitude === null) return;

  try {
    const saved = await geoApi.saveLocation({
      country: current.country ?? undefined,
      countryCode: current.countryCode ?? undefined,
      city: current.city ?? undefined,
      latitude: current.latitude ?? undefined,
      longitude: current.longitude ?? undefined,
      source:
        current.source === 'browser_gps' ||
        current.source === 'client_ip_lookup' ||
        current.source === 'ip_lookup' ||
        current.source === 'cdn_header'
          ? current.source
          : 'client_ip_lookup',
    });

    const prof = profileState.get().profile;
    if (prof) {
      profileState.setKey('profile', {
        ...prof,
        country: saved.country ?? prof.country,
        countryCode: saved.countryCode ?? prof.countryCode,
        latitude: saved.latitude ?? prof.latitude,
        longitude: saved.longitude ?? prof.longitude,
        geoSource: saved.source ?? prof.geoSource,
        geoDetectedAt: saved.detectedAt ?? prof.geoDetectedAt,
      });
    }
  } catch {
    // Silent background persistence
  }
}

/**
 * Automatically & silently detects visitor country, latitude, and longitude,
 * enforces backend country filter policy (blocked/allowed ISO-2 codes),
 * and persists location on the authenticated user's profile.
 */
export async function detectUserLocation(options?: {
  forceRefresh?: boolean;
}): Promise<GeoStoreState> {
  const current = geoState.get();
  if (current.isDetecting) return current;

  if (!options?.forceRefresh && current.hasDetected && current.country) {
    return current;
  }

  geoState.setKey('isDetecting', true);

  const existingProfile = profileState.get().profile;
  let country = current.country ?? existingProfile?.country ?? null;
  let countryCode = current.countryCode ?? existingProfile?.countryCode ?? null;
  let region = current.region ?? null;
  let city = current.city ?? existingProfile?.city ?? null;
  let latitude = current.latitude ?? existingProfile?.latitude ?? null;
  let longitude = current.longitude ?? existingProfile?.longitude ?? null;
  let source = current.source ?? existingProfile?.geoSource ?? null;
  let blockedCountries = current.blockedCountries;
  let allowedCountries = current.allowedCountries;

  try {
    // 1. Server CDN headers / IP detection + active country filter policy
    try {
      const serverGeo = await geoApi.detect();
      blockedCountries = serverGeo.blockedCountries ?? [];
      allowedCountries = serverGeo.allowedCountries ?? [];
      if (serverGeo.country) country = serverGeo.country;
      if (serverGeo.countryCode) countryCode = serverGeo.countryCode;
      if (serverGeo.region) region = serverGeo.region;
      if (serverGeo.city) city = serverGeo.city;
      if (typeof serverGeo.latitude === 'number') latitude = serverGeo.latitude;
      if (typeof serverGeo.longitude === 'number') longitude = serverGeo.longitude;
      if (serverGeo.country || typeof serverGeo.latitude === 'number') {
        source = serverGeo.source;
      }
    } catch {
      // Continue with client IP lookup
    }

    // 2. Client IP lookup fallback (for localhost dev or missing headers)
    if (!country || latitude === null || longitude === null) {
      const clientGeo = await fetchClientIpGeo();
      if (clientGeo) {
        country = clientGeo.country ?? country;
        countryCode = clientGeo.country_code?.toUpperCase() ?? countryCode;
        region = clientGeo.region ?? region;
        city = clientGeo.city ?? city;
        if (typeof clientGeo.latitude === 'number') latitude = clientGeo.latitude;
        if (typeof clientGeo.longitude === 'number') longitude = clientGeo.longitude;
        source = 'client_ip_lookup';
      }
    }

    const access = evaluateCountryPolicy(countryCode, country, blockedCountries, allowedCountries);

    geoState.set({
      country,
      countryCode,
      region,
      city,
      latitude,
      longitude,
      source,
      isAllowed: access.isAllowed,
      blockedReason: access.blockedReason,
      blockedCountries,
      allowedCountries,
      isDetecting: false,
      hasDetected: true,
    });

    await persistLocationSilently();
    return geoState.get();
  } catch {
    geoState.setKey('isDetecting', false);
    geoState.setKey('hasDetected', true);
    return geoState.get();
  }
}
