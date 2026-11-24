<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ApiError } from '$lib/api/client';
  import {
    projectsApi,
    type ApiProject,
    type ApiProjectContributor,
    type ApiProjectInvitation,
    type ApiProjectMedia,
    type CreateProjectMediaPayload,
    type CreateProjectPayload,
    type ProjectEditorOptions,
    type ProjectMilestoneStatus,
    type ProjectStemCategory,
    type ProjectVisibility,
    type ProjectWorkbenchStatus,
    type UpdateProjectPayload,
  } from '$lib/api/projects.api';
  import { uploadsApi } from '$lib/api/uploads.api';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import {
    authState,
    createUserProject,
    formatMediaFileSize,
    inviteContributorToProject,
    profileState,
    pushToast,
    t,
    updateUserProject,
  } from '$lib/stores';
  import { Avatar, Badge, Button, Icon, Input, Spinner, Textarea, type IconName } from '$ui';

  interface Props {
    mode: 'create' | 'edit';
    projectId?: string;
  }

  let { mode, projectId }: Props = $props();

  const TEAM_ROLES = [
    { value: 'team_member', label: 'Team Member' },
    { value: 'developer', label: 'Developer / Engineer' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'designer', label: 'Designer / CAD' },
    { value: 'technical_lead', label: 'Technical Lead' },
    { value: 'faculty_mentor', label: 'Faculty Mentor / PI' },
    { value: 'project_lead', label: 'Co-Lead' },
    { value: 'other', label: 'Other Contributor' },
  ];

  const MILESTONE_STATUS_OPTIONS: ReadonlyArray<{ value: ProjectMilestoneStatus; label: string }> = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
  ];

  interface DraftMilestone {
    localId: string;
    id?: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: ProjectMilestoneStatus;
  }

  interface QueuedContributorInvite {
    localId: string;
    email: string;
    roleTitle: string;
    teamRole: string;
    message: string;
  }

  interface PendingDraftMedia {
    localId: string;
    kind: 'image' | 'video';
    url: string;
    title: string;
    mimeType?: string;
    fileSizeBytes?: number;
    fileSizeLabel?: string;
    isCover: boolean;
  }

  const activeUser = $derived($profileState.profile ?? $authState.user);
  const dashboardHref = $derived(getDashboardPath(activeUser?.accountType ?? 'student'));

  let isBootstrapping = $state(true);
  let loadError = $state('');
  let options = $state<ProjectEditorOptions | null>(null);
  let loadedProject = $state<ApiProject | null>(null);

  type CreateWizardStep = 1 | 2 | 3 | 4 | 5 | 6;

  const CREATE_STEPS: ReadonlyArray<{
    step: CreateWizardStep;
    title: string;
    shortLabel: string;
    subtitle: string;
    icon: IconName;
  }> = [
    {
      step: 1,
      title: 'Core Identity',
      shortLabel: '1. Identity',
      subtitle: 'Title, sector, academic branch & project summary',
      icon: 'rocket',
    },
    {
      step: 2,
      title: 'STEM & Affiliations',
      shortLabel: '2. STEM',
      subtitle: 'STEM category, discipline, types, levels & institution',
      icon: 'layers',
    },
    {
      step: 3,
      title: 'Scope, Milestones & Timeline',
      shortLabel: '3. Milestones',
      subtitle: 'Problem, deliverables, structured milestones, dates & tags',
      icon: 'calendar',
    },
    {
      step: 4,
      title: 'Cover & Media',
      shortLabel: '4. Media',
      subtitle: 'Upload project images/videos & select mandatory cover image',
      icon: 'image',
    },
    {
      step: 5,
      title: 'Add Contributors',
      shortLabel: '5. Team',
      subtitle: 'Queue teammate & mentor invitations by email',
      icon: 'user-plus',
    },
    {
      step: 6,
      title: 'Preview & Publish',
      shortLabel: '6. Preview',
      subtitle: 'Review your full project details, milestones & cover before publishing',
      icon: 'eye',
    },
  ];

  // Create mode 6-step wizard state (Final step = Preview & Publish)
  let createStep = $state<CreateWizardStep>(1);

  const activeCreateStepMeta = $derived(
    CREATE_STEPS.find((s) => s.step === createStep) ?? CREATE_STEPS[0]!,
  );

  // Edit mode section tabs
  let editTab = $state<'details' | 'media' | 'contributors'>('details');

  // === ALL public.projects schema form fields ===
  let title = $state('');
  let brief = $state('');
  let projectOverview = $state('');
  let description = $state('');
  let problemStatement = $state('');
  let expectedDeliverables = $state('');

  let sector = $state('');
  let sectorId = $state('');
  let primaryStemCategory = $state<ProjectStemCategory | ''>('');
  let primaryStemCategoryId = $state('');
  let primaryStemDiscipline = $state('');
  let primaryStemDisciplineId = $state('');
  let leadInstitutionId = $state('');
  let leadOrganizationId = $state('');
  let branch = $state('');

  let selectedProjectTypes = $state<string[]>([]);
  let selectedAcademicLevels = $state<string[]>([]);
  let selectedBroadDomains = $state<string[]>([]);

  let tagsInput = $state('');
  let keywordsInput = $state('');
  let skillsInput = $state('');

  let startDate = $state('');
  let endDate = $state('');
  let actualCompletionDate = $state('');

  let workbenchStatus = $state<ProjectWorkbenchStatus>('ongoing');
  let visibility = $state<ProjectVisibility>('public');
  let isDraft = $state(false);
  let isPinned = $state(false);
  let confidentialityWarningAcknowledged = $state(true);
  let deliverableUrl = $state('');

  // Media state (draft list for Create mode, live DB list for Edit mode)
  let draftMedia = $state<PendingDraftMedia[]>([]);
  let existingMedia = $state<ApiProjectMedia[]>([]);
  let mediaFileInput = $state<HTMLInputElement | null>(null);
  let isUploadingMedia = $state(false);
  let mediaUploadError = $state('');
  let coverBusyId = $state<string | null>(null);

  // Structured Project Milestones (persisted to public.project_stages)
  let milestones = $state<DraftMilestone[]>([
    {
      localId: 'ms-init-1',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'pending',
    },
  ]);
  let updatingMilestoneId = $state<string | null>(null);

  // Contributors & invitations state
  let contributors = $state<ApiProjectContributor[]>([]);
  let invitations = $state<ApiProjectInvitation[]>([]);
  let queuedInvites = $state<QueuedContributorInvite[]>([]);
  let inviteEmail = $state('');
  let inviteRoleTitle = $state('Core Contributor');
  let inviteTeamRole = $state('team_member');
  let inviteMessage = $state('');
  let isSendingInvite = $state(false);
  let inviteError = $state('');

  // Submit state
  let isSubmitting = $state(false);
  let formError = $state('');

  const effectiveProjectId = $derived(mode === 'edit' ? (projectId ?? loadedProject?.id ?? null) : null);

  const previewCoverMedia = $derived(
    draftMedia.find((m) => m.kind === 'image' && m.isCover) ?? draftMedia[0] ?? null,
  );
  const selectedInstitutionLabel = $derived(
    options?.institutions.find((i) => i.id === leadInstitutionId)?.label ?? '',
  );
  const selectedOrganizationLabel = $derived(
    options?.organizations.find((o) => o.id === leadOrganizationId)?.label ?? '',
  );
  const selectedStemCategoryLabel = $derived(
    options?.stemCategories.find((c) => c.id === primaryStemCategoryId)?.label ??
      primaryStemCategory.replace(/_/g, ' '),
  );

  const filteredDisciplines = $derived.by(() => {
    const all = options?.stemDisciplines ?? [];
    if (!primaryStemCategoryId) return all;
    const matched = all.filter((d) => d.parentId === primaryStemCategoryId);
    return matched.length > 0 ? matched : all;
  });

  const hasSelectedCoverImage = $derived(
    mode === 'create'
      ? draftMedia.some((m) => m.kind === 'image' && m.isCover)
      : existingMedia.some((m) => m.kind === 'image' && m.isCover),
  );

  function parseCsv(raw: string): string[] {
    return Array.from(
      new Set(
        raw
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
  }

  function toggleChip(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function appendSkillSuggestion(skillLabel: string): void {
    const current = parseCsv(skillsInput);
    if (current.some((s) => s.toLowerCase() === skillLabel.toLowerCase())) return;
    skillsInput = [...current, skillLabel].join(', ');
  }

  function syncSectorSelection(nextSectorId: string): void {
    sectorId = nextSectorId;
    const found = options?.sectors.find((s) => s.id === nextSectorId);
    if (found) {
      sector = found.label;
    }
  }

  function syncStemCategorySelection(nextCatId: string): void {
    primaryStemCategoryId = nextCatId;
    const found = options?.stemCategories.find((c) => c.id === nextCatId);
    if (found) {
      primaryStemCategory = found.code as ProjectStemCategory;
    } else {
      primaryStemCategory = '';
    }
    if (primaryStemDisciplineId) {
      const stillValid = options?.stemDisciplines.some(
        (d) => d.id === primaryStemDisciplineId && (!nextCatId || d.parentId === nextCatId),
      );
      if (!stillValid) {
        primaryStemDisciplineId = '';
        primaryStemDiscipline = '';
      }
    }
  }

  function syncStemDisciplineSelection(nextDiscId: string): void {
    primaryStemDisciplineId = nextDiscId;
    const found = options?.stemDisciplines.find((d) => d.id === nextDiscId);
    primaryStemDiscipline = found ? found.label : '';
  }

  function populateFromProject(project: ApiProject, opts: ProjectEditorOptions | null): void {
    loadedProject = project;
    title = project.title;
    brief = project.brief;
    projectOverview = project.projectOverview ?? '';
    description = project.description ?? '';
    problemStatement = project.problemStatement ?? '';
    expectedDeliverables = project.expectedDeliverables ?? '';

    sector = project.sector;
    sectorId =
      project.sectorId ??
      opts?.sectors.find((s) => s.label.toLowerCase() === project.sector.toLowerCase())?.id ??
      '';
    primaryStemCategory = (project.primaryStemCategory as ProjectStemCategory | null) ?? '';
    primaryStemCategoryId =
      project.primaryStemCategoryId ??
      opts?.stemCategories.find((c) => c.code === project.primaryStemCategory)?.id ??
      '';
    primaryStemDiscipline = project.primaryStemDiscipline ?? '';
    primaryStemDisciplineId =
      project.primaryStemDisciplineId ??
      opts?.stemDisciplines.find((d) => d.label === project.primaryStemDiscipline)?.id ??
      '';

    leadInstitutionId = project.leadInstitutionId ?? '';
    leadOrganizationId = project.leadOrganizationId ?? '';
    branch = project.branch ?? '';

    selectedProjectTypes = [...(project.projectTypes ?? [])];
    selectedAcademicLevels = [...(project.academicLevels ?? [])];
    selectedBroadDomains = [...(project.broadDomains ?? [])];

    tagsInput = (project.tags ?? []).join(', ');
    keywordsInput = (project.keywords ?? []).join(', ');
    skillsInput = (project.skills ?? []).join(', ');

    startDate = project.startDate ?? '';
    endDate = project.endDate ?? '';
    actualCompletionDate = project.actualCompletionDate ?? '';

    workbenchStatus = (['idea', 'ongoing', 'completed', 'on_hold'].includes(project.workbenchStatus)
      ? project.workbenchStatus
      : 'ongoing') as ProjectWorkbenchStatus;
    visibility = (['public', 'connections_only', 'private_link'].includes(project.visibility)
      ? project.visibility
      : 'public') as ProjectVisibility;
    isDraft = Boolean(project.isDraft);
    isPinned = Boolean(project.isPinned);
    confidentialityWarningAcknowledged = Boolean(project.confidentialityWarningAcknowledged);
    deliverableUrl = project.deliverableUrl ?? '';

    existingMedia = [...(project.media ?? [])];
    milestones =
      project.milestones && project.milestones.length > 0
        ? project.milestones.map((m) => ({
            localId: m.id,
            id: m.id,
            title: m.title,
            description: m.description ?? '',
            startDate: m.startDate ?? '',
            endDate: m.endDate ?? '',
            status: m.status,
          }))
        : [];
    contributors = [...(project.contributors ?? [])];
    invitations = [...(project.invitations ?? [])];
  }

  function addMilestoneRow(): void {
    milestones = [
      ...milestones,
      {
        localId: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'pending',
      },
    ];
  }

  function removeMilestoneRow(localId: string): void {
    milestones = milestones.filter((m) => m.localId !== localId);
  }

  async function handleMilestoneStatusChange(
    localId: string,
    nextStatus: ProjectMilestoneStatus,
  ): Promise<void> {
    const target = milestones.find((m) => m.localId === localId);
    if (!target) return;

    milestones = milestones.map((m) =>
      m.localId === localId ? { ...m, status: nextStatus } : m,
    );

    // If editing an already-saved milestone on an existing project, persist status immediately!
    if (mode === 'edit' && effectiveProjectId && target.id) {
      updatingMilestoneId = target.id;
      try {
        await projectsApi.updateMilestoneStatus(effectiveProjectId, target.id, nextStatus);
        pushToast({
          tone: 'success',
          title: 'Milestone status updated',
          message: `"${target.title}" is now ${nextStatus.replace('_', ' ')}.`,
        });
      } catch (err) {
        pushToast({
          tone: 'error',
          title: 'Status update failed',
          message: err instanceof ApiError ? err.message : 'Please try again.',
        });
      } finally {
        updatingMilestoneId = null;
      }
    }
  }

  function handleQueueContributor(event: SubmitEvent): void {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      inviteError = 'Please enter a valid contributor email address.';
      return;
    }
    if (queuedInvites.some((q) => q.email === email)) {
      inviteError = 'This email is already queued for invitation.';
      return;
    }
    inviteError = '';
    queuedInvites = [
      ...queuedInvites,
      {
        localId: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        email,
        roleTitle: inviteRoleTitle.trim() || 'Core Contributor',
        teamRole: inviteTeamRole,
        message: inviteMessage.trim(),
      },
    ];
    inviteEmail = '';
    inviteMessage = '';
  }

  function removeQueuedInvite(localId: string): void {
    queuedInvites = queuedInvites.filter((q) => q.localId !== localId);
  }

  async function loadEditorBootstrap(): Promise<void> {
    isBootstrapping = true;
    loadError = '';
    try {
      const [optsResult, projResult] = await Promise.all([
        projectsApi.getOptions(),
        mode === 'edit' && projectId ? projectsApi.getById(projectId) : Promise.resolve(null),
      ]);
      options = optsResult;

      if (mode === 'edit') {
        if (!projResult) {
          loadError = 'Project not found or you do not have permission to view it.';
        } else if (!projResult.canEdit) {
          pushToast({
            tone: 'info',
            title: 'Read-only access',
            message: 'Only the creator who posted this project can edit it.',
          });
          await goto(`/projects/${projResult.id}`, { replaceState: true });
          return;
        } else {
          populateFromProject(projResult, optsResult);
        }
      } else if (optsResult.sectors.length > 0 && !sectorId) {
        const defaultSec = optsResult.sectors[0];
        if (defaultSec) {
          sectorId = defaultSec.id;
          sector = defaultSec.label;
        }
      }
    } catch (err) {
      loadError =
        err instanceof ApiError
          ? err.message
          : 'Unable to load project categories & options from the API. Please ensure the backend server is running and retry.';
    } finally {
      isBootstrapping = false;
    }
  }

  onMount(() => {
    void loadEditorBootstrap();
  });

  async function handleMediaFilesSelected(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (files.length === 0) return;

    mediaUploadError = '';
    isUploadingMedia = true;
    try {
      const uploaded = await uploadsApi.uploadFiles(files, 'projects');

      if (mode === 'create') {
        const alreadyHasCover = draftMedia.some((m) => m.kind === 'image' && m.isCover);
        let assignedCover = alreadyHasCover;
        const added: PendingDraftMedia[] = uploaded.map((item, idx) => {
          const makeCover = !assignedCover && item.kind === 'image';
          if (makeCover) assignedCover = true;
          return {
            localId: `draft-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            kind: item.kind,
            url: item.url,
            title: item.originalName,
            mimeType: item.contentType,
            fileSizeBytes: item.sizeBytes,
            fileSizeLabel: formatMediaFileSize(item.sizeBytes),
            isCover: makeCover,
          };
        });
        draftMedia = [...draftMedia, ...added];
      } else if (effectiveProjectId) {
        const alreadyHasCover = existingMedia.some((m) => m.kind === 'image' && m.isCover);
        let assignedCover = alreadyHasCover;
        const payloadItems: CreateProjectMediaPayload[] = uploaded.map((item) => {
          const makeCover = !assignedCover && item.kind === 'image';
          if (makeCover) assignedCover = true;
          return {
            kind: item.kind,
            url: item.url,
            title: item.originalName,
            mimeType: item.contentType,
            fileSizeBytes: item.sizeBytes,
            isCover: makeCover,
          };
        });
        const savedMedia = await projectsApi.addMedia(effectiveProjectId, payloadItems);
        existingMedia = [...existingMedia, ...savedMedia];
      }

      pushToast({
        tone: 'success',
        title: 'Media uploaded',
        message: `${uploaded.length} file${uploaded.length > 1 ? 's' : ''} added to project gallery.`,
      });
    } catch (err) {
      mediaUploadError =
        err instanceof ApiError
          ? err.message
          : 'Failed to upload media. Check file format and size limits.';
    } finally {
      isUploadingMedia = false;
    }
  }

  function markDraftCover(localId: string): void {
    const target = draftMedia.find((m) => m.localId === localId);
    if (!target || target.kind !== 'image') return;
    draftMedia = draftMedia.map((m) => ({
      ...m,
      isCover: m.localId === localId,
    }));
  }

  function removeDraftMedia(localId: string): void {
    const remaining = draftMedia.filter((m) => m.localId !== localId);
    if (!remaining.some((m) => m.kind === 'image' && m.isCover)) {
      const firstImgIdx = remaining.findIndex((m) => m.kind === 'image');
      if (firstImgIdx !== -1 && remaining[firstImgIdx]) {
        remaining[firstImgIdx] = { ...remaining[firstImgIdx], isCover: true };
      }
    }
    draftMedia = remaining;
  }

  async function markExistingCover(mediaId: string): Promise<void> {
    if (!effectiveProjectId) return;
    const target = existingMedia.find((m) => m.id === mediaId);
    if (!target || target.kind !== 'image') return;
    coverBusyId = mediaId;
    try {
      await projectsApi.setCoverMedia(effectiveProjectId, mediaId);
      existingMedia = existingMedia.map((m) => ({ ...m, isCover: m.id === mediaId }));
      pushToast({
        tone: 'success',
        title: 'Cover image updated',
        message: 'Your selected image is now the project cover.',
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not update cover',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      coverBusyId = null;
    }
  }

  async function removeExistingMedia(mediaId: string): Promise<void> {
    if (!effectiveProjectId) return;
    const remainingImages = existingMedia.filter((m) => m.id !== mediaId && m.kind === 'image');
    if (remainingImages.length === 0) {
      pushToast({
        tone: 'warning',
        title: 'Cover image required',
        message: 'A published project must keep at least one cover image. Upload another image first.',
      });
      return;
    }
    coverBusyId = mediaId;
    try {
      await projectsApi.removeMedia(effectiveProjectId, mediaId);
      const refreshed = await projectsApi.getById(effectiveProjectId);
      existingMedia = [...refreshed.media];
      pushToast({
        tone: 'info',
        title: 'Media removed',
        message: 'Removed media item from project gallery.',
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Remove failed',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      coverBusyId = null;
    }
  }

  function validateDates(): string | null {
    if (startDate && endDate && endDate < startDate) {
      return 'Target End Date must be on or after Start Date.';
    }
    for (const ms of milestones) {
      if (ms.title.trim() && ms.startDate && ms.endDate && ms.endDate < ms.startDate) {
        return `Milestone "${ms.title.trim()}" end date must be on or after its start date.`;
      }
    }
    return null;
  }

  function validateCreateStep(step: CreateWizardStep): string | null {
    if (step === 1) {
      if (!title.trim()) return 'Project Title is required to continue.';
      if (!brief.trim()) return 'Short Project Brief is required to continue.';
      if (!sector.trim()) return 'Please select a Sector to continue.';
    }
    if (step === 3) {
      return validateDates();
    }
    if (step === 4) {
      if (!hasSelectedCoverImage) {
        return 'A cover image is required to publish a project. Upload at least one image and mark it as Cover Image.';
      }
    }
    return null;
  }

  function scrollEditorTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goToNextCreateStep(): void {
    formError = '';
    const err = validateCreateStep(createStep);
    if (err) {
      formError = err;
      return;
    }
    if (createStep < 6) {
      createStep = (createStep + 1) as CreateWizardStep;
      scrollEditorTop();
    }
  }

  function goToPrevCreateStep(): void {
    formError = '';
    if (createStep > 1) {
      createStep = (createStep - 1) as CreateWizardStep;
      scrollEditorTop();
    }
  }

  function jumpToCreateStep(target: CreateWizardStep): void {
    formError = '';
    if (target < createStep) {
      createStep = target;
      scrollEditorTop();
      return;
    }
    for (let s = createStep; s < target; s += 1) {
      const err = validateCreateStep(s as CreateWizardStep);
      if (err) {
        formError = err;
        return;
      }
    }
    createStep = target;
    scrollEditorTop();
  }

  async function publishCreateProject(): Promise<void> {
    formError = '';
    const cleanTitle = title.trim();
    const cleanBrief = brief.trim();
    if (!cleanTitle || !cleanBrief || !sector.trim()) {
      formError = 'Project Title, Sector, and Short Project Brief are required.';
      createStep = 1;
      return;
    }
    const dateErr = validateDates();
    if (dateErr) {
      formError = dateErr;
      createStep = 3;
      return;
    }
    if (!hasSelectedCoverImage) {
      formError =
        'A cover image is required to publish a project. Upload at least one image and mark it as Cover Image.';
      createStep = 4;
      return;
    }

    isSubmitting = true;
    try {
      const tags = parseCsv(tagsInput);
      const keywords = parseCsv(keywordsInput);
      const skills = parseCsv(skillsInput);
      const structuredMilestones = milestones
        .filter((m) => m.title.trim())
        .map((m) => ({
          title: m.title.trim(),
          description: m.description.trim() || undefined,
          startDate: m.startDate || undefined,
          endDate: m.endDate || undefined,
          status: m.status,
        }));

      const payload: CreateProjectPayload = {
        title: cleanTitle,
        brief: cleanBrief,
        projectOverview: projectOverview.trim() || undefined,
        description: description.trim() || undefined,
        problemStatement: problemStatement.trim() || undefined,
        expectedDeliverables: expectedDeliverables.trim() || undefined,
        sector: sector.trim(),
        sectorId: sectorId || undefined,
        primaryStemCategory: (primaryStemCategory || undefined) as ProjectStemCategory | undefined,
        primaryStemCategoryId: primaryStemCategoryId || undefined,
        primaryStemDiscipline: primaryStemDiscipline.trim() || undefined,
        primaryStemDisciplineId: primaryStemDisciplineId || undefined,
        leadInstitutionId: leadInstitutionId || undefined,
        leadOrganizationId: leadOrganizationId || undefined,
        branch: branch.trim() || undefined,
        projectTypes: selectedProjectTypes,
        academicLevels: selectedAcademicLevels,
        broadDomains: selectedBroadDomains,
        keywords,
        skills,
        tags,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        actualCompletionDate: actualCompletionDate || undefined,
        workbenchStatus,
        status: workbenchStatus,
        visibility,
        isDraft,
        confidentialityWarningAcknowledged,
        isPinned,
        deliverableUrl: deliverableUrl.trim() || undefined,
        milestones: structuredMilestones,
        media: draftMedia.map((m) => ({
          kind: m.kind,
          url: m.url,
          title: m.title,
          mimeType: m.mimeType,
          fileSizeBytes: m.fileSizeBytes,
          isCover: m.isCover,
        })),
      };

      const created = await createUserProject(payload);

      // Dispatch any contributor invitations queued in Step 5
      let invitedOk = 0;
      for (const inv of queuedInvites) {
        try {
          await inviteContributorToProject(created.id, {
            email: inv.email,
            roleTitle: inv.roleTitle,
            teamRole: inv.teamRole,
            message: inv.message || undefined,
          });
          invitedOk += 1;
        } catch {
          // Continue sending remaining invitations
        }
      }

      pushToast({
        tone: 'success',
        title: isDraft ? 'Project draft saved!' : 'Project published!',
        message:
          invitedOk > 0
            ? `"${created.title}" is live and ${invitedOk} contributor invitation${invitedOk > 1 ? 's were' : ' was'} sent.`
            : `"${created.title}" is now live on Collab47.`,
      });
      await goto(`/projects/${created.id}`);
    } catch (err) {
      formError =
        err instanceof ApiError
          ? err.message
          : 'Unable to publish project right now. Please check all fields and try again.';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleSubmitDetails(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    formError = '';

    // In 6-step Create mode, Steps 1-5 advance forward; Step 6 publishes!
    if (mode === 'create') {
      if (createStep < 6) {
        goToNextCreateStep();
      } else {
        await publishCreateProject();
      }
      return;
    }

    const cleanTitle = title.trim();
    const cleanBrief = brief.trim();
    if (!cleanTitle || !cleanBrief) {
      formError = 'Project Title and Short Project Brief are required.';
      return;
    }

    const dateErr = validateDates();
    if (dateErr) {
      formError = dateErr;
      return;
    }

    if (!effectiveProjectId) return;

    isSubmitting = true;
    try {
      const tags = parseCsv(tagsInput);
      const keywords = parseCsv(keywordsInput);
      const skills = parseCsv(skillsInput);
      const structuredMilestones = milestones
        .filter((m) => m.title.trim())
        .map((m) => ({
          id: m.id,
          title: m.title.trim(),
          description: m.description.trim() || null,
          startDate: m.startDate || null,
          endDate: m.endDate || null,
          status: m.status,
        }));

      const payload: UpdateProjectPayload = {
        title: cleanTitle,
        brief: cleanBrief,
        projectOverview: projectOverview.trim() || null,
        description: description.trim() || null,
        problemStatement: problemStatement.trim() || null,
        expectedDeliverables: expectedDeliverables.trim() || null,
        sector: sector.trim(),
        sectorId: sectorId || null,
        primaryStemCategory: (primaryStemCategory || null) as ProjectStemCategory | null,
        primaryStemCategoryId: primaryStemCategoryId || null,
        primaryStemDiscipline: primaryStemDiscipline.trim() || null,
        primaryStemDisciplineId: primaryStemDisciplineId || null,
        leadInstitutionId: leadInstitutionId || null,
        leadOrganizationId: leadOrganizationId || null,
        branch: branch.trim() || null,
        projectTypes: selectedProjectTypes,
        academicLevels: selectedAcademicLevels,
        broadDomains: selectedBroadDomains,
        keywords,
        skills,
        tags,
        startDate: startDate || null,
        endDate: endDate || null,
        actualCompletionDate: actualCompletionDate || null,
        workbenchStatus,
        status: workbenchStatus,
        visibility,
        isDraft,
        confidentialityWarningAcknowledged,
        isPinned,
        deliverableUrl: deliverableUrl.trim() || null,
        milestones: structuredMilestones,
      };

      const updated = await updateUserProject(effectiveProjectId, payload);
      populateFromProject(updated, options);
      pushToast({
        tone: 'success',
        title: 'Project updated',
        message: `"${updated.title}" changes and milestones saved successfully.`,
      });
    } catch (err) {
      formError =
        err instanceof ApiError
          ? err.message
          : 'Unable to save project right now. Please check all fields and try again.';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleInviteContributor(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!effectiveProjectId) return;
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      inviteError = 'Please enter a valid contributor email address.';
      return;
    }
    inviteError = '';
    isSendingInvite = true;
    try {
      const result = await inviteContributorToProject(effectiveProjectId, {
        email,
        roleTitle: inviteRoleTitle.trim() || 'Contributor',
        teamRole: inviteTeamRole,
        message: inviteMessage.trim() || undefined,
      });
      invitations = [result.invitation, ...invitations];
      inviteEmail = '';
      inviteMessage = '';
      pushToast({
        tone: 'success',
        title: result.inviteeRegistered ? 'Contributor invited!' : 'Registration invite sent!',
        message: result.message,
      });
    } catch (err) {
      inviteError =
        err instanceof ApiError
          ? err.message
          : 'Unable to send contributor invitation.';
    } finally {
      isSendingInvite = false;
    }
  }

  async function copyInviteLink(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      pushToast({ tone: 'info', title: 'Invite link copied', message: 'Share this link with your teammate.' });
    } catch {
      pushToast({ tone: 'info', title: 'Invite link ready', message: url });
    }
  }
</script>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
  <!-- Top Breadcrumb & Title Header -->
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <a
        href={dashboardHref}
        class="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E5F5] bg-white px-3 py-2 text-xs font-bold text-[#1E1B4B] no-underline shadow-xs transition hover:border-[#6D4AFF] hover:text-[#6D4AFF] hover:no-underline"
      >
        <Icon name="arrow-left" size={14} />
        <span>{$t.forms.backToDashboard}</span>
      </a>
      <div>
        <h1 class="text-xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-2xl">
          {mode === 'create' ? $t.forms.createNewProject : $t.forms.editProject}
        </h1>
        {#if mode === 'edit' && loadedProject}
          <p class="text-xs font-medium text-slate-500">
            {loadedProject.title} · <span class="font-mono text-[11px]">{loadedProject.shortId}</span>
          </p>
        {:else if mode === 'create'}
          <p class="text-xs font-medium text-slate-500">
            Step {createStep} of 6 · {activeCreateStepMeta.subtitle}
          </p>
        {/if}
      </div>
    </div>

    {#if mode === 'edit' && loadedProject}
      <!-- Edit Mode Section Tabs -->
      <div class="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#E8EAF6] bg-white p-1.5 shadow-xs">
        <button
          type="button"
          onclick={() => (editTab = 'details')}
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition {editTab === 'details'
            ? 'bg-[#6D4AFF] text-white'
            : 'text-slate-600 hover:bg-[#F5F3FF] hover:text-[#1E1B4B]'}"
        >
          <Icon name="file-text" size={13} />
          <span>Details</span>
        </button>
        <button
          type="button"
          onclick={() => (editTab = 'media')}
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition {editTab === 'media'
            ? 'bg-[#6D4AFF] text-white'
            : 'text-slate-600 hover:bg-[#F5F3FF] hover:text-[#1E1B4B]'}"
        >
          <Icon name="image" size={13} />
          <span>Media ({existingMedia.length})</span>
        </button>
        <button
          type="button"
          onclick={() => (editTab = 'contributors')}
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition {editTab === 'contributors'
            ? 'bg-[#6D4AFF] text-white'
            : 'text-slate-600 hover:bg-[#F5F3FF] hover:text-[#1E1B4B]'}"
        >
          <Icon name="users" size={13} />
          <span>Team ({contributors.length})</span>
        </button>
      </div>
    {/if}
  </div>

  {#if mode === 'create'}
    <!-- 6-Step Project Creation Stepper (Final Step = Preview & Publish) -->
    <nav
      aria-label="Project creation steps"
      class="flex flex-col gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-4 shadow-xs"
    >
      <div class="flex items-center justify-between text-xs">
        <span class="font-extrabold text-[#1E1B4B]">
          Step {createStep} of 6 — {activeCreateStepMeta.title}
        </span>
        <span class="font-bold text-[#6D4AFF]">{Math.round((createStep / 6) * 100)}%</span>
      </div>

      <div class="h-2 w-full overflow-hidden rounded-full bg-[#ECEAF9]">
        <div
          class="h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#A855F7] transition-all duration-300"
          style="width: {Math.round((createStep / 6) * 100)}%;"
        ></div>
      </div>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {#each CREATE_STEPS as st (st.step)}
          {@const isActive = createStep === st.step}
          {@const isCompleted = createStep > st.step}
          <button
            type="button"
            onclick={() => jumpToCreateStep(st.step)}
            class="flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-xs font-bold transition {isActive
              ? 'border-[#6D4AFF] bg-[#6D4AFF] text-white shadow-xs'
              : isCompleted
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                : 'border-[#E8EAF6] bg-[#FAF9FF] text-slate-500 hover:border-[#C4B5FD]'}"
          >
            <Icon name={isCompleted ? 'check-circle' : st.icon} size={13} class="shrink-0" />
            <span class="truncate">{st.shortLabel}</span>
          </button>
        {/each}
      </div>
    </nav>
  {/if}

  {#if isBootstrapping}
    <div class="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-[#E8EAF6] bg-white p-10">
      <Spinner size="lg" />
      <p class="text-sm font-semibold text-slate-600">Loading project workspace...</p>
    </div>
  {:else if loadError}
    <div class="flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <div class="flex items-center gap-2 text-rose-800">
        <Icon name="alert-circle" size={18} />
        <strong class="text-sm font-extrabold">Unable to open project</strong>
      </div>
      <p class="text-xs text-rose-700">{loadError}</p>
      <div class="flex items-center gap-2">
        <Button variant="primary" size="sm" onclick={() => void loadEditorBootstrap()}>
          <span>Retry Loading Options</span>
        </Button>
        <a
          href={dashboardHref}
          class="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-800 no-underline hover:bg-rose-50 hover:no-underline"
        >
          <Icon name="arrow-left" size={14} />
          <span>{$t.forms.backToDashboard}</span>
        </a>
      </div>
    </div>
  {:else if mode === 'create' && createStep === 5}
    <!-- CREATE MODE STEP 5: QUEUE CONTRIBUTORS BEFORE PREVIEW & PUBLISH -->
    <div class="flex flex-col gap-5 rounded-2xl border border-[#E8EAF6] bg-white p-6 shadow-xs">
      <div class="flex items-center gap-2 border-b border-[#F1F2FA] pb-3">
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1EEFF] text-[#6D4AFF]">
          <Icon name="user-plus" size={15} />
        </span>
        <div>
          <h2 class="text-sm font-extrabold text-[#1E1B4B]">5. Add Contributors (Optional)</h2>
          <p class="text-[11px] text-slate-500">
            Queue teammates, co-researchers, or faculty mentors by email — invitations will be dispatched automatically when you publish in Step 6.
          </p>
        </div>
      </div>

      <form class="flex flex-col gap-4" onsubmit={handleQueueContributor}>
        <div class="grid gap-4 sm:grid-cols-2">
          <Input
            id="step5-invite-email"
            type="email"
            label={$t.forms.contributorEmail}
            icon="mail"
            bind:value={inviteEmail}
            placeholder="teammate@institute.ac.in"
            required
          />
          <Input
            id="step5-invite-role-title"
            label={$t.forms.roleTitle}
            bind:value={inviteRoleTitle}
            placeholder="e.g. ML Engineer, CAD Lead, Faculty Mentor"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="step5-team-role" class="text-xs font-bold text-[#1E1B4B]">
              {$t.forms.teamRoleCategory}
            </label>
            <select
              id="step5-team-role"
              bind:value={inviteTeamRole}
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
            >
              {#each TEAM_ROLES as roleOpt (roleOpt.value)}
                <option value={roleOpt.value}>{roleOpt.label}</option>
              {/each}
            </select>
          </div>
          <Input
            id="step5-invite-note"
            label={$t.forms.personalNoteOptional}
            bind:value={inviteMessage}
            placeholder="Excited to collaborate on the prototype..."
          />
        </div>

        {#if inviteError}
          <p class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {inviteError}
          </p>
        {/if}

        <div class="flex justify-end">
          <Button type="submit" variant="outline" size="sm">
            <Icon name="plus" size={14} />
            <span>Add Contributor to Queue</span>
          </Button>
        </div>
      </form>

      {#if queuedInvites.length > 0}
        <div class="flex flex-col gap-2 border-t border-slate-100 pt-4">
          <h3 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Contributors Queued for Invitation ({queuedInvites.length})
          </h3>
          {#each queuedInvites as inv (inv.localId)}
            <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] px-3.5 py-2.5 text-xs">
              <div>
                <strong class="font-bold text-[#1E1B4B]">{inv.email}</strong>
                <span class="ml-2 text-slate-500">{inv.roleTitle}</span>
                <span class="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  {inv.teamRole.replace('_', ' ')}
                </span>
              </div>
              <button
                type="button"
                onclick={() => removeQueuedInvite(inv.localId)}
                class="cursor-pointer font-bold text-rose-600 hover:underline"
              >
                Remove
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" size="sm" onclick={goToPrevCreateStep}>
          <Icon name="arrow-left" size={14} />
          <span>Back to Step 4</span>
        </Button>
        <Button type="button" variant="primary" size="md" onclick={goToNextCreateStep}>
          <span>Next: Step 6 (Preview & Publish)</span>
          <Icon name="arrow-right" size={15} />
        </Button>
      </div>
    </div>
  {:else if mode === 'create' && createStep === 6}
    <!-- CREATE MODE STEP 6 (FINAL STEP): FULL LIVE PREVIEW & PUBLISH -->
    <div class="flex flex-col gap-5">
      <section class="flex flex-col gap-5 rounded-2xl border border-[#DDD6FE] bg-white p-6 shadow-xs">
        <div class="flex flex-wrap items-start justify-between gap-3 border-b border-[#F1F2FA] pb-4">
          <div>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1FF] px-3 py-1 text-[11px] font-extrabold text-[#6D4AFF]">
              <Icon name="eye" size={13} />
              <span>Final Preview — Step 6 of 6</span>
            </span>
            <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-[#1E1B4B]">
              {title || 'Untitled Project'}
            </h2>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={workbenchStatus === 'completed' ? 'moss' : 'saffron'}>
                {workbenchStatus.replace('_', ' ')}
              </Badge>
              <span class="rounded-full bg-[#F3F1FF] px-2.5 py-0.5 text-[11px] font-bold text-[#5B3DF5]">
                {sector}
              </span>
              {#if branch}
                <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  {branch}
                </span>
              {/if}
              <span class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                Visibility: {visibility.replace('_', ' ')}
              </span>
              {#if isDraft}
                <Badge tone="neutral">Draft</Badge>
              {/if}
              {#if isPinned}
                <Badge tone="saffron">Pinned</Badge>
              {/if}
            </div>
          </div>

          <button
            type="button"
            onclick={() => jumpToCreateStep(1)}
            class="cursor-pointer rounded-xl border border-[#E2E5F5] bg-[#FAF9FF] px-3 py-1.5 text-xs font-bold text-[#5B3DF5] hover:bg-[#EDE9FE]"
          >
            Edit Step 1
          </button>
        </div>

        <!-- Cover Image & Gallery Preview -->
        {#if previewCoverMedia}
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Cover Image & Media ({draftMedia.length})
              </h3>
              <button
                type="button"
                onclick={() => jumpToCreateStep(4)}
                class="cursor-pointer text-xs font-bold text-[#6D4AFF] hover:underline"
              >
                Edit Media (Step 4)
              </button>
            </div>
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
              {#if previewCoverMedia.kind === 'video'}
                <video src={previewCoverMedia.url} controls class="max-h-[400px] w-full object-contain">
                  <track kind="captions" />
                </video>
              {:else}
                <img src={previewCoverMedia.url} alt={previewCoverMedia.title} class="max-h-[400px] w-full object-cover" />
              {/if}
            </div>
            {#if draftMedia.length > 1}
              <div class="grid gap-2.5 sm:grid-cols-3">
                {#each draftMedia.filter((m) => m.localId !== previewCoverMedia?.localId) as item (item.localId)}
                  <div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {#if item.kind === 'video'}
                      <video src={item.url} controls class="aspect-video w-full object-cover">
                        <track kind="captions" />
                      </video>
                    {:else}
                      <img src={item.url} alt={item.title} class="aspect-video w-full object-cover" />
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- Identity, Scope & Deliverables Preview -->
        <div class="flex flex-col gap-3 border-t border-[#F1F2FA] pt-4 text-sm text-slate-700">
          <div>
            <span class="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{$t.forms.projectBrief}</span>
            <p class="mt-1 leading-relaxed">{brief}</p>
          </div>
          {#if projectOverview.trim()}
            <div>
              <span class="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{$t.forms.projectOverview}</span>
              <p class="mt-1 leading-relaxed">{projectOverview}</p>
            </div>
          {/if}
          {#if problemStatement.trim()}
            <div>
              <span class="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{$t.forms.problemStatement}</span>
              <p class="mt-1 whitespace-pre-line leading-relaxed">{problemStatement}</p>
            </div>
          {/if}
          {#if description.trim()}
            <div>
              <span class="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{$t.forms.detailedDescription}</span>
              <p class="mt-1 whitespace-pre-line leading-relaxed">{description}</p>
            </div>
          {/if}
          {#if expectedDeliverables.trim()}
            <div>
              <span class="block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{$t.forms.expectedDeliverables}</span>
              <p class="mt-1 whitespace-pre-line leading-relaxed">{expectedDeliverables}</p>
            </div>
          {/if}
        </div>

        <!-- STEM & Metadata Preview -->
        <div class="flex flex-col gap-3 rounded-xl border border-[#ECEAF9] bg-[#FAF9FF] p-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-[#1E1B4B]">STEM Classification, Timeline & Affiliations</span>
            <button
              type="button"
              onclick={() => jumpToCreateStep(2)}
              class="cursor-pointer text-xs font-bold text-[#6D4AFF] hover:underline"
            >
              Edit Step 2
            </button>
          </div>
          <div class="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
            {#if selectedStemCategoryLabel}
              <div>
                <span class="block text-[11px] text-slate-500">{$t.forms.primaryStemCategory}</span>
                <strong class="font-bold text-[#1E1B4B]">{selectedStemCategoryLabel}</strong>
              </div>
            {/if}
            {#if primaryStemDiscipline}
              <div>
                <span class="block text-[11px] text-slate-500">{$t.forms.primaryStemDiscipline}</span>
                <strong class="font-bold text-[#1E1B4B]">{primaryStemDiscipline}</strong>
              </div>
            {/if}
            {#if selectedInstitutionLabel}
              <div>
                <span class="block text-[11px] text-slate-500">{$t.forms.leadInstitution}</span>
                <strong class="font-bold text-[#1E1B4B]">{selectedInstitutionLabel}</strong>
              </div>
            {/if}
            {#if selectedOrganizationLabel}
              <div>
                <span class="block text-[11px] text-slate-500">{$t.forms.leadOrganization}</span>
                <strong class="font-bold text-[#1E1B4B]">{selectedOrganizationLabel}</strong>
              </div>
            {/if}
            {#if startDate || endDate}
              <div>
                <span class="block text-[11px] text-slate-500">Project Timeline</span>
                <strong class="font-bold text-[#1E1B4B]">{startDate || '—'} → {endDate || 'Ongoing'}</strong>
              </div>
            {/if}
            {#if deliverableUrl.trim()}
              <div class="min-w-0">
                <span class="block text-[11px] text-slate-500">{$t.forms.deliverableUrl}</span>
                <strong class="block truncate font-bold text-[#5B3DF5]">{deliverableUrl}</strong>
              </div>
            {/if}
          </div>
        </div>

        <!-- Structured Milestones Preview (with interactive status changer!) -->
        <div class="flex flex-col gap-3 border-t border-[#F1F2FA] pt-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Project Milestones ({milestones.filter((m) => m.title.trim()).length})
            </h3>
            <button
              type="button"
              onclick={() => jumpToCreateStep(3)}
              class="cursor-pointer text-xs font-bold text-[#6D4AFF] hover:underline"
            >
              Edit Milestones (Step 3)
            </button>
          </div>

          {#if milestones.filter((m) => m.title.trim()).length === 0}
            <p class="text-xs text-slate-500">No milestones added yet.</p>
          {:else}
            <div class="flex flex-col gap-2">
              {#each milestones.filter((m) => m.title.trim()) as ms, idx (ms.localId)}
                <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] px-4 py-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EDE9FE] text-[10px] font-extrabold text-[#6D4AFF]">
                        {idx + 1}
                      </span>
                      <strong class="text-xs font-extrabold text-[#1E1B4B]">{ms.title}</strong>
                    </div>
                    {#if ms.description.trim()}
                      <p class="mt-0.5 text-xs text-slate-600">{ms.description}</p>
                    {/if}
                    <div class="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-500">
                      <span>Start: <strong class="text-slate-700">{ms.startDate || '—'}</strong></span>
                      <span>End: <strong class="text-slate-700">{ms.endDate || '—'}</strong></span>
                    </div>
                  </div>
                  <select
                    aria-label={`Milestone status for ${ms.title}`}
                    value={ms.status}
                    onchange={(e) =>
                      void handleMilestoneStatusChange(
                        ms.localId,
                        (e.currentTarget as HTMLSelectElement).value as ProjectMilestoneStatus,
                      )}
                    class="cursor-pointer rounded-xl border border-[#DDD6FE] bg-white px-3 py-1.5 text-xs font-bold text-[#1E1B4B] outline-none focus:border-[#6D4AFF]"
                  >
                    {#each MILESTONE_STATUS_OPTIONS as opt (opt.value)}
                      <option value={opt.value}>{opt.label}</option>
                    {/each}
                  </select>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Queued Contributors Preview -->
        <div class="flex flex-col gap-2 border-t border-[#F1F2FA] pt-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Contributors to Invite on Publish ({queuedInvites.length})
            </h3>
            <button
              type="button"
              onclick={() => jumpToCreateStep(5)}
              class="cursor-pointer text-xs font-bold text-[#6D4AFF] hover:underline"
            >
              Edit Team (Step 5)
            </button>
          </div>
          {#if queuedInvites.length === 0}
            <p class="text-xs text-slate-500">No contributor invitations queued (you can invite teammates anytime after publishing).</p>
          {:else}
            <div class="flex flex-wrap gap-2">
              {#each queuedInvites as inv (inv.localId)}
                <span class="inline-flex items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-[#FAF9FF] px-3 py-1 text-xs font-semibold text-[#1E1B4B]">
                  <Icon name="mail" size={12} class="text-[#6D4AFF]" />
                  <span>{inv.email}</span>
                  <span class="text-slate-500">({inv.roleTitle})</span>
                </span>
              {/each}
            </div>
          {/if}
        </div>
      </section>

      {#if formError}
        <div class="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          <Icon name="alert-circle" size={16} class="shrink-0" />
          <span>{formError}</span>
        </div>
      {/if}

      <!-- FINAL PUBLISH ACTION BAR -->
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DDD6FE] bg-white px-5 py-4 shadow-xs">
        <Button type="button" variant="outline" size="sm" onclick={goToPrevCreateStep}>
          <Icon name="arrow-left" size={14} />
          <span>Back to Step 5</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={!hasSelectedCoverImage}
          onclick={() => void publishCreateProject()}
        >
          <Icon name="rocket" size={16} />
          <span>{isDraft ? 'Save Project Draft' : 'Publish Project Now'}</span>
        </Button>
      </div>
    </div>
  {:else}
    <!-- CREATE STEPS 1-4 OR EDIT MODE -->
    {#if mode === 'create' || editTab === 'details'}
      <form class="flex flex-col gap-5" onsubmit={handleSubmitDetails}>
        <!-- STEP 1: CORE IDENTITY -->
        {#if mode === 'edit' || createStep === 1}
        <section class="flex flex-col gap-4 rounded-2xl border border-[#E8EAF6] bg-white p-5 shadow-xs">
          <div class="flex items-center gap-2 border-b border-[#F1F2FA] pb-3">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1EEFF] text-[#6D4AFF]">
              <Icon name="rocket" size={15} />
            </span>
            <div>
              <h2 class="text-sm font-extrabold text-[#1E1B4B]">1. Core Project Identity</h2>
              <p class="text-[11px] text-slate-500">Title, sector, academic track, and executive summary</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <Input
              id="proj-title"
              label="{$t.forms.projectTitle} *"
              bind:value={title}
              maxlength={150}
              placeholder="e.g. Autonomous Precision Agri-Drone with Edge YOLOv8"
              required
            />

            <div class="flex flex-col gap-1.5">
              <label for="proj-sector" class="text-xs font-bold text-[#1E1B4B]">
                {$t.forms.sector} *
              </label>
              <select
                id="proj-sector"
                value={sectorId}
                onchange={(e) => syncSectorSelection((e.currentTarget as HTMLSelectElement).value)}
                required
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              >
                <option value="">Select sector...</option>
                {#each options?.sectors ?? [] as sec (sec.id)}
                  <option value={sec.id}>{sec.label}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <Input
              id="proj-branch"
              label={$t.forms.branchTrack}
              bind:value={branch}
              maxlength={150}
              placeholder="e.g. Computer Science & Engineering, Robotics, Bioengineering"
            />
            <Input
              id="proj-deliverable-url"
              label={$t.forms.deliverableUrl}
              icon="link"
              bind:value={deliverableUrl}
              maxlength={500}
              placeholder="https://github.com/team/project or demo link"
            />
          </div>

          <Textarea
            id="proj-brief"
            label="{$t.forms.projectBrief} *"
            bind:value={brief}
            rows={2}
            maxlength={500}
            placeholder="One-paragraph pitch explaining what your project builds and why it matters..."
            required
          />

          <Textarea
            id="proj-overview"
            label={$t.forms.projectOverview}
            bind:value={projectOverview}
            rows={2}
            maxlength={500}
            placeholder="Executive overview for evaluators, faculty, and industry scouts..."
          />
        </section>
        {/if}

        <!-- STEP 2: STEM CLASSIFICATION & AFFILIATIONS -->
        {#if mode === 'edit' || createStep === 2}
        <section class="flex flex-col gap-4 rounded-2xl border border-[#E8EAF6] bg-white p-5 shadow-xs">
          <div class="flex items-center gap-2 border-b border-[#F1F2FA] pb-3">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1EEFF] text-[#6D4AFF]">
              <Icon name="layers" size={15} />
            </span>
            <div>
              <h2 class="text-sm font-extrabold text-[#1E1B4B]">2. STEM Classification & Affiliations</h2>
              <p class="text-[11px] text-slate-500">STEM category, discipline, academic levels, project types, and lead institution/organization</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="proj-stem-cat" class="text-xs font-bold text-[#1E1B4B]">
                {$t.forms.primaryStemCategory}
              </label>
              <select
                id="proj-stem-cat"
                value={primaryStemCategoryId}
                onchange={(e) => syncStemCategorySelection((e.currentTarget as HTMLSelectElement).value)}
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              >
                <option value="">Select STEM category...</option>
                {#each options?.stemCategories ?? [] as cat (cat.id)}
                  <option value={cat.id}>{cat.label}</option>
                {/each}
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="proj-stem-disc" class="text-xs font-bold text-[#1E1B4B]">
                {$t.forms.primaryStemDiscipline}
              </label>
              {#if filteredDisciplines.length > 0}
                <select
                  id="proj-stem-disc"
                  value={primaryStemDisciplineId}
                  onchange={(e) => syncStemDisciplineSelection((e.currentTarget as HTMLSelectElement).value)}
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
                >
                  <option value="">Select STEM discipline...</option>
                  {#each filteredDisciplines as disc (disc.id)}
                    <option value={disc.id}>{disc.label}</option>
                  {/each}
                </select>
              {:else}
                <input
                  id="proj-stem-disc"
                  type="text"
                  bind:value={primaryStemDiscipline}
                  maxlength={150}
                  placeholder="e.g. Embedded Systems & Robotics"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
                />
              {/if}
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="proj-institution" class="text-xs font-bold text-[#1E1B4B]">
                {$t.forms.leadInstitution}
              </label>
              <select
                id="proj-institution"
                bind:value={leadInstitutionId}
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              >
                <option value="">None / Independent</option>
                {#each options?.institutions ?? [] as inst (inst.id)}
                  <option value={inst.id}>{inst.label}</option>
                {/each}
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="proj-organization" class="text-xs font-bold text-[#1E1B4B]">
                {$t.forms.leadOrganization}
              </label>
              <select
                id="proj-organization"
                bind:value={leadOrganizationId}
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              >
                <option value="">None / Independent</option>
                {#each options?.organizations ?? [] as org (org.id)}
                  <option value={org.id}>{org.label}</option>
                {/each}
              </select>
            </div>
          </div>

          {#if (options?.projectTypes.length ?? 0) > 0}
            <div class="flex flex-col gap-2">
              <span class="text-xs font-bold text-[#1E1B4B]">{$t.forms.projectTypes}</span>
              <div class="flex flex-wrap gap-2">
                {#each options?.projectTypes ?? [] as pt (pt.id)}
                  {@const active = selectedProjectTypes.includes(pt.code)}
                  <button
                    type="button"
                    onclick={() => (selectedProjectTypes = toggleChip(selectedProjectTypes, pt.code))}
                    class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition {active
                      ? 'border-[#6D4AFF] bg-[#6D4AFF] text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#C4B5FD]'}"
                  >
                    {pt.label}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          {#if (options?.academicLevels.length ?? 0) > 0}
            <div class="flex flex-col gap-2">
              <span class="text-xs font-bold text-[#1E1B4B]">{$t.forms.academicLevels}</span>
              <div class="flex flex-wrap gap-2">
                {#each options?.academicLevels ?? [] as lvl (lvl.id)}
                  {@const active = selectedAcademicLevels.includes(lvl.code)}
                  <button
                    type="button"
                    onclick={() => (selectedAcademicLevels = toggleChip(selectedAcademicLevels, lvl.code))}
                    class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition {active
                      ? 'border-[#6D4AFF] bg-[#6D4AFF] text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#C4B5FD]'}"
                  >
                    {lvl.label}
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          {#if (options?.broadDomains.length ?? 0) > 0}
            <div class="flex flex-col gap-2">
              <span class="text-xs font-bold text-[#1E1B4B]">{$t.forms.broadDomains}</span>
              <div class="flex flex-wrap gap-2">
                {#each options?.broadDomains ?? [] as dom (dom.id)}
                  {@const active = selectedBroadDomains.includes(dom.label)}
                  <button
                    type="button"
                    onclick={() => (selectedBroadDomains = toggleChip(selectedBroadDomains, dom.label))}
                    class="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition {active
                      ? 'border-[#6D4AFF] bg-[#6D4AFF] text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#C4B5FD]'}"
                  >
                    {dom.label}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </section>
        {/if}

        <!-- STEP 3: TECHNICAL SCOPE, DELIVERABLES, TIMELINE, STATUS & VISIBILITY -->
        {#if mode === 'edit' || createStep === 3}
        <section class="flex flex-col gap-4 rounded-2xl border border-[#E8EAF6] bg-white p-5 shadow-xs">
          <div class="flex items-center gap-2 border-b border-[#F1F2FA] pb-3">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1EEFF] text-[#6D4AFF]">
              <Icon name="file-text" size={15} />
            </span>
            <div>
              <h2 class="text-sm font-extrabold text-[#1E1B4B]">3. Technical Scope & Deliverables</h2>
              <p class="text-[11px] text-slate-500">Problem statement, full technical architecture, and expected proof-of-work deliverables</p>
            </div>
          </div>

          <Textarea
            id="proj-problem"
            label={$t.forms.problemStatement}
            bind:value={problemStatement}
            rows={3}
            maxlength={1000}
            placeholder="What concrete real-world or scientific problem does this project address?"
          />

          <Textarea
            id="proj-description"
            label={$t.forms.detailedDescription}
            bind:value={description}
            rows={5}
            maxlength={5000}
            placeholder="Describe system architecture, methodology, hardware/software stack, experiments, and benchmarks..."
          />

          <Textarea
            id="proj-deliverables"
            label={$t.forms.expectedDeliverables}
            bind:value={expectedDeliverables}
            rows={3}
            maxlength={1000}
            placeholder="e.g. Working hardware prototype, benchmark dataset, open-source ROS2 package, IEEE paper draft..."
          />
        </section>

        <!-- STRUCTURED PROJECT MILESTONES (Milestone Title, Start Date, End Date, Status) -->
        <section class="flex flex-col gap-4 rounded-2xl border border-[#E8EAF6] bg-white p-5 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2FA] pb-3">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1EEFF] text-[#6D4AFF]">
                <Icon name="check-circle" size={15} />
              </span>
              <div>
                <h2 class="text-sm font-extrabold text-[#1E1B4B]">Project Milestones</h2>
                <p class="text-[11px] text-slate-500">
                  Add structured milestones with start date, end date, and live status (changeable anytime)
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onclick={addMilestoneRow}>
              <Icon name="plus" size={14} />
              <span>Add Milestone</span>
            </Button>
          </div>

          {#if milestones.length === 0}
            <div class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#C4B5FD] bg-[#FAF9FF] p-6 text-center">
              <p class="text-xs font-semibold text-slate-600">No milestones added yet.</p>
              <Button type="button" variant="outline" size="sm" onclick={addMilestoneRow}>
                <Icon name="plus" size={14} />
                <span>Add First Milestone</span>
              </Button>
            </div>
          {:else}
            <div class="flex flex-col gap-3">
              {#each milestones as ms, idx (ms.localId)}
                <div class="flex flex-col gap-3 rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] p-4">
                  <div class="flex items-center justify-between gap-2">
                    <span class="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1E1B4B]">
                      <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EDE9FE] text-[10px] font-extrabold text-[#6D4AFF]">
                        {idx + 1}
                      </span>
                      <span>Milestone #{idx + 1}</span>
                    </span>
                    <button
                      type="button"
                      onclick={() => removeMilestoneRow(ms.localId)}
                      class="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <Icon name="trash" size={12} />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div class="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
                      <label for={`ms-title-${ms.localId}`} class="text-xs font-bold text-[#1E1B4B]">
                        Milestone *
                      </label>
                      <input
                        id={`ms-title-${ms.localId}`}
                        type="text"
                        bind:value={ms.title}
                        maxlength={150}
                        placeholder="e.g. Hardware Prototype Assembly"
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
                      />
                    </div>

                    <div class="flex flex-col gap-1">
                      <label for={`ms-start-${ms.localId}`} class="text-xs font-bold text-[#1E1B4B]">
                        {$t.forms.startDate}
                      </label>
                      <input
                        id={`ms-start-${ms.localId}`}
                        type="date"
                        bind:value={ms.startDate}
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
                      />
                    </div>

                    <div class="flex flex-col gap-1">
                      <label for={`ms-end-${ms.localId}`} class="text-xs font-bold text-[#1E1B4B]">
                        {$t.forms.endDate}
                      </label>
                      <input
                        id={`ms-end-${ms.localId}`}
                        type="date"
                        bind:value={ms.endDate}
                        min={ms.startDate || undefined}
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
                      />
                    </div>

                    <div class="flex flex-col gap-1">
                      <label for={`ms-status-${ms.localId}`} class="text-xs font-bold text-[#1E1B4B]">
                        {$t.forms.status}
                      </label>
                      <select
                        id={`ms-status-${ms.localId}`}
                        value={ms.status}
                        disabled={Boolean(ms.id && updatingMilestoneId === ms.id)}
                        onchange={(e) =>
                          void handleMilestoneStatusChange(
                            ms.localId,
                            (e.currentTarget as HTMLSelectElement).value as ProjectMilestoneStatus,
                          )}
                        class="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15 disabled:opacity-60"
                      >
                        {#each MILESTONE_STATUS_OPTIONS as opt (opt.value)}
                          <option value={opt.value}>{opt.label}</option>
                        {/each}
                      </select>
                    </div>
                  </div>

                  <input
                    type="text"
                    bind:value={ms.description}
                    maxlength={500}
                    placeholder="Optional notes or key deliverable for this milestone..."
                    class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
                  />
                </div>
              {/each}
            </div>
          {/if}
        </section>

        <!-- SECTION 4: TIMELINE, STATUS, VISIBILITY & TAXONOMY -->
        <section class="flex flex-col gap-4 rounded-2xl border border-[#E8EAF6] bg-white p-5 shadow-xs">
          <div class="flex items-center gap-2 border-b border-[#F1F2FA] pb-3">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1EEFF] text-[#6D4AFF]">
              <Icon name="calendar" size={15} />
            </span>
            <div>
              <h2 class="text-sm font-extrabold text-[#1E1B4B]">4. Timeline, Status, Visibility & Tags</h2>
              <p class="text-[11px] text-slate-500">Schedule dates, workbench stage, discovery keywords, skills, and publishing options</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div class="flex flex-col gap-1.5">
              <label for="proj-start-date" class="text-xs font-bold text-[#1E1B4B]">{$t.forms.startDate}</label>
              <input
                id="proj-start-date"
                type="date"
                bind:value={startDate}
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="proj-end-date" class="text-xs font-bold text-[#1E1B4B]">{$t.forms.endDate}</label>
              <input
                id="proj-end-date"
                type="date"
                bind:value={endDate}
                min={startDate || undefined}
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="proj-completion-date" class="text-xs font-bold text-[#1E1B4B]">
                {$t.forms.actualCompletionDate}
              </label>
              <input
                id="proj-completion-date"
                type="date"
                bind:value={actualCompletionDate}
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="proj-workbench-status" class="text-xs font-bold text-[#1E1B4B]">
                {$t.forms.workbenchStatus}
              </label>
              <select
                id="proj-workbench-status"
                bind:value={workbenchStatus}
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              >
                <option value="idea">Idea / Concept</option>
                <option value="ongoing">Ongoing / Active Build</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed / Delivered</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="proj-visibility" class="text-xs font-bold text-[#1E1B4B]">
                {$t.forms.projectVisibility}
              </label>
              <select
                id="proj-visibility"
                bind:value={visibility}
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              >
                <option value="public">Public (Visible across Collab47)</option>
                <option value="connections_only">Connections Only</option>
                <option value="private_link">Private Link Only</option>
              </select>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <Input
              id="proj-tags"
              label={$t.forms.projectTags}
              bind:value={tagsInput}
              placeholder="e.g. robotics, ros2, iot, cleantech"
            />
            <Input
              id="proj-keywords"
              label={$t.forms.keywords}
              bind:value={keywordsInput}
              placeholder="e.g. precision-agriculture, edge-inference, telemetry"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Input
              id="proj-skills"
              label={$t.forms.skillsRequired}
              bind:value={skillsInput}
              placeholder="e.g. Python, PyTorch, ROS2, PCB Design, STM32"
            />
            {#if (options?.skills.length ?? 0) > 0}
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[11px] font-semibold text-slate-500">Quick add skills:</span>
                {#each (options?.skills ?? []).slice(0, 14) as sk (sk.id)}
                  <button
                    type="button"
                    onclick={() => appendSkillSuggestion(sk.label)}
                    class="cursor-pointer rounded-full border border-[#E2E5F5] bg-[#FAF9FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#5B3DF5] transition hover:bg-[#EDE9FE]"
                  >
                    + {sk.label}
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div class="flex flex-col gap-2.5 rounded-xl border border-[#ECEAF9] bg-[#FAF9FF] p-3.5">
            <label class="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-[#1E1B4B]">
              <input type="checkbox" bind:checked={isDraft} class="h-4 w-4 rounded border-slate-300 accent-[#6D4AFF]" />
              <span>{$t.forms.saveAsDraft}</span>
            </label>
            <label class="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-[#1E1B4B]">
              <input type="checkbox" bind:checked={isPinned} class="h-4 w-4 rounded border-slate-300 accent-[#6D4AFF]" />
              <span>{$t.forms.pinProject}</span>
            </label>
            <label class="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-[#1E1B4B]">
              <input
                type="checkbox"
                bind:checked={confidentialityWarningAcknowledged}
                class="h-4 w-4 rounded border-slate-300 accent-[#6D4AFF]"
              />
              <span>{$t.forms.confidentialityAck}</span>
            </label>
          </div>
        </section>
        {/if}

        <!-- STEP 4 (CREATE MODE): MANDATORY COVER IMAGE & MULTI-IMAGE GALLERY -->
        {#if mode === 'create' && createStep === 4}
          <section class="flex flex-col gap-4 rounded-2xl border border-[#E8EAF6] bg-white p-5 shadow-xs">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2FA] pb-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1EEFF] text-[#6D4AFF]">
                  <Icon name="image" size={15} />
                </span>
                <div>
                  <h2 class="text-sm font-extrabold text-[#1E1B4B]">
                    4. Project Cover Image & Media Gallery *
                  </h2>
                  <p class="text-[11px] text-slate-500">
                    Upload one or more photos/videos and mark 1 image as your Cover Image (required to publish)
                  </p>
                </div>
              </div>

              <input
                bind:this={mediaFileInput}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov"
                class="hidden"
                onchange={handleMediaFilesSelected}
              />
              <Button variant="outline" size="sm" loading={isUploadingMedia} onclick={() => mediaFileInput?.click()}>
                <Icon name="upload" size={14} />
                <span>{isUploadingMedia ? 'Uploading...' : $t.forms.uploadMedia}</span>
              </Button>
            </div>

            <p class="text-[11px] font-medium text-slate-500">{$t.ui.supportedMediaFormats}</p>

            {#if mediaUploadError}
              <p class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {mediaUploadError}
              </p>
            {/if}

            {#if draftMedia.length === 0}
              <div class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#C4B5FD] bg-[#FAF9FF] p-8 text-center">
                <Icon name="image" size={26} class="text-[#6D4AFF]" />
                <p class="text-xs font-bold text-[#1E1B4B]">No images uploaded yet</p>
                <p class="max-w-md text-[11px] text-slate-500">
                  Projects require at least one image marked as the Cover Image before publishing. You can upload multiple photos and videos.
                </p>
                <Button variant="outline" size="sm" onclick={() => mediaFileInput?.click()}>
                  <Icon name="upload" size={14} />
                  <span>{$t.forms.uploadMedia}</span>
                </Button>
              </div>
            {:else}
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {#each draftMedia as item (item.localId)}
                  <div
                    class="flex flex-col overflow-hidden rounded-xl border {item.isCover
                      ? 'border-[#6D4AFF] ring-2 ring-[#6D4AFF]/20'
                      : 'border-slate-200'} bg-white"
                  >
                    <div class="relative aspect-video bg-slate-100">
                      {#if item.kind === 'video'}
                        <video src={item.url} controls class="h-full w-full object-cover">
                          <track kind="captions" />
                        </video>
                      {:else}
                        <img src={item.url} alt={item.title} class="h-full w-full object-cover" />
                      {/if}
                      {#if item.isCover}
                        <span class="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#6D4AFF] px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                          <Icon name="star" size={10} />
                          <span>Cover Image</span>
                        </span>
                      {/if}
                    </div>
                    <div class="flex items-center justify-between gap-2 p-2.5 text-[11px]">
                      <span class="truncate font-semibold text-slate-700">{item.title}</span>
                      <div class="flex shrink-0 items-center gap-1.5">
                        {#if item.kind === 'image' && !item.isCover}
                          <button
                            type="button"
                            onclick={() => markDraftCover(item.localId)}
                            class="cursor-pointer rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-1 text-[10px] font-bold text-[#6D4AFF] hover:bg-[#EDE9FE]"
                          >
                            Mark as Cover
                          </button>
                        {/if}
                        <button
                          type="button"
                          onclick={() => removeDraftMedia(item.localId)}
                          aria-label="Remove media"
                          class="cursor-pointer rounded-lg p-1 text-rose-500 hover:bg-rose-50"
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </section>
        {/if}

        {#if formError}
          <div class="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            <Icon name="alert-circle" size={16} class="shrink-0" />
            <span>{formError}</span>
          </div>
        {/if}

        <!-- ACTION BAR -->
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8EAF6] bg-white px-5 py-4 shadow-xs">
          {#if mode === 'create' && createStep > 1}
            <Button type="button" variant="outline" size="sm" onclick={goToPrevCreateStep}>
              <Icon name="arrow-left" size={14} />
              <span>Back to Step {createStep - 1}</span>
            </Button>
          {:else}
            <a
              href={dashboardHref}
              class="text-xs font-bold text-slate-500 no-underline hover:text-[#1E1B4B] hover:no-underline"
            >
              {$t.ui.cancel}
            </a>
          {/if}

          <div class="flex flex-wrap items-center gap-2.5">
            {#if mode === 'create' && createStep < 4}
              <Button type="button" variant="primary" size="md" onclick={goToNextCreateStep}>
                <span>
                  Next: Step {createStep + 1} ({CREATE_STEPS[createStep]?.title ?? ''})
                </span>
                <Icon name="arrow-right" size={15} />
              </Button>
            {:else if mode === 'create' && createStep === 4}
              {#if !hasSelectedCoverImage}
                <span class="text-[11px] font-semibold text-amber-700">
                  Upload & mark a Cover Image to continue
                </span>
              {/if}
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={!hasSelectedCoverImage}
                onclick={goToNextCreateStep}
              >
                <span>Next: Step 5 (Add Contributors)</span>
                <Icon name="arrow-right" size={15} />
              </Button>
            {:else}
              <Button type="submit" variant="primary" size="md" loading={isSubmitting}>
                <Icon name="save" size={15} />
                <span>{$t.forms.saveChanges}</span>
              </Button>
            {/if}
          </div>
        </div>
      </form>
    {:else if mode === 'edit' && editTab === 'media'}
      <!-- EDIT MODE TAB 2: LIVE MEDIA GALLERY & COVER IMAGE -->
      <section class="flex flex-col gap-4 rounded-2xl border border-[#E8EAF6] bg-white p-6 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2FA] pb-3">
          <div>
            <h2 class="text-base font-extrabold text-[#1E1B4B]">Project Cover Image & Media Gallery</h2>
            <p class="text-xs text-slate-500">
              Add multiple images/videos or switch which image is your Cover Image. {$t.ui.supportedMediaFormats}
            </p>
          </div>
          <input
            bind:this={mediaFileInput}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov"
            class="hidden"
            onchange={handleMediaFilesSelected}
          />
          <Button variant="primary" size="sm" loading={isUploadingMedia} onclick={() => mediaFileInput?.click()}>
            <Icon name="upload" size={14} />
            <span>{isUploadingMedia ? 'Uploading...' : $t.forms.uploadMedia}</span>
          </Button>
        </div>

        {#if mediaUploadError}
          <p class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {mediaUploadError}
          </p>
        {/if}

        {#if existingMedia.length === 0}
          <div class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#C4B5FD] bg-[#FAF9FF] p-8 text-center">
            <Icon name="image" size={26} class="text-[#6D4AFF]" />
            <p class="text-xs font-bold text-[#1E1B4B]">No project media uploaded yet</p>
            <Button variant="outline" size="sm" onclick={() => mediaFileInput?.click()}>
              <Icon name="upload" size={14} />
              <span>{$t.forms.uploadMedia}</span>
            </Button>
          </div>
        {:else}
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each existingMedia as item (item.id)}
              <div
                class="flex flex-col overflow-hidden rounded-xl border {item.isCover
                  ? 'border-[#6D4AFF] ring-2 ring-[#6D4AFF]/20'
                  : 'border-slate-200'} bg-white"
              >
                <div class="relative aspect-video bg-slate-100">
                  {#if item.kind === 'video'}
                    <video src={item.url} controls class="h-full w-full object-cover">
                      <track kind="captions" />
                    </video>
                  {:else}
                    <img src={item.url} alt={item.title} class="h-full w-full object-cover" />
                  {/if}
                  {#if item.isCover}
                    <span class="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#6D4AFF] px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                      <Icon name="star" size={10} />
                      <span>Cover Image</span>
                    </span>
                  {/if}
                </div>
                <div class="flex items-center justify-between gap-2 p-2.5 text-[11px]">
                  <span class="truncate font-semibold text-slate-700">{item.title}</span>
                  <div class="flex shrink-0 items-center gap-1.5">
                    {#if item.kind === 'image' && !item.isCover}
                      <button
                        type="button"
                        disabled={coverBusyId === item.id}
                        onclick={() => markExistingCover(item.id)}
                        class="cursor-pointer rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-1 text-[10px] font-bold text-[#6D4AFF] hover:bg-[#EDE9FE] disabled:opacity-50"
                      >
                        Mark as Cover
                      </button>
                    {/if}
                    <button
                      type="button"
                      disabled={coverBusyId === item.id}
                      onclick={() => removeExistingMedia(item.id)}
                      aria-label="Remove media"
                      class="cursor-pointer rounded-lg p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {:else if mode === 'edit' && editTab === 'contributors'}
      <!-- EDIT MODE TAB 3: CONTRIBUTORS & INVITATIONS -->
      <section class="flex flex-col gap-5 rounded-2xl border border-[#E8EAF6] bg-white p-6 shadow-xs">
        <div class="border-b border-[#F1F2FA] pb-3">
          <h2 class="text-base font-extrabold text-[#1E1B4B]">Project Contributors & Team Invitations</h2>
          <p class="text-xs text-slate-500">Manage accepted teammates and send email invitations for new contributors.</p>
        </div>

        <!-- Accepted Contributors -->
        <div class="flex flex-col gap-2">
          <h3 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Active Contributors ({contributors.length})
          </h3>
          <div class="grid gap-2.5 sm:grid-cols-2">
            {#each contributors as member (member.id)}
              <div class="flex items-center gap-3 rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] p-3">
                <Avatar name={member.name} src={member.avatarUrl} size="sm" />
                <div class="min-w-0 flex-1">
                  <strong class="block truncate text-xs font-bold text-[#1E1B4B]">{member.name}</strong>
                  <span class="block truncate text-[11px] text-slate-500">@{member.handle} · {member.roleTitle}</span>
                </div>
                <span class="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-bold uppercase text-[#6D4AFF]">
                  {member.role}
                </span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Invite New Contributor Form -->
        <form class="flex flex-col gap-4 border-t border-slate-100 pt-4" onsubmit={handleInviteContributor}>
          <h3 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            Invite a Contributor by Email
          </h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <Input
              id="edit-invite-email"
              type="email"
              label={$t.forms.contributorEmail}
              icon="mail"
              bind:value={inviteEmail}
              placeholder="teammate@institute.ac.in"
              required
            />
            <Input
              id="edit-invite-role-title"
              label={$t.forms.roleTitle}
              bind:value={inviteRoleTitle}
              placeholder="e.g. Hardware Engineer, Faculty Mentor"
            />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="edit-team-role" class="text-xs font-bold text-[#1E1B4B]">
                {$t.forms.teamRoleCategory}
              </label>
              <select
                id="edit-team-role"
                bind:value={inviteTeamRole}
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
              >
                {#each TEAM_ROLES as roleOpt (roleOpt.value)}
                  <option value={roleOpt.value}>{roleOpt.label}</option>
                {/each}
              </select>
            </div>
            <Input
              id="edit-invite-note"
              label={$t.forms.personalNoteOptional}
              bind:value={inviteMessage}
              placeholder="Join our build on Collab47..."
            />
          </div>

          {#if inviteError}
            <p class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {inviteError}
            </p>
          {/if}

          <div class="flex justify-end">
            <Button type="submit" variant="primary" size="sm" loading={isSendingInvite}>
              <Icon name="user-plus" size={14} />
              <span>Send Invitation</span>
            </Button>
          </div>
        </form>

        {#if invitations.length > 0}
          <div class="flex flex-col gap-2 border-t border-slate-100 pt-4">
            <h3 class="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Invitations ({invitations.length})
            </h3>
            {#each invitations as inv (inv.id)}
              <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs">
                <div>
                  <strong class="font-bold text-[#1E1B4B]">{inv.inviteeEmail ?? 'Invited User'}</strong>
                  <span class="ml-2 text-slate-500">{inv.roleTitle}</span>
                  <span class="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                    {inv.status}
                  </span>
                </div>
                {#if inv.inviteUrl}
                  <button
                    type="button"
                    onclick={() => copyInviteLink(inv.inviteUrl)}
                    class="cursor-pointer font-bold text-[#6D4AFF] hover:underline"
                  >
                    Copy Invite Link
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  {/if}
</div>
