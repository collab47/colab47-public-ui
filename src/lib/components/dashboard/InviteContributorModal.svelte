<script lang="ts">
  import { ApiError } from '$lib/api/client';
  import {
    inviteContributorToProject,
    pushToast,
    t,
    type DashboardProject,
  } from '$lib/stores';
  import { Alert, Avatar, Badge, Button, Icon, Input, Select, Textarea } from '$ui';

  interface Props {
    project: DashboardProject;
    onClose: () => void;
  }

  let { project, onClose }: Props = $props();

  let email = $state('');
  let roleTitle = $state('Contributor');
  let teamRole = $state('team_member');
  let message = $state('');
  let isSubmitting = $state(false);
  let errorMsg = $state<string | null>(null);
  let lastInviteFeedback = $state<{
    message: string;
    inviteeRegistered: boolean;
    inviteUrl: string;
  } | null>(null);

  const teamRoleOptions = [
    { value: 'team_member', label: 'Team Member' },
    { value: 'developer', label: 'Developer' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'designer', label: 'Designer' },
    { value: 'technical_lead', label: 'Technical Lead' },
    { value: 'faculty_mentor', label: 'Faculty Mentor' },
    { value: 'other', label: 'Other' },
  ];

  async function handleInvite(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    errorMsg = null;
    lastInviteFeedback = null;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      errorMsg = 'Please enter the contributor email address.';
      return;
    }

    isSubmitting = true;
    try {
      const result = await inviteContributorToProject(project.id, {
        email: cleanEmail,
        roleTitle: roleTitle.trim() || 'Contributor',
        teamRole,
        message: message.trim() || undefined,
      });

      lastInviteFeedback = {
        message: result.message,
        inviteeRegistered: result.inviteeRegistered,
        inviteUrl: result.inviteUrl,
      };
      email = '';
      message = '';

      pushToast({
        tone: 'success',
        title: result.inviteeRegistered
          ? 'Invitation sent to registered user'
          : 'Registration invite sent',
        message: result.message,
      });
    } catch (err) {
      errorMsg =
        err instanceof ApiError
          ? err.message
          : 'Could not send contributor invitation. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  async function copyInviteUrl(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      pushToast({
        tone: 'success',
        title: 'Invite link copied',
        message: 'Share this link with your contributor so they can join directly.',
      });
    } catch {
      pushToast({
        tone: 'info',
        title: 'Copy link manually',
        message: url,
      });
    }
  }

  function statusTone(status: string): 'moss' | 'saffron' | 'neutral' | 'ink' {
    if (status === 'accepted') return 'moss';
    if (status === 'pending') return 'saffron';
    return 'neutral';
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
  role="dialog"
  aria-modal="true"
  aria-label="Invite contributors to {project.title}"
>
  <div
    class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <div class="flex items-center gap-2">
          <Badge tone="saffron">Project Team</Badge>
          <span class="text-xs font-medium text-slate-500">{project.sector}</span>
        </div>
        <h2 class="mt-1 text-lg font-extrabold text-slate-900">
          Invite Contributors · {project.title}
        </h2>
        <p class="text-xs text-slate-500">
          Registered emails receive an in-app notification &amp; email with Accept/Reject buttons.
          Unregistered emails receive a registration link that adds them to this project automatically.
        </p>
      </div>
      <button
        type="button"
        onclick={onClose}
        aria-label="Close modal"
        class="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <Icon name="x" size={16} />
      </button>
    </div>

    <!-- Body -->
    <div class="flex flex-col gap-5 overflow-y-auto p-5">
      {#if errorMsg}
        <Alert tone="error" title="Could not send invitation">{errorMsg}</Alert>
      {/if}

      {#if lastInviteFeedback}
        <div class="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
          <div class="flex items-start gap-2 text-xs font-semibold text-emerald-900">
            <Icon name="check-circle" size={16} class="mt-0.5 shrink-0 text-emerald-600" />
            <span>{lastInviteFeedback.message}</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <input
              type="text"
              readonly
              value={lastInviteFeedback.inviteUrl}
              class="min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[11px] font-mono text-slate-700"
            />
            <Button
              variant="outline"
              size="sm"
              onclick={() => void copyInviteUrl(lastInviteFeedback!.inviteUrl)}
            >
              <Icon name="link" size={13} />
              <span>Copy Invite Link</span>
            </Button>
          </div>
        </div>
      {/if}

      <form class="flex flex-col gap-3.5" onsubmit={handleInvite}>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            id="invite-contrib-email"
            type="email"
            label={$t.forms.contributorEmail}
            icon="mail"
            bind:value={email}
            placeholder="teammate@college.edu"
            required
          />
          <Input
            id="invite-contrib-role-title"
            label={$t.forms.roleTitle}
            icon="award"
            bind:value={roleTitle}
            placeholder="e.g., ML Engineer, Hardware Lead"
            required
          />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            id="invite-contrib-team-role"
            label={$t.forms.teamRoleCategory}
            options={teamRoleOptions}
            bind:value={teamRole}
          />
          <div class="flex items-end">
            <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
              <Icon name="send" size={15} />
              <span>{$t.ui.sendInvitationBtn}</span>
            </Button>
          </div>
        </div>

        <Textarea
          id="invite-contrib-message"
          label={$t.forms.personalNoteOptional}
          bind:value={message}
          rows={2}
          maxlength={500}
          placeholder="Explain what they will collaborate on..."
        />
      </form>

      <!-- Active Team Members -->
      <div class="flex flex-col gap-2">
        <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          {$t.ui.activeContributors} ({project.contributors?.length ?? project.contributorsCount})
        </h3>
        {#if project.contributors && project.contributors.length > 0}
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {#each project.contributors as member (member.id)}
              <div class="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
                <div class="flex min-w-0 items-center gap-2.5">
                  <Avatar name={member.name} src={member.avatarUrl} size="sm" />
                  <div class="min-w-0">
                    <strong class="block truncate text-xs font-bold text-slate-900">
                      {member.name}
                    </strong>
                    <span class="block truncate text-[11px] text-slate-500">
                      @{member.handle} · {member.roleTitle}
                    </span>
                  </div>
                </div>
                <Badge tone={member.role === 'owner' ? 'saffron' : 'moss'}>
                  {member.role}
                </Badge>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-xs text-slate-500">You are currently the sole contributor on this project.</p>
        {/if}
      </div>

      <!-- Sent Invitations -->
      {#if project.invitations && project.invitations.length > 0}
        <div class="flex flex-col gap-2">
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Sent Invitations ({project.invitations.length})
          </h3>
          <div class="flex flex-col gap-2">
            {#each project.invitations as inv (inv.id)}
              <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-xs">
                <div class="min-w-0">
                  <strong class="block truncate font-semibold text-slate-900">
                    {inv.inviteeEmail ?? 'Invited User'}
                  </strong>
                  <span class="text-[11px] text-slate-500">
                    {inv.roleTitle} · {inv.inviteeRegistered ? 'Registered user' : 'Needs registration'}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <Badge tone={statusTone(inv.status)}>{inv.status}</Badge>
                  {#if inv.status === 'pending'}
                    <button
                      type="button"
                      onclick={() => void copyInviteUrl(inv.inviteUrl)}
                      class="cursor-pointer rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-logo-saffron hover:text-logo-saffron"
                    >
                      Copy Link
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
