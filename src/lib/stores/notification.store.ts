import { map } from 'nanostores';
import {
  notificationsApi,
  type NotificationEventType,
  type NotificationItem,
} from '$lib/api/notifications.api';
import { authState } from './auth.store';

export interface NotificationStoreState {
  items: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
}

export const notificationState = map<NotificationStoreState>({
  items: [],
  unreadCount: 0,
  isLoading: false,
});

export async function loadNotifications(limit = 20): Promise<void> {
  if (!authState.get().accessToken) return;
  notificationState.setKey('isLoading', true);
  try {
    const data = await notificationsApi.list(limit, false);
    notificationState.set({
      items: data.items,
      unreadCount: data.unreadCount,
      isLoading: false,
    });
  } catch {
    notificationState.setKey('isLoading', false);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const current = notificationState.get();
  const target = current.items.find((n) => n.id === id);
  if (!target || target.isRead) return;

  notificationState.set({
    ...current,
    items: current.items.map((n) =>
      n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
    ),
    unreadCount: Math.max(0, current.unreadCount - 1),
  });

  try {
    await notificationsApi.markRead(id);
  } catch {
    // Keep optimistic state
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const current = notificationState.get();
  if (current.unreadCount === 0) return;

  const now = new Date().toISOString();
  notificationState.set({
    ...current,
    items: current.items.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? now })),
    unreadCount: 0,
  });

  try {
    await notificationsApi.markAllRead();
  } catch {
    // Keep optimistic state
  }
}

export async function emitActivityNotification(payload: {
  type: NotificationEventType;
  title: string;
  body?: string;
  targetType?: string;
  targetId?: string;
  sendEmail?: boolean;
  ctaPath?: string;
}): Promise<void> {
  if (!authState.get().accessToken) return;
  try {
    const res = await notificationsApi.emitEvent(payload);
    if (res.notification) {
      const current = notificationState.get();
      notificationState.set({
        ...current,
        items: [res.notification, ...current.items].slice(0, 30),
        unreadCount: current.unreadCount + 1,
      });
    }
  } catch {
    // Non-blocking background activity notification
  }
}

export function clearNotifications(): void {
  notificationState.set({ items: [], unreadCount: 0, isLoading: false });
}
