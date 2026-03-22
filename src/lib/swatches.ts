import type { OKLCH } from './color';
import { hexToOklch } from './color';

export function parseCoolors(url: string): OKLCH[] | null {
  // coolors.co/palette/rrggbb-rrggbb-... or coolors.co/rrggbb-rrggbb-...
  const match = url.match(/coolors\.co\/(?:palette\/)?([0-9a-fA-F-]+)/);
  if (!match) return null;
  const hexes = match[1].split('-').filter((h) => /^[0-9a-fA-F]{6}$/.test(h));
  if (hexes.length === 0) return null;
  return hexes.map((h) => hexToOklch('#' + h));
}

export function parsePaletton(url: string): OKLCH[] | null {
  // paletton.com encodes colors in the URL hash as uid=...&...
  // Best-effort: look for hex values in the hash
  try {
    const hash = new URL(url).hash;
    const hexes = [...hash.matchAll(/[0-9a-fA-F]{6}/g)].map((m) => m[0]);
    if (hexes.length === 0) return null;
    // Deduplicate and filter out likely non-color 6-char sequences
    const unique = [...new Set(hexes)].slice(0, 8);
    return unique.map((h) => hexToOklch('#' + h));
  } catch {
    return null;
  }
}

export function parseSwatch(url: string): OKLCH[] | null {
  return parseCoolors(url) ?? parsePaletton(url);
}
