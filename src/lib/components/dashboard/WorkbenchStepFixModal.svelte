<script lang="ts">
  import { goto } from '$app/navigation';
  import { projectsApi } from '$lib/api/projects.api';
  import { uploadsApi } from '$lib/api/uploads.api';
  import {
    addProjectMedia,
    completeStudentMilestone,
    dashboardState,
    formatMediaFileSize,
    pushToast,
    reopenStudentMilestone,
    t,
    type StudentMilestone,
  } from '$lib/stores';
  import { Button, Icon, Input, Textarea } from '$ui';

  interface Props {
    milestone: StudentMilestone | null;
    onClose: () => void;
  }

  let { milestone, onClose }: Props = $props();

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  let notes = $state('');
  let evidenceUrl = $state('');
  let evidenceFileName = $state('');
  let attestedByEmail = $state('');
  let selectedProjectId = $state('');
  let isUploading = $state(false);
  let isSaving = $state(false);
  let validationError = $state('');
  let fileInputEl = $state<HTMLInputElement | null>(null);

  const activeProjects = $derived($dashboardState.projects);
  const selectedProject = $derived(
    activeProjects.find((p) => p.id === selectedProjectId) ?? activeProjects[0] ?? null,
  );

  $effect(() => {
    if (milestone) {
      notes = milestone.notes ?? '';
      evidenceUrl = milestone.evidenceUrl ?? '';
      evidenceFileName = milestone.evidenceFileName ?? '';
      attestedByEmail = milestone.attestedByEmail ?? '';
      selectedProjectId = activeProjects[0]?.id ?? '';
      validationError = '';
    }
  });

  async function handleFileUpload(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (files.length === 0) return;

    isUploading = true;
    validationError = '';
    try {
      const uploaded = await uploadsApi.uploadFiles([files[0]!], 'projects');
      const first = uploaded[0];
      if (first) {
        evidenceUrl = first.url;
        evidenceFileName = first.originalName;
        if (selectedProject) {
          addProjectMedia(selectedProject.id, [
            {
              kind: first.kind,
              url: first.url,
              title: `Step ${milestone?.step ?? ''} — ${first.originalName}`,
              mimeType: first.contentType,
              fileSizeLabel: formatMediaFileSize(first.sizeBytes),
            },
          ]);
        }
        pushToast({
          tone: 'success',
          title: 'Media uploaded',
          message: `${first.originalName} attached to Step ${milestone?.step ?? ''}.`,
        });
      }
    } catch {
      validationError = 'Unable to upload media file. You can also paste a deliverable URL below.';
    } finally {
      isUploading = false;
    }
  }

  async function handleJumpToFix(): Promise<void> {
    if (!milestone) return;
    const action = milestone.fixActionType;
    onClose();

    if (action === 'profile_expertise') {
      await goto('/profile?tab=expertise');
      return;
    }
    if (action === 'create_project') {
      await goto('/projects/new');
      return;
    }
    if (action === 'project_media') {
      window.dispatchEvent(new CustomEvent('collab47:open-project-media'));
      return;
    }
    if (action === 'invite_mentor') {
      window.dispatchEvent(new CustomEvent('collab47:open-project-invite'));
      return;
    }
    document.getElementById('workspace-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmitFix(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!milestone) return;

    const trimmedNotes = notes.trim();
    if (trimmedNotes.length < 10) {
      validationError = 'Please enter at least 10 characters describing what you completed or fixed for this step.';
      return;
    }

    if (milestone.step === 5 && attestedByEmail.trim() && !attestedByEmail.includes('@')) {
      validationError = 'Please enter a valid Faculty PI or mentor email address.';
      return;
    }

    isSaving = true;
    validationError = '';
    try {
      // If Step 5 has a mentor/PI email and user has a persisted project, send a real invite
      if (
        milestone.step === 5 &&
        attestedByEmail.trim() &&
        selectedProject &&
        UUID_REGEX.test(selectedProject.id)
      ) {
        try {
          await projectsApi.inviteContributor(selectedProject.id, {
            email: attestedByEmail.trim(),
            teamRole: 'faculty_mentor',
            roleTitle: 'Faculty PI Attestor',
            message: `Requesting Step 5 Proof-of-Work attestation for "${selectedProject.title}". ${trimmedNotes}`,
          });
        } catch {
          // Proceed even if already invited
        }
      }

      completeStudentMilestone(milestone.id, {
        notes: trimmedNotes,
        evidenceUrl: evidenceUrl.trim() || undefined,
        evidenceFileName: evidenceFileName.trim() || undefined,
        attestedByEmail: attestedByEmail.trim() || undefined,
        projectTitle: selectedProject?.title ?? milestone.projectTitle,
      });

      pushToast({
        tone: 'success',
        title: `Step ${milestone.step} completed!`,
        message: milestone.title,
      });
      onClose();
    } finally {
      isSaving = false;
    }
  }

  function handleReopen(): void {
    if (!milestone) return;
    reopenStudentMilestone(milestone.id);
    pushToast({
      tone: 'info',
      title: `Step ${milestone.step} reopened`,
      message: 'You can now update or fix this step before completing it again.',
    });
    onClose();
  }
</script>

{#if milestone}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
    aria-labelledby="workbench-fix-title"
  >
    <div class="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#DDD6FE] bg-white shadow-2xl">
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 border-b border-[#ECEAF9] bg-[#FAF9FF] px-5 py-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase {milestone.completed
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-[#EDE9FE] text-[#6D4AFF]'}"
            >
              <Icon name={milestone.completed ? 'check-circle' : 'layers'} size={12} />
              <span>Step {milestone.step} / 5 · {milestone.completed ? $t.ui.completed : $t.ui.needsAction}</span>
            </span>
          </div>
          <h2 id="workbench-fix-title" class="mt-1.5 text-base font-extrabold text-[#1E1B4B]">
            {milestone.title}
          </h2>
          <p class="mt-0.5 text-xs text-slate-500">{milestone.description}</p>
        </div>
        <button
          type="button"
          onclick={onClose}
          aria-label="Close workbench step modal"
          class="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#C4B5FD] hover:text-[#6D4AFF]"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <!-- Body -->
      <form class="flex flex-1 flex-col gap-4 overflow-y-auto p-5" onsubmit={handleSubmitFix}>
        {#if !milestone.completed}
          <div class="flex flex-col gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
            <div class="flex items-start gap-2.5">
              <Icon name="alert-circle" size={17} class="mt-0.5 shrink-0 text-amber-600" />
              <div class="min-w-0">
                <p class="text-xs font-extrabold text-amber-950">Step not completed yet</p>
                <p class="mt-0.5 text-xs leading-relaxed text-amber-900">
                  {milestone.missingActionHint}
                </p>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/70 pt-2.5">
              <span class="text-[11px] font-medium text-amber-800">
                Want to jump directly to the workspace tool first?
              </span>
              <button
                type="button"
                onclick={handleJumpToFix}
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
              >
                <Icon name="arrow-right" size={13} />
                <span>{milestone.fixActionLabel}</span>
              </button>
            </div>
          </div>
        {:else}
          <div class="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
            <div class="flex items-center gap-2 font-semibold">
              <Icon name="check-circle" size={16} class="shrink-0 text-emerald-600" />
              <span>This step is verified and completed. You can update its notes below or reopen it.</span>
            </div>
          </div>
        {/if}

        {#if activeProjects.length > 0}
          <div class="flex flex-col gap-1.5">
            <label for="wb-step-project" class="text-xs font-bold text-[#1E1B4B]">
              {$t.forms.linkedProject}
            </label>
            <select
              id="wb-step-project"
              bind:value={selectedProjectId}
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#6D4AFF] focus:ring-2 focus:ring-[#6D4AFF]/15"
            >
              {#each activeProjects as prj (prj.id)}
                <option value={prj.id}>{prj.title}</option>
              {/each}
            </select>
          </div>
        {:else}
          <div class="flex items-center justify-between gap-2 rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] p-3 text-xs">
            <span class="text-slate-600">You haven't created a project yet.</span>
            <button
              type="button"
              onclick={() => {
                onClose();
                void goto('/projects/new');
              }}
              class="shrink-0 cursor-pointer font-bold text-[#6D4AFF] hover:underline"
            >
              + {$t.forms.createNewProject}
            </button>
          </div>
        {/if}

        <Textarea
          id="wb-step-notes"
          label={milestone.step === 4
            ? $t.forms.validationTelemetrySummary
            : milestone.step === 5
              ? $t.forms.attestationSummary
              : $t.forms.stepSummary}
          bind:value={notes}
          rows={3}
          placeholder={milestone.step === 4
            ? 'e.g., Completed 3 field flights at 12m altitude; recorded 96.4% crop-stress detection accuracy and uploaded logs...'
            : milestone.step === 5
              ? 'e.g., Summarized Steps 1–4 deliverables and requested Faculty PI review...'
              : 'Describe what you built, verified, or fixed for this workbench step...'}
          required
        />

        {#if milestone.step === 5}
          <Input
            id="wb-step-pi-email"
            type="email"
            label={$t.forms.facultyPiEmailOptional}
            icon="mail"
            bind:value={attestedByEmail}
            placeholder="prof.meera@iitb.ac.in"
          />
        {/if}

        <!-- Upload Media or Link Evidence -->
        <div class="flex flex-col gap-2 rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] p-3.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-bold text-[#1E1B4B]">Attach Proof-of-Work Media or Link</span>
            <input
              bind:this={fileInputEl}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.avif,.mp4,.webm,.mov"
              class="hidden"
              onchange={handleFileUpload}
            />
            <Button variant="outline" size="sm" loading={isUploading} onclick={() => fileInputEl?.click()}>
              <Icon name="upload" size={14} />
              <span>{isUploading ? 'Uploading...' : $t.forms.uploadMedia}</span>
            </Button>
          </div>
          <p class="text-[11px] text-slate-500">
            {$t.ui.supportedMediaFormats}
          </p>
          {#if evidenceFileName}
            <div class="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
              <span class="truncate">Attached: {evidenceFileName}</span>
              <button
                type="button"
                class="cursor-pointer text-rose-600 hover:underline"
                onclick={() => {
                  evidenceFileName = '';
                  evidenceUrl = '';
                }}
              >
                Remove
              </button>
            </div>
          {/if}
          <Input
            id="wb-step-url"
            label={$t.forms.pasteDeliverableUrlOptional}
            icon="link"
            bind:value={evidenceUrl}
            placeholder="https://github.com/your-team/project-benchmarks"
          />
        </div>

        {#if validationError}
          <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {validationError}
          </p>
        {/if}

        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {#if milestone.completed}
            <Button variant="outline" size="sm" onclick={handleReopen}>
              {$t.ui.reopenStep}
            </Button>
          {:else}
            <Button variant="ghost" size="sm" onclick={handleJumpToFix}>
              <Icon name="arrow-right" size={14} />
              <span>{milestone.fixActionLabel}</span>
            </Button>
          {/if}

          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" onclick={onClose}>{$t.ui.cancel}</Button>
            <button
              type="submit"
              disabled={isSaving}
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
            >
              <Icon name="check" size={14} />
              <span>
                {isSaving
                  ? $t.ui.saving
                  : milestone.completed
                    ? $t.ui.updateStep
                    : $t.ui.saveCompleteStep}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
{/if}
