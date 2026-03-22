<script lang="ts">
  import type { OKLCH } from '../../../lib/color';
  import { oklchToHex, hexToOklch, oklchToRgb, rgbToOklch, oklchToHsl, hslToOklch } from '../../../lib/color';

  let { color, onchange }: { color: OKLCH; onchange: (c: OKLCH) => void } = $props();

  type Tab = 'oklch' | 'hex' | 'rgb' | 'hsl';
  let tab = $state<Tab>('oklch');
  let hexInput = $derived(oklchToHex(color));

  function setL(e: Event) { onchange({ ...color, l: +(e.target as HTMLInputElement).value }); }
  function setC(e: Event) { onchange({ ...color, c: +(e.target as HTMLInputElement).value }); }
  function setH(e: Event) { onchange({ ...color, h: +(e.target as HTMLInputElement).value }); }

  function onHexInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) onchange(hexToOklch(val));
  }

  function onRgbInput(channel: 'r'|'g'|'b', e: Event) {
    const rgb = oklchToRgb(color);
    rgb[channel] = +(e.target as HTMLInputElement).value;
    onchange(rgbToOklch(rgb));
  }

  function onHslInput(channel: 'h'|'s'|'l', e: Event) {
    const hsl = oklchToHsl(color);
    hsl[channel] = +(e.target as HTMLInputElement).value;
    onchange(hslToOklch(hsl));
  }

  let previewBg = $derived(`oklch(${color.l} ${color.c} ${color.h}deg)`);
  let rgb = $derived(oklchToRgb(color));
  let hsl = $derived(oklchToHsl(color));
</script>

<div class="picker">
  <div class="swatch-preview" style="background: {previewBg}"></div>

  <div class="tabs">
    {#each (['oklch','hex','rgb','hsl'] as Tab[]) as t}
      <button class="ptab" class:active={tab === t} onclick={() => tab = t}>{t.toUpperCase()}</button>
    {/each}
  </div>

  {#if tab === 'oklch'}
    <label>L <input type="range" min="0" max="1" step="0.001" value={color.l} oninput={setL}> {color.l.toFixed(3)}</label>
    <label>C <input type="range" min="0" max="0.4" step="0.001" value={color.c} oninput={setC}> {color.c.toFixed(3)}</label>
    <label>H <input type="range" min="0" max="360" step="0.1"   value={color.h} oninput={setH}> {color.h.toFixed(1)}</label>
  {:else if tab === 'hex'}
    <label>Hex <input type="text" value={hexInput} oninput={onHexInput}></label>
  {:else if tab === 'rgb'}
    <label>R <input type="range" min="0" max="255" step="1" value={rgb.r} oninput={(e) => onRgbInput('r', e)}> {rgb.r}</label>
    <label>G <input type="range" min="0" max="255" step="1" value={rgb.g} oninput={(e) => onRgbInput('g', e)}> {rgb.g}</label>
    <label>B <input type="range" min="0" max="255" step="1" value={rgb.b} oninput={(e) => onRgbInput('b', e)}> {rgb.b}</label>
  {:else}
    <label>H <input type="range" min="0" max="360" step="0.1" value={hsl.h} oninput={(e) => onHslInput('h', e)}> {hsl.h.toFixed(1)}</label>
    <label>S <input type="range" min="0" max="1" step="0.001" value={hsl.s} oninput={(e) => onHslInput('s', e)}> {hsl.s.toFixed(3)}</label>
    <label>L <input type="range" min="0" max="1" step="0.001" value={hsl.l} oninput={(e) => onHslInput('l', e)}> {hsl.l.toFixed(3)}</label>
  {/if}
</div>

<style>
  .picker { background: var(--bg-0); border: 1px solid var(--border); border-radius: 6px; padding: 10px; min-width: 240px; }
  .swatch-preview { height: 36px; border-radius: 4px; margin-bottom: 8px; }
  .tabs { display: flex; gap: 2px; margin-bottom: 8px; }
  .ptab { padding: 3px 8px; background: var(--bg-3); border: none; border-radius: 3px; color: var(--text-2); font-size: 10px; cursor: pointer; }
  .ptab.active { background: var(--accent); color: #fff; }
  label { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 11px; color: var(--text-2); }
  label input[type=range] { flex: 1; accent-color: var(--accent); }
  label input[type=text] { flex: 1; background: var(--bg-2); border: 1px solid var(--border); border-radius: 3px; padding: 3px 6px; color: var(--text-0); font-family: monospace; font-size: 11px; }
</style>
