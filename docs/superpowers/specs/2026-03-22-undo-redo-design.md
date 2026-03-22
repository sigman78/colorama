# Undo/Redo Design

**Date:** 2026-03-22
**Scope:** Global session-only undo/redo for all ColorScheme mutations
**Keyboard:** Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z only (no UI buttons for now)

---

## Architecture

A new `src/stores/history.ts` module owns the undo/redo stack. It wraps the existing `scheme` writable store. Components stop calling `scheme.update()` directly and instead call `commitScheme()` from the history store. The `scheme` store remains writable so the history module can restore snapshots via `scheme.set()` without re-entering the history logic.

History is session-only — it is not persisted to localStorage. The existing localStorage auto-save continues to persist the current scheme state only, unchanged.

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
- `redoStack: ColorScheme[]` — cleared on every `commitScheme` call
- `isDragging: boolean` — true while a slider thumb is held

### `commitScheme(updater)`

1. If `isDragging`: call `scheme.set(updater(get(scheme)))` only — no stack change.
2. If not dragging: push `get(scheme)` onto `undoStack` (drop oldest if at cap), clear `redoStack`, call `scheme.set(updater(get(scheme)))`.

### `beginDrag()`

Push `get(scheme)` onto `undoStack` (same cap logic), clear `redoStack`, set `isDragging = true`. Always pushes regardless of current `isDragging` state — guards against a missed `pointerup` leaving the flag stuck.

### `endDrag()`

Set `isDragging = false`.

### `undo()`

If `undoStack` is empty, no-op. Otherwise: push `get(scheme)` onto `redoStack`, pop the top of `undoStack`, call `scheme.set(popped)`.

### `redo()`

If `redoStack` is empty, no-op. Otherwise: push `get(scheme)` onto `undoStack`, pop the top of `redoStack`, call `scheme.set(popped)`.

---

## Drag Detection

`GradientSlider.svelte` is the only continuous-input component. Three new handlers are added to its `<input type="range">`:

```svelte
import { beginDrag, endDrag } from '../../stores/history';

<input type="range"
  onpointerdown={beginDrag}
  onpointerup={endDrag}
  onpointercancel={endDrag}
  oninput={...}
/>
```

`beginDrag` fires once when the thumb is grabbed, capturing the pre-drag snapshot. All `oninput` events during the drag call `commitScheme`, which skips pushing to history while `isDragging` is true. `endDrag` clears the flag on release or cancel.

`ColorSlice.svelte` uses a single click handler (`onclick`) — a discrete action — so it calls `commitScheme` normally with no drag handling needed.

---

## Callsite Migration

All `scheme.update()` / `scheme.set()` calls in components are replaced with `commitScheme(...)`. The `scheme` store is no longer imported by components.

| File | Actions migrated |
|------|-----------------|
| `src/App.svelte` | rename scheme, load scheme from file |
| `src/components/palette/PaletteEditor.svelte` | add/delete color, update color, add/delete scalar, update scalar, drag-reorder colors, drag-reorder scalars |
| `src/components/entries/EntriesEditor.svelte` | update base font formula, update base back formula, add entry, delete entry |
| `src/components/entries/EntryBlock.svelte` | rename entry, add class, remove class, set font formula, set back formula |
| `src/components/palette/SwatchImport.svelte` | bulk import colors |

`scheme.ts` (store) remains unchanged in its public interface. `history.ts` is the only module that calls `scheme.set()` for undo/redo restoration.

---

## Keyboard Handler

Added to `App.svelte` via `<svelte:window>`:

```svelte
import { undo, redo } from './stores/history';

<svelte:window onkeydown={(e) => {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyZ') { e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') { e.preventDefault(); redo(); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyZ') { e.preventDefault(); redo(); }
}} />
```

`e.code` is used (not `e.key`) for layout-independence. `e.preventDefault()` suppresses the browser's native undo within the window, though native undo within individual text `<input>` fields continues to work for the field's own edit history — this is acceptable behavior.

---

## Files Changed

| File | Change |
|------|--------|
| `src/stores/history.ts` | **NEW** — history store, full API |
| `src/App.svelte` | Add `<svelte:window>` keydown handler; migrate 2 callsites |
| `src/components/palette/GradientSlider.svelte` | Add `onpointerdown`, `onpointerup`, `onpointercancel` handlers |
| `src/components/palette/PaletteEditor.svelte` | Migrate ~8 callsites |
| `src/components/entries/EntriesEditor.svelte` | Migrate ~4 callsites |
| `src/components/entries/EntryBlock.svelte` | Migrate ~5 callsites |
| `src/components/palette/SwatchImport.svelte` | Migrate 1 callsite |

---

## Out of Scope

- UI buttons for undo/redo (keyboard only for now)
- Persisting undo history across page refreshes
- Undoing UI state changes (active tab, color picker selection, preview language)
- Per-field text undo within inputs (handled natively by the browser)
