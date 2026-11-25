<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authApi } from '$lib/api/auth.api';
  import { ApiError, ensureFreshSession } from '$lib/api/client';
  import { profileApi } from '$lib/api/profile.api';
  import { uploadsApi } from '$lib/api/uploads.api';
  import type { AccountType, OccupationCode, YearOfStudy } from '$lib/api/types';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
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
    Badge,
    Button,
    Card,
    ChipGroup,
    Input,
    ProgressBar,
    Select,
    Spinner,
  } from '$ui';

  let step = $state(1);
  let accountType = $state<AccountType>('student');
  let selectedOccupations = $state<string[]>([]);
  let occupationOther = $state('');
  let college = $state('');
  let branch = $state('');
  let yearOfStudy = $state('');
  let city = $state('');
  let selectedDomainIds = $state<string[]>([]);
  let interestsInput = $state('');
  let handle = $state('');
  let avatarUrl = $state('');
  let isUploadingAvatar = $state(false);
  let handleStatus = $state<'idle' | 'checking' | 'available' | 'taken'>('idle');
  let isSaving = $state(false);
  let errorMessage = $state<string | null>(null);

  const fallbackAccountTypeOptions = [
    { value: 'student', label: 'Student' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'scientist', label: 'Scientist' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'industry', label: 'Industry' },
    { value: 'startup', label: 'Startup' },
    { value: 'government', label: 'Government' },
    { value: 'others', label: 'Others' },
  ];

  const accountTypeOptions = $derived(
    $profileState.options?.roles && $profileState.options.roles.length > 0
      ? $profileState.options.roles
          .filter((r) => r.roleCategory === 'public')
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

  const occupationOptions = $derived(
    ($profileState.options?.occupations ?? []).map((item) => ({
      value: item.code,
      label: item.label,
    })),
  );

  const domainOptions = $derived(
    ($profileState.options?.broadDomains ?? []).map((item) => ({
      value: item.id,
      label: item.label,
    })),
  );

  onMount(async () => {
    const hasSession = await ensureFreshSession();
    if (!hasSession) {
      await goto('/login?next=/onboarding');
      return;
    }

    const [profile] = await Promise.all([loadMyProfile(), loadProfileOptions()]);
    if (profile) {
      accountType = profile.accountType;
      selectedOccupations = [...profile.occupations];
      occupationOther = profile.occupationOther ?? '';
      college = profile.college ?? '';
      branch = profile.branch ?? '';
      yearOfStudy = profile.yearOfStudy ?? '';
      city = profile.city ?? '';
      selectedDomainIds = profile.expertise.broadDomains.map((d) => d.broadDomainId);
      interestsInput = profile.expertise.areasOfInterest.map((a) => a.label).join(', ');
      handle = profile.handle;
      avatarUrl = profile.avatarUrl ?? '';
    }
  });

  async function handleAvatarUpload(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    isUploadingAvatar = true;
    errorMessage = null;
    try {
      const [uploaded] = await uploadsApi.uploadFiles([files[0]], 'avatars');
      if (uploaded) {
        avatarUrl = uploaded.url;
        pushToast({
          tone: 'success',
          title: 'Avatar uploaded',
          message: 'Your avatar image is ready.',
        });
      }
    } catch (err) {
      errorMessage = err instanceof ApiError ? err.message : 'Failed to upload avatar image.';
    } finally {
      isUploadingAvatar = false;
      input.value = '';
    }
  }

  async function verifyHandle(): Promise<void> {
    const normalized = handle.trim().toLowerCase();
    if (normalized.length < 3) {
      handleStatus = 'idle';
      return;
    }
    if (normalized === $profileState.profile?.handle) {
      handleStatus = 'available';
      return;
    }
    handleStatus = 'checking';
    try {
      const res = await authApi.checkAvailability({ handle: normalized });
      handleStatus = res.handleAvailable ? 'available' : 'taken';
    } catch {
      handleStatus = 'idle';
    }
  }

  async function handleComplete(): Promise<void> {
    errorMessage = null;
    isSaving = true;
    try {
      const areasOfInterest = interestsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await profileApi.completeOnboarding({
        accountType,
        occupations:
          selectedOccupations.length > 0 ? (selectedOccupations as OccupationCode[]) : undefined,
        occupationOther: selectedOccupations.includes('other') ? occupationOther.trim() : undefined,
        college: college.trim() || undefined,
        branch: branch.trim() || undefined,
        yearOfStudy: (yearOfStudy || undefined) as YearOfStudy | undefined,
        city: city.trim() || undefined,
        broadDomainIds: selectedDomainIds.length > 0 ? selectedDomainIds : undefined,
        areasOfInterest: areasOfInterest.length > 0 ? areasOfInterest : undefined,
        handle: handle.trim().toLowerCase() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
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
      pushToast({
        tone: 'success',
        title: 'Onboarding complete!',
        message: 'Your Collab47 profile has been initialized.',
      });
      await goto(getDashboardPath(updated.accountType ?? accountType));
    } catch (err) {
      errorMessage = err instanceof ApiError ? err.message : 'Failed to save onboarding details.';
    } finally {
      isSaving = false;
    }
  }
</script>

<svelte:head>
  <title>Onboarding · Collab47</title>
</svelte:head>

<main class="c47-container onboarding">
  {#if !$authState.isHydrated || ($profileState.isLoading && !$profileState.profile)}
    <div class="onboarding__loading">
      <Spinner label="Loading your onboarding workspace..." size="lg" />
    </div>
  {:else if $isAuthenticated}
    <div class="onboarding__wrap">
      <div class="onboarding__header">
        <Badge tone="saffron">{$t.onboarding.stepOf} {step} / 4</Badge>
        <h1>{$t.onboarding.title}</h1>
        <p>{$t.onboarding.subtitle}</p>
      </div>

      <ProgressBar value={step} max={4} label={$t.onboarding.progressLabel} />

      {#if errorMessage}
        <Alert tone="error" title="Could not save onboarding">{errorMessage}</Alert>
      {/if}

      <Card surface="paper" padding="lg" elevated>
        {#if step === 1}
          <div class="step-body">
            <h2>{$t.onboarding.step1Title}</h2>
            <Select
              id="onb-account-type"
              label={$t.forms.primaryAccountType}
              options={accountTypeOptions}
              bind:value={accountType}
              required
            />

            {#if occupationOptions.length > 0}
              <ChipGroup
                label={$t.forms.occupationsSelectAll}
                options={occupationOptions}
                bind:selected={selectedOccupations}
                max={5}
              />
            {/if}

            {#if selectedOccupations.includes('other')}
              <Input
                id="onb-occupation-other"
                label={$t.forms.specifyOccupation}
                bind:value={occupationOther}
                placeholder="e.g., Independent Hardware Builder"
                required
              />
            {/if}
          </div>
        {:else if step === 2}
          <div class="step-body">
            <h2>{$t.onboarding.step2Title}</h2>
            <Input
              id="onb-college"
              label={$t.forms.collegeOrOrg}
              bind:value={college}
              placeholder="Indian Institute of Technology Bombay"
            />
            <div class="two-col">
              <Input
                id="onb-branch"
                label={$t.forms.branchDepartment}
                bind:value={branch}
                placeholder="Computer Science and Engineering"
              />
              <Select
                id="onb-year"
                label={$t.forms.yearOfStudy}
                options={yearOptions}
                placeholder="Select year"
                bind:value={yearOfStudy}
              />
            </div>
            <Input id="onb-city" label={$t.forms.city} bind:value={city} placeholder="Mumbai" />
          </div>
        {:else if step === 3}
          <div class="step-body">
            <h2>{$t.onboarding.step3Title}</h2>
            {#if domainOptions.length > 0}
              <ChipGroup
                label={$t.forms.selectUpTo5Domains}
                hint="First selected domain is saved as your primary domain."
                options={domainOptions}
                bind:selected={selectedDomainIds}
                max={5}
              />
            {/if}

            <Input
              id="onb-interests"
              label={$t.forms.areasOfInterest}
              bind:value={interestsInput}
              placeholder="Autonomous Drones, Edge AI, Open Source Hardware"
            />
          </div>
        {:else}
          <div class="step-body">
            <h2>{$t.onboarding.step4Title}</h2>
            <Input
              id="onb-handle"
              label={$t.forms.publicHandle}
              prefix="@"
              bind:value={handle}
              placeholder="ananya_sharma"
              hint={handleStatus === 'available'
                ? 'Handle is available!'
                : handleStatus === 'checking'
                  ? 'Checking availability...'
                  : 'Lowercase letters, numbers, and underscores (3–50 chars).'}
              error={handleStatus === 'taken' ? 'This handle is already taken.' : undefined}
              onblur={verifyHandle}
            />

            <div class="avatar-upload-row">
              <Input
                id="onb-avatar"
                label={$t.forms.avatarImageOptional}
                type="url"
                bind:value={avatarUrl}
                placeholder="https://example.com/avatar.webp"
              />
              <label class="upload-pill" class:upload-pill--busy={isUploadingAvatar}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  disabled={isUploadingAvatar}
                  onchange={handleAvatarUpload}
                  hidden
                />
                {isUploadingAvatar ? $t.ui.uploading : $t.forms.uploadAvatar}
              </label>
            </div>
            {#if avatarUrl}
              <div class="avatar-preview">
                <img src={avatarUrl} alt="Avatar preview" />
                <span>{$t.ui.completed}</span>
              </div>
            {/if}
          </div>
        {/if}

        <div class="step-actions">
          <div>
            {#if step > 1}
              <Button variant="outline" onclick={() => (step -= 1)}>{$t.onboarding.back}</Button>
            {:else}
              <Button variant="ghost" href="/profile">{$t.ui.skipForNow}</Button>
            {/if}
          </div>

          <div class="step-actions__right">
            {#if step < 4}
              <Button variant="primary" onclick={() => (step += 1)}>{$t.onboarding.next}</Button>
            {:else}
              <Button variant="primary" loading={isSaving} onclick={handleComplete}>
                {$t.onboarding.completeBtn}
              </Button>
            {/if}
          </div>
        </div>
      </Card>
    </div>
  {/if}
</main>

<style>
  .onboarding {
    padding: 2.5rem 1.25rem 4rem;
  }

  .onboarding__loading {
    min-height: 55vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .onboarding__wrap {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .onboarding__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.45rem;
  }

  .onboarding__header h1 {
    font-family: var(--font-display);
    font-size: 2rem;
  }

  .onboarding__header p {
    color: var(--c47-ash);
  }

  .step-body {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .step-body h2 {
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .avatar-upload-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 0.75rem;
  }

  .upload-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.6rem;
    padding: 0 0.95rem;
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 107, 0, 0.45);
    background: rgba(255, 107, 0, 0.08);
    color: var(--c47-saffron-deep, #c2410c);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .upload-pill:hover {
    background: rgba(255, 107, 0, 0.15);
    border-color: var(--c47-saffron);
  }

  .upload-pill--busy {
    opacity: 0.65;
    pointer-events: none;
  }

  .avatar-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.82rem;
    color: var(--c47-ash);
  }

  .avatar-preview img {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    object-fit: cover;
    border: 1px solid var(--c47-bone);
  }

  .step-actions {
    margin-top: 1.75rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--c47-bone);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 640px) {
    .two-col {
      grid-template-columns: 1fr;
    }
  }
</style>
