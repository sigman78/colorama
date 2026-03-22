<script lang="ts">
  import { scheme } from './stores/scheme';
  import Preview from './components/Preview.svelte';
  import Editor from './components/Editor.svelte';

  let schemeName = $derived($scheme.name);

  function renameScheme(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    scheme.update(s => ({ ...s, name: val }));
  }
</script>

<div class="app">
  <header class="app-header">
    <span class="app-title">color-schemer</span>
    <span class="sep">/</span>
    <input class="scheme-name" value={schemeName} oninput={renameScheme} />
    <div class="spacer"></div>
    <button class="hbtn" onclick={() => (document.getElementById('cs-load-input') as HTMLInputElement)?.click()}>Load</button>
    <button class="hbtn" onclick={() => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify($scheme, null, 2)], { type: 'application/json' }));
      a.download = `${$scheme.name}.json`;
      a.click();
    }}>Save</button>
  </header>
  <main class="app-main">
    <Preview />
    <Editor />
  </main>
</div>

<style>
  .app { height: 100vh; display: flex; flex-direction: column; }
  .app-header {
    display: flex; align-items: center; gap: 12px; padding: 8px 16px;
    background: var(--bg-2); border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .app-title { color: var(--text-2); font-size: 12px; }
  .sep { color: var(--border); }
  .scheme-name {
    background: none; border: none; border-bottom: 1px dashed var(--bg-4);
    color: var(--text-0); font-size: 13px; font-weight: 500; outline: none;
    padding-bottom: 1px;
  }
  .spacer { flex: 1; }
  .hbtn {
    padding: 5px 13px; background: var(--bg-3); border: none; border-radius: 5px;
    color: var(--text-1); font-size: 12px; cursor: pointer;
  }
  .app-main { display: flex; flex: 1; overflow: hidden; }
</style>
