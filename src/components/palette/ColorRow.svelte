<script lang="ts">
  import type { PaletteColor } from '../../lib/scheme';
  import ColorPicker from './ColorPicker.svelte';
  import { oklchToHex } from '../../lib/color';
  import { pickerOpenId } from '../../stores/ui';

  let { entry, onupdate, ondelete }:
    { entry: PaletteColor; onupdate: (e: PaletteColor) => void; ondelete: () => void } = $props();

  let isOpen = $derived($pickerOpenId === entry.name);
  let hex = $derived(oklchToHex(entry.color));

  function setName(e: Event) {
    onupdate({ ...entry, name: (e.target as HTMLInputElement).value });
  }
  function togglePicker() {
    pickerOpenId.set(isOpen ? null : entry.name);
  }
</script>

<div class="color-row">
  <div class="swatch" style="background: oklch({entry.color.l} {entry.color.c} {entry.color.h}deg)"></div>
  <input class="var-name" value={entry.name} oninput={setName} />
  <span class="color-val mono">{hex}</span>
  <button class="edit-btn" onclick={togglePicker}>{isOpen ? 'close' : 'edit'}</button>
  <button class="del-btn" onclick={ondelete}>&#x2715;</button>
</div>
{#if isOpen}
  <div class="picker-wrap">
    <ColorPicker color={entry.color} onchange={(c) => onupdate({ ...entry, color: c })} />
  </div>
{/if}

<style>
  .color-row { display: flex; align-items: center; gap: 8px; background: var(--bg-1); border-radius: 4px; padding: 5px 8px; margin-bottom: 4px; }
  .swatch { width: 18px; height: 18px; border-radius: 3px; flex-shrink: 0; }
  .var-name { background: none; border: none; color: var(--accent); font-family: monospace; font-size: 11px; width: 80px; outline: none; border-bottom: 1px solid transparent; }
  .var-name:focus { border-bottom-color: var(--accent); }
  .color-val { color: var(--text-3); font-size: 10px; flex: 1; }
  .edit-btn, .del-btn { background: none; border: none; color: var(--text-3); font-size: 11px; cursor: pointer; padding: 0 4px; }
  .edit-btn:hover { color: var(--accent); }
  .del-btn:hover { color: var(--error); }
  .picker-wrap { padding: 4px 8px 8px 8px; }
</style>
