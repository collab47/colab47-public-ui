<script lang="ts">
  import { onMount } from 'svelte';
  import { ApiError } from '$lib/api/client';
  import { dashboardApi, type SuggestedPerson } from '$lib/api/dashboard.api';
  import { loadDashboardOverview, pushToast, toggleLiveFollowUser } from '$lib/stores';
  import { Avatar, Icon, Spinner } from '$ui';

  interface Props {
    initialTab?: 'followers' | 'following' | 'discover';
    onClose: () => void;
  }

  let { initialTab = 'followers', onClose }: Props = $props();

  let activeTab = $state<'followers' | 'following' | 'discover'>('followers');
  let followers = $state<SuggestedPerson[]>([]);
  let following = $state<SuggestedPerson[]>([]);
  let people = $state<SuggestedPerson[]>([]);
  let searchQuery = $state('');
  let loading = $state(false);
  let busyUserId = $state<string | null>(null);

  async function loadTabData(tab: 'followers' | 'following' | 'discover', query = ''): Promise<void> {
    loading = true;
    try {
      if (tab === 'followers') {
        followers = await dashboardApi.listFollowers();
      } else if (tab === 'following') {
        following = await dashboardApi.listFollowing();
      } else {
        people = await dashboardApi.searchPeople(query);
      }
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not load network list',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    activeTab = initialTab;
    void loadTabData(initialTab);
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function switchTab(tab: 'followers' | 'following' | 'discover'): void {
    activeTab = tab;
    void loadTabData(tab, searchQuery);
  }

  async function handleFollowToggle(person: SuggestedPerson): Promise<void> {
    busyUserId = person.id;
    try {
      const res = await toggleLiveFollowUser(person.id);
      followers = followers.map((p) => (p.id === person.id ? { ...p, isFollowing: res.following } : p));
      people = people.map((p) => (p.id === person.id ? { ...p, isFollowing: res.following } : p));
      if (res.following) {
        if (!following.some((p) => p.id === person.id)) {
          following = [{ ...person, isFollowing: true }, ...following];
        }
      } else {
        following = following.filter((p) => p.id !== person.id);
      }
      void loadDashboardOverview();
      pushToast({
        tone: 'success',
        title: res.following ? `Following ${person.name}` : `Unfollowed ${person.name}`,
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Could not update follow status',
        message: err instanceof ApiError ? err.message : 'Please try again.',
      });
    } finally {
      busyUserId = null;
    }
  }

  const activeList = $derived(
    activeTab === 'followers' ? followers : activeTab === 'following' ? following : people,
  );
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B4B]/55 p-4 backdrop-blur-xs"
  role="dialog"
  aria-modal="true"
  aria-label="Followers and Following network"
>
  <div class="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E8EAF6] bg-white shadow-2xl">
    <div class="flex items-center justify-between border-b border-[#F1F2FA] px-5 py-4">
      <div>
        <h2 class="text-base font-extrabold text-[#1E1B4B]">Your Collab47 Network</h2>
        <p class="text-xs text-slate-500">Manage followers, following, and discover builders to follow</p>
      </div>
      <button
        type="button"
        onclick={onClose}
        aria-label="Close network modal"
        class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-[#1E1B4B]"
      >
        <Icon name="x" size={16} />
      </button>
    </div>

    <div class="flex items-center gap-1.5 border-b border-[#F1F2FA] px-5 py-2.5">
      <button
        type="button"
        onclick={() => switchTab('followers')}
        class="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition {activeTab === 'followers'
          ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white'
          : 'text-slate-600 hover:bg-[#F3F1FF] hover:text-[#5B3DF5]'}"
      >
        Followers
      </button>
      <button
        type="button"
        onclick={() => switchTab('following')}
        class="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition {activeTab === 'following'
          ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white'
          : 'text-slate-600 hover:bg-[#F3F1FF] hover:text-[#5B3DF5]'}"
      >
        Following
      </button>
      <button
        type="button"
        onclick={() => switchTab('discover')}
        class="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition {activeTab === 'discover'
          ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white'
          : 'text-slate-600 hover:bg-[#F3F1FF] hover:text-[#5B3DF5]'}"
      >
        Discover People
      </button>
    </div>

    {#if activeTab === 'discover'}
      <form
        class="flex items-center gap-2 border-b border-[#F1F2FA] px-5 py-3"
        onsubmit={(e) => {
          e.preventDefault();
          void loadTabData('discover', searchQuery);
        }}
      >
        <input
          type="search"
          bind:value={searchQuery}
          placeholder="Search people by name, @handle, or college..."
          class="flex-1 rounded-xl border border-[#E8EAF6] bg-[#F8F9FE] px-3 py-2 text-xs text-slate-800 focus:border-[#6D4AFF] focus:bg-white focus:outline-none"
        />
        <button
          type="submit"
          class="cursor-pointer rounded-xl bg-[#F3F1FF] px-3.5 py-2 text-xs font-bold text-[#5B3DF5] hover:bg-[#E7E3FF]"
        >
          Search
        </button>
      </form>
    {/if}

    <div class="flex flex-1 flex-col gap-2.5 overflow-y-auto p-5">
      {#if loading}
        <div class="flex justify-center py-8">
          <Spinner label="Loading people..." size="md" />
        </div>
      {:else if activeList.length === 0}
        <div class="rounded-xl bg-[#F8F9FE] px-4 py-8 text-center text-xs text-slate-500">
          {#if activeTab === 'followers'}
            No followers yet. Share a project or feed post to attract collaborators!
          {:else if activeTab === 'following'}
            You are not following anyone yet. Open <strong>Discover People</strong> to follow innovators.
          {:else}
            No matching Collab47 profiles found.
          {/if}
        </div>
      {:else}
        {#each activeList as person (person.id)}
          <div class="flex items-center justify-between gap-3 rounded-xl border border-[#F1F2FA] bg-[#FAF9FF]/60 p-3">
            <a
              href="/u/{person.handle}"
              onclick={onClose}
              class="flex min-w-0 items-center gap-2.5 no-underline hover:no-underline"
            >
              <Avatar name={person.name} src={person.avatarUrl} size="sm" />
              <div class="min-w-0">
                <strong class="block truncate text-xs font-bold text-[#1E1B4B]">{person.name}</strong>
                <span class="block truncate text-[11px] text-slate-500">
                  @{person.handle} · {person.headline ?? person.college ?? person.accountType}
                </span>
              </div>
            </a>
            <button
              type="button"
              disabled={busyUserId === person.id}
              onclick={() => void handleFollowToggle(person)}
              class="shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition disabled:opacity-60 {person.isFollowing
                ? 'border-[#DDD6FE] bg-[#F3F1FF] text-[#5B3DF5] hover:bg-rose-50 hover:text-rose-600'
                : 'border-[#6D4AFF] bg-[#6D4AFF] text-white hover:brightness-110'}"
            >
              {#if person.isFollowing}
                Following
              {:else if activeTab === 'followers'}
                Follow Back
              {:else}
                + Follow
              {/if}
            </button>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
