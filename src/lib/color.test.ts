import { describe, it, expect } from 'vitest';
import {
  oklchToHex, hexToOklch, oklchToRgb, rgbToOklch,
  oklchToHsl, hslToOklch, formatOklch,
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
    expect(formatOklch({ l: 0.73, c: 0.15, h: 244.94 }))
      .toBe('oklch(0.7300 0.1500 244.94deg)');
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
