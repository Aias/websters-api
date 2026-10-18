import { describe, expect, test } from 'bun:test';
import { parseEntry } from '../../scripts/build-db';
import { entryQuotations, quotationAuthor } from './quotation-authors';

describe('quotation authors', () => {
  test('groups attribution variants under the printed author name', () => {
    expect(quotationAuthor('Milton.')).toEqual({ slug: 'milton', name: 'Milton.', citation: null });
    expect(quotationAuthor('Milton')).toEqual({ slug: 'milton', name: 'Milton.', citation: null });
    expect(quotationAuthor('MIlton.').slug).toBe('milton');
    expect(quotationAuthor('Sir. W. Hamilton.').slug).toBe(
      quotationAuthor('Sir W. Hamilton.').slug
    );
    expect(quotationAuthor('Beau. & Fl.')).toMatchObject({ slug: 'beau_fl', name: 'Beau. & Fl.' });
  });

  test('keeps cited works as citations', () => {
    expect(quotationAuthor('Milton (Comus).')).toEqual({
      slug: 'milton',
      name: 'Milton.',
      citation: 'Milton (Comus).',
    });
    expect(quotationAuthor('Wycliff [Matt. xxvii. 51, 52].').name).toBe('Wycliff.');
    expect(quotationAuthor('Terence in English(1614)').name).toBe('Terence in English.');
    expect(quotationAuthor('Huxley, 1870.').name).toBe('Huxley.');
  });

  test('attributes scripture references to the Bible', () => {
    for (const reference of [
      'Gen. xli. 20.',
      '1 Sam. xxi. 13.',
      'I Kings xiii. 4.',
      'Luke 8: 25.',
      'Prov. xxix 3.',
      'Jude 21.',
      '2. John 10.',
      'Phil. 7 (Rev. Ver.).',
      'Bible, 1551. Rom. viii. 21.',
    ]) {
      expect(quotationAuthor(reference)).toEqual({
        slug: 'bible',
        name: 'Bible.',
        citation: reference,
      });
    }
    expect(quotationAuthor('Isa. xxix. 17 (Douay version).').name).toBe('Bible.');
    expect(quotationAuthor('Bible (1551).').name).toBe('Bible.');
    expect(quotationAuthor('I. Taylor (The Alphabet).').name).toBe('I. Taylor.');
  });

  test('collects every attributed quotation in an entry', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2><span class="sn">1.</span><span class="def">First.</span>' +
        '<span class="q">One quote. <span class="qau">Shak.</span></span>' +
        '<span class="sn">2.</span><span class="def">Second.</span>' +
        '<span class="q">Another quote. <span class="qau">Bacon.</span><span class="qau">Dryden.</span></span>' +
        '<span class="q">Unattributed.</span>'
    );
    expect(entryQuotations(entry).map(({ slug }) => slug)).toEqual(['shak', 'bacon', 'dryden']);
  });
});
