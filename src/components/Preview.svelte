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

  import { previewLang, previewFontSize } from '../stores/ui';
  import { resolved } from '../stores/scheme';
  import { generateLiveCss, scopeToCssSelector } from '../lib/export';
  import { formatOklch } from '../lib/color';
  import { snippets } from '../snippets/index';
  import type { PreviewLang } from '../stores/ui';
  import type { ResolvedEntry } from '../lib/scheme';

  const LANGS: PreviewLang[] = ['cpp', 'rust', 'js', 'ts', 'css', 'html', 'toml', 'diff'];

  let highlightedHtml = $derived(
    hljs.highlight(snippets[$previewLang], { language: $previewLang === 'html' ? 'html' : $previewLang }).value
  );
  let liveCss = $derived(generateLiveCss($resolved));
  let backStyle = $derived($resolved.base.back ? `background: ${formatOklch($resolved.base.back)}` : '');

  $effect(() => {
    let el = document.getElementById('cs-live') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'cs-live';
      document.head.appendChild(el);
    }
    el.textContent = liveCss;
  });

  // Tooltip state
  let tooltipVisible = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltipClasses = $state<string[]>([]);
  let tooltipEntry = $state<ResolvedEntry | null>(null);
  let lastTarget: Element | null = null;

  function onCodeMouseMove(e: MouseEvent) {
    tooltipX = e.clientX + 14;
    tooltipY = e.clientY + 14;

    const target = e.target as Element;
    if (target === lastTarget) return;
    lastTarget = target;

    let el: Element | null = target;
    let hljsClasses: string[] = [];
    let matched: ResolvedEntry | null = null;

    while (el && !el.classList.contains('hljs')) {
      const cls = [...el.classList].filter((c) => c.startsWith('hljs-'));
      if (cls.length > 0) {
        hljsClasses = cls;
        for (const entry of $resolved.entries) {
          for (const scope of entry.classes) {
            try {
              if (el.matches(scopeToCssSelector(scope))) { matched = entry; break; }
            } catch { /* ignore */ }
          }
          if (matched) break;
        }
        break;
      }
      el = el.parentElement;
    }

    tooltipClasses = hljsClasses;
    tooltipEntry = matched;
    tooltipVisible = hljsClasses.length > 0;
  }

  function onCodeMouseLeave() {
    tooltipVisible = false;
    lastTarget = null;
  }
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
    <div class="font-size-ctrl">
      <button class="fs-btn" onclick={() => previewFontSize.update(s => Math.max(9, s - 1))}>−</button>
      <span class="fs-label">{$previewFontSize}px</span>
      <button class="fs-btn" onclick={() => previewFontSize.update(s => Math.min(24, s + 1))}>+</button>
    </div>
  </div>
  <pre class="code-area" style={backStyle}><code class="hljs"
    style="font-size: {$previewFontSize}px"
    onmousemove={onCodeMouseMove}
    onmouseleave={onCodeMouseLeave}
  >{@html highlightedHtml}</code></pre>
</div>

{#if tooltipVisible}
  <div class="cs-tooltip" style="left: {tooltipX}px; top: {tooltipY}px">
    <div class="tt-classes">{tooltipClasses.map(c => c.replace('hljs-', '')).join(' ')}</div>
    {#if tooltipEntry}
      <div class="tt-entry">{tooltipEntry.name}</div>
      <div class="tt-colors">
        {#if tooltipEntry.font}
          <span class="tt-swatch" style="background: oklch({tooltipEntry.font.l} {tooltipEntry.font.c} {tooltipEntry.font.h}deg)"></span>
          <span class="tt-label">font</span>
        {/if}
        {#if tooltipEntry.back}
          <span class="tt-swatch" style="background: oklch({tooltipEntry.back.l} {tooltipEntry.back.c} {tooltipEntry.back.h}deg)"></span>
          <span class="tt-label">back</span>
        {/if}
      </div>
    {:else}
      <div class="tt-entry tt-base">base</div>
    {/if}
  </div>
{/if}

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
  .font-size-ctrl { margin-left: auto; display: flex; align-items: center; gap: 2px; }
  .fs-btn { background: none; border: 1px solid transparent; border-radius: 3px; color: var(--text-3); font-size: 14px; line-height: 1; cursor: pointer; padding: 1px 5px; }
  .fs-btn:hover { background: var(--bg-3); color: var(--text-1); }
  .fs-label { font-size: 10px; color: var(--text-3); min-width: 28px; text-align: center; }
  .code-area {
    flex: 1; overflow: auto; padding: 14px; margin: 0;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    line-height: 1.7;
  }
  .cs-tooltip {
    position: fixed; z-index: 1000; pointer-events: none;
    background: var(--bg-0); border: 1px solid var(--border);
    border-radius: 5px; padding: 6px 8px; font-size: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4); max-width: 220px;
  }
  .tt-classes { color: var(--accent); font-family: monospace; font-size: 10px; margin-bottom: 3px; }
  .tt-entry { color: var(--text-1); font-size: 11px; font-weight: 500; }
  .tt-base { color: var(--text-3); font-style: italic; }
  .tt-colors { display: flex; align-items: center; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
  .tt-swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; border: 1px solid rgba(255,255,255,0.15); }
  .tt-label { color: var(--text-3); font-size: 9px; margin-right: 4px; }
</style>
