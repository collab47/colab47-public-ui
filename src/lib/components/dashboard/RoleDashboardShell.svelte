<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, ensureFreshSession } from '$lib/api/client';
  import { badgesApi, type UserBadgesSummary } from '$lib/api/badges.api';
  import type { FeedFilterTab } from '$lib/api/dashboard.api';
  import type { AccountType } from '$lib/api/types';
  import { uploadsApi, type UploadFolder } from '$lib/api/uploads.api';
  import {
    ROLE_DASHBOARD_MAP,
    getDashboardPath,
    resolveDashboardTranslationKey,
  } from '$lib/dashboards/role-dashboards';
  import {
    addProjectMedia,
    authState,
    countryCodeToFlag,
    dashboardState,
    detectUserLocation,
    formatCoordinates,
    formatMediaFileSize,
    geoState,
    getProjectCoverMedia,
    isAuthenticated,
    liveDashboardState,
    loadDashboardFeed,
    loadDashboardOverview,
    loadDashboardWorkspace,
    loadMyInvitations,
    loadMyProfile,
    loadMyProjects,
    profileState,
    publishLiveFeedPost,
    pushToast,
    respondToProjectInvitation,
    setDashboardActiveTab,
    shouldShowAds,
    sidebarState,
    submitLivePostComment,
    submitProjectComment,
    t,
    toggleLiveCommentLike,
    toggleLiveCommunity,
    toggleLiveEventRsvp,
    toggleLiveFollowUser,
    toggleLivePostBookmark,
    toggleLivePostLike,
    toggleLivePostRepost,
    toggleProjectLike,
    updateLivePostTags,
    updateProjectTags,
    type ProjectMediaKind,
    type ProjectStatus,
  } from '$lib/stores';
  import ActivityDonutChart from './ActivityDonutChart.svelte';
  import InviteContributorModal from './InviteContributorModal.svelte';
  import MediaGalleryGrid from './MediaGalleryGrid.svelte';
  import NetworkModal from './NetworkModal.svelte';
  import ProjectMediaManagerModal from './ProjectMediaManagerModal.svelte';
  import TagPicker from './TagPicker.svelte';
  import {
    Avatar,
    Badge,
    BadgesShowcase,
    Button,
    Card,
    Footer,
    GoogleAdSlot,
    Icon,
    Input,
    ProgressBar,
    Select,
    Spinner,
    Textarea,
    type IconName,
  } from '$ui';

  interface Props {
    role: AccountType;
    roleModules?: Snippet;
    roleSidebar?: Snippet;
    headerExtra?: Snippet;
  }

  let { role, roleModules, roleSidebar, headerExtra }: Props = $props();

  interface PendingUploadMedia {
    tempId: string;
    kind: ProjectMediaKind;
    url: string;
    title: string;
    mimeType: string;
    fileSizeLabel: string;
    isCover: boolean;
  }

  let searchQuery = $state('');
  const activeTab = $derived($sidebarState.activeTab || 'all');
  let selectedSector = $state('');
  let showPostComposer = $state(false);
  let managingMediaProjectId = $state<string | null>(null);
  let invitingProjectId = $state<string | null>(null);
  let isPublishingPost = $state(false);
  let respondingInviteId = $state<string | null>(null);
  let myBadges = $state<UserBadgesSummary | null>(null);
  let lastNewProjectTrigger = $state(sidebarState.get().newProjectTrigger);

  $effect(() => {
    const trigger = $sidebarState.newProjectTrigger;
    if (trigger > lastNewProjectTrigger) {
      lastNewProjectTrigger = trigger;
      void goto('/projects/new');
    }
  });

  // Post Composer state (persisted via POST /api/v1/dashboard/posts)
  let newPostBody = $state('');
  let newPostTagsList = $state<string[]>([]);
  let newPostType = $state<'project_showcase' | 'milestone_update' | 'article' | 'opportunity'>('project_showcase');
  let newPostProjectId = $state('');
  let selectedPostMediaIds = $state<string[]>([]);
  let extraPostUploads = $state<PendingUploadMedia[]>([]);
  let postCoverId = $state<string | null>(null);
  let postFileInputEl = $state<HTMLInputElement | null>(null);

  // Interactive Comments, Inline Tag Editing & Network Modal state
  let expandedCommentPostIds = $state<string[]>([]);
  let commentDrafts = $state<Record<string, string>>({});
  let expandedProjectCommentIds = $state<string[]>([]);
  let projectCommentDrafts = $state<Record<string, string>>({});
  let addingTagProjectId = $state<string | null>(null);
  let projectInlineTagDraft = $state('');
  let addingTagPostId = $state<string | null>(null);
  let postInlineTagDraft = $state('');
  let networkModalTab = $state<'followers' | 'following' | 'discover' | null>(null);

  const feedFilterTabs: ReadonlyArray<{ id: FeedFilterTab; label: string }> = [
    { id: 'for_you', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'trending', label: 'Trending' },
    { id: 'latest', label: 'Latest' },
  ];

  const postTypeOptions = [
    { value: 'project_showcase', label: 'Project Showcase' },
    { value: 'milestone_update', label: 'Milestone Update' },
    { value: 'article', label: 'Build Note / Article' },
    { value: 'opportunity', label: 'Opportunity / Call' },
  ];

  const statusToneMap: Record<ProjectStatus, 'saffron' | 'moss' | 'neutral' | 'ink'> = {
    idea: 'neutral',
    ongoing: 'saffron',
    in_progress: 'ink',
    completed: 'moss',
  };

  const activeUser = $derived($profileState.profile ?? $authState.user);
  const fullProfile = $derived($profileState.profile);
  const roleConfig = $derived(ROLE_DASHBOARD_MAP[role] ?? ROLE_DASHBOARD_MAP.student);
  const roleCopy = $derived($t.dashboard.roles[resolveDashboardTranslationKey(role)]);
  const completeness = $derived(fullProfile?.completenessPercent ?? 30);
  const overview = $derived($liveDashboardState.overview);

  const managingMediaProject = $derived(
    $dashboardState.projects.find((p) => p.id === managingMediaProjectId) ?? null,
  );
  const invitingProject = $derived(
    $dashboardState.projects.find((p) => p.id === invitingProjectId) ?? null,
  );
  const pendingIncomingInvitations = $derived(
    $dashboardState.incomingInvitations.filter((inv) => inv.status === 'pending'),
  );
  const selectedProjectForPost = $derived(
    $dashboardState.projects.find((p) => p.id === newPostProjectId) ?? null,
  );

  // Profile Completion checklist values (clickable -> /profile?tab=... or /onboarding)
  const basicInfoReady = $derived(
    Boolean(
      fullProfile?.headline ||
        fullProfile?.college ||
        fullProfile?.city ||
        (fullProfile?.occupations.length ?? 0) > 0,
    ),
  );
  const educationCount = $derived(fullProfile?.education.length ?? 0);
  const experienceCount = $derived(fullProfile?.experiences.length ?? 0);
  const expertiseSkillsCount = $derived(fullProfile?.skills.length ?? 0);
  const aboutSocialReady = $derived(
    Boolean(
      fullProfile?.bio ||
        fullProfile?.professionalSummary ||
        (fullProfile?.socialLinks.length ?? 0) > 0,
    ),
  );
  const onboardingCompleted = $derived(
    Boolean(
      fullProfile &&
        (fullProfile.occupations.length > 0 ||
          Boolean(fullProfile.college) ||
          fullProfile.expertise.broadDomains.length > 0 ||
          fullProfile.completenessPercent >= 50),
    ),
  );

  // Geolocation display
  const detectedCountry = $derived($geoState.country ?? fullProfile?.country ?? null);
  const detectedCountryCode = $derived($geoState.countryCode ?? fullProfile?.countryCode ?? null);
  const detectedLat = $derived($geoState.latitude ?? fullProfile?.latitude ?? null);
  const detectedLng = $derived($geoState.longitude ?? fullProfile?.longitude ?? null);
  const detectedCoordsLabel = $derived(formatCoordinates(detectedLat, detectedLng));

  // 6 KPI Metric Cards (exact layout & colors from student-dashboard.png, backed by live API)
  const kpiCards = $derived.by(() => {
    const m = overview?.metrics;
    const projectsPosted = m?.projectsPosted ?? $dashboardState.projects.length;
    const followersCount = m?.followersCount ?? 0;
    const followingCount = m?.followingCount ?? 0;
    const postViews = m?.postViews ?? 0;
    const likesCount = m?.likesCount ?? 0;
    const githubReposCount = m?.githubReposCount ?? (fullProfile?.socialLinks.length ?? 0);

    return [
      {
        id: 'projects',
        label: $t.ui.myProjects,
        value: formatCompactNumber(projectsPosted),
        delta: projectsPosted > 0 ? m?.projectsGrowthLabel ?? '+100%' : null,
        icon: 'layers' as IconName,
        iconBg: 'bg-[#F3EEFF] text-[#6D4AFF]',
        href: '/projects',
      },
      {
        id: 'followers',
        label: $t.ui.followers,
        value: formatCompactNumber(followersCount),
        delta: followersCount > 0 ? m?.followersGrowthLabel ?? '+12%' : null,
        icon: 'users' as IconName,
        iconBg: 'bg-[#EEF2FF] text-[#4F46E5]',
        onClick: () => (networkModalTab = 'followers'),
      },
      {
        id: 'following',
        label: $t.ui.following,
        value: formatCompactNumber(followingCount),
        delta: null,
        icon: 'user' as IconName,
        iconBg: 'bg-[#F0F4FF] text-[#3B82F6]',
        onClick: () => (networkModalTab = 'following'),
      },
      {
        id: 'views',
        label: $t.ui.postViews,
        value: formatCompactNumber(postViews),
        delta: postViews > 0 ? m?.postViewsGrowthLabel ?? '+65%' : null,
        icon: 'star' as IconName,
        iconBg: 'bg-[#FFF7E6] text-[#F59E0B]',
        onClick: () => setDashboardActiveTab('posts'),
      },
      {
        id: 'likes',
        label: $t.ui.likes,
        value: formatCompactNumber(likesCount),
        delta: null,
        icon: 'heart' as IconName,
        iconBg: 'bg-[#FFF0F6] text-[#EC4899]',
        onClick: () => setDashboardActiveTab('posts'),
      },
      {
        id: 'repos',
        label: $t.ui.portfolioLinks,
        value: formatCompactNumber(githubReposCount),
        delta: null,
        icon: 'link' as IconName,
        iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
        href: '/profile?tab=about',
      },
    ];
  });

  const normalizedQuery = $derived(searchQuery.trim().toLowerCase());

  const filteredProjects = $derived(
    $dashboardState.projects.filter((project) => {
      if (selectedSector && project.sector !== selectedSector) return false;
      if (!normalizedQuery) return true;
      return (
        project.title.toLowerCase().includes(normalizedQuery) ||
        project.brief.toLowerCase().includes(normalizedQuery) ||
        project.sector.toLowerCase().includes(normalizedQuery) ||
        project.tags.some((tg) => tg.toLowerCase().includes(normalizedQuery))
      );
    }),
  );

  const filteredOpportunities = $derived(
    $dashboardState.opportunities.filter((opp) => {
      if (selectedSector && opp.sector !== selectedSector) return false;
      if (!normalizedQuery) return true;
      return (
        opp.title.toLowerCase().includes(normalizedQuery) ||
        opp.organization.toLowerCase().includes(normalizedQuery) ||
        opp.sector.toLowerCase().includes(normalizedQuery)
      );
    }),
  );

  const projectSelectOptions = $derived([
    { value: '', label: 'None (General Feed Post)' },
    ...$dashboardState.projects.map((p) => ({
      value: p.id,
      label: `${p.title} (${p.media.length} media)`,
    })),
  ]);

  function formatCompactNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return String(num);
  }

  function formatRelativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(diffMs) || diffMs < 60_000) return 'Just now';
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function formatEventBadge(iso: string): { month: string; day: string } {
    const d = new Date(iso);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: String(d.getDate()).padStart(2, '0'),
    };
  }

  $effect(() => {
    if (typeof window === 'undefined') return;
    const onOpenProjectComposer = () => {
      void goto('/projects/new');
    };
    const onOpenProjectMedia = () => {
      const firstProject = $dashboardState.projects[0];
      if (firstProject) {
        managingMediaProjectId = firstProject.id;
      } else {
        void goto('/projects/new');
      }
    };
    const onOpenProjectInvite = () => {
      const firstProject = $dashboardState.projects[0];
      if (firstProject) {
        invitingProjectId = firstProject.id;
      } else {
        void goto('/projects/new');
      }
    };
    window.addEventListener('collab47:open-project-composer', onOpenProjectComposer);
    window.addEventListener('collab47:open-project-media', onOpenProjectMedia);
    window.addEventListener('collab47:open-project-invite', onOpenProjectInvite);
    return () => {
      window.removeEventListener('collab47:open-project-composer', onOpenProjectComposer);
      window.removeEventListener('collab47:open-project-media', onOpenProjectMedia);
      window.removeEventListener('collab47:open-project-invite', onOpenProjectInvite);
    };
  });

  $effect(() => {
    if (activeTab === 'saved') {
      void loadDashboardFeed({ bookmarkedOnly: true });
    } else if (activeTab === 'all' || activeTab === 'posts') {
      if ($liveDashboardState.bookmarkedOnly) {
        void loadDashboardFeed({ bookmarkedOnly: false });
      }
    }
  });

  onMount(async () => {
    const hasSession = await ensureFreshSession();
    if (!hasSession) {
      await goto(`/login?next=${encodeURIComponent(roleConfig.href)}`);
      return;
    }
    await loadMyProfile();
    const resolvedRole =
      profileState.get().profile?.accountType ?? authState.get().user?.accountType ?? 'student';
    if (resolvedRole !== role) {
      await goto(getDashboardPath(resolvedRole), { replaceState: true });
      return;
    }
    void Promise.all([
      loadMyProjects(),
      loadMyInvitations(),
      loadDashboardOverview(),
      loadDashboardWorkspace(),
      loadDashboardFeed({ tab: 'for_you', bookmarkedOnly: false }),
      detectUserLocation(),
      badgesApi
        .getMyBadges()
        .then((b) => {
          myBadges = b;
        })
        .catch(() => null),
    ]);
  });

  async function handleSelectFeedTab(tab: FeedFilterTab): Promise<void> {
    if (activeTab === 'projects' || activeTab === 'opportunities' || activeTab === 'saved') {
      setDashboardActiveTab('all');
    }
    await loadDashboardFeed({ tab, bookmarkedOnly: false, search: searchQuery });
  }

  async function handleSelectTag(tag: string): Promise<void> {
    const nextTag = $liveDashboardState.selectedTag === tag ? null : tag;
    if (activeTab === 'projects' || activeTab === 'opportunities') {
      setDashboardActiveTab('all');
    }
    await loadDashboardFeed({ tag: nextTag, bookmarkedOnly: false, search: searchQuery });
  }

  async function handleSearchSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    await loadDashboardFeed({ search: searchQuery });
  }

  async function handleRespondDashboardInvite(
    invitationId: string,
    action: 'accept' | 'reject',
  ): Promise<void> {
    respondingInviteId = invitationId;
    try {
      const res = await respondToProjectInvitation(invitationId, action);
      void loadDashboardOverview();
      pushToast({
        tone: action === 'accept' ? 'success' : 'info',
        title: action === 'accept' ? 'Invitation accepted!' : 'Invitation declined',
        message:
          action === 'accept'
            ? `You joined "${res.projectTitle}". It is now visible in your Projects.`
            : `You declined the invitation to "${res.projectTitle}".`,
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Unable to update invitation',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      respondingInviteId = null;
    }
  }

  async function uploadFilesToPending(
    files: FileList | null,
    folder: UploadFolder,
    markFirstCover: boolean,
  ): Promise<PendingUploadMedia[]> {
    if (!files || files.length === 0) return [];
    const validFiles = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    if (validFiles.length === 0) return [];

    let results: PendingUploadMedia[] = [];
    try {
      const uploaded = await uploadsApi.uploadFiles(validFiles, folder);
      results = uploaded.map((u, idx) => ({
        tempId: `s3-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        kind: u.kind as ProjectMediaKind,
        url: u.url,
        title: u.originalName.replace(/\.[^.]+$/, ''),
        mimeType: u.contentType,
        fileSizeLabel: formatMediaFileSize(u.sizeBytes),
        isCover: false,
      }));
    } catch {
      results = validFiles.map((file, idx) => ({
        tempId: `tmp-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        kind: (file.type.startsWith('video/') ? 'video' : 'image') as ProjectMediaKind,
        url: URL.createObjectURL(file),
        title: file.name.replace(/\.[^.]+$/, ''),
        mimeType: file.type,
        fileSizeLabel: formatMediaFileSize(file.size),
        isCover: false,
      }));
    }

    if (markFirstCover && results.length > 0) {
      const firstImg = results.find((r) => r.kind === 'image');
      if (firstImg) {
        firstImg.isCover = true;
      }
    }
    return results;
  }

  const postSelectedImageIds = $derived.by(() => {
    const ids: string[] = [];
    if (selectedProjectForPost) {
      for (const m of selectedProjectForPost.media) {
        if (m.kind === 'image' && selectedPostMediaIds.includes(m.id)) {
          ids.push(m.id);
        }
      }
    }
    for (const u of extraPostUploads) {
      if (u.kind === 'image') {
        ids.push(u.tempId);
      }
    }
    return ids;
  });

  const postHasCoverImage = $derived(
    postCoverId !== null && postSelectedImageIds.includes(postCoverId),
  );

  async function handleExtraPostFiles(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const added = await uploadFilesToPending(input.files, 'posts', false);
    input.value = '';
    if (added.length === 0) return;
    extraPostUploads = [...extraPostUploads, ...added];
    if (!postCoverId || !postSelectedImageIds.includes(postCoverId)) {
      const firstImg = added.find((u) => u.kind === 'image');
      if (firstImg) {
        postCoverId = firstImg.tempId;
      }
    }
  }

  function setPostCover(id: string): void {
    postCoverId = id;
  }

  function removeExtraPostUpload(tempId: string): void {
    const remaining = extraPostUploads.filter((u) => u.tempId !== tempId);
    extraPostUploads = remaining;
    if (postCoverId === tempId) {
      const nextUploadImg = remaining.find((u) => u.kind === 'image');
      const nextReusedImg = selectedProjectForPost?.media.find(
        (m) => m.kind === 'image' && selectedPostMediaIds.includes(m.id),
      );
      postCoverId = nextUploadImg?.tempId ?? nextReusedImg?.id ?? null;
    }
  }

  function togglePostProjectMedia(mediaId: string): void {
    if (selectedPostMediaIds.includes(mediaId)) {
      selectedPostMediaIds = selectedPostMediaIds.filter((id) => id !== mediaId);
      if (postCoverId === mediaId) {
        const nextReusedImg = selectedProjectForPost?.media.find(
          (m) => m.kind === 'image' && selectedPostMediaIds.includes(m.id) && m.id !== mediaId,
        );
        const nextUploadImg = extraPostUploads.find((u) => u.kind === 'image');
        postCoverId = nextReusedImg?.id ?? nextUploadImg?.tempId ?? null;
      }
    } else {
      selectedPostMediaIds = [...selectedPostMediaIds, mediaId];
      const clicked = selectedProjectForPost?.media.find((m) => m.id === mediaId);
      if (clicked?.kind === 'image' && (!postCoverId || !postSelectedImageIds.includes(postCoverId))) {
        postCoverId = mediaId;
      }
    }
  }

  function prefillProjectUpdate(projectId: string, preselectedMediaIds?: string[]): void {
    const project = $dashboardState.projects.find((p) => p.id === projectId);
    newPostProjectId = projectId;
    newPostType = 'project_showcase';
    showPostComposer = true;
    if (preselectedMediaIds && preselectedMediaIds.length > 0) {
      selectedPostMediaIds = [...preselectedMediaIds];
      const firstImg = project?.media.find(
        (m) => m.kind === 'image' && preselectedMediaIds.includes(m.id),
      );
      postCoverId = firstImg?.id ?? null;
    } else if (project && project.media.length > 0) {
      const cover = getProjectCoverMedia(project);
      selectedPostMediaIds = cover ? [cover.id] : [];
      postCoverId = cover?.kind === 'image' ? cover.id : (project.media.find((m) => m.kind === 'image')?.id ?? null);
    } else {
      selectedPostMediaIds = [];
      postCoverId = null;
    }
    setDashboardActiveTab('all');
    setTimeout(() => {
      const el = document.getElementById('dash-post-body');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    }, 50);
  }

  async function handlePublishPost(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!newPostBody.trim() || isPublishingPost) return;

    if (!postHasCoverImage) {
      pushToast({
        tone: 'error',
        title: 'Cover image required',
        message: 'Upload or select at least one image and mark one image as the cover image before publishing your post.',
      });
      return;
    }

    const tags = newPostTagsList.length > 0 ? [...newPostTagsList] : [role];

    const linkedProject = selectedProjectForPost;
    const reused = linkedProject
      ? linkedProject.media
          .filter((m) => selectedPostMediaIds.includes(m.id))
          .map((m) => ({
            kind: m.kind as 'image' | 'video',
            url: m.url,
            title: m.title,
            projectMediaId: m.id,
            isCover: m.kind === 'image' && postCoverId === m.id,
          }))
      : [];

    const extra = extraPostUploads.map((u) => ({
      kind: u.kind as 'image' | 'video',
      url: u.url,
      title: u.title,
      isCover: u.kind === 'image' && postCoverId === u.tempId,
    }));

    const combinedMedia = [...reused, ...extra];
    combinedMedia.sort((a, b) => Number(Boolean(b.isCover)) - Number(Boolean(a.isCover)));

    if (linkedProject && extraPostUploads.length > 0) {
      addProjectMedia(
        linkedProject.id,
        extraPostUploads.map((u) => ({
          kind: u.kind,
          url: u.url,
          title: u.title,
          mimeType: u.mimeType,
          fileSizeLabel: u.fileSizeLabel,
        })),
      );
    }

    isPublishingPost = true;
    try {
      await publishLiveFeedPost({
        postType: newPostType,
        body: newPostBody.trim(),
        attachedProjectId: linkedProject?.id,
        tags,
        media: combinedMedia,
      });

      newPostBody = '';
      newPostTagsList = [];
      newPostProjectId = '';
      selectedPostMediaIds = [];
      extraPostUploads = [];
      postCoverId = null;
      showPostComposer = false;
      pushToast({
        tone: 'success',
        title: 'Post published to feed!',
        message: 'Your update is live and saved to PostgreSQL.',
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Failed to publish post',
        message: err instanceof ApiError ? err.message : 'Please check backend API server.',
      });
    } finally {
      isPublishingPost = false;
    }
  }

  function toggleProjectComments(projectId: string): void {
    if (expandedProjectCommentIds.includes(projectId)) {
      expandedProjectCommentIds = expandedProjectCommentIds.filter((id) => id !== projectId);
    } else {
      expandedProjectCommentIds = [...expandedProjectCommentIds, projectId];
    }
  }

  async function handleToggleProjectLike(projectId: string): Promise<void> {
    try {
      await toggleProjectLike(projectId);
      void loadDashboardOverview();
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not like project',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  async function handleAddProjectComment(event: SubmitEvent, projectId: string): Promise<void> {
    event.preventDefault();
    const text = (projectCommentDrafts[projectId] ?? '').trim();
    if (!text) return;
    try {
      await submitProjectComment(projectId, text);
      projectCommentDrafts = { ...projectCommentDrafts, [projectId]: '' };
      if (!expandedProjectCommentIds.includes(projectId)) {
        expandedProjectCommentIds = [...expandedProjectCommentIds, projectId];
      }
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not add project comment',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  async function handleAddInlineProjectTag(event: SubmitEvent, projectId: string, existing: string[]): Promise<void> {
    event.preventDefault();
    const raw = projectInlineTagDraft.trim().toLowerCase().replace(/^#+/, '').replace(/\s+/g, '-');
    if (!raw) return;
    try {
      const next = Array.from(new Set([...existing, raw]));
      await updateProjectTags(projectId, next);
      void loadDashboardOverview();
      projectInlineTagDraft = '';
      addingTagProjectId = null;
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not update project tags',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  async function handleRemoveProjectTag(projectId: string, existing: string[], tagToRemove: string): Promise<void> {
    try {
      await updateProjectTags(
        projectId,
        existing.filter((tg) => tg !== tagToRemove),
      );
      void loadDashboardOverview();
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not remove tag',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  async function handleAddInlinePostTag(event: SubmitEvent, postId: string, existing: string[]): Promise<void> {
    event.preventDefault();
    const raw = postInlineTagDraft.trim().toLowerCase().replace(/^#+/, '').replace(/\s+/g, '-');
    if (!raw) return;
    try {
      const next = Array.from(new Set([...existing, raw]));
      await updateLivePostTags(postId, next);
      postInlineTagDraft = '';
      addingTagPostId = null;
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not update post tags',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  async function handleRemovePostTag(postId: string, existing: string[], tagToRemove: string): Promise<void> {
    try {
      await updateLivePostTags(
        postId,
        existing.filter((tg) => tg !== tagToRemove),
      );
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not remove tag',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  function toggleComments(postId: string): void {
    if (expandedCommentPostIds.includes(postId)) {
      expandedCommentPostIds = expandedCommentPostIds.filter((id) => id !== postId);
    } else {
      expandedCommentPostIds = [...expandedCommentPostIds, postId];
    }
  }

  async function handleAddComment(event: SubmitEvent, postId: string): Promise<void> {
    event.preventDefault();
    const text = (commentDrafts[postId] ?? '').trim();
    if (!text) return;
    try {
      await submitLivePostComment(postId, text);
      commentDrafts = { ...commentDrafts, [postId]: '' };
      if (!expandedCommentPostIds.includes(postId)) {
        expandedCommentPostIds = [...expandedCommentPostIds, postId];
      }
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not add comment',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  async function handleToggleFollow(targetUserId: string, name: string): Promise<void> {
    try {
      const res = await toggleLiveFollowUser(targetUserId);
      pushToast({
        tone: 'success',
        title: res.following ? `Following ${name}` : `Unfollowed ${name}`,
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Follow action failed',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  async function handleToggleCommunity(communityId: string, name: string): Promise<void> {
    try {
      const res = await toggleLiveCommunity(communityId);
      pushToast({
        tone: 'success',
        title: res.joined ? `Joined ${name}` : `Left ${name}`,
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Community action failed',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  async function handleToggleEventRsvp(eventId: string, title: string): Promise<void> {
    try {
      const res = await toggleLiveEventRsvp(eventId);
      pushToast({
        tone: res.status === 'going' ? 'success' : 'info',
        title: res.status === 'going' ? `RSVP confirmed: ${title}` : `RSVP cancelled: ${title}`,
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'RSVP failed',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }
</script>

<svelte:head>
  <title>{roleConfig.title} · Collab47</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-69px)] w-full flex-1 flex-col bg-[#F5F6FB]">
  {#if !$authState.isHydrated || ($profileState.isLoading && !activeUser)}
    <main class="flex min-h-[60vh] w-full flex-1 items-center justify-center">
      <Spinner label={$t.ui.loadingDashboard} size="lg" />
    </main>
  {:else if $isAuthenticated && activeUser}
    <main class="flex w-full flex-1 flex-col gap-4 px-3 py-4 sm:px-5">
      <!-- Pending Project Contributor Invitations Alert Bar -->
      {#if pendingIncomingInvitations.length > 0}
        <section class="flex flex-col gap-2" aria-label="Pending project invitations">
          {#each pendingIncomingInvitations as inv (inv.id)}
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3 shadow-xs">
              <div class="flex min-w-0 items-center gap-3">
                <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white">
                  <Icon name="users" size={17} />
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-[#1E1B4B]">
                    {inv.inviterName} invited you to join "{inv.projectTitle}" as {inv.roleTitle}
                  </p>
                  {#if inv.message}
                    <p class="truncate text-xs text-slate-600">"{inv.message}"</p>
                  {/if}
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={respondingInviteId !== null}
                  onclick={() => void handleRespondDashboardInvite(inv.id, 'accept')}
                  class="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:brightness-105 disabled:opacity-60"
                >
                  <Icon name="check" size={14} />
                  <span>Accept</span>
                </button>
                <button
                  type="button"
                  disabled={respondingInviteId !== null}
                  onclick={() => void handleRespondDashboardInvite(inv.id, 'reject')}
                  class="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
                >
                  <Icon name="x" size={14} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          {/each}
        </section>
      {/if}

      <!-- Master 2-Column Outer Layout matching student-dashboard.png: Main Area + Right Rail (300px) -->
      <div class="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_305px]">
        <!-- LEFT + CENTER MAIN WORKSPACE -->
        <div class="flex min-w-0 flex-col gap-4">
          <!-- 1. Hero Banner ("Build • Share • Collaborate") matching student-dashboard.png -->
          <section
            class="hero-banner dash-enter relative overflow-hidden rounded-2xl p-5 text-white shadow-[0_12px_32px_rgba(30,27,75,0.18)] sm:p-6"
          >
            <!-- Ambient Glowing Orbs (Smooth GPU Drift) -->
            <div
              class="dash-orb pointer-events-none absolute -top-20 -right-12 h-64 w-64 rounded-full bg-[#8B5CF6]/45 blur-3xl"
              aria-hidden="true"
            ></div>
            <div
              class="dash-orb pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#6366F1]/35 blur-3xl"
              style="animation-delay: -4s;"
              aria-hidden="true"
            ></div>

            <div class="relative z-10 grid grid-cols-1 items-center gap-5 lg:grid-cols-[1.25fr_0.95fr]">
              <div class="flex flex-col items-start gap-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/12 px-3 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-xs">
                    <Icon name={roleConfig.icon} size={13} />
                    <span>{roleCopy.badgeLabel}</span>
                  </span>
                  {#if detectedCountry}
                    <span class="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-indigo-100">
                      <span>{countryCodeToFlag(detectedCountryCode)}</span>
                      <span>{detectedCountry}</span>
                      {#if detectedCoordsLabel}
                        <span class="hidden opacity-80 sm:inline">· {detectedCoordsLabel}</span>
                      {/if}
                    </span>
                  {/if}
                </div>

                <h1 class="text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-3xl">
                  Build • Share • Collaborate
                </h1>
                <p class="max-w-lg text-sm leading-relaxed text-indigo-100/90">
                  {roleCopy.subtitle}
                </p>

                <div class="mt-1 flex flex-wrap items-center gap-2.5">
                  <a
                    href="/projects/new"
                    class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#1E1B4B] no-underline shadow-sm transition hover:bg-indigo-50 hover:no-underline"
                  >
                    <Icon name="plus" size={15} />
                    <span>{$t.forms.createNewProject}</span>
                  </a>
                  <button
                    type="button"
                    onclick={() => {
                      showPostComposer = !showPostComposer;
                      setDashboardActiveTab('all');
                    }}
                    class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/30 bg-white/12 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20"
                  >
                    <Icon name="compass" size={15} />
                    <span>Share Post</span>
                  </button>
                  {@render headerExtra?.()}
                </div>
              </div>

              <!-- Right Visual Glass Collage (Animated Floating Code, Video & Document cards) -->
              <div class="relative hidden h-[168px] items-center justify-end lg:flex" aria-hidden="true">
                <div class="relative h-full w-[310px]">
                  <!-- Back Code Window Card -->
                  <div class="dash-float-a absolute top-1 left-8 h-[108px] w-[142px] rounded-2xl border border-white/25 bg-[#1B1848]/85 p-3 shadow-xl backdrop-blur-md">
                    <div class="flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-full bg-rose-400"></span>
                      <span class="h-2 w-2 rounded-full bg-amber-300"></span>
                      <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                    </div>
                    <div class="mt-3 flex items-center gap-2 font-mono text-base font-extrabold text-indigo-200">
                      <span>&lt;/&gt;</span>
                      <div class="flex flex-1 flex-col gap-1.5">
                        <span class="h-1.5 w-full rounded-full bg-indigo-400/50"></span>
                        <span class="h-1.5 w-3/4 rounded-full bg-violet-400/40"></span>
                      </div>
                    </div>
                  </div>
                  <!-- Right Document Card -->
                  <div class="dash-float-b absolute top-2 right-1 h-[108px] w-[96px] rounded-2xl border border-white/30 bg-gradient-to-br from-[#6366F1]/90 to-[#8B5CF6]/90 p-3 shadow-xl">
                    <div class="mt-4 flex flex-col gap-2">
                      <span class="h-2 w-full rounded-full bg-white/85"></span>
                      <span class="h-2 w-4/5 rounded-full bg-white/65"></span>
                      <span class="h-2 w-3/5 rounded-full bg-white/50"></span>
                    </div>
                  </div>
                  <!-- Bottom-Left Photo Tile -->
                  <div class="dash-float-a absolute bottom-1 left-2 flex h-[68px] w-[86px] items-center justify-center rounded-xl border-2 border-white/80 bg-gradient-to-br from-sky-400 via-cyan-300 to-emerald-400 shadow-lg" style="animation-delay: -2.2s;">
                    <Icon name="image" size={24} class="text-white drop-shadow-xs" />
                  </div>
                  <!-- Center Video Player Card -->
                  <div class="dash-float-c absolute right-10 bottom-2 flex h-[92px] w-[132px] items-center justify-center rounded-2xl border border-white/35 bg-gradient-to-br from-[#23205A]/95 to-[#4C39B8]/90 shadow-2xl backdrop-blur-md">
                    <span class="dash-play-pulse inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5B3DF5] shadow-md">
                      <Icon name="play" size={18} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2. Six Horizontal KPI Metric Cards (Staggered Entrance + Hover Elevation) -->
          <section
            aria-label="Dashboard key metrics"
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            {#each kpiCards as kpi, idx (kpi.id)}
              {#if kpi.href}
                <a
                  href={kpi.href}
                  style="animation-delay: {idx * 55}ms;"
                  class="dash-enter group flex flex-col justify-between gap-2 rounded-2xl border border-[#E8EAF6] bg-white p-3.5 no-underline shadow-[0_2px_10px_rgba(30,27,75,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#C4B5FD] hover:shadow-[0_10px_24px_rgba(109,74,255,0.12)] hover:no-underline"
                >
                  <div class="flex items-start gap-2.5">
                    <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 {kpi.iconBg}">
                      <Icon name={kpi.icon} size={17} />
                    </span>
                    <div class="min-w-0">
                      <strong class="block text-lg leading-tight font-extrabold text-[#1E1B4B]">
                        {kpi.value}
                      </strong>
                      <span class="block truncate text-[11px] font-medium text-slate-500">
                        {kpi.label}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center justify-end text-[11px] font-bold text-[#6D4AFF]">
                    <Icon name="external-link" size={12} />
                  </div>
                </a>
              {:else}
                <button
                  type="button"
                  onclick={() => kpi.onClick?.()}
                  style="animation-delay: {idx * 55}ms;"
                  class="dash-enter group flex flex-col justify-between gap-2 rounded-2xl border border-[#E8EAF6] bg-white p-3.5 text-left shadow-[0_2px_10px_rgba(30,27,75,0.04)] transition duration-200 {kpi.onClick
                    ? 'cursor-pointer hover:-translate-y-1 hover:border-[#C4B5FD] hover:shadow-[0_10px_24px_rgba(109,74,255,0.12)]'
                    : 'cursor-default'}"
                >
                  <div class="flex items-start gap-2.5">
                    <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 {kpi.iconBg}">
                      <Icon name={kpi.icon} size={17} />
                    </span>
                    <div class="min-w-0">
                      <strong class="block text-lg leading-tight font-extrabold text-[#1E1B4B]">
                        {kpi.value}
                      </strong>
                      <span class="block truncate text-[11px] font-medium text-slate-500">
                        {kpi.label}
                      </span>
                    </div>
                  </div>
                  {#if kpi.delta}
                    <div class="text-right text-[11px] font-bold text-emerald-600">
                      ↑ {kpi.delta}
                    </div>
                  {:else}
                    <div class="h-4"></div>
                  {/if}
                </button>
              {/if}
            {/each}
          </section>

          <!-- 3. Three-Column Dashboard Body (Left Widgets + Center Posts/Projects ONLY + Right-Inner Featured/Showcase) -->
          <div id="workspace-feed" class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
            <!-- INNER COLUMN 1: Your Activity Donut + Trending Tags + Following Communities -->
            <div class="flex min-w-0 flex-col gap-4">
              <!-- Your Activity Donut Chart -->
              <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                <div class="mb-3 flex items-center gap-2">
                  <Icon name="shield-check" size={17} class="shrink-0 text-slate-950" />
                  <h2 class="truncate text-sm font-extrabold text-slate-950">{$t.ui.yourActivity}</h2>
                </div>
                <ActivityDonutChart
                  totalProjects={overview?.activityBreakdown.totalProjects ?? $dashboardState.projects.length}
                  codeCount={overview?.activityBreakdown.codeCount ?? $dashboardState.projects.length}
                  mediaCount={overview?.activityBreakdown.mediaCount ?? $dashboardState.projects.reduce((acc, p) => acc + p.media.length, 0)}
                  documentsCount={overview?.activityBreakdown.documentsCount ?? (($profileState.profile?.education.length ?? 0) + ($profileState.profile?.socialLinks.length ?? 0))}
                  otherCount={overview?.activityBreakdown.otherCount ?? $liveDashboardState.feed.filter((f) => f.authorId === activeUser?.id).length}
                />
              </section>

              <!-- Trending Tags -->
              <section class="rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
                <div class="mb-3 flex items-center justify-between gap-2">
                  <h2 class="flex items-center gap-1.5 text-sm font-extrabold text-[#1E1B4B]">
                    <span>🔥</span>
                    <span>{$t.ui.trendingTags}</span>
                  </h2>
                  {#if $liveDashboardState.selectedTag}
                    <button
                      type="button"
                      onclick={() => void handleSelectTag($liveDashboardState.selectedTag!)}
                      class="cursor-pointer text-[11px] font-bold text-[#6D4AFF] hover:underline"
                    >
                      Clear
                    </button>
                  {/if}
                </div>
                <div class="flex flex-wrap gap-1.5">
                  {#each overview?.trendingTags ?? [] as item (item.tag)}
                    {@const isSelected = $liveDashboardState.selectedTag === item.tag}
                    <button
                      type="button"
                      onclick={() => void handleSelectTag(item.tag)}
                      class="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition {isSelected
                        ? 'bg-[#6D4AFF] text-white'
                        : 'bg-[#F3F1FF] text-[#5B3DF5] hover:bg-[#E7E3FF]'}"
                    >
                      <span>#{item.tag}</span>
                      <span class="text-[10px] opacity-70">{formatCompactNumber(item.count)}</span>
                    </button>
                  {/each}
                </div>
              </section>

              <!-- Following Communities (Real PostgreSQL Toggle) -->
              <section class="rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
                <div class="mb-3 flex items-center gap-2">
                  <Icon name="users" size={16} class="text-[#1E1B4B]" />
                  <h2 class="text-sm font-extrabold text-[#1E1B4B]">{$t.ui.followingCommunities}</h2>
                </div>
                <div class="flex flex-col gap-2.5">
                  {#each (overview?.communities ?? []).slice(0, 4) as comm (comm.id)}
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex min-w-0 items-center gap-2.5">
                        <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E1B4B] to-[#4C39B8] text-xs font-extrabold text-white">
                          {comm.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div class="min-w-0">
                          <strong class="block truncate text-xs font-bold text-[#1E1B4B]">{comm.name}</strong>
                          <span class="block text-[11px] text-slate-500">
                            {formatCompactNumber(comm.membersCount)} members
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onclick={() => void handleToggleCommunity(comm.id, comm.name)}
                        aria-label="{comm.isJoined ? 'Leave' : 'Join'} {comm.name}"
                        class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border text-xs font-bold transition {comm.isJoined
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-[#6D4AFF] hover:text-[#6D4AFF]'}"
                      >
                        <Icon name={comm.isJoined ? 'check' : 'plus'} size={13} />
                      </button>
                    </div>
                  {/each}
                </div>
              </section>

              <!-- Role-Specific Left Column Cards (e.g., 5-Step Living Workbench Checklist) -->
              {#if roleModules}
                <div class="flex min-w-0 flex-col gap-4">
                  {@render roleModules()}
                </div>
              {/if}
            </div>

            <!-- INNER COLUMN 2 (CENTER): Posts & Projects ONLY -->
            <div class="flex min-w-0 flex-col gap-4">
              <!-- Pill Tab Bar + Search (exact style from student-dashboard.png) -->
              <div class="flex flex-col gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-3 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex flex-wrap items-center gap-1.5">
                    {#if activeTab === 'projects'}
                      <span class="rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
                        My Projects ({filteredProjects.length})
                      </span>
                      <button
                        type="button"
                        onclick={() => setDashboardActiveTab('all')}
                        class="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-[#F3F1FF] hover:text-[#5B3DF5]"
                      >
                        Back to Feed
                      </button>
                    {:else if activeTab === 'opportunities'}
                      <span class="rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
                        Opportunities ({filteredOpportunities.length})
                      </span>
                      <button
                        type="button"
                        onclick={() => setDashboardActiveTab('all')}
                        class="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-[#F3F1FF] hover:text-[#5B3DF5]"
                      >
                        Back to Feed
                      </button>
                    {:else}
                      {#each feedFilterTabs as tab (tab.id)}
                        {@const active = $liveDashboardState.feedTab === tab.id && activeTab !== 'saved'}
                        <button
                          type="button"
                          onclick={() => void handleSelectFeedTab(tab.id)}
                          class="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition {active
                            ? 'bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white shadow-xs'
                            : 'text-slate-600 hover:bg-[#F3F1FF] hover:text-[#5B3DF5]'}"
                        >
                          {tab.label}
                        </button>
                      {/each}
                      <a
                        href="/projects"
                        class="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 no-underline hover:bg-[#F3F1FF] hover:text-[#5B3DF5] hover:no-underline"
                      >
                        {$t.ui.myProjects} ({$dashboardState.projects.length})
                      </a>
                    {/if}
                  </div>

                  <div class="flex items-center gap-2">
                    <a
                      href="/projects/new"
                      class="inline-flex items-center gap-1 rounded-xl border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-bold text-[#1E1B4B] no-underline transition hover:border-[#6D4AFF] hover:text-[#5B3DF5] hover:no-underline"
                    >
                      <Icon name="folder-open" size={13} />
                      <span>{$t.dashboard.addProject}</span>
                    </a>
                    <button
                      type="button"
                      onclick={() => (showPostComposer = !showPostComposer)}
                      class="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-1.5 text-xs font-bold text-[#5B3DF5] transition hover:bg-[#EDE9FE]"
                    >
                      <Icon name="plus" size={13} />
                      <span>New Post</span>
                    </button>
                  </div>
                </div>

                <form class="flex items-center gap-2" onsubmit={handleSearchSubmit}>
                  <div class="relative flex-1">
                    <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                      <Icon name="search" size={14} />
                    </span>
                    <input
                      type="search"
                      bind:value={searchQuery}
                      placeholder="Search projects, posts, skills, tags..."
                      class="w-full rounded-xl border border-[#E8EAF6] bg-[#F8F9FE] py-2 pr-3 pl-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    class="cursor-pointer rounded-xl bg-[#F3F1FF] px-3 py-2 text-xs font-bold text-[#5B3DF5] hover:bg-[#E7E3FF]"
                  >
                    Search
                  </button>
                </form>
              </div>

              <!-- Collapsible Post Composer (Persisted via POST /api/v1/dashboard/posts) -->
              {#if showPostComposer}
                <div class="dash-slide-down rounded-2xl border border-[#DDD6FE] bg-white p-4 shadow-sm">
                  <form class="flex flex-col gap-3" onsubmit={handlePublishPost}>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <Avatar name={activeUser.name} src={activeUser.avatarUrl} size="sm" />
                        <strong class="text-xs font-extrabold text-[#1E1B4B]">{$t.ui.shareBuildUpdate}</strong>
                      </div>
                      <button type="button" class="cursor-pointer text-xs text-slate-400 hover:text-slate-700" onclick={() => (showPostComposer = false)}>
                        <Icon name="x" size={15} />
                      </button>
                    </div>

                    <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Select id="dash-post-type" label={$t.forms.postType} options={postTypeOptions} bind:value={newPostType} />
                      <Select id="dash-post-project" label={$t.forms.attachProject} options={projectSelectOptions} bind:value={newPostProjectId} />
                    </div>

                    {#if selectedProjectForPost && selectedProjectForPost.media.length > 0}
                      <div class="rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] p-2.5">
                        <span class="mb-2 block text-[11px] font-bold text-[#5B3DF5]">
                          Reuse media from "{selectedProjectForPost.title}" ({selectedPostMediaIds.length} selected)
                        </span>
                        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {#each selectedProjectForPost.media as m (m.id)}
                            {@const picked = selectedPostMediaIds.includes(m.id)}
                            {@const isPostCover = picked && m.kind === 'image' && postCoverId === m.id}
                            <div class="overflow-hidden rounded-lg border bg-white {isPostCover ? 'border-[#6D4AFF] ring-2 ring-[#6D4AFF]/30' : picked ? 'border-[#A78BFA]' : 'border-slate-200 opacity-80'}">
                              <button
                                type="button"
                                onclick={() => togglePostProjectMedia(m.id)}
                                class="relative block aspect-video w-full cursor-pointer overflow-hidden bg-slate-900"
                              >
                                {#if m.kind === 'video'}
                                  <!-- svelte-ignore a11y_media_has_caption -->
                                  <video src={m.url} muted preload="metadata" class="h-full w-full object-cover"></video>
                                {:else}
                                  <img src={m.url} alt={m.title} class="h-full w-full object-cover" />
                                {/if}
                                {#if isPostCover}
                                  <span class="absolute top-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                                    COVER
                                  </span>
                                {/if}
                              </button>
                              {#if picked && m.kind === 'image'}
                                <div class="flex items-center justify-between px-1.5 py-1 text-[10px]">
                                  {#if isPostCover}
                                    <span class="font-bold text-emerald-600">Cover Image</span>
                                  {:else}
                                    <button type="button" class="cursor-pointer font-bold text-[#6D4AFF] hover:underline" onclick={() => setPostCover(m.id)}>
                                      Mark as Cover
                                    </button>
                                  {/if}
                                </div>
                              {/if}
                            </div>
                          {/each}
                        </div>
                      </div>
                    {/if}

                    <Textarea
                      id="dash-post-body"
                      label={$t.forms.whatAreYouBuilding}
                      bind:value={newPostBody}
                      rows={3}
                      maxlength={1500}
                      placeholder="Share your latest prototype, benchmark, demo video, or open collaboration call..."
                    />

                    <TagPicker
                      label={$t.forms.postTags}
                      bind:tags={newPostTagsList}
                      placeholder="Type tag & press Enter (ai, webdev, buildinpublic)"
                    />

                    <!-- Post Media Gallery & Mandatory Cover Image Picker -->
                    <div class="flex flex-col gap-2.5 rounded-xl border {postHasCoverImage ? 'border-[#E8EAF6] bg-[#FAF9FF]' : 'border-amber-200 bg-amber-50/40'} p-3">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="text-xs font-bold text-[#1E1B4B]">
                            {$t.ui.projectPhotosVideos} ({extraPostUploads.length + selectedPostMediaIds.length}) *
                          </span>
                          {#if postHasCoverImage}
                            <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Cover Image Selected
                            </span>
                          {:else}
                            <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              Cover Image Required
                            </span>
                          {/if}
                        </div>
                        <input
                          bind:this={postFileInputEl}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov"
                          multiple
                          class="hidden"
                          onchange={handleExtraPostFiles}
                        />
                        <Button variant="outline" size="sm" onclick={() => postFileInputEl?.click()}>
                          <Icon name="upload" size={13} />
                          <span>{$t.forms.uploadMedia}</span>
                        </Button>
                      </div>
                      <p class="text-[11px] leading-relaxed text-slate-500">
                        {$t.ui.supportedMediaFormats} Add multiple images and mark one image as the <strong>Cover Image</strong>.
                      </p>

                      {#if extraPostUploads.length > 0}
                        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {#each extraPostUploads as item (item.tempId)}
                            {@const isCover = item.kind === 'image' && postCoverId === item.tempId}
                            <div class="overflow-hidden rounded-xl border bg-white {isCover ? 'border-[#6D4AFF] ring-2 ring-[#6D4AFF]/25' : 'border-slate-200'}">
                              <div class="relative aspect-video bg-slate-900">
                                {#if item.kind === 'video'}
                                  <!-- svelte-ignore a11y_media_has_caption -->
                                  <video src={item.url} muted playsinline preload="metadata" class="h-full w-full object-cover"></video>
                                {:else}
                                  <img src={item.url} alt={item.title} class="h-full w-full object-cover" />
                                {/if}
                                {#if isCover}
                                  <span class="absolute top-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                                    COVER
                                  </span>
                                {/if}
                              </div>
                              <div class="flex items-center justify-between p-1.5 text-[10px]">
                                {#if item.kind === 'video'}
                                  <span class="font-semibold text-slate-500">Video</span>
                                {:else if isCover}
                                  <span class="font-bold text-emerald-600">Cover Image</span>
                                {:else}
                                  <button type="button" class="cursor-pointer font-bold text-[#6D4AFF] hover:underline" onclick={() => setPostCover(item.tempId)}>
                                    Mark as Cover
                                  </button>
                                {/if}
                                <button type="button" class="cursor-pointer font-semibold text-rose-600 hover:underline" onclick={() => removeExtraPostUpload(item.tempId)}>
                                  {$t.ui.remove}
                                </button>
                              </div>
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>

                    <div class="flex justify-end">
                      <button
                        type="submit"
                        disabled={isPublishingPost || !newPostBody.trim() || !postHasCoverImage}
                        class="shrink-0 cursor-pointer rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-5 py-2 text-xs font-bold text-white shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isPublishingPost ? $t.ui.publishing : $t.ui.publishPostBtn}
                      </button>
                    </div>
                  </form>
                </div>
              {/if}

              <!-- MY PROJECTS VIEW (Strictly User's Own + Accepted Contributor Projects) -->
              {#if activeTab === 'projects'}
                <div class="flex flex-col gap-3.5">
                  {#if $dashboardState.projectsLoading && !$dashboardState.projectsLoaded}
                    <div class="flex justify-center rounded-2xl border border-[#E8EAF6] bg-white py-10">
                      <Spinner label="Loading your projects..." size="md" />
                    </div>
                  {:else if filteredProjects.length === 0}
                    <div class="flex flex-col items-center gap-3 rounded-2xl border border-[#E8EAF6] bg-white px-6 py-10 text-center">
                      <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F1FF] text-[#6D4AFF]">
                        <Icon name="folder-open" size={24} />
                      </span>
                      <div>
                        <h3 class="text-base font-extrabold text-[#1E1B4B]">
                          You haven't posted or joined any projects yet
                        </h3>
                        <p class="mt-1 max-w-md text-xs text-slate-500">
                          Only projects you create or join via contributor invitations appear here.
                          Start your first project and invite teammates by email.
                        </p>
                      </div>
                      <a
                        href="/projects/new"
                        class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-4 py-2 text-xs font-bold text-white no-underline shadow-sm hover:brightness-105 hover:no-underline"
                      >
                        <Icon name="plus" size={14} />
                        <span>Create Your First Project</span>
                      </a>
                    </div>
                  {:else}
                    {#each filteredProjects as project (project.id)}
                      {@const coverMedia = getProjectCoverMedia(project)}
                      {@const isProjectAuthor =
                        project.canEdit ??
                        (project.authorId
                          ? project.authorId === activeUser.id
                          : project.membershipRole === 'owner')}
                      <article class="flex flex-col gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
                        <div class="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div class="flex flex-wrap items-center gap-1.5">
                              <Badge tone={statusToneMap[project.status]}>{project.status.replace('_', ' ')}</Badge>
                              <span class="rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-[10px] font-bold text-[#5B3DF5]">
                                {project.sector}
                              </span>
                              {#if project.membershipRole}
                                <Badge tone={project.membershipRole === 'owner' ? 'saffron' : 'moss'}>
                                  {project.membershipRole}
                                </Badge>
                              {/if}
                            </div>
                            <a
                              href={`/projects/${project.id}`}
                              class="mt-1.5 block text-base font-extrabold text-[#1E1B4B] no-underline hover:text-[#6D4AFF] hover:underline"
                            >
                              {project.title}
                            </a>
                          </div>
                          <span class="text-xs text-slate-400">{project.updatedLabel}</span>
                        </div>

                        {#if coverMedia}
                          <div class="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                            {#if coverMedia.kind === 'video'}
                              <!-- svelte-ignore a11y_media_has_caption -->
                              <video src={coverMedia.url} controls playsinline preload="metadata" class="h-full w-full object-cover"></video>
                            {:else}
                              <img src={coverMedia.url} alt={coverMedia.title} class="h-full w-full object-cover" />
                            {/if}
                          </div>
                        {/if}

                        <p class="text-sm leading-relaxed text-slate-600">{project.brief}</p>

                        <!-- Interactive Project Tags (Author Only; Read-Only for Viewers) -->
                        <div class="flex flex-wrap items-center gap-1.5">
                          {#each project.tags as tag (tag)}
                            <span class="inline-flex items-center gap-1 rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#5B3DF5]">
                              <span>#{tag}</span>
                              {#if isProjectAuthor}
                                <button
                                  type="button"
                                  onclick={() => void handleRemoveProjectTag(project.id, project.tags, tag)}
                                  aria-label="Remove tag {tag}"
                                  class="cursor-pointer rounded-full p-0.5 text-[#5B3DF5]/60 hover:bg-[#5B3DF5]/15 hover:text-[#5B3DF5]"
                                >
                                  <Icon name="x" size={10} />
                                </button>
                              {/if}
                            </span>
                          {/each}
                          {#if isProjectAuthor}
                            {#if addingTagProjectId === project.id}
                              <form
                                class="inline-flex items-center gap-1"
                                onsubmit={(e) => void handleAddInlineProjectTag(e, project.id, project.tags)}
                              >
                                <input
                                  type="text"
                                  bind:value={projectInlineTagDraft}
                                  placeholder="new tag..."
                                  class="w-24 rounded-full border border-[#C4B5FD] bg-white px-2.5 py-0.5 text-[11px] focus:border-[#6D4AFF] focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  class="cursor-pointer rounded-full bg-[#6D4AFF] px-2 py-0.5 text-[10px] font-bold text-white"
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onclick={() => {
                                    addingTagProjectId = null;
                                    projectInlineTagDraft = '';
                                  }}
                                  class="cursor-pointer text-[10px] text-slate-400 hover:text-slate-600"
                                >
                                  Cancel
                                </button>
                              </form>
                            {:else}
                              <button
                                type="button"
                                onclick={() => {
                                  addingTagProjectId = project.id;
                                  projectInlineTagDraft = '';
                                }}
                                class="inline-flex cursor-pointer items-center gap-0.5 rounded-full border border-dashed border-[#C4B5FD] px-2 py-0.5 text-[10px] font-bold text-[#6D4AFF] hover:bg-[#F3F1FF]"
                              >
                                <Icon name="plus" size={10} />
                                <span>Add Tag</span>
                              </button>
                            {/if}
                          {/if}
                        </div>

                        <!-- Project Engagement Bar (Author gets Edit/Invite/Media; Viewers get Read-Only View) -->
                        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F2FA] pt-3 text-xs">
                          <div class="flex items-center gap-3.5 text-slate-500">
                            <button
                              type="button"
                              onclick={() => void handleToggleProjectLike(project.id)}
                              class="inline-flex cursor-pointer items-center gap-1 font-bold transition {project.isLiked
                                ? 'text-rose-500'
                                : 'hover:text-rose-500'}"
                            >
                              <Icon name="heart" size={15} />
                              <span>{project.likesCount ?? 0}</span>
                            </button>
                            <button
                              type="button"
                              onclick={() => toggleProjectComments(project.id)}
                              class="inline-flex cursor-pointer items-center gap-1 font-bold transition hover:text-[#6D4AFF]"
                            >
                              <Icon name="message-square" size={15} />
                              <span>{project.commentsCount ?? project.comments?.length ?? 0}</span>
                            </button>
                            <span class="hidden text-slate-400 sm:inline">by <strong>@{project.authorHandle}</strong></span>
                          </div>
                          <div class="flex flex-wrap items-center gap-3">
                            {#if isProjectAuthor}
                              <a
                                href={`/projects/${project.id}/edit`}
                                class="inline-flex cursor-pointer items-center gap-1 font-bold text-[#1E1B4B] no-underline hover:text-[#6D4AFF] hover:underline"
                              >
                                <Icon name="file-text" size={14} />
                                <span>{$t.forms.editProject}</span>
                              </a>
                              <button
                                type="button"
                                onclick={() => (invitingProjectId = project.id)}
                                class="inline-flex cursor-pointer items-center gap-1 font-bold text-[#5B3DF5] hover:underline"
                              >
                                <Icon name="users" size={14} />
                                <span>Invite ({project.contributorsCount})</span>
                              </button>
                              <button
                                type="button"
                                onclick={() => (managingMediaProjectId = project.id)}
                                class="inline-flex cursor-pointer items-center gap-1 font-bold text-emerald-600 hover:underline"
                              >
                                <Icon name="image" size={14} />
                                <span>Media</span>
                              </button>
                            {:else}
                              <a
                                href={`/projects/${project.id}`}
                                class="inline-flex items-center gap-1 font-bold text-slate-600 no-underline hover:text-[#6D4AFF] hover:underline"
                              >
                                <Icon name="eye" size={14} />
                                <span>View Project</span>
                              </a>
                            {/if}
                            <button
                              type="button"
                              onclick={() => prefillProjectUpdate(project.id)}
                              class="inline-flex cursor-pointer items-center gap-1 font-bold text-amber-600 hover:underline"
                            >
                              <Icon name="send" size={13} />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>

                        <!-- Threaded Project Comments -->
                        {#if expandedProjectCommentIds.includes(project.id)}
                          <div class="flex flex-col gap-2 rounded-xl bg-[#F8F9FE] p-3">
                            {#each project.comments ?? [] as cmt (cmt.id)}
                              <div class="flex flex-col gap-0.5 rounded-lg bg-white px-3 py-2 text-xs shadow-2xs">
                                <div class="flex items-center justify-between">
                                  <strong class="text-[#1E1B4B]">{cmt.authorName}</strong>
                                  <span class="text-[10px] text-slate-400">{formatRelativeTime(cmt.createdAt)}</span>
                                </div>
                                <p class="text-slate-600">{cmt.body}</p>
                              </div>
                            {/each}
                            <form class="flex gap-2" onsubmit={(e) => void handleAddProjectComment(e, project.id)}>
                              <input
                                type="text"
                                value={projectCommentDrafts[project.id] ?? ''}
                                oninput={(e) =>
                                  (projectCommentDrafts = { ...projectCommentDrafts, [project.id]: e.currentTarget.value })}
                                placeholder="Comment on this project..."
                                class="flex-1 rounded-xl border border-[#E8EAF6] bg-white px-3 py-1.5 text-xs focus:border-[#6D4AFF] focus:outline-none"
                              />
                              <button
                                type="submit"
                                class="cursor-pointer rounded-xl bg-[#6D4AFF] px-3 py-1.5 text-xs font-bold text-white"
                              >
                                Comment
                              </button>
                            </form>
                          </div>
                        {/if}
                      </article>
                    {/each}
                  {/if}
                </div>

              <!-- OPPORTUNITIES VIEW -->
              {:else if activeTab === 'opportunities'}
                <div class="flex flex-col gap-3">
                  {#each filteredOpportunities as opp (opp.id)}
                    <div class="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
                      <div>
                        <div class="flex flex-wrap items-center gap-1.5">
                          <span class="rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-[10px] font-bold text-[#5B3DF5]">
                            {opp.opportunityType}
                          </span>
                          <span class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            {opp.compensation}
                          </span>
                        </div>
                        <h3 class="mt-1.5 text-sm font-extrabold text-[#1E1B4B]">{opp.title}</h3>
                        <p class="text-xs text-slate-500">{opp.organization} · {opp.workMode} · {opp.sector}</p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onclick={() =>
                          pushToast({
                            tone: 'success',
                            title: 'Interest recorded',
                            message: `Saved "${opp.title}" to your applications.`,
                          })}
                      >
                        {$t.dashboard.applyNow}
                      </Button>
                    </div>
                  {/each}
                </div>

              <!-- SOCIAL FEED VIEW (Real PostgreSQL Feed Posts) -->
              {:else}
                {#if $liveDashboardState.feedLoading && $liveDashboardState.feed.length === 0}
                  <div class="flex justify-center rounded-2xl border border-[#E8EAF6] bg-white py-10">
                    <Spinner label="Loading live feed..." size="md" />
                  </div>
                {:else if $liveDashboardState.feed.length === 0}
                  <div class="flex flex-col items-center gap-3 rounded-2xl border border-[#E8EAF6] bg-white px-6 py-10 text-center">
                    <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F1FF] text-[#6D4AFF]">
                      <Icon name="sparkles" size={24} />
                    </span>
                    <div>
                      <h3 class="text-base font-extrabold text-[#1E1B4B]">
                        {activeTab === 'saved' ? 'No saved bookmarks yet' : 'Your feed is ready for your first post'}
                      </h3>
                      <p class="mt-1 max-w-md text-xs text-slate-500">
                        {activeTab === 'saved'
                          ? 'Bookmark posts from your feed to revisit them here.'
                          : 'Share a project update, demo video, or learning milestone to kick off your campus & innovation feed.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onclick={() => (showPostComposer = true)}
                      class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-4 py-2 text-xs font-bold text-white shadow-sm"
                    >
                      <Icon name="plus" size={14} />
                      <span>Publish First Post</span>
                    </button>
                  </div>
                {:else}
                  {#each $liveDashboardState.feed as post (post.id)}
                    {@const commentsOpen = expandedCommentPostIds.includes(post.id)}
                    {@const isPostAuthor = post.canEdit ?? post.authorId === activeUser.id}
                    <article class="flex flex-col gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
                      <!-- Post Author Header -->
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex min-w-0 items-center gap-2.5">
                          <Avatar name={post.authorName} src={post.authorAvatarUrl} size="md" />
                          <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-1.5">
                              <strong class="truncate text-sm font-bold text-[#1E1B4B]">{post.authorName}</strong>
                              <span class="text-xs text-slate-400">· {formatRelativeTime(post.createdAt)}</span>
                            </div>
                            <span class="block truncate text-xs text-slate-500">
                              {post.authorSubtitle ?? `@${post.authorHandle} · ${post.authorRole}`}
                            </span>
                          </div>
                        </div>

                        <div class="flex shrink-0 items-center gap-2">
                          {#if isPostAuthor}
                            <a
                              href={`/posts/${post.id}/edit`}
                              class="inline-flex items-center gap-1 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-1 text-xs font-bold text-[#5B3DF5] no-underline transition hover:bg-[#EDE9FE] hover:no-underline"
                            >
                              <Icon name="file-text" size={12} />
                              <span>Edit</span>
                            </a>
                          {:else}
                            <a
                              href={`/posts/${post.id}`}
                              title="View post (read-only)"
                              class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 no-underline transition hover:border-[#C4B5FD] hover:text-[#5B3DF5] hover:no-underline"
                            >
                              <Icon name="eye" size={12} />
                              <span>View</span>
                            </a>
                            <button
                              type="button"
                              onclick={() => void handleToggleFollow(post.authorId, post.authorName)}
                              class="shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition {post.isFollowingAuthor
                                ? 'border-[#DDD6FE] bg-[#F3F1FF] text-[#5B3DF5]'
                                : 'border-[#E2E5F5] bg-white text-[#5B3DF5] hover:border-[#6D4AFF] hover:bg-[#F3F1FF]'}"
                            >
                              {post.isFollowingAuthor ? 'Following' : '+ Follow'}
                            </button>
                          {/if}
                        </div>
                      </div>

                      {#if post.projectTitle}
                        {#if post.projectId}
                          <a
                            href={`/projects/${post.projectId}`}
                            class="inline-flex w-fit items-center gap-1.5 text-xs font-bold text-[#5B3DF5] no-underline hover:underline"
                          >
                            <Icon name="rocket" size={13} />
                            <span>{post.projectTitle}</span>
                          </a>
                        {:else}
                          <div class="flex items-center gap-1.5 text-xs font-bold text-[#5B3DF5]">
                            <Icon name="rocket" size={13} />
                            <span>{post.projectTitle}</span>
                          </div>
                        {/if}
                      {/if}

                      <p class="text-sm leading-relaxed text-slate-700">{post.body}</p>

                      <!-- Rich Media Grid -->
                      {#if post.media.length > 0}
                        <MediaGalleryGrid
                          sourceProjectTitle={post.projectTitle ?? undefined}
                          items={post.media.map((m) => ({
                            id: m.id,
                            projectId: post.projectId ?? 'feed',
                            kind: m.kind === 'video' ? 'video' : 'image',
                            url: m.url,
                            title: m.title,
                            isCover: false,
                            uploadedAtLabel: formatRelativeTime(post.createdAt),
                          }))}
                        />
                      {/if}

                      <!-- Purple Tag Pills (Author can Add/Remove inline) -->
                      <div class="flex flex-wrap items-center gap-1.5">
                        {#each post.tags as tag (tag)}
                          <span class="inline-flex items-center gap-1 rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#5B3DF5] transition hover:bg-[#E7E3FF]">
                            <button
                              type="button"
                              onclick={() => void handleSelectTag(tag)}
                              class="cursor-pointer"
                            >
                              #{tag}
                            </button>
                            {#if post.authorId === activeUser.id}
                              <button
                                type="button"
                                onclick={() => void handleRemovePostTag(post.id, post.tags, tag)}
                                aria-label="Remove tag {tag}"
                                class="cursor-pointer rounded-full p-0.5 text-[#5B3DF5]/60 hover:bg-[#5B3DF5]/15 hover:text-[#5B3DF5]"
                              >
                                <Icon name="x" size={10} />
                              </button>
                            {/if}
                          </span>
                        {/each}
                        {#if post.authorId === activeUser.id}
                          {#if addingTagPostId === post.id}
                            <form
                              class="inline-flex items-center gap-1"
                              onsubmit={(e) => void handleAddInlinePostTag(e, post.id, post.tags)}
                            >
                              <input
                                type="text"
                                bind:value={postInlineTagDraft}
                                placeholder="new tag..."
                                class="w-24 rounded-full border border-[#C4B5FD] bg-white px-2.5 py-0.5 text-[11px] focus:border-[#6D4AFF] focus:outline-none"
                              />
                              <button
                                type="submit"
                                class="cursor-pointer rounded-full bg-[#6D4AFF] px-2 py-0.5 text-[10px] font-bold text-white"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onclick={() => {
                                  addingTagPostId = null;
                                  postInlineTagDraft = '';
                                }}
                                class="cursor-pointer text-[10px] text-slate-400 hover:text-slate-600"
                              >
                                Cancel
                              </button>
                            </form>
                          {:else}
                            <button
                              type="button"
                              onclick={() => {
                                addingTagPostId = post.id;
                                postInlineTagDraft = '';
                              }}
                              class="inline-flex cursor-pointer items-center gap-0.5 rounded-full border border-dashed border-[#C4B5FD] px-2 py-0.5 text-[10px] font-bold text-[#6D4AFF] hover:bg-[#F3F1FF]"
                            >
                              <Icon name="plus" size={10} />
                              <span>Add Tag</span>
                            </button>
                          {/if}
                        {/if}
                      </div>

                      <!-- Engagement Footer (Likes, Comments, Reposts, Bookmarks) -->
                      <div class="flex items-center justify-between border-t border-[#F1F2FA] pt-2.5 text-xs text-slate-500">
                        <div class="flex items-center gap-4">
                          <button
                            type="button"
                            onclick={() => void toggleLivePostLike(post.id)}
                            class="inline-flex cursor-pointer items-center gap-1.5 font-semibold transition {post.isLiked
                              ? 'text-rose-500'
                              : 'hover:text-rose-500'}"
                          >
                            <Icon name="heart" size={16} />
                            <span>{post.likesCount}</span>
                          </button>
                          <button
                            type="button"
                            onclick={() => toggleComments(post.id)}
                            class="inline-flex cursor-pointer items-center gap-1.5 font-semibold transition hover:text-[#6D4AFF]"
                          >
                            <Icon name="message-square" size={16} />
                            <span>{post.commentsCount}</span>
                          </button>
                          <button
                            type="button"
                            onclick={() => void toggleLivePostRepost(post.id)}
                            class="inline-flex cursor-pointer items-center gap-1.5 font-semibold transition {post.isReposted
                              ? 'text-emerald-600'
                              : 'hover:text-emerald-600'}"
                            title="Repost"
                          >
                            <Icon name="send" size={15} />
                            <span>{post.repostCount}</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onclick={() => void toggleLivePostBookmark(post.id)}
                          aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
                          class="inline-flex cursor-pointer items-center gap-1 font-semibold transition {post.isBookmarked
                            ? 'text-[#6D4AFF]'
                            : 'hover:text-[#6D4AFF]'}"
                        >
                          <Icon name="bookmark" size={16} />
                        </button>
                      </div>

                      <!-- Threaded Comments with Comment Likes -->
                      {#if commentsOpen}
                        <div class="flex flex-col gap-2.5 rounded-xl bg-[#F8F9FE] p-3">
                          {#each post.comments as cmt (cmt.id)}
                            <div class="flex flex-col gap-1 rounded-lg bg-white px-3 py-2 text-xs shadow-2xs">
                              <div class="flex items-center justify-between gap-2">
                                <strong class="text-[#1E1B4B]">{cmt.authorName}</strong>
                                <span class="text-[10px] text-slate-400">{formatRelativeTime(cmt.createdAt)}</span>
                              </div>
                              <p class="text-slate-600">{cmt.body}</p>
                              <div class="flex items-center gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onclick={() => void toggleLiveCommentLike(post.id, cmt.id)}
                                  class="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold transition {cmt.isLiked
                                    ? 'text-rose-500'
                                    : 'text-slate-400 hover:text-rose-500'}"
                                >
                                  <Icon name="heart" size={12} />
                                  <span>{cmt.likesCount ?? 0}</span>
                                </button>
                              </div>
                            </div>
                          {/each}
                          <form class="flex gap-2" onsubmit={(e) => void handleAddComment(e, post.id)}>
                            <input
                              type="text"
                              value={commentDrafts[post.id] ?? ''}
                              oninput={(e) =>
                                (commentDrafts = { ...commentDrafts, [post.id]: e.currentTarget.value })}
                              placeholder="Write a comment..."
                              class="flex-1 rounded-xl border border-[#E8EAF6] bg-white px-3 py-1.5 text-xs focus:border-[#6D4AFF] focus:outline-none"
                            />
                            <button
                              type="submit"
                              class="cursor-pointer rounded-xl bg-[#6D4AFF] px-3 py-1.5 text-xs font-bold text-white"
                            >
                              Reply
                            </button>
                          </form>
                        </div>
                      {/if}
                    </article>
                  {/each}
                {/if}
              {/if}
            </div>

            <!-- INNER COLUMN 3: Featured Project + Project Showcase 2x2 Grid (matching student-dashboard.png) -->
            <div class="flex flex-col gap-4">
              <!-- Featured Project Card -->
              <section class="rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
                <h2 class="mb-3 text-sm font-extrabold text-[#1E1B4B]">{$t.ui.featuredProject}</h2>

                {#if overview?.featuredProject}
                  {@const fp = overview.featuredProject}
                  <div class="relative aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#3B82F6]">
                    {#if fp.coverUrl}
                      {#if fp.coverType === 'video'}
                        <!-- svelte-ignore a11y_media_has_caption -->
                        <video src={fp.coverUrl} muted playsinline preload="metadata" class="h-full w-full object-cover"></video>
                      {:else}
                        <img src={fp.coverUrl} alt={fp.title} class="h-full w-full object-cover" />
                      {/if}
                    {:else}
                      <div class="flex h-full w-full items-center justify-center text-white/90">
                        <Icon name="rocket" size={34} />
                      </div>
                    {/if}
                    <span class="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-extrabold text-[#6D4AFF] shadow-xs">
                      <Icon name="star" size={10} />
                      <span>Featured</span>
                    </span>
                  </div>

                  <a
                    href={`/projects/${fp.id}`}
                    class="mt-3 block text-sm font-extrabold text-[#1E1B4B] no-underline hover:text-[#6D4AFF] hover:underline"
                  >
                    {fp.title}
                  </a>
                  <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{fp.brief}</p>

                  {#if fp.tags.length > 0}
                    <div class="mt-2.5 flex flex-wrap gap-1">
                      {#each fp.tags.slice(0, 3) as tag (tag)}
                        <span class="rounded-full bg-[#F3F1FF] px-2 py-0.5 text-[10px] font-semibold text-[#5B3DF5]">
                          #{tag}
                        </span>
                      {/each}
                    </div>
                  {/if}

                  <div class="mt-3 flex items-center justify-between border-t border-[#F1F2FA] pt-2.5 text-xs">
                    <div class="flex min-w-0 items-center gap-2">
                      <Avatar name={fp.authorName} src={fp.authorAvatarUrl} size="sm" />
                      <div class="min-w-0">
                        <strong class="block truncate text-[11px] font-bold text-[#1E1B4B]">{fp.authorName}</strong>
                        <span class="block truncate text-[10px] text-slate-400">@{fp.authorHandle}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span class="inline-flex items-center gap-0.5">
                        <Icon name="users" size={12} class="text-amber-500" />
                        {fp.contributorsCount}
                      </span>
                      <span class="inline-flex items-center gap-0.5">
                        <Icon name="eye" size={12} />
                        {formatCompactNumber(fp.viewsCount)}
                      </span>
                    </div>
                  </div>
                {:else}
                  <div class="flex flex-col items-center gap-2 rounded-xl bg-[#F8F9FE] p-5 text-center">
                    <Icon name="rocket" size={24} class="text-[#6D4AFF]" />
                    <p class="text-xs font-medium text-slate-500">
                      Publish your first project to be highlighted in Featured Projects.
                    </p>
                    <a
                      href="/projects/new"
                      class="mt-1 cursor-pointer text-xs font-bold text-[#6D4AFF] no-underline hover:underline"
                    >
                      + {$t.forms.createNewProject}
                    </a>
                  </div>
                {/if}
              </section>

              <!-- Project Showcase 2x2 Grid -->
              <section class="rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
                <div class="mb-3 flex items-center justify-between">
                  <h2 class="text-sm font-extrabold text-[#1E1B4B]">{$t.ui.projectShowcase}</h2>
                  <button
                    type="button"
                    onclick={() => setDashboardActiveTab('projects')}
                    class="cursor-pointer text-xs font-bold text-[#6D4AFF] hover:underline"
                  >
                    View All
                  </button>
                </div>

                {#if overview && overview.projectShowcase.length > 0}
                  <div class="grid grid-cols-2 gap-2">
                    {#each overview.projectShowcase as media (media.id)}
                      <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
                        {#if media.kind === 'video'}
                          <!-- svelte-ignore a11y_media_has_caption -->
                          <video src={media.url} muted preload="metadata" class="h-full w-full object-cover"></video>
                          <span class="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                            <Icon name="play" size={16} />
                          </span>
                        {:else}
                          <img src={media.url} alt={media.title} class="h-full w-full object-cover" />
                          <span class="absolute right-1.5 bottom-1.5 rounded-md bg-black/60 p-1 text-white">
                            <Icon name="image" size={11} />
                          </span>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="grid grid-cols-2 gap-2">
                    <div class="flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] text-[#6D4AFF]">
                      <Icon name="image" size={20} />
                    </div>
                    <div class="flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] text-[#7C3AED]">
                      <Icon name="video" size={20} />
                    </div>
                  </div>
                  <p class="mt-2 text-[11px] text-slate-400">
                    Upload photos &amp; videos to your projects to showcase them here.
                  </p>
                {/if}
              </section>

              {#if roleSidebar}
                <div class="flex flex-col gap-4">
                  {@render roleSidebar()}
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- FAR-RIGHT COLUMN (Profile Completion + Upcoming Events + Suggested People + Free-Member Google Ads) -->
        <aside class="flex flex-col gap-4" aria-label="Profile status, events and suggestions">
          <!-- 1. Profile Completion Card (exact top-right card in student-dashboard.png, clickable -> Update Profile) -->
          <section class="rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-sm font-extrabold text-[#1E1B4B]">{$t.ui.profileCompletion}</h2>
              <strong class="text-sm font-extrabold text-[#1E1B4B]">{completeness}%</strong>
            </div>

            <div class="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#ECEAF9]">
              <div
                class="dash-progress-shimmer h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#A855F7] transition-all duration-500"
                style="width: {Math.min(100, Math.max(8, completeness))}%;"
              ></div>
            </div>

            <div class="mt-3.5 flex flex-col gap-1.5">
              <a
                href="/profile?tab=basic"
                class="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-700 no-underline transition hover:bg-[#F5F3FF] hover:text-[#5B3DF5] hover:no-underline"
              >
                <span class="flex items-center gap-2">
                  <span class="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full {basicInfoReady ? 'bg-emerald-500 text-white' : 'border border-slate-300'}">
                    {#if basicInfoReady}<Icon name="check" size={11} />{/if}
                  </span>
                  <span>Basic Info</span>
                </span>
                <span class="text-[10px] font-bold {basicInfoReady ? 'text-emerald-600' : 'text-[#6D4AFF]'}">
                  {basicInfoReady ? 'Done' : 'Update'}
                </span>
              </a>

              <a
                href="/profile?tab=education"
                class="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-700 no-underline transition hover:bg-[#F5F3FF] hover:text-[#5B3DF5] hover:no-underline"
              >
                <span class="flex items-center gap-2">
                  <span class="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full {educationCount > 0 ? 'bg-emerald-500 text-white' : 'border border-slate-300'}">
                    {#if educationCount > 0}<Icon name="check" size={11} />{/if}
                  </span>
                  <span>Education</span>
                </span>
                <span class="rounded-full bg-[#F3F1FF] px-2 py-0.5 text-[10px] font-extrabold text-[#5B3DF5]">
                  {educationCount}
                </span>
              </a>

              <a
                href="/profile?tab=experience"
                class="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-700 no-underline transition hover:bg-[#F5F3FF] hover:text-[#5B3DF5] hover:no-underline"
              >
                <span class="flex items-center gap-2">
                  <span class="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full {experienceCount > 0 ? 'bg-emerald-500 text-white' : 'border border-slate-300'}">
                    {#if experienceCount > 0}<Icon name="check" size={11} />{/if}
                  </span>
                  <span>Experience</span>
                </span>
                <span class="rounded-full bg-[#F3F1FF] px-2 py-0.5 text-[10px] font-extrabold text-[#5B3DF5]">
                  {experienceCount}
                </span>
              </a>

              <a
                href="/profile?tab=expertise"
                class="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-700 no-underline transition hover:bg-[#F5F3FF] hover:text-[#5B3DF5] hover:no-underline"
              >
                <span class="flex items-center gap-2">
                  <span class="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full {expertiseSkillsCount > 0 ? 'bg-emerald-500 text-white' : 'border border-slate-300'}">
                    {#if expertiseSkillsCount > 0}<Icon name="check" size={11} />{/if}
                  </span>
                  <span>Expertise &amp; Skills</span>
                </span>
                <span class="rounded-full bg-[#F3F1FF] px-2 py-0.5 text-[10px] font-extrabold text-[#5B3DF5]">
                  {expertiseSkillsCount}
                </span>
              </a>

              <a
                href="/profile?tab=about"
                class="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-700 no-underline transition hover:bg-[#F5F3FF] hover:text-[#5B3DF5] hover:no-underline"
              >
                <span class="flex items-center gap-2">
                  <span class="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full {aboutSocialReady ? 'bg-emerald-500 text-white' : 'border border-slate-300'}">
                    {#if aboutSocialReady}<Icon name="check" size={11} />{/if}
                  </span>
                  <span>About &amp; Social</span>
                </span>
                <span class="text-[10px] font-bold {aboutSocialReady ? 'text-emerald-600' : 'text-[#6D4AFF]'}">
                  {aboutSocialReady ? 'Done' : 'Add'}
                </span>
              </a>

              <a
                href={onboardingCompleted ? '/profile' : '/onboarding'}
                class="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-700 no-underline transition hover:bg-[#F5F3FF] hover:text-[#5B3DF5] hover:no-underline"
              >
                <span class="flex items-center gap-2">
                  <span class="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full {onboardingCompleted ? 'bg-emerald-500 text-white' : 'border border-slate-300'}">
                    {#if onboardingCompleted}<Icon name="check" size={11} />{/if}
                  </span>
                  <span>Onboarding Status</span>
                </span>
                <span class="text-[10px] font-bold {onboardingCompleted ? 'text-emerald-600' : 'text-[#6D4AFF]'}">
                  {onboardingCompleted ? 'Complete' : 'Pending'}
                </span>
              </a>

              <a
                href="/projects/new"
                class="flex w-full cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 text-left text-xs font-semibold text-slate-700 no-underline transition hover:bg-[#F5F3FF] hover:text-[#5B3DF5] hover:no-underline"
              >
                <span class="flex items-center gap-2">
                  <span class="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full {$dashboardState.projects.length > 0 ? 'bg-emerald-500 text-white' : 'border border-slate-300'}">
                    {#if $dashboardState.projects.length > 0}<Icon name="check" size={11} />{/if}
                  </span>
                  <span>Add a Project (+20%)</span>
                </span>
                <span class="text-[10px] font-bold text-[#6D4AFF]">{$dashboardState.projects.length}</span>
              </a>
            </div>

            <a
              href="/profile"
              class="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-4 py-2.5 text-xs font-extrabold text-white no-underline shadow-[0_6px_16px_rgba(109,74,255,0.28)] transition hover:brightness-105 hover:no-underline"
            >
              <span>Complete Now</span>
              <Icon name="arrow-right" size={14} />
            </a>
          </section>

          <!-- 2. Upcoming Events (Real PostgreSQL public.events + RSVP toggle) -->
          <section class="rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
            <div class="mb-3 flex items-center justify-between">
              <h2 class="flex items-center gap-1.5 text-sm font-extrabold text-[#1E1B4B]">
                <Icon name="calendar" size={15} class="text-[#6D4AFF]" />
                <span>{$t.ui.upcomingEvents}</span>
              </h2>
              <button
                type="button"
                onclick={() => setDashboardActiveTab('opportunities')}
                class="cursor-pointer text-xs font-bold text-[#6D4AFF] hover:underline"
              >
                View All
              </button>
            </div>

            <div class="flex flex-col gap-3">
              {#each (overview?.upcomingEvents ?? []).slice(0, 3) as evt, idx (evt.id)}
                {@const badge = formatEventBadge(evt.startTime)}
                {@const isGoing = evt.userRsvpStatus === 'going'}
                <div class="flex items-center justify-between gap-2.5">
                  <div class="flex min-w-0 items-center gap-2.5">
                    <div
                      class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-center {idx === 0
                        ? 'bg-[#EEF2FF] text-[#4F46E5]'
                        : idx === 1
                          ? 'bg-[#FFF0F6] text-[#DB2777]'
                          : 'bg-[#F3EEFF] text-[#7C3AED]'}"
                    >
                      <span class="text-[9px] font-extrabold tracking-wider">{badge.month}</span>
                      <strong class="text-sm leading-none font-extrabold">{badge.day}</strong>
                    </div>
                    <div class="min-w-0">
                      <strong class="block truncate text-xs font-bold text-[#1E1B4B]">{evt.title}</strong>
                      <span class="block truncate text-[11px] text-slate-500">
                        {evt.venue ?? evt.mode}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onclick={() => void handleToggleEventRsvp(evt.id, evt.title)}
                    class="shrink-0 cursor-pointer rounded-full border px-2.5 py-1 text-[10px] font-bold transition {isGoing
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-[#DDD6FE] bg-[#F5F3FF] text-[#5B3DF5] hover:bg-[#EDE9FE]'}"
                  >
                    {isGoing ? 'Going ✓' : 'RSVP'}
                  </button>
                </div>
              {/each}
            </div>
          </section>

          <!-- 3. Suggested People (Real PostgreSQL public.profiles + Follow toggle) -->
          <section class="rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
            <div class="mb-3 flex items-center justify-between">
              <h2 class="flex items-center gap-1.5 text-sm font-extrabold text-[#1E1B4B]">
                <Icon name="user-plus" size={15} class="text-[#6D4AFF]" />
                <span>{$t.ui.suggestedPeople}</span>
              </h2>
              <button
                type="button"
                onclick={() => (networkModalTab = 'discover')}
                class="cursor-pointer text-xs font-bold text-[#6D4AFF] hover:underline"
              >
                View All
              </button>
            </div>

            {#if overview && overview.suggestedPeople.length > 0}
              <div class="flex flex-col gap-3">
                {#each overview.suggestedPeople.slice(0, 4) as person (person.id)}
                  <div class="flex items-center justify-between gap-2">
                    <a
                      href="/u/{person.handle}"
                      class="flex min-w-0 items-center gap-2.5 no-underline hover:no-underline"
                    >
                      <Avatar name={person.name} src={person.avatarUrl} size="sm" />
                      <div class="min-w-0">
                        <strong class="block truncate text-xs font-bold text-[#1E1B4B]">
                          {person.name}
                        </strong>
                        <span class="block truncate text-[11px] text-slate-500">
                          {person.headline ?? person.college ?? `@${person.handle}`}
                        </span>
                      </div>
                    </a>
                    <button
                      type="button"
                      onclick={() => void handleToggleFollow(person.id, person.name)}
                      class="shrink-0 cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold transition {person.isFollowing
                        ? 'border-[#DDD6FE] bg-[#F3F1FF] text-[#5B3DF5]'
                        : 'border-[#E2E5F5] bg-white text-[#5B3DF5] hover:border-[#6D4AFF] hover:bg-[#F3F1FF]'}"
                    >
                      {person.isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-xs text-slate-500">
                Invite classmates or teammates to a project to grow your Collab47 network.
              </p>
            {/if}
          </section>

          <!-- 3b. Activity Badges & Achievements -->
          {#if myBadges}
            <section class="rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-[0_2px_10px_rgba(30,27,75,0.04)]">
              <div class="mb-3 flex items-center justify-between">
                <h2 class="flex items-center gap-1.5 text-sm font-extrabold text-[#1E1B4B]">
                  <Icon name="award" size={15} class="text-amber-500" />
                  <span>Badges &amp; Level</span>
                </h2>
                <a
                  href="/profile?tab=badges"
                  class="text-xs font-bold text-[#6D4AFF] no-underline hover:underline"
                >
                  View All
                </a>
              </div>
              <BadgesShowcase summary={myBadges} compact />
            </section>
          {/if}

          <!-- 4. Google Display Ads -->
          {#if $shouldShowAds}
            <GoogleAdSlot
              slot="dashboard-right-top"
              variant="sidebar"
              label="Google Ads · Sponsored"
            />
          {/if}
        </aside>
      </div>
    </main>

    <Footer />
  {/if}
</div>

{#if managingMediaProject}
  <ProjectMediaManagerModal
    project={managingMediaProject}
    onClose={() => (managingMediaProjectId = null)}
    onShareToWall={(projectId, mediaIds) => prefillProjectUpdate(projectId, mediaIds)}
  />
{/if}

{#if invitingProject}
  <InviteContributorModal
    project={invitingProject}
    onClose={() => (invitingProjectId = null)}
  />
{/if}

{#if networkModalTab}
  <NetworkModal
    initialTab={networkModalTab}
    onClose={() => (networkModalTab = null)}
  />
{/if}

<style>
  .hero-banner {
    background: linear-gradient(115deg, #1a1744 0%, #37298a 52%, #6d4aff 100%);
  }
</style>
