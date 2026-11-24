<script lang="ts">
  import { authApi } from '$lib/api/auth.api';
  import { ApiError } from '$lib/api/client';
  import { pushToast } from '$lib/stores';
  import { validateEmail } from '$lib/validation/auth.validation';
  import { Alert, AuthShell, Button, Icon, Input } from '$ui';

  let email = $state('');
  let touched = $state(false);
  let fieldError = $state<string | undefined>(undefined);
  let formError = $state<string | null>(null);
  let isSubmitting = $state(false);
  let submittedEmail = $state<string | null>(null);
  let successMessage = $state<string | null>(null);

  function handleEmailInput(val: string): void {
    touched = true;
    formError = null;
    fieldError = validateEmail(val);
  }

  async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    touched = true;
    formError = null;
    fieldError = validateEmail(email);

    if (fieldError) {
      return;
    }

    isSubmitting = true;
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await authApi.forgotPassword(normalizedEmail);
      submittedEmail = normalizedEmail;
      successMessage =
        res.message ||
        'If an account exists with this email address, a password reset link has been sent.';
      pushToast({
        tone: 'success',
        title: 'Reset Link Sent',
        message: 'Check your inbox for the Collab47 password reset email.',
      });
    } catch (err) {
      formError =
        err instanceof ApiError
          ? err.message
          : 'Unable to send password reset email right now. Please try again shortly.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Forgot Password · Collab47</title>
</svelte:head>

<AuthShell
  title="Forgot your password?"
  subtitle="Enter your registered email and we will send you a secure 1-hour reset link."
  heroTagline="Secure Recovery for Your Proof of Work."
>
  {#if submittedEmail && successMessage}
    <div class="flex flex-col gap-4">
      <Alert tone="success" title="Check your email inbox">
        {successMessage}
      </Alert>

      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p class="font-semibold text-slate-900">Sent to {submittedEmail}</p>
        <p class="mt-1 text-xs leading-relaxed text-slate-500">
          The single-use reset link expires in 60 minutes. If you do not see the email, check your
          Spam or Promotions folder.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        fullWidth
        onclick={() => {
          submittedEmail = null;
          successMessage = null;
        }}
      >
        <Icon name="mail" size={16} />
        <span>Try another email address</span>
      </Button>

      <Button variant="primary" size="lg" fullWidth href="/login">
        <Icon name="arrow-left" size={16} />
        <span>Back to Sign In</span>
      </Button>
    </div>
  {:else}
    <form class="flex flex-col gap-4" onsubmit={handleSubmit} novalidate>
      {#if formError}
        <Alert tone="error" title="Request failed">{formError}</Alert>
      {/if}

      <Input
        id="forgot-email"
        label="Email Address"
        type="email"
        icon="mail"
        bind:value={email}
        placeholder="ananya.sharma@iitb.ac.in"
        autocomplete="email"
        required
        error={touched ? fieldError : undefined}
        oninput={handleEmailInput}
        onblur={() => {
          touched = true;
          fieldError = validateEmail(email);
        }}
      />

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        <Icon name="mail" size={18} />
        <span>Send Reset Link</span>
      </Button>
    </form>
  {/if}

  {#snippet footer()}
    Remembered your password?
    <a href="/login" class="font-semibold text-logo-saffron hover:text-logo-green">
      Sign in here
    </a>
  {/snippet}
</AuthShell>
