import type { OKLCH } from './color';
import { evalFormula, type EvalContext, FormulaError } from './formula';

export type { OKLCH };

export interface PaletteColor {
  name: string;
  color: OKLCH;
}
export interface PaletteScalar {
  name: string;
  value: number;
}
export interface Palette {
  colors: PaletteColor[];
  scalars: PaletteScalar[];
}

export interface SchemeEntry {
  name: string;
  classes: string[];
  fontFormula: string | null;
  backFormula: string | null;
}

export interface ColorScheme {
  name: string;
  base: { font: string; back: string };
  palette: Palette;
  entries: SchemeEntry[];
}

export interface ResolvedEntry {
  name: string;
  classes: string[];
  font: OKLCH | null;
  back: OKLCH | null;
  fontError: string | null;
  backError: string | null;
}

export interface ResolvedScheme {
  base: { font: OKLCH | null; fontError: string | null; back: OKLCH | null; backError: string | null };
  entries: ResolvedEntry[];
}

function makeContext(palette: Palette): EvalContext {
  return {
    colors: Object.fromEntries(palette.colors.map((c) => [c.name, c.color])),
    scalars: Object.fromEntries(palette.scalars.map((s) => [s.name, s.value])),
  };
}

function resolveFormula(
  formula: string | null,
  ctx: EvalContext
): { color: OKLCH | null; error: string | null } {
  if (formula === null || formula.trim() === '') return { color: null, error: null };
  try {
    return { color: evalFormula(formula, ctx), error: null };
  } catch (e) {
    return { color: null, error: e instanceof FormulaError ? e.message : String(e) };
  }
}

export function evaluateScheme(scheme: ColorScheme): ResolvedScheme {
  const ctx = makeContext(scheme.palette);
  const baseFont = resolveFormula(typeof scheme.base.font === 'string' ? scheme.base.font : null, ctx);
  const baseBack = resolveFormula(typeof scheme.base.back === 'string' ? scheme.base.back : null, ctx);
  return {
    base: {
      font: baseFont.color,
      fontError: typeof scheme.base.font !== 'string' || scheme.base.font.trim() === '' ? 'required' : baseFont.error,
      back: baseBack.color,
      backError: typeof scheme.base.back !== 'string' || scheme.base.back.trim() === '' ? 'required' : baseBack.error,
    },
    entries: scheme.entries.map((entry) => {
      // Font context: $F = base font (same-context → base), $B = base back (entry back unknown yet)
      const fontColors: Record<string, OKLCH> = { ...ctx.colors };
      if (baseFont.color) fontColors['F'] = baseFont.color;
      if (baseBack.color) fontColors['B'] = baseBack.color;
      const font = resolveFormula(entry.fontFormula, { ...ctx, colors: fontColors });

      // Back context: $F = resolved entry font ?? base font (opposite-context), $B = base back
      const backColors: Record<string, OKLCH> = { ...ctx.colors };
      const fColor = font.color ?? baseFont.color;
      if (fColor) backColors['F'] = fColor;
      if (baseBack.color) backColors['B'] = baseBack.color;
      const back = resolveFormula(entry.backFormula, { ...ctx, colors: backColors });

      return {
        name: entry.name,
        classes: entry.classes,
        font: font.color,
        back: back.color,
        fontError: font.error,
        backError: back.error,
      };
    }),
  };
}
