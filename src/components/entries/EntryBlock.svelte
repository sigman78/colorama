<script lang="ts">
  import type { SchemeEntry } from '../../lib/scheme';
  import type { ResolvedEntry } from '../../lib/scheme';
  import { HLJS_CLASSES } from '../../lib/hljs-classes';
  import { apcaContrast } from '../../lib/color';
  import type { OKLCH } from '../../lib/color';

  let {
    entry, resolved, resolvedBase, allUsedClasses, onupdate, ondelete,
  }: {
    entry: SchemeEntry;
    resolved: ResolvedEntry;
    resolvedBase: { font: OKLCH | null; back: OKLCH | null };
    allUsedClasses: Set<string>;
    onupdate: (e: SchemeEntry) => void;
    ondelete: () => void;
  } = $props();

  const DROPDOWN_MIN_WIDTH = 220;
  const VIEWPORT_MARGIN = 12;
  const DROPDOWN_GAP = 6;

  let showClassDropdown = $state(false);
  let searchQuery = $state('');
  let activeIndex = $state(-1);
  let searchEl = $state<HTMLInputElement | null>(null);
  let addButtonEl = $state<HTMLButtonElement | null>(null);
  let dropdownEl = $state<HTMLDivElement | null>(null);
  let dropdownStyle = $state('');
  let dropdownWidth = $state(DROPDOWN_MIN_WIDTH);
  let dropdownHeight = $state(220);

  function updateDropdownPosition(recomputeSize = false) {
    if (!showClassDropdown || !addButtonEl) return;

    const rect = addButtonEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const availableBelow = viewportHeight - rect.bottom - VIEWPORT_MARGIN;
    const availableAbove = rect.top - VIEWPORT_MARGIN;
    const opensUpward = availableBelow < 180 && availableAbove > availableBelow;

    if (recomputeSize) {
      dropdownHeight = Math.max(
        120,
        Math.min(320, Math.floor(opensUpward ? availableAbove - DROPDOWN_GAP : availableBelow - DROPDOWN_GAP)),
      );
      dropdownWidth = Math.min(
        Math.max(rect.width, DROPDOWN_MIN_WIDTH),
        viewportWidth - (VIEWPORT_MARGIN * 2),
      );
    }

    let left = rect.left;
    const maxLeft = viewportWidth - VIEWPORT_MARGIN - dropdownWidth;
    if (left > maxLeft) left = Math.max(VIEWPORT_MARGIN, maxLeft);

    let top = opensUpward
      ? rect.top - DROPDOWN_GAP - dropdownHeight
      : rect.bottom + DROPDOWN_GAP;

    top = Math.max(VIEWPORT_MARGIN, Math.min(top, viewportHeight - VIEWPORT_MARGIN - dropdownHeight));

    dropdownStyle = `position: fixed; left: ${left}px; top: ${top}px; width: ${dropdownWidth}px; height: ${dropdownHeight}px;`;
  }

  function toggleClassDropdown() {
    showClassDropdown = !showClassDropdown;
  }

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

  let filteredClasses = $derived.by(() => {
    const q = searchQuery.toLowerCase();
    const items = HLJS_CLASSES.filter((c) => !entry.classes.includes(c))
      .filter((c) => c.includes(q))
      .map((c) => ({ cls: c, disabled: allUsedClasses.has(c) }));
    return [...items.filter((i) => !i.disabled), ...items.filter((i) => i.disabled)];
  });

  $effect(() => {
    if (showClassDropdown && searchEl) {
      searchEl.focus();
      activeIndex = -1;
      searchQuery = '';
    }
  });

  $effect(() => {
    // reset nav when search changes
    void searchQuery;
    activeIndex = -1;
  });

  $effect(() => {
    if (activeIndex >= 0 && showClassDropdown) {
      const el = dropdownEl?.querySelector(`[data-idx="${activeIndex}"]`) as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest' });
    }
  });

  $effect(() => {
    if (!showClassDropdown) return;

    updateDropdownPosition(true);

    const handleViewportChange = () => updateDropdownPosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  });

  function displayScope(scope: string): string {
    return scope.includes(' ') ? scope.replace(' ', ' > ') : scope;
  }

  function onSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      showClassDropdown = false;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filteredClasses.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && !filteredClasses[activeIndex].disabled) {
        addClass(filteredClasses[activeIndex].cls);
      } else if (activeIndex === -1) {
        const val = searchQuery.trim();
        if (val && !entry.classes.includes(val)) {
          onupdate({ ...entry, classes: [...entry.classes, val] });
          showClassDropdown = false;
        }
      }
    }
  }

  let fontColor = $derived(resolved.font ? `oklch(${resolved.font.l} ${resolved.font.c} ${resolved.font.h}deg)` : 'transparent');
  let backColor = $derived(resolved.back ? `oklch(${resolved.back.l} ${resolved.back.c} ${resolved.back.h}deg)` : 'transparent');

  let effectiveFont = $derived(resolved.font ?? resolvedBase.font);
  let effectiveBack = $derived(resolved.back ?? resolvedBase.back);
  let contrastLc = $derived(
    effectiveFont && effectiveBack ? apcaContrast(effectiveFont, effectiveBack) : null,
  );
  let contrastLabel = $derived(
    contrastLc !== null ? Math.abs(Math.round(contrastLc)).toString() : '--',
  );
  let contrastClass = $derived(
    contrastLc === null
      ? 'contrast-na'
      : Math.abs(contrastLc) >= 75
        ? 'contrast-good'
        : Math.abs(contrastLc) >= 60
          ? 'contrast-ok'
          : Math.abs(contrastLc) >= 45
            ? 'contrast-low'
            : 'contrast-poor',
  );
</script>

<div class="entry-block">
  <div class="entry-header">
    <input class="entry-name" value={entry.name} oninput={setName} />
    <span class="contrast-badge {contrastClass}">{contrastLabel}</span>
    <div class="combo-swatch" style="background: {backColor || 'var(--bg-3)'}; color: {fontColor || 'var(--text-1)'}">Ab</div>
    <button class="del-btn" onclick={ondelete}>&#x2715;</button>
  </div>

  <div class="classes-row">
    {#each entry.classes as cls}
      <span class="cls-tag">{displayScope(cls)} <button class="cls-remove" onclick={() => removeClass(cls)}>&#x2715;</button></span>
    {/each}
    <button bind:this={addButtonEl} class="cls-add" onclick={toggleClassDropdown}>+ add</button>
    {#if showClassDropdown}
      <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
      <div class="dropdown-backdrop" aria-hidden="true" onclick={() => (showClassDropdown = false)}></div>
      <div bind:this={dropdownEl} class="class-dropdown" style={dropdownStyle}>
        <div class="dropdown-header">
          <input
            bind:this={searchEl}
            bind:value={searchQuery}
            class="class-search"
            placeholder="search or type custom..."
            onkeydown={onSearchKeydown}
          />
          <button class="dropdown-close" onclick={() => (showClassDropdown = false)}>&#x2715;</button>
        </div>
        {#each filteredClasses as { cls, disabled }, idx}
          <button
            class="class-option"
            class:active={idx === activeIndex}
            class:used={disabled}
            disabled={disabled}
            data-idx={idx}
            onclick={() => addClass(cls)}
          >{displayScope(cls)}</button>
        {/each}
        {#if filteredClasses.length === 0}
          <span class="no-results">no matches</span>
        {/if}
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
  .contrast-badge { font-size: 9px; font-family: monospace; font-weight: 600; padding: 2px 4px; border-radius: 3px; flex-shrink: 0; min-width: 22px; text-align: center; line-height: 16px; }
  .contrast-na   { background: var(--bg-3); color: var(--text-3); }
  .contrast-good { background: oklch(0.28 0.05 145); color: oklch(0.72 0.15 145); }
  .contrast-ok   { background: oklch(0.28 0.04 85);  color: oklch(0.78 0.14 85); }
  .contrast-low  { background: oklch(0.28 0.06 55);  color: oklch(0.75 0.16 55); }
  .contrast-poor { background: oklch(0.28 0.06 27);  color: oklch(0.72 0.18 27); }
  .del-btn { background: none; border: none; color: var(--text-3); cursor: pointer; }
  .del-btn:hover { color: var(--error); }

  .classes-row { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 7px; position: relative; }
  .cls-tag { background: var(--bg-3); border: 1px solid var(--bg-4); border-radius: 3px; padding: 2px 5px; font-family: monospace; font-size: 10px; color: var(--text-2); display: flex; align-items: center; gap: 3px; }
  .cls-remove { background: none; border: none; color: var(--text-3); cursor: pointer; font-size: 10px; }
  .cls-remove:hover { color: var(--error); }
  .cls-add { background: none; border: 1px dashed var(--bg-4); border-radius: 3px; padding: 2px 7px; font-size: 10px; color: var(--accent); cursor: pointer; }
  .dropdown-backdrop { position: fixed; inset: 0; z-index: 9; }
  .class-dropdown { z-index: 10; background: var(--bg-0); border: 1px solid var(--border); border-radius: 6px; padding: 6px; overflow-y: auto; min-width: 220px; display: flex; flex-direction: column; gap: 1px; box-shadow: 0 14px 38px rgb(0 0 0 / 0.35); }
  .dropdown-header { display: flex; gap: 4px; margin-bottom: 4px; flex-shrink: 0; }
  .class-search { flex: 1; background: var(--bg-2); border: 1px solid var(--border); border-radius: 3px; padding: 3px 6px; color: var(--text-0); font-size: 11px; outline: none; }
  .class-search:focus { border-color: var(--accent); }
  .dropdown-close { background: none; border: none; color: var(--text-3); cursor: pointer; padding: 0 4px; font-size: 12px; }
  .dropdown-close:hover { color: var(--error); }
  .class-option { display: block; width: 100%; background: none; border: none; text-align: left; padding: 2px 6px; color: var(--text-1); font-family: monospace; font-size: 10px; cursor: pointer; border-radius: 2px; flex-shrink: 0; }
  .class-option:hover:not(:disabled) { background: var(--bg-3); }
  .class-option.active { background: var(--bg-3); outline: 1px solid var(--accent); outline-offset: -1px; }
  .class-option.used { color: var(--text-2); cursor: default; opacity: 0.65; }
  .no-results { font-size: 10px; color: var(--text-3); padding: 4px 6px; font-style: italic; }

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
