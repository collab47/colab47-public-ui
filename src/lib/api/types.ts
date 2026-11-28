export type RoleCategory = 'public' | 'private';

export type PublicRoleCode =
  | 'student'
  | 'researcher'
  | 'scientist'
  | 'faculty'
  | 'industry'
  | 'startup'
  | 'government'
  | 'others';

export type AccountType = PublicRoleCode | 'institution' | 'mentor';

export interface PublicRoleOption {
  id: string;
  roleCode: AccountType;
  roleName: string;
  roleCategory: RoleCategory;
  roleDescription: string | null;
  badgeLabel: string | null;
  hierarchyLevel?: number;
}

export type ExternalRoleOption = PublicRoleOption;

export interface PublicRolesResponse {
  roles: PublicRoleOption[];
  total: number;
}

export interface RegistrationMetadataResponse {
  accountTypes: PublicRoleOption[];
  occupations: Array<{
    id: string;
    code: OccupationCode;
    label: string;
    requiresSpecification: boolean;
    displayOrder: number;
  }>;
  dpdpPolicyVersion: string;
}

export type OccupationCode =
  | 'undergraduate_student'
  | 'postgraduate_student'
  | 'research_scholar_phd'
  | 'faculty_academic'
  | 'scientist_researcher'
  | 'industry_professional'
  | 'entrepreneur_startup_founder'
  | 'postdoctoral_researcher'
  | 'consultant'
  | 'other';

export type DobPrivacy = 'public' | 'connections_only' | 'private';
export type ProfileVisibility =
  | 'public'
  | 'connections_only'
  | 'private_link'
  | 'campus_only'
  | 'private';
export type YearOfStudy = '1' | '2' | '3' | '4' | '5' | 'graduated';
export type QualificationLevel =
  | 'undergraduate'
  | 'postgraduate'
  | 'phd_doctorate'
  | 'postdoctoral'
  | 'diploma_certificate'
  | 'other';
export type StemDisciplineCategory =
  | 'engineering_and_technology'
  | 'computer_science_and_digital_technologies'
  | 'natural_and_physical_sciences'
  | 'life_sciences_and_biotechnology'
  | 'medical_and_health_technologies'
  | 'emerging_and_interdisciplinary_technologies';
export type ExperienceType =
  | 'work'
  | 'internship'
  | 'project'
  | 'research'
  | 'volunteer'
  | 'leadership';
export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'internship'
  | 'self_employed'
  | 'other';
export type SkillCategory =
  | 'research_scientific'
  | 'engineering_technical'
  | 'digital_analytical'
  | 'business_innovation'
  | 'leadership_collaboration'
  | 'technical'
  | 'tool'
  | 'language'
  | 'soft';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SocialPlatformCode =
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'portfolio'
  | 'google_scholar'
  | 'orcid'
  | 'youtube';

export type MembershipTier = 'free' | 'premium';
export type MembershipPlanCode = 'free' | 'premium_monthly' | 'premium_yearly';
export type BillingCycle = 'forever' | 'monthly' | 'yearly';
export type MembershipStatus = 'active' | 'pending_payment' | 'cancelled' | 'expired';
export type PaymentGateway = 'razorpay' | 'cashfree' | 'phonepe' | 'sandbox_inr';
export type IndianPaymentMethod =
  | 'upi'
  | 'credit_card'
  | 'debit_card'
  | 'netbanking'
  | 'bank_transfer';
export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
export type PaymentPurpose = 'project_post' | 'membership';

export interface ValidationFieldError {
  field: string;
  messages: string[];
}

export interface ApiErrorPayload {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: ValidationFieldError[];
  requestId?: string;
  timestamp?: string;
  path?: string;
}

export interface AssignedRole {
  roleId: string;
  roleCode: string;
  roleName: string;
  badgeLabel: string | null;
  isPrimary: boolean;
  scopeType: string;
}

export interface AuthUser {
  id: string;
  email: string;
  handle: string;
  name: string;
  mobileCountryCode?: string | null;
  mobileNumber?: string | null;
  accountType: AccountType;
  primaryRole: string;
  primaryRoleId: string | null;
  roles: AssignedRole[];
  occupations: string[];
  occupationOther: string | null;
  college: string | null;
  branch: string | null;
  yearOfStudy: string | null;
  city: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  visibility: ProfileVisibility;
  openToCollaborations: boolean;
  membershipTier?: MembershipTier;
  membershipPlanCode?: MembershipPlanCode;
  adsEnabled?: boolean;
  membershipExpiresAt?: string | null;
  primaryIndustryId?: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  mobileCountryCode: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  accountType?: AccountType;
  inviteToken?: string;
}

export interface RegisterResponse {
  user: AuthUser;
  tokens: AuthTokens;
  requiresEmailVerification: boolean;
  redirectTo: string;
  joinedProjectTitles?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  next?: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
  isNewUser?: boolean;
  accountRestored: boolean;
  redirectTo: string;
}

export interface EducationItem {
  id: string;
  qualificationLevel: QualificationLevel;
  institution: string;
  institutionOther: string | null;
  degree: string;
  degreeOther: string | null;
  disciplineCategory: StemDisciplineCategory | null;
  discipline: string | null;
  disciplineOther: string | null;
  fieldOfStudy: string;
  startYear: number | null;
  endYear: number | null;
  startDate: string | null;
  endDate: string | null;
  currentlyStudying: boolean;
  grade: string | null;
  description: string | null;
}

export interface CreateEducationRequest {
  qualificationLevel: QualificationLevel;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  disciplineCategory?: StemDisciplineCategory;
  discipline?: string;
  startYear?: number;
  endYear?: number;
  currentlyStudying?: boolean;
  grade?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  type: ExperienceType;
  employmentType: EmploymentType | null;
  title: string;
  organization: string;
  organizationOther: string | null;
  location: string | null;
  startYear: number | null;
  endYear: number | null;
  startDate: string | null;
  endDate: string | null;
  currentlyWorkingHere: boolean;
  description: string | null;
  skills: string[];
  url: string | null;
}

export interface CreateExperienceRequest {
  type: ExperienceType;
  employmentType?: EmploymentType;
  title: string;
  organization: string;
  location?: string;
  startYear?: number;
  endYear?: number;
  currentlyWorkingHere?: boolean;
  description?: string;
  skills?: string[];
  url?: string;
}

export interface SkillItem {
  id: string;
  skillId: string | null;
  category: SkillCategory;
  skillName: string;
  proficiencyLevel: SkillProficiency | null;
}

export interface CreateSkillRequest {
  category: SkillCategory;
  skillName: string;
  proficiencyLevel?: SkillProficiency;
}

export interface ProfileBroadDomain {
  broadDomainId: string;
  domainNumber: number;
  slug: string;
  label: string;
  isPrimary: boolean;
}

export interface ProfileSpecialization {
  broadDomainId: string;
  specializationId: string;
  slug: string;
  name: string;
}

export interface ProfileAreaOfInterest {
  id: string;
  interestId: string | null;
  label: string;
}

export interface ProfileExpertise {
  broadDomains: ProfileBroadDomain[];
  specializations: ProfileSpecialization[];
  areasOfInterest: ProfileAreaOfInterest[];
  interests: string[];
}

export interface SocialLinkItem {
  id: string;
  platformId: string;
  platform: SocialPlatformCode;
  label: string;
  url: string;
  isVerified: boolean;
}

export interface FullProfile {
  id: string;
  email: string | null;
  mobileCountryCode?: string | null;
  mobileNumber?: string | null;
  handle: string;
  name: string;
  headline: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  dateOfBirth: string | null;
  dobPrivacy: DobPrivacy;
  accountType: AccountType;
  primaryRole: string;
  roles: AssignedRole[];
  occupations: string[];
  occupationOther: string | null;
  bio: string | null;
  professionalSummary: string | null;
  college: string | null;
  branch: string | null;
  yearOfStudy: string | null;
  studentId: string | null;
  city: string | null;
  country?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geoSource?: string | null;
  geoDetectedAt?: string | null;
  primaryInstitutionId: string | null;
  primaryOrganizationId: string | null;
  primaryStemDisciplineId: string | null;
  visibility: ProfileVisibility;
  openToCollaborations: boolean;
  isEmailVerified: boolean;
  education: EducationItem[];
  experiences: ExperienceItem[];
  skills: SkillItem[];
  expertise: ProfileExpertise;
  socialLinks: SocialLinkItem[];
  completenessPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface MasterOption {
  id: string;
  code: string;
  label: string;
  requiresSpecification?: boolean;
  urlPrefix?: string;
}

export interface BroadDomainOption {
  id: string;
  domainNumber: number;
  slug: string;
  label: string;
}

export interface SpecializationOption {
  id: string;
  broadDomainId: string;
  slug: string;
  name: string;
}

export interface ProfileEditorOptions {
  roles?: ExternalRoleOption[];
  occupations: MasterOption[];
  qualificationLevels: MasterOption[];
  degrees: MasterOption[];
  employmentTypes: MasterOption[];
  experienceTypes: MasterOption[];
  sectors: MasterOption[];
  stemCategories: MasterOption[];
  broadDomains: BroadDomainOption[];
  skillCategories: MasterOption[];
  socialPlatforms: MasterOption[];
}
