import { apiRequest } from './client';

export type BadgeCategory = 'images' | 'videos' | 'posts' | 'feeds' | 'projects' | 'profile';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeProgress {
  id: string;
  badgeCode: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  iconName: string;
  points: number;
  criteriaMetric: string;
  criteriaThreshold: number;
  currentValue: number;
  progressPercent: number;
  earned: boolean;
  earnedAt: string | null;
}

export interface UserBadgesSummary {
  totalPoints: number;
  earnedCount: number;
  totalBadges: number;
  level: number;
  levelTitle: string;
  nextLevelPoints: number;
  newlyAwarded: BadgeProgress[];
  badges: BadgeProgress[];
}

export const badgesApi = {
  getCatalog(): Promise<BadgeProgress[]> {
    return apiRequest<BadgeProgress[]>('/badges/catalog', { method: 'GET', auth: false });
  },

  getMyBadges(): Promise<UserBadgesSummary> {
    return apiRequest<UserBadgesSummary>('/badges/me', { method: 'GET', auth: true });
  },

  getPublicBadgesByHandle(handle: string): Promise<UserBadgesSummary> {
    return apiRequest<UserBadgesSummary>(`/badges/u/${encodeURIComponent(handle)}`, {
      method: 'GET',
      auth: false,
    });
  },
};
