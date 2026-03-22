<script lang="ts">
  import type { OKLCH } from '../../lib/scheme';
  import ColorPicker from '../palette/ColorPicker.svelte';
  import { oklchToHex } from '../../lib/color';
  import { pickerOpenId } from '../../stores/ui';

  let { label, pickerId, color, onchange }:
    { label: string; pickerId: string; color: OKLCH; onchange: (c: OKLCH) => void } = $props();

  let isOpen = $derived($pickerOpenId === pickerId);
  let hex = $derived(oklchToHex(color));

  function togglePicker() {
    pickerOpenId.set(isOpen ? null : pickerId);
  }
</script>

<div class="color-row">
  <div class="swatch" style="background: oklch({color.l} {color.c} {color.h}deg)"></div>
  <span class="row-label">{label}</span>
  <span class="color-val mono">{hex}</span>
  <button class="edit-btn" onclick={togglePicker}>{isOpen ? 'close' : 'edit'}</button>
</div>
{#if isOpen}
  <div class="picker-wrap">
    <ColorPicker {color} {onchange} />
  </div>
{/if}

<style>
  .color-row { display: flex; align-items: center; gap: 8px; background: var(--bg-1); border-radius: 4px; padding: 5px 8px; margin-bottom: 4px; }
  .swatch { width: 18px; height: 18px; border-radius: 3px; flex-shrink: 0; }
  .row-label { color: var(--text-2); font-family: monospace; font-size: 11px; width: 36px; }
  .color-val { color: var(--text-3); font-size: 10px; flex: 1; }
  .edit-btn { background: none; border: none; color: var(--text-3); font-size: 11px; cursor: pointer; padding: 0 4px; }
  .edit-btn:hover { color: var(--accent); }
  .picker-wrap { padding: 4px 8px 8px 8px; }
</style>
