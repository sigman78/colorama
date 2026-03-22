<script lang="ts">
  import { scheme } from '../../stores/scheme';
  import ColorRow from './ColorRow.svelte';
  import ScalarRow from './ScalarRow.svelte';
  import ColorPicker from './ColorPicker.svelte';
  import SwatchImport from './SwatchImport.svelte';

  type Selection = { kind: 'color'; index: number } | { kind: 'scalar'; index: number } | null;
  let selected: Selection = $state(null);

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
    if (selected?.kind === 'color' && selected.index === i) selected = null;
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
    if (selected?.kind === 'scalar' && selected.index === i) selected = null;
    scheme.update(s => ({
      ...s,
      palette: { ...s.palette, scalars: s.palette.scalars.filter((_, j) => j !== i) },
    }));
  }

  // Drag-to-reorder state
  let dragList: 'colors' | 'scalars' | null = $state(null);
  let dragFrom: number | null = $state(null);
  let dragTo: number | null = $state(null);

  function startDrag(list: 'colors' | 'scalars', i: number) {
    dragList = list;
    dragFrom = i;
    dragTo = i;
  }
  function enterDrop(list: 'colors' | 'scalars', i: number) {
    if (dragList === list) dragTo = i;
  }
  function commitDrop() {
    if (dragList && dragFrom !== null && dragTo !== null && dragFrom !== dragTo) {
      const key = dragList;
      const from = dragFrom,
        to = dragTo;
      scheme.update(s => {
        const arr = [...s.palette[key]];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return { ...s, palette: { ...s.palette, [key]: arr } };
      });
      selected = null;
    }
    dragList = dragFrom = dragTo = null;
  }
  function cancelDrag() {
    dragList = dragFrom = dragTo = null;
  }
</script>

<div class="palette-layout">
  <div class="palette-list">
    <div class="section-label">Palette Colors</div>
    {#each $scheme.palette.colors as color, i}
      <div
        class="drag-item"
        class:is-drop-target={dragList === 'colors' && dragTo === i && dragFrom !== i}
        draggable="true"
        ondragstart={() => startDrag('colors', i)}
        ondragover={(e) => { e.preventDefault(); enterDrop('colors', i); }}
        ondrop={commitDrop}
        ondragend={cancelDrag}
      >
        <span class="drag-handle">&#8942;</span>
        <ColorRow
          entry={color}
          onupdate={(c) => updateColor(i, c)}
          ondelete={() => removeColor(i)}
          isSelected={selected?.kind === 'color' && selected.index === i}
          onselect={() => selected = { kind: 'color', index: i }}
        />
      </div>
    {/each}
    <button class="add-link" onclick={addColor}>+ Add color</button>

    <div class="section-label" style="margin-top: 14px">Scalars</div>
    {#each $scheme.palette.scalars as scalar, i}
      <div
        class="drag-item"
        class:is-drop-target={dragList === 'scalars' && dragTo === i && dragFrom !== i}
        draggable="true"
        ondragstart={() => startDrag('scalars', i)}
        ondragover={(e) => { e.preventDefault(); enterDrop('scalars', i); }}
        ondrop={commitDrop}
        ondragend={cancelDrag}
      >
        <span class="drag-handle">&#8942;</span>
        <ScalarRow
          entry={scalar}
          onupdate={(s) => updateScalar(i, s)}
          ondelete={() => removeScalar(i)}
          isSelected={selected?.kind === 'scalar' && selected.index === i}
          onselect={() => selected = { kind: 'scalar', index: i }}
        />
      </div>
    {/each}
    <button class="add-link" onclick={addScalar}>+ Add scalar</button>

    <SwatchImport />
  </div>

  <div class="palette-panel">
    {#if selected?.kind === 'color'}
      {@const color = $scheme.palette.colors[selected.index]}
      <div class="entry-editor">
        <label class="name-label">name
          <input class="name-input" value={color.name}
            oninput={(e) => updateColor(selected.index, { ...color, name: (e.target as HTMLInputElement).value })} />
        </label>
        <ColorPicker color={color.color} onchange={(c) => updateColor(selected.index, { ...color, color: c })} />
      </div>
    {:else if selected?.kind === 'scalar'}
      {@const scalar = $scheme.palette.scalars[selected.index]}
      <div class="entry-editor">
        <label class="name-label">name
          <input class="name-input" value={scalar.name}
            oninput={(e) => updateScalar(selected.index, { ...scalar, name: (e.target as HTMLInputElement).value })} />
        </label>
        <div class="scalar-editor">
          <input type="range" min="-2" max="2" step="0.01" value={scalar.value}
            oninput={(e) => updateScalar(selected.index, { ...scalar, value: +(e.target as HTMLInputElement).value })} />
          <input type="number" step="0.01" value={scalar.value}
            oninput={(e) => updateScalar(selected.index, { ...scalar, value: +(e.target as HTMLInputElement).value })} />
        </div>
      </div>
    {:else}
      <div class="panel-empty">select an entry to edit</div>
    {/if}
  </div>
</div>

<style>
  .palette-layout { display: flex; height: 100%; overflow: hidden; }
  .palette-list { width: 330px; flex-shrink: 0; padding: 12px 14px; overflow-y: auto; border-right: 1px solid var(--border); }
  .palette-panel { flex: 1; padding: 14px; overflow-y: auto; }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-3); margin-bottom: 6px; }
  .add-link { background: none; border: none; color: var(--accent); font-size: 11px; cursor: pointer; padding: 2px 4px; margin-bottom: 8px; display: block; opacity: 0.8; }
  .add-link:hover { opacity: 1; }
  .drag-item { display: flex; align-items: flex-start; gap: 4px; }
  .drag-handle { color: var(--text-3); cursor: grab; font-size: 14px; line-height: 28px; padding: 0 2px; user-select: none; flex-shrink: 0; }
  .drag-handle:hover { color: var(--text-2); }
  .drag-item.is-drop-target { border-top: 2px solid var(--accent); }
  .panel-empty { color: var(--text-3); font-size: 11px; margin-top: 20px; text-align: center; }
  .entry-editor { display: flex; flex-direction: column; gap: 12px; }
  .name-label { display: flex; align-items: center; gap: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-3); }
  .name-input { background: var(--bg-2); border: 1px solid var(--border); border-radius: 3px; padding: 3px 6px; color: var(--accent); font-family: monospace; font-size: 11px; flex: 1; outline: none; }
  .name-input:focus { border-color: var(--accent); }
  .scalar-editor { display: flex; flex-direction: column; gap: 10px; }
  .scalar-editor input[type=range] { width: 100%; accent-color: var(--accent); }
  .scalar-editor input[type=number] { width: 80px; background: var(--bg-2); border: 1px solid var(--border); border-radius: 3px; padding: 3px 6px; color: var(--text-0); font-family: monospace; font-size: 11px; }
</style>
