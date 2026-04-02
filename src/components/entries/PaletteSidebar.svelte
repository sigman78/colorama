<script lang="ts">
  import { scheme } from '../../stores/scheme';
  import { oklchToHex } from '../../lib/color';

  const syntaxExamples = [
    { label: 'Color or scalar var', value: '$blue or $dim' },
    { label: 'Color component', value: '$blue.l' },
    { label: 'Numeric arithmetic', value: '$blue.l * $dim' },
    { label: 'Build color', value: 'oklch($blue.l, $blue.c, $blue.h)' },
  ];

  const functionRefs = [
    'oklch(l, c, h)',
    'mix(colorA, colorB, t)',
    'gradient(t, colorA, colorB, ...)',
    'lighten(color, amount)',
    'darken(color, amount)',
    'desaturate(color, amount)',
    'clamp(x, min, max)',
    'sin(x), cos(x)',
    'pow(x, y), ln(x)',
    'soft(x), sigmoid(x)',
  ];

  function insertIntoFocused(name: string) {
    const el = document.activeElement;
    if (!(el instanceof HTMLInputElement) || !el.classList.contains('formula-input')) return;
    const insert = `$${name}`;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, start) + insert + el.value.slice(end);
    el.selectionStart = el.selectionEnd = start + insert.length;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
</script>

<div class="sidebar">
  <div class="section-label">Colors</div>
  {#each $scheme.palette.colors as c}
    <div class="ref-row" role="button" tabindex="-1" onmousedown={(e) => { e.preventDefault(); insertIntoFocused(c.name); }}>
      <div class="ref-swatch" style="background: oklch({c.color.l} {c.color.c} {c.color.h}deg)"></div>
      <span class="ref-name">${c.name}</span>
      <span class="ref-val mono">{oklchToHex(c.color)}</span>
    </div>
  {/each}

  {#if $scheme.palette.scalars.length > 0}
    <div class="section-label" style="margin-top: 10px">Scalars</div>
    {#each $scheme.palette.scalars as s}
      <div class="scalar-row" role="button" tabindex="-1" onmousedown={(e) => { e.preventDefault(); insertIntoFocused(s.name); }}>
        <span class="ref-name">${s.name}</span>
        <span class="ref-val mono">{s.value}</span>
      </div>
    {/each}
  {/if}

  <div class="section-label" style="margin-top: 10px">Virtual</div>
  {#each [{ name: 'F', label: 'entry font' }, { name: 'B', label: 'entry back' }] as v}
    <div class="scalar-row" role="button" tabindex="-1" onmousedown={(e) => { e.preventDefault(); insertIntoFocused(v.name); }}>
      <span class="ref-name">${v.name}</span>
      <span class="ref-val">{v.label}</span>
    </div>
  {/each}

  <div class="section-label" style="margin-top: 12px">Formula Mini Ref</div>
  <div class="help-block">
    <div class="help-subtitle">Syntax</div>
    {#each syntaxExamples as example}
      <div class="help-row">
        <span class="help-label">{example.label}</span>
        <code class="help-code">{example.value}</code>
      </div>
    {/each}

    <div class="help-subtitle">Functions</div>
    {#each functionRefs as fn}
      <div class="help-fn"><code class="help-code">{fn}</code></div>
    {/each}
  </div>
</div>

<style>
  .sidebar { width: 230px; flex-shrink: 0; border-right: 1px solid var(--border); overflow-y: auto; padding: 10px 8px; background: var(--bg-2); }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-3); margin-bottom: 6px; }
  .ref-row, .scalar-row { display: flex; align-items: center; gap: 6px; padding: 3px 2px; border-radius: 3px; margin-bottom: 2px; cursor: pointer; }
  .ref-row:hover, .scalar-row:hover { background: var(--bg-3); }
  .ref-swatch { width: 13px; height: 13px; border-radius: 2px; flex-shrink: 0; }
  .ref-name { color: var(--accent); font-family: monospace; font-size: 11px; }
  .ref-val { color: var(--text-3); font-size: 9px; margin-left: auto; }
  .help-block { display: flex; flex-direction: column; gap: 6px; padding: 6px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-1); }
  .help-subtitle { color: var(--text-2); font-size: 10px; font-weight: 600; margin-top: 2px; }
  .help-row { display: flex; flex-direction: column; gap: 2px; }
  .help-label { color: var(--text-3); font-size: 9px; }
  .help-code { color: #b0c8e8; font-family: monospace; font-size: 10px; word-break: break-word; }
  .help-fn { line-height: 1.25; }
</style>
