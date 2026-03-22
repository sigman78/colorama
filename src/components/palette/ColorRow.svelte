<script lang="ts">
  import type { PaletteColor } from '../../lib/scheme';
  import { oklchToHex } from '../../lib/color';

  let { entry, onupdate, ondelete, isSelected, onselect }:
    { entry: PaletteColor; onupdate: (e: PaletteColor) => void; ondelete: () => void;
      isSelected: boolean; onselect: () => void } = $props();

  let hex = $derived(oklchToHex(entry.color));
</script>

<div class="color-row" class:selected={isSelected} onclick={onselect}>
  <div class="swatch" style="background: oklch({entry.color.l} {entry.color.c} {entry.color.h}deg)"></div>
  <span class="var-name">{entry.name}</span>
  <span class="color-val mono">{hex}</span>
  <button class="del-btn" onclick={(e) => { e.stopPropagation(); ondelete(); }}>&#x2715;</button>
</div>

<style>
  .color-row { display: flex; align-items: center; gap: 8px; background: var(--bg-1); border-radius: 4px; padding: 5px 8px; margin-bottom: 4px; min-height: 32px; box-sizing: border-box; flex: 1; min-width: 0; cursor: pointer; }
  .color-row:hover { background: var(--bg-2); }
  .color-row.selected { background: var(--bg-2); outline: 1px solid var(--accent); outline-offset: -1px; }
  .swatch { width: 18px; height: 18px; border-radius: 3px; flex-shrink: 0; }
  .var-name { color: var(--accent); font-family: monospace; font-size: 11px; width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .color-val { color: var(--text-3); font-size: 10px; flex: 1; }
  .del-btn { background: none; border: none; color: var(--text-3); font-size: 11px; cursor: pointer; padding: 0 4px; }
  .del-btn:hover { color: var(--error); }
</style>
