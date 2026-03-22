import { describe, it, expect } from 'vitest';
import { parseCoolors } from './swatches';

describe('parseCoolors', () => {
  it('extracts hex colors from path', () => {
    const colors = parseCoolors('https://coolors.co/palette/268bd2-2aa198-b58900-dc322f-859900');
    expect(colors).toHaveLength(5);
    expect(colors![0]).toMatchObject({
      l: expect.any(Number),
      c: expect.any(Number),
      h: expect.any(Number),
    });
  });
  it('returns null for unrecognized URL', () => {
    expect(parseCoolors('https://example.com/foo')).toBeNull();
  });
});
