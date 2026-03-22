<script lang="ts">
  import type { PaletteScalar } from '../../lib/scheme';

  let { entry, onupdate, ondelete, isSelected, onselect }:
    { entry: PaletteScalar; onupdate: (e: PaletteScalar) => void; ondelete: () => void;
      isSelected: boolean; onselect: () => void } = $props();
</script>

<div class="scalar-row" class:selected={isSelected} onclick={onselect}>
  <span class="var-name">{entry.name}</span>
  <span class="val-display">{entry.value.toFixed(3)}</span>
  <button class="del-btn" onclick={(e) => { e.stopPropagation(); ondelete(); }}>&#x2715;</button>
</div>

<style>
  .scalar-row { display: flex; align-items: center; gap: 8px; background: var(--bg-1); border-radius: 4px; padding: 5px 8px; margin-bottom: 4px; min-height: 32px; box-sizing: border-box; flex: 1; min-width: 0; cursor: pointer; }
  .scalar-row:hover { background: var(--bg-2); }
  .scalar-row.selected { background: var(--bg-2); outline: 1px solid var(--accent); outline-offset: -1px; }
  .var-name { color: var(--accent); font-family: monospace; font-size: 11px; width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .val-display { color: var(--text-3); font-family: monospace; font-size: 11px; flex: 1; }
  .del-btn { background: none; border: none; color: var(--text-3); font-size: 11px; cursor: pointer; padding: 0 4px; }
  .del-btn:hover { color: var(--error); }
</style>
