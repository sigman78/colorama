<script lang="ts">
  import type { PaletteScalar } from '../../lib/scheme';

  let { entry, onupdate, ondelete }:
    { entry: PaletteScalar; onupdate: (e: PaletteScalar) => void; ondelete: () => void } = $props();
</script>

<div class="scalar-row">
  <input class="var-name" value={entry.name}
    oninput={(e) => onupdate({ ...entry, name: (e.target as HTMLInputElement).value })} />
  <input type="range" min="-2" max="2" step="0.01" value={entry.value} class="slider"
    oninput={(e) => onupdate({ ...entry, value: +(e.target as HTMLInputElement).value })} />
  <input type="number" step="0.01" value={entry.value} class="num-input"
    oninput={(e) => onupdate({ ...entry, value: +(e.target as HTMLInputElement).value })} />
  <button class="del-btn" onclick={ondelete}>&#x2715;</button>
</div>

<style>
  .scalar-row { display: flex; align-items: center; gap: 8px; background: var(--bg-1); border-radius: 4px; padding: 5px 8px; margin-bottom: 4px; }
  .var-name { background: none; border: none; color: var(--accent); font-family: monospace; font-size: 11px; width: 80px; outline: none; border-bottom: 1px solid transparent; }
  .var-name:focus { border-bottom-color: var(--accent); }
  .slider { flex: 1; accent-color: var(--accent); }
  .num-input { width: 60px; background: var(--bg-2); border: 1px solid var(--border); border-radius: 3px; padding: 2px 5px; color: var(--text-0); font-family: monospace; font-size: 11px; }
  .del-btn { background: none; border: none; color: var(--text-3); cursor: pointer; }
  .del-btn:hover { color: var(--error); }
</style>
