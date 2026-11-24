import { map } from 'nanostores';
import {
  dashboardApi,
  type CreateLivePostPayload,
  type DashboardOverview,
  type FeedFilterTab,
  type LiveFeedPost,
  type UpdateLivePostPayload,
} from '$lib/api/dashboard.api';

export interface LiveDashboardState {
  overview: DashboardOverview | null;
  overviewLoading: boolean;
  feed: LiveFeedPost[];
  feedLoading: boolean;
  feedTab: FeedFilterTab;
  selectedTag: string | null;
  bookmarkedOnly: boolean;
}

export const liveDashboardState = map<LiveDashboardState>({
  overview: null,
  overviewLoading: false,
  feed: [],
  feedLoading: false,
  feedTab: 'for_you',
  selectedTag: null,
  bookmarkedOnly: false,
});

export async function loadDashboardOverview(): Promise<DashboardOverview | null> {
  liveDashboardState.setKey('overviewLoading', true);
  try {
    const overview = await dashboardApi.getOverview();
    liveDashboardState.setKey('overview', overview);
    return overview;
  } catch {
    return liveDashboardState.get().overview;
  } finally {
    liveDashboardState.setKey('overviewLoading', false);
  }
}

export async function loadDashboardFeed(options?: {
  tab?: FeedFilterTab;
  tag?: string | null;
  search?: string;
  bookmarkedOnly?: boolean;
}): Promise<LiveFeedPost[]> {
  const current = liveDashboardState.get();
  const tab = options?.tab ?? current.feedTab;
  const tag = options?.tag !== undefined ? options.tag : current.selectedTag;
  const bookmarkedOnly = options?.bookmarkedOnly ?? current.bookmarkedOnly;

  liveDashboardState.set({
    ...current,
    feedTab: tab,
    selectedTag: tag,
    bookmarkedOnly,
    feedLoading: true,
  });

  try {
    const posts = await dashboardApi.listFeed({
      tab,
      tag: tag ?? undefined,
      search: options?.search?.trim() || undefined,
      bookmarkedOnly,
      limit: 25,
    });
    liveDashboardState.setKey('feed', posts);
    return posts;
  } catch {
    return liveDashboardState.get().feed;
  } finally {
    liveDashboardState.setKey('feedLoading', false);
  }
}

export async function publishLiveFeedPost(payload: CreateLivePostPayload): Promise<LiveFeedPost> {
  const created = await dashboardApi.createPost(payload);
  const current = liveDashboardState.get();
  liveDashboardState.setKey('feed', [created, ...current.feed.filter((p) => p.id !== created.id)]);
  void loadDashboardOverview();
  return created;
}

export async function updateLiveFeedPost(
  postId: string,
  payload: UpdateLivePostPayload,
): Promise<LiveFeedPost> {
  const updated = await dashboardApi.updatePost(postId, payload);
  const current = liveDashboardState.get();
  liveDashboardState.setKey(
    'feed',
    current.feed.map((p) => (p.id === updated.id ? updated : p)),
  );
  void loadDashboardOverview();
  return updated;
}

export async function toggleLivePostLike(postId: string): Promise<void> {
  const res = await dashboardApi.togglePostLike(postId);
  const current = liveDashboardState.get();
  liveDashboardState.setKey(
    'feed',
    current.feed.map((p) =>
      p.id === postId ? { ...p, isLiked: res.liked, likesCount: res.likesCount } : p,
    ),
  );
  void loadDashboardOverview();
}

export async function toggleLivePostBookmark(postId: string): Promise<void> {
  const res = await dashboardApi.togglePostBookmark(postId);
  const current = liveDashboardState.get();
  liveDashboardState.setKey(
    'feed',
    current.feed.map((p) => (p.id === postId ? { ...p, isBookmarked: res.bookmarked } : p)),
  );
}

export async function submitLivePostComment(postId: string, body: string): Promise<void> {
  const comment = await dashboardApi.addPostComment(postId, body);
  const current = liveDashboardState.get();
  liveDashboardState.setKey(
    'feed',
    current.feed.map((p) =>
      p.id === postId
        ? {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, comment],
          }
        : p,
    ),
  );
}

export async function updateLivePostTags(postId: string, tags: string[]): Promise<string[]> {
  const res = await dashboardApi.updatePostTags(postId, tags);
  const current = liveDashboardState.get();
  liveDashboardState.setKey(
    'feed',
    current.feed.map((p) => (p.id === postId ? { ...p, tags: res.tags } : p)),
  );
  void loadDashboardOverview();
  return res.tags;
}

export async function toggleLivePostRepost(postId: string): Promise<void> {
  const res = await dashboardApi.togglePostRepost(postId);
  const current = liveDashboardState.get();
  liveDashboardState.setKey(
    'feed',
    current.feed.map((p) =>
      p.id === postId
        ? { ...p, isReposted: res.reposted, repostCount: res.repostCount }
        : p,
    ),
  );
}

export async function toggleLiveCommentLike(postId: string, commentId: string): Promise<void> {
  const res = await dashboardApi.toggleCommentLike(commentId);
  const current = liveDashboardState.get();
  liveDashboardState.setKey(
    'feed',
    current.feed.map((p) =>
      p.id === postId
        ? {
            ...p,
            comments: p.comments.map((c) =>
              c.id === commentId ? { ...c, isLiked: res.liked, likesCount: res.likesCount } : c,
            ),
          }
        : p,
    ),
  );
}

export async function toggleLiveFollowUser(targetUserId: string): Promise<{ following: boolean }> {
  const res = await dashboardApi.toggleFollow(targetUserId);
  const current = liveDashboardState.get();

  liveDashboardState.setKey(
    'feed',
    current.feed.map((p) =>
      p.authorId === targetUserId ? { ...p, isFollowingAuthor: res.following } : p,
    ),
  );

  if (current.overview) {
    liveDashboardState.setKey('overview', {
      ...current.overview,
      metrics: {
        ...current.overview.metrics,
        followingCount: Math.max(
          0,
          current.overview.metrics.followingCount + (res.following ? 1 : -1),
        ),
      },
      suggestedPeople: current.overview.suggestedPeople.map((person) =>
        person.id === targetUserId ? { ...person, isFollowing: res.following } : person,
      ),
    });
  }

  return { following: res.following };
}

export async function toggleLiveCommunity(
  communityId: string,
): Promise<{ joined: boolean; membersCount: number }> {
  const res = await dashboardApi.toggleCommunity(communityId);
  const current = liveDashboardState.get();
  if (current.overview) {
    liveDashboardState.setKey('overview', {
      ...current.overview,
      communities: current.overview.communities.map((c) =>
        c.id === communityId
          ? { ...c, isJoined: res.joined, membersCount: res.membersCount }
          : c,
      ),
    });
  }
  return res;
}

export async function toggleLiveEventRsvp(
  eventId: string,
): Promise<{ status: string; rsvpCount: number }> {
  const res = await dashboardApi.toggleEventRsvp(eventId, 'going');
  const current = liveDashboardState.get();
  if (current.overview) {
    liveDashboardState.setKey('overview', {
      ...current.overview,
      upcomingEvents: current.overview.upcomingEvents.map((evt) =>
        evt.id === eventId
          ? { ...evt, userRsvpStatus: res.status, rsvpCount: res.rsvpCount }
          : evt,
      ),
    });
  }
  return res;
}

export function clearLiveDashboardState(): void {
  liveDashboardState.set({
    overview: null,
    overviewLoading: false,
    feed: [],
    feedLoading: false,
    feedTab: 'for_you',
    selectedTag: null,
    bookmarkedOnly: false,
  });
}
