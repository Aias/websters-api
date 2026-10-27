import { describe, expect, test } from 'bun:test';
import { parseEntry, preprocess } from './build-db';
import { createEntryReferences, decodeEntryKey, entryReferenceSlug } from './entry-references';

const source = new Map([
  ['Reave', '<h2 class="hw">Reave</h2>'],
  ['Bigamy', '<h2 class="hw">Bigamy</h2>'],
  ['Do.', '<h2 class="hw">Do.</h2>'],
  ['Do', '<h2 class="hw">Do</h2>'],
  ['Mister', '<h2 class="hw">Mister</h2><div class="asp">Messrs.</div>'],
  [
    'One',
    '<h2 class="hw">One</h2><div class="asp">Shared</div><div class="asp">Clear</div><div class="asp">Dot.</div><div class="asp">A-B</div><div class="asp">AB</div>',
  ],
  ['Two', '<h2 class="hw">Two</h2><div class="asp">Shared</div>'],
  ['Do&#x74;.', '<h2 class="hw">Dot.</h2>'],
  ['Cafe&#769;', '<h2 class="hw">Café</h2>'],
  ['A?B', '<h2 class="hw">A?B</h2>'],
  ['Diaeresis', '<h2 class="hw">Diaeresis</h2><div class="asp">Face</div>'],
]);
const references = createEntryReferences(source, parseEntry);

describe('reference href punctuation', () => {
  test('changes only the href and keeps visible terminal punctuation', () => {
    expect(preprocess('<div class="er">Reave.</div>', references.resolve)).toBe(
      '<a class="er" href="/entry/reave">Reave.</a>'
    );
    expect(entryReferenceSlug('Bigamy. ', references.resolve)).toBe('bigamy');
    expect(
      JSON.stringify(
        parseEntry(
          'Example',
          '<h2 class="hw">Example</h2><div class="def">See <div class="er">Reave.</div></div>',
          references.resolve
        )
      )
    ).toContain('href=\\"/entry/reave\\">Reave.');
  });
  test('preserves genuine dotted canonical names and aliases', () => {
    expect(entryReferenceSlug('Do.', references.resolve)).toBe('do.');
    expect(entryReferenceSlug('Messrs.', references.resolve)).toBe('messrs.');
    expect(references.resolve('dot.')).toBe('Dot.');
  });
  test('respects ambiguity and preserves unresolved references', () => {
    expect(entryReferenceSlug('Shared.', references.resolve)).toBe('shared.');
    expect(entryReferenceSlug('Absent.', references.resolve)).toBe('absent.');
    expect(entryReferenceSlug('Clear.', references.resolve)).toBe('clear');
  });
  test('retains source sense handling and does not rewrite undotted links', () => {
    expect(entryReferenceSlug('Reave, 2.', references.resolve)).toBe('reave');
    expect(entryReferenceSlug('Reave{2}', references.resolve)).toBe('reave');
    expect(entryReferenceSlug('Reave', references.resolve)).toBe('reave');
    expect(entryReferenceSlug('Reave.')).toBe('reave.');
  });
  test('uses decoded NFC keys and runtime canonical slug precedence', () => {
    expect(decodeEntryKey('Cafe&#769;')).toBe('Café');
    expect(references.resolve('café')).toBe('Café');
    expect(entryReferenceSlug('Café.', references.resolve)).toBe('café');
    expect(references.aliases.get('ab')).toBe('One');
    expect(references.resolve('ab')).toBe('A?B');
  });
  test('matches runtime diaeresis fallback even when that exact alias is absent', () => {
    expect(references.aliases.has('fäce'.normalize('NFC'))).toBe(false);
    expect(references.resolve('fäce'.normalize('NFC'))).toBe('Diaeresis');
    expect(entryReferenceSlug('Fäce.', references.resolve)).toBe('fäce');
  });
});

const qualifiedSource = new Map([
  ['Magic', '<h2 class="hw">Magic</h2><div class="pos">noun</div><div class="def">A noun.</div>'],
  [
    'Magical',
    '<div class="mhw"><h2 class="hw">Magic</h2>, <h2 class="hw">Magical</h2></div><div class="pos">adjective</div><div class="def">An adjective.</div>',
  ],
  ['Bib', '<h2 class="hw">Bib</h2><div class="pos">noun</div><div class="def">A noun.</div>'],
  [
    'Bibbe',
    '<h2 class="hw">Bib</h2><div class="pos">intransitive verb</div><div class="def">One verb.</div><h2 class="hw">Bib</h2><div class="pos">transitive verb</div><div class="def">Another verb.</div>',
  ],
  [
    'Common',
    '<h2 class="hw">Common</h2><div class="pos">adjective</div><div class="def">An adjective.</div><h2 class="hw">Common</h2><div class="pos">noun</div><div class="def">A noun.</div>',
  ],
  [
    'First',
    '<h2 class="hw">Shared</h2><div class="pos">adjective</div><div class="def">One.</div>',
  ],
  [
    'Second',
    '<h2 class="hw">Shared</h2><div class="pos">adjective</div><div class="def">Two.</div>',
  ],
  ['Shared', '<h2 class="hw">Shared</h2><div class="pos">noun</div><div class="def">Three.</div>'],
  ['Same', '<h2 class="hw">Same</h2><div class="pos">adjective</div><div class="def">One.</div>'],
  [
    'Same Alternative',
    '<h2 class="hw">Same</h2><div class="pos">adjective</div><div class="def">Two.</div>',
  ],
  ['Meter', '<h2 class="hw">Meter</h2><div class="pos">noun</div><div class="def">One.</div>'],
  [
    'Metric',
    '<h2 class="hw">Meter</h2><div class="pos">noun</div><h2 class="hw">Metric</h2><div class="pos">adjective</div><div class="def">Two.</div>',
  ],
  ['Dual', '<h2 class="hw">Dual</h2><div class="pos">noun</div><div class="def">One.</div>'],
  [
    'Dual Form',
    '<h2 class="hw">Dual</h2><div class="pos">feminine</div><div class="pos">adjective</div><div class="def">Two.</div>',
  ],
  ['St.', '<h2 class="hw">St.</h2><div class="pos">noun</div><div class="def">One.</div>'],
  ['St', '<h2 class="hw">St</h2><div class="pos">noun</div><div class="def">Two.</div>'],
  [
    'Body',
    '<h2 class="hw">Body</h2><div class="pos">noun</div><div class="def">A <div class="pos">verb</div>.</div>',
  ],
]);
const qualifiedReferences = createEntryReferences(qualifiedSource, parseEntry);

describe('explicit grammatical reference targets', () => {
  test('uses the joint adjective heading while preserving unqualified and noun Magic', () => {
    expect(
      preprocess(
        'See <div class="er">Magic</div>, <div class="pos">adjective</div>.',
        qualifiedReferences.resolve
      )
    ).toBe(
      'See <a class="er" href="/entry/magical">Magic</a>, <span class="pos">adjective</span>.'
    );
    expect(entryReferenceSlug('Magic', qualifiedReferences.resolve)).toBe('magic');
    expect(entryReferenceSlug('Magic', qualifiedReferences.resolve, 'noun')).toBe('magic');
    expect(entryReferenceSlug('Magic. ', qualifiedReferences.resolve, 'adjective')).toBe('magical');
    expect(entryReferenceSlug('St.', qualifiedReferences.resolve, 'noun')).toBe('st.');
    expect(
      preprocess(
        '<div class="er">Magic. </div>, <div class="pos">adjective</div>',
        qualifiedReferences.resolve
      )
    ).toContain('href="/entry/magical"');
    expect(
      preprocess(
        '<div class="er">St.</div>, <div class="pos">noun</div>',
        qualifiedReferences.resolve
      )
    ).toContain('href="/entry/st."');
    expect(qualifiedReferences.resolve('magic')).toBe('Magic');
  });

  test('finds a non-first homograph with an exact part of speech', () => {
    expect(entryReferenceSlug('Bib', qualifiedReferences.resolve, 'transitive verb')).toBe('bibbe');
    expect(entryReferenceSlug('Bib', qualifiedReferences.resolve, 'intransitive verb')).toBe(
      'bibbe'
    );
    expect(entryReferenceSlug('Bib', qualifiedReferences.resolve)).toBe('bib');
  });

  test('keeps multiple matching owners and body labels from changing targets', () => {
    expect(entryReferenceSlug('Shared', qualifiedReferences.resolve, 'adjective')).toBe('shared');
    expect(entryReferenceSlug('Same', qualifiedReferences.resolve, 'adjective')).toBe('same');
    expect(entryReferenceSlug('Body', qualifiedReferences.resolve, 'verb')).toBe('body');
    expect(entryReferenceSlug('Missing', qualifiedReferences.resolve, 'adjective')).toBe('missing');
  });

  test('does not assign an interleaved headword another headword’s label', () => {
    expect(entryReferenceSlug('Meter', qualifiedReferences.resolve, 'adjective')).toBe('meter');
    expect(entryReferenceSlug('Meter', qualifiedReferences.resolve, 'noun')).toBe('meter');
    expect(entryReferenceSlug('Metric', qualifiedReferences.resolve, 'adjective')).toBe('metric');
    expect(entryReferenceSlug('Dual', qualifiedReferences.resolve, 'feminine')).toBe('dual_form');
    expect(entryReferenceSlug('Dual', qualifiedReferences.resolve, 'adjective')).toBe('dual_form');
  });

  test('requires an adjacent label and keeps printed punctuation', () => {
    expect(
      preprocess(
        '<div class="er">Magic</div>, prose <div class="pos">adjective</div>',
        qualifiedReferences.resolve
      )
    ).toContain('href="/entry/magic"');
    expect(
      preprocess(
        '<div class="er">Magic</div>. <div class="pos">adjective</div>',
        qualifiedReferences.resolve
      )
    ).toContain('href="/entry/magic"');
    expect(
      preprocess(
        '<div class="er">Magic</div>, <div class="pos">adjective</div>',
        qualifiedReferences.resolve
      )
    ).toContain('href="/entry/magical"');
  });

  test('uses a nested terminal label without changing its visible text', () => {
    expect(
      preprocess(
        '<div class="er">Common, <div class="pos">noun</div></div>',
        qualifiedReferences.resolve
      )
    ).toBe('<a class="er" href="/entry/common#2">Common, <span class="pos">noun</span></a>');
    expect(
      preprocess(
        '<div class="er">Magic, <div class="pos">adjective</div> </div>',
        qualifiedReferences.resolve
      )
    ).toBe('<a class="er" href="/entry/magical">Magic, <span class="pos">adjective</span></a> ');
    expect(
      preprocess(
        '<div class="er">Magic, <div class="pos"> adjective </div></div>',
        qualifiedReferences.resolve
      )
    ).toBe('<a class="er" href="/entry/magical">Magic,  <span class="pos">adjective</span></a> ');
  });
});

const targetSource = new Map([
  [
    'Abatement',
    '<h2 class="hw">Abatement</h2><div class="pos">noun</div><div class="sn">1.</div><div class="def">One.</div><div class="sn">2.</div><div class="sd">(a)</div><div class="def">Two a.</div><div class="sd">(b)</div><div class="def">Two b.</div>',
  ],
  [
    'Advance',
    '<h2 class="hw">Advance</h2><div class="pos">transitive verb</div><div class="sn">1.</div><div class="def">Verb one.</div><div class="sn">5.</div><div class="def">Verb five.</div><h2 class="hw">Advance</h2><div class="pos">noun</div><div class="sn">5.</div><div class="def">Noun five.</div>',
  ],
  [
    'Ablative',
    '<h2 class="hw">Ablative</h2><div class="pos">adjective</div><div class="def">Taking away.</div><div class="cs"><div class="col"><b>Ablative absolute</b></div>, <div class="cd">a construction.</div></div>',
  ],
  [
    'Beam',
    '<h2 class="hw">Beam</h2><div class="pos">noun</div><div class="def">A timber.</div><div class="cs"><div class="col"><b>Abaft the beam</b></div>. <div class="cd">Behind.</div></div>',
  ],
]);
const targetReferences = createEntryReferences(targetSource, parseEntry);

describe('sense and compound reference targets', () => {
  test.each([
    ['See <div class="er">Abatement</div>, 2.', '/entry/abatement#2'],
    ['See <div class="er">Abatement</div>, 2 (b).', '/entry/abatement#2-b'],
    ['See <div class="er">Abatement, 2.</div>', '/entry/abatement#2'],
    ['See <div class="er">Abatement</div>, 9.', '/entry/abatement'],
    ['See <div class="er">Abatement</div> 2.', '/entry/abatement'],
    ['See <div class="er">Advance</div>, 5.', '/entry/advance#1-5'],
    ['See <div class="er">Advance</div>, <div class="pos">noun</div>, 5.', '/entry/advance#2-5'],
    ['See <div class="er">Advance</div>, <div class="pos">noun</div>.', '/entry/advance#2'],
    [
      'See <div class="cref">Ablative absolute</div>, under <div class="er">Ablative</div>.',
      '/entry/ablative#ablative_absolute',
    ],
    [
      '<div class="cs"><div class="col"><b>Abaft the beam</b></div>. <div class="cd">See under <div class="er">Beam</div>.</div></div>',
      '/entry/beam#abaft_the_beam',
    ],
    [
      '<div class="cs"><div class="col"><b>Abaft the beam</b></div>. <div class="cd">See the Note under <div class="er">Beam</div>.</div></div>',
      '/entry/beam',
    ],
    ['See <div class="er">Abaft the beam</div>.', '/entry/abaft_the_beam#abaft_the_beam'],
    ['See <div class="er">Beam</div>.', '/entry/beam'],
  ])('%s links to %s', (html, href) => {
    expect(preprocess(html, targetReferences.resolve)).toContain(`href="${href}"`);
  });

  test('prefers a recorded target that exists in the destination', () => {
    expect(
      preprocess(
        'See <div class="er" data-target="2-a">Abatement</div>, 2.',
        targetReferences.resolve
      )
    ).toBe('See <a class="er" href="/entry/abatement#2-a">Abatement</a>, 2.');
    expect(
      preprocess(
        'See <div class="er" data-target="7">Abatement</div>, 2.',
        targetReferences.resolve
      )
    ).toContain('href="/entry/abatement#2"');
  });
});
