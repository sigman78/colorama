<script lang="ts">
  import { oklchToLinearChannels, fromLinear, isInP3Gamut, p3ChromaLimit } from '../../lib/color';

  let { l, c, h, onpick }: {
    l: number; c: number; h: number;
    onpick: (l: number, c: number) => void;
  } = $props();

  const C_MAX = 0.4;
  const EPS = 1e-4;

  let canvasEl = $state<HTMLCanvasElement | null>(null);
  // visibleCMax updates each redraw so dot and click stay in sync with canvas Y range
  let visibleCMax = $state(C_MAX);

  // Dot in % — correct for any canvas CSS size, uses current visibleCMax for Y
  let dotXPct = $derived(l * 100);
  let dotYPct = $derived(Math.max(0, Math.min(100, (1 - c / visibleCMax) * 100)));

  /** Max P3 chroma across 20 L samples + 10% headroom, clamped to C_MAX */
  function calcVisibleCMax(hue: number): number {
    let max = 0;
    for (let i = 0; i <= 20; i++) {
      const lv = i / 20;
      const lim = p3ChromaLimit(lv, hue);
      if (lim > max) max = lim;
    }
    return Math.min(C_MAX, max * 1.1 + 0.005);
  }

  function drawSlice(canvas: HTMLCanvasElement, hue: number) {
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.getBoundingClientRect().width;
    if (cssW === 0) return;

    const cMax = calcVisibleCMax(hue);
    visibleCMax = cMax;

    // Physical pixel dimensions — 1:1 to screen pixels
    const pw = Math.round(cssW * dpr);
    const ph = Math.round(pw * cMax / C_MAX);   // height proportional to C range shown

    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // All work in physical pixel coordinates throughout
    const imageData = ctx.createImageData(pw, ph);
    const data = imageData.data;

    const srgbBy = new Int16Array(pw).fill(-1);
    const p3By   = new Int16Array(pw).fill(-1);

    for (let px = 0; px < pw; px++) {
      const lVal = px / (pw - 1);          // L: left=0 → right=1
      let prevInSrgb = false;
      let prevInP3   = false;

      for (let py = ph - 1; py >= 0; py--) {
        const cVal = (1 - py / (ph - 1)) * cMax;   // C: bottom=0 → top=cMax
        const [rLin, gLin, bLin] = oklchToLinearChannels(lVal, cVal, hue);

        const inSrgb =
          rLin >= -EPS && rLin <= 1 + EPS &&
          gLin >= -EPS && gLin <= 1 + EPS &&
          bLin >= -EPS && bLin <= 1 + EPS;
        const inP3 = isInP3Gamut({ l: lVal, c: cVal, h: hue });

        if (prevInSrgb && !inSrgb && srgbBy[px] === -1) srgbBy[px] = py + 1;
        if (prevInP3   && !inP3   && p3By[px]   === -1) p3By[px]   = py + 1;
        prevInSrgb = inSrgb;
        prevInP3   = inP3;

        const idx = (py * pw + px) * 4;
        if (inSrgb || inP3) {
          data[idx]     = Math.round(Math.max(0, Math.min(255, fromLinear(Math.max(0, Math.min(1, rLin))) * 255)));
          data[idx + 1] = Math.round(Math.max(0, Math.min(255, fromLinear(Math.max(0, Math.min(1, gLin))) * 255)));
          data[idx + 2] = Math.round(Math.max(0, Math.min(255, fromLinear(Math.max(0, Math.min(1, bLin))) * 255)));
          data[idx + 3] = 255;
        } else {
          data[idx] = data[idx + 1] = data[idx + 2] = 26;
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Boundary lines — physical pixel coordinates, 1px wide
    ctx.lineWidth = 1;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.setLineDash([]);
    ctx.beginPath();
    let srgbStarted = false;
    for (let px = 0; px < pw; px++) {
      const by = srgbBy[px];
      if (by < 0) { srgbStarted = false; continue; }
      if (!srgbStarted) { ctx.moveTo(px + 0.5, by + 0.5); srgbStarted = true; }
      else ctx.lineTo(px + 0.5, by + 0.5);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(100, 200, 255, 0.75)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    let p3Started = false;
    for (let px = 0; px < pw; px++) {
      const by = p3By[px];
      if (by < 0) { p3Started = false; continue; }
      if (!p3Started) { ctx.moveTo(px + 0.5, by + 0.5); p3Started = true; }
      else ctx.lineTo(px + 0.5, by + 0.5);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  $effect(() => {
    const hue = h;
    const el = canvasEl;
    if (!el) return;
    drawSlice(el, hue);
  });

  function onclick(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const fx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const fy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    onpick(fx, (1 - fy) * visibleCMax);
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div class="slice-wrap" role="presentation" {onclick}>
  <canvas bind:this={canvasEl}></canvas>
  <div class="crosshair" style="left: {dotXPct}%; top: {dotYPct}%;"></div>
  <div class="axis-label axis-l">L →</div>
  <div class="axis-label axis-c">C ↑</div>
</div>

<style>
  .slice-wrap {
    position: relative;
    width: 100%;
    cursor: crosshair;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--border);
    margin-top: 8px;
  }
  canvas {
    display: block;
    width: 100%;
    height: auto;
  }
  .crosshair {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid #fff;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.6);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .axis-label {
    position: absolute;
    font-size: 8px;
    color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
    line-height: 1;
  }
  .axis-l { bottom: 3px; right: 4px; }
  .axis-c { top: 3px; left: 4px; }
</style>
