import { describe, expect, test } from 'bun:test';
import { parseEntry } from '../../scripts/build-db';
import { entryQuotations, quotationAuthor } from './quotation-authors';

describe('quotation authors', () => {
  test('names attribution variants by the full name of their author', () => {
    expect(quotationAuthor('Milton.', 'Abate')).toEqual({
      slug: 'john_milton',
      name: 'John Milton',
      cited: 'Milton.',
      citation: null,
    });
    expect(quotationAuthor('MIlton', 'Abate').slug).toBe('john_milton');
    expect(quotationAuthor('B. Jonson.', 'Abate').slug).toBe(
      quotationAuthor('Ben Jonson.', 'Abate').slug
    );
    expect(quotationAuthor('Nobody in Particular.', 'Abate')).toMatchObject({
      slug: 'nobody_in_particular',
      name: 'Nobody in Particular.',
    });
  });

  test('keeps cited works as citations', () => {
    expect(quotationAuthor('Milton (Comus).', 'Abate')).toEqual({
      slug: 'john_milton',
      name: 'John Milton',
      cited: 'Milton.',
      citation: 'Milton (Comus).',
    });
    expect(quotationAuthor('Wycliff [Matt. xxvii. 51, 52].', 'Abate').cited).toBe('Wycliff.');
    expect(quotationAuthor('Huxley, 1870.', 'Abate').cited).toBe('Huxley.');
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
      expect(quotationAuthor(reference, 'Abate')).toEqual({
        slug: 'bible',
        name: 'Bible',
        cited: 'Bible.',
        citation: reference,
      });
    }
    expect(quotationAuthor('I. Taylor (The Alphabet).', 'Abate').cited).toBe('I. Taylor.');
  });

  test('separates authors who share a printed form', () => {
    expect(quotationAuthor('Gray.', 'Adnate').name).toBe('Asa Gray');
    expect(quotationAuthor('Gray.', 'Annals').name).toBe('Thomas Gray');
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
    expect(entryQuotations(entry).map(({ name }) => name)).toEqual([
      'William Shakespeare',
      'Francis Bacon',
      'John Dryden',
    ]);
  });

  test('records the sense or compound that owns each quotation', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2><span class="pos">noun</span><span class="sn">1.</span><span class="sd">(a)</span><span class="def">First.</span>' +
        '<span class="q">One quote. <span class="qau">Shak.</span></span>' +
        '<span class="cs"><span class="col"><b>Example case</b></span>, <span class="cd">A case.</span></span>' +
        '<span class="q">Another quote. <span class="qau">Bacon.</span></span>' +
        '<h2 class="hw">Example</h2><span class="pos">transitive verb</span><span class="def">To show.</span>' +
        '<span class="q">A third quote. <span class="qau">Dryden.</span></span>'
    );
    expect(entryQuotations(entry).map(({ owner }) => owner)).toEqual([
      { id: '1-1-a', label: 'noun 1. (a)' },
      { id: 'example_case', label: 'Example case' },
      { id: '2', label: 'transitive verb' },
    ]);
  });
});
