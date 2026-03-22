import { writable, derived } from 'svelte/store';
import type { ColorScheme } from '../lib/scheme';
import { evaluateScheme, type ResolvedScheme } from '../lib/scheme';
import { SOLARIZED_DARK } from '../lib/defaults';

function loadSaved(): ColorScheme {
  try {
    const raw = localStorage.getItem('color-schemer:scheme');
    if (raw) {
      const parsed = JSON.parse(raw) as ColorScheme;
      // Migrate old format: base.font/back were OKLCH objects, now formula strings
      if (typeof parsed.base?.font !== 'string' || typeof parsed.base?.back !== 'string') {
        return SOLARIZED_DARK;
      }
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return SOLARIZED_DARK;
}

export const scheme = writable<ColorScheme>(loadSaved());

// Persist to localStorage on every change
scheme.subscribe((s) => {
  try {
    localStorage.setItem('color-schemer:scheme', JSON.stringify(s));
  } catch {
    /* ignore */
  }
});

/** Eagerly evaluated resolved colors — recomputes on every scheme change */
export const resolved = derived<typeof scheme, ResolvedScheme>(scheme, ($scheme) =>
  evaluateScheme($scheme)
);
