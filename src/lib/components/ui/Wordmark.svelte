<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    tone?: 'dark' | 'light';
    href?: string;
    showText?: boolean;
  }

  let { size = 'md', tone = 'dark', href = '/', showText = true }: Props = $props();

  const imgSize: Record<
    'sm' | 'md' | 'lg',
    { className: string; textClass: string; width: number; height: number }
  > = {
    sm: { className: 'h-8 w-auto', textClass: 'text-base', width: 36, height: 32 },
    md: { className: 'h-10 w-auto sm:h-11', textClass: 'text-lg sm:text-xl', width: 48, height: 42 },
    lg: { className: 'h-12 w-auto sm:h-13', textClass: 'text-xl sm:text-2xl', width: 58, height: 50 },
  };

  const logoSrc = $derived(
    tone === 'light' ? '/images/logo/logo-light.svg' : '/images/logo/logo.svg',
  );
</script>

<a
  {href}
  class="inline-flex shrink-0 items-center gap-2 bg-transparent no-underline transition-opacity hover:opacity-90 hover:no-underline"
  aria-label="collab47.com Home"
>
  <img
    src={logoSrc}
    alt="Collab47 logo"
    width={imgSize[size].width}
    height={imgSize[size].height}
    decoding="async"
    class="block bg-transparent object-contain {imgSize[size].className}"
  />
  {#if showText}
    <span
      class="font-extrabold tracking-tight leading-none {imgSize[size].textClass} {tone === 'light'
        ? 'text-white'
        : 'text-[#1E1B4B]'}"
    >
      collab47<span
        class={tone === 'light'
          ? 'text-[#F0ABFC]'
          : 'bg-gradient-to-r from-[#4F46E5] via-[#6D4AFF] to-[#C026D3] bg-clip-text text-transparent'}
        >.com</span
      >
    </span>
  {/if}
</a>
