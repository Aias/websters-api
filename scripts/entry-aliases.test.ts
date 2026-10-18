import { describe, expect, test } from 'bun:test';
import { normalizeLookup } from '../app/lib/lookup';
import { entryAliases, unambiguousAliases } from './entry-aliases';

describe('dictionary reference lookup', () => {
  test('normalizes typographic apostrophes and source sense annotations', () => {
    expect(normalizeLookup('Whitecap{2}')).toBe('whitecap');
    expect(normalizeLookup(' Whitecap{2} ')).toBe('whitecap');
    expect(normalizeLookup('An’t')).toBe("an't");
    expect(normalizeLookup('A\u0308')).toBe('ä');
  });

  test('resolves ligature spellings without changing canonical entry names or accents', () => {
    expect(normalizeLookup('Æther')).toBe('æther');
    expect(normalizeLookup('Œdema')).toBe('œdema');
    expect(normalizeLookup('Piña')).toBe('piña');
    const aliases = unambiguousAliases(new Map([['Cæsarian', ['Cæsarian']]]));
    expect(aliases.get('caesarian')).toBe('Cæsarian');
  });

  test('preserves exact ligature aliases and refuses ambiguous equivalent spellings', () => {
    const aliases = unambiguousAliases(
      new Map([
        ['Harp', ['Aeolian harp']],
        ['AEolian', ['Æolian harp']],
        ['Haemo-', ['Haema-']],
        ['First', ['Caenozoic', 'Shared']],
        ['Second', ['Cænozoic', 'Shared']],
        ['Third', ['Shæred']],
        ['Fourth', ['Cænozoeic']],
        ['Fifth', ['Caenozœic']],
      ])
    );
    expect(aliases.get('aeolian harp')).toBe('Harp');
    expect(aliases.get('æolian harp')).toBe('AEolian');
    expect(aliases.get('hæma-')).toBe('Haemo-');
    expect(aliases.get('caenozoic')).toBe('First');
    expect(aliases.get('cænozoic')).toBe('Second');
    expect(aliases.has('shared')).toBe(false);
    expect(aliases.get('shaered')).toBe('Third');
    expect(aliases.has('caenozoeic')).toBe(false);
    expect(aliases.has('cænozœic')).toBe(false);
  });

  test('indexes spelled headwords, alternate spellings, and compound headings', () => {
    const aliases = entryAliases(
      'Aaronical',
      '<div class="mhw"><h2 class="hw">Aa-ron′ic</h2><h2 class="hw">Aa-ron′ic-al</h2></div>' +
        '<div class="altsp"><span class="asp">Aaronic</span></div>' +
        '<div class="cs"><span class="col">Aaron’s rod</span></div>'
    );
    expect(aliases).toContain('Aaronic');
    expect(aliases).toContain('Aaronical');
    expect(aliases).toContain('Aaron’s rod');
  });

  test('preserves affix hyphens', () => {
    expect(entryAliases('Ad-', '<h2 class="hw">Ad-</h2>')).toEqual(['Ad-']);
    expect(entryAliases('-ward', '<h2 class="hw">-ward</h2>')).toEqual(['-ward']);
    expect(
      entryAliases('Argentamine', '<h2 class="hw">Argentamine</h2><h2 class="hw">-min</h2>')
    ).toEqual(['Argentamine']);
  });

  test('resolves infinitive references only for verb entries', () => {
    expect(entryAliases('Abase', '<div class="pos">transitive verb</div>')).toContain('To Abase');
    expect(entryAliases('Abacus', '<div class="pos">noun</div>')).not.toContain('To Abacus');
  });

  test('indexes explicit inflections and derived forms', () => {
    expect(
      entryAliases(
        'Index',
        '<div class="plw">Indices</div><div class="conjf">Indexed</div><div class="wf">Indexer</div>'
      )
    ).toEqual(['Index', 'Indices', 'Indexed', 'Indexer']);
  });

  test('exact entries win and ambiguous alternate destinations stay unresolved', () => {
    const result = unambiguousAliases(
      new Map([
        ['Alpha', ['Alpha', 'Beta', 'Shared']],
        ['Beta', ['Beta', 'Shared', 'Gamma']],
      ])
    );
    expect(result.get('beta')).toBe('Beta');
    expect(result.get('gamma')).toBe('Beta');
    expect(result.has('shared')).toBe(false);
  });
});
