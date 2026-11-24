<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ensureFreshSession } from '$lib/api/client';
  import ProjectEditorForm from '$lib/components/projects/ProjectEditorForm.svelte';
  import { authState, t } from '$lib/stores';
  import { Spinner } from '$ui';

  let ready = $state(false);

  onMount(async () => {
    const ok = await ensureFreshSession();
    if (!ok || !authState.get().accessToken) {
      await goto('/login');
      return;
    }
    ready = true;
  });
</script>

<svelte:head>
  <title>{$t.forms.createNewProject} · Collab47</title>
</svelte:head>

{#if !ready}
  <div class="flex min-h-[60vh] flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <p class="text-sm font-medium text-slate-600">{$t.ui.loadingDashboard}</p>
  </div>
{:else}
  <ProjectEditorForm mode="create" />
{/if}
