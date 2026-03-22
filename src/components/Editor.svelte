<script lang="ts">
  import { activeTab } from '../stores/ui';
  import type { EditorTab } from '../stores/ui';
  import PaletteEditor from './palette/PaletteEditor.svelte';
  import EntriesEditor from './entries/EntriesEditor.svelte';
  import ExportPanel from './export/ExportPanel.svelte';

  const TABS: { id: EditorTab; label: string }[] = [
    { id: 'palette', label: 'Palette' },
    { id: 'entries', label: 'Entries' },
    { id: 'export', label: 'Export' },
  ];
</script>

<div class="editor-pane">
  <div class="tabs">
    {#each TABS as tab}
      <button
        class="tab"
        class:active={$activeTab === tab.id}
        onclick={() => activeTab.set(tab.id)}
      >{tab.label}</button>
    {/each}
  </div>
  <div class="tab-content">
    {#if $activeTab === 'palette'}
      <PaletteEditor />
    {:else if $activeTab === 'entries'}
      <EntriesEditor />
    {:else}
      <ExportPanel />
    {/if}
  </div>
</div>

<style>
  .editor-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg-2);
  }
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    background: var(--bg-1);
  }
  .tab {
    padding: 9px 20px;
    font-size: 12px;
    color: var(--text-3);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
  }
  .tab.active {
    color: var(--text-0);
    border-bottom-color: var(--accent);
  }
  .tab-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
