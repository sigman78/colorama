<script lang="ts">
  import hljs from 'highlight.js/lib/core';
  import cpp   from 'highlight.js/lib/languages/cpp';
  import rust  from 'highlight.js/lib/languages/rust';
  import js    from 'highlight.js/lib/languages/javascript';
  import ts    from 'highlight.js/lib/languages/typescript';
  import css   from 'highlight.js/lib/languages/css';
  import xml   from 'highlight.js/lib/languages/xml';
  import toml  from 'highlight.js/lib/languages/ini';
  import diff  from 'highlight.js/lib/languages/diff';

  hljs.registerLanguage('cpp', cpp);
  hljs.registerLanguage('rust', rust);
  hljs.registerLanguage('js', js);
  hljs.registerLanguage('ts', ts);
  hljs.registerLanguage('css', css);
  hljs.registerLanguage('html', xml);
  hljs.registerLanguage('toml', toml);
  hljs.registerLanguage('diff', diff);

  import { previewLang } from '../stores/ui';
  import { resolved } from '../stores/scheme';
  import { generateLiveCss } from '../lib/export';
  import { formatOklch } from '../lib/color';
  import { snippets } from '../snippets/index';
  import type { PreviewLang } from '../stores/ui';

  const LANGS: PreviewLang[] = ['cpp', 'rust', 'js', 'ts', 'css', 'html', 'toml', 'diff'];

  let highlightedHtml = $derived(
    hljs.highlight(snippets[$previewLang], { language: $previewLang === 'html' ? 'html' : $previewLang }).value
  );
  let liveCss = $derived(generateLiveCss($resolved));
  let backStyle = $derived(`background: ${formatOklch($resolved.base.back)}`);

  $effect(() => {
    let el = document.getElementById('cs-live') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'cs-live';
      document.head.appendChild(el);
    }
    el.textContent = liveCss;
  });
</script>

<div class="preview-pane">
  <div class="lang-bar">
    {#each LANGS as lang}
      <button
        class="lang-btn"
        class:active={$previewLang === lang}
        onclick={() => previewLang.set(lang)}
      >{lang}</button>
    {/each}
  </div>
  <pre class="code-area" style={backStyle}><code class="hljs">{@html highlightedHtml}</code></pre>
</div>

<style>
  .preview-pane {
    width: 33%; flex-shrink: 0; display: flex; flex-direction: column;
    border-right: 1px solid var(--border); overflow: hidden;
  }
  .lang-bar {
    display: flex; flex-wrap: wrap; gap: 4px; padding: 7px 10px;
    border-bottom: 1px solid var(--border); flex-shrink: 0;
    background: var(--bg-2);
  }
  .lang-btn {
    padding: 3px 9px; border-radius: 4px; font-size: 11px;
    background: none; border: 1px solid transparent; color: var(--text-3); cursor: pointer;
  }
  .lang-btn.active { background: var(--bg-3); color: var(--text-1); border-color: var(--bg-4); }
  .code-area {
    flex: 1; overflow: auto; padding: 14px; margin: 0;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 13px; line-height: 1.7;
  }
</style>
