<script lang="ts">
  interface Props {
    id: string;
    label: string;
    description?: string;
    checked?: boolean;
    disabled?: boolean;
  }

  let {
    id,
    label,
    description,
    checked = $bindable(false),
    disabled = false,
  }: Props = $props();
</script>

<label class="inline-flex cursor-pointer items-start gap-2.5 select-none" for={id}>
  <input
    {id}
    type="checkbox"
    bind:checked
    {disabled}
    class="mt-0.5 h-4 w-4 cursor-pointer rounded accent-brand"
  />
  <span class="flex flex-col gap-0.5">
    <span class="text-sm font-medium text-slate-900">{label}</span>
    {#if description}
      <span class="text-xs text-slate-500">{description}</span>
    {/if}
  </span>
</label>
