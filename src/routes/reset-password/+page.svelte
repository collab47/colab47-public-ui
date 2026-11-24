<script lang="ts">
  import { page } from '$app/stores';
  import { authApi } from '$lib/api/auth.api';
  import { ApiError } from '$lib/api/client';
  import { pushToast } from '$lib/stores';
  import {
    validateConfirmPassword,
    validateRegisterPassword,
  } from '$lib/validation/auth.validation';
  import { Alert, AuthShell, Button, Icon, PasswordInput } from '$ui';

  const token = $derived($page.url.searchParams.get('token')?.trim() ?? '');

  let newPassword = $state('');
  let confirmPassword = $state('');
  let touched = $state({ newPassword: false, confirmPassword: false });
  let fieldErrors = $state<{ newPassword?: string; confirmPassword?: string }>({});
  let formError = $state<string | null>(null);
  let isSubmitting = $state(false);
  let resetSuccess = $state(false);
  let successMessage = $state('');

  function validateField(field: 'newPassword' | 'confirmPassword'): string | undefined {
    const next = { ...fieldErrors };
    const message =
      field === 'newPassword'
        ? validateRegisterPassword(newPassword)
        : validateConfirmPassword(newPassword, confirmPassword);
    if (message) {
      next[field] = message;
    } else {
      delete next[field];
    }
    fieldErrors = next;
    return message;
  }

  async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    formError = null;
    touched = { newPassword: true, confirmPassword: true };

    if (!token) {
      formError = 'Reset token is missing from the link. Please request a new password reset email.';
      return;
    }

    const pErr = validateField('newPassword');
    const cErr = validateField('confirmPassword');
    if (pErr || cErr) {
      return;
    }

    isSubmitting = true;
    try {
      const res = await authApi.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });
      resetSuccess = true;
      successMessage =
        res.message || 'Your password has been updated. You can now sign in with your new password.';
      pushToast({
        tone: 'success',
        title: 'Password Reset Complete',
        message: 'You can now sign in with your new password.',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        formError = err.message;
        fieldErrors = {
          newPassword: err.fieldErrors.newPassword,
          confirmPassword: err.fieldErrors.confirmPassword,
        };
      } else {
        formError = 'Unable to reset password right now. Please try again.';
      }
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Reset Password · Collab47</title>
</svelte:head>

<AuthShell
  title="Set a new password"
  subtitle="Choose a strong password to protect your Collab47 account."
  heroTagline="Fresh Credentials, Same Verified Portfolio."
>
  {#if resetSuccess}
    <div class="flex flex-col gap-4">
      <Alert tone="success" title="Password updated">
        {successMessage}
      </Alert>

      <Button variant="primary" size="lg" fullWidth href="/login">
        <Icon name="log-in" size={18} />
        <span>Sign In with New Password</span>
      </Button>
    </div>
  {:else if !token}
    <div class="flex flex-col gap-4">
      <Alert tone="error" title="Invalid reset link">
        This password reset link is missing a valid security token. Please request a fresh link.
      </Alert>

      <Button variant="primary" size="lg" fullWidth href="/forgot-password">
        <Icon name="mail" size={18} />
        <span>Request New Reset Link</span>
      </Button>
    </div>
  {:else}
    <form class="flex flex-col gap-4" onsubmit={handleSubmit} novalidate>
      {#if formError}
        <Alert tone="error" title="Password reset failed">{formError}</Alert>
      {/if}

      <PasswordInput
        id="reset-new-password"
        label="New Password"
        bind:value={newPassword}
        placeholder="Min 8 chars, uppercase, number & symbol"
        autocomplete="new-password"
        showStrengthMeter
        required
        error={touched.newPassword || fieldErrors.newPassword ? fieldErrors.newPassword : undefined}
        oninput={(val) => {
          newPassword = val;
          touched = { ...touched, newPassword: true };
          formError = null;
          validateField('newPassword');
          if (touched.confirmPassword) validateField('confirmPassword');
        }}
        onblur={() => {
          touched = { ...touched, newPassword: true };
          validateField('newPassword');
        }}
      />

      <PasswordInput
        id="reset-confirm-password"
        label="Confirm New Password"
        bind:value={confirmPassword}
        placeholder="Re-enter your new password"
        autocomplete="new-password"
        required
        error={touched.confirmPassword || fieldErrors.confirmPassword
          ? fieldErrors.confirmPassword
          : undefined}
        oninput={(val) => {
          confirmPassword = val;
          touched = { ...touched, confirmPassword: true };
          formError = null;
          validateField('confirmPassword');
        }}
        onblur={() => {
          touched = { ...touched, confirmPassword: true };
          validateField('confirmPassword');
        }}
      />

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        <Icon name="shield-check" size={18} />
        <span>Update Password</span>
      </Button>
    </form>
  {/if}

  {#snippet footer()}
    Need a new reset link?
    <a href="/forgot-password" class="font-semibold text-logo-saffron hover:text-logo-green">
      Request another email
    </a>
  {/snippet}
</AuthShell>
