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
  base: { font: OKLCH; back: OKLCH };
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
  base: { font: OKLCH; back: OKLCH };
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
  return {
    base: scheme.base,
    entries: scheme.entries.map((entry) => {
      const font = resolveFormula(entry.fontFormula, ctx);
      const back = resolveFormula(entry.backFormula, ctx);
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
