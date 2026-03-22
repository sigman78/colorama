import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { scheme } from './scheme';
import { commitScheme, beginDrag, endDrag, undo, redo, canUndo, canRedo, _resetForTesting } from './history';
import type { ColorScheme } from '../lib/scheme';

const BASE: ColorScheme = get(scheme);
const A: ColorScheme = { ...BASE, name: 'A' };
const B: ColorScheme = { ...BASE, name: 'B' };
const C: ColorScheme = { ...BASE, name: 'C' };

beforeEach(() => {
  _resetForTesting(BASE);
});

describe('commitScheme', () => {
  it('updates scheme', () => {
    commitScheme(() => A);
    expect(get(scheme).name).toBe('A');
  });

  it('enables undo after commit', () => {
    commitScheme(() => A);
    expect(get(canUndo)).toBe(true);
  });

  it('clears redo stack on commit', () => {
    commitScheme(() => A);
    undo();
    commitScheme(() => B);
    expect(get(canRedo)).toBe(false);
  });
});

describe('undo / redo', () => {
  it('undo restores previous state', () => {
    commitScheme(() => A);
    undo();
    expect(get(scheme).name).toBe(BASE.name);
  });

  it('redo re-applies undone state', () => {
    commitScheme(() => A);
    undo();
    redo();
    expect(get(scheme).name).toBe('A');
  });

  it('undo is no-op when stack is empty', () => {
    undo();
    expect(get(scheme).name).toBe(BASE.name);
  });

  it('redo is no-op when stack is empty', () => {
    redo();
    expect(get(scheme).name).toBe(BASE.name);
  });

  it('multiple undo steps', () => {
    commitScheme(() => A);
    commitScheme(() => B);
    commitScheme(() => C);
    undo();
    expect(get(scheme).name).toBe('B');
    undo();
    expect(get(scheme).name).toBe('A');
    undo();
    expect(get(scheme).name).toBe(BASE.name);
  });
});

describe('beginDrag / endDrag', () => {
  it('beginDrag captures pre-drag snapshot', () => {
    commitScheme(() => A);
    beginDrag();
    commitScheme(() => B);
    commitScheme(() => C);
    endDrag();
    undo();
    expect(get(scheme).name).toBe('A');
  });

  it('during drag commitScheme does not push to history', () => {
    commitScheme(() => A);
    beginDrag();
    commitScheme(() => B);
    commitScheme(() => C);
    endDrag();
    expect(get(canRedo)).toBe(false);
    undo();
    expect(get(scheme).name).toBe('A');
    undo();
    expect(get(scheme).name).toBe(BASE.name);
    expect(get(canUndo)).toBe(false);
  });

  it('missed pointerup: second beginDrag does not double-push', () => {
    commitScheme(() => A);
    beginDrag();
    commitScheme(() => B);
    beginDrag();
    commitScheme(() => C);
    endDrag();
    undo();
    expect(get(scheme).name).toBe('A');
  });
});

describe('canUndo / canRedo', () => {
  it('both false initially', () => {
    expect(get(canUndo)).toBe(false);
    expect(get(canRedo)).toBe(false);
  });

  it('canRedo true after undo', () => {
    commitScheme(() => A);
    undo();
    expect(get(canRedo)).toBe(true);
  });
});
