<script lang="ts">
  import { scheme, resolved } from '../../stores/scheme';
  import { commitScheme } from '../../stores/history';
  import PaletteSidebar from './PaletteSidebar.svelte';
  import EntryBlock from './EntryBlock.svelte';

  function updateBaseFont(formula: string) { commitScheme(s => ({ ...s, base: { ...s.base, font: formula } })); }
  function updateBaseBack(formula: string) { commitScheme(s => ({ ...s, base: { ...s.base, back: formula } })); }

  function addEntry() {
    commitScheme(s => ({
      ...s,
      entries: [...s.entries, { name: 'new-entry', classes: [], fontFormula: null, backFormula: null }],
    }));
  }

  function updateEntry(i: number, updated: any) {
    commitScheme(s => {
      const entries = [...s.entries];
      entries[i] = updated;
      return { ...s, entries };
    });
  }

  function deleteEntry(i: number) {
    commitScheme(s => ({ ...s, entries: s.entries.filter((_, j) => j !== i) }));
  }

  let fontColor = $derived($resolved.base.font
    ? `oklch(${$resolved.base.font.l} ${$resolved.base.font.c} ${$resolved.base.font.h}deg)`
    : 'transparent');
  let backColor = $derived($resolved.base.back
    ? `oklch(${$resolved.base.back.l} ${$resolved.base.back.c} ${$resolved.base.back.h}deg)`
    : 'transparent');
</script>

<div class="entries-layout">
  <PaletteSidebar />
  <div class="entries-list">
    <div class="base-section">
      <div class="base-section-label">base colors</div>
      <div class="formula-row">
        <span class="formula-label">font</span>
        <div class="formula-swatch" class:empty={!$resolved.base.font} style="background: {fontColor}"></div>
        <input class="formula-input" class:err={!!$resolved.base.fontError}
          value={$scheme.base.font}
          placeholder="required"
          oninput={(e) => updateBaseFont((e.target as HTMLInputElement).value)} />
        {#if $resolved.base.fontError}<span class="err-msg">{$resolved.base.fontError}</span>{/if}
      </div>
      <div class="formula-row">
        <span class="formula-label">back</span>
        <div class="formula-swatch" class:empty={!$resolved.base.back} style="background: {backColor}"></div>
        <input class="formula-input" class:err={!!$resolved.base.backError}
          value={$scheme.base.back}
          placeholder="required"
          oninput={(e) => updateBaseBack((e.target as HTMLInputElement).value)} />
        {#if $resolved.base.backError}<span class="err-msg">{$resolved.base.backError}</span>{/if}
      </div>
    </div>
    {#each $scheme.entries as entry, i}
      <EntryBlock
        entry={entry}
        resolved={$resolved.entries[i]}
        resolvedBase={$resolved.base}
        onupdate={(e) => updateEntry(i, e)}
        ondelete={() => deleteEntry(i)}
      />
    {/each}
    <button class="add-entry-btn" onclick={addEntry}>+ new entry</button>
  </div>
</div>

<style>
  .entries-layout { display: flex; flex: 1; overflow: hidden; }
  .entries-list { flex: 1; overflow-y: auto; padding: 10px 12px; }
  .base-section { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
  .base-section-label { font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .add-entry-btn { display: flex; align-items: center; gap: 6px; padding: 6px 10px; color: var(--accent); font-size: 11px; background: none; border: 1px dashed var(--bg-3); border-radius: 6px; cursor: pointer; margin-top: 4px; width: 100%; }
  .add-entry-btn:hover { border-color: var(--accent); }
  .formula-row { display: flex; align-items: center; gap: 7px; margin-bottom: 3px; }
  .formula-label { font-size: 10px; color: var(--text-3); width: 30px; text-align: right; flex-shrink: 0; }
  .formula-swatch { width: 14px; height: 14px; border-radius: 2px; flex-shrink: 0; border: 1px solid var(--bg-4); }
  .formula-swatch.empty { background: repeating-linear-gradient(45deg, var(--bg-3), var(--bg-3) 2px, var(--bg-1) 2px, var(--bg-1) 6px); }
  .formula-input { flex: 1; background: var(--bg-0); border: 1px solid var(--bg-3); border-radius: 4px; padding: 4px 8px; color: #b0c8e8; font-family: monospace; font-size: 11px; outline: none; }
  .formula-input:focus { border-color: var(--accent); }
  .formula-input.err { border-color: var(--error-border); color: var(--error); }
  .formula-input::placeholder { color: var(--text-3); font-style: italic; }
  .err-msg { color: var(--error); font-size: 9px; white-space: nowrap; }
</style>
