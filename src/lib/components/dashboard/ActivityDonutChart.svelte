<script lang="ts">
  interface Props {
    totalProjects: number;
    codeCount: number;
    mediaCount: number;
    documentsCount: number;
    otherCount: number;
  }

  let { totalProjects, codeCount, mediaCount, documentsCount, otherCount }: Props = $props();

  const segments = $derived.by(() => {
    const raw = [
      { key: 'code', label: 'Code', value: Math.max(0, Number(codeCount) || 0), color: '#7C3AED' },
      { key: 'media', label: 'Media', value: Math.max(0, Number(mediaCount) || 0), color: '#3B82F6' },
      { key: 'documents', label: 'Docs', value: Math.max(0, Number(documentsCount) || 0), color: '#22C55E' },
      { key: 'other', label: 'Other', value: Math.max(0, Number(otherCount) || 0), color: '#F59E0B' },
    ];
    const sum = raw.reduce((acc, s) => acc + s.value, 0);
    const nonZeroCount = raw.filter((s) => s.value > 0).length;
    const radius = 37;
    const circumference = 2 * Math.PI * radius;

    if (sum === 0) {
      // Draw a subtle 4-segment pastel ring so the rounded chart never looks blank
      const quarter = circumference / 4;
      let offset = 0;
      const items = raw.map((s) => {
        const item = {
          ...s,
          dashArray: `${Math.max(1, quarter - 3)} ${circumference}`,
          dashOffset: -offset,
          percent: 0,
        };
        offset += quarter;
        return item;
      });
      return { radius, circumference, empty: true, sum: 0, items };
    }

    const gap = nonZeroCount > 1 ? 2.5 : 0;
    let offset = 0;
    const items = raw.map((s) => {
      const length = (s.value / sum) * circumference;
      const visibleLen = s.value > 0 ? Math.max(2, length - gap) : 0;
      const item = {
        ...s,
        dashArray: `${visibleLen} ${circumference}`,
        dashOffset: -offset,
        percent: Math.round((s.value / sum) * 100),
      };
      offset += length;
      return item;
    });

    return { radius, circumference, empty: false, sum, items };
  });
</script>

<div class="flex w-full min-w-0 flex-col items-center gap-3.5 overflow-hidden">
  <div class="relative h-[112px] w-[112px] shrink-0">
    <svg
      viewBox="0 0 100 100"
      class="h-full w-full -rotate-90"
      role="img"
      aria-label="Your activity breakdown across {totalProjects} projects"
    >
      <circle
        cx="50"
        cy="50"
        r={segments.radius}
        fill="none"
        stroke="#EEF0FA"
        stroke-width="13"
      />
      {#each segments.items as seg (seg.key)}
        {#if segments.empty}
          <circle
            cx="50"
            cy="50"
            r={segments.radius}
            fill="none"
            stroke={seg.color}
            stroke-opacity="0.28"
            stroke-width="13"
            stroke-dasharray={seg.dashArray}
            stroke-dashoffset={seg.dashOffset}
            stroke-linecap="butt"
          />
        {:else if seg.value > 0}
          <circle
            cx="50"
            cy="50"
            r={segments.radius}
            fill="none"
            stroke={seg.color}
            stroke-width="13"
            stroke-dasharray={seg.dashArray}
            stroke-dashoffset={seg.dashOffset}
            stroke-linecap="butt"
            class="transition-[stroke-dasharray,stroke-dashoffset] duration-700 ease-out"
          >
            <title>{seg.label}: {seg.value} ({seg.percent}%)</title>
          </circle>
        {/if}
      {/each}
    </svg>
    <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
      <strong class="text-lg leading-none font-extrabold text-[#1E1B4B]">{totalProjects}</strong>
      <span class="mt-0.5 text-[10px] font-semibold text-slate-500">Projects</span>
    </div>
  </div>

  <ul class="grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
    {#each segments.items as seg (seg.key)}
      <li class="flex min-w-0 items-center justify-between gap-1.5 rounded-lg bg-[#F8F9FE] px-2 py-1">
        <span class="flex min-w-0 items-center gap-1.5 font-medium text-slate-700">
          <span class="h-2 w-2 shrink-0 rounded-full" style="background-color: {seg.color};"></span>
          <span class="truncate">{seg.label}</span>
        </span>
        <strong class="shrink-0 font-bold text-[#1E1B4B]">{seg.value}</strong>
      </li>
    {/each}
  </ul>
</div>
