import { apiRequest } from './client';

export interface ApiProjectMedia {
  id: string;
  projectId: string;
  kind: 'image' | 'video';
  url: string;
  title: string;
  mimeType: string | null;
  fileSizeBytes: number | null;
  isCover: boolean;
  createdAt: string;
}

export interface ApiProjectContributor {
  id: string;
  userId: string;
  name: string;
  handle: string;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  teamRole: string;
  roleTitle: string;
  invitationStatus: string;
}

export interface ApiProjectInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  projectSector: string;
  inviterId: string;
  inviterName: string;
  inviterHandle: string;
  inviteeUserId: string | null;
  inviteeEmail: string | null;
  inviteeRegistered: boolean;
  roleTitle: string;
  teamRole: string;
  message: string | null;
  status: string;
  inviteToken: string;
  inviteUrl: string;
  expiresAt: string;
  createdAt: string;
}

export interface ApiProjectComment {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  body: string;
  createdAt: string;
}

export type ProjectStemCategory =
  | 'engineering_and_technology'
  | 'computer_science_and_digital_technologies'
  | 'natural_and_physical_sciences'
  | 'life_sciences_and_biotechnology'
  | 'medical_and_health_technologies'
  | 'emerging_and_interdisciplinary_technologies';

export type ProjectWorkbenchStatus = 'idea' | 'ongoing' | 'completed' | 'on_hold';
export type ProjectVisibility = 'public' | 'connections_only' | 'private_link';
export type ProjectMilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold';

export interface ProjectMilestoneInput {
  id?: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: ProjectMilestoneStatus;
}

export interface ApiProjectMilestone {
  id: string;
  projectId: string;
  stageNumber: number;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectMilestoneStatus;
  updatedAt: string;
}

export interface ProjectOptionItem {
  id: string;
  code: string;
  label: string;
  parentId?: string | null;
}

export interface ProjectEditorOptions {
  sectors: ProjectOptionItem[];
  stemCategories: ProjectOptionItem[];
  stemDisciplines: ProjectOptionItem[];
  broadDomains: ProjectOptionItem[];
  projectTypes: ProjectOptionItem[];
  academicLevels: ProjectOptionItem[];
  institutions: ProjectOptionItem[];
  organizations: ProjectOptionItem[];
  skills: ProjectOptionItem[];
}

export interface ApiProject {
  id: string;
  shortId: string;
  title: string;
  brief: string;
  projectOverview: string | null;
  description: string | null;
  problemStatement: string | null;
  expectedDeliverables: string | null;
  sector: string;
  sectorId: string | null;
  primaryStemCategory: string | null;
  primaryStemCategoryId: string | null;
  primaryStemDiscipline: string | null;
  primaryStemDisciplineId: string | null;
  leadInstitutionId: string | null;
  leadInstitutionName: string | null;
  leadOrganizationId: string | null;
  leadOrganizationName: string | null;
  branch: string | null;
  projectTypes: string[];
  academicLevels: string[];
  broadDomains: string[];
  keywords: string[];
  skills: string[];
  startDate: string | null;
  endDate: string | null;
  actualCompletionDate: string | null;
  status: 'idea' | 'ongoing' | 'in_progress' | 'completed';
  workbenchStatus: string;
  visibility: string;
  isDraft: boolean;
  confidentialityWarningAcknowledged: boolean;
  isPinned: boolean;
  deliverableUrl: string | null;
  authorId: string;
  authorName: string;
  authorHandle: string;
  membershipRole: 'owner' | 'contributor';
  canEdit: boolean;
  contributorsCount: number;
  tags: string[];
  media: ApiProjectMedia[];
  milestones: ApiProjectMilestone[];
  contributors: ApiProjectContributor[];
  invitations: ApiProjectInvitation[];
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  comments: ApiProjectComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectMediaPayload {
  kind: 'image' | 'video';
  url: string;
  title?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  isCover?: boolean;
}

export interface CreateProjectPayload {
  title: string;
  brief: string;
  projectOverview?: string;
  description?: string;
  problemStatement?: string;
  expectedDeliverables?: string;
  sector: string;
  sectorId?: string;
  primaryStemCategory?: ProjectStemCategory;
  primaryStemCategoryId?: string;
  primaryStemDiscipline?: string;
  primaryStemDisciplineId?: string;
  leadInstitutionId?: string;
  leadOrganizationId?: string;
  branch?: string;
  projectTypes?: string[];
  academicLevels?: string[];
  broadDomains?: string[];
  keywords?: string[];
  skills?: string[];
  startDate?: string;
  endDate?: string;
  actualCompletionDate?: string;
  status?: 'idea' | 'ongoing' | 'in_progress' | 'completed' | 'on_hold';
  workbenchStatus?: ProjectWorkbenchStatus;
  visibility?: ProjectVisibility;
  isDraft?: boolean;
  confidentialityWarningAcknowledged?: boolean;
  isPinned?: boolean;
  deliverableUrl?: string;
  tags?: string[];
  milestones?: ProjectMilestoneInput[];
  media: CreateProjectMediaPayload[];
}

export interface UpdateProjectPayload {
  title?: string;
  brief?: string;
  projectOverview?: string | null;
  description?: string | null;
  problemStatement?: string | null;
  expectedDeliverables?: string | null;
  sector?: string;
  sectorId?: string | null;
  primaryStemCategory?: ProjectStemCategory | null;
  primaryStemCategoryId?: string | null;
  primaryStemDiscipline?: string | null;
  primaryStemDisciplineId?: string | null;
  leadInstitutionId?: string | null;
  leadOrganizationId?: string | null;
  branch?: string | null;
  projectTypes?: string[];
  academicLevels?: string[];
  broadDomains?: string[];
  keywords?: string[];
  skills?: string[];
  tags?: string[];
  startDate?: string | null;
  endDate?: string | null;
  actualCompletionDate?: string | null;
  status?: 'idea' | 'ongoing' | 'in_progress' | 'completed' | 'on_hold';
  workbenchStatus?: ProjectWorkbenchStatus;
  visibility?: ProjectVisibility;
  isDraft?: boolean;
  confidentialityWarningAcknowledged?: boolean;
  isPinned?: boolean;
  deliverableUrl?: string | null;
  milestones?: ProjectMilestoneInput[];
}

export interface InviteContributorPayload {
  email: string;
  roleTitle?: string;
  teamRole?: string;
  message?: string;
}

export interface InviteContributorResult {
  invitation: ApiProjectInvitation;
  inviteeRegistered: boolean;
  inviteUrl: string;
  message: string;
}

export interface PublicInvitationPreview {
  id: string;
  projectId: string;
  projectTitle: string;
  projectSector: string;
  projectBrief: string;
  inviterName: string;
  inviterHandle: string;
  inviteeEmail: string | null;
  inviteeRegistered: boolean;
  roleTitle: string;
  teamRole: string;
  message: string | null;
  status: string;
  expiresAt: string;
}

export const projectsApi = {
  getOptions(): Promise<ProjectEditorOptions> {
    return apiRequest<ProjectEditorOptions>('/projects/options', { method: 'GET', auth: true });
  },

  listMine(): Promise<ApiProject[]> {
    return apiRequest<ApiProject[]>('/projects/mine', { method: 'GET', auth: true });
  },

  getById(projectId: string): Promise<ApiProject> {
    return apiRequest<ApiProject>(`/projects/${projectId}`, { method: 'GET', auth: true });
  },

  create(payload: CreateProjectPayload): Promise<ApiProject> {
    return apiRequest<ApiProject>('/projects', { method: 'POST', auth: true, body: payload });
  },

  update(projectId: string, payload: UpdateProjectPayload): Promise<ApiProject> {
    return apiRequest<ApiProject>(`/projects/${projectId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  listMilestones(projectId: string): Promise<ApiProjectMilestone[]> {
    return apiRequest<ApiProjectMilestone[]>(`/projects/${projectId}/milestones`, {
      method: 'GET',
      auth: true,
    });
  },

  addMilestone(projectId: string, payload: ProjectMilestoneInput): Promise<ApiProjectMilestone> {
    return apiRequest<ApiProjectMilestone>(`/projects/${projectId}/milestones`, {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateMilestoneStatus(
    projectId: string,
    milestoneId: string,
    status: ProjectMilestoneStatus,
  ): Promise<ApiProjectMilestone> {
    return apiRequest<ApiProjectMilestone>(
      `/projects/${projectId}/milestones/${milestoneId}/status`,
      {
        method: 'PATCH',
        auth: true,
        body: { status },
      },
    );
  },

  deleteMilestone(projectId: string, milestoneId: string): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  addMedia(projectId: string, items: CreateProjectMediaPayload[]): Promise<ApiProjectMedia[]> {
    return apiRequest<ApiProjectMedia[]>(`/projects/${projectId}/media`, {
      method: 'POST',
      auth: true,
      body: { items },
    });
  },

  setCoverMedia(projectId: string, mediaId: string): Promise<{ updated: boolean }> {
    return apiRequest<{ updated: boolean }>(`/projects/${projectId}/media/${mediaId}/cover`, {
      method: 'PATCH',
      auth: true,
    });
  },

  removeMedia(projectId: string, mediaId: string): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/projects/${projectId}/media/${mediaId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  updateTags(projectId: string, tags: string[]): Promise<{ projectId: string; tags: string[] }> {
    return apiRequest(`/projects/${projectId}/tags`, {
      method: 'PATCH',
      auth: true,
      body: { tags },
    });
  },

  toggleLike(projectId: string): Promise<{ liked: boolean; likesCount: number }> {
    return apiRequest(`/projects/${projectId}/like`, {
      method: 'POST',
      auth: true,
    });
  },

  addComment(projectId: string, body: string): Promise<ApiProjectComment> {
    return apiRequest<ApiProjectComment>(`/projects/${projectId}/comments`, {
      method: 'POST',
      auth: true,
      body: { body },
    });
  },

  inviteContributor(
    projectId: string,
    payload: InviteContributorPayload,
  ): Promise<InviteContributorResult> {
    return apiRequest<InviteContributorResult>(`/projects/${projectId}/invitations`, {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  listMyInvitations(): Promise<ApiProjectInvitation[]> {
    return apiRequest<ApiProjectInvitation[]>('/projects/invitations/mine', {
      method: 'GET',
      auth: true,
    });
  },

  getInvitationByToken(token: string): Promise<PublicInvitationPreview> {
    return apiRequest<PublicInvitationPreview>(
      `/projects/invitations/token/${encodeURIComponent(token)}`,
      { method: 'GET', auth: false },
    );
  },

  respondToInvitation(
    invitationId: string,
    action: 'accept' | 'reject',
  ): Promise<{
    invitationId: string;
    projectId: string;
    status: 'accepted' | 'declined';
    projectTitle: string;
  }> {
    return apiRequest(`/projects/invitations/${invitationId}/respond`, {
      method: 'POST',
      auth: true,
      body: { action },
    });
  },
};
