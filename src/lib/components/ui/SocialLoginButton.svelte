<script lang="ts">
  import { signIn } from '@auth/sveltekit/client';

  interface Props {
    provider?: 'google';
    label?: string;
    redirectTo?: string;
    fullWidth?: boolean;
    size?: 'md' | 'lg';
  }

  let {
    provider = 'google',
    label = 'Continue with Google',
    redirectTo = '/profile',
    fullWidth = true,
    size = 'lg',
  }: Props = $props();

  let loading = $state(false);

  async function handleSocialLogin(): Promise<void> {
    loading = true;
    try {
      await signIn(provider, { redirectTo });
    } catch {
      loading = false;
    }
  }
</script>

<button
  type="button"
  class="inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white font-semibold whitespace-nowrap text-slate-900 shadow-xs transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-65 cursor-pointer {size === 'lg' ? 'px-5 py-3 text-sm' : 'px-4 py-2.5 text-sm'} {fullWidth ? 'w-full' : ''}"
  disabled={loading}
  aria-busy={loading}
  onclick={handleSocialLogin}
>
  {#if loading}
    <span
      class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand"
      aria-hidden="true"
    ></span>
  {:else if provider === 'google'}
    <svg class="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3a7.17 7.17 0 0 1-10.67-3.77H1.4v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.39 14.32a7.2 7.2 0 0 1 0-4.64V6.59H1.4a12 12 0 0 0 0 10.82l3.99-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.4 6.59l3.99 3.09A7.16 7.16 0 0 1 12 4.75z"
      />
    </svg>
  {/if}
  <span>{loading ? 'Connecting to Google...' : label}</span>
</button>
