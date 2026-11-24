<script lang="ts">
  import Icon, { type IconName } from './Icon.svelte';

  interface TabItem {
    id: string;
    label: string;
    icon?: IconName;
    count?: number;
  }

  interface Props {
    tabs: readonly TabItem[];
    activeTab?: string;
    onchange?: (tabId: string) => void;
  }

  let { tabs, activeTab = $bindable(''), onchange }: Props = $props();

  function selectTab(id: string): void {
    activeTab = id;
    onchange?.(id);
  }
</script>

<div class="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2.5" role="tablist">
  {#each tabs as tab (tab.id)}
    {@const isActive = activeTab === tab.id}
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      class="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition {isActive ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-transparent bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'}"
      onclick={() => selectTab(tab.id)}
    >
      {#if tab.icon}
        <Icon name={tab.icon} size={16} />
      {/if}
      <span>{tab.label}</span>
      {#if tab.count !== undefined}
        <span class="rounded-full bg-slate-900/10 px-1.5 py-0.5 text-xs">{tab.count}</span>
      {/if}
    </button>
  {/each}
</div>
