import { describe, it, expect } from 'vitest';
import { evaluateScheme, type ColorScheme } from './scheme';

const scheme: ColorScheme = {
  name: 'Test',
  base: { font: { l: 0.7, c: 0.016, h: 205 }, back: { l: 0.27, c: 0.049, h: 219.84 } },
  palette: {
    colors: [{ name: 'blue', color: { l: 0.73, c: 0.15, h: 244.94 } }],
    scalars: [{ name: 'dim', value: 0.6 }],
  },
  entries: [
    { name: 'keyword', classes: ['.hljs-keyword'], fontFormula: '$blue', backFormula: null },
    {
      name: 'dimmed',
      classes: ['.hljs-comment'],
      fontFormula: 'oklch($blue.l * $dim, $blue.c, $blue.h)',
      backFormula: null,
    },
    { name: 'badFormula', classes: [], fontFormula: 'mix($blue,', backFormula: null },
  ],
};

describe('evaluateScheme', () => {
  it('resolves a simple color variable entry', () => {
    const result = evaluateScheme(scheme);
    expect(result.entries[0].font).toEqual({ l: 0.73, c: 0.15, h: 244.94 });
    expect(result.entries[0].back).toBeNull();
  });
  it('evaluates formula with scalar', () => {
    const result = evaluateScheme(scheme);
    expect(result.entries[1].font?.l).toBeCloseTo(0.73 * 0.6, 4);
  });
  it('records error for invalid formula without throwing', () => {
    const result = evaluateScheme(scheme);
    expect(result.entries[2].fontError).toContain('unexpected end');
  });
});
