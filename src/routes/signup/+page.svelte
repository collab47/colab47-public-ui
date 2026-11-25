<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authApi } from '$lib/api/auth.api';
  import { ApiError, getApiBaseUrl } from '$lib/api/client';
  import { projectsApi, type PublicInvitationPreview } from '$lib/api/projects.api';
  import type { AccountType, ExternalRoleOption } from '$lib/api/types';
  import { pushToast, setAuthSession, t } from '$lib/stores';
  import {
    validateConfirmPassword,
    validateEmail,
    validateName,
    validateRegisterPassword,
  } from '$lib/validation/auth.validation';
  import {
    Alert,
    AuthShell,
    Button,
    Divider,
    Icon,
    Input,
    PasswordInput,
    SocialLoginButton,
    type IconName,
  } from '$ui';

  type SignupField = 'name' | 'email' | 'password' | 'confirmPassword' | 'accountType';

  const FALLBACK_EXTERNAL_ROLES: ExternalRoleOption[] = [
    {
      id: 'ext-student',
      roleCode: 'student',
      roleName: 'Student',
      roleCategory: 'external',
      roleDescription: 'UG/PG student building projects & proof of work',
      badgeLabel: 'Student',
    },
    {
      id: 'ext-researcher',
      roleCode: 'researcher',
      roleName: 'Researcher',
      roleCategory: 'external',
      roleDescription: 'PhD scholar, fellow & open lab researcher',
      badgeLabel: 'Researcher',
    },
    {
      id: 'ext-faculty',
      roleCode: 'faculty',
      roleName: 'Faculty / PI',
      roleCategory: 'external',
      roleDescription: 'Professor, lab PI & project supervisor',
      badgeLabel: 'Faculty',
    },
    {
      id: 'ext-industry',
      roleCode: 'industry',
      roleName: 'Industry / Startup',
      roleCategory: 'external',
      roleDescription: 'R&D partner, founder & technical recruiter',
      badgeLabel: 'Industry',
    },
    {
      id: 'ext-institution',
      roleCode: 'institution',
      roleName: 'Institution',
      roleCategory: 'external',
      roleDescription: 'College, university, incubator & govt agency',
      badgeLabel: 'Institution',
    },
    {
      id: 'ext-mentor',
      roleCode: 'mentor',
      roleName: 'Mentor / Advisor',
      roleCategory: 'external',
      roleDescription: 'Domain advisor guiding innovation teams',
      badgeLabel: 'Mentor',
    },
  ];

  const ROLE_ICON_MAP: Record<AccountType, IconName> = {
    student: 'graduation-cap',
    researcher: 'flask',
    faculty: 'landmark',
    industry: 'rocket',
    institution: 'building',
    mentor: 'award',
  };

  let externalRoles = $state<ExternalRoleOption[]>(FALLBACK_EXTERNAL_ROLES);
  let accountType = $state<AccountType>('student');
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let isSubmitting = $state(false);
  let formError = $state<string | null>(null);
  let inviteToken = $state<string | null>(null);
  let invitePreview = $state<PublicInvitationPreview | null>(null);
  let fieldErrors = $state<Partial<Record<SignupField, string>>>({});
  let touched = $state<Record<SignupField, boolean>>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    accountType: false,
  });

  onMount(async () => {
    const tokenFromUrl = $page.url.searchParams.get('invite')?.trim() || null;
    if (tokenFromUrl) {
      inviteToken = tokenFromUrl;
      try {
        const preview = await projectsApi.getInvitationByToken(tokenFromUrl);
        invitePreview = preview;
        if (preview.inviteeEmail && !email) {
          email = preview.inviteeEmail;
        }
      } catch {
        // Ignore invalid/expired invite token preview
      }
    }

    try {
      const metadata = await authApi.getRegistrationMetadata();
      const loaded = (metadata.accountTypes ?? []).filter(
        (role) => role.roleCategory === 'external',
      );
      if (loaded.length > 0) {
        externalRoles = loaded;
        if (!loaded.some((r) => r.roleCode === accountType) && loaded[0]) {
          accountType = loaded[0].roleCode;
        }
      }
    } catch {
      // Keep fallback external roles if backend is unreachable
    }
  });

  $effect(() => {
    const prefillEmail = $page.url.searchParams.get('email');
    if (prefillEmail && !email) {
      email = prefillEmail;
    }
    const prefillRole = $page.url.searchParams.get('role') as AccountType | null;
    if (prefillRole && FALLBACK_EXTERNAL_ROLES.some((r) => r.roleCode === prefillRole)) {
      accountType = prefillRole;
    }
  });

  function setFieldError(field: SignupField, message: string | undefined): void {
    const next = { ...fieldErrors };
    if (message) {
      next[field] = message;
    } else {
      delete next[field];
    }
    fieldErrors = next;
  }

  function validateField(field: SignupField, valueOverride?: string): string | undefined {
    let message: string | undefined;

    if (field === 'name') {
      message = validateName(valueOverride ?? name);
    } else if (field === 'email') {
      message = validateEmail(valueOverride ?? email);
    } else if (field === 'password') {
      const nextPassword = valueOverride ?? password;
      message = validateRegisterPassword(nextPassword);
      if (touched.confirmPassword || confirmPassword.length > 0) {
        setFieldError('confirmPassword', validateConfirmPassword(nextPassword, confirmPassword));
      }
    } else if (field === 'confirmPassword') {
      message = validateConfirmPassword(password, valueOverride ?? confirmPassword);
    } else {
      const candidate = (valueOverride ?? accountType) as AccountType;
      message = externalRoles.some((r) => r.roleCode === candidate)
        ? undefined
        : 'Please choose your role.';
    }

    setFieldError(field, message);
    return message;
  }

  function handleFieldInput(field: SignupField, value: string): void {
    touched = { ...touched, [field]: true };
    formError = null;
    validateField(field, value);
  }

  function handleFieldBlur(field: SignupField): void {
    touched = { ...touched, [field]: true };
    validateField(field);
  }

  function handleRoleSelect(roleCode: AccountType): void {
    accountType = roleCode;
    touched = { ...touched, accountType: true };
    formError = null;
    setFieldError('accountType', undefined);
  }

  function validateAll(): boolean {
    touched = {
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      accountType: true,
    };
    const nameErr = validateField('name');
    const emailErr = validateField('email');
    const passwordErr = validateField('password');
    const confirmErr = validateField('confirmPassword');
    const roleErr = validateField('accountType');
    return !nameErr && !emailErr && !passwordErr && !confirmErr && !roleErr;
  }

  async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    formError = null;

    if (!validateAll()) {
      return;
    }

    isSubmitting = true;
    const registerEndpoint = `${getApiBaseUrl()}/auth/register`;
    console.info('[Collab47 UI][Register] Submitting registration form', {
      endpoint: registerEndpoint,
      email: email.trim().toLowerCase(),
      accountType,
      hasInviteToken: Boolean(inviteToken),
    });

    try {
      const response = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        accountType,
        inviteToken: inviteToken ?? undefined,
      });

      console.info('[Collab47 UI][Register] Registration succeeded', {
        endpoint: registerEndpoint,
        userId: response.user.id,
        handle: response.user.handle,
        accountType: response.user.accountType,
        redirectTo: response.redirectTo,
      });

      const selectedRoleLabel =
        externalRoles.find((r) => r.roleCode === response.user.accountType)?.roleName ??
        response.user.accountType;

      setAuthSession(response.user, response.tokens);
      const joinedTitles = response.joinedProjectTitles ?? [];
      pushToast({
        tone: 'success',
        title:
          joinedTitles.length > 0
            ? `Joined "${joinedTitles[0]}" & created account!`
            : `Account created as ${selectedRoleLabel}!`,
        message:
          joinedTitles.length > 0
            ? `Welcome ${response.user.name}! You were automatically added as a contributor to ${joinedTitles.join(', ')}.`
            : `Welcome ${response.user.name}. Now choose your Free or Premium plan.`,
      });
      await goto('/signup/plan');
    } catch (err) {
      console.error('[Collab47 UI][Register] Registration failed', {
        endpoint: registerEndpoint,
        error:
          err instanceof ApiError
            ? {
                statusCode: err.statusCode,
                errorCode: err.errorCode,
                message: err.message,
                requestId: err.requestId,
                fieldErrors: err.fieldErrors,
              }
            : err instanceof Error
              ? err.message
              : String(err),
      });
      if (err instanceof ApiError) {
        formError = err.message;
        fieldErrors = {
          name: err.fieldErrors.name,
          email: err.fieldErrors.email,
          password: err.fieldErrors.password,
          confirmPassword: err.fieldErrors.confirmPassword,
          accountType: err.fieldErrors.accountType,
        };
      } else {
        formError = 'Unable to connect to the Collab47 API. Please check the backend server.';
      }
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>{$t.nav.signUp} · Collab47</title>
</svelte:head>

<AuthShell
  title={$t.auth.signupTitle}
  subtitle={$t.auth.signupSubtitle}
  heroTagline="{$t.home.heroTitlePrimary} {$t.home.heroTitleSecondary}"
>
  <SocialLoginButton label={$t.auth.signupWithGoogle} redirectTo="/signup/plan" />
  <Divider label={$t.auth.orRegisterEmail} />

  <form class="flex flex-col gap-3.5" onsubmit={handleSubmit} novalidate>
    {#if invitePreview}
      <div class="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-950">
        <div class="flex items-center gap-1.5 font-extrabold text-logo-green">
          <Icon name="sparkles" size={14} />
          <span>Project Contributor Invitation</span>
        </div>
        <p class="mt-1 leading-relaxed">
          <strong>{invitePreview.inviterName}</strong> invited you to join
          <strong>"{invitePreview.projectTitle}"</strong> as
          <strong>{invitePreview.roleTitle}</strong>. Complete registration below and you will be
          added to the project automatically.
        </p>
      </div>
    {/if}

    {#if formError}
      <Alert tone="error" title="Registration failed">{formError}</Alert>
    {/if}

    <!-- External Role Selection (Loaded from public.mst_roles WHERE role_category = 'external') -->
    <fieldset class="flex flex-col gap-2 border-0 p-0">
      <legend class="flex w-full items-center justify-between text-xs font-semibold text-slate-700">
        <span>{$t.auth.joiningAsLabel} <span class="text-rose-500">*</span></span>
        <span class="font-medium text-logo-green">{$t.auth.joiningAsHint}</span>
      </legend>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {#each externalRoles as role (role.roleCode)}
          {@const selected = accountType === role.roleCode}
          <button
            type="button"
            onclick={() => handleRoleSelect(role.roleCode)}
            aria-pressed={selected}
            class="flex cursor-pointer flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition {selected
              ? 'border-logo-saffron bg-logo-saffron-soft/80 text-logo-saffron shadow-xs ring-1 ring-logo-saffron/40'
              : 'border-slate-200 bg-white text-slate-700 hover:border-logo-saffron-border hover:bg-slate-50'}"
          >
            <div class="flex w-full items-center justify-between gap-1">
              <Icon
                name={ROLE_ICON_MAP[role.roleCode] ?? 'user'}
                size={15}
                class={selected ? 'text-logo-saffron' : 'text-logo-green'}
              />
              {#if selected}
                <Icon name="check-circle" size={14} class="text-logo-saffron" />
              {/if}
            </div>
            <span class="text-xs font-bold leading-tight {selected ? 'text-logo-saffron' : 'text-slate-900'}">
              {role.roleName}
            </span>
          </button>
        {/each}
      </div>

      {#if (touched.accountType || fieldErrors.accountType) && fieldErrors.accountType}
        <span class="text-xs font-medium text-rose-600">{fieldErrors.accountType}</span>
      {/if}
    </fieldset>

    <Input
      id="register-name"
      label={$t.auth.fullNameLabel}
      icon="user"
      bind:value={name}
      placeholder="Ananya Sharma"
      autocomplete="name"
      required
      maxlength={100}
      error={touched.name || fieldErrors.name ? fieldErrors.name : undefined}
      oninput={(val) => handleFieldInput('name', val)}
      onblur={() => handleFieldBlur('name')}
    />

    <Input
      id="register-email"
      label={$t.auth.emailLabel}
      type="email"
      icon="mail"
      bind:value={email}
      placeholder="ananya.sharma@iitb.ac.in"
      autocomplete="email"
      required
      maxlength={254}
      error={touched.email || fieldErrors.email ? fieldErrors.email : undefined}
      oninput={(val) => handleFieldInput('email', val)}
      onblur={() => handleFieldBlur('email')}
    />

    <PasswordInput
      id="register-password"
      label={$t.auth.passwordLabel}
      bind:value={password}
      placeholder="Min 8 chars, upper, lower, digit & symbol"
      autocomplete="new-password"
      required
      showStrengthMeter
      error={touched.password || fieldErrors.password ? fieldErrors.password : undefined}
      oninput={(val) => handleFieldInput('password', val)}
      onblur={() => handleFieldBlur('password')}
    />

    <PasswordInput
      id="register-confirm-password"
      label={$t.auth.confirmPasswordLabel}
      bind:value={confirmPassword}
      placeholder="Re-enter your password"
      autocomplete="new-password"
      required
      error={touched.confirmPassword || fieldErrors.confirmPassword
        ? fieldErrors.confirmPassword
        : undefined}
      oninput={(val) => handleFieldInput('confirmPassword', val)}
      onblur={() => handleFieldBlur('confirmPassword')}
    />

    <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
      <span>{$t.auth.continueToPlansBtn}</span>
      <Icon name="arrow-right" size={18} />
    </Button>
  </form>

  {#snippet footer()}
    {$t.auth.alreadyHaveAccount}
    <a href="/login" class="font-semibold text-logo-saffron hover:text-logo-green">
      {$t.auth.signInLink}
    </a>
  {/snippet}
</AuthShell>
