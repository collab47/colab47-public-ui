import { map } from 'nanostores';

const SIDEBAR_STORAGE_KEY = 'c47_dash_sidebar_collapsed';

export interface SidebarStoreState {
  collapsed: boolean;
  mobileOpen: boolean;
  activeTab: string;
  newProjectTrigger: number;
}

export const sidebarState = map<SidebarStoreState>({
  collapsed: false,
  mobileOpen: false,
  activeTab: 'all',
  newProjectTrigger: 0,
});

export function hydrateSidebar(): void {
  if (typeof window === 'undefined') return;
  try {
    const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    sidebarState.setKey('collapsed', saved);
  } catch {
    // Ignore storage errors
  }
}

export function toggleSidebarCollapsed(): void {
  const next = !sidebarState.get().collapsed;
  sidebarState.setKey('collapsed', next);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    } catch {
      // Ignore storage errors
    }
  }
}

export function setMobileSidebarOpen(open: boolean): void {
  sidebarState.setKey('mobileOpen', open);
}

export function setDashboardActiveTab(tabId: string): void {
  sidebarState.setKey('activeTab', tabId);
}

export function triggerNewProjectComposer(): void {
  sidebarState.setKey('newProjectTrigger', sidebarState.get().newProjectTrigger + 1);
}

const PRIVATE_ROUTE_PREFIXES = ['/dashboard', '/profile', '/onboarding', '/membership', '/projects', '/posts'] as const;

export function isPrivateSidebarRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
