<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    tone?: 'dark' | 'light';
    href?: string;
  }

  let { size = 'md', tone = 'dark', href = '/' }: Props = $props();

  const imgSize: Record<'sm' | 'md' | 'lg', { className: string; width: number; height: number }> = {
    sm: { className: 'h-9 w-auto', width: 41, height: 36 },
    md: { className: 'h-12 w-auto', width: 55, height: 48 },
    lg: { className: 'h-14 w-auto', width: 64, height: 56 },
  };

  const logoSrc = $derived(
    tone === 'light' ? '/images/logo/logo-light.svg' : '/images/logo/logo.svg',
  );
</script>

<a
  {href}
  class="inline-flex shrink-0 items-center bg-transparent no-underline transition-opacity hover:opacity-90 hover:no-underline"
  aria-label="Collab47 Home"
>
  <img
    src={logoSrc}
    alt="Collab47"
    width={imgSize[size].width}
    height={imgSize[size].height}
    decoding="async"
    class="block bg-transparent object-contain {imgSize[size].className}"
  />
</a>
