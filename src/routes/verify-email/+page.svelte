<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { authApi } from '$lib/api/auth.api';
  import { ApiError } from '$lib/api/client';
  import { isAuthenticated, pushToast, t, updateAuthUser } from '$lib/stores';
  import { validateEmail } from '$lib/validation/auth.validation';
  import { Alert, Button, Card, Footer, Icon, Input, Spinner } from '$ui';

  let status = $state<'verifying' | 'pending' | 'success' | 'error'>('verifying');
  let message = $state('Verifying your email address...');
  let resendEmail = $state('');
  let resendError = $state<string | undefined>(undefined);
  let resending = $state(false);
  let resentNotice = $state<string | null>(null);

  onMount(async () => {
    const token = $page.url.searchParams.get('token')?.trim();
    const emailParam = $page.url.searchParams.get('email')?.trim() ?? '';
    if (emailParam) {
      resendEmail = emailParam;
    }

    if (!token) {
      if (emailParam) {
        status = 'pending';
        message = `We sent a branded verification email to ${emailParam}. Open it and click "Verify Email Address" to activate your account.`;
      } else {
        status = 'error';
        message = 'Verification token is missing from the link.';
      }
      return;
    }

    try {
      const res = await authApi.verifyEmail(token);
      status = 'success';
      message = res.message || 'Your email address has been verified.';
      if ($isAuthenticated) {
        updateAuthUser({ isEmailVerified: true });
      }
    } catch (err) {
      status = 'error';
      message =
        err instanceof ApiError
          ? err.message
          : 'Unable to verify email link. It may have expired.';
    }
  });

  async function handleResend(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    resentNotice = null;
    resendError = validateEmail(resendEmail);
    if (resendError) return;

    resending = true;
    try {
      const res = await authApi.resendVerification(resendEmail.trim().toLowerCase());
      resentNotice = res.message;
      pushToast({
        tone: 'success',
        title: 'Verification Email Sent',
        message: 'Check your inbox for a fresh verification link.',
      });
    } catch (err) {
      resendError =
        err instanceof ApiError ? err.message : 'Unable to resend verification email right now.';
    } finally {
      resending = false;
    }
  }
</script>

<svelte:head>
  <title>{$t.verifyEmail.pageTitle} · Collab47</title>
</svelte:head>

<main class="c47-container flex flex-1 items-center justify-center py-16">
  <div class="w-full max-w-md">
    <Card padding="lg" elevated>
      <div class="flex flex-col items-center gap-4 text-center">
        {#if status === 'verifying'}
          <Spinner label={$t.verifyEmail.verifying} size="lg" />
        {:else if status === 'success'}
          <span class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-logo-green-soft text-logo-green">
            <Icon name="check-circle" size={26} />
          </span>
          <h1 class="text-2xl font-extrabold text-logo-saffron">{$t.verifyEmail.verifiedTitle}</h1>
          <p class="text-sm text-logo-green">{message}</p>
          <Button variant="primary" fullWidth href={$isAuthenticated ? '/dashboard' : '/login'}>
            <span>{$isAuthenticated ? $t.verifyEmail.goToDashboard : $t.verifyEmail.signInToContinue}</span>
            <Icon name="arrow-right" size={16} />
          </Button>
        {:else}
          {#if status === 'pending'}
            <span class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-logo-saffron-soft text-logo-saffron">
              <Icon name="mail" size={24} />
            </span>
            <h1 class="text-2xl font-extrabold text-logo-saffron">Check your inbox</h1>
            <p class="text-sm text-slate-600">{message}</p>
          {:else}
            <Alert tone="error" title={$t.verifyEmail.failedTitle}>{message}</Alert>
          {/if}

          {#if resentNotice}
            <Alert tone="success" title="Email sent">{resentNotice}</Alert>
          {/if}

          <form class="mt-2 flex w-full flex-col gap-3 text-left" onsubmit={handleResend} novalidate>
            <Input
              id="resend-verify-email"
              label="Resend verification email"
              type="email"
              icon="mail"
              bind:value={resendEmail}
              placeholder="ananya.sharma@iitb.ac.in"
              error={resendError}
              oninput={() => {
                resendError = undefined;
              }}
            />
            <Button type="submit" variant="primary" fullWidth loading={resending}>
              <Icon name="mail" size={16} />
              <span>Resend Verification Link</span>
            </Button>
          </form>

          <Button variant="outline" fullWidth href="/login">{$t.verifyEmail.backToSignIn}</Button>
        {/if}
      </div>
    </Card>
  </div>
</main>

<Footer />
