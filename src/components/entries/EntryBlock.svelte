<script lang="ts">
  import type { SchemeEntry } from '../../../lib/scheme';
  import type { ResolvedEntry } from '../../../lib/scheme';
  import { HLJS_CLASSES } from '../../../lib/hljs-classes';

  let {
    entry, resolved, onupdate, ondelete,
  }: {
    entry: SchemeEntry;
    resolved: ResolvedEntry;
    onupdate: (e: SchemeEntry) => void;
    ondelete: () => void;
  } = $props();

  let showClassDropdown = $state(false);

  function setName(e: Event) {
    onupdate({ ...entry, name: (e.target as HTMLInputElement).value });
  }
  function setFontFormula(e: Event) {
    onupdate({ ...entry, fontFormula: (e.target as HTMLInputElement).value || null });
  }
  function setBackFormula(e: Event) {
    onupdate({ ...entry, backFormula: (e.target as HTMLInputElement).value || null });
  }
  function removeClass(cls: string) {
    onupdate({ ...entry, classes: entry.classes.filter(c => c !== cls) });
  }
  function addClass(cls: string) {
    if (!entry.classes.includes(cls)) onupdate({ ...entry, classes: [...entry.classes, cls] });
    showClassDropdown = false;
  }
  function addCustomClass(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value.trim();
      if (val && !entry.classes.includes(val)) onupdate({ ...entry, classes: [...entry.classes, val] });
      (e.target as HTMLInputElement).value = '';
      showClassDropdown = false;
    }
  }

  let fontColor = $derived(resolved.font ? `oklch(${resolved.font.l} ${resolved.font.c} ${resolved.font.h}deg)` : 'transparent');
  let backColor = $derived(resolved.back ? `oklch(${resolved.back.l} ${resolved.back.c} ${resolved.back.h}deg)` : 'transparent');
</script>

<div class="entry-block">
  <div class="entry-header">
    <input class="entry-name" value={entry.name} oninput={setName} />
    <div class="combo-swatch" style="background: {backColor || 'var(--bg-3)'}; color: {fontColor || 'var(--text-1)'}">Ab</div>
    <button class="del-btn" onclick={ondelete}>&#x2715;</button>
  </div>

  <div class="classes-row">
    {#each entry.classes as cls}
      <span class="cls-tag">{cls} <button class="cls-remove" onclick={() => removeClass(cls)}>&#x2715;</button></span>
    {/each}
    <button class="cls-add" onclick={() => showClassDropdown = !showClassDropdown}>+ add</button>
    {#if showClassDropdown}
      <div class="class-dropdown">
        <input class="class-search" placeholder=".hljs-... or type custom" onkeydown={addCustomClass} />
        {#each HLJS_CLASSES.filter(c => !entry.classes.includes(c)) as cls}
          <button class="class-option" onclick={() => addClass(cls)}>{cls}</button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="formula-row">
    <span class="formula-label">font</span>
    <div class="formula-swatch" class:empty={!resolved.font}
      style="background: {fontColor}"></div>
    <input class="formula-input" class:err={!!resolved.fontError}
      value={entry.fontFormula ?? ''}
      placeholder="(inherit base font)"
      oninput={setFontFormula} />
    {#if resolved.fontError}<span class="err-msg">{resolved.fontError}</span>{/if}
  </div>
  <div class="formula-row">
    <span class="formula-label">back</span>
    <div class="formula-swatch" class:empty={!resolved.back}
      style="background: {backColor}"></div>
    <input class="formula-input" class:err={!!resolved.backError}
      value={entry.backFormula ?? ''}
      placeholder="(inherit base background)"
      oninput={setBackFormula} />
    {#if resolved.backError}<span class="err-msg">{resolved.backError}</span>{/if}
  </div>
</div>

<style>
  .entry-block { background: var(--bg-1); border: 1px solid var(--bg-3); border-radius: 6px; padding: 8px 10px; margin-bottom: 5px; }
  .entry-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .entry-name { background: none; border: none; color: var(--text-1); font-family: monospace; font-size: 12px; font-weight: 500; outline: none; border-bottom: 1px solid transparent; flex: 1; }
  .entry-name:focus { border-bottom-color: var(--accent); }
  .combo-swatch { width: 28px; height: 20px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; flex-shrink: 0; }
  .del-btn { background: none; border: none; color: var(--text-3); cursor: pointer; }
  .del-btn:hover { color: var(--error); }

  .classes-row { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 7px; position: relative; }
  .cls-tag { background: var(--bg-3); border: 1px solid var(--bg-4); border-radius: 3px; padding: 2px 5px; font-family: monospace; font-size: 10px; color: var(--text-2); display: flex; align-items: center; gap: 3px; }
  .cls-remove { background: none; border: none; color: var(--text-3); cursor: pointer; font-size: 10px; }
  .cls-remove:hover { color: var(--error); }
  .cls-add { background: none; border: 1px dashed var(--bg-4); border-radius: 3px; padding: 2px 7px; font-size: 10px; color: var(--accent); cursor: pointer; }
  .class-dropdown { position: absolute; top: 100%; left: 0; z-index: 10; background: var(--bg-0); border: 1px solid var(--border); border-radius: 4px; padding: 6px; max-height: 200px; overflow-y: auto; min-width: 200px; }
  .class-search { width: 100%; background: var(--bg-2); border: 1px solid var(--border); border-radius: 3px; padding: 3px 6px; color: var(--text-0); font-size: 11px; margin-bottom: 4px; }
  .class-option { display: block; width: 100%; background: none; border: none; text-align: left; padding: 2px 4px; color: var(--text-1); font-family: monospace; font-size: 10px; cursor: pointer; border-radius: 2px; }
  .class-option:hover { background: var(--bg-3); }

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
