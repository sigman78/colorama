import { describe, it, expect } from 'vitest';
import { parseFormula, evalFormula, FormulaError } from './formula';
import type { EvalContext } from './formula';

const ctx: EvalContext = {
  colors: {
    blue: { l: 0.73, c: 0.15, h: 244.94 },
    cyan: { l: 0.76, c: 0.12, h: 187.42 },
    red: { l: 0.58, c: 0.21, h: 27.11 },
  },
  scalars: { dim: 0.6, contrast: 0.85 },
};

describe('simple variable', () => {
  it('resolves color variable', () => {
    const result = evalFormula('$blue', ctx);
    expect(result).toEqual(ctx.colors.blue);
  });
  it('rejects scalar in color position', () => {
    expect(() => evalFormula('$dim', ctx)).toThrow(FormulaError);
  });
});

describe('component access', () => {
  it('extracts .l', () => {
    expect(evalFormula('oklch($blue.l, $blue.c, $blue.h)', ctx)).toEqual(ctx.colors.blue);
  });
});

describe('arithmetic', () => {
  it('multiplies scalar', () => {
    const result = evalFormula('oklch($blue.l * $dim, $blue.c, $blue.h)', ctx);
    expect((result as any).l).toBeCloseTo(0.73 * 0.6, 4);
  });
});

describe('color functions', () => {
  it('mix() blends two colors', () => {
    const result = evalFormula('mix($blue, $cyan, 0.5)', ctx) as any;
    expect(result.l).toBeCloseTo((0.73 + 0.76) / 2, 3);
  });
  it('lighten() increases l', () => {
    const result = evalFormula('lighten($blue, 0.1)', ctx) as any;
    expect(result.l).toBeCloseTo(0.83, 3);
  });
  it('gradient() interpolates multi-stop', () => {
    const result = evalFormula('gradient(0.5, $blue, $cyan)', ctx) as any;
    expect(result.l).toBeCloseTo((0.73 + 0.76) / 2, 3);
  });
  it('gradient() requires min 2 stops', () => {
    expect(() => evalFormula('gradient(0.5, $blue)', ctx)).toThrow(FormulaError);
  });
});

describe('scalar functions', () => {
  it('clamp()', () => {
    const r = evalFormula('oklch(clamp(1.5, 0, 1), 0, 0)', ctx) as any;
    expect(r.l).toBe(1);
  });
  it('soft() clamps input then applies 3x²-2x³', () => {
    const r = evalFormula('oklch(soft(0.5), 0, 0)', ctx) as any;
    expect(r.l).toBeCloseTo(0.5, 3); // soft(0.5) = 3*0.25 - 2*0.125 = 0.5
  });
  it('sin()', () => {
    const r = evalFormula('oklch(sin(0), 0, 0)', ctx) as any;
    expect(r.l).toBeCloseTo(0, 5);
  });
});

describe('errors', () => {
  it('unknown variable', () => {
    expect(() => evalFormula('$unknown', ctx)).toThrow(FormulaError);
  });
  it('unexpected end of input', () => {
    expect(() => evalFormula('mix($blue, $cyan,', ctx)).toThrow(FormulaError);
  });
  it('result must be a color', () => {
    expect(() => evalFormula('0.5', ctx)).toThrow(FormulaError);
  });
});
