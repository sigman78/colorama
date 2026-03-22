<script lang="ts">
  import { scheme } from '../../../stores/scheme';
  import ColorRow from './ColorRow.svelte';
  import ScalarRow from './ScalarRow.svelte';
  import SwatchImport from './SwatchImport.svelte';

  function addColor() {
    scheme.update(s => ({
      ...s,
      palette: {
        ...s.palette,
        colors: [...s.palette.colors, { name: 'color', color: { l: 0.6, c: 0.1, h: 200 } }],
      },
    }));
  }

  function updateColor(i: number, updated: any) {
    scheme.update(s => {
      const colors = [...s.palette.colors];
      colors[i] = updated;
      return { ...s, palette: { ...s.palette, colors } };
    });
  }

  function removeColor(i: number) {
    scheme.update(s => ({
      ...s,
      palette: { ...s.palette, colors: s.palette.colors.filter((_, j) => j !== i) },
    }));
  }

  function addScalar() {
    scheme.update(s => ({
      ...s,
      palette: {
        ...s.palette,
        scalars: [...s.palette.scalars, { name: 'scalar', value: 1.0 }],
      },
    }));
  }

  function updateScalar(i: number, updated: any) {
    scheme.update(s => {
      const scalars = [...s.palette.scalars];
      scalars[i] = updated;
      return { ...s, palette: { ...s.palette, scalars } };
    });
  }

  function removeScalar(i: number) {
    scheme.update(s => ({
      ...s,
      palette: { ...s.palette, scalars: s.palette.scalars.filter((_, j) => j !== i) },
    }));
  }
</script>

<div class="palette-editor">
  <div class="section-label">Palette Colors</div>
  {#each $scheme.palette.colors as color, i}
    <ColorRow entry={color} onupdate={(c) => updateColor(i, c)} ondelete={() => removeColor(i)} />
  {/each}
  <button class="add-link" onclick={addColor}>+ Add color</button>

  <div class="section-label" style="margin-top: 14px">Scalars</div>
  {#each $scheme.palette.scalars as scalar, i}
    <ScalarRow entry={scalar} onupdate={(s) => updateScalar(i, s)} ondelete={() => removeScalar(i)} />
  {/each}
  <button class="add-link" onclick={addScalar}>+ Add scalar</button>

  <SwatchImport />
</div>

<style>
  .palette-editor { padding: 12px 14px; overflow-y: auto; height: 100%; }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-3); margin-bottom: 6px; }
  .add-link { background: none; border: none; color: var(--accent); font-size: 11px; cursor: pointer; padding: 2px 4px; margin-bottom: 8px; display: block; opacity: 0.8; }
  .add-link:hover { opacity: 1; }
</style>
