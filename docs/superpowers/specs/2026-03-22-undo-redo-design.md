# Undo/Redo Design

**Date:** 2026-03-22
**Scope:** Global session-only undo/redo for all ColorScheme mutations
**Keyboard:** Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z only (no UI buttons for now)

---

## Architecture

A new `src/stores/history.ts` module owns the undo/redo stack. It wraps the existing `scheme` writable store. Components stop calling `scheme.update()` or `scheme.set()` for mutations and instead call `commitScheme()` from the history store. Components may still import `scheme` for reactive reads (e.g. `$scheme.name`). The `scheme` store remains writable so the history module can restore snapshots via `scheme.set()` without re-entering the history logic.

History is session-only — it is not persisted to localStorage. The existing localStorage subscriber fires on every `scheme.set()` call including undo/redo restorations, so the current scheme state is always persisted regardless of how it changed. This is intentional.

---

## History Store API

```typescript
// src/stores/history.ts

export function commitScheme(updater: (s: ColorScheme) => ColorScheme): void
export function beginDrag(): void
export function endDrag(): void
export function undo(): void
export function redo(): void
export const canUndo: Readable<boolean>
export const canRedo: Readable<boolean>
```

### Internal state

- `undoStack: ColorScheme[]` — capped at 50 entries; oldest entry dropped when full
- `redoStack: ColorScheme[]` — cleared on every `commitScheme` call and on `beginDrag`
- `isDragging: boolean` — true while a slider thumb is held

### `commitScheme(updater)`

1. If `isDragging`: call `scheme.set(updater(get(scheme)))` only — no stack change.
2. If not dragging: push `get(scheme)` onto `undoStack` (drop oldest if at cap), clear `redoStack`, call `scheme.set(updater(get(scheme)))`.

For callers that produce a full replacement value rather than a transform (e.g. loading from JSON), the correct form is `commitScheme(() => newScheme)`.

### `beginDrag()`

- If `isDragging` is `false`: push `get(scheme)` onto `undoStack` (same cap logic), clear `redoStack`, set `isDragging = true`.
- If `isDragging` is already `true` (missed `pointerup`): clear `redoStack`, set `isDragging = true`. Do **not** push another snapshot — the stack already has the pre-drag state from the previous `beginDrag`.

### `endDrag()`

Set `isDragging = false`.

### `undo()`

If `undoStack` is empty, no-op. Otherwise: push `get(scheme)` onto `redoStack`, pop the top of `undoStack`, call `scheme.set(popped)`.

### `redo()`

If `redoStack` is empty, no-op. Otherwise: push `get(scheme)` onto `undoStack`, pop the top of `redoStack`, call `scheme.set(popped)`.

---

## Drag Detection

Two components produce continuous input and both require drag handling.

**`GradientSlider.svelte`** — `beginDrag` and `endDrag` are imported directly inside `GradientSlider.svelte` and wired to the internal `<input type="range">`. The parent (`ColorPicker`) does not need to thread any drag props:

```svelte
<!-- inside GradientSlider.svelte -->
import { beginDrag, endDrag } from '../../stores/history';

<input type="range"
  onpointerdown={beginDrag}
  onpointerup={endDrag}
  onpointercancel={endDrag}
  oninput={...}
/>
```

**`PaletteEditor.svelte`** — the scalar value editor uses a bare `<input type="range">` (not `GradientSlider`). It gets the same three handlers inline. `beginDrag`/`endDrag` are imported at the top of `PaletteEditor.svelte`.

`beginDrag` fires once when the thumb is grabbed, capturing the pre-drag snapshot. All `oninput` events during the drag call `commitScheme`, which skips pushing to history while `isDragging` is true. `endDrag` clears the flag on release or cancel.

**`ColorSlice.svelte`** uses a single `onclick` handler — a discrete pick, not a drag — so it calls `commitScheme` normally with no drag handling needed. If `ColorSlice` is ever extended to support drag-to-pick, it would need the same treatment.

**Note on `BaseColorRow.svelte`:** this component embeds `ColorPicker` (which uses `GradientSlider`). The drag handling in `GradientSlider` covers this path automatically. The color change callback flows up through `EntriesEditor.svelte` which calls `commitScheme` — no changes needed in `BaseColorRow` itself.

---

## Callsite Migration

All `scheme.update()` and `scheme.set()` mutation calls in components are replaced with `commitScheme(...)`. Components may still import `scheme` for reactive reads.

| File | Actions migrated |
|------|-----------------|
| `src/App.svelte` | rename scheme (1 callsite) |
| `src/components/palette/PaletteEditor.svelte` | add/delete color, update color, add/delete scalar, update scalar, drag-reorder colors, drag-reorder scalars |
| `src/components/entries/EntriesEditor.svelte` | update base font formula, update base back formula, add entry, delete entry |
| `src/components/entries/EntryBlock.svelte` | rename entry, add class, remove class, set font formula, set back formula |
| `src/components/palette/SwatchImport.svelte` | bulk import colors |
| `src/components/export/ExportPanel.svelte` | load scheme from JSON file (`commitScheme(() => parsedScheme)`) |

`scheme.ts` (store) remains unchanged. `history.ts` is the only module that calls `scheme.set()` for undo/redo restoration.

---

## Keyboard Handler

Added to `App.svelte` via `<svelte:window>`:

```svelte
import { undo, redo } from './stores/history';

<svelte:window onkeydown={(e) => {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyZ') { e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyY') { e.preventDefault(); redo(); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyZ') { e.preventDefault(); redo(); }
}} />
```

`e.code` is used (not `e.key`) for layout-independence. `e.preventDefault()` suppresses the browser's native undo within the window; native undo within individual text `<input>` fields continues to work for the field's own edit history — this is acceptable.

---

## Files Changed

| File | Change |
|------|--------|
| `src/stores/history.ts` | **NEW** — history store, full API |
| `src/App.svelte` | Add `<svelte:window>` keydown handler; migrate 1 callsite |
| `src/components/palette/GradientSlider.svelte` | Import and wire `beginDrag`/`endDrag` internally |
| `src/components/palette/PaletteEditor.svelte` | Migrate ~8 callsites; add drag handlers to scalar range input |
| `src/components/entries/EntriesEditor.svelte` | Migrate ~4 callsites |
| `src/components/entries/EntryBlock.svelte` | Migrate ~5 callsites |
| `src/components/palette/SwatchImport.svelte` | Migrate 1 callsite |
| `src/components/export/ExportPanel.svelte` | Migrate 1 callsite |

---

## Out of Scope

- UI buttons for undo/redo (keyboard only for now)
- Persisting undo history across page refreshes
- Undoing UI state changes (active tab, color picker selection, preview language)
- Per-field text undo within inputs (handled natively by the browser)
