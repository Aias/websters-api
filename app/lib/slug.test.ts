import { describe, expect, test } from 'bun:test';
import { slugify } from './slug.ts';

describe('slugify', () => {
  test('lowercases and joins words with underscores', () => {
    expect(slugify('Sea daffodil')).toBe('sea_daffodil');
    expect(slugify('Cast iron')).toBe('cast_iron');
  });

  test('keeps hyphens, apostrophes, periods, and accents that distinguish entries', () => {
    expect(slugify('Cast-iron')).toBe('cast-iron');
    expect(slugify("We'll")).toBe("we'll");
    expect(slugify('Do.')).toBe('do.');
    expect(slugify('Piña')).toBe('piña');
    expect(slugify('-able')).toBe('-able');
  });

  test('normalizes curly apostrophes and decomposed accents', () => {
    expect(slugify('Dragon’s blood')).toBe("dragon's_blood");
    expect(slugify('Aëro')).toBe('aëro');
  });

  test('drops other punctuation', () => {
    expect(slugify('Doe, John')).toBe('doe_john');
    expect(slugify('Adder fly/')).toBe('adder_fly');
  });

  test('leaves slugs unchanged', () => {
    for (const slug of ['sea_daffodil', "we'll", 'cast-iron', 'piña', 'a._f._of_l.']) {
      expect(slugify(slug)).toBe(slug);
    }
  });
});
