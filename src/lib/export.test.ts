import { describe, it, expect } from 'vitest';
import { schemeToJson, schemeFromJson, generateCss, scopeToCssSelector } from './export';
import { evaluateScheme, type ColorScheme } from './scheme';

const scheme: ColorScheme = {
  name: 'Test',
  base: { font: '$blue', back: '$blue' },
  palette: {
    colors: [{ name: 'blue', color: { l: 0.73, c: 0.15, h: 244.94 } }],
    scalars: [{ name: 'dim', value: 0.6 }],
  },
  entries: [
    {
      name: 'keyword',
      classes: ['keyword', 'type'],
      fontFormula: '$blue',
      backFormula: null,
    },
    { name: 'comment', classes: ['comment'], fontFormula: null, backFormula: null },
  ],
};

describe('JSON round-trip', () => {
  it('restores scheme exactly', () => {
    const restored = schemeFromJson(schemeToJson(scheme));
    expect(restored).toEqual(scheme);
  });
});

describe('generateCss', () => {
  it('emits base rule with palette vars for direct assignments', () => {
    const css = generateCss(evaluateScheme(scheme), scheme);
    expect(css).toContain('pre code.hljs');
    expect(css).toContain('--test-blue: oklch(0.7300');
    expect(css).toContain('color: var(--test-blue);');
    expect(css).toContain('background: var(--test-blue);');
    expect(css).not.toContain('--cs-font');
    expect(css).not.toContain('--cs-back');
  });

  it('emits entry selector with palette var for direct assignments', () => {
    const css = generateCss(evaluateScheme(scheme), scheme);
    expect(css).toContain('.hljs-keyword');
    expect(css).toContain('.hljs-type');
    expect(css).toContain('.hljs-keyword,\n.hljs-type {');
    expect(css).toContain('color: var(--test-blue);');
  });

  it('omits entire rule for fully-null entry', () => {
    const css = generateCss(evaluateScheme(scheme), scheme);
    expect(css).not.toContain('.hljs-comment');
  });

  it('emits computed formulas as resolved colors with inline formula comments', () => {
    const s: ColorScheme = {
      ...scheme,
      base: { font: 'oklch($blue.l * $dim, $blue.c, $blue.h)', back: '$blue' },
      entries: [
        {
          name: 'keyword',
          classes: ['keyword'],
          fontFormula: 'lighten($blue, 0.1)',
          backFormula: '$F',
        },
      ],
    };
    const css = generateCss(evaluateScheme(s), s);
    expect(css).toContain(
      'color: oklch(0.4380 0.1500 244.94deg); /* oklch($blue.l * $dim, $blue.c, $blue.h) */;'
    );
    expect(css).toContain(
      'color: oklch(0.8300 0.1500 244.94deg); /* lighten($blue, 0.1) */;'
    );
    expect(css).toContain(
      'background-color: oklch(0.8300 0.1500 244.94deg); /* $F */;'
    );
  });

  it('does not emit CSS vars for non-palette variables', () => {
    const s: ColorScheme = {
      ...scheme,
      entries: [
        {
          name: 'keyword',
          classes: ['keyword'],
          fontFormula: 'oklch(clamp($dim, 0, 1), $blue.c, $blue.h)',
          backFormula: null,
        },
      ],
    };
    const css = generateCss(evaluateScheme(s), s);
    expect(css).not.toContain('var(--dim)');
    expect(css).toContain('/* oklch(clamp($dim, 0, 1), $blue.c, $blue.h) */');
  });

  it('falls back to hljs-theme prefix when scheme name is empty', () => {
    const s: ColorScheme = {
      ...scheme,
      name: '   ',
    };
    const css = generateCss(evaluateScheme(s), s);
    expect(css).toContain('--hljs-theme-blue: oklch(0.7300');
    expect(css).toContain('color: var(--hljs-theme-blue);');
  });

  it('converts subscope and nested scope names to CSS selectors in output', () => {
    const s: ColorScheme = {
      ...scheme,
      entries: [
        {
          name: 'def',
          classes: ['title.class', 'meta keyword'],
          fontFormula: '$blue',
          backFormula: null,
        },
      ],
    };
    const css = generateCss(evaluateScheme(s), s);
    expect(css).toContain('.hljs-title.class_');
    expect(css).toContain('.hljs-meta .hljs-keyword');
    expect(css).not.toContain('title.class {');
  });
});

describe('scopeToCssSelector', () => {
  it('simple: prepends prefix', () => {
    expect(scopeToCssSelector('comment')).toBe('.hljs-comment');
  });

  it('simple: preserves hyphens and underscores', () => {
    expect(scopeToCssSelector('selector-id')).toBe('.hljs-selector-id');
    expect(scopeToCssSelector('built_in')).toBe('.hljs-built_in');
    expect(scopeToCssSelector('meta-keyword')).toBe('.hljs-meta-keyword');
  });

  it('subscope depth-1: adds one trailing underscore', () => {
    expect(scopeToCssSelector('title.class')).toBe('.hljs-title.class_');
    expect(scopeToCssSelector('title.function')).toBe('.hljs-title.function_');
    expect(scopeToCssSelector('variable.constant')).toBe('.hljs-variable.constant_');
  });

  it('subscope depth-2: adds two trailing underscores', () => {
    expect(scopeToCssSelector('title.class.inherited')).toBe('.hljs-title.class_.inherited__');
  });

  it('nested: prefixes both parts, rejoins with space', () => {
    expect(scopeToCssSelector('meta keyword')).toBe('.hljs-meta .hljs-keyword');
    expect(scopeToCssSelector('meta string')).toBe('.hljs-meta .hljs-string');
  });

  it('custom prefix is respected', () => {
    expect(scopeToCssSelector('comment', '.shiki-')).toBe('.shiki-comment');
    expect(scopeToCssSelector('title.class', '.shiki-')).toBe('.shiki-title.class_');
  });
});
