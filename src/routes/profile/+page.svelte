<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ApiError, ensureFreshSession } from '$lib/api/client';
  import { profileApi } from '$lib/api/profile.api';
  import { uploadsApi } from '$lib/api/uploads.api';
  import type {
    AccountType,
    DobPrivacy,
    EmploymentType,
    ExperienceType,
    FullProfile,
    OccupationCode,
    ProfileVisibility,
    QualificationLevel,
    SkillCategory,
    SkillProficiency,
    SocialPlatformCode,
    StemDisciplineCategory,
    YearOfStudy,
  } from '$lib/api/types';
  import {
    authState,
    isAuthenticated,
    loadMyProfile,
    loadProfileOptions,
    profileState,
    pushToast,
    setProfile,
    t,
    updateAuthUser,
  } from '$lib/stores';
  import {
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    Checkbox,
    ChipGroup,
    Footer,
    Icon,
    Input,
    ProgressBar,
    Select,
    Spinner,
    Tabs,
    Textarea,
    type IconName,
  } from '$ui';

  let activeTab = $state('basic');
  let savingSection = $state<string | null>(null);
  let sectionError = $state<string | null>(null);

  // Section 1: Basic Info state
  let name = $state('');
  let handle = $state('');
  let headline = $state('');
  let accountType = $state<AccountType>('student');
  let occupations = $state<string[]>([]);
  let occupationOther = $state('');
  let college = $state('');
  let branch = $state('');
  let yearOfStudy = $state('');
  let studentId = $state('');
  let city = $state('');
  let dateOfBirth = $state('');
  let dobPrivacy = $state<DobPrivacy>('private');
  let visibility = $state<ProfileVisibility>('public');
  let openToCollaborations = $state(true);
  let avatarUrl = $state('');
  let coverImageUrl = $state('');
  let uploadingAvatar = $state(false);
  let uploadingCover = $state(false);
  let avatarFileEl = $state<HTMLInputElement | null>(null);
  let coverFileEl = $state<HTMLInputElement | null>(null);

  async function handleProfileImageUpload(
    event: Event,
    target: 'avatar' | 'cover',
  ): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    sectionError = null;
    if (target === 'avatar') uploadingAvatar = true;
    else uploadingCover = true;

    try {
      const items = await uploadsApi.uploadFiles([file], target === 'avatar' ? 'avatars' : 'covers');
      const uploaded = items[0];
      if (uploaded) {
        if (target === 'avatar') {
          avatarUrl = uploaded.url;
        } else {
          coverImageUrl = uploaded.url;
        }
        pushToast({
          tone: 'success',
          title: target === 'avatar' ? 'Avatar uploaded' : 'Cover image uploaded',
          message: 'Uploaded successfully. Click Save Changes to persist on your profile.',
        });
      }
    } catch (err) {
      sectionError =
        err instanceof ApiError ? err.message : 'Unable to upload image. Please try again.';
    } finally {
      if (target === 'avatar') uploadingAvatar = false;
      else uploadingCover = false;
    }
  }

  // Section 2: Add Education form
  let eduQualificationLevel = $state<QualificationLevel>('undergraduate');
  let eduInstitution = $state('');
  let eduDegree = $state('');
  let eduFieldOfStudy = $state('');
  let eduDisciplineCategory = $state('');
  let eduStartYear = $state('');
  let eduEndYear = $state('');
  let eduCurrentlyStudying = $state(false);
  let eduGrade = $state('');

  // Section 3: Add Experience form
  let expType = $state<ExperienceType>('internship');
  let expEmploymentType = $state('');
  let expTitle = $state('');
  let expOrganization = $state('');
  let expLocation = $state('');
  let expStartYear = $state('');
  let expEndYear = $state('');
  let expCurrentlyWorking = $state(false);
  let expDescription = $state('');
  let expSkillsCsv = $state('');
  let expUrl = $state('');

  // Section 4: Expertise & Skills
  let selectedDomainIds = $state<string[]>([]);
  let areasOfInterestCsv = $state('');
  let interestsCsv = $state('');
  let newSkillCategory = $state<SkillCategory>('digital_analytical');
  let newSkillName = $state('');
  let newSkillProficiency = $state<SkillProficiency>('intermediate');

  // Section 5: About & Social Links
  let bio = $state('');
  let professionalSummary = $state('');
  let socialPlatform = $state<SocialPlatformCode>('github');
  let socialLabel = $state('GitHub');
  let socialUrl = $state('');

  const fallbackAccountTypeOptions = [
    { value: 'student', label: 'Student' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'industry', label: 'Industry & Startup' },
    { value: 'institution', label: 'Institution' },
    { value: 'mentor', label: 'Mentor' },
  ];

  const accountTypeOptions = $derived(
    $profileState.options?.roles && $profileState.options.roles.length > 0
      ? $profileState.options.roles
          .filter((r) => r.roleCategory === 'external')
          .map((r) => ({ value: r.roleCode, label: r.roleName }))
      : fallbackAccountTypeOptions,
  );

  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: '5', label: '5th Year' },
    { value: 'graduated', label: 'Graduated' },
  ];

  const dobPrivacyOptions = [
    { value: 'private', label: 'Private (only me)' },
    { value: 'connections_only', label: 'Connections Only' },
    { value: 'public', label: 'Public' },
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public Portfolio' },
    { value: 'campus_only', label: 'Campus Only' },
    { value: 'connections_only', label: 'Connections Only' },
    { value: 'private_link', label: 'Private Link' },
    { value: 'private', label: 'Private' },
  ];

  const proficiencyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  const occupationOptions = $derived(
    ($profileState.options?.occupations ?? []).map((o) => ({ value: o.code, label: o.label })),
  );
  const qualificationOptions = $derived(
    ($profileState.options?.qualificationLevels ?? []).map((q) => ({
      value: q.code,
      label: q.label,
    })),
  );
  const stemCategoryOptions = $derived(
    ($profileState.options?.stemCategories ?? []).map((c) => ({ value: c.code, label: c.label })),
  );
  const experienceTypeOptions = $derived(
    ($profileState.options?.experienceTypes ?? []).map((e) => ({ value: e.code, label: e.label })),
  );
  const employmentTypeOptions = $derived(
    ($profileState.options?.employmentTypes ?? []).map((e) => ({ value: e.code, label: e.label })),
  );
  const domainOptions = $derived(
    ($profileState.options?.broadDomains ?? []).map((d) => ({ value: d.id, label: d.label })),
  );
  const skillCategoryOptions = $derived(
    ($profileState.options?.skillCategories ?? []).map((c) => ({ value: c.code, label: c.label })),
  );
  const socialPlatformOptions = $derived(
    ($profileState.options?.socialPlatforms ?? []).map((p) => ({ value: p.code, label: p.label })),
  );

  const tabs = $derived<Array<{ id: string; label: string; icon: IconName; count?: number }>>([
    { id: 'basic', label: $t.profile.tabBasic, icon: 'user' },
    {
      id: 'education',
      label: $t.profile.tabEducation,
      icon: 'graduation-cap',
      count: $profileState.profile?.education.length ?? 0,
    },
    {
      id: 'experience',
      label: $t.profile.tabExperience,
      icon: 'briefcase',
      count: $profileState.profile?.experiences.length ?? 0,
    },
    {
      id: 'expertise',
      label: $t.profile.tabExpertise,
      icon: 'sparkles',
      count: $profileState.profile?.skills.length ?? 0,
    },
    { id: 'about', label: $t.profile.tabAbout, icon: 'file-text' },
  ]);

  function hydrateFormsFromProfile(p: FullProfile): void {
    name = p.name;
    handle = p.handle;
    headline = p.headline ?? '';
    accountType = p.accountType;
    occupations = [...p.occupations];
    occupationOther = p.occupationOther ?? '';
    college = p.college ?? '';
    branch = p.branch ?? '';
    yearOfStudy = p.yearOfStudy ?? '';
    studentId = p.studentId ?? '';
    city = p.city ?? '';
    dateOfBirth = p.dateOfBirth ?? '';
    dobPrivacy = p.dobPrivacy;
    visibility = p.visibility;
    openToCollaborations = p.openToCollaborations;
    avatarUrl = p.avatarUrl ?? '';
    coverImageUrl = p.coverImageUrl ?? '';

    selectedDomainIds = p.expertise.broadDomains.map((d) => d.broadDomainId);
    areasOfInterestCsv = p.expertise.areasOfInterest.map((a) => a.label).join(', ');
    interestsCsv = p.expertise.interests.join(', ');

    bio = p.bio ?? '';
    professionalSummary = p.professionalSummary ?? '';
  }

  const VALID_PROFILE_TABS = new Set(['basic', 'education', 'experience', 'expertise', 'about']);

  $effect(() => {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam && VALID_PROFILE_TABS.has(tabParam)) {
      activeTab = tabParam;
    }
  });

  onMount(async () => {
    const hasSession = await ensureFreshSession();
    if (!hasSession) {
      await goto('/login?next=/profile');
      return;
    }

    const [profile] = await Promise.all([loadMyProfile(), loadProfileOptions()]);
    if (profile) {
      hydrateFormsFromProfile(profile);
    }
  });

  async function saveBasicInfo(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    sectionError = null;
    savingSection = 'basic';
    try {
      const updated = await profileApi.updateBasicInfo({
        name: name.trim(),
        handle: handle.trim().toLowerCase(),
        headline: headline.trim() || null,
        accountType,
        occupations: occupations as OccupationCode[],
        occupationOther: occupations.includes('other') ? occupationOther.trim() : null,
        college: college.trim() || null,
        branch: branch.trim() || null,
        yearOfStudy: (yearOfStudy || null) as YearOfStudy | null,
        studentId: studentId.trim() || null,
        city: city.trim() || null,
        dateOfBirth: dateOfBirth || null,
        dobPrivacy,
        visibility,
        openToCollaborations,
        avatarUrl: avatarUrl.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
      });
      setProfile(updated);
      updateAuthUser({
        name: updated.name,
        handle: updated.handle,
        accountType: updated.accountType,
        primaryRole: updated.primaryRole,
        roles: updated.roles,
        avatarUrl: updated.avatarUrl,
        college: updated.college,
        city: updated.city,
      });
      hydrateFormsFromProfile(updated);
      pushToast({ tone: 'success', title: 'Basic info saved' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to update basic information.';
    } finally {
      savingSection = null;
    }
  }

  async function addEducation(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    sectionError = null;
    savingSection = 'education';
    try {
      await profileApi.createEducation({
        qualificationLevel: eduQualificationLevel,
        institution: eduInstitution.trim(),
        degree: eduDegree.trim(),
        fieldOfStudy: eduFieldOfStudy.trim(),
        disciplineCategory: (eduDisciplineCategory || undefined) as
          | StemDisciplineCategory
          | undefined,
        startYear: eduStartYear ? Number(eduStartYear) : undefined,
        endYear: !eduCurrentlyStudying && eduEndYear ? Number(eduEndYear) : undefined,
        currentlyStudying: eduCurrentlyStudying,
        grade: eduGrade.trim() || undefined,
      });
      eduInstitution = '';
      eduDegree = '';
      eduFieldOfStudy = '';
      eduStartYear = '';
      eduEndYear = '';
      eduGrade = '';
      eduCurrentlyStudying = false;
      const refreshed = await loadMyProfile();
      if (refreshed) hydrateFormsFromProfile(refreshed);
      pushToast({ tone: 'success', title: 'Education added' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to add education record.';
    } finally {
      savingSection = null;
    }
  }

  async function removeEducation(id: string): Promise<void> {
    try {
      await profileApi.deleteEducation(id);
      await loadMyProfile();
      pushToast({ tone: 'info', title: 'Education removed' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to delete education record.';
    }
  }

  async function addExperience(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    sectionError = null;
    savingSection = 'experience';
    try {
      const skills = expSkillsCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await profileApi.createExperience({
        type: expType,
        employmentType: (expEmploymentType || undefined) as EmploymentType | undefined,
        title: expTitle.trim(),
        organization: expOrganization.trim(),
        location: expLocation.trim() || undefined,
        startYear: expStartYear ? Number(expStartYear) : undefined,
        endYear: !expCurrentlyWorking && expEndYear ? Number(expEndYear) : undefined,
        currentlyWorkingHere: expCurrentlyWorking,
        description: expDescription.trim() || undefined,
        skills: skills.length > 0 ? skills : undefined,
        url: expUrl.trim() || undefined,
      });
      expTitle = '';
      expOrganization = '';
      expLocation = '';
      expStartYear = '';
      expEndYear = '';
      expDescription = '';
      expSkillsCsv = '';
      expUrl = '';
      expCurrentlyWorking = false;
      await loadMyProfile();
      pushToast({ tone: 'success', title: 'Experience added' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to add experience record.';
    } finally {
      savingSection = null;
    }
  }

  async function removeExperience(id: string): Promise<void> {
    try {
      await profileApi.deleteExperience(id);
      await loadMyProfile();
      pushToast({ tone: 'info', title: 'Experience removed' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to delete experience record.';
    }
  }

  async function saveExpertise(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    sectionError = null;
    savingSection = 'expertise';
    try {
      const areasOfInterest = areasOfInterestCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const interests = interestsCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await profileApi.updateExpertise({
        broadDomainIds: selectedDomainIds,
        areasOfInterest,
        interests,
      });
      await loadMyProfile();
      pushToast({ tone: 'success', title: 'Expertise & domains updated' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to update expertise.';
    } finally {
      savingSection = null;
    }
  }

  async function addSkill(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!newSkillName.trim()) return;
    sectionError = null;
    savingSection = 'skill';
    try {
      await profileApi.createSkill({
        category: newSkillCategory,
        skillName: newSkillName.trim(),
        proficiencyLevel: newSkillProficiency,
      });
      newSkillName = '';
      await loadMyProfile();
      pushToast({ tone: 'success', title: 'Skill added' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to add skill.';
    } finally {
      savingSection = null;
    }
  }

  async function removeSkill(id: string): Promise<void> {
    try {
      await profileApi.deleteSkill(id);
      await loadMyProfile();
      pushToast({ tone: 'info', title: 'Skill removed' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to remove skill.';
    }
  }

  async function saveAbout(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    sectionError = null;
    savingSection = 'about';
    try {
      const updated = await profileApi.updateAbout({
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        professionalSummary: professionalSummary.trim() || null,
      });
      setProfile(updated);
      pushToast({ tone: 'success', title: 'About section saved' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to update about section.';
    } finally {
      savingSection = null;
    }
  }

  async function addOrUpdateSocialLink(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!socialUrl.trim()) return;
    sectionError = null;
    savingSection = 'social';
    try {
      const existing = ($profileState.profile?.socialLinks ?? []).filter(
        (item) => item.platform !== socialPlatform,
      );
      await profileApi.upsertSocialLinks({
        links: [
          ...existing.map((item) => ({
            platform: item.platform,
            label: item.label,
            url: item.url,
          })),
          {
            platform: socialPlatform,
            label: socialLabel.trim() || socialPlatform,
            url: socialUrl.trim(),
          },
        ],
      });
      socialUrl = '';
      await loadMyProfile();
      pushToast({ tone: 'success', title: 'Social link saved' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to save social link.';
    } finally {
      savingSection = null;
    }
  }

  async function removeSocialLink(id: string): Promise<void> {
    try {
      await profileApi.deleteSocialLink(id);
      await loadMyProfile();
      pushToast({ tone: 'info', title: 'Social link removed' });
    } catch (err) {
      sectionError = err instanceof ApiError ? err.message : 'Failed to delete social link.';
    }
  }
</script>

<svelte:head>
  <title>My Profile · Collab47</title>
</svelte:head>

<main class="c47-container profile-page">
  {#if !$authState.isHydrated || ($profileState.isLoading && !$profileState.profile)}
    <div class="profile-page__loading">
      <Spinner label="Loading your profile..." size="lg" />
    </div>
  {:else if $isAuthenticated && $profileState.profile}
    {@const profile = $profileState.profile}

    <div class="profile-stack">
      <!-- Profile Summary Header -->
      <Card surface="paper" padding="lg" elevated>
        <div class="profile-hero">
          <div class="profile-hero__left">
            <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />
            <div>
              <div class="profile-hero__title-row">
                <h1>{profile.name}</h1>
                <Badge tone="saffron">{profile.accountType}</Badge>
                {#if profile.openToCollaborations}
                  <Badge tone="moss">Open to Collaborations</Badge>
                {/if}
              </div>
              <p class="muted">@{profile.handle} · {profile.email}</p>
              {#if profile.headline}
                <p class="headline">{profile.headline}</p>
              {/if}
            </div>
          </div>

          <div class="profile-hero__right">
            <Button variant="outline" size="sm" href="/u/{profile.handle}">
              <Icon name="external-link" size={15} />
              <span>{$t.profile.viewPublicPortfolio}</span>
            </Button>
            <Button variant="ghost" size="sm" href="/onboarding">
              <Icon name="compass" size={15} />
              <span>{$t.footer.onboardingWizard}</span>
            </Button>
          </div>
        </div>

        <div class="profile-hero__progress">
          <ProgressBar value={profile.completenessPercent} label={$t.forms.profileCompleteness} />
        </div>
      </Card>

      {#if sectionError}
        <Alert
          tone="error"
          title="Update error"
          dismissible
          ondismiss={() => (sectionError = null)}
        >
          {sectionError}
        </Alert>
      {/if}

      <Tabs {tabs} bind:activeTab onchange={() => (sectionError = null)} />

      <!-- TAB 1: BASIC INFORMATION -->
      {#if activeTab === 'basic'}
        <Card title={$t.profile.tabBasic} subtitle={$t.ui.basicSubtitle}>
          <form class="form-stack" onsubmit={saveBasicInfo}>
            <div class="two-col">
              <Input id="p-name" label={$t.forms.fullName} bind:value={name} required maxlength={100} />
              <Input id="p-handle" label={$t.forms.handle} prefix="@" bind:value={handle} required maxlength={50} />
            </div>

            <Input
              id="p-headline"
              label={$t.forms.headline}
              bind:value={headline}
              placeholder="BTech CSE @ IIT Bombay | Autonomous Systems"
              maxlength={120}
            />

            <div class="two-col">
              <Select
                id="p-account-type"
                label={$t.forms.accountPersona}
                options={accountTypeOptions}
                bind:value={accountType}
              />
              <Select
                id="p-visibility"
                label={$t.forms.profileVisibility}
                options={visibilityOptions}
                bind:value={visibility}
              />
            </div>

            {#if occupationOptions.length > 0}
              <ChipGroup
                label={$t.forms.occupations}
                options={occupationOptions}
                bind:selected={occupations}
                max={10}
              />
            {/if}

            {#if occupations.includes('other')}
              <Input
                id="p-occ-other"
                label={$t.forms.specifyOccupation}
                bind:value={occupationOther}
                required
                maxlength={150}
              />
            {/if}

            <div class="two-col">
              <Input id="p-college" label={$t.forms.collegeUniversity} bind:value={college} maxlength={200} />
              <Input id="p-branch" label={$t.forms.branchDepartment} bind:value={branch} maxlength={150} />
            </div>

            <div class="three-col">
              <Select
                id="p-year"
                label={$t.forms.yearOfStudy}
                options={yearOptions}
                placeholder="Select year"
                bind:value={yearOfStudy}
              />
              <Input id="p-student-id" label={$t.forms.studentRollId} bind:value={studentId} maxlength={100} />
              <Input id="p-city" label={$t.forms.city} bind:value={city} maxlength={120} />
            </div>

            <div class="two-col">
              <Input id="p-dob" label={$t.forms.dateOfBirth} type="date" bind:value={dateOfBirth} />
              <Select
                id="p-dob-privacy"
                label={$t.forms.dobPrivacy}
                options={dobPrivacyOptions}
                bind:value={dobPrivacy}
              />
            </div>

            <div class="two-col">
              <div class="flex flex-col gap-2">
                <Input
                  id="p-avatar"
                  label={$t.forms.avatarImage}
                  type="url"
                  bind:value={avatarUrl}
                  placeholder="https://..."
                />
                <div class="flex items-center gap-2">
                  <input
                    bind:this={avatarFileEl}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    class="hidden"
                    onchange={(e) => handleProfileImageUpload(e, 'avatar')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploadingAvatar}
                    onclick={() => avatarFileEl?.click()}
                  >
                    <Icon name="upload" size={14} />
                    <span>{uploadingAvatar ? $t.ui.uploading : $t.forms.uploadAvatar}</span>
                  </Button>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <Input
                  id="p-cover"
                  label={$t.forms.coverImage}
                  type="url"
                  bind:value={coverImageUrl}
                  placeholder="https://..."
                />
                <div class="flex items-center gap-2">
                  <input
                    bind:this={coverFileEl}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    class="hidden"
                    onchange={(e) => handleProfileImageUpload(e, 'cover')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploadingCover}
                    onclick={() => coverFileEl?.click()}
                  >
                    <Icon name="upload" size={14} />
                    <span>{uploadingCover ? $t.ui.uploading : $t.forms.uploadCover}</span>
                  </Button>
                </div>
              </div>
            </div>

            <Checkbox
              id="p-open-collab"
              label={$t.forms.openToCollaborations}
              description={$t.ui.openToCollabHint}
              bind:checked={openToCollaborations}
            />

            <div class="form-footer">
              <Button type="submit" variant="primary" loading={savingSection === 'basic'}>
                {$t.ui.saveBasicInfo}
              </Button>
            </div>
          </form>
        </Card>

      <!-- TAB 2: EDUCATION -->
      {:else if activeTab === 'education'}
        <div class="section-grid">
          <Card title="{$t.profile.tabEducation} ({profile.education.length})">
            {#if profile.education.length === 0}
              <p class="muted">{$t.ui.noEducationYet}</p>
            {:else}
              <div class="record-list">
                {#each profile.education as edu (edu.id)}
                  <div class="record-row">
                    <div>
                      <strong>{edu.degree} · {edu.fieldOfStudy}</strong>
                      <p class="muted">{edu.institution}</p>
                      <small class="muted">
                        {edu.qualificationLevel} · {edu.startYear ?? '—'} – {edu.currentlyStudying
                          ? 'Present'
                          : (edu.endYear ?? '—')}
                        {edu.grade ? ` · ${edu.grade}` : ''}
                      </small>
                    </div>
                    <Button variant="ghost" size="sm" onclick={() => removeEducation(edu.id)}>
                      Remove
                    </Button>
                  </div>
                {/each}
              </div>
            {/if}
          </Card>

          <Card title={$t.ui.addEducationBtn} subtitle={$t.ui.educationSubtitle}>
            <form class="form-stack" onsubmit={addEducation}>
              <Select
                id="edu-qual"
                label={$t.forms.qualificationLevel}
                options={qualificationOptions.length > 0
                  ? qualificationOptions
                  : [{ value: 'undergraduate', label: 'Undergraduate' }]}
                bind:value={eduQualificationLevel}
                required
              />
              <Input
                id="edu-inst"
                label={$t.forms.institution}
                bind:value={eduInstitution}
                placeholder="IIT Bombay"
                required
              />
              <div class="two-col">
                <Input id="edu-deg" label={$t.forms.degreeCourse} bind:value={eduDegree} placeholder="BTech" required />
                <Input
                  id="edu-field"
                  label={$t.forms.fieldOfStudy}
                  bind:value={eduFieldOfStudy}
                  placeholder="Computer Science"
                  required
                />
              </div>
              <Select
                id="edu-stem"
                label={$t.forms.stemCategoryOptional}
                options={stemCategoryOptions}
                placeholder="Select category"
                bind:value={eduDisciplineCategory}
              />
              <div class="three-col">
                <Input id="edu-sy" label={$t.forms.startYear} type="number" bind:value={eduStartYear} placeholder="2023" />
                <Input
                  id="edu-ey"
                  label={$t.forms.endYear}
                  type="number"
                  bind:value={eduEndYear}
                  placeholder="2027"
                  disabled={eduCurrentlyStudying}
                />
                <Input id="edu-grade" label={$t.forms.gradeCgpa} bind:value={eduGrade} placeholder="9.1 CGPA" />
              </div>
              <Checkbox id="edu-curr" label={$t.forms.currentlyStudying} bind:checked={eduCurrentlyStudying} />
              <div class="form-footer">
                <Button type="submit" variant="primary" loading={savingSection === 'education'}>
                  {$t.profile.saveChanges}
                </Button>
              </div>
            </form>
          </Card>
        </div>

      <!-- TAB 3: EXPERIENCE -->
      {:else if activeTab === 'experience'}
        <div class="section-grid">
          <Card title="{$t.profile.tabExperience} ({profile.experiences.length})">
            {#if profile.experiences.length === 0}
              <p class="muted">{$t.ui.noExperienceYet}</p>
            {:else}
              <div class="record-list">
                {#each profile.experiences as exp (exp.id)}
                  <div class="record-row">
                    <div>
                      <strong>{exp.title}</strong>
                      <p class="muted">{exp.organization}{exp.location ? ` · ${exp.location}` : ''}</p>
                      <small class="muted">
                        {exp.type} · {exp.startYear ?? '—'} – {exp.currentlyWorkingHere
                          ? 'Present'
                          : (exp.endYear ?? '—')}
                      </small>
                    </div>
                    <Button variant="ghost" size="sm" onclick={() => removeExperience(exp.id)}>
                      {$t.ui.remove}
                    </Button>
                  </div>
                {/each}
              </div>
            {/if}
          </Card>

          <Card title={$t.ui.addExperienceBtn} subtitle={$t.ui.experienceSubtitle}>
            <form class="form-stack" onsubmit={addExperience}>
              <div class="two-col">
                <Select
                  id="exp-type"
                  label={$t.forms.experienceType}
                  options={experienceTypeOptions.length > 0
                    ? experienceTypeOptions
                    : [{ value: 'internship', label: 'Internship' }]}
                  bind:value={expType}
                  required
                />
                <Select
                  id="exp-emp"
                  label={$t.forms.employmentType}
                  options={employmentTypeOptions}
                  placeholder="Optional"
                  bind:value={expEmploymentType}
                />
              </div>
              <div class="two-col">
                <Input id="exp-title" label={$t.forms.roleTitle} bind:value={expTitle} placeholder="Robotics Intern" required />
                <Input
                  id="exp-org"
                  label={$t.forms.organizationLab}
                  bind:value={expOrganization}
                  placeholder="IISc Autonomous Systems Lab"
                  required
                />
              </div>
              <div class="three-col">
                <Input id="exp-loc" label={$t.forms.location} bind:value={expLocation} placeholder="Bengaluru" />
                <Input id="exp-sy" label={$t.forms.startYear} type="number" bind:value={expStartYear} placeholder="2025" />
                <Input
                  id="exp-ey"
                  label={$t.forms.endYear}
                  type="number"
                  bind:value={expEndYear}
                  placeholder="2025"
                  disabled={expCurrentlyWorking}
                />
              </div>
              <Checkbox id="exp-curr" label={$t.forms.currentlyWorking} bind:checked={expCurrentlyWorking} />
              <Input
                id="exp-skills"
                label={$t.forms.skillsUsed}
                bind:value={expSkillsCsv}
                placeholder="ROS2, C++, PyTorch"
              />
              <Input id="exp-url" label={$t.forms.projectOrgUrl} type="url" bind:value={expUrl} placeholder="https://..." />
              <Textarea
                id="exp-desc"
                label={$t.forms.description}
                bind:value={expDescription}
                rows={3}
                maxlength={3000}
              />
              <div class="form-footer">
                <Button type="submit" variant="primary" loading={savingSection === 'experience'}>
                  {$t.profile.saveChanges}
                </Button>
              </div>
            </form>
          </Card>
        </div>

      <!-- TAB 4: EXPERTISE & SKILLS -->
      {:else if activeTab === 'expertise'}
        <div class="section-grid">
          <Card title={$t.portfolio.broadDomains} subtitle={$t.ui.expertiseSubtitle}>
            <form class="form-stack" onsubmit={saveExpertise}>
              {#if domainOptions.length > 0}
                <ChipGroup
                  label={$t.forms.broadDomainsUpTo10}
                  options={domainOptions}
                  bind:selected={selectedDomainIds}
                  max={10}
                />
              {/if}
              <Input
                id="exp-aoi"
                label={$t.forms.areasOfInterest}
                bind:value={areasOfInterestCsv}
                placeholder="Precision Agriculture, Autonomous Drones"
              />
              <Input
                id="exp-tags"
                label={$t.forms.discoveryTags}
                bind:value={interestsCsv}
                placeholder="hackathons, deep-tech, open-hardware"
              />
              <div class="form-footer">
                <Button type="submit" variant="primary" loading={savingSection === 'expertise'}>
                  {$t.profile.saveChanges}
                </Button>
              </div>
            </form>
          </Card>

          <Card title="{$t.portfolio.skills} ({profile.skills.length})" subtitle={$t.ui.skillsSubtitle}>
            {#if profile.skills.length > 0}
              <div class="skills-list">
                {#each profile.skills as skill (skill.id)}
                  <div class="skill-pill">
                    <Badge tone="moss">
                      {skill.skillName}{skill.proficiencyLevel ? ` · ${skill.proficiencyLevel}` : ''}
                    </Badge>
                    <button
                      type="button"
                      class="skill-remove"
                      onclick={() => removeSkill(skill.id)}
                      aria-label="Remove {skill.skillName}"
                    >
                      ×
                    </button>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="muted" style="margin-bottom: 1rem;">{$t.ui.noSkillsYet}</p>
            {/if}

            <form class="form-stack" style="margin-top: 1.25rem;" onsubmit={addSkill}>
              <Select
                id="sk-cat"
                label={$t.forms.category}
                options={skillCategoryOptions.length > 0
                  ? skillCategoryOptions
                  : [{ value: 'digital_analytical', label: 'Digital and analytical skills' }]}
                bind:value={newSkillCategory}
              />
              <div class="two-col">
                <Input
                  id="sk-name"
                  label={$t.forms.skillName}
                  bind:value={newSkillName}
                  placeholder="AI and Machine Learning"
                  required
                />
                <Select
                  id="sk-prof"
                  label={$t.forms.proficiency}
                  options={proficiencyOptions}
                  bind:value={newSkillProficiency}
                />
              </div>
              <div class="form-footer">
                <Button type="submit" variant="secondary" loading={savingSection === 'skill'}>
                  {$t.profile.saveChanges}
                </Button>
              </div>
            </form>
          </Card>
        </div>

      <!-- TAB 5: ABOUT & SOCIAL LINKS -->
      {:else if activeTab === 'about'}
        <div class="section-grid">
          <Card title={$t.portfolio.about} subtitle={$t.ui.aboutSubtitle}>
            <form class="form-stack" onsubmit={saveAbout}>
              <Input id="ab-headline" label={$t.forms.headline} bind:value={headline} maxlength={120} />
              <Textarea
                id="ab-bio"
                label={$t.forms.shortBio}
                bind:value={bio}
                rows={3}
                maxlength={280}
                placeholder="Brief intro shown at the top of your portfolio."
              />
              <Textarea
                id="ab-summary"
                label={$t.forms.professionalSummary}
                bind:value={professionalSummary}
                rows={6}
                maxlength={1000}
                placeholder="Share your research background, current builds, and collaboration goals."
              />
              <div class="form-footer">
                <Button type="submit" variant="primary" loading={savingSection === 'about'}>
                  {$t.profile.saveChanges}
                </Button>
              </div>
            </form>
          </Card>

          <Card title={$t.portfolio.socialLinks} subtitle={$t.ui.socialSubtitle}>
            {#if profile.socialLinks.length > 0}
              <div class="record-list" style="margin-bottom: 1.25rem;">
                {#each profile.socialLinks as link (link.id)}
                  <div class="record-row">
                    <div>
                      <strong>{link.label}</strong>
                      <p class="muted"><a href={link.url} target="_blank" rel="noreferrer">{link.url}</a></p>
                    </div>
                    <Button variant="ghost" size="sm" onclick={() => removeSocialLink(link.id)}>
                      {$t.ui.remove}
                    </Button>
                  </div>
                {/each}
              </div>
            {/if}

            <form class="form-stack" onsubmit={addOrUpdateSocialLink}>
              <div class="two-col">
                <Select
                  id="soc-plat"
                  label={$t.forms.platform}
                  options={socialPlatformOptions.length > 0
                    ? socialPlatformOptions
                    : [{ value: 'github', label: 'GitHub' }]}
                  bind:value={socialPlatform}
                />
                <Input id="soc-lbl" label={$t.forms.displayLabel} bind:value={socialLabel} placeholder="GitHub" required />
              </div>
              <Input
                id="soc-url"
                label={$t.forms.profileUrl}
                type="url"
                bind:value={socialUrl}
                placeholder="https://github.com/your-handle"
                required
              />
              <div class="form-footer">
                <Button type="submit" variant="secondary" loading={savingSection === 'social'}>
                  {$t.profile.saveChanges}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      {/if}
    </div>
  {/if}
</main>

<Footer />

<style>
  .profile-page {
    padding: 2rem 1.25rem 3rem;
    flex: 1;
  }

  .profile-page__loading {
    min-height: 55vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-stack {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .profile-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  .profile-hero__left {
    display: flex;
    align-items: center;
    gap: 1.1rem;
    flex-wrap: wrap;
  }

  .profile-hero__title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .profile-hero__title-row h1 {
    font-family: var(--font-display);
    font-size: 1.75rem;
  }

  .profile-hero__right {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .profile-hero__progress {
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px solid var(--c47-bone);
  }

  .muted {
    color: var(--c47-ash);
    font-size: 0.88rem;
  }

  .headline {
    margin-top: 0.25rem;
    color: var(--c47-ink-soft);
    font-weight: 500;
    font-size: 0.94rem;
  }

  .form-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .three-col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .section-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    align-items: start;
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.5rem;
  }

  .record-list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .record-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    padding-bottom: 0.85rem;
    border-bottom: 1px solid var(--c47-bone);
  }

  .record-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .skill-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
  }

  .skill-remove {
    border: none;
    background: transparent;
    color: var(--c47-ash);
    font-size: 1.05rem;
    cursor: pointer;
    line-height: 1;
    padding: 0 0.2rem;
  }

  .skill-remove:hover {
    color: var(--c47-ember);
  }

  @media (max-width: 900px) {
    .section-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .two-col,
    .three-col {
      grid-template-columns: 1fr;
    }
  }
</style>
