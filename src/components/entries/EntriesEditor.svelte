<script lang="ts">
  import { scheme } from '../../stores/scheme';
  import { resolved } from '../../stores/scheme';
  import PaletteSidebar from './PaletteSidebar.svelte';
  import EntryBlock from './EntryBlock.svelte';

  function addEntry() {
    scheme.update(s => ({
      ...s,
      entries: [...s.entries, { name: 'new-entry', classes: [], fontFormula: null, backFormula: null }],
    }));
  }

  function updateEntry(i: number, updated: any) {
    scheme.update(s => {
      const entries = [...s.entries];
      entries[i] = updated;
      return { ...s, entries };
    });
  }

  function deleteEntry(i: number) {
    scheme.update(s => ({ ...s, entries: s.entries.filter((_, j) => j !== i) }));
  }
</script>

<div class="entries-layout">
  <PaletteSidebar />
  <div class="entries-list">
    {#each $scheme.entries as entry, i}
      <EntryBlock
        entry={entry}
        resolved={$resolved.entries[i]}
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
  .add-entry-btn { display: flex; align-items: center; gap: 6px; padding: 6px 10px; color: var(--accent); font-size: 11px; background: none; border: 1px dashed var(--bg-3); border-radius: 6px; cursor: pointer; margin-top: 4px; width: 100%; }
  .add-entry-btn:hover { border-color: var(--accent); }
</style>
