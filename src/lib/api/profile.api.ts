import { apiRequest } from './client';
import type {
  AccountType,
  CreateEducationRequest,
  CreateExperienceRequest,
  CreateSkillRequest,
  DobPrivacy,
  EducationItem,
  ExperienceItem,
  FullProfile,
  OccupationCode,
  ProfileEditorOptions,
  ProfileExpertise,
  ProfileVisibility,
  SkillItem,
  SocialLinkItem,
  SocialPlatformCode,
  SpecializationOption,
  YearOfStudy,
} from './types';

export interface CompleteOnboardingPayload {
  accountType: AccountType;
  occupations?: OccupationCode[];
  occupationOther?: string;
  college?: string;
  branch?: string;
  yearOfStudy?: YearOfStudy;
  city?: string;
  broadDomainIds?: string[];
  areasOfInterest?: string[];
  handle?: string;
  avatarUrl?: string;
}

export interface UpdateBasicInfoPayload {
  name?: string;
  handle?: string;
  headline?: string | null;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  dateOfBirth?: string | null;
  dobPrivacy?: DobPrivacy;
  accountType?: AccountType;
  occupations?: OccupationCode[];
  occupationOther?: string | null;
  college?: string | null;
  branch?: string | null;
  yearOfStudy?: YearOfStudy | null;
  studentId?: string | null;
  city?: string | null;
  visibility?: ProfileVisibility;
  openToCollaborations?: boolean;
}

export interface UpdateAboutPayload {
  headline?: string | null;
  bio?: string | null;
  professionalSummary?: string | null;
}

export interface UpdateExpertisePayload {
  broadDomainIds?: string[];
  specializationIds?: string[];
  areasOfInterest?: string[];
  interests?: string[];
}

export interface UpsertSocialLinksPayload {
  links: Array<{
    platform: SocialPlatformCode;
    label: string;
    url: string;
  }>;
}

export const profileApi = {
  getMyProfile(): Promise<FullProfile> {
    return apiRequest<FullProfile>('/profile', { auth: true });
  },

  getPublicProfile(handle: string): Promise<FullProfile> {
    return apiRequest<FullProfile>(`/profile/u/${encodeURIComponent(handle)}`);
  },

  completeOnboarding(payload: CompleteOnboardingPayload): Promise<FullProfile> {
    return apiRequest<FullProfile>('/profile/onboarding', {
      method: 'PUT',
      body: payload,
      auth: true,
    });
  },

  updateBasicInfo(payload: UpdateBasicInfoPayload): Promise<FullProfile> {
    return apiRequest<FullProfile>('/profile/basic-info', {
      method: 'PATCH',
      body: payload,
      auth: true,
    });
  },

  updateAbout(payload: UpdateAboutPayload): Promise<FullProfile> {
    return apiRequest<FullProfile>('/profile/about', {
      method: 'PATCH',
      body: payload,
      auth: true,
    });
  },

  createEducation(payload: CreateEducationRequest): Promise<EducationItem> {
    return apiRequest<EducationItem>('/profile/education', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },

  deleteEducation(id: string): Promise<{ id: string; deleted: boolean }> {
    return apiRequest(`/profile/education/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  createExperience(payload: CreateExperienceRequest): Promise<ExperienceItem> {
    return apiRequest<ExperienceItem>('/profile/experiences', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },

  deleteExperience(id: string): Promise<{ id: string; deleted: boolean }> {
    return apiRequest(`/profile/experiences/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  updateExpertise(payload: UpdateExpertisePayload): Promise<ProfileExpertise> {
    return apiRequest<ProfileExpertise>('/profile/expertise', {
      method: 'PUT',
      body: payload,
      auth: true,
    });
  },

  createSkill(payload: CreateSkillRequest): Promise<SkillItem> {
    return apiRequest<SkillItem>('/profile/skills', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },

  deleteSkill(id: string): Promise<{ id: string; deleted: boolean }> {
    return apiRequest(`/profile/skills/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  upsertSocialLinks(payload: UpsertSocialLinksPayload): Promise<SocialLinkItem[]> {
    return apiRequest<SocialLinkItem[]>('/profile/social-links', {
      method: 'PUT',
      body: payload,
      auth: true,
    });
  },

  deleteSocialLink(id: string): Promise<{ id: string; deleted: boolean }> {
    return apiRequest(`/profile/social-links/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  getOptions(): Promise<ProfileEditorOptions> {
    return apiRequest<ProfileEditorOptions>('/profile/options');
  },

  getSpecializations(broadDomainId?: string): Promise<SpecializationOption[]> {
    const query = broadDomainId ? `?broadDomainId=${encodeURIComponent(broadDomainId)}` : '';
    return apiRequest<SpecializationOption[]>(`/profile/options/specializations${query}`);
  },
};
