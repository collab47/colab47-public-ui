<script lang="ts">
  import { ApiError } from '$lib/api/client';
  import {
    membershipApi,
    type CreatePaymentOrderResponse,
    type PaymentMethodDetails,
    type VerifyPaymentResponse,
  } from '$lib/api/membership.api';
  import type { IndianPaymentMethod } from '$lib/api/types';
  import { currentUser, pushToast, t, updateAuthUserMembership } from '$lib/stores';
  import { Alert, Badge, Button, Card, Icon, Input, Select } from '$ui';

  interface Props {
    order: CreatePaymentOrderResponse;
    onSuccess: (result: VerifyPaymentResponse) => void;
    onCancel: () => void;
  }

  let { order, onSuccess, onCancel }: Props = $props();

  let selectedMethod = $state<IndianPaymentMethod>('upi');
  let isProcessing = $state(false);
  let checkoutError = $state<string | null>(null);
  let methodErrors = $state<Record<string, string>>({});

  // UPI fields
  let upiApp = $state('gpay');
  let upiVpa = $state('');

  // Credit / Debit Card fields (NEVER sent raw to server — only masked last4 + network)
  let cardHolderName = $state('');
  let cardNumber = $state('');
  let cardExpiry = $state('');
  let cardCvv = $state('');
  let cardIssuingBank = $state('HDFC Bank');

  // Online Bank Transfer / NetBanking fields
  let transferMode = $state('NetBanking');
  let bankName = $state('State Bank of India (SBI)');
  let bankReference = $state('');

  const upiApps = [
    { id: 'gpay', label: 'Google Pay' },
    { id: 'phonepe', label: 'PhonePe' },
    { id: 'paytm', label: 'Paytm UPI' },
    { id: 'bhim', label: 'BHIM UPI' },
  ] as const;

  const indianBanks = [
    { value: 'State Bank of India (SBI)', label: 'State Bank of India (SBI)' },
    { value: 'HDFC Bank', label: 'HDFC Bank' },
    { value: 'ICICI Bank', label: 'ICICI Bank' },
    { value: 'Axis Bank', label: 'Axis Bank' },
    { value: 'Kotak Mahindra Bank', label: 'Kotak Mahindra Bank' },
    { value: 'Punjab National Bank (PNB)', label: 'Punjab National Bank (PNB)' },
    { value: 'Bank of Baroda', label: 'Bank of Baroda' },
    { value: 'Canara Bank', label: 'Canara Bank' },
  ];

  const transferModes = [
    { value: 'NetBanking', label: 'NetBanking (Instant)' },
    { value: 'IMPS', label: 'IMPS Online Transfer' },
    { value: 'NEFT', label: 'NEFT Online Transfer' },
    { value: 'RTGS', label: 'RTGS Online Transfer' },
  ];

  const paymentMethodTabs: ReadonlyArray<{
    id: IndianPaymentMethod;
    label: string;
    subtitle: string;
  }> = [
    { id: 'upi', label: 'UPI', subtitle: 'GPay · PhonePe · Paytm · BHIM' },
    { id: 'credit_card', label: 'Credit Card', subtitle: 'Visa · Mastercard · RuPay · Amex' },
    { id: 'debit_card', label: 'Debit Card', subtitle: 'RuPay · Visa · Mastercard' },
    { id: 'netbanking', label: 'Online Transfer', subtitle: 'NetBanking · IMPS · NEFT' },
  ];

  function detectCardNetwork(digits: string): string {
    if (digits.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
    if (/^(60|65|81|82|508)/.test(digits)) return 'RuPay';
    if (/^3[47]/.test(digits)) return 'Amex';
    return 'Card';
  }

  function maskUpiVpa(vpa: string): string {
    const [handle, bank] = vpa.trim().split('@');
    if (!handle || !bank) return vpa;
    const prefix = handle.slice(0, Math.min(2, handle.length));
    return `${prefix}***@${bank}`;
  }

  function validateSelectedMethod(): PaymentMethodDetails | null {
    const nextErrors: Record<string, string> = {};

    if (selectedMethod === 'upi') {
      const cleaned = upiVpa.trim();
      if (!cleaned) {
        nextErrors.upiVpa = 'Enter your UPI ID (e.g. name@okicici or mobile@ybl).';
      } else if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(cleaned)) {
        nextErrors.upiVpa = 'Invalid UPI ID format. Example: ananya@okhdfcbank';
      }
      methodErrors = nextErrors;
      if (Object.keys(nextErrors).length > 0) return null;
      return {
        upiApp,
        upiVpaMasked: maskUpiVpa(cleaned),
      };
    }

    if (selectedMethod === 'credit_card' || selectedMethod === 'debit_card') {
      const digits = cardNumber.replace(/\D/g, '');
      if (cardHolderName.trim().length < 2) {
        nextErrors.cardHolderName = 'Enter the name printed on your card.';
      }
      if (digits.length < 13 || digits.length > 19) {
        nextErrors.cardNumber = 'Enter a valid 16-digit card number.';
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
        nextErrors.cardExpiry = 'Use MM/YY format (e.g. 08/29).';
      }
      if (!/^\d{3,4}$/.test(cardCvv.trim())) {
        nextErrors.cardCvv = 'Enter 3 or 4 digit CVV.';
      }
      methodErrors = nextErrors;
      if (Object.keys(nextErrors).length > 0) return null;
      return {
        cardNetwork: detectCardNetwork(digits),
        cardLast4: digits.slice(-4),
        bankName: selectedMethod === 'debit_card' ? cardIssuingBank : undefined,
      };
    }

    // NetBanking / Online Bank Transfer
    if (!bankName.trim()) {
      nextErrors.bankName = 'Please select your bank.';
    }
    methodErrors = nextErrors;
    if (Object.keys(nextErrors).length > 0) return null;

    return {
      bankName,
      transferMode,
      referenceNumber: bankReference.trim() || `UTR${Date.now().toString().slice(-10)}`,
    };
  }

  function loadRazorpayCheckoutScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }
      if ('Razorpay' in window) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function launchLiveRazorpay(): Promise<void> {
    isProcessing = true;
    checkoutError = null;

    const loaded = await loadRazorpayCheckoutScript();
    if (!loaded || !order.gatewayKeyId) {
      checkoutError = 'Unable to load Razorpay Checkout SDK. Please check your internet connection.';
      isProcessing = false;
      return;
    }

    const RazorpayCtor = (
      window as unknown as {
        Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
      }
    ).Razorpay;

    const effectiveMethod: IndianPaymentMethod =
      selectedMethod === 'netbanking' && transferMode !== 'NetBanking'
        ? 'bank_transfer'
        : selectedMethod;

    const rzp = new RazorpayCtor({
      key: order.gatewayKeyId,
      amount: order.amountPaise,
      currency: order.currency,
      name: 'Collab47',
      description: order.planName,
      order_id: order.gatewayOrderId,
      prefill: {
        name: $currentUser?.name ?? '',
        email: $currentUser?.email ?? '',
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
      },
      theme: { color: '#D45F00' },
      handler: async (resp: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const verified = await membershipApi.verifyPayment({
            gatewayOrderId: resp.razorpay_order_id,
            gatewayPaymentId: resp.razorpay_payment_id,
            gatewaySignature: resp.razorpay_signature,
            paymentMethod: effectiveMethod,
          });
          if (verified.membership) {
            updateAuthUserMembership({
              tier: verified.membership.tier,
              planCode: verified.membership.planCode,
              adsEnabled: verified.membership.adsEnabled,
              expiresAt: verified.membership.expiresAt,
            });
          }
          onSuccess(verified);
        } catch (err) {
          checkoutError =
            err instanceof ApiError ? err.message : 'Payment verification failed. Contact support.';
        } finally {
          isProcessing = false;
        }
      },
      modal: {
        ondismiss: async () => {
          isProcessing = false;
          try {
            await membershipApi.updatePaymentStatus({
              gatewayOrderId: order.gatewayOrderId,
              status: 'failed',
              paymentMethod: effectiveMethod,
              failureReason: 'Checkout dismissed by user.',
            });
          } catch {
            // Non-blocking status sync
          }
        },
      },
    });

    rzp.open();
  }

  async function handleSandboxPay(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    checkoutError = null;

    const details = validateSelectedMethod();
    if (!details) return;

    if (!order.sandboxPaymentId || !order.sandboxSignature) {
      checkoutError = 'Sandbox payment signature unavailable for this order.';
      return;
    }

    isProcessing = true;
    const effectiveMethod: IndianPaymentMethod =
      selectedMethod === 'netbanking' && transferMode !== 'NetBanking'
        ? 'bank_transfer'
        : selectedMethod;

    try {
      const verified = await membershipApi.verifyPayment({
        gatewayOrderId: order.gatewayOrderId,
        gatewayPaymentId: order.sandboxPaymentId,
        gatewaySignature: order.sandboxSignature,
        paymentMethod: effectiveMethod,
        paymentMethodDetails: details,
      });

      if (verified.membership) {
        updateAuthUserMembership({
          tier: verified.membership.tier,
          planCode: verified.membership.planCode,
          adsEnabled: verified.membership.adsEnabled,
          expiresAt: verified.membership.expiresAt,
        });
      }

      pushToast({
        tone: 'success',
        title:
          order.purpose === 'project_post'
            ? 'Payment Verified — Project Slot Unlocked!'
            : 'Payment Verified!',
        message:
          order.purpose === 'project_post'
            ? `Paid ₹${order.amountInr} via ${effectiveMethod.replace('_', ' ').toUpperCase()}. Receipt ${order.receiptNumber} issued.`
            : `Paid ₹${order.amountInr} via ${effectiveMethod.replace('_', ' ').toUpperCase()}.`,
      });

      onSuccess(verified);
    } catch (err) {
      checkoutError =
        err instanceof ApiError ? err.message : 'Payment could not be verified. Please try again.';
    } finally {
      isProcessing = false;
    }
  }
</script>

<Card
  title={$t.membership.checkoutTitle}
  subtitle={$t.membership.checkoutSubtitle}
  elevated
  class="border-logo-saffron-border"
>
  {#snippet headerActions()}
    <Badge tone={order.isSandbox ? 'saffron' : 'moss'}>
      {order.isSandbox ? 'INR Test Gateway' : 'Razorpay Live'}
    </Badge>
  {/snippet}

  <div class="flex flex-col gap-5">
    <!-- Order Summary Strip -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-logo-green-border bg-logo-green-soft/60 px-4 py-3"
    >
      <div>
        <strong class="block text-sm font-bold text-slate-900">{order.planName}</strong>
        <span class="text-xs text-logo-green">
          Receipt: {order.receiptNumber} · Order: {order.gatewayOrderId}
        </span>
      </div>
      <div class="text-right">
        <strong class="block text-xl font-extrabold text-logo-saffron">₹{order.amountInr}</strong>
        <span class="text-xs font-medium text-logo-green">
          {order.purpose === 'project_post'
            ? 'Incl. GST · 1 Project Post Credit'
            : 'Incl. GST'}
        </span>
      </div>
    </div>

    {#if checkoutError}
      <Alert tone="error" title="Payment Error">{checkoutError}</Alert>
    {/if}

    <!-- Indian Payment Rail Selector -->
    <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {#each paymentMethodTabs as tab (tab.id)}
        <button
          type="button"
          onclick={() => {
            selectedMethod = tab.id;
            methodErrors = {};
            checkoutError = null;
          }}
          class="flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition {selectedMethod === tab.id
            ? 'border-logo-saffron bg-logo-saffron-soft text-logo-saffron shadow-xs'
            : 'border-slate-200 bg-white text-slate-700 hover:border-logo-green-border'}"
        >
          <span class="text-sm font-bold">{tab.label}</span>
          <span class="text-[11px] text-slate-500">{tab.subtitle}</span>
        </button>
      {/each}
    </div>

    {#if !order.isSandbox && order.gateway === 'razorpay'}
      <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm text-slate-600">
          Click below to open <strong>Razorpay Standard Checkout</strong> supporting UPI (GPay,
          PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, and Indian NetBanking / Online Bank
          Transfer.
        </p>
        <div class="flex flex-wrap justify-end gap-2.5">
          <Button variant="outline" onclick={onCancel} disabled={isProcessing}>Cancel</Button>
          <Button variant="primary" size="lg" loading={isProcessing} onclick={launchLiveRazorpay}>
            <Icon name="shield-check" size={17} />
            <span>Pay ₹{order.amountInr} with Razorpay</span>
          </Button>
        </div>
      </div>
    {:else}
      <form class="flex flex-col gap-4" onsubmit={handleSandboxPay} novalidate>
        {#if selectedMethod === 'upi'}
          <div class="flex flex-col gap-3">
            <span class="text-xs font-bold tracking-wider uppercase text-logo-green">
              Choose UPI App
            </span>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {#each upiApps as app (app.id)}
                <button
                  type="button"
                  onclick={() => (upiApp = app.id)}
                  class="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition {upiApp === app.id
                    ? 'border-logo-green bg-logo-green text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-logo-green-border'}"
                >
                  {app.label}
                </button>
              {/each}
            </div>
            <Input
              id="pay-upi-vpa"
              label={$t.forms.upiIdVpa}
              icon="at-sign"
              bind:value={upiVpa}
              placeholder="ananya@okicici or 9876543210@ybl"
              required
              error={methodErrors.upiVpa}
              oninput={() => {
                if (methodErrors.upiVpa) methodErrors = {};
              }}
            />
          </div>
        {:else if selectedMethod === 'credit_card' || selectedMethod === 'debit_card'}
          <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <Input
                id="pay-card-name"
                label={$t.forms.cardholderName}
                icon="user"
                bind:value={cardHolderName}
                placeholder="Ananya Sharma"
                required
                error={methodErrors.cardHolderName}
              />
            </div>
            <div class="sm:col-span-2">
              <Input
                id="pay-card-number"
                label={selectedMethod === 'credit_card' ? $t.forms.creditCardNumber : $t.forms.debitCardNumber}
                icon="lock"
                bind:value={cardNumber}
                placeholder="4242 4242 4242 4242"
                maxlength={19}
                required
                error={methodErrors.cardNumber}
                hint="Supports Visa, Mastercard, RuPay & Amex. Only masked last 4 digits are recorded."
              />
            </div>
            <Input
              id="pay-card-expiry"
              label={$t.forms.expiryMmYy}
              bind:value={cardExpiry}
              placeholder="08/29"
              maxlength={5}
              required
              error={methodErrors.cardExpiry}
            />
            <Input
              id="pay-card-cvv"
              label={$t.forms.cvv}
              bind:value={cardCvv}
              placeholder="123"
              maxlength={4}
              required
              error={methodErrors.cardCvv}
            />
            {#if selectedMethod === 'debit_card'}
              <div class="sm:col-span-2">
                <Select
                  id="pay-debit-bank"
                  label={$t.forms.issuingBank}
                  options={indianBanks}
                  bind:value={cardIssuingBank}
                />
              </div>
            {/if}
          </div>
        {:else}
          <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Select
              id="pay-transfer-mode"
              label={$t.forms.onlineTransferMethod}
              options={transferModes}
              bind:value={transferMode}
            />
            <Select
              id="pay-bank-name"
              label={$t.forms.selectIndianBank}
              options={indianBanks}
              bind:value={bankName}
              error={methodErrors.bankName}
            />
            <div class="sm:col-span-2">
              <Input
                id="pay-bank-ref"
                label={$t.forms.utrReferenceOptional}
                bind:value={bankReference}
                placeholder="Auto-generated for instant NetBanking"
                hint="Instant confirmation for NetBanking & IMPS; NEFT/RTGS references are logged on receipt."
              />
            </div>
          </div>
        {/if}

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <span class="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Icon name="shield-check" size={15} class="text-logo-green" />
            <span>HMAC-SHA256 verified · PCI-DSS compliant masked metadata</span>
          </span>
          <div class="flex gap-2.5">
            <Button variant="outline" onclick={onCancel} disabled={isProcessing}>
              {$t.membership.cancel}
            </Button>
            <Button type="submit" variant="primary" size="lg" loading={isProcessing}>
              <Icon name="check-circle" size={17} />
              <span>{$t.membership.payNow} (₹{order.amountInr})</span>
            </Button>
          </div>
        </div>
      </form>
    {/if}
  </div>
</Card>
