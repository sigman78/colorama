import { describe, it, expect } from 'vitest';
import { schemeToJson, schemeFromJson, generateCss } from './export';
import { evaluateScheme, type ColorScheme } from './scheme';

const scheme: ColorScheme = {
  name: 'Test',
  base: { font: { l: 0.7, c: 0.016, h: 205 }, back: { l: 0.27, c: 0.049, h: 219.84 } },
  palette: {
    colors: [{ name: 'blue', color: { l: 0.73, c: 0.15, h: 244.94 } }],
    scalars: [{ name: 'dim', value: 0.6 }],
  },
  entries: [
    {
      name: 'keyword',
      classes: ['.hljs-keyword', '.hljs-type'],
      fontFormula: '$blue',
      backFormula: null,
    },
    { name: 'comment', classes: ['.hljs-comment'], fontFormula: null, backFormula: null },
  ],
};

describe('JSON round-trip', () => {
  it('restores scheme exactly', () => {
    const restored = schemeFromJson(schemeToJson(scheme));
    expect(restored).toEqual(scheme);
  });
});

describe('generateCss', () => {
  it('emits base rule with font and background', () => {
    const css = generateCss(evaluateScheme(scheme), scheme);
    expect(css).toContain('pre code.hljs');
    expect(css).toContain('oklch(0.7000');
    expect(css).toContain('oklch(0.2700');
  });
  it('emits entry selector with resolved color', () => {
    const css = generateCss(evaluateScheme(scheme), scheme);
    expect(css).toContain('.hljs-keyword');
    expect(css).toContain('.hljs-type');
    expect(css).toContain('oklch(0.7300');
  });
  it('omits null formula properties (no color: for comment)', () => {
    const css = generateCss(evaluateScheme(scheme), scheme);
    // comment has null font and null back — no color: or background-color: in its block
    const commentBlock = css.split('.hljs-comment')[1]?.split('}')[0] ?? '';
    expect(commentBlock).not.toContain('color:');
  });
});
