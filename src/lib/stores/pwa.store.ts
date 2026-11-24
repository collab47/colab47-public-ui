import { map } from 'nanostores';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface PwaStoreState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isStandalone: boolean;
  isInstalled: boolean;
  isDismissed: boolean;
  isIos: boolean;
  initialized: boolean;
}

const DISMISS_STORAGE_KEY = 'c47_pwa_floater_dismissed_v2';

export const pwaState = map<PwaStoreState>({
  deferredPrompt: null,
  isStandalone: false,
  isInstalled: false,
  isDismissed: false,
  isIos: false,
  initialized: false,
});

let listenersBound = false;

export function initPwa(): void {
  if (typeof window === 'undefined') return;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isDismissed =
    (() => {
      try {
        return window.sessionStorage.getItem(DISMISS_STORAGE_KEY) === '1';
      } catch {
        return false;
      }
    })();

  pwaState.set({
    ...pwaState.get(),
    isStandalone,
    isInstalled: isStandalone,
    isIos,
    isDismissed,
    initialized: true,
  });

  if (!listenersBound) {
    listenersBound = true;

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      pwaState.setKey('deferredPrompt', event as BeforeInstallPromptEvent);
    });

    window.addEventListener('appinstalled', () => {
      pwaState.setKey('isInstalled', true);
      pwaState.setKey('deferredPrompt', null);
    });
  }
}

export function dismissPwaPrompt(): void {
  pwaState.setKey('isDismissed', true);
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DISMISS_STORAGE_KEY, '1');
  } catch {
    // Ignore storage errors
  }
}

export async function triggerPwaInstall(): Promise<'accepted' | 'dismissed' | 'manual'> {
  const promptEvent = pwaState.get().deferredPrompt;
  if (!promptEvent) {
    return 'manual';
  }
  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  pwaState.setKey('deferredPrompt', null);
  if (choice.outcome === 'accepted') {
    pwaState.setKey('isInstalled', true);
  }
  return choice.outcome;
}
