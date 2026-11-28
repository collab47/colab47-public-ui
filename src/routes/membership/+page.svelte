<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, ensureFreshSession } from '$lib/api/client';
  import {
    membershipApi,
    type BillingSummaryResponse,
    type CreatePaymentOrderResponse,
    type VerifyPaymentResponse,
  } from '$lib/api/membership.api';
  import IndianPaymentCheckout from '$lib/components/membership/IndianPaymentCheckout.svelte';
  import { authState, isAuthenticated, pushToast, t } from '$lib/stores';
  import { Alert, Badge, Button, Card, Footer, Icon, Spinner } from '$ui';

  let loading = $state(true);
  let billing = $state<BillingSummaryResponse | null>(null);
  let activeOrder = $state<CreatePaymentOrderResponse | null>(null);
  let creatingOrder = $state(false);
  let errorMessage = $state<string | null>(null);

  const quota = $derived(billing?.quota ?? null);
  const freeUsagePercent = $derived.by(() => {
    if (!quota || quota.freeProjectLimit <= 0) return 100;
    return Math.min(100, Math.round((quota.freeProjectsUsed / quota.freeProjectLimit) * 100));
  });

  async function loadBilling(): Promise<void> {
    errorMessage = null;
    try {
      billing = await membershipApi.getBillingSummary();
    } catch (err) {
      errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Unable to load billing details and payment receipts.';
    }
  }

  onMount(async () => {
    const hasSession = await ensureFreshSession();
    if (!hasSession) {
      await goto('/login?next=/membership');
      return;
    }

    await loadBilling();
    loading = false;
  });

  async function startBuyProjectCredit(): Promise<void> {
    errorMessage = null;
    creatingOrder = true;
    try {
      activeOrder = await membershipApi.createProjectPostOrder({ preferredMethod: 'upi' });
    } catch (err) {
      errorMessage =
        err instanceof ApiError ? err.message : 'Unable to create INR payment order.';
    } finally {
      creatingOrder = false;
    }
  }

  async function handlePaymentSuccess(_result: VerifyPaymentResponse): Promise<void> {
    activeOrder = null;
    await loadBilling();
    pushToast({
      tone: 'success',
      title: 'Project Credit Added',
      message: 'Your payment receipt has been recorded and 1 project posting credit is ready.',
    });
  }
</script>

<svelte:head>
  <title>Billing &amp; Receipts · Collab47</title>
</svelte:head>

<main class="c47-container flex-1 py-10">
  {#if !$authState.isHydrated || loading}
    <div class="flex min-h-[55vh] items-center justify-center">
      <Spinner label="Loading billing quota & INR receipts..." size="lg" />
    </div>
  {:else if $isAuthenticated}
    <div class="mx-auto flex max-w-4xl flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge tone="saffron">Pay-Per-Project · No Subscriptions</Badge>
          <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-logo-saffron">
            {$t.membership.billingTitle}
          </h1>
          <p class="mt-1 text-sm font-medium text-logo-green">
            {$t.membership.billingSubtitle}
          </p>
        </div>
        <Button variant="outline" href="/dashboard">
          <Icon name="arrow-left" size={16} />
          <span>{$t.membership.backToDashboard}</span>
        </Button>
      </div>

      {#if errorMessage}
        <Alert tone="error" title="Billing Error">{errorMessage}</Alert>
      {/if}

      <!-- Project Posting Quota & Pricing Card -->
      {#if quota}
        <Card
          title="Project Posting Quota &amp; Pricing"
          subtitle="Everyone gets {quota.freeProjectLimit} free projects. From project #{quota.freeProjectLimit + 1} onwards, each project post is ₹{quota.pricePerProjectInr}."
        >
          <div class="flex flex-col gap-5">
            <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-4">
              <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span class="text-xs font-semibold text-slate-500">Free Projects Used</span>
                <strong class="mt-1 block text-2xl font-extrabold text-slate-900">
                  {quota.freeProjectsUsed} / {quota.freeProjectLimit}
                </strong>
                <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    class="h-full rounded-full bg-logo-saffron transition-all"
                    style="width: {freeUsagePercent}%;"
                  ></div>
                </div>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span class="text-xs font-semibold text-slate-500">Total Projects Posted</span>
                <strong class="mt-1 block text-2xl font-extrabold text-slate-900">
                  {quota.authoredProjectsCount}
                </strong>
                <span class="mt-1 block text-[11px] text-slate-500">Authored by you</span>
              </div>

              <div class="rounded-xl border border-logo-green-border bg-logo-green-soft/50 p-3.5">
                <span class="text-xs font-semibold text-logo-green">Paid Credits Ready</span>
                <strong class="mt-1 block text-2xl font-extrabold text-logo-green">
                  {quota.availablePaidSlots}
                </strong>
                <span class="mt-1 block text-[11px] text-logo-green">
                  {quota.totalPaidSlotsPurchased} purchased total
                </span>
              </div>

              <div class="rounded-xl border border-logo-saffron-border bg-logo-saffron-soft/50 p-3.5">
                <span class="text-xs font-semibold text-logo-saffron">Price (3rd+ Project)</span>
                <strong class="mt-1 block text-2xl font-extrabold text-logo-saffron">
                  ₹{quota.pricePerProjectInr}
                </strong>
                <span class="mt-1 block text-[11px] text-slate-600">One-time per project</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div class="text-sm text-slate-700">
                {#if quota.freeProjectsRemaining > 0}
                  You have <strong>{quota.freeProjectsRemaining}</strong> free project
                  {quota.freeProjectsRemaining === 1 ? 'post' : 'posts'} remaining.
                {:else if quota.availablePaidSlots > 0}
                  You have <strong>{quota.availablePaidSlots}</strong> unused paid project
                  {quota.availablePaidSlots === 1 ? 'credit' : 'credits'} ready to use.
                {:else}
                  Your {quota.freeProjectLimit} free projects are used. Buy a credit now or pay when
                  posting your next project.
                {/if}
              </div>

              <div class="flex flex-wrap items-center gap-2.5">
                <Button variant="outline" href="/projects/new">
                  <Icon name="plus" size={16} />
                  <span>Post a Project</span>
                </Button>
                <Button
                  variant="primary"
                  loading={creatingOrder}
                  onclick={startBuyProjectCredit}
                >
                  <Icon name="shield-check" size={16} />
                  <span>Buy Project Credit (₹{quota.pricePerProjectInr})</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      {/if}

      {#if activeOrder}
        <IndianPaymentCheckout
          order={activeOrder}
          onSuccess={handlePaymentSuccess}
          onCancel={() => (activeOrder = null)}
        />
      {/if}

      <!-- INR Payment Receipts History -->
      <Card
        title={$t.membership.paymentHistoryTitle}
        subtitle={$t.membership.paymentHistorySubtitle}
      >
        {#if !billing?.recentPayments || billing.recentPayments.length === 0}
          <p class="text-sm text-slate-500">{$t.membership.noPaymentsYet}</p>
        {:else}
          <div class="flex flex-col gap-3">
            {#each billing.recentPayments as tx (tx.id)}
              <div
                class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <div class="flex flex-col gap-0.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <strong class="text-slate-900">{tx.receiptNumber}</strong>
                    <Badge tone={tx.status === 'captured' ? 'moss' : tx.status === 'failed' ? 'ember' : 'saffron'}>
                      {tx.status}
                    </Badge>
                    {#if tx.paymentMethod}
                      <Badge tone="neutral">{tx.paymentMethod.replace('_', ' ').toUpperCase()}</Badge>
                    {/if}
                    {#if tx.purpose === 'project_post'}
                      <Badge tone={tx.projectId ? 'neutral' : 'moss'}>
                        {tx.projectTitle
                          ? `Used on: ${tx.projectTitle}`
                          : tx.status === 'captured'
                            ? 'Unused Project Credit'
                            : 'Project Credit'}
                      </Badge>
                    {/if}
                  </div>
                  <span class="text-xs text-slate-500">
                    Order: {tx.gatewayOrderId} · {new Date(tx.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <strong class="text-base font-extrabold text-logo-saffron">₹{tx.amountInr}</strong>
              </div>
            {/each}
          </div>
        {/if}
      </Card>
    </div>
  {/if}
</main>

<Footer />
