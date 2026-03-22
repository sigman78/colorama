import { get, derived, writable } from 'svelte/store';
import type { ColorScheme } from '../lib/scheme';
import { scheme } from './scheme';

const MAX = 50;

const _undoStack = writable<ColorScheme[]>([]);
const _redoStack = writable<ColorScheme[]>([]);
let _isDragging = false;

export const canUndo = derived(_undoStack, (s) => s.length > 0);
export const canRedo = derived(_redoStack, (s) => s.length > 0);

function pushUndo(snapshot: ColorScheme) {
  _undoStack.update((s) => {
    const next = [...s, snapshot];
    return next.length > MAX ? next.slice(next.length - MAX) : next;
  });
}

export function commitScheme(updater: (s: ColorScheme) => ColorScheme): void {
  const current = get(scheme);
  if (!_isDragging) {
    pushUndo(current);
    _redoStack.set([]);
  }
  scheme.set(updater(current));
}

export function beginDrag(): void {
  if (!_isDragging) {
    pushUndo(get(scheme));
    _redoStack.set([]);
  } else {
    _redoStack.set([]);
  }
  _isDragging = true;
}

export function endDrag(): void {
  _isDragging = false;
}

export function undo(): void {
  const stack = get(_undoStack);
  if (stack.length === 0) return;
  const snapshot = stack[stack.length - 1];
  const current = get(scheme);
  _undoStack.set(stack.slice(0, -1));
  _redoStack.set([...get(_redoStack), current]);
  scheme.set(snapshot);
}

export function redo(): void {
  const stack = get(_redoStack);
  if (stack.length === 0) return;
  const snapshot = stack[stack.length - 1];
  const current = get(scheme);
  _redoStack.set(stack.slice(0, -1));
  _undoStack.set([...get(_undoStack), current]);
  scheme.set(snapshot);
}

/** Only for use in tests — resets all internal state to a clean slate. */
export function _resetForTesting(initial: ColorScheme): void {
  _undoStack.set([]);
  _redoStack.set([]);
  _isDragging = false;
  scheme.set(initial);
}
