<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authApi } from '$lib/api/auth.api';
  import { ApiError, getApiBaseUrl } from '$lib/api/client';
  import { projectsApi, type PublicInvitationPreview } from '$lib/api/projects.api';
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
  } from '$ui';

  type SignupField =
    | 'name'
    | 'email'
    | 'mobileCountryCode'
    | 'mobileNumber'
    | 'password'
    | 'confirmPassword';

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
  });

  $effect(() => {
    const prefillEmail = $page.url.searchParams.get('email');
    if (prefillEmail && !email) {
      email = prefillEmail;
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
    } else {
      message = validateConfirmPassword(password, valueOverride ?? confirmPassword);
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

  function validateAll(): boolean {
    touched = {
      name: true,
      email: true,
      mobileCountryCode: true,
      mobileNumber: true,
      password: true,
      confirmPassword: true,
    };
    const nameErr = validateField('name');
    const emailErr = validateField('email');
    const countryCodeErr = validateField('mobileCountryCode');
    const mobileErr = validateField('mobileNumber');
    const passwordErr = validateField('password');
    const confirmErr = validateField('confirmPassword');
    return !nameErr && !emailErr && !countryCodeErr && !mobileErr && !passwordErr && !confirmErr;
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
        inviteToken: inviteToken ?? undefined,
      });

      console.info('[Collab47 UI][Register] Registration succeeded', {
        endpoint: registerEndpoint,
        userId: response.user.id,
        handle: response.user.handle,
        redirectTo: response.redirectTo,
      });

      setAuthSession(response.user, response.tokens);
      const joinedTitles = response.joinedProjectTitles ?? [];
      pushToast({
        tone: 'success',
        title:
          joinedTitles.length > 0
            ? `Joined "${joinedTitles[0]}" & created account!`
            : 'Account created!',
        message:
          joinedTitles.length > 0
            ? `Welcome ${response.user.name}! You were automatically added as a contributor to ${joinedTitles.join(', ')}.`
            : `Welcome ${response.user.name}! Your account is ready — you can post your first 2 projects for free.`,
      });

      const targetPath =
        response.redirectTo && response.redirectTo !== '/signup/plan'
          ? response.redirectTo
          : '/onboarding';
      await goto(targetPath);
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
      placeholder="you@example.com"
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
  <SocialLoginButton label={$t.auth.signupWithGoogle} redirectTo="/onboarding" />

  {#snippet footer()}
    {$t.auth.alreadyHaveAccount}
    <a href="/login" class="font-semibold text-logo-saffron hover:text-logo-green">
      {$t.auth.signInLink}
    </a>
  {/snippet}
</AuthShell>
