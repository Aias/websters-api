import { describe, expect, test } from 'bun:test';
import { normalizeLookup } from '../app/lib/lookup';
import { readDictionarySource } from './dictionary-source';
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

  test('resolves printed diaeresis forms with and without the diaeresis', () => {
    const aliases = unambiguousAliases(
      new Map([
        [
          'Cooperate',
          entryAliases(
            'Cooperate',
            '<h2 class="hw">Co-o&#x308;p&#x2032;er-ate</h2><div class="conjf">Co-o&#x308;p&#x2032;er-a&#x2CA;ted</div>'
          ).names,
        ],
      ])
    );
    expect(aliases.get('coöperated')).toBe('Cooperate');
    expect(aliases.get('cooperated')).toBe('Cooperate');
  });

  test('gives an ambiguous spelling to the entry whose key it spells', () => {
    const aliases = unambiguousAliases(
      new Map([
        ['Leukaemia', ['Leukæmia']],
        ['Leuchaemia', ['Leuchæmia', 'leukæmia']],
        ['Orthoepical', ['Orthoëpic']],
      ])
    );
    expect(aliases.get('leukæmia')).toBe('Leukaemia');
    expect(aliases.get('orthœpic')).toBe('Orthoepical');
    expect(aliases.get('orthoepic')).toBe('Orthoepical');
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
    const { names: aliases } = entryAliases(
      'Aaronical',
      '<div class="mhw"><h2 class="hw">Aa-ron′ic</h2><h2 class="hw">Aa-ron′ic-al</h2></div>' +
        '<div class="altsp"><span class="asp">Aaronic</span></div>' +
        '<div class="cs"><span class="col">Aaron’s rod</span></div>'
    );
    expect(aliases).toContain('Aaronic');
    expect(aliases).toContain('Aaronical');
    expect(aliases).toContain('Aaron’s rod');
  });

  test('removes every stress mark from headwords', () => {
    expect(entryAliases('Falcon-gentle', '<h2 class="hw">fal′con-gen‵til</h2>').names).toEqual([
      'Falcon-gentle',
      'falcon-gentil',
      'falcongentil',
    ]);
  });

  test('preserves affix hyphens', () => {
    expect(entryAliases('Ad-', '<h2 class="hw">Ad-</h2>').names).toEqual(['Ad-']);
    expect(entryAliases('-ward', '<h2 class="hw">-ward</h2>').names).toEqual(['-ward']);
    expect(
      entryAliases('Argentamine', '<h2 class="hw">Argentamine</h2><h2 class="hw">-min</h2>').names
    ).toEqual(['Argentamine']);
    expect(
      entryAliases(
        'Archy',
        '<h2 class="hw">Arch′y</h2><div class="def">Arched.</div><br/><h2 class="hw">-ar′chy</h2><div class="def">A suffix.</div>'
      ).names
    ).toEqual(['Archy', '-archy']);
  });

  test('resolves infinitive references only for verb entries', () => {
    expect(entryAliases('Abase', '<div class="pos">transitive verb</div>').names).toContain(
      'To Abase'
    );
    expect(entryAliases('Abacus', '<div class="pos">noun</div>').names).not.toContain('To Abacus');
  });

  test('indexes explicit inflections and derived forms', () => {
    expect(
      entryAliases(
        'Index',
        '<div class="plw">Indices</div><div class="conjf">Indexed</div><div class="wf">Indexer</div>'
      ).names
    ).toEqual(['Index', 'Indices', 'Indexed', 'Indexer']);
  });

  test('indexes linked plural forms without displacing canonical entries', () => {
    const agama = readDictionarySource().get('Agama');
    if (!agama) throw new Error('Missing Agama source');
    expect(entryAliases('Agama', agama).names).toContain('Agamas');
    const aliases = unambiguousAliases(
      new Map([
        ['Agama', entryAliases('Agama', agama).names],
        [
          'Stamen',
          entryAliases('Stamen', '<div class="plu"><div class="er">Stamina</div></div>').names,
        ],
        ['Stamina', ['Stamina']],
      ])
    );
    expect(aliases.get('agamas')).toBe('Agama');
    expect(aliases.get('stamina')).toBe('Stamina');
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

  test('indexes explicit complete compound names rather than their shared fragments', () => {
    expect(
      entryAliases(
        'Range',
        '<div class="col" data-headword="At close range">At close</div> (or <div class="col" data-headword="At long range">long</div>) <div class="col" data-headword="">range</div>'
      ).names
    ).toEqual(['Range', 'At close range', 'At long range']);
    expect(entryAliases('Range', '<h2 class="hw" data-headword="Wrong">Range</h2>').names).toEqual([
      'Range',
    ]);
  });

  test('retains a spaced spelling claimed by its hyphenated canonical entry', () => {
    const result = unambiguousAliases(
      new Map([
        ['Arrow-head', ['Arrow-head', 'Arrow head']],
        ['Arrow', ['Arrow', 'Arrow head']],
      ])
    );
    expect(result.get('arrow head')).toBe('Arrow-head');
    expect(result.get('arrow-head')).toBe('Arrow-head');
  });

  test('retains a spaced spelling claimed by its closed canonical entry', () => {
    const result = unambiguousAliases(
      new Map([
        ['Arrowhead', ['Arrowhead', 'Arrow head']],
        ['Arrow', ['Arrow', 'Arrow head']],
      ])
    );
    expect(result.get('arrow head')).toBe('Arrowhead');
  });

  test('leaves competing closed and hyphenated canonical spellings unresolved', () => {
    const result = unambiguousAliases(
      new Map([
        ['Arrowhead', ['Arrowhead', 'Arrow head']],
        ['Arrow-head', ['Arrow-head', 'Arrow head']],
      ])
    );
    expect(result.has('arrow head')).toBe(false);
  });

  test('preserves an exact spaced canonical entry over a hyphenated variant', () => {
    const result = unambiguousAliases(
      new Map([
        ['Arrow-head', ['Arrow-head', 'Arrow head']],
        ['Arrow head', ['Arrow head']],
        ['Arrow', ['Arrow', 'Arrow head']],
      ])
    );
    expect(result.get('arrow head')).toBe('Arrow head');
  });

  test('requires the hyphenated entry to claim its spaced spelling', () => {
    const result = unambiguousAliases(
      new Map([
        ['Arrow-head', ['Arrow-head']],
        ['Arrow', ['Arrow', 'Arrow head']],
        ['Head', ['Head', 'Arrow head']],
      ])
    );
    expect(result.has('arrow head')).toBe(false);
  });

  test('leaves competing hyphenated canonical spellings unresolved', () => {
    const result = unambiguousAliases(
      new Map([
        ['Alpha-beta gamma', ['Alpha-beta gamma', 'Alpha beta gamma']],
        ['Alpha beta-gamma', ['Alpha beta-gamma', 'Alpha beta gamma']],
      ])
    );
    expect(result.has('alpha beta gamma')).toBe(false);
  });

  test('gives a compound defined only by See under to an entry that defines it', () => {
    const sore = entryAliases(
      'Sore',
      '<div class="cs"><div class="col"><b>Cold sore</b></div>. <div class="cd">See under <div class="er">Cold</div>, <div class="pos">noun</div></div></div>' +
        '<div class="cs"><div class="col"><b>Sore throat</b></div>, <div class="cd">See under <div class="er">Throat</div>.</div></div>'
    );
    expect(sore.deferred).toEqual(['Cold sore', 'Sore throat']);
    const cold = entryAliases(
      'Cold',
      '<div class="cs"><div class="col"><b>Cold sore </b></div>, <div class="cd">a vesicular eruption.</div></div>'
    );
    const aliases = unambiguousAliases(
      new Map([
        ['Sore', sore.names],
        ['Cold', cold.names],
        ['Sorehead', ['Sorehead', 'Sore throat']],
        ['Soreness', ['Soreness', 'Sore throat']],
      ]),
      new Map([
        ['Sore', sore.deferred],
        ['Sorrow', ['Cold sore', 'Sorrow sore']],
      ])
    );
    expect(aliases.get('cold sore')).toBe('Cold');
    expect(aliases.has('sore throat')).toBe(false);
    expect(aliases.get('sorrow sore')).toBe('Sorrow');
  });

  test('defers every heading in a group that See under defines', () => {
    expect(
      entryAliases(
        'Star',
        '<div class="cs"><div class="mcol"><div class="col"><b>Double star</b></div>, <div class="col"><b>Shooting star</b></div>, etc. </div><div class="cd">See under <div class="er">Double</div>, etc.</div></div>'
      ).deferred
    ).toEqual(['Double star', 'Shooting star']);
    expect(
      entryAliases(
        'Fly',
        '<div class="cs"><div class="mcol"><div class="col"><b>Cheese fly</b></div>. <div class="cd">See under <div class="er">Cheese</div>.</div></div>' +
          '<div class="col"><b>Fly agaric</b></div>, <div class="cd">a fungus.</div></div>'
      )
    ).toMatchObject({ names: ['Fly', 'Fly agaric'], deferred: ['Cheese fly'] });
  });

  test('settles a contested name by definition, then by headword', () => {
    const entries = new Map(
      [
        [
          'Buttress',
          '<div class="col"><b>Flying buttress</b></div>. <div class="cd">See <div class="er">Flying buttress</div>.</div>',
        ],
        [
          'Flying',
          '<div class="col"><b>Flying buttress</b></div>, <div class="cd">a contrivance.</div>',
        ],
        [
          'Muscadelle',
          '<h2 class="hw">Mus′ca-del</h2><div class="def">See <div class="er">Muscatel</div>.</div>',
        ],
        ['Muscatel', '<h2 class="hw">Mus′ca-tel</h2><div class="asp">muscadel</div>'],
        ['Be', '<div class="pos">verb</div>'],
        [
          'All fours',
          '<div class="mcol"><div class="col"><b>To be</b></div>, <div class="col"><b>go</b></div></div>, <div class="cd">to correspond.</div>',
        ],
        ['Metabole', '<h2 class="hw">Me-tab′o-la</h2>'],
        ['Metabolia', '<h2 class="hw">Me-tab′o-la</h2>'],
      ].map(([key, html]) => [key, entryAliases(key, html)])
    );
    const claims = (field: 'names' | 'headwords' | 'defined') =>
      new Map([...entries].map(([key, aliases]) => [key, aliases[field]]));
    const aliases = unambiguousAliases(claims('names'), new Map(), [
      claims('headwords'),
      claims('defined'),
    ]);
    expect(aliases.get('flying buttress')).toBe('Flying');
    expect(aliases.get('muscadel')).toBe('Muscadelle');
    expect(aliases.get('to be')).toBe('Be');
    expect(aliases.has('metabola')).toBe(false);
  });

  test('keeps an existing resolution when a preferred claim disagrees', () => {
    const aliases = unambiguousAliases(
      new Map([
        ['Leukaemia', ['Leukæmia']],
        ['Leuchaemia', ['Leuchæmia', 'leukæmia']],
      ]),
      new Map(),
      [new Map([['Leuchaemia', ['leukæmia']]])]
    );
    expect(aliases.get('leukæmia')).toBe('Leukaemia');
  });
});
