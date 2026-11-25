<script lang="ts">
  import { COUNTRY_DIAL_CODES, type CountryDialCodeOption } from '$lib/data/country-codes';

  interface Props {
    id?: string;
    label?: string;
    countryCode?: string;
    mobileNumber?: string;
    required?: boolean;
    disabled?: boolean;
    countryCodeError?: string;
    mobileNumberError?: string;
    onCountryCodeInput?: (value: string) => void;
    onCountryCodeBlur?: () => void;
    onMobileNumberInput?: (value: string) => void;
    onMobileNumberBlur?: () => void;
  }

  let {
    id = 'register-mobile',
    label = 'Mobile Number',
    countryCode = $bindable('+91'),
    mobileNumber = $bindable(''),
    required = true,
    disabled = false,
    countryCodeError,
    mobileNumberError,
    onCountryCodeInput,
    onCountryCodeBlur,
    onMobileNumberInput,
    onMobileNumberBlur,
  }: Props = $props();

  let dropdownOpen = $state(false);
  let searchQuery = $state('');
  let wrapperEl = $state<HTMLDivElement | null>(null);

  const filteredCountries = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter(
      (item) =>
        item.country.toLowerCase().includes(q) ||
        item.iso.toLowerCase().includes(q) ||
        item.dialCode.toLowerCase().includes(q) ||
        item.dialCode.replace('+', '').startsWith(q.replace('+', '')),
    );
  });

  const activeIso = $derived(
    COUNTRY_DIAL_CODES.find((c) => c.dialCode === countryCode.trim())?.iso ?? null,
  );

  const combinedError = $derived(countryCodeError || mobileNumberError);

  function handleWindowPointerDown(event: PointerEvent): void {
    if (dropdownOpen && wrapperEl && !wrapperEl.contains(event.target as Node)) {
      dropdownOpen = false;
      searchQuery = '';
    }
  }

  function handleCountryInput(event: Event): void {
    const raw = (event.currentTarget as HTMLInputElement).value;
    const sanitized = raw.replace(/[^+\d]/g, '').slice(0, 5);
    countryCode = sanitized;
    searchQuery = sanitized;
    dropdownOpen = true;
    onCountryCodeInput?.(sanitized);
  }

  function handleCountryBlur(): void {
    const trimmed = countryCode.trim();
    if (trimmed && !trimmed.startsWith('+')) {
      countryCode = `+${trimmed}`;
    }
    onCountryCodeBlur?.();
  }

  function selectCountry(option: CountryDialCodeOption): void {
    countryCode = option.dialCode;
    searchQuery = '';
    dropdownOpen = false;
    onCountryCodeInput?.(option.dialCode);
    onCountryCodeBlur?.();
  }

  function handleNumberInput(event: Event): void {
    const raw = (event.currentTarget as HTMLInputElement).value;
    const sanitized = raw.replace(/[^\d\s\-()]/g, '').slice(0, 18);
    mobileNumber = sanitized;
    onMobileNumberInput?.(sanitized);
  }

  function handleCountryKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      dropdownOpen = false;
      searchQuery = '';
    } else if (event.key === 'ArrowDown') {
      dropdownOpen = true;
    } else if (event.key === 'Enter' && dropdownOpen && filteredCountries.length > 0) {
      event.preventDefault();
      const first = filteredCountries[0];
      if (first) selectCountry(first);
    }
  }
</script>

<svelte:window onpointerdown={handleWindowPointerDown} />

<div class="flex flex-col gap-1.5" bind:this={wrapperEl}>
  <label for="{id}-number" class="text-xs font-semibold text-slate-700">
    {label}
    {#if required}
      <span class="text-rose-500">*</span>
    {/if}
  </label>

  <div class="flex items-stretch gap-2">
    <!-- Country Code Selection Dropdown + Editable Textbox -->
    <div class="relative w-[134px] shrink-0">
      <div
        class="flex h-11 items-center rounded-xl border bg-white px-2.5 transition focus-within:ring-2 {countryCodeError
          ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-200'
          : 'border-slate-200 focus-within:border-logo-saffron focus-within:ring-logo-saffron/20'}"
      >
        {#if activeIso}
          <span
            class="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-600"
          >
            {activeIso}
          </span>
        {/if}
        <input
          id="{id}-country-code"
          type="text"
          inputmode="tel"
          autocomplete="tel-country-code"
          aria-label="Country calling code"
          aria-expanded={dropdownOpen}
          aria-controls="{id}-country-listbox"
          role="combobox"
          value={countryCode}
          placeholder="+91"
          maxlength={5}
          {disabled}
          onfocus={() => {
            dropdownOpen = true;
            searchQuery = '';
          }}
          oninput={handleCountryInput}
          onblur={handleCountryBlur}
          onkeydown={handleCountryKeyDown}
          class="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="button"
          tabindex={-1}
          aria-label="Toggle country code list"
          {disabled}
          onclick={() => {
            dropdownOpen = !dropdownOpen;
            searchQuery = '';
          }}
          class="ml-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-transform {dropdownOpen ? 'rotate-180' : ''}"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {#if dropdownOpen}
        <div
          id="{id}-country-listbox"
          role="listbox"
          class="absolute left-0 z-40 mt-1.5 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div class="border-b border-slate-100 p-2">
            <input
              type="text"
              placeholder="Search country or +code..."
              bind:value={searchQuery}
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-logo-saffron focus:bg-white focus:outline-none"
            />
          </div>
          <ul class="max-h-56 overflow-y-auto py-1">
            {#if filteredCountries.length === 0}
              <li class="px-3 py-2 text-xs text-slate-500">
                Type any code directly (e.g. +91, +1)
              </li>
            {:else}
              {#each filteredCountries as option (`${option.iso}-${option.dialCode}`)}
                {@const isSelected = countryCode.trim() === option.dialCode && activeIso === option.iso}
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onmousedown={(e) => {
                      e.preventDefault();
                      selectCountry(option);
                    }}
                    class="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-xs transition {isSelected
                      ? 'bg-logo-saffron-soft/70 font-bold text-logo-saffron'
                      : 'text-slate-700 hover:bg-slate-50'}"
                  >
                    <span class="flex min-w-0 items-center gap-2">
                      <span class="w-6 shrink-0 font-mono text-[11px] font-bold text-slate-500">
                        {option.iso}
                      </span>
                      <span class="truncate">{option.country}</span>
                    </span>
                    <span class="shrink-0 font-mono font-semibold text-slate-900">
                      {option.dialCode}
                    </span>
                  </button>
                </li>
              {/each}
            {/if}
          </ul>
        </div>
      {/if}
    </div>

    <!-- Mobile Number Textbox -->
    <div class="flex-1">
      <input
        id="{id}-number"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        value={mobileNumber}
        placeholder="98765 43210"
        maxlength={18}
        {required}
        {disabled}
        oninput={handleNumberInput}
        onblur={() => onMobileNumberBlur?.()}
        class="h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:ring-2 focus:outline-none {mobileNumberError
          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
          : 'border-slate-200 focus:border-logo-saffron focus:ring-logo-saffron/20'}"
      />
    </div>
  </div>

  {#if combinedError}
    <span class="text-xs font-medium text-rose-600">{combinedError}</span>
  {/if}
</div>
