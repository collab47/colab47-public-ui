<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    tone?: 'dark' | 'light';
    href?: string;
    showText?: boolean;
  }

  let { size = 'md', tone = 'dark', href = '/', showText = true }: Props = $props();

  const sizeStyles: Record<'sm' | 'md' | 'lg', { iconClass: string; textClass: string }> = {
    sm: { iconClass: 'h-8 w-8', textClass: 'text-base' },
    md: { iconClass: 'h-10 w-10 sm:h-11 sm:w-11', textClass: 'text-lg sm:text-xl' },
    lg: { iconClass: 'h-12 w-12 sm:h-13 sm:w-13', textClass: 'text-xl sm:text-2xl' },
  };
</script>

<a
  {href}
  class="inline-flex shrink-0 items-center gap-2 bg-transparent no-underline transition-opacity hover:opacity-90 hover:no-underline"
  aria-label="Collab47.com Home"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    role="img"
    aria-label="Collab47 logo"
    class="block shrink-0 {sizeStyles[size].iconClass}"
  >
    <circle cx="181" cy="256" r="119" fill="none" stroke="#ff7015" stroke-width="56" />
    <circle cx="334" cy="256" r="119" fill="none" stroke="#10b987" stroke-width="56" />
    <circle cx="256" cy="256" r="25" fill="#ffffff" />
  </svg>
  {#if showText}
    <span
      class="font-extrabold tracking-tight leading-none {sizeStyles[size].textClass} {tone ===
      'light'
        ? 'text-white'
        : 'text-black'}"
    >
      Collab47.com
    </span>
  {/if}
</a>
