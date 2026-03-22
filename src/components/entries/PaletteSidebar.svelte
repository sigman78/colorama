<script lang="ts">
  import { scheme } from '../../../stores/scheme';
  import { oklchToHex } from '../../../lib/color';
</script>

<div class="sidebar">
  <div class="section-label">Colors</div>
  {#each $scheme.palette.colors as c}
    <div class="ref-row">
      <div class="ref-swatch" style="background: oklch({c.color.l} {c.color.c} {c.color.h}deg)"></div>
      <span class="ref-name">${c.name}</span>
      <span class="ref-val mono">{oklchToHex(c.color)}</span>
    </div>
  {/each}

  {#if $scheme.palette.scalars.length > 0}
    <div class="section-label" style="margin-top: 10px">Scalars</div>
    {#each $scheme.palette.scalars as s}
      <div class="scalar-row">
        <span class="ref-name">${s.name}</span>
        <span class="ref-val mono">{s.value}</span>
      </div>
    {/each}
  {/if}
</div>

<style>
  .sidebar { width: 180px; flex-shrink: 0; border-right: 1px solid var(--border); overflow-y: auto; padding: 10px 8px; background: var(--bg-2); }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-3); margin-bottom: 6px; }
  .ref-row, .scalar-row { display: flex; align-items: center; gap: 6px; padding: 3px 2px; border-radius: 3px; margin-bottom: 2px; }
  .ref-swatch { width: 13px; height: 13px; border-radius: 2px; flex-shrink: 0; }
  .ref-name { color: var(--accent); font-family: monospace; font-size: 11px; }
  .ref-val { color: var(--text-3); font-size: 9px; margin-left: auto; }
</style>
