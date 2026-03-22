<script lang="ts">
  import { scheme, resolved } from '../../stores/scheme';
  import { commitScheme } from '../../stores/history';
  import { schemeToJson, schemeFromJson, generateCss } from '../../lib/export';

  let jsonText = $derived(schemeToJson($scheme));
  let cssText = $derived(generateCss($resolved, $scheme));

  function copyJson() {
    navigator.clipboard.writeText(jsonText);
  }
  function copyCss() {
    navigator.clipboard.writeText(cssText);
  }

  function downloadCss() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([cssText], { type: 'text/css' }));
    a.download = `${$scheme.name}.css`;
    a.click();
  }

  function loadJson(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        const loaded = schemeFromJson(txt);
        commitScheme(() => loaded);
      } catch {
        alert('Invalid scheme JSON');
      }
    });
  }
  // Note: the hidden file input below carries id="cs-load-input" so the header Load button can trigger it
</script>

<div class="export-panel">
  <div class="section">
    <div class="section-header">
      <span class="section-title">JSON — Save / Load</span>
      <button class="action-btn" onclick={copyJson}>Copy</button>
      <label class="action-btn load-label"
        >Load file <input id="cs-load-input" type="file" accept=".json" onchange={loadJson} /></label
      >
    </div>
    <pre class="code-view">{jsonText}</pre>
  </div>

  <div class="section">
    <div class="section-header">
      <span class="section-title">highlight.js CSS</span>
      <button class="action-btn" onclick={copyCss}>Copy</button>
      <button class="action-btn accent" onclick={downloadCss}>Download</button>
    </div>
    <pre class="code-view">{cssText}</pre>
  </div>
</div>

<style>
  .export-panel {
    padding: 14px;
    overflow-y: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title {
    font-size: 11px;
    color: var(--text-2);
    flex: 1;
  }
  .action-btn {
    padding: 4px 10px;
    background: var(--bg-3);
    border: none;
    border-radius: 4px;
    color: var(--text-1);
    font-size: 11px;
    cursor: pointer;
  }
  .action-btn.accent {
    background: var(--success-bg);
    color: var(--success);
  }
  .load-label input {
    display: none;
  }
  .code-view {
    background: var(--bg-0);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 10px;
    font-family: monospace;
    font-size: 11px;
    color: var(--text-1);
    overflow-x: auto;
    white-space: pre;
    max-height: 320px;
    overflow-y: auto;
  }
</style>
