import { apiRequest } from './client';

export type NotificationEventType =
  | 'auth_welcome'
  | 'auth_signin_alert'
  | 'auth_account_restored'
  | 'email_verified'
  | 'membership_upgraded'
  | 'membership_free_selected'
  | 'membership_cancelled'
  | 'payment_failed'
  | 'profile_updated'
  | 'onboarding_completed'
  | 'project_posted'
  | 'project_updated'
  | 'post_published'
  | 'opportunity_applied'
  | 'mentorship_updated'
  | 'attestation_updated'
  | 'system_notice';

export interface NotificationItem {
  id: string;
  userId: string;
  actorId: string | null;
  type: string;
  targetType: string | null;
  targetId: string | null;
  title: string;
  body: string | null;
  readAt: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unreadCount: number;
}

export const notificationsApi = {
  list(limit = 25, unreadOnly = false): Promise<NotificationListResponse> {
    const qs = new URLSearchParams({
      limit: String(limit),
      unreadOnly: String(unreadOnly),
    });
    return apiRequest<NotificationListResponse>(`/notifications?${qs.toString()}`, {
      method: 'GET',
      auth: true,
    });
  },

  markRead(id: string): Promise<NotificationItem> {
    return apiRequest<NotificationItem>(`/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
      auth: true,
    });
  },

  markAllRead(): Promise<{ updatedCount: number }> {
    return apiRequest<{ updatedCount: number }>('/notifications/read-all', {
      method: 'PATCH',
      auth: true,
    });
  },

  emitEvent(payload: {
    type: NotificationEventType;
    title: string;
    body?: string;
    targetType?: string;
    targetId?: string;
    sendEmail?: boolean;
    ctaPath?: string;
  }): Promise<{ created: boolean; notification: NotificationItem | null }> {
    return apiRequest('/notifications/events', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },
};
