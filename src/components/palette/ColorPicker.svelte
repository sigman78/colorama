<script lang="ts">
  import type { OKLCH } from '../../lib/color';
  import {
    oklchToHex, hexToOklch, oklchToRgb, rgbToOklch, oklchToHsl, hslToOklch,
    isInSrgbGamut, isInP3Gamut, srgbChromaLimit, p3ChromaLimit, oklchToP3CssColor,
  } from '../../lib/color';
  import GradientSlider from './GradientSlider.svelte';
  import ColorSlice from './ColorSlice.svelte';

  let { color, onchange }: { color: OKLCH; onchange: (c: OKLCH) => void } = $props();

  type Tab = 'oklch' | 'hex' | 'rgb' | 'hsl';
  let tab = $state<Tab>('oklch');
  let hexInput = $derived(oklchToHex(color));
  let rgb = $derived(oklchToRgb(color));
  let hsl = $derived(oklchToHsl(color));

  // ── Gamut state ─────────────────────────────────────────────────────────────
  let inSrgb   = $derived(isInSrgbGamut(color));
  let inP3     = $derived(isInP3Gamut(color));
  let srgbLim  = $derived(srgbChromaLimit(color.l, color.h));
  let p3Lim    = $derived(p3ChromaLimit(color.l, color.h));
  let srgbCss  = $derived.by(() => { const { r, g, b } = oklchToRgb(color); return `rgb(${r},${g},${b})`; });
  let p3Css    = $derived(oklchToP3CssColor(color));
  let chromaTicks = $derived([
    { pos: srgbLim / 0.4, label: 'sRGB', style: 'background: rgba(255,255,255,0.75)' },
    { pos: p3Lim   / 0.4, label: 'P3',   style: 'border-left: 2px dashed rgba(100,200,255,0.85); background: transparent; width: 0' },
  ]);

  // ── OKLCH gradient strings ───────────────────────────────────────────────────
  let gradL = $derived.by(() => {
    const stops = [0, 0.25, 0.5, 0.75, 1].map((lv) => {
      const { r, g, b } = oklchToRgb({ l: lv, c: color.c, h: color.h });
      return `rgb(${r},${g},${b})`;
    });
    return `linear-gradient(to right, ${stops.join(', ')})`;
  });
  let gradC = $derived.by(() => {
    const stops = [0, 0.1, 0.2, 0.3, 0.4].map((cv) => {
      const { r, g, b } = oklchToRgb({ l: color.l, c: cv, h: color.h });
      return `rgb(${r},${g},${b})`;
    });
    return `linear-gradient(to right, ${stops.join(', ')})`;
  });
  let gradH = $derived.by(() => {
    const fixedC = Math.max(color.c, 0.12);
    const stops = Array.from({ length: 13 }, (_, i) => {
      const { r, g, b } = oklchToRgb({ l: color.l, c: fixedC, h: i * 30 });
      return `rgb(${r},${g},${b})`;
    });
    return `linear-gradient(to right, ${stops.join(', ')})`;
  });

  // ── RGB gradient strings ─────────────────────────────────────────────────────
  let gradR = $derived(`linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))`);
  let gradG = $derived(`linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))`);
  let gradB = $derived(`linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))`);

  // ── HSL gradient strings ─────────────────────────────────────────────────────
  let gradHsl_H = $derived.by(() => {
    const stops = Array.from({ length: 13 }, (_, i) => `hsl(${i * 30}, ${hsl.s * 100}%, ${hsl.l * 100}%)`);
    return `linear-gradient(to right, ${stops.join(', ')})`;
  });
  let gradHsl_S = $derived(`linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l * 100}%), hsl(${hsl.h}, 100%, ${hsl.l * 100}%))`);
  let gradHsl_L = $derived(`linear-gradient(to right, hsl(${hsl.h}, ${hsl.s * 100}%, 0%), hsl(${hsl.h}, ${hsl.s * 100}%, 50%), hsl(${hsl.h}, ${hsl.s * 100}%, 100%))`);

  function onHexInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) onchange(hexToOklch(val));
  }
</script>

<div class="picker">
  <!-- Swatch: left = actual color (with gamut badge), right = sRGB fallback -->
  <div class="swatch-preview swatch-split">
    <div class="swatch-half" style="background: {inSrgb ? srgbCss : inP3 ? p3Css : srgbCss}">
      {#if !inSrgb}
        <span class="swatch-badge">{inP3 ? 'P3' : 'OOB'}</span>
      {/if}
    </div>
    <div class="swatch-half" style="background: {srgbCss}"></div>
  </div>

  <div class="tabs">
    {#each (['oklch', 'hex', 'rgb', 'hsl'] as Tab[]) as t}
      <button class="ptab" class:active={tab === t} onclick={() => tab = t}>{t.toUpperCase()}</button>
    {/each}
  </div>

  {#if tab === 'oklch'}
    <div class="slider-row">
      <span class="sl-label">L</span>
      <GradientSlider value={color.l} min={0} max={1} step={0.001} gradient={gradL}
        oninput={(v) => onchange({ ...color, l: v })} />
      <span class="sl-val">{color.l.toFixed(3)}</span>
    </div>
    <div class="slider-row">
      <span class="sl-label">C</span>
      <GradientSlider value={color.c} min={0} max={0.4} step={0.001} gradient={gradC}
        ticks={chromaTicks} oninput={(v) => onchange({ ...color, c: v })} />
      <span class="sl-val">{color.c.toFixed(3)}</span>
    </div>
    <div class="slider-row">
      <span class="sl-label">H</span>
      <GradientSlider value={color.h} min={0} max={360} step={0.1} gradient={gradH}
        oninput={(v) => onchange({ ...color, h: v })} />
      <span class="sl-val">{color.h.toFixed(1)}</span>
    </div>
    <ColorSlice l={color.l} c={color.c} h={color.h}
      onpick={(lv, cv) => onchange({ ...color, l: lv, c: cv })} />

  {:else if tab === 'hex'}
    <label class="hex-label">Hex
      <input type="text" value={hexInput} oninput={onHexInput} />
    </label>

  {:else if tab === 'rgb'}
    <div class="slider-row">
      <span class="sl-label">R</span>
      <GradientSlider value={rgb.r} min={0} max={255} step={1} gradient={gradR}
        oninput={(v) => onchange(rgbToOklch({ ...rgb, r: v }))} />
      <span class="sl-val">{rgb.r}</span>
    </div>
    <div class="slider-row">
      <span class="sl-label">G</span>
      <GradientSlider value={rgb.g} min={0} max={255} step={1} gradient={gradG}
        oninput={(v) => onchange(rgbToOklch({ ...rgb, g: v }))} />
      <span class="sl-val">{rgb.g}</span>
    </div>
    <div class="slider-row">
      <span class="sl-label">B</span>
      <GradientSlider value={rgb.b} min={0} max={255} step={1} gradient={gradB}
        oninput={(v) => onchange(rgbToOklch({ ...rgb, b: v }))} />
      <span class="sl-val">{rgb.b}</span>
    </div>

  {:else}
    <div class="slider-row">
      <span class="sl-label">H</span>
      <GradientSlider value={hsl.h} min={0} max={360} step={0.1} gradient={gradHsl_H}
        oninput={(v) => onchange(hslToOklch({ ...hsl, h: v }))} />
      <span class="sl-val">{hsl.h.toFixed(1)}</span>
    </div>
    <div class="slider-row">
      <span class="sl-label">S</span>
      <GradientSlider value={hsl.s} min={0} max={1} step={0.001} gradient={gradHsl_S}
        oninput={(v) => onchange(hslToOklch({ ...hsl, s: v }))} />
      <span class="sl-val">{hsl.s.toFixed(3)}</span>
    </div>
    <div class="slider-row">
      <span class="sl-label">L</span>
      <GradientSlider value={hsl.l} min={0} max={1} step={0.001} gradient={gradHsl_L}
        oninput={(v) => onchange(hslToOklch({ ...hsl, l: v }))} />
      <span class="sl-val">{hsl.l.toFixed(3)}</span>
    </div>
  {/if}
</div>

<style>
  .picker { background: var(--bg-0); border: 1px solid var(--border); border-radius: 6px; padding: 10px; min-width: 240px; }

  /* Swatch */
  .swatch-preview { height: 36px; border-radius: 4px; margin-bottom: 8px; }
  .swatch-split { display: flex; padding: 0; overflow: hidden; }
  .swatch-half { flex: 1; height: 36px; display: flex; align-items: center; justify-content: center; }
.swatch-badge { font-size: 9px; font-weight: 600; letter-spacing: 0.05em; color: rgba(255,255,255,0.9); text-shadow: 0 1px 2px rgba(0,0,0,0.7); pointer-events: none; }

  /* Tabs */
  .tabs { display: flex; gap: 2px; margin-bottom: 8px; }
  .ptab { padding: 3px 8px; background: var(--bg-3); border: none; border-radius: 3px; color: var(--text-2); font-size: 10px; cursor: pointer; }
  .ptab.active { background: var(--accent); color: #fff; }

  /* Slider rows */
  .slider-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .sl-label { font-size: 11px; color: var(--text-2); width: 10px; flex-shrink: 0; }
  .sl-val { font-size: 11px; color: var(--text-2); width: 38px; text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums; }

  /* Hex input */
  .hex-label { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-2); }
  .hex-label input { flex: 1; background: var(--bg-2); border: 1px solid var(--border); border-radius: 3px; padding: 3px 6px; color: var(--text-0); font-family: monospace; font-size: 11px; }
</style>
