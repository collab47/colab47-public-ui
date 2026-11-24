import { authState } from '$lib/stores/auth.store';
import { apiRequest } from './client';
import type {
  BillingCycle,
  IndianPaymentMethod,
  MembershipPlanCode,
  MembershipStatus,
  MembershipTier,
  PaymentGateway,
  PaymentStatus,
} from './types';

export interface MembershipPlan {
  id: string;
  planCode: MembershipPlanCode;
  tier: MembershipTier;
  name: string;
  description: string | null;
  billingCycle: BillingCycle;
  amountPaise: number;
  amountInr: number;
  currency: string;
  adsEnabled: boolean;
  features: string[];
}

export interface IndustryMasterItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  displayOrder: number;
}

export interface PaymentMethodDetails {
  upiApp?: string;
  upiVpaMasked?: string;
  cardNetwork?: string;
  cardLast4?: string;
  bankName?: string;
  transferMode?: string;
  referenceNumber?: string;
}

export interface PaymentTransaction {
  id: string;
  gateway: PaymentGateway;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  paymentMethod: IndianPaymentMethod | null;
  paymentMethodDetails: Record<string, unknown>;
  amountPaise: number;
  amountInr: number;
  currency: string;
  status: PaymentStatus;
  receiptNumber: string;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface CreatePaymentOrderResponse {
  transactionId: string;
  gateway: PaymentGateway;
  gatewayOrderId: string;
  gatewayKeyId: string | null;
  planCode: MembershipPlanCode;
  planName: string;
  amountPaise: number;
  amountInr: number;
  currency: string;
  receiptNumber: string;
  supportedMethods: IndianPaymentMethod[];
  isSandbox: boolean;
  sandboxPaymentId?: string | null;
  sandboxSignature?: string | null;
}

export interface UserMembershipSummary {
  tier: MembershipTier;
  planCode: MembershipPlanCode;
  planName: string;
  status: MembershipStatus;
  adsEnabled: boolean;
  startedAt: string | null;
  expiresAt: string | null;
  autoRenew: boolean;
  recentPayments: PaymentTransaction[];
}

export interface VerifyPaymentResponse {
  verified: boolean;
  membership: UserMembershipSummary;
  transaction: PaymentTransaction;
}

export const membershipApi = {
  listPlans(): Promise<MembershipPlan[]> {
    return apiRequest<MembershipPlan[]>('/membership/plans', { method: 'GET', auth: false });
  },

  listIndustries(params?: { category?: string; q?: string }): Promise<IndustryMasterItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.q) query.set('q', params.q);
    const qs = query.toString();
    return apiRequest<IndustryMasterItem[]>(`/membership/industries${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      auth: false,
    });
  },

  getMyMembership(): Promise<UserMembershipSummary> {
    return apiRequest<UserMembershipSummary>('/membership/me', { method: 'GET', auth: true });
  },

  selectFreePlan(
    source = 'registration_step_2',
    identity?: { userId?: string; email?: string },
  ): Promise<UserMembershipSummary> {
    const userId = identity?.userId ?? authState.get().user?.id;
    const email = identity?.email ?? authState.get().user?.email;
    return apiRequest<UserMembershipSummary>('/membership/select-free', {
      method: 'POST',
      auth: false,
      body: {
        source,
        ...(userId ? { userId } : {}),
        ...(!userId && email ? { email } : {}),
      },
    });
  },

  createPaymentOrder(payload: {
    planCode: 'premium_monthly' | 'premium_yearly';
    preferredMethod?: IndianPaymentMethod;
    userId?: string;
    email?: string;
  }): Promise<CreatePaymentOrderResponse> {
    const userId = payload.userId ?? authState.get().user?.id;
    const email = payload.email ?? authState.get().user?.email;
    return apiRequest<CreatePaymentOrderResponse>('/membership/payments/create-order', {
      method: 'POST',
      auth: false,
      body: {
        ...payload,
        ...(userId ? { userId } : {}),
        ...(!userId && email ? { email } : {}),
      },
    });
  },

  verifyPayment(payload: {
    gatewayOrderId: string;
    gatewayPaymentId: string;
    gatewaySignature: string;
    paymentMethod: IndianPaymentMethod;
    paymentMethodDetails?: PaymentMethodDetails;
    userId?: string;
    email?: string;
  }): Promise<VerifyPaymentResponse> {
    const userId = payload.userId ?? authState.get().user?.id;
    const email = payload.email ?? authState.get().user?.email;
    return apiRequest<VerifyPaymentResponse>('/membership/payments/verify', {
      method: 'POST',
      auth: false,
      body: {
        ...payload,
        ...(userId ? { userId } : {}),
        ...(!userId && email ? { email } : {}),
      },
    });
  },

  updatePaymentStatus(payload: {
    gatewayOrderId: string;
    status: 'failed' | 'authorized';
    paymentMethod?: IndianPaymentMethod;
    failureReason?: string;
    gatewayPaymentId?: string;
    userId?: string;
    email?: string;
  }): Promise<PaymentTransaction> {
    const userId = payload.userId ?? authState.get().user?.id;
    const email = payload.email ?? authState.get().user?.email;
    return apiRequest<PaymentTransaction>('/membership/payments/update-status', {
      method: 'POST',
      auth: false,
      body: {
        ...payload,
        ...(userId ? { userId } : {}),
        ...(!userId && email ? { email } : {}),
      },
    });
  },

  listPaymentHistory(): Promise<PaymentTransaction[]> {
    return apiRequest<PaymentTransaction[]>('/membership/payments/history', {
      method: 'GET',
      auth: true,
    });
  },

  cancelPremium(): Promise<UserMembershipSummary> {
    return apiRequest<UserMembershipSummary>('/membership/cancel', {
      method: 'POST',
      auth: true,
    });
  },
};
