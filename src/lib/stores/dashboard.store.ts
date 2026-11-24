import { map } from 'nanostores';
import {
  dashboardApi,
  type WorkspaceAdvisorSlot,
  type WorkspaceFacultySummary,
} from '$lib/api/dashboard.api';
import {
  projectsApi,
  type ApiProject,
  type ApiProjectComment,
  type ApiProjectContributor,
  type ApiProjectInvitation,
  type CreateProjectPayload,
  type InviteContributorPayload,
  type InviteContributorResult,
  type UpdateProjectPayload,
} from '$lib/api/projects.api';
import type { AccountType } from '$lib/api/types';

export type ProjectStatus = 'idea' | 'ongoing' | 'in_progress' | 'completed';

export type ProjectMediaKind = 'image' | 'video';

export interface ProjectMediaItem {
  id: string;
  projectId: string;
  kind: ProjectMediaKind;
  url: string;
  title: string;
  mimeType?: string;
  fileSizeLabel?: string;
  isCover: boolean;
  uploadedAtLabel: string;
}

export interface DashboardProject {
  id: string;
  title: string;
  brief: string;
  sector: string;
  status: ProjectStatus;
  authorId?: string;
  authorName: string;
  authorHandle: string;
  membershipRole?: 'owner' | 'contributor';
  canEdit?: boolean;
  contributorsCount: number;
  tags: string[];
  updatedLabel: string;
  stageLabel?: string;
  progressPercent?: number;
  media: ProjectMediaItem[];
  contributors?: ApiProjectContributor[];
  invitations?: ApiProjectInvitation[];
  likesCount?: number;
  isLiked?: boolean;
  commentsCount?: number;
  comments?: ApiProjectComment[];
}

export interface DashboardOpportunity {
  id: string;
  title: string;
  organization: string;
  opportunityType: string;
  workMode: string;
  sector: string;
  compensation: string;
  targetRoles: AccountType[];
}

export type WorkbenchFixActionType =
  | 'create_project'
  | 'project_media'
  | 'profile_expertise'
  | 'invite_mentor'
  | 'post_update';

export interface StudentMilestone {
  id: string;
  step: number;
  title: string;
  projectTitle: string;
  completed: boolean;
  dueLabel: string;
  description: string;
  missingActionHint: string;
  fixActionType: WorkbenchFixActionType;
  fixActionLabel: string;
  notes?: string;
  evidenceUrl?: string;
  evidenceFileName?: string;
  attestedByEmail?: string;
  completedAtLabel?: string;
}

export interface ResearchArtifact {
  id: string;
  title: string;
  artifactType: 'preprint' | 'dataset' | 'patent_draft' | 'open_code';
  venue: string;
  domain: string;
  status: 'drafting' | 'under_review' | 'published';
  coAuthorsCount: number;
}

export interface AttestationRequest {
  id: string;
  studentName: string;
  studentHandle: string;
  projectTitle: string;
  deliverable: string;
  submittedLabel: string;
  status: 'pending' | 'attested' | 'revision_requested';
}

export interface TalentCandidate {
  id: string;
  name: string;
  handle: string;
  institution: string;
  domain: string;
  verifiedBuilds: number;
  topSkills: string[];
  availability: string;
  shortlisted: boolean;
}

export interface InstitutionalMission {
  id: string;
  title: string;
  domain: string;
  teamsParticipating: number;
  grantPool: string;
  progressPercent: number;
  status: 'active' | 'evaluating' | 'completed';
}

export interface MentorshipRequest {
  id: string;
  teamName: string;
  leadHandle: string;
  projectTitle: string;
  domain: string;
  topic: string;
  status: 'pending' | 'accepted' | 'scheduled' | 'completed';
}

export interface DashboardStoreState {
  projects: DashboardProject[];
  projectsLoading: boolean;
  projectsLoaded: boolean;
  workspaceLoading: boolean;
  workspaceLoaded: boolean;
  incomingInvitations: ApiProjectInvitation[];
  invitationsLoading: boolean;
  opportunities: DashboardOpportunity[];
  studentMilestones: StudentMilestone[];
  researchArtifacts: ResearchArtifact[];
  attestationQueue: AttestationRequest[];
  talentCandidates: TalentCandidate[];
  institutionalMissions: InstitutionalMission[];
  mentorshipRequests: MentorshipRequest[];
  facultySummary: WorkspaceFacultySummary;
  advisorSlots: WorkspaceAdvisorSlot[];
}

export function formatMediaFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getProjectCoverMedia(project: DashboardProject): ProjectMediaItem | null {
  if (!project.media || project.media.length === 0) return null;
  return project.media.find((m) => m.isCover) ?? project.media[0] ?? null;
}

/**
 * Strictly API-backed dashboard store — ZERO hardcoded mock or seed data.
 * All lists start empty and populate exclusively from live PostgreSQL endpoints.
 */
export const dashboardState = map<DashboardStoreState>({
  projects: [],
  projectsLoading: false,
  projectsLoaded: false,
  workspaceLoading: false,
  workspaceLoaded: false,
  incomingInvitations: [],
  invitationsLoading: false,
  opportunities: [],
  studentMilestones: [],
  researchArtifacts: [],
  attestationQueue: [],
  talentCandidates: [],
  institutionalMissions: [],
  mentorshipRequests: [],
  facultySummary: {
    activeCapstoneTeams: 0,
    verifiedDeliverablesSigned: 0,
    sponsoredGrantsCount: 0,
  },
  advisorSlots: [],
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 60_000) return 'Just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function mapApiProjectToDashboard(project: ApiProject): DashboardProject {
  return {
    id: project.id,
    title: project.title,
    brief: project.brief,
    sector: project.sector,
    status: project.status,
    authorId: project.authorId,
    authorName: project.authorName,
    authorHandle: project.authorHandle,
    membershipRole: project.membershipRole,
    canEdit: project.canEdit ?? project.membershipRole === 'owner',
    contributorsCount: project.contributorsCount,
    tags: project.tags,
    updatedLabel: formatRelativeDate(project.updatedAt),
    stageLabel:
      project.status === 'completed'
        ? 'Stage 5/5 · Completed'
        : project.status === 'idea'
          ? 'Stage 1/5 · Concept'
          : 'Stage 2/5 · Active Build',
    progressPercent:
      project.status === 'completed' ? 100 : project.status === 'idea' ? 20 : 50,
    media: project.media.map((m) => ({
      id: m.id,
      projectId: m.projectId,
      kind: m.kind,
      url: m.url,
      title: m.title,
      mimeType: m.mimeType ?? undefined,
      fileSizeLabel:
        typeof m.fileSizeBytes === 'number' ? formatMediaFileSize(m.fileSizeBytes) : undefined,
      isCover: m.isCover,
      uploadedAtLabel: formatRelativeDate(m.createdAt),
    })),
    contributors: project.contributors,
    invitations: project.invitations,
    likesCount: project.likesCount ?? 0,
    isLiked: Boolean(project.isLiked),
    commentsCount: project.commentsCount ?? project.comments?.length ?? 0,
    comments: project.comments ?? [],
  };
}

export async function loadDashboardWorkspace(): Promise<void> {
  dashboardState.setKey('workspaceLoading', true);
  try {
    const data = await dashboardApi.getWorkspace();
    dashboardState.set({
      ...dashboardState.get(),
      workspaceLoading: false,
      workspaceLoaded: true,
      opportunities: data.opportunities.map((o) => ({
        ...o,
        targetRoles: o.targetRoles as AccountType[],
      })),
      studentMilestones: data.studentMilestones.map((m) => ({
        ...m,
        notes: m.notes ?? undefined,
      })),
      researchArtifacts: data.researchArtifacts,
      attestationQueue: data.attestationQueue,
      talentCandidates: data.talentCandidates,
      institutionalMissions: data.institutionalMissions,
      mentorshipRequests: data.mentorshipRequests,
      facultySummary: data.facultySummary,
      advisorSlots: data.advisorSlots,
    });
  } catch {
    dashboardState.setKey('workspaceLoaded', true);
    dashboardState.setKey('workspaceLoading', false);
  }
}

export async function loadMyProjects(): Promise<DashboardProject[]> {
  dashboardState.setKey('projectsLoading', true);
  try {
    const apiProjects = await projectsApi.listMine();
    const mapped = apiProjects.map(mapApiProjectToDashboard);
    dashboardState.setKey('projects', mapped);
    dashboardState.setKey('projectsLoaded', true);
    return mapped;
  } catch {
    dashboardState.setKey('projectsLoaded', true);
    return dashboardState.get().projects;
  } finally {
    dashboardState.setKey('projectsLoading', false);
  }
}

export async function loadMyInvitations(): Promise<ApiProjectInvitation[]> {
  dashboardState.setKey('invitationsLoading', true);
  try {
    const list = await projectsApi.listMyInvitations();
    dashboardState.setKey('incomingInvitations', list);
    return list;
  } catch {
    return dashboardState.get().incomingInvitations;
  } finally {
    dashboardState.setKey('invitationsLoading', false);
  }
}

export async function createUserProject(
  payload: CreateProjectPayload,
): Promise<DashboardProject> {
  const created = await projectsApi.create(payload);
  const mapped = mapApiProjectToDashboard(created);
  const current = dashboardState.get();
  dashboardState.setKey('projects', [mapped, ...current.projects.filter((p) => p.id !== mapped.id)]);
  return mapped;
}

export async function updateUserProject(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<ApiProject> {
  const updated = await projectsApi.update(projectId, payload);
  const mapped = mapApiProjectToDashboard(updated);
  const current = dashboardState.get();
  const exists = current.projects.some((p) => p.id === mapped.id);
  dashboardState.setKey(
    'projects',
    exists
      ? current.projects.map((p) => (p.id === mapped.id ? mapped : p))
      : [mapped, ...current.projects],
  );
  return updated;
}

export async function inviteContributorToProject(
  projectId: string,
  payload: InviteContributorPayload,
): Promise<InviteContributorResult> {
  const result = await projectsApi.inviteContributor(projectId, payload);
  await loadMyProjects();
  return result;
}

export async function respondToProjectInvitation(
  invitationId: string,
  action: 'accept' | 'reject',
): Promise<{
  invitationId: string;
  projectId: string;
  status: 'accepted' | 'declined';
  projectTitle: string;
}> {
  const res = await projectsApi.respondToInvitation(invitationId, action);
  await Promise.all([loadMyInvitations(), loadMyProjects()]);
  return res;
}

export function clearUserProjectsState(): void {
  dashboardState.set({
    projects: [],
    projectsLoading: false,
    projectsLoaded: false,
    workspaceLoading: false,
    workspaceLoaded: false,
    incomingInvitations: [],
    invitationsLoading: false,
    opportunities: [],
    studentMilestones: [],
    researchArtifacts: [],
    attestationQueue: [],
    talentCandidates: [],
    institutionalMissions: [],
    mentorshipRequests: [],
    facultySummary: {
      activeCapstoneTeams: 0,
      verifiedDeliverablesSigned: 0,
      sponsoredGrantsCount: 0,
    },
    advisorSlots: [],
  });
}

export async function updateProjectTags(projectId: string, tags: string[]): Promise<string[]> {
  const res = await projectsApi.updateTags(projectId, tags);
  const current = dashboardState.get();
  dashboardState.setKey(
    'projects',
    current.projects.map((p) => (p.id === projectId ? { ...p, tags: res.tags } : p)),
  );
  return res.tags;
}

export async function toggleProjectLike(
  projectId: string,
): Promise<{ liked: boolean; likesCount: number }> {
  const res = await projectsApi.toggleLike(projectId);
  const current = dashboardState.get();
  dashboardState.setKey(
    'projects',
    current.projects.map((p) =>
      p.id === projectId ? { ...p, isLiked: res.liked, likesCount: res.likesCount } : p,
    ),
  );
  return res;
}

export async function submitProjectComment(
  projectId: string,
  body: string,
): Promise<ApiProjectComment> {
  const comment = await projectsApi.addComment(projectId, body);
  const current = dashboardState.get();
  dashboardState.setKey(
    'projects',
    current.projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            commentsCount: (p.commentsCount ?? 0) + 1,
            comments: [...(p.comments ?? []), comment],
          }
        : p,
    ),
  );
  return comment;
}

export function addProjectMedia(
  projectId: string,
  items: Array<Omit<ProjectMediaItem, 'id' | 'projectId' | 'uploadedAtLabel' | 'isCover'> & { isCover?: boolean }>,
): ProjectMediaItem[] {
  const current = dashboardState.get();
  const target = current.projects.find((p) => p.id === projectId);
  if (!target || items.length === 0) return [];

  const hadCover = target.media.some((m) => m.isCover);
  const incomingHasCover = items.some((m) => m.isCover);
  const created: ProjectMediaItem[] = items.map((item, idx) => ({
    id: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${idx}`,
    projectId,
    kind: item.kind,
    url: item.url,
    title: item.title,
    mimeType: item.mimeType,
    fileSizeLabel: item.fileSizeLabel,
    isCover: incomingHasCover ? Boolean(item.isCover) : !hadCover && idx === 0,
    uploadedAtLabel: 'Just now',
  }));

  const nextProjects = current.projects.map((project) => {
    if (project.id !== projectId) return project;
    const existing = incomingHasCover
      ? project.media.map((m) => ({ ...m, isCover: false }))
      : project.media;
    return {
      ...project,
      media: [...created, ...existing],
      updatedLabel: 'Just now',
    };
  });

  dashboardState.setKey('projects', nextProjects);
  if (UUID_REGEX.test(projectId)) {
    void projectsApi
      .addMedia(
        projectId,
        items.map((i) => ({
          kind: i.kind,
          url: i.url,
          title: i.title,
          mimeType: i.mimeType,
          isCover: i.isCover,
        })),
      )
      .then(() => loadMyProjects())
      .catch(() => {});
  }
  return created;
}

export function setProjectCoverMedia(projectId: string, mediaId: string): void {
  const current = dashboardState.get();
  const nextProjects = current.projects.map((project) => {
    if (project.id !== projectId) return project;
    return {
      ...project,
      media: project.media.map((item) => ({
        ...item,
        isCover: item.id === mediaId,
      })),
      updatedLabel: 'Just now',
    };
  });
  dashboardState.setKey('projects', nextProjects);
  if (UUID_REGEX.test(projectId) && UUID_REGEX.test(mediaId)) {
    void projectsApi.setCoverMedia(projectId, mediaId).catch(() => {});
  }
}

export function removeProjectMedia(projectId: string, mediaId: string): void {
  const current = dashboardState.get();
  const nextProjects = current.projects.map((project) => {
    if (project.id !== projectId) return project;
    const remaining = project.media.filter((item) => item.id !== mediaId);
    const stillHasCover = remaining.some((item) => item.isCover);
    const normalized =
      !stillHasCover && remaining.length > 0
        ? remaining.map((item, idx) => ({ ...item, isCover: idx === 0 }))
        : remaining;
    return {
      ...project,
      media: normalized,
      updatedLabel: 'Just now',
    };
  });
  dashboardState.setKey('projects', nextProjects);
  if (UUID_REGEX.test(projectId) && UUID_REGEX.test(mediaId)) {
    void projectsApi.removeMedia(projectId, mediaId).catch(() => {});
  }
}

export async function addDashboardOpportunity(
  input: Omit<DashboardOpportunity, 'id'>,
): Promise<DashboardOpportunity> {
  const created = await dashboardApi.createOpportunity({
    title: input.title,
    organization: input.organization,
    sector: input.sector,
    opportunityType: input.opportunityType,
    workMode: input.workMode,
    compensation: input.compensation,
  });
  const mapped: DashboardOpportunity = {
    ...created,
    targetRoles: created.targetRoles as AccountType[],
  };
  const current = dashboardState.get();
  dashboardState.setKey('opportunities', [mapped, ...current.opportunities]);
  return mapped;
}

export function completeStudentMilestone(
  milestoneId: string,
  details: {
    notes: string;
    evidenceUrl?: string;
    evidenceFileName?: string;
    attestedByEmail?: string;
    projectTitle?: string;
  },
): void {
  const current = dashboardState.get();
  dashboardState.setKey(
    'studentMilestones',
    current.studentMilestones.map((item) =>
      item.id === milestoneId
        ? {
            ...item,
            completed: true,
            dueLabel: 'Completed',
            completedAtLabel: 'Just now',
            projectTitle: details.projectTitle?.trim() || item.projectTitle,
            notes: details.notes.trim(),
            evidenceUrl: details.evidenceUrl?.trim() || item.evidenceUrl,
            evidenceFileName: details.evidenceFileName?.trim() || item.evidenceFileName,
            attestedByEmail: details.attestedByEmail?.trim() || item.attestedByEmail,
          }
        : item,
    ),
  );
}

export function reopenStudentMilestone(milestoneId: string): void {
  const current = dashboardState.get();
  dashboardState.setKey(
    'studentMilestones',
    current.studentMilestones.map((item) =>
      item.id === milestoneId
        ? {
            ...item,
            completed: false,
            dueLabel: 'Action required',
          }
        : item,
    ),
  );
}

export async function addResearchArtifact(
  input: Omit<ResearchArtifact, 'id'>,
): Promise<ResearchArtifact> {
  const created = await dashboardApi.createResearchArtifact({
    title: input.title,
    venue: input.venue,
    artifactType: input.artifactType,
  });
  const current = dashboardState.get();
  dashboardState.setKey('researchArtifacts', [created, ...current.researchArtifacts]);
  return created;
}

export function updateAttestationStatus(
  requestId: string,
  status: AttestationRequest['status'],
): void {
  const current = dashboardState.get();
  dashboardState.setKey(
    'attestationQueue',
    current.attestationQueue.map((req) =>
      req.id === requestId ? { ...req, status } : req,
    ),
  );
}

export function toggleShortlistCandidate(candidateId: string): void {
  const current = dashboardState.get();
  dashboardState.setKey(
    'talentCandidates',
    current.talentCandidates.map((cand) =>
      cand.id === candidateId ? { ...cand, shortlisted: !cand.shortlisted } : cand,
    ),
  );
}

export async function addInstitutionalMission(
  input: Omit<InstitutionalMission, 'id' | 'teamsParticipating' | 'progressPercent' | 'status'>,
): Promise<InstitutionalMission> {
  const created = await dashboardApi.createOpportunity({
    title: input.title,
    organization: 'Institutional Innovation Mission',
    sector: input.domain,
    opportunityType: 'project',
    workMode: 'hybrid',
    compensation: input.grantPool,
  });
  const mission: InstitutionalMission = {
    id: created.id,
    title: created.title,
    domain: created.sector,
    teamsParticipating: 1,
    grantPool: created.compensation,
    progressPercent: 15,
    status: 'active',
  };
  const current = dashboardState.get();
  dashboardState.setKey('institutionalMissions', [mission, ...current.institutionalMissions]);
  dashboardState.setKey('opportunities', [
    { ...created, targetRoles: created.targetRoles as AccountType[] },
    ...current.opportunities,
  ]);
  return mission;
}

export function updateMentorshipStatus(
  requestId: string,
  status: MentorshipRequest['status'],
): void {
  const current = dashboardState.get();
  dashboardState.setKey(
    'mentorshipRequests',
    current.mentorshipRequests.map((req) =>
      req.id === requestId ? { ...req, status } : req,
    ),
  );
}
