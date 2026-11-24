<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ApiError } from '$lib/api/client';
  import { projectsApi, type PublicInvitationPreview } from '$lib/api/projects.api';
  import { getDashboardPath } from '$lib/dashboards/role-dashboards';
  import {
    authState,
    isAuthenticated,
    pushToast,
    respondToProjectInvitation,
  } from '$lib/stores';
  import { Alert, Badge, Button, Card, Icon, Spinner } from '$ui';

  let invitation = $state<PublicInvitationPreview | null>(null);
  let loading = $state(true);
  let errorMsg = $state<string | null>(null);
  let responding = $state<'accept' | 'reject' | null>(null);

  const token = $derived($page.params.token ?? '');

  onMount(async () => {
    if (!token) {
      errorMsg = 'Missing invitation token.';
      loading = false;
      return;
    }
    try {
      invitation = await projectsApi.getInvitationByToken(token);
    } catch (err) {
      errorMsg =
        err instanceof ApiError
          ? err.message
          : 'This invitation link is invalid or has expired.';
    } finally {
      loading = false;
    }
  });

  async function handleRespond(action: 'accept' | 'reject'): Promise<void> {
    if (!invitation) return;
    responding = action;
    errorMsg = null;
    try {
      const res = await respondToProjectInvitation(invitation.id, action);
      invitation = { ...invitation, status: res.status };
      pushToast({
        tone: action === 'accept' ? 'success' : 'info',
        title: action === 'accept' ? 'Invitation accepted!' : 'Invitation declined',
        message:
          action === 'accept'
            ? `You are now a contributor on "${res.projectTitle}".`
            : `You declined the invitation to "${res.projectTitle}".`,
      });
      if (action === 'accept') {
        const role = authState.get().user?.accountType ?? 'student';
        await goto(getDashboardPath(role));
      }
    } catch (err) {
      errorMsg =
        err instanceof ApiError
          ? err.message
          : 'Unable to update this invitation. Make sure you are signed in with the invited email.';
    } finally {
      responding = null;
    }
  }
</script>

<svelte:head>
  <title>Project Invitation · Collab47</title>
</svelte:head>

<main class="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-4 py-10">
  {#if loading}
    <div class="flex justify-center py-12">
      <Spinner label="Loading project invitation..." size="lg" />
    </div>
  {:else if errorMsg && !invitation}
    <Alert tone="error" title="Invitation unavailable">{errorMsg}</Alert>
  {:else if invitation}
    <Card elevated padding="lg">
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <Badge tone="saffron">Project Contributor Invitation</Badge>
          <Badge tone={invitation.status === 'accepted' ? 'moss' : 'neutral'}>
            {invitation.status}
          </Badge>
        </div>

        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">{invitation.projectTitle}</h1>
          <p class="mt-1 text-sm text-slate-600">
            <strong>{invitation.inviterName}</strong> (@{invitation.inviterHandle}) invited
            <strong>{invitation.inviteeEmail ?? 'you'}</strong> to join as
            <strong>{invitation.roleTitle}</strong>.
          </p>
        </div>

        {#if invitation.projectBrief}
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <span class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {invitation.projectSector}
            </span>
            <p>{invitation.projectBrief}</p>
          </div>
        {/if}

        {#if invitation.message}
          <blockquote class="rounded-xl border-l-4 border-logo-saffron bg-logo-saffron-soft/40 px-4 py-3 text-sm italic text-slate-700">
            "{invitation.message}"
          </blockquote>
        {/if}

        {#if errorMsg}
          <Alert tone="error" title="Action failed">{errorMsg}</Alert>
        {/if}

        {#if invitation.status !== 'pending'}
          <Alert
            tone={invitation.status === 'accepted' ? 'success' : 'info'}
            title="Invitation {invitation.status}"
          >
            {invitation.status === 'accepted'
              ? 'This invitation has already been accepted and the project is in your dashboard.'
              : `This invitation is currently marked as ${invitation.status}.`}
          </Alert>
          <div class="flex justify-end">
            <Button variant="primary" href="/dashboard">Go to Dashboard</Button>
          </div>
        {:else if $isAuthenticated}
          <div class="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              loading={responding === 'reject'}
              disabled={responding !== null}
              onclick={() => void handleRespond('reject')}
            >
              <Icon name="x" size={15} />
              <span>Reject Invitation</span>
            </Button>
            <Button
              variant="primary"
              loading={responding === 'accept'}
              disabled={responding !== null}
              onclick={() => void handleRespond('accept')}
            >
              <Icon name="check" size={15} />
              <span>Accept &amp; Join Project</span>
            </Button>
          </div>
        {:else if invitation.inviteeRegistered}
          <div class="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
            <p class="text-sm font-medium text-blue-950">
              An account already exists for <strong>{invitation.inviteeEmail}</strong>. Sign in to
              accept or reject this project invitation.
            </p>
            <div class="flex flex-wrap gap-2">
              <Button
                variant="primary"
                href={`/login?next=${encodeURIComponent(`/invitations/${token}`)}`}
              >
                <Icon name="user" size={15} />
                <span>Sign In to Accept / Reject</span>
              </Button>
            </div>
          </div>
        {:else}
          <div class="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p class="text-sm font-medium text-emerald-950">
              Create your Collab47 account with <strong>{invitation.inviteeEmail}</strong> and you
              will automatically be added to <strong>{invitation.projectTitle}</strong>.
            </p>
            <div class="flex flex-wrap gap-2">
              <Button
                variant="primary"
                href={`/signup?invite=${encodeURIComponent(token)}${invitation.inviteeEmail ? `&email=${encodeURIComponent(invitation.inviteeEmail)}` : ''}`}
              >
                <Icon name="rocket" size={15} />
                <span>Register &amp; Join Project</span>
              </Button>
              <Button
                variant="outline"
                href={`/login?next=${encodeURIComponent(`/invitations/${token}`)}`}
              >
                <span>Already have an account? Sign In</span>
              </Button>
            </div>
          </div>
        {/if}
      </div>
    </Card>
  {/if}
</main>
