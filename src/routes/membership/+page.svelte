<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError, ensureFreshSession } from '$lib/api/client';
  import {
    membershipApi,
    type CreatePaymentOrderResponse,
    type MembershipPlan,
    type UserMembershipSummary,
    type VerifyPaymentResponse,
  } from '$lib/api/membership.api';
  import IndianPaymentCheckout from '$lib/components/membership/IndianPaymentCheckout.svelte';
  import {
    authState,
    isAuthenticated,
    isPremiumMember,
    pushToast,
    t,
    updateAuthUserMembership,
  } from '$lib/stores';
  import { Alert, Badge, Button, Card, Footer, Icon, Spinner } from '$ui';

  let loading = $state(true);
  let summary = $state<UserMembershipSummary | null>(null);
  let plans = $state<MembershipPlan[]>([]);
  let billingCycle = $state<'monthly' | 'yearly'>('monthly');
  let activeOrder = $state<CreatePaymentOrderResponse | null>(null);
  let creatingOrder = $state(false);
  let cancelling = $state(false);
  let errorMessage = $state<string | null>(null);

  const premiumPlan = $derived(
    plans.find(
      (p) => p.planCode === (billingCycle === 'yearly' ? 'premium_yearly' : 'premium_monthly'),
    ),
  );

  onMount(async () => {
    const hasSession = await ensureFreshSession();
    if (!hasSession) {
      await goto('/login?next=/membership');
      return;
    }

    try {
      const [liveSummary, livePlans] = await Promise.all([
        membershipApi.getMyMembership(),
        membershipApi.listPlans(),
      ]);
      summary = liveSummary;
      plans = livePlans;
      updateAuthUserMembership({
        tier: liveSummary.tier,
        planCode: liveSummary.planCode,
        adsEnabled: liveSummary.adsEnabled,
        expiresAt: liveSummary.expiresAt,
      });
    } catch (err) {
      errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Unable to load membership details. Please ensure backend migration 002 is applied.';
    } finally {
      loading = false;
    }
  });

  async function startUpgrade(): Promise<void> {
    errorMessage = null;
    creatingOrder = true;
    try {
      activeOrder = await membershipApi.createPaymentOrder({
        planCode: billingCycle === 'yearly' ? 'premium_yearly' : 'premium_monthly',
        preferredMethod: 'upi',
      });
    } catch (err) {
      errorMessage =
        err instanceof ApiError ? err.message : 'Unable to create INR payment order.';
    } finally {
      creatingOrder = false;
    }
  }

  function handleUpgradeSuccess(result: VerifyPaymentResponse): void {
    summary = result.membership;
    activeOrder = null;
  }

  async function handleCancelPremium(): Promise<void> {
    errorMessage = null;
    cancelling = true;
    try {
      const updated = await membershipApi.cancelPremium();
      summary = updated;
      updateAuthUserMembership({
        tier: updated.tier,
        planCode: updated.planCode,
        adsEnabled: updated.adsEnabled,
        expiresAt: updated.expiresAt,
      });
      pushToast({
        tone: 'info',
        title: 'Switched to Free Membership',
        message: 'Google Ads are now enabled for your Free plan.',
      });
    } catch (err) {
      errorMessage = err instanceof ApiError ? err.message : 'Unable to cancel premium plan.';
    } finally {
      cancelling = false;
    }
  }
</script>

<svelte:head>
  <title>Membership &amp; Billing · Collab47</title>
</svelte:head>

<main class="c47-container flex-1 py-10">
  {#if !$authState.isHydrated || loading}
    <div class="flex min-h-[55vh] items-center justify-center">
      <Spinner label="Loading membership & INR receipts..." size="lg" />
    </div>
  {:else if $isAuthenticated}
    <div class="mx-auto flex max-w-4xl flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge tone={$isPremiumMember ? 'moss' : 'saffron'}>
            {$isPremiumMember ? $t.membership.noAdsBadge : $t.membership.includesAds}
          </Badge>
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

      <!-- Current Status Card -->
      <Card
        title={summary?.planName ?? ($isPremiumMember ? 'Premium Membership' : 'Free Membership')}
        subtitle={$isPremiumMember
          ? 'Google Ads are completely hidden across every page.'
          : 'Currently on Free Membership (Google Ads active). Upgrade anytime via UPI, Card, or Online Transfer.'}
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-col gap-1 text-sm text-slate-700">
            <span>
              <strong>Plan Tier:</strong>
              <span class="uppercase">{summary?.tier ?? 'free'}</span>
            </span>
            <span>
              <strong>Google Ads:</strong>
              {summary?.adsEnabled === false ? 'Disabled (100% Ad-Free)' : 'Enabled (Free Plan)'}
            </span>
            {#if summary?.expiresAt}
              <span>
                <strong>Valid Until:</strong>
                {new Date(summary.expiresAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            {/if}
          </div>

          {#if $isPremiumMember}
            <Button variant="outline" size="sm" loading={cancelling} onclick={handleCancelPremium}>
              {$t.membership.switchToFree}
            </Button>
          {:else}
            <div class="flex flex-wrap items-center gap-2.5">
              <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onclick={() => (billingCycle = 'monthly')}
                  class="cursor-pointer rounded-lg px-3 py-1 {billingCycle === 'monthly'
                    ? 'bg-logo-saffron text-white'
                    : 'text-slate-600'}"
                >
                  ₹499 / mo
                </button>
                <button
                  type="button"
                  onclick={() => (billingCycle = 'yearly')}
                  class="cursor-pointer rounded-lg px-3 py-1 {billingCycle === 'yearly'
                    ? 'bg-logo-green text-white'
                    : 'text-slate-600'}"
                >
                  ₹4,999 / yr
                </button>
              </div>
              <Button variant="primary" loading={creatingOrder} onclick={startUpgrade}>
                <Icon name="sparkles" size={16} />
                <span>{$t.membership.upgradeToPremium} (₹{premiumPlan?.amountInr ?? (billingCycle === 'yearly' ? 4999 : 499)})</span>
              </Button>
            </div>
          {/if}
        </div>
      </Card>

      {#if activeOrder}
        <IndianPaymentCheckout
          order={activeOrder}
          onSuccess={handleUpgradeSuccess}
          onCancel={() => (activeOrder = null)}
        />
      {/if}

      <!-- INR Payment Receipts History -->
      <Card
        title={$t.membership.paymentHistoryTitle}
        subtitle={$t.membership.paymentHistorySubtitle}
      >
        {#if !summary?.recentPayments || summary.recentPayments.length === 0}
          <p class="text-sm text-slate-500">{$t.membership.noPaymentsYet}</p>
        {:else}
          <div class="flex flex-col gap-3">
            {#each summary.recentPayments as tx (tx.id)}
              <div
                class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-2">
                    <strong class="text-slate-900">{tx.receiptNumber}</strong>
                    <Badge tone={tx.status === 'captured' ? 'moss' : tx.status === 'failed' ? 'ember' : 'saffron'}>
                      {tx.status}
                    </Badge>
                    {#if tx.paymentMethod}
                      <Badge tone="neutral">{tx.paymentMethod.replace('_', ' ').toUpperCase()}</Badge>
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
