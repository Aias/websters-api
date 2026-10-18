import { describe, expect, test } from 'bun:test';
import { slugify } from './slug.ts';

describe('slugify', () => {
  test('hyphenates spaces and lowercases', () => {
    expect(slugify('Sea daffodil')).toBe('sea-daffodil');
    expect(slugify('Young Women’s Christian Association')).toBe(
      'young-womens-christian-association'
    );
  });

  test('folds diacritics and ligatures to ASCII', () => {
    expect(slugify('Aëro')).toBe('aero');
    expect(slugify('Piña')).toBe('pina');
    expect(slugify('Encyclopædia')).toBe('encyclopaedia');
  });

  test('drops intra-word punctuation', () => {
    expect(slugify("Dutchman's-pipe")).toBe('dutchmans-pipe');
    expect(slugify('A. F. of L.')).toBe('a-f-of-l');
    expect(slugify('Doe, John')).toBe('doe-john');
  });

  test('keeps affix hyphens', () => {
    expect(slugify('-able')).toBe('-able');
    expect(slugify('Ab-')).toBe('ab-');
  });

  test('is idempotent', () => {
    expect(slugify('touch-me-not')).toBe('touch-me-not');
  });
});
