<script lang="ts">
  import { parseSwatch } from '../../../lib/swatches';
  import { scheme } from '../../../stores/scheme';

  let url = $state('');
  let error = $state<string | null>(null);

  function doImport() {
    error = null;
    const colors = parseSwatch(url);
    if (!colors) { error = 'Could not parse palette from this URL'; return; }
    const newColors = colors.map((c, i) => ({ name: `color${i + 1}`, color: c }));
    scheme.update(s => ({ ...s, palette: { ...s.palette, colors: [...s.palette.colors, ...newColors] } }));
    url = '';
  }
</script>

<div class="swatch-import">
  <div class="section-label">Import from swatch URL</div>
  <div class="row">
    <input class="url-input" placeholder="coolors.co/palette/... or paletton.com/#uid=..."
      bind:value={url} />
    <button class="import-btn" onclick={doImport}>Import</button>
  </div>
  {#if error}<div class="err">{error}</div>{/if}
</div>

<style>
  .swatch-import { margin-top: 12px; }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-3); margin-bottom: 6px; }
  .row { display: flex; gap: 6px; }
  .url-input { flex: 1; background: var(--bg-1); border: 1px solid var(--border); border-radius: 4px; padding: 5px 8px; color: var(--text-1); font-size: 11px; outline: none; }
  .url-input:focus { border-color: var(--accent); }
  .import-btn { padding: 5px 12px; background: var(--accent-bg); color: var(--accent); border: none; border-radius: 4px; font-size: 11px; cursor: pointer; }
  .err { color: var(--error); font-size: 11px; margin-top: 4px; }
</style>
