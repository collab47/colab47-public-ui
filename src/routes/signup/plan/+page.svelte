<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ApiError } from '$lib/api/client';
  import {
    membershipApi,
    type CreatePaymentOrderResponse,
    type MembershipPlan,
    type VerifyPaymentResponse,
  } from '$lib/api/membership.api';
  import IndianPaymentCheckout from '$lib/components/membership/IndianPaymentCheckout.svelte';
  import { authState, isAuthenticated, pushToast, t, updateAuthUserMembership } from '$lib/stores';
  import { Alert, Badge, Button, Card, Footer, Icon, Spinner } from '$ui';

  const FALLBACK_PLANS: MembershipPlan[] = [
    {
      id: 'fallback-free',
      planCode: 'free',
      tier: 'free',
      name: 'Free Membership',
      description: 'Start building your verified proof-of-work identity at zero cost. Supported by Google Ads.',
      billingCycle: 'forever',
      amountPaise: 0,
      amountInr: 0,
      currency: 'INR',
      adsEnabled: true,
      features: [
        'Full 5-section progressive profile & @handle portfolio',
        'Role-based workspace dashboard & community feed',
        'Publish up to 5 active living workbench projects',
        'Discover internships, grants & hackathons',
        'Ad-supported via Google Ads',
      ],
    },
    {
      id: 'fallback-premium-monthly',
      planCode: 'premium_monthly',
      tier: 'premium',
      name: 'Premium Membership (Monthly)',
      description: '100% ad-free innovation workspace with priority discovery and unlimited projects.',
      billingCycle: 'monthly',
      amountPaise: 49900,
      amountInr: 499,
      currency: 'INR',
      adsEnabled: false,
      features: [
        '100% Ad-Free experience (zero Google Ads)',
        'Unlimited living workbench projects & deliverables',
        'Priority Proof-of-Work placement for recruiters & grants',
        'Verified Premium Innovator badge on public portfolio',
        'Direct mentor & industry R&D fast-track introductions',
      ],
    },
    {
      id: 'fallback-premium-yearly',
      planCode: 'premium_yearly',
      tier: 'premium',
      name: 'Premium Membership (Annual)',
      description: 'Best value annual plan — 100% ad-free workspace with 2 months free.',
      billingCycle: 'yearly',
      amountPaise: 499900,
      amountInr: 4999,
      currency: 'INR',
      adsEnabled: false,
      features: [
        '100% Ad-Free experience (zero Google Ads)',
        'Save ₹989/year compared to monthly billing',
        'Unlimited living workbench projects & deliverables',
        'Priority Proof-of-Work placement for recruiters & grants',
        'Verified Premium Innovator badge & analytics exports',
      ],
    },
  ];

  let plans = $state<MembershipPlan[]>(FALLBACK_PLANS);
  let loadingPlans = $state(true);
  let billingCycle = $state<'monthly' | 'yearly'>('monthly');
  let submittingFree = $state(false);
  let creatingOrder = $state(false);
  let errorMessage = $state<string | null>(null);
  let activeOrder = $state<CreatePaymentOrderResponse | null>(null);

  const freePlan = $derived(plans.find((p) => p.planCode === 'free') ?? FALLBACK_PLANS[0]);
  const selectedPremiumPlan = $derived(
    plans.find(
      (p) => p.planCode === (billingCycle === 'yearly' ? 'premium_yearly' : 'premium_monthly'),
    ) ?? (billingCycle === 'yearly' ? FALLBACK_PLANS[2] : FALLBACK_PLANS[1]),
  );

  const resolvedUserId = $derived(
    $authState.user?.id ?? $page.url.searchParams.get('userId') ?? undefined,
  );
  const resolvedEmail = $derived(
    $authState.user?.email ?? $page.url.searchParams.get('email') ?? undefined,
  );
  const canSelectPlan = $derived(Boolean($isAuthenticated || resolvedUserId || resolvedEmail));

  onMount(async () => {
    const hasSessionOrIdentity = Boolean(
      authState.get().user?.id ||
        authState.get().accessToken ||
        $page.url.searchParams.get('userId') ||
        $page.url.searchParams.get('email'),
    );
    if (!hasSessionOrIdentity) {
      await goto('/signup');
      return;
    }

    try {
      const livePlans = await membershipApi.listPlans();
      if (livePlans.length > 0) {
        plans = livePlans;
      }
    } catch {
      // Keep fallback plans so UI remains usable even if DB seed is pending
    } finally {
      loadingPlans = false;
    }
  });

  async function handleSelectFree(): Promise<void> {
    errorMessage = null;
    submittingFree = true;
    try {
      const summary = await membershipApi.selectFreePlan('registration_step_2', {
        userId: resolvedUserId,
        email: resolvedEmail,
      });
      updateAuthUserMembership({
        tier: summary.tier,
        planCode: summary.planCode,
        adsEnabled: summary.adsEnabled,
        expiresAt: summary.expiresAt,
      });
      pushToast({
        tone: 'success',
        title: 'Free Membership selected',
        message: 'Welcome to Collab47! Let us finish setting up your role & profile.',
      });
      await goto('/onboarding');
    } catch (err) {
      errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Unable to save plan selection. Please verify the backend server is running.';
    } finally {
      submittingFree = false;
    }
  }

  async function handleStartPremiumCheckout(): Promise<void> {
    errorMessage = null;
    creatingOrder = true;
    try {
      const planCode = billingCycle === 'yearly' ? 'premium_yearly' : 'premium_monthly';
      activeOrder = await membershipApi.createPaymentOrder({
        planCode,
        preferredMethod: 'upi',
        userId: resolvedUserId,
        email: resolvedEmail,
      });
    } catch (err) {
      errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Unable to initialize Indian payment gateway. Check backend server.';
    } finally {
      creatingOrder = false;
    }
  }

  async function handlePaymentVerified(_result: VerifyPaymentResponse): Promise<void> {
    activeOrder = null;
    await goto('/onboarding');
  }
</script>

<svelte:head>
  <title>Step 2: Choose Plan · Collab47</title>
</svelte:head>

<main class="c47-container flex-1 py-10">
  {#if !$authState.isHydrated || loadingPlans}
    <div class="flex min-h-[55vh] items-center justify-center">
      <Spinner label="Loading membership plans..." size="lg" />
    </div>
  {:else if canSelectPlan}
    <div class="mx-auto flex max-w-4xl flex-col gap-6">
      <!-- 2-Step Registration Progress Header -->
      <div class="flex flex-col items-center gap-3 text-center">
        <div
          class="inline-grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-1.5 text-xs font-semibold shadow-xs"
        >
          <div class="flex items-center gap-1.5 rounded-lg bg-logo-green-soft px-3.5 py-1.5 text-logo-green">
            <Icon name="check-circle" size={14} />
            <span>{$t.membership.step1Done}</span>
          </div>
          <div class="flex items-center gap-1.5 rounded-lg bg-logo-saffron px-3.5 py-1.5 text-white">
            <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
              2
            </span>
            <span>{$t.membership.step2Active}</span>
          </div>
        </div>

        <h1 class="text-3xl font-extrabold tracking-tight text-logo-saffron sm:text-4xl">
          {$t.membership.chooseTitle}
        </h1>
        <p class="max-w-2xl text-sm font-medium text-logo-green sm:text-base">
          {$t.membership.chooseSubtitle}
        </p>

        <!-- Monthly / Yearly Switch -->
        {#if !activeOrder}
          <div class="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onclick={() => (billingCycle = 'monthly')}
              class="cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition {billingCycle === 'monthly'
                ? 'bg-logo-saffron text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'}"
            >
              {$t.membership.monthlyLabel}
            </button>
            <button
              type="button"
              onclick={() => (billingCycle = 'yearly')}
              class="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition {billingCycle === 'yearly'
                ? 'bg-logo-green text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'}"
            >
              <span>{$t.membership.yearlyLabel}</span>
              <span
                class="rounded-full px-1.5 py-0.5 text-[10px] {billingCycle === 'yearly'
                  ? 'bg-white/20 text-white'
                  : 'bg-logo-green-soft text-logo-green'}"
              >
                {$t.membership.saveBadge}
              </span>
            </button>
          </div>
        {/if}
      </div>

      {#if errorMessage}
        <Alert tone="error" title="Membership Error">{errorMessage}</Alert>
      {/if}

      {#if activeOrder}
        <IndianPaymentCheckout
          order={activeOrder}
          onSuccess={handlePaymentVerified}
          onCancel={() => (activeOrder = null)}
        />
      {:else}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Free Plan Card -->
          <Card padding="lg" class="border-slate-200">
            <div class="flex h-full flex-col justify-between gap-6">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between gap-2">
                  <Badge tone="neutral">{$t.membership.freeBadge}</Badge>
                  <span class="text-xs font-semibold text-slate-500">{$t.membership.includesAds}</span>
                </div>
                <h2 class="text-2xl font-extrabold text-slate-900">{freePlan.name}</h2>
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-extrabold text-logo-green">₹0</span>
                  <span class="text-sm text-slate-500">{$t.membership.foreverLabel}</span>
                </div>
                <p class="text-sm text-slate-600">{freePlan.description}</p>

                <ul class="mt-2 flex flex-col gap-2.5 border-t border-slate-100 pt-4 text-sm text-slate-700">
                  {#each freePlan.features as feature (feature)}
                    <li class="flex items-start gap-2">
                      <Icon name="check" size={16} class="mt-0.5 shrink-0 text-logo-green" />
                      <span>{feature}</span>
                    </li>
                  {/each}
                </ul>
              </div>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                loading={submittingFree}
                onclick={handleSelectFree}
              >
                <span>{$t.membership.continueFreeBtn}</span>
                <Icon name="arrow-right" size={16} />
              </Button>
            </div>
          </Card>

          <!-- Premium Plan Card -->
          <Card
            padding="lg"
            elevated
            class="border-2 border-logo-saffron bg-gradient-to-b from-logo-saffron-soft/45 via-white to-white"
          >
            <div class="flex h-full flex-col justify-between gap-6">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between gap-2">
                  <Badge tone="saffron">
                    <Icon name="sparkles" size={13} />
                    <span>{$t.membership.recommendedBadge}</span>
                  </Badge>
                  <Badge tone="moss">{$t.membership.noAdsBadge}</Badge>
                </div>
                <h2 class="text-2xl font-extrabold text-logo-saffron">{selectedPremiumPlan.name}</h2>
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-extrabold text-logo-saffron">
                    ₹{selectedPremiumPlan.amountInr}
                  </span>
                  <span class="text-sm text-logo-green">
                    {billingCycle === 'yearly' ? $t.membership.perYear : $t.membership.perMonth}
                  </span>
                </div>
                <p class="text-sm text-slate-600">{selectedPremiumPlan.description}</p>

                <ul class="mt-2 flex flex-col gap-2.5 border-t border-logo-saffron-border/60 pt-4 text-sm text-slate-800">
                  {#each selectedPremiumPlan.features as feature (feature)}
                    <li class="flex items-start gap-2">
                      <Icon name="check-circle" size={16} class="mt-0.5 shrink-0 text-logo-saffron" />
                      <span>{feature}</span>
                    </li>
                  {/each}
                </ul>
              </div>

              <div class="flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={creatingOrder}
                  onclick={handleStartPremiumCheckout}
                >
                  <Icon name="shield-check" size={17} />
                  <span>₹{selectedPremiumPlan.amountInr} · {$t.membership.payGoAdFreeBtn}</span>
                </Button>
                <p class="text-center text-xs text-slate-500">
                  {$t.membership.supportedMethodsNote}
                </p>
              </div>
            </div>
          </Card>
        </div>
      {/if}
    </div>
  {/if}
</main>

<Footer />
