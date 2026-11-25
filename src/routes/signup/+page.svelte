<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authApi } from '$lib/api/auth.api';
  import { ApiError, getApiBaseUrl } from '$lib/api/client';
  import { projectsApi, type PublicInvitationPreview } from '$lib/api/projects.api';
  import type { AccountType, PublicRoleCode, PublicRoleOption } from '$lib/api/types';
  import { pushToast, setAuthSession, t } from '$lib/stores';
  import {
    normalizeMobileCountryCode,
    normalizeMobileNumber,
    validateConfirmPassword,
    validateEmail,
    validateMobileCountryCode,
    validateMobileNumber,
    validateName,
    validateRegisterPassword,
  } from '$lib/validation/auth.validation';
  import {
    Alert,
    AuthShell,
    Button,
    CountryCodePhoneInput,
    Divider,
    Icon,
    Input,
    PasswordInput,
    SocialLoginButton,
    type IconName,
  } from '$ui';

  type SignupField =
    | 'accountType'
    | 'name'
    | 'email'
    | 'mobileCountryCode'
    | 'mobileNumber'
    | 'password'
    | 'confirmPassword';

  const FALLBACK_PUBLIC_ROLES: PublicRoleOption[] = [
    {
      id: 'pub-student',
      roleCode: 'student',
      roleName: 'Student',
      roleCategory: 'public',
      roleDescription: 'UG/PG student building projects & proof of work.',
      badgeLabel: 'Student',
      hierarchyLevel: 1,
    },
    {
      id: 'pub-researcher',
      roleCode: 'researcher',
      roleName: 'Researcher',
      roleCategory: 'public',
      roleDescription: 'PhD scholar, fellow & open lab researcher.',
      badgeLabel: 'Researcher',
      hierarchyLevel: 2,
    },
    {
      id: 'pub-scientist',
      roleCode: 'scientist',
      roleName: 'Scientist',
      roleCategory: 'public',
      roleDescription: 'Applied scientist & R&D specialist.',
      badgeLabel: 'Scientist',
      hierarchyLevel: 3,
    },
    {
      id: 'pub-faculty',
      roleCode: 'faculty',
      roleName: 'Faculty',
      roleCategory: 'public',
      roleDescription: 'Professor, academic faculty & principal investigator.',
      badgeLabel: 'Faculty',
      hierarchyLevel: 4,
    },
    {
      id: 'pub-industry',
      roleCode: 'industry',
      roleName: 'Industry',
      roleCategory: 'public',
      roleDescription: 'Industry R&D partner, engineer & technical recruiter.',
      badgeLabel: 'Industry',
      hierarchyLevel: 5,
    },
    {
      id: 'pub-startup',
      roleCode: 'startup',
      roleName: 'Startup',
      roleCategory: 'public',
      roleDescription: 'Startup founder, deep-tech builder & innovation team.',
      badgeLabel: 'Startup',
      hierarchyLevel: 6,
    },
    {
      id: 'pub-government',
      roleCode: 'government',
      roleName: 'Government',
      roleCategory: 'public',
      roleDescription: 'Government agency, national lab & public mission steward.',
      badgeLabel: 'Government',
      hierarchyLevel: 7,
    },
    {
      id: 'pub-others',
      roleCode: 'others',
      roleName: 'Others',
      roleCategory: 'public',
      roleDescription: 'Independent innovator, mentor & ecosystem contributor.',
      badgeLabel: 'Others',
      hierarchyLevel: 8,
    },
  ];

  const ROLE_ICON_MAP: Record<AccountType, IconName> = {
    student: 'graduation-cap',
    researcher: 'flask',
    scientist: 'cpu',
    faculty: 'landmark',
    industry: 'briefcase',
    startup: 'rocket',
    government: 'building',
    others: 'sparkles',
    institution: 'building',
    mentor: 'award',
  };

  let publicRoles = $state<PublicRoleOption[]>(FALLBACK_PUBLIC_ROLES);
  let loadingRoles = $state(true);
  let accountType = $state<PublicRoleCode>('student');
  let name = $state('');
  let email = $state('');
  let mobileCountryCode = $state('+91');
  let mobileNumber = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let isSubmitting = $state(false);
  let formError = $state<string | null>(null);
  let inviteToken = $state<string | null>(null);
  let invitePreview = $state<PublicInvitationPreview | null>(null);
  let fieldErrors = $state<Partial<Record<SignupField, string>>>({});
  let touched = $state<Record<SignupField, boolean>>({
    accountType: false,
    name: false,
    email: false,
    mobileCountryCode: false,
    mobileNumber: false,
    password: false,
    confirmPassword: false,
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
      const response = await authApi.getPublicRoles();
      const loaded = (response.roles ?? []).filter((role) => role.roleCategory === 'public');
      if (loaded.length > 0) {
        publicRoles = loaded;
        if (!loaded.some((r) => r.roleCode === accountType) && loaded[0]) {
          accountType = loaded[0].roleCode as PublicRoleCode;
        }
      }
    } catch {
      // Keep fallback public roles if backend is temporarily unreachable
    } finally {
      loadingRoles = false;
    }
  });

  $effect(() => {
    const prefillEmail = $page.url.searchParams.get('email');
    if (prefillEmail && !email) {
      email = prefillEmail;
    }
    const prefillRole = $page.url.searchParams.get('role') as PublicRoleCode | null;
    if (prefillRole && publicRoles.some((r) => r.roleCode === prefillRole)) {
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
    } else if (field === 'mobileCountryCode') {
      message = validateMobileCountryCode(valueOverride ?? mobileCountryCode);
    } else if (field === 'mobileNumber') {
      message = validateMobileNumber(valueOverride ?? mobileNumber);
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
      message = publicRoles.some((r) => r.roleCode === candidate)
        ? undefined
        : 'Please choose your public role.';
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
    accountType = roleCode as PublicRoleCode;
    touched = { ...touched, accountType: true };
    formError = null;
    setFieldError('accountType', undefined);
  }

  function validateAll(): boolean {
    touched = {
      accountType: true,
      name: true,
      email: true,
      mobileCountryCode: true,
      mobileNumber: true,
      password: true,
      confirmPassword: true,
    };
    const roleErr = validateField('accountType');
    const nameErr = validateField('name');
    const emailErr = validateField('email');
    const countryCodeErr = validateField('mobileCountryCode');
    const mobileErr = validateField('mobileNumber');
    const passwordErr = validateField('password');
    const confirmErr = validateField('confirmPassword');
    return (
      !roleErr &&
      !nameErr &&
      !emailErr &&
      !countryCodeErr &&
      !mobileErr &&
      !passwordErr &&
      !confirmErr
    );
  }

  async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    formError = null;

    if (!validateAll()) {
      return;
    }

    const normalizedCountryCode = normalizeMobileCountryCode(mobileCountryCode);
    const normalizedMobile = normalizeMobileNumber(mobileNumber);

    isSubmitting = true;
    const registerEndpoint = `${getApiBaseUrl()}/auth/register`;
    console.info('[Collab47 UI][Register] Submitting registration form', {
      endpoint: registerEndpoint,
      email: email.trim().toLowerCase(),
      mobileCountryCode: normalizedCountryCode,
      hasMobileNumber: Boolean(normalizedMobile),
      accountType,
      hasInviteToken: Boolean(inviteToken),
    });

    try {
      const response = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobileCountryCode: normalizedCountryCode,
        mobileNumber: normalizedMobile,
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
        publicRoles.find((r) => r.roleCode === response.user.accountType)?.roleName ??
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
          accountType: err.fieldErrors.accountType,
          name: err.fieldErrors.name,
          email: err.fieldErrors.email,
          mobileCountryCode: err.fieldErrors.mobileCountryCode,
          mobileNumber: err.fieldErrors.mobileNumber,
          password: err.fieldErrors.password,
          confirmPassword: err.fieldErrors.confirmPassword,
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
  <form class="flex flex-col gap-3.5" onsubmit={handleSubmit} novalidate>
    {#if invitePreview}
      <div class="rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-3.5 text-xs text-[#2E1065]">
        <div class="flex items-center gap-1.5 font-extrabold text-[#7C3AED]">
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

    <!-- Public Role Selection on Top (Fetched from GET /api/v1/auth/public-roles) -->
    <fieldset class="flex flex-col gap-2 border-0 p-0">
      <legend class="flex w-full items-center justify-between text-xs font-semibold text-slate-700">
        <span>{$t.auth.joiningAsLabel} <span class="text-rose-500">*</span></span>
        <span class="font-medium text-logo-green">
          {loadingRoles ? 'Loading roles...' : $t.auth.joiningAsHint}
        </span>
      </legend>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {#each publicRoles as role (role.roleCode)}
          {@const selected = accountType === role.roleCode}
          <button
            type="button"
            onclick={() => handleRoleSelect(role.roleCode)}
            aria-pressed={selected}
            class="flex cursor-pointer flex-col items-start gap-1 rounded-xl border px-2.5 py-2 text-left transition {selected
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
                <Icon name="check-circle" size={13} class="text-logo-saffron" />
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

    <CountryCodePhoneInput
      id="register-mobile"
      label="Mobile Number"
      bind:countryCode={mobileCountryCode}
      bind:mobileNumber={mobileNumber}
      required
      disabled={isSubmitting}
      countryCodeError={touched.mobileCountryCode || fieldErrors.mobileCountryCode
        ? fieldErrors.mobileCountryCode
        : undefined}
      mobileNumberError={touched.mobileNumber || fieldErrors.mobileNumber
        ? fieldErrors.mobileNumber
        : undefined}
      onCountryCodeInput={(val) => handleFieldInput('mobileCountryCode', val)}
      onCountryCodeBlur={() => handleFieldBlur('mobileCountryCode')}
      onMobileNumberInput={(val) => handleFieldInput('mobileNumber', val)}
      onMobileNumberBlur={() => handleFieldBlur('mobileNumber')}
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

  <Divider label={$t.auth.orRegisterEmail} />
  <SocialLoginButton label={$t.auth.signupWithGoogle} redirectTo="/signup/plan" />

  {#snippet footer()}
    {$t.auth.alreadyHaveAccount}
    <a href="/login" class="font-semibold text-logo-saffron hover:text-logo-green">
      {$t.auth.signInLink}
    </a>
  {/snippet}
</AuthShell>
