import { atom } from 'nanostores';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
}

export const toasts = atom<ToastItem[]>([]);

export function pushToast(
  toast: Omit<ToastItem, 'id'>,
  durationMs = 4500,
): string {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  toasts.set([...toasts.get(), { ...toast, id }]);

  if (durationMs > 0 && typeof window !== 'undefined') {
    window.setTimeout(() => {
      dismissToast(id);
    }, durationMs);
  }

  return id;
}

export function dismissToast(id: string): void {
  toasts.set(toasts.get().filter((item) => item.id !== id));
}
