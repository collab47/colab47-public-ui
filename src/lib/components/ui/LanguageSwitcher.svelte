<script lang="ts">
  import { onMount } from 'svelte';
  import {
    SUPPORTED_LANGUAGES,
    locale,
    setLocale,
    t,
    type Locale,
  } from '$lib/stores';
  import Icon from './Icon.svelte';

  interface Props {
    align?: 'left' | 'right';
  }

  let { align = 'right' }: Props = $props();
  let open = $state(false);
  let containerEl = $state<HTMLDivElement | null>(null);

  const activeLanguage = $derived(
    SUPPORTED_LANGUAGES.find((l) => l.code === $locale) ?? SUPPORTED_LANGUAGES[0],
  );

  function chooseLanguage(code: Locale): void {
    setLocale(code);
    open = false;
  }

  onMount(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (open && containerEl && !containerEl.contains(event.target as Node)) {
        open = false;
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && open) {
        open = false;
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<div class="relative inline-block" bind:this={containerEl}>
  <button
    type="button"
    class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-logo-green-border bg-logo-green-soft text-logo-green transition hover:border-logo-saffron hover:bg-logo-saffron-soft hover:text-logo-saffron"
    onclick={() => (open = !open)}
    aria-label="{$t.nav.switchLanguage} ({activeLanguage.nativeName})"
    aria-haspopup="menu"
    aria-expanded={open}
    title="{$t.nav.switchLanguage}: {activeLanguage.nativeName}"
  >
    <Icon name="globe" size={18} />
  </button>

  {#if open}
    <div
      role="menu"
      aria-label={$t.nav.switchLanguage}
      class="absolute z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl {align === 'left'
        ? 'left-0'
        : 'right-0'}"
    >
      <div class="px-2.5 py-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-400">
        {$t.nav.switchLanguage}
      </div>
      {#each SUPPORTED_LANGUAGES as lang (lang.code)}
        {@const selected = lang.code === $locale}
        <button
          type="button"
          role="menuitemradio"
          aria-checked={selected}
          onclick={() => chooseLanguage(lang.code)}
          class="flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left text-sm transition {selected
            ? 'bg-logo-saffron-soft font-bold text-logo-saffron'
            : 'text-slate-700 hover:bg-logo-green-soft hover:text-logo-green'}"
        >
          <span class="flex flex-col leading-tight">
            <span>{lang.nativeName}</span>
            <span class="text-[11px] font-normal text-slate-400">{lang.englishName}</span>
          </span>
          {#if selected}
            <Icon name="check" size={15} class="text-logo-saffron" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
