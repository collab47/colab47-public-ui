import type { AccountType } from '$lib/api/types';
import type { CardColor } from '$lib/components/ui/Card.svelte';
import type { IconName } from '$lib/components/ui/Icon.svelte';

/**
 * External user-facing account personas from `public.mst_roles`.
 * Internal staff/governance roles (`super_admin`, `admin`, `moderator`, `support_agent`,
 * `content_editor`, `compliance_reviewer`, `analyst_readonly`) and internal corporate ops
 * roles (`hr`, `finance`, `sales`, `marketing`) are intentionally excluded here.
 */
export const EXTERNAL_DASHBOARD_ROLES: readonly AccountType[] = [
  'student',
  'researcher',
  'faculty',
  'industry',
  'institution',
  'mentor',
] as const;

export const INTERNAL_EXCLUDED_ROLES = [
  'super_admin',
  'admin',
  'moderator',
  'support_agent',
  'content_editor',
  'compliance_reviewer',
  'analyst_readonly',
  'hr',
  'finance',
  'sales',
  'marketing',
] as const;

export interface RoleStatDef {
  label: string;
  value: string | number;
  delta: string;
  icon: IconName;
  color: CardColor;
}

export interface RoleStatsContext {
  projectsCount: number;
  completedProjectsCount: number;
  postsCount: number;
  totalWallLikes: number;
  totalWallComments: number;
  opportunitiesCount: number;
  completeness: number;
  studentDoneMilestones: number;
  studentTotalMilestones: number;
  researchArtifactsCount: number;
  pendingAttestationsCount: number;
  shortlistedCandidatesCount: number;
  activeMissionsCount: number;
  pendingMentorshipsCount: number;
}

export interface RoleDashboardDefinition {
  role: AccountType;
  shortLabel: string;
  badgeLabel: string;
  title: string;
  subtitle: string;
  href: string;
  icon: IconName;
  primaryActionLabel: string;
  stats: (ctx: RoleStatsContext) => RoleStatDef[];
}

export const ROLE_DASHBOARD_MAP: Record<AccountType, RoleDashboardDefinition> = {
  student: {
    role: 'student',
    shortLabel: 'Student',
    badgeLabel: 'Student Workspace',
    title: 'Student Innovation Dashboard',
    subtitle:
      'Track your 5-step living workbench, share verified milestone proof, and land R&D opportunities.',
    href: '/dashboard/student',
    icon: 'graduation-cap',
    primaryActionLabel: 'New Project',
    stats: (c) => [
      {
        label: 'Projects Posted',
        value: c.projectsCount,
        delta: `${c.completedProjectsCount} completed · workbench`,
        icon: 'folder-open',
        color: 'blue',
      },
      {
        label: 'Posts Posted',
        value: c.postsCount,
        delta: `${c.totalWallLikes} likes · ${c.totalWallComments} comments`,
        icon: 'message-square',
        color: 'emerald',
      },
      {
        label: 'Milestones Cleared',
        value: `${c.studentDoneMilestones}/${c.studentTotalMilestones}`,
        delta: '5-step proof of work',
        icon: 'check-circle',
        color: 'amber',
      },
      {
        label: 'Profile Strength',
        value: `${c.completeness}%`,
        delta: `${c.opportunitiesCount} matched opportunities`,
        icon: 'award',
        color: 'violet',
      },
    ],
  },

  researcher: {
    role: 'researcher',
    shortLabel: 'Researcher',
    badgeLabel: 'Researcher Workspace',
    title: 'Research & Lab Collaboration Dashboard',
    subtitle:
      'Manage preprints, open datasets, and patent drafts while recruiting student co-researchers.',
    href: '/dashboard/researcher',
    icon: 'flask',
    primaryActionLabel: 'Publish Study',
    stats: (c) => [
      {
        label: 'Research Artifacts',
        value: c.researchArtifactsCount,
        delta: 'Papers & datasets',
        icon: 'flask',
        color: 'violet',
      },
      {
        label: 'Lab Projects',
        value: c.projectsCount,
        delta: 'Open collaborations',
        icon: 'layers',
        color: 'cyan',
      },
      {
        label: 'Grants & Calls',
        value: c.opportunitiesCount,
        delta: 'Funding tracks',
        icon: 'sparkles',
        color: 'emerald',
      },
      {
        label: 'STEM Profile',
        value: `${c.completeness}%`,
        delta: '25 domains · 86 fields',
        icon: 'shield-check',
        color: 'blue',
      },
    ],
  },

  faculty: {
    role: 'faculty',
    shortLabel: 'Faculty',
    badgeLabel: 'Faculty & PI Workspace',
    title: 'Faculty & Laboratory PI Dashboard',
    subtitle:
      'Attest student deliverables, supervise capstone labs, and coordinate sponsored industry R&D.',
    href: '/dashboard/faculty',
    icon: 'landmark',
    primaryActionLabel: 'New Lab Project',
    stats: (c) => [
      {
        label: 'Pending Attestations',
        value: c.pendingAttestationsCount,
        delta: 'Awaiting PI sign-off',
        icon: 'shield-check',
        color: 'amber',
      },
      {
        label: 'Supervised Builds',
        value: c.projectsCount,
        delta: 'Campus lab teams',
        icon: 'graduation-cap',
        color: 'indigo',
      },
      {
        label: 'Industry Grants',
        value: c.opportunitiesCount,
        delta: 'Partner R&D calls',
        icon: 'briefcase',
        color: 'emerald',
      },
      {
        label: 'Faculty Identity',
        value: `${c.completeness}%`,
        delta: 'Academic portfolio',
        icon: 'award',
        color: 'blue',
      },
    ],
  },

  industry: {
    role: 'industry',
    shortLabel: 'Industry',
    badgeLabel: 'Industry & Startup Workspace',
    title: 'Industry Innovation & Talent Dashboard',
    subtitle:
      'Post real-world R&D problem statements, inspect verified proof of work, and shortlist builders.',
    href: '/dashboard/industry',
    icon: 'rocket',
    primaryActionLabel: 'New R&D Brief',
    stats: (c) => [
      {
        label: 'Shortlisted Builders',
        value: c.shortlistedCandidatesCount,
        delta: 'Verified proof of work',
        icon: 'users',
        color: 'emerald',
      },
      {
        label: 'Evaluated Prototypes',
        value: c.projectsCount,
        delta: 'Live workbenches',
        icon: 'rocket',
        color: 'blue',
      },
      {
        label: 'Open Requirements',
        value: c.opportunitiesCount,
        delta: 'Hiring & R&D briefs',
        icon: 'briefcase',
        color: 'rose',
      },
      {
        label: 'Org Completeness',
        value: `${c.completeness}%`,
        delta: 'Partner profile',
        icon: 'building',
        color: 'violet',
      },
    ],
  },

  institution: {
    role: 'institution',
    shortLabel: 'Institution',
    badgeLabel: 'Government & Institution Workspace',
    title: 'Institutional & National Mission Dashboard',
    subtitle:
      'Track campus & Viksit Bharat 2047 innovation missions, incubation cohorts, and grant pipelines.',
    href: '/dashboard/institution',
    icon: 'building',
    primaryActionLabel: 'New Campus Build',
    stats: (c) => [
      {
        label: 'Active Missions',
        value: c.activeMissionsCount,
        delta: 'Viksit Bharat 2047',
        icon: 'landmark',
        color: 'amber',
      },
      {
        label: 'Campus Builds',
        value: c.projectsCount,
        delta: 'Cross-department',
        icon: 'layers',
        color: 'blue',
      },
      {
        label: 'Open Grants',
        value: c.opportunitiesCount,
        delta: 'National challenges',
        icon: 'sparkles',
        color: 'teal',
      },
      {
        label: 'Institution Profile',
        value: `${c.completeness}%`,
        delta: 'Verified directory',
        icon: 'shield-check',
        color: 'indigo',
      },
    ],
  },

  mentor: {
    role: 'mentor',
    shortLabel: 'Mentor',
    badgeLabel: 'Mentor & Advisor Workspace',
    title: 'Mentor & Technical Advisory Dashboard',
    subtitle:
      'Review student prototypes, accept mentorship requests, and guide high-potential innovation teams.',
    href: '/dashboard/mentor',
    icon: 'award',
    primaryActionLabel: 'Share Insight',
    stats: (c) => [
      {
        label: 'Pending Reviews',
        value: c.pendingMentorshipsCount,
        delta: 'Teams awaiting input',
        icon: 'award',
        color: 'rose',
      },
      {
        label: 'Active Prototypes',
        value: c.projectsCount,
        delta: 'In your domains',
        icon: 'compass',
        color: 'violet',
      },
      {
        label: 'Advisory Invites',
        value: c.opportunitiesCount,
        delta: 'Open mentorship calls',
        icon: 'users',
        color: 'emerald',
      },
      {
        label: 'Mentor Profile',
        value: `${c.completeness}%`,
        delta: 'Advisor directory',
        icon: 'shield-check',
        color: 'blue',
      },
    ],
  },
};

export function isExternalDashboardRole(role: string | null | undefined): role is AccountType {
  return Boolean(role && (EXTERNAL_DASHBOARD_ROLES as readonly string[]).includes(role));
}

export function resolveExternalDashboardRole(role: string | null | undefined): AccountType {
  return isExternalDashboardRole(role) ? role : 'student';
}

export function getDashboardPath(role: string | null | undefined): string {
  return ROLE_DASHBOARD_MAP[resolveExternalDashboardRole(role)].href;
}
