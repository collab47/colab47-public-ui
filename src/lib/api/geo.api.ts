import { apiRequest } from './client';

export interface DetectedGeoLocation {
  ip: string | null;
  isLocalhost: boolean;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  source: string;
  isAllowed: boolean;
  blockedReason: string | null;
  blockedCountries: string[];
  allowedCountries: string[];
  detectedAt?: string | null;
}

export interface GeoCountryPolicy {
  blockedCountries: string[];
  allowedCountries: string[];
}

export interface SaveLocationPayload {
  country?: string;
  countryCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  source?: 'browser_gps' | 'client_ip_lookup' | 'ip_lookup' | 'cdn_header';
}

export const geoApi = {
  detect(): Promise<DetectedGeoLocation> {
    return apiRequest<DetectedGeoLocation>('/geo/detect', { method: 'GET', auth: false });
  },

  getPolicy(): Promise<GeoCountryPolicy> {
    return apiRequest<GeoCountryPolicy>('/geo/policy', { method: 'GET', auth: false });
  },

  updatePolicy(payload: Partial<GeoCountryPolicy>): Promise<GeoCountryPolicy> {
    return apiRequest<GeoCountryPolicy>('/geo/policy', {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  saveLocation(payload: SaveLocationPayload): Promise<DetectedGeoLocation> {
    return apiRequest<DetectedGeoLocation>('/geo/location', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },
};
