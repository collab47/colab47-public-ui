<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ApiError, ensureFreshSession } from '$lib/api/client';
  import {
    membershipApi,
    type CreatePaymentOrderResponse,
    type ProjectPostingQuota,
    type VerifyPaymentResponse,
  } from '$lib/api/membership.api';
  import { projectsApi } from '$lib/api/projects.api';
  import IndianPaymentCheckout from '$lib/components/membership/IndianPaymentCheckout.svelte';
  import ProjectEditorForm from '$lib/components/projects/ProjectEditorForm.svelte';
  import { authState, pushToast, t } from '$lib/stores';
  import { Alert, Badge, Button, Card, Icon, Spinner } from '$ui';

  let ready = $state(false);
  let loadingQuota = $state(true);
  let quota = $state<ProjectPostingQuota | null>(null);
  let quotaError = $state<string | null>(null);
  let activeOrder = $state<CreatePaymentOrderResponse | null>(null);
  let creatingOrder = $state(false);

  async function refreshQuota(): Promise<void> {
    loadingQuota = true;
    quotaError = null;
    try {
      quota = await projectsApi.getPostingQuota();
    } catch (err) {
      quotaError =
        err instanceof ApiError
          ? err.message
          : 'Unable to check your project posting quota. Please try again.';
    } finally {
      loadingQuota = false;
    }
  }

  onMount(async () => {
    const ok = await ensureFreshSession();
    if (!ok || !authState.get().accessToken) {
      await goto('/login?next=/projects/new');
      return;
    }
    ready = true;
    await refreshQuota();
  });

  async function startProjectSlotPayment(): Promise<void> {
    quotaError = null;
    creatingOrder = true;
    try {
      activeOrder = await membershipApi.createProjectPostOrder({ preferredMethod: 'upi' });
    } catch (err) {
      quotaError =
        err instanceof ApiError
          ? err.message
          : 'Unable to start INR payment checkout. Please try again.';
    } finally {
      creatingOrder = false;
    }
  }

  async function handlePaymentSuccess(result: VerifyPaymentResponse): Promise<void> {
    activeOrder = null;
    if (result.quota) {
      quota = result.quota;
    } else {
      await refreshQuota();
    }
    pushToast({
      tone: 'success',
      title: 'Project Form Unlocked!',
      message: 'Your payment is verified. You can now create and publish your project.',
    });
  }
</script>

<svelte:head>
  <title>{$t.forms.createNewProject} · Collab47</title>
</svelte:head>

{#if !ready || loadingQuota}
  <div class="flex min-h-[60vh] flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <p class="text-sm font-medium text-slate-600">Checking your project posting eligibility...</p>
  </div>
{:else if quota && quota.requiresPaymentForNextProject}
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <Badge tone="saffron">Pay-Per-Project Posting</Badge>
        <h1 class="mt-2 text-2xl font-extrabold tracking-tight text-[#1E1B4B] sm:text-3xl">
          Unlock Project #{quota.nextProjectNumber}
        </h1>
        <p class="mt-1 text-sm text-slate-600">
          Every member gets <strong>{quota.freeProjectLimit} free projects</strong>. From the
          {quota.freeProjectLimit + 1}rd project onwards, a one-time fee of
          <strong>₹{quota.pricePerProjectInr}</strong> per project applies.
        </p>
      </div>
      <Button variant="outline" href="/projects">
        <Icon name="arrow-left" size={16} />
        <span>Back to Projects</span>
      </Button>
    </div>

    {#if quotaError}
      <Alert tone="error" title="Payment Error">{quotaError}</Alert>
    {/if}

    <Card
      title="Free Project Quota Used ({quota.freeProjectsUsed} / {quota.freeProjectLimit})"
      subtitle="Pay ₹{quota.pricePerProjectInr} once to unlock the project creation form for your next project."
      elevated
      class="border-[#DDD6FE]"
    >
      <div class="flex flex-col gap-5">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] p-3.5">
            <span class="text-xs font-semibold text-slate-500">Free Projects Used</span>
            <strong class="mt-1 block text-xl font-extrabold text-[#1E1B4B]">
              {quota.freeProjectsUsed} / {quota.freeProjectLimit}
            </strong>
          </div>
          <div class="rounded-xl border border-[#E8EAF6] bg-[#FAF9FF] p-3.5">
            <span class="text-xs font-semibold text-slate-500">Paid Credits Ready</span>
            <strong class="mt-1 block text-xl font-extrabold text-logo-green">
              {quota.availablePaidSlots}
            </strong>
          </div>
          <div class="rounded-xl border border-logo-saffron-border bg-logo-saffron-soft/45 p-3.5">
            <span class="text-xs font-semibold text-logo-saffron">Fee for Project #{quota.nextProjectNumber}</span>
            <strong class="mt-1 block text-xl font-extrabold text-logo-saffron">
              ₹{quota.pricePerProjectInr}
            </strong>
          </div>
        </div>

        {#if !activeOrder}
          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div class="flex flex-col gap-0.5 text-xs text-slate-600">
              <span>Supports UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Card &amp; NetBanking</span>
              <span>
                Need receipts?
                <a href="/membership" class="font-semibold text-[#6D4AFF] hover:underline">
                  View Billing &amp; Receipts
                </a>
              </span>
            </div>
            <Button
              variant="primary"
              size="lg"
              loading={creatingOrder}
              onclick={startProjectSlotPayment}
            >
              <Icon name="shield-check" size={17} />
              <span>Pay ₹{quota.pricePerProjectInr} &amp; Unlock Project Form</span>
            </Button>
          </div>
        {/if}
      </div>
    </Card>

    {#if activeOrder}
      <IndianPaymentCheckout
        order={activeOrder}
        onSuccess={handlePaymentSuccess}
        onCancel={() => (activeOrder = null)}
      />
    {/if}
  </div>
{:else}
  {#if quotaError}
    <div class="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
      <Alert tone="warning" title="Quota check notice">
        {quotaError}
      </Alert>
    </div>
  {:else if quota}
    <div class="mx-auto max-w-5xl px-4 pt-5 sm:px-6 lg:px-8">
      <div
        class="flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold {quota.freeProjectsRemaining > 0
          ? 'border-[#DDD6FE] bg-[#F5F3FF] text-[#2E1065]'
          : 'border-logo-green-border bg-logo-green-soft/60 text-logo-green'}"
      >
        <div class="flex items-center gap-2">
          <Icon
            name={quota.freeProjectsRemaining > 0 ? 'sparkles' : 'check-circle'}
            size={15}
            class={quota.freeProjectsRemaining > 0 ? 'text-[#7C3AED]' : 'text-logo-green'}
          />
          {#if quota.freeProjectsRemaining > 0}
            <span>
              Free Project {quota.freeProjectsUsed + 1} of {quota.freeProjectLimit} ·
              {quota.freeProjectsRemaining === 1
                ? `Last free project (₹${quota.pricePerProjectInr}/project from 3rd onwards)`
                : `${quota.freeProjectsRemaining} free projects left (₹${quota.pricePerProjectInr}/project from 3rd onwards)`}
            </span>
          {:else}
            <span>
              Paid Project Credit Unlocked ({quota.availablePaidSlots} credit{quota.availablePaidSlots === 1 ? '' : 's'} ready) — You can publish Project #{quota.nextProjectNumber} now.
            </span>
          {/if}
        </div>
        <a
          href="/membership"
          class="font-bold underline-offset-2 hover:underline {quota.freeProjectsRemaining > 0
            ? 'text-[#6D4AFF]'
            : 'text-logo-green'}"
        >
          Billing &amp; Receipts
        </a>
      </div>
    </div>
  {/if}
  <ProjectEditorForm mode="create" />
{/if}
