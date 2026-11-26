<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authApi } from '$lib/api/auth.api';
  import { ApiError, ensureFreshSession, getApiBaseUrl } from '$lib/api/client';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import { authState, pushToast, setAuthSession, t } from '$lib/stores';
  import { validateEmail, validateLoginPassword } from '$lib/validation/auth.validation';
  import {
    Alert,
    AuthShell,
    Button,
    Checkbox,
    Divider,
    Icon,
    Input,
    PasswordInput,
    SocialLoginButton,
  } from '$ui';

  type LoginField = 'email' | 'password';

  let email = $state('');
  let password = $state('');
  let rememberMe = $state(false);
  let isSubmitting = $state(false);
  let formError = $state<string | null>(null);
  let fieldErrors = $state<Partial<Record<LoginField, string>>>({});
  let touched = $state<Record<LoginField, boolean>>({
    email: false,
    password: false,
  });

  const safeNextTarget = $derived.by(() => {
    const nextParam = $page.url.searchParams.get('next');
    return nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : '/dashboard';
  });

  onMount(async () => {
    try {
      const hasSession = await ensureFreshSession();
      const user = authState.get().user;
      if (hasSession && user) {
        const explicitNext = $page.url.searchParams.get('next');
        const targetPath =
          explicitNext &&
          explicitNext.startsWith('/') &&
          !explicitNext.startsWith('//') &&
          explicitNext !== '/login'
            ? explicitNext
            : getDashboardPath(user.accountType);
        await goto(targetPath, { replaceState: true });
      }
    } catch {
      // Stay on login page if background session check fails
    }
  });

  function setFieldError(field: LoginField, message: string | undefined): void {
    const next = { ...fieldErrors };
    if (message) {
      next[field] = message;
    } else {
      delete next[field];
    }
    fieldErrors = next;
  }

  function validateField(field: LoginField, valueOverride?: string): string | undefined {
    const message =
      field === 'email'
        ? validateEmail(valueOverride ?? email)
        : validateLoginPassword(valueOverride ?? password);
    setFieldError(field, message);
    return message;
  }

  function handleFieldInput(field: LoginField, value: string): void {
    touched = { ...touched, [field]: true };
    formError = null;
    validateField(field, value);
  }

  function handleFieldBlur(field: LoginField): void {
    touched = { ...touched, [field]: true };
    validateField(field);
  }

  function validateAll(): boolean {
    touched = { email: true, password: true };
    const emailErr = validateField('email');
    const passwordErr = validateField('password');
    return !emailErr && !passwordErr;
  }

  async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    formError = null;

    if (!validateAll()) {
      return;
    }

    isSubmitting = true;
    const nextParam = $page.url.searchParams.get('next') ?? undefined;
    const loginEndpoint = `${getApiBaseUrl()}/auth/login`;
    console.info('[Collab47 UI][Login] Submitting login form', {
      endpoint: loginEndpoint,
      email: email.trim().toLowerCase(),
      rememberMe,
    });

    try {
      const response = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
        next: nextParam,
      });

      console.info('[Collab47 UI][Login] Login succeeded', {
        endpoint: loginEndpoint,
        userId: response.user.id,
        handle: response.user.handle,
        accountType: response.user.accountType,
        accountRestored: response.accountRestored,
      });

      setAuthSession(response.user, response.tokens, { rememberMe });

      if (response.accountRestored) {
        pushToast({
          tone: 'success',
          title: 'Account Restored',
          message: 'Welcome back! Your account and portfolio have been fully restored.',
        });
      } else {
        pushToast({
          tone: 'success',
          title: `Welcome back, ${response.user.name}`,
          message: 'Signed in successfully.',
        });
      }

      const explicitNext = $page.url.searchParams.get('next');
      const targetPath =
        explicitNext && explicitNext.startsWith('/') && !explicitNext.startsWith('//')
          ? explicitNext
          : getDashboardPath(response.user.accountType);

      await goto(targetPath);
    } catch (err) {
      console.error('[Collab47 UI][Login] Login failed', {
        endpoint: loginEndpoint,
        error:
          err instanceof ApiError
            ? {
                statusCode: err.statusCode,
                errorCode: err.errorCode,
                message: err.message,
                requestId: err.requestId,
              }
            : err instanceof Error
              ? err.message
              : String(err),
      });
      if (err instanceof ApiError) {
        formError = err.message;
        fieldErrors = {
          email: err.fieldErrors.email,
          password: err.fieldErrors.password,
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
  <title>{$t.nav.signIn} · Collab47</title>
</svelte:head>

<AuthShell
  title={$t.auth.loginTitle}
  subtitle={$t.auth.loginSubtitle}
  heroTagline={$t.auth.loginHeroTagline}
>
  <SocialLoginButton label={$t.auth.continueWithGoogle} redirectTo={safeNextTarget} />
  <Divider label={$t.auth.orContinueEmail} />

  <form class="flex flex-col gap-4" onsubmit={handleSubmit} novalidate>
    {#if formError}
      <Alert tone="error" title="Sign in failed">{formError}</Alert>
    {/if}

    <Input
      id="login-email"
      label={$t.auth.emailLabel}
      type="email"
      icon="mail"
      bind:value={email}
      placeholder="ananya.sharma@iitb.ac.in"
      autocomplete="email"
      required
      error={touched.email || fieldErrors.email ? fieldErrors.email : undefined}
      oninput={(val) => handleFieldInput('email', val)}
      onblur={() => handleFieldBlur('email')}
    />

    <PasswordInput
      id="login-password"
      label={$t.auth.passwordLabel}
      bind:value={password}
      placeholder="Enter your password"
      autocomplete="current-password"
      required
      error={touched.password || fieldErrors.password ? fieldErrors.password : undefined}
      oninput={(val) => handleFieldInput('password', val)}
      onblur={() => handleFieldBlur('password')}
    />

    <div class="flex items-center justify-between gap-2">
      <Checkbox id="login-remember" label={$t.auth.rememberMe} bind:checked={rememberMe} />
      <a
        href="/forgot-password"
        class="text-sm font-semibold text-logo-saffron no-underline transition hover:text-logo-green hover:underline"
      >
        Forgot password?
      </a>
    </div>

    <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
      <Icon name="log-in" size={18} />
      <span>{$t.auth.signInBtn}</span>
    </Button>
  </form>

  {#snippet footer()}
    {$t.auth.newToCollab}
    <a href="/signup" class="font-semibold text-logo-saffron hover:text-logo-green">
      {$t.auth.createAccountLink}
    </a>
  {/snippet}
</AuthShell>
