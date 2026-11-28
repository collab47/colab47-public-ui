<script lang="ts">
  import type { BadgeCategory, BadgeTier, UserBadgesSummary } from '$lib/api/badges.api';
  import Badge from './Badge.svelte';
  import Icon, { type IconName } from './Icon.svelte';

  interface Props {
    summary: UserBadgesSummary;
    compact?: boolean;
    publicOnly?: boolean;
  }

  let { summary, compact = false, publicOnly = false }: Props = $props();

  let selectedCategory = $state<'all' | BadgeCategory>('all');

  const CATEGORY_TABS: ReadonlyArray<{ id: 'all' | BadgeCategory; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Videos' },
    { id: 'posts', label: 'Posts' },
    { id: 'feeds', label: 'Feeds' },
    { id: 'projects', label: 'Projects' },
    { id: 'profile', label: 'Profile' },
  ];

  const TIER_STYLES: Record<BadgeTier, { ring: string; bg: string; text: string; pill: 'saffron' | 'moss' | 'neutral' | 'ink' }> = {
    bronze: {
      ring: 'border-amber-300/80',
      bg: 'bg-amber-50/90',
      text: 'text-amber-700',
      pill: 'saffron',
    },
    silver: {
      ring: 'border-slate-300',
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      pill: 'neutral',
    },
    gold: {
      ring: 'border-yellow-400',
      bg: 'bg-yellow-50/90',
      text: 'text-yellow-700',
      pill: 'saffron',
    },
    platinum: {
      ring: 'border-violet-400',
      bg: 'bg-violet-50/90',
      text: 'text-violet-700',
      pill: 'ink',
    },
  };

  const VALID_ICONS = new Set<string>([
    'image',
    'eye',
    'message-square',
    'heart',
    'sparkles',
    'rocket',
    'layers',
    'award',
    'user',
    'users',
    'shield-check',
  ]);

  function resolveIcon(name: string): IconName {
    return (VALID_ICONS.has(name) ? name : 'award') as IconName;
  }

  const visibleBadges = $derived.by(() => {
    const base = publicOnly ? summary.badges.filter((b) => b.earned) : summary.badges;
    if (selectedCategory === 'all') return base;
    return base.filter((b) => b.category === selectedCategory);
  });

  const levelProgress = $derived.by(() => {
    if (summary.nextLevelPoints <= 0) return 100;
    if (summary.totalPoints >= summary.nextLevelPoints) return 100;
    return Math.min(100, Math.round((summary.totalPoints / summary.nextLevelPoints) * 100));
  });
</script>

{#if compact}
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2 rounded-xl border border-[#DDD6FE] bg-[#FAF9FF] px-3 py-2.5">
      <div>
        <span class="text-[11px] font-bold uppercase tracking-wide text-[#6D4AFF]">
          Level {summary.level} · {summary.levelTitle}
        </span>
        <strong class="block text-sm font-extrabold text-[#1E1B4B]">
          {summary.earnedCount} / {summary.totalBadges} Badges · {summary.totalPoints} pts
        </strong>
      </div>
      <Icon name="award" size={20} class="shrink-0 text-amber-500" />
    </div>

    {#if summary.badges.filter((b) => b.earned).length === 0}
      <p class="text-xs text-slate-500">
        Upload images/videos, publish posts &amp; projects, or update your profile to unlock badges!
      </p>
    {:else}
      <div class="flex flex-wrap gap-1.5">
        {#each summary.badges.filter((b) => b.earned).slice(0, 6) as badge (badge.badgeCode)}
          {@const style = TIER_STYLES[badge.tier]}
          <span
            title="{badge.name}: {badge.description}"
            class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold {style.ring} {style.bg} {style.text}"
          >
            <Icon name={resolveIcon(badge.iconName)} size={12} />
            <span>{badge.name}</span>
          </span>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="flex flex-col gap-5">
    <!-- Level & Points Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DDD6FE] bg-gradient-to-r from-[#FAF9FF] via-white to-[#FFF7ED] p-4">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-sm">
          <Icon name="award" size={24} />
        </span>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <strong class="text-lg font-extrabold text-[#1E1B4B]">
              Level {summary.level} · {summary.levelTitle}
            </strong>
            <Badge tone="saffron">{summary.totalPoints} pts</Badge>
          </div>
          <p class="mt-0.5 text-xs text-slate-600">
            {summary.earnedCount} of {summary.totalBadges} badges unlocked across Images, Videos, Posts, Feeds, Projects &amp; Profile
          </p>
        </div>
      </div>

      <div class="min-w-[180px]">
        <div class="flex items-center justify-between text-[11px] font-bold text-slate-600">
          <span>Level Progress</span>
          <span>{summary.totalPoints} / {summary.nextLevelPoints} pts</span>
        </div>
        <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            class="h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#D45F00] transition-all duration-500"
            style="width: {levelProgress}%;"
          ></div>
        </div>
      </div>
    </div>

    <!-- Category Filter Pills -->
    {#if !publicOnly}
      <div class="flex flex-wrap gap-1.5">
        {#each CATEGORY_TABS as tab (tab.id)}
          <button
            type="button"
            onclick={() => (selectedCategory = tab.id)}
            class="cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold transition {selectedCategory === tab.id
              ? 'bg-[#6D4AFF] text-white shadow-xs'
              : 'bg-[#F3F1FF] text-slate-600 hover:text-[#5B3DF5]'}"
          >
            {tab.label}
          </button>
        {/each}
      </div>
    {/if}

    <!-- Badges Grid -->
    {#if visibleBadges.length === 0}
      <p class="text-sm text-slate-500">No badges unlocked in this category yet.</p>
    {:else}
      <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {#each visibleBadges as badge (badge.badgeCode)}
          {@const style = TIER_STYLES[badge.tier]}
          <div
            class="flex flex-col justify-between gap-3 rounded-2xl border p-4 transition {badge.earned
              ? `${style.ring} ${style.bg} shadow-xs`
              : 'border-slate-200 bg-white opacity-85'}"
          >
            <div class="flex items-start justify-between gap-2.5">
              <div class="flex items-start gap-2.5">
                <span
                  class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border {badge.earned
                    ? `${style.ring} bg-white ${style.text}`
                    : 'border-slate-200 bg-slate-100 text-slate-400'}"
                >
                  <Icon name={resolveIcon(badge.iconName)} size={19} />
                </span>
                <div>
                  <strong class="block text-sm font-extrabold text-slate-900">
                    {badge.name}
                  </strong>
                  <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <Badge tone={badge.earned ? style.pill : 'neutral'}>{badge.tier}</Badge>
                    <span class="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {badge.category}
                    </span>
                  </div>
                </div>
              </div>
              <span class="shrink-0 text-xs font-extrabold {badge.earned ? style.text : 'text-slate-400'}">
                +{badge.points}
              </span>
            </div>

            <p class="text-xs leading-relaxed text-slate-600">{badge.description}</p>

            {#if badge.earned}
              <div class="flex items-center justify-between border-t border-black/5 pt-2 text-[11px] font-semibold text-logo-green">
                <span class="inline-flex items-center gap-1">
                  <Icon name="check-circle" size={13} />
                  <span>Unlocked</span>
                </span>
                {#if badge.earnedAt}
                  <span class="text-slate-500">
                    {new Date(badge.earnedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                {/if}
              </div>
            {:else}
              <div class="flex flex-col gap-1 border-t border-slate-100 pt-2">
                <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Progress</span>
                  <span>
                    {Math.min(badge.currentValue, badge.criteriaThreshold)} / {badge.criteriaThreshold}
                  </span>
                </div>
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full bg-[#6D4AFF] transition-all"
                    style="width: {badge.progressPercent}%;"
                  ></div>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}
