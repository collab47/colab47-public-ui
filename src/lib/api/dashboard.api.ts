import { apiRequest } from './client';

export interface DashboardMetrics {
  projectsPosted: number;
  projectsGrowthLabel: string;
  followersCount: number;
  followersGrowthLabel: string;
  followingCount: number;
  postViews: number;
  postViewsGrowthLabel: string;
  likesCount: number;
  githubReposCount: number;
}

export interface ActivityBreakdown {
  totalProjects: number;
  codeCount: number;
  mediaCount: number;
  documentsCount: number;
  otherCount: number;
}

export interface TrendingTag {
  tag: string;
  count: number;
}

export interface CommunitySummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  membersCount: number;
  isJoined: boolean;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  organizer: string;
  type: string;
  mode: string;
  venue: string | null;
  startTime: string;
  endTime: string;
  rsvpCount: number;
  userRsvpStatus: string | null;
}

export interface SuggestedPerson {
  id: string;
  name: string;
  handle: string;
  accountType: string;
  headline: string | null;
  college: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
}

export interface FeaturedProject {
  id: string;
  title: string;
  brief: string;
  sector: string;
  tags: string[];
  coverUrl: string | null;
  coverType: string | null;
  authorName: string;
  authorHandle: string;
  authorSubtitle: string | null;
  authorAvatarUrl: string | null;
  viewsCount: number;
  contributorsCount: number;
}

export interface ShowcaseMediaItem {
  id: string;
  projectId: string;
  projectTitle: string;
  kind: 'image' | 'video';
  url: string;
  title: string;
}

export interface DashboardOverview {
  metrics: DashboardMetrics;
  activityBreakdown: ActivityBreakdown;
  trendingTags: TrendingTag[];
  communities: CommunitySummary[];
  upcomingEvents: UpcomingEvent[];
  suggestedPeople: SuggestedPerson[];
  featuredProject: FeaturedProject | null;
  projectShowcase: ShowcaseMediaItem[];
}

export interface FeedPostMedia {
  id: string;
  kind: string;
  url: string;
  title: string;
}

export interface FeedPostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  body: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface LiveFeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorSubtitle: string | null;
  authorAvatarUrl: string | null;
  postType: string;
  projectId: string | null;
  projectTitle: string | null;
  locationLabel: string | null;
  body: string;
  tags: string[];
  media: FeedPostMedia[];
  likesCount: number;
  commentsCount: number;
  repostCount: number;
  viewsCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  isFollowingAuthor: boolean;
  canEdit?: boolean;
  comments: FeedPostComment[];
  createdAt: string;
}

export interface CreateLivePostPayload {
  postType?: string;
  body: string;
  attachedProjectId?: string;
  locationLabel?: string;
  tags?: string[];
  media: Array<{
    kind: 'image' | 'video' | 'document' | 'code_snippet';
    url: string;
    title?: string;
    projectMediaId?: string;
    isCover?: boolean;
  }>;
}

export interface UpdateLivePostPayload {
  postType?: string;
  body?: string;
  attachedProjectId?: string | null;
  locationLabel?: string | null;
  tags?: string[];
  media?: Array<{
    kind: 'image' | 'video' | 'document' | 'code_snippet';
    url: string;
    title?: string;
    projectMediaId?: string;
    isCover?: boolean;
  }>;
}

export interface WorkspaceOpportunity {
  id: string;
  title: string;
  organization: string;
  opportunityType: string;
  workMode: string;
  sector: string;
  compensation: string;
  targetRoles: string[];
}

export interface WorkspaceMilestone {
  id: string;
  step: number;
  title: string;
  projectTitle: string;
  completed: boolean;
  dueLabel: string;
  description: string;
  missingActionHint: string;
  fixActionType: 'create_project' | 'project_media' | 'profile_expertise' | 'invite_mentor' | 'post_update';
  fixActionLabel: string;
  notes?: string | null;
}

export interface WorkspaceResearchArtifact {
  id: string;
  title: string;
  artifactType: 'preprint' | 'dataset' | 'patent_draft' | 'open_code';
  venue: string;
  domain: string;
  status: 'drafting' | 'under_review' | 'published';
  coAuthorsCount: number;
}

export interface WorkspaceAttestation {
  id: string;
  studentName: string;
  studentHandle: string;
  projectTitle: string;
  deliverable: string;
  submittedLabel: string;
  status: 'pending' | 'attested' | 'revision_requested';
}

export interface WorkspaceTalentCandidate {
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

export interface WorkspaceInstitutionalMission {
  id: string;
  title: string;
  domain: string;
  teamsParticipating: number;
  grantPool: string;
  progressPercent: number;
  status: 'active' | 'evaluating' | 'completed';
}

export interface WorkspaceMentorshipRequest {
  id: string;
  teamName: string;
  leadHandle: string;
  projectTitle: string;
  domain: string;
  topic: string;
  status: 'pending' | 'accepted' | 'scheduled' | 'completed';
}

export interface WorkspaceFacultySummary {
  activeCapstoneTeams: number;
  verifiedDeliverablesSigned: number;
  sponsoredGrantsCount: number;
}

export interface WorkspaceAdvisorSlot {
  id: string;
  label: string;
  badge: string;
}

export interface DashboardWorkspaceResponse {
  opportunities: WorkspaceOpportunity[];
  studentMilestones: WorkspaceMilestone[];
  researchArtifacts: WorkspaceResearchArtifact[];
  attestationQueue: WorkspaceAttestation[];
  talentCandidates: WorkspaceTalentCandidate[];
  institutionalMissions: WorkspaceInstitutionalMission[];
  mentorshipRequests: WorkspaceMentorshipRequest[];
  facultySummary: WorkspaceFacultySummary;
  advisorSlots: WorkspaceAdvisorSlot[];
}

export interface CreateWorkspaceOpportunityPayload {
  title: string;
  organization: string;
  sector: string;
  opportunityType?: string;
  workMode?: string;
  compensation?: string;
  description?: string;
}

export interface CreateResearchArtifactPayload {
  title: string;
  venue: string;
  artifactType: 'preprint' | 'dataset' | 'patent_draft' | 'open_code';
  projectId?: string;
}

export type FeedFilterTab = 'for_you' | 'following' | 'trending' | 'latest';

export const dashboardApi = {
  getOverview(): Promise<DashboardOverview> {
    return apiRequest<DashboardOverview>('/dashboard/overview', { method: 'GET', auth: true });
  },

  getWorkspace(): Promise<DashboardWorkspaceResponse> {
    return apiRequest<DashboardWorkspaceResponse>('/dashboard/workspace', { method: 'GET', auth: true });
  },

  createOpportunity(payload: CreateWorkspaceOpportunityPayload): Promise<WorkspaceOpportunity> {
    return apiRequest<WorkspaceOpportunity>('/dashboard/opportunities', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  createResearchArtifact(payload: CreateResearchArtifactPayload): Promise<WorkspaceResearchArtifact> {
    return apiRequest<WorkspaceResearchArtifact>('/dashboard/artifacts', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  listFeed(params?: {
    tab?: FeedFilterTab;
    tag?: string;
    search?: string;
    bookmarkedOnly?: boolean;
    limit?: number;
  }): Promise<LiveFeedPost[]> {
    const query = new URLSearchParams();
    if (params?.tab) query.set('tab', params.tab);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);
    if (params?.bookmarkedOnly) query.set('bookmarkedOnly', 'true');
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiRequest<LiveFeedPost[]>(`/dashboard/feed${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      auth: true,
    });
  },

  createPost(payload: CreateLivePostPayload): Promise<LiveFeedPost> {
    return apiRequest<LiveFeedPost>('/dashboard/posts', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  getPost(postId: string): Promise<LiveFeedPost> {
    return apiRequest<LiveFeedPost>(`/dashboard/posts/${postId}`, {
      method: 'GET',
      auth: true,
    });
  },

  updatePost(postId: string, payload: UpdateLivePostPayload): Promise<LiveFeedPost> {
    return apiRequest<LiveFeedPost>(`/dashboard/posts/${postId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  togglePostLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    return apiRequest(`/dashboard/posts/${postId}/like`, { method: 'POST', auth: true });
  },

  togglePostBookmark(postId: string): Promise<{ bookmarked: boolean; saveCount: number }> {
    return apiRequest(`/dashboard/posts/${postId}/bookmark`, { method: 'POST', auth: true });
  },

  addPostComment(postId: string, body: string): Promise<FeedPostComment> {
    return apiRequest<FeedPostComment>(`/dashboard/posts/${postId}/comments`, {
      method: 'POST',
      auth: true,
      body: { body },
    });
  },

  updatePostTags(postId: string, tags: string[]): Promise<{ postId: string; tags: string[] }> {
    return apiRequest(`/dashboard/posts/${postId}/tags`, {
      method: 'PATCH',
      auth: true,
      body: { tags },
    });
  },

  togglePostRepost(postId: string): Promise<{ reposted: boolean; repostCount: number }> {
    return apiRequest(`/dashboard/posts/${postId}/repost`, { method: 'POST', auth: true });
  },

  toggleCommentLike(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    return apiRequest(`/dashboard/comments/${commentId}/like`, { method: 'POST', auth: true });
  },

  listFollowers(): Promise<SuggestedPerson[]> {
    return apiRequest<SuggestedPerson[]>('/dashboard/network/followers', { method: 'GET', auth: true });
  },

  listFollowing(): Promise<SuggestedPerson[]> {
    return apiRequest<SuggestedPerson[]>('/dashboard/network/following', { method: 'GET', auth: true });
  },

  searchPeople(search?: string): Promise<SuggestedPerson[]> {
    const qs = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    return apiRequest<SuggestedPerson[]>(`/dashboard/network/people${qs}`, { method: 'GET', auth: true });
  },

  toggleFollow(targetUserId: string): Promise<{ following: boolean; followersCount: number }> {
    return apiRequest(`/dashboard/follow/${targetUserId}`, { method: 'POST', auth: true });
  },

  toggleCommunity(communityId: string): Promise<{ joined: boolean; membersCount: number }> {
    return apiRequest(`/dashboard/communities/${communityId}/toggle`, {
      method: 'POST',
      auth: true,
    });
  },

  toggleEventRsvp(
    eventId: string,
    status: 'going' | 'interested' | 'cancelled' = 'going',
  ): Promise<{ status: string; rsvpCount: number }> {
    return apiRequest(`/dashboard/events/${eventId}/rsvp`, {
      method: 'POST',
      auth: true,
      body: { status },
    });
  },
};
