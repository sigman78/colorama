export interface OKLCH {
  l: number;
  c: number;
  h: number;
}
export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface HSL {
  h: number;
  s: number;
  l: number;
}

// sRGB gamma — exported for canvas use
export function toLinear(x: number): number {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}
export function fromLinear(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

/** Returns raw unclamped linear sRGB channels — exported for gamut checking and canvas rendering */
export function oklchToLinearChannels(l: number, c: number, h: number): [number, number, number] {
  const safeH = c === 0 || !isFinite(h) ? 0 : h;
  const a = c * Math.cos((safeH * Math.PI) / 180);
  const b = c * Math.sin((safeH * Math.PI) / 180);
  const lv = l + 0.3963377774 * a + 0.2158037573 * b;
  const mv = l - 0.1055613458 * a - 0.0638541728 * b;
  const sv = l - 0.0894841775 * a - 1.291485548 * b;
  const rl = lv * lv * lv,
    ml = mv * mv * mv,
    sl = sv * sv * sv;
  return [
    4.0767416621 * rl - 3.3077115913 * ml + 0.2309699292 * sl,
    -1.2684380046 * rl + 2.6097574011 * ml - 0.3413193965 * sl,
    -0.0041960863 * rl - 0.7034186147 * ml + 1.707614701 * sl,
  ];
}

export function rgbToOklch({ r, g, b }: RGB): OKLCH {
  const rl = toLinear(r / 255),
    gl = toLinear(g / 255),
    bl = toLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl);
  const m = Math.cbrt(0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl);
  const s = Math.cbrt(0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const av = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bv = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.sqrt(av * av + bv * bv);
  let hv = Math.atan2(bv, av) * (180 / Math.PI);
  if (hv < 0) hv += 360;
  return { l: L, c, h: hv };
}

export function oklchToRgb({ l, c, h }: OKLCH): RGB {
  const [rLin, gLin, bLin] = oklchToLinearChannels(l, c, h);
  return {
    r: Math.round(Math.max(0, Math.min(255, fromLinear(rLin) * 255))),
    g: Math.round(Math.max(0, Math.min(255, fromLinear(gLin) * 255))),
    b: Math.round(Math.max(0, Math.min(255, fromLinear(bLin) * 255))),
  };
}

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function hexToOklch(hex: string): OKLCH {
  return rgbToOklch(hexToRgb(hex));
}

export function oklchToHex(oklch: OKLCH): string {
  return rgbToHex(oklchToRgb(oklch));
}

export function oklchToHsl({ l, c, h }: OKLCH): HSL {
  const { r, g, b } = oklchToRgb({ l, c, h });
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  const ll = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: ll };
  const d = max - min;
  const s = ll > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hv =
    max === rn
      ? (gn - bn) / d + (gn < bn ? 6 : 0)
      : max === gn
        ? (bn - rn) / d + 2
        : (rn - gn) / d + 4;
  return { h: (hv / 6) * 360, s, l: ll };
}

export function hslToOklch({ h, s, l }: HSL): OKLCH {
  const c2 = (1 - Math.abs(2 * l - 1)) * s;
  const x = c2 * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c2 / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c2;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c2;
  } else if (h < 180) {
    g = c2;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c2;
  } else if (h < 300) {
    r = x;
    b = c2;
  } else {
    r = c2;
    b = x;
  }
  return rgbToOklch({
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  });
}

export function formatOklch({ l, c, h }: OKLCH): string {
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)}deg)`;
}

/** Shorter-arc hue interpolation */
export function lerpHue(a: number, b: number, t: number): number {
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

export function mixOklch(a: OKLCH, b: OKLCH, t: number): OKLCH {
  return {
    l: a.l + (b.l - a.l) * t,
    c: a.c + (b.c - a.c) * t,
    h: lerpHue(a.h, b.h, t),
  };
}

// ─── Gamut utilities ──────────────────────────────────────────────────────────

/** True if the OKLCH color is within the sRGB gamut (no clamping applied) */
export function isInSrgbGamut({ l, c, h }: OKLCH): boolean {
  const [r, g, b] = oklchToLinearChannels(l, c, h);
  return (
    r >= -1e-4 && r <= 1 + 1e-4 && g >= -1e-4 && g <= 1 + 1e-4 && b >= -1e-4 && b <= 1 + 1e-4
  );
}

/**
 * Convert OKLCH to linear Display P3 channels (unclamped).
 * Path: OKLab → LMS^3 → XYZ D65 (M1^{-1}) → linear P3
 */
export function oklchToLinearP3({ l, c, h }: OKLCH): [number, number, number] {
  const safeH = c === 0 || !isFinite(h) ? 0 : h;
  const a = c * Math.cos((safeH * Math.PI) / 180);
  const bv = c * Math.sin((safeH * Math.PI) / 180);
  // M2^{-1}: OKLab → LMS^(1/3)
  const lv = l + 0.3963377774 * a + 0.2158037573 * bv;
  const mv = l - 0.1055613458 * a - 0.0638541728 * bv;
  const sv = l - 0.0894841775 * a - 1.291485548 * bv;
  const rl = lv * lv * lv,
    ml = mv * mv * mv,
    sl = sv * sv * sv;
  // M1^{-1}: LMS → XYZ D65
  const x = 1.2270138511 * rl - 0.5577999807 * ml + 0.281256149 * sl;
  const y = -0.0405801784 * rl + 1.1122568696 * ml - 0.0716766787 * sl;
  const z = -0.0763812845 * rl - 0.4214819784 * ml + 1.5861632204 * sl;
  // XYZ D65 → linear Display P3
  return [
    2.4934969 * x - 0.9313836 * y - 0.4027108 * z,
    -0.829489 * x + 1.7626641 * y + 0.0236248 * z,
    0.0358458 * x - 0.0761724 * y + 0.9568845 * z,
  ];
}

/** True if the OKLCH color is within the Display P3 gamut */
export function isInP3Gamut(oklch: OKLCH): boolean {
  const [r, g, b] = oklchToLinearP3(oklch);
  return (
    r >= -1e-4 && r <= 1 + 1e-4 && g >= -1e-4 && g <= 1 + 1e-4 && b >= -1e-4 && b <= 1 + 1e-4
  );
}

/** Binary search: max chroma still in sRGB gamut at given L and H */
export function srgbChromaLimit(l: number, h: number): number {
  let lo = 0,
    hi = 0.4;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (isInSrgbGamut({ l, c: mid, h })) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Binary search: max chroma still in P3 gamut at given L and H */
export function p3ChromaLimit(l: number, h: number): number {
  let lo = 0,
    hi = 0.4;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (isInP3Gamut({ l, c: mid, h })) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** CSS `color(display-p3 ...)` string for use in style attributes */
export function oklchToP3CssColor(oklch: OKLCH): string {
  const [rl, gl, bl] = oklchToLinearP3(oklch);
  const r = Math.max(0, Math.min(1, fromLinear(Math.max(0, rl))));
  const g = Math.max(0, Math.min(1, fromLinear(Math.max(0, gl))));
  const b = Math.max(0, Math.min(1, fromLinear(Math.max(0, bl))));
  return `color(display-p3 ${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)})`;
}
