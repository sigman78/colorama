import { describe, it, expect } from 'vitest';
import {
  oklchToHex,
  hexToOklch,
  oklchToRgb,
  rgbToOklch,
  oklchToHsl,
  hslToOklch,
  formatOklch,
  lerpHue,
  mixOklch,
  hexToRgb,
} from './color';

describe('hex round-trip', () => {
  it('converts white', () => {
    const oklch = hexToOklch('#ffffff');
    expect(oklch.l).toBeCloseTo(1.0, 2);
    expect(oklch.c).toBeCloseTo(0.0, 2);
  });
  it('round-trips a known color', () => {
    const hex = '#268bd2';
    expect(oklchToHex(hexToOklch(hex))).toBe(hex);
  });
});

describe('formatOklch', () => {
  it('formats with deg suffix', () => {
    expect(formatOklch({ l: 0.73, c: 0.15, h: 244.94 })).toBe('oklch(0.7300 0.1500 244.94deg)');
  });
});

describe('hsl round-trip', () => {
  it('round-trips hsl', () => {
    const oklch = hexToOklch('#268bd2');
    const hsl = oklchToHsl(oklch);
    const back = hslToOklch(hsl);
    expect(oklchToHex(back)).toBe('#268bd2');
  });
});

describe('lerpHue', () => {
  it('interpolates short arc across 0/360 boundary', () => {
    // 350 → 10: shorter arc is +20, midpoint = 0 (or 360)
    expect(lerpHue(350, 10, 0.5)).toBeCloseTo(0, 1);
  });
  it('normal interpolation', () => {
    expect(lerpHue(0, 90, 0.5)).toBeCloseTo(45, 1);
  });
});

describe('mixOklch', () => {
  it('identity at t=0 returns first color', () => {
    const a = { l: 0.73, c: 0.15, h: 244 };
    const b = { l: 0.5, c: 0.1, h: 100 };
    expect(mixOklch(a, b, 0)).toEqual(a);
  });
  it('identity at t=1 returns second color', () => {
    const a = { l: 0.73, c: 0.15, h: 244 };
    const b = { l: 0.5, c: 0.1, h: 100 };
    expect(mixOklch(a, b, 1)).toEqual(b);
  });
});

describe('hexToRgb', () => {
  it('handles 3-character hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe('oklchToRgb NaN guard', () => {
  it('handles NaN hue gracefully when chroma is 0', () => {
    const result = oklchToRgb({ l: 0.5, c: 0, h: NaN });
    expect(result.r).not.toBeNaN();
    expect(result.g).not.toBeNaN();
    expect(result.b).not.toBeNaN();
  });
});
