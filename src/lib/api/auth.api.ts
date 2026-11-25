import { apiRequest, getApiBaseUrl } from './client';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  PublicRolesResponse,
  RegisterRequest,
  RegisterResponse,
  RegistrationMetadataResponse,
} from './types';

export const authApi = {
  getPublicRoles(): Promise<PublicRolesResponse> {
    const fullEndpoint = `${getApiBaseUrl()}/auth/public-roles`;
    console.info('[Collab47 Auth] Fetching Public Roles API:', {
      method: 'GET',
      endpoint: fullEndpoint,
    });
    return apiRequest<PublicRolesResponse>('/auth/public-roles', {
      method: 'GET',
      auth: false,
    });
  },

  getRegistrationMetadata(): Promise<RegistrationMetadataResponse> {
    return apiRequest<RegistrationMetadataResponse>('/auth/metadata', {
      method: 'GET',
      auth: false,
    });
  },

  register(payload: RegisterRequest): Promise<RegisterResponse> {
    const fullEndpoint = `${getApiBaseUrl()}/auth/register`;
    console.info('[Collab47 Auth] Calling Registration API:', {
      method: 'POST',
      endpoint: fullEndpoint,
      email: payload.email,
      mobileCountryCode: payload.mobileCountryCode,
      hasMobileNumber: Boolean(payload.mobileNumber),
      accountType: payload.accountType,
    });
    return apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  login(payload: LoginRequest): Promise<LoginResponse> {
    const fullEndpoint = `${getApiBaseUrl()}/auth/login`;
    console.info('[Collab47 Auth] Calling Login API:', {
      method: 'POST',
      endpoint: fullEndpoint,
      email: payload.email,
      rememberMe: Boolean(payload.rememberMe),
    });
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  me(): Promise<AuthUser> {
    return apiRequest<AuthUser>('/auth/me', {
      method: 'GET',
      auth: true,
    });
  },

  checkAvailability(params: {
    email?: string;
    handle?: string;
  }): Promise<{ emailAvailable?: boolean; handleAvailable?: boolean }> {
    const query = new URLSearchParams();
    if (params.email) query.set('email', params.email);
    if (params.handle) query.set('handle', params.handle);
    return apiRequest(`/auth/check-availability?${query.toString()}`);
  },

  verifyEmail(token: string): Promise<{ verified: boolean; message: string }> {
    return apiRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      auth: false,
    });
  },

  resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    return apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: { email },
      auth: false,
    });
  },

  forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    });
  },

  resetPassword(payload: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },
};
