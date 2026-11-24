<script lang="ts">
  interface Props {
    label?: string;
  }

  let { label = 'or' }: Props = $props();
</script>

<div class="my-4 flex items-center gap-3" role="separator">
  <span class="h-px flex-1 bg-slate-200" aria-hidden="true"></span>
  <span class="text-xs font-medium lowercase text-slate-500">{label}</span>
  <span class="h-px flex-1 bg-slate-200" aria-hidden="true"></span>
</div>
