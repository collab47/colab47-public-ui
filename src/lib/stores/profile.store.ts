import { map } from 'nanostores';
import { profileApi } from '$lib/api/profile.api';
import type { FullProfile, ProfileEditorOptions } from '$lib/api/types';
import { updateAuthUser } from './auth.store';

export interface ProfileStoreState {
  profile: FullProfile | null;
  options: ProfileEditorOptions | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const profileState = map<ProfileStoreState>({
  profile: null,
  options: null,
  isLoading: false,
  isSaving: false,
  error: null,
});

export function setProfile(profile: FullProfile): void {
  profileState.setKey('profile', profile);
  profileState.setKey('error', null);
  updateAuthUser({
    name: profile.name,
    handle: profile.handle,
    accountType: profile.accountType,
    avatarUrl: profile.avatarUrl,
    college: profile.college,
    branch: profile.branch,
    yearOfStudy: profile.yearOfStudy,
    city: profile.city,
  });
}

export async function loadMyProfile(): Promise<FullProfile | null> {
  profileState.setKey('isLoading', true);
  profileState.setKey('error', null);
  try {
    const profile = await profileApi.getMyProfile();
    setProfile(profile);
    return profile;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load profile.';
    profileState.setKey('error', message);
    return null;
  } finally {
    profileState.setKey('isLoading', false);
  }
}

export async function loadProfileOptions(): Promise<ProfileEditorOptions | null> {
  const existing = profileState.get().options;
  if (existing) return existing;

  try {
    const options = await profileApi.getOptions();
    profileState.setKey('options', options);
    return options;
  } catch {
    return null;
  }
}

export function clearProfileState(): void {
  profileState.set({
    profile: null,
    options: profileState.get().options,
    isLoading: false,
    isSaving: false,
    error: null,
  });
}
