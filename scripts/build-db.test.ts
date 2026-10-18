import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import type { LexicalBlock } from '../app/lib/types.ts';
import { parseEntry, preprocess } from './build-db.ts';

const source: unknown = JSON.parse(
  readFileSync(new URL('../src/dict.json', import.meta.url), 'utf8')
);

function sourceHtml(key: string): string {
  if (!source || typeof source !== 'object') throw new Error('Invalid dictionary');
  const html = Reflect.get(source, key);
  if (typeof html !== 'string') throw new Error(`Missing entry: ${key}`);
  return html;
}

function plain(html: string): string {
  return cheerio.load(html, { xml: { xmlMode: false, recognizeSelfClosing: true } }, false).text();
}

function text(content: ReadonlyArray<LexicalBlock>): string {
  return content
    .map((block) => {
      switch (block.kind) {
        case 'sense':
          return block.number + text(block.content);
        case 'compound':
          return plain(block.headwordHtml) + text(block.content);
        case 'section':
          return text(block.content);
        case 'quotation':
          return plain(block.html) + block.authors.join('');
        default:
          return plain(block.html);
      }
    })
    .join('');
}

function normalized(value: string): string {
  return value.normalize('NFC').replace(/[^\p{L}\p{N}]/gu, '');
}

function content(html: string): ReadonlyArray<LexicalBlock> {
  return parseEntry('Example', `<h2 class="hw">Example</h2>${html}`).homographs[0].content;
}

describe('preprocess', () => {
  test('normalizes presentation and references while removing executable content', () => {
    const result = preprocess(
      '<h2 d:priority="2" class="hw">Test</h2><div class="def" onclick="alert(1)" style="color:red"><b>bold</b> and <i>italic</i></div><script>alert(1)</script><div class="er" href="javascript:alert(1)">Test Ref</div>'
    );
    expect(result).not.toMatch(/d:priority|onclick|style=|<script|javascript:/);
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
    expect(result).toContain('href="/entry/test_ref"');
  });

  test('retains unresolved source characters and typographic quotation marks', () => {
    expect(plain(preprocess('“word” ‘word’ &#xFFFD;'))).toBe('“word” ‘word’ �');
  });

  test('respects self-closing source wrappers', () => {
    const result = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2><div class="cs"/><h2 class="hw">Example</h2><div class="def">Second meaning.</div>'
    );
    expect(result.homographs).toHaveLength(2);
    expect(text(result.homographs[1].content)).toBe('Second meaning.');
  });
});

describe('ordered lexical content', () => {
  test.each([
    'A',
    'A-',
    'Abacus',
    'Aback',
    'Abandon',
    'Abler',
    'Abluent',
    'Accentuation',
    'Admittedly',
    'Apotheosis',
    'Bookful',
    'Canadian',
    'Capsulated',
    'Concessionary',
    'Dispose',
    'Pay',
    'Rough',
    'Vegetable',
    'Mezzanine',
    'For',
    'Dreadly',
    'Elves',
    'Extempore',
    'Fiddle',
    'Fumatory',
    'Fusel oil',
    'Gaekwar',
    'Gagtooth',
    'Gan',
    'Gassy',
    'Glister',
    'Good',
    'Gyve',
    'Habit',
    'Hang',
    'He',
    'Fad',
    'Poseuse',
    'Inadvertency',
    'Cottonseed',
    'Pulmobranchiate',
    'Ammoniac',
    'I',
    'I.O.U',
    'Index',
    'Jibb',
    'Kingdom',
    'Meninges',
    'Mun',
    'Tody',
    'Zastrugi',
  ])('preserves source text and order for %s', (key) => {
    const html = sourceHtml(key);
    const entry = parseEntry(key, html);
    const actual = entry.homographs
      .map(
        (homograph) =>
          homograph.header.map((part) => ('html' in part ? plain(part.html) : part.text)).join('') +
          text(homograph.content)
      )
      .join('');
    expect(normalized(actual)).toBe(normalized(plain(preprocess(html))));
  });

  test('keeps repeated definitions, notes, etymologies, synonyms and usage blocks', () => {
    const blocks = content(
      '<div class="ety">First origin.</div><div class="ety">Second origin.</div><div class="def">First meaning.</div><div class="def">Second meaning.</div><div class="note">First note.</div><div class="note">Second note.</div><div class="syn">First synonyms.</div><div class="syn">Second synonyms.</div><div class="usage">First usage.</div><div class="usage">Second usage.</div>'
    );
    expect(blocks.map((block) => block.kind)).toEqual([
      'etymology',
      'etymology',
      'definition',
      'note',
      'note',
      'synonyms',
      'synonyms',
      'usage',
      'usage',
    ]);
    expect(text(blocks)).toBe(
      'First origin.Second origin.First meaning. Second meaning.First note.Second note.First synonyms.Second synonyms.First usage.Second usage.'
    );
  });

  test('keeps a leading language qualifier with its inflection block', () => {
    const blocks = content(
      '; E. <div class="plu"><i>pl.</i> <div class="plw">Examples</div>; L. pl. <div class="plw">Exempla</div>.</div><div class="def">Meaning.</div>'
    );
    expect(blocks[0]).toEqual(
      expect.objectContaining({ kind: 'forms', html: expect.stringContaining('E. ') })
    );
    expect(text(blocks)).toBe('E. pl. Examples; L. pl. Exempla.Meaning.');
  });

  test('preserves spaces around inline references without separating word fragments', () => {
    const blocks = content('<div class="def">See <div class="er">Guide</div>; <i>a</i>foot.</div>');
    expect(text(blocks)).toBe('See Guide; afoot.');
  });

  test('retains bare text and unknown elements before and after structured content', () => {
    const blocks = content(
      'Intro <i>text</i>.<div class="def">Meaning.</div>Same as <div class="er">Other</div>.'
    );
    expect(text(blocks)).toBe('Intro text.Meaning.Same as Other.');
  });

  test('keeps embedded headwords inline in definitions and alternate spellings', () => {
    const blocks = content(
      '<div class="def">Called <h2 class="hw">Example</h2>.</div><div class="altsp">Also <h2 class="hw">Variant</h2>.</div>'
    );
    expect(JSON.stringify(blocks)).not.toContain('<h2');
    expect(text(blocks)).toBe('Called Example.Also Variant.');
  });

  test('keeps inline authors at their original positions and quotation authors separate', () => {
    const blocks = content(
      '<div class="def">Meaning.</div>“First.” <div class="au">One.</div> “Second.” <div class="au">Two.</div><div class="q">Long quotation. <div class="qau">Three.</div></div><div class="rj"><div class="au">Four.</div><div class="qau">Five.</div></div>'
    );
    expect(text(blocks)).toContain('“First.” One. “Second.” Two.');
    expect(blocks.at(-1)).toEqual({
      kind: 'quotation',
      html: 'Long quotation.',
      authors: ['Three.', 'Four.', 'Five.'],
    });
  });
});

describe('headwords and sections', () => {
  test('keeps display keys separate from URL slugs', () => {
    const entry = parseEntry('A 1', '<h2 class="hw">A 1</h2><div class="def">A registry mark.</div>');
    expect(entry.key).toBe('A 1');
    expect(entry.slug).toBe('a_1');
  });

  test('groups adjacent aliases with each pronunciation and part of speech', () => {
    const entry = parseEntry(
      'Example',
      '<div class="mhw"><h2 class="hw">First</h2><div class="pr">(first)</div><div class="pos">noun</div>, or <h2 class="hw">Second</h2><div class="pr">(second)</div><div class="pos">adjective</div></div><div class="def">Meaning.</div>'
    );
    expect(entry.homographs).toHaveLength(1);
    expect(entry.homographs[0].alternateHeadwords).toEqual(['Second']);
    expect(
      entry.homographs[0].header.map((part) => ('html' in part ? plain(part.html) : part.text))
    ).toEqual(['First', '(first)', 'noun', ', or', 'Second', '(second)', 'adjective']);
  });

  test('splits repeated headwords after lexical content', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2><div class="pos">noun</div><div class="def">Noun meaning.</div><h2 class="hw">Example</h2><div class="pos">verb</div><div class="def">Verb meaning.</div>'
    );
    expect(entry.homographs.map((homograph) => homograph.partOfSpeech)).toEqual(['noun', 'verb']);
  });

  test('uses the lookup key for headwordless source records', () => {
    const entry = parseEntry(
      'Example',
      '<div class="pr">(test)</div><div class="pos">noun</div><div class="def">Meaning.</div>'
    );
    expect(entry.homographs[0].headword).toBe('Example');
    expect(entry.homographs[0].pronunciation).toBe('test');
    expect(entry.homographs[0].partOfSpeech).toBe('noun');
  });

  test('preserves secondary definitions, forms and outside quotation attribution', () => {
    const blocks = content(
      '<div class="def">Primary meaning.</div><div class="def2"><div class="pos">noun</div><div class="plu">pl. <div class="plw">Examples</div></div><div class="sn">1.</div><div class="def">Secondary meaning.</div><div class="q">Quotation.</div></div><div class="rj"><div class="au">Author.</div></div>'
    );
    const section = blocks[1];
    expect(section.kind).toBe('section');
    if (section.kind !== 'section') throw new Error('Missing secondary section');
    expect(section.content.map((block) => block.kind)).toEqual(['label', 'forms', 'sense']);
    const sense = section.content[2];
    if (sense.kind !== 'sense') throw new Error('Missing secondary sense');
    expect(sense.content.at(-1)).toEqual({
      kind: 'quotation',
      html: 'Quotation.',
      authors: ['Author.'],
    });
  });
});

describe('sense hierarchy and compounds', () => {
  test('retains Roman sections, numeric senses and lettered subsenses', () => {
    const blocks = content(
      '<div class="sd">I</div><div class="sn">1.</div><div class="fld">(Arch.)</div><div class="sd">(a)</div><div class="def">First submeaning.</div><div class="sd">(b)</div><div class="def">Second submeaning.</div><div class="sn">2.</div><div class="def">Second meaning.</div><div class="sd">II</div><div class="def">Second section.</div>'
    );
    expect(blocks.filter((block) => block.kind === 'sense').map((block) => block.number)).toEqual([
      'I',
      'II',
    ]);
    const first = blocks[0];
    if (first.kind !== 'sense') throw new Error('Missing Roman section');
    expect(
      first.content.filter((block) => block.kind === 'sense').map((block) => block.number)
    ).toEqual(['1.', '2.']);
    const sense = first.content[0];
    if (sense.kind !== 'sense') throw new Error('Missing numbered sense');
    expect(sense.content.map((block) => block.kind)).toEqual(['label', 'sense', 'sense']);
    expect(
      sense.content.filter((block) => block.kind === 'sense').map((block) => block.number)
    ).toEqual(['(a)', '(b)']);
  });

  test('collapses duplicate empty sense markers without dropping a label', () => {
    const blocks = content(
      '<div class="sn">1.</div><div class="fld">(Med.)</div><div class="sn">1.</div><div class="def">Meaning.</div>'
    );
    expect(blocks).toHaveLength(1);
    expect(text(blocks)).toBe('1.(Med.)Meaning.');
  });

  test.each([
    ['Box', 'Box turtle'],
    ['Cross', 'Cross bottony'],
    ['Give', 'To give on'],
    ['Pocket', 'deep pocket'],
    ['Soul', 'Soul scot'],
    ['Turn', 'To turn on'],
    ['Way', 'To go the way of all the earth'],
  ])('preserves whitespace before the compound alias connector in %s', (key, headword) => {
    const compound = parseEntry(key, sourceHtml(key))
      .homographs.flatMap((homograph) => homograph.content)
      .find(
        (block) =>
          block.kind === 'compound' && block.headwords.length > 1 && block.headwords[0] === headword
      );
    if (compound?.kind !== 'compound') throw new Error(`Missing compound: ${headword}`);
    expect(plain(compound.headwordHtml)).toContain(`${headword} or `);
  });

  test.each([
    ['Grass', 'Grass parrakeet', 'any of several'],
    ['Grass', 'Grass plover', 'the upland'],
    ['Tangle', 'Blue tangle', 'See Dangleberry'],
  ])('preserves words split across definition tags in %s: %s', (key, headword, phrase) => {
    const compound = parseEntry(key, sourceHtml(key))
      .homographs.flatMap((homograph) => homograph.content)
      .find((block) => block.kind === 'compound' && block.headwords[0] === headword);
    if (compound?.kind !== 'compound') throw new Error(`Missing compound: ${headword}`);
    expect(text(compound.content)).toContain(phrase);
  });

  test('keeps trailing quotations and lettered senses with their compound', () => {
    const blocks = content(
      '<div class="sn">1.</div><div class="def">Main meaning.</div><div class="cs"><div class="mcol"><div class="col">First phrase</div> or <div class="col">Other phrase</div></div><div class="sd">(a)</div><div class="cd">First meaning.</div></div><div class="q">Phrase quotation.</div><div class="sd">(b)</div><div class="cd">Second meaning.</div><div class="syn">Root synonyms.</div><div class="usage">Root usage.</div>'
    );
    expect(blocks.map((block) => block.kind)).toEqual(['sense', 'compound', 'synonyms', 'usage']);
    const compound = blocks[1];
    if (compound.kind !== 'compound') throw new Error('Missing compound');
    expect(compound.headwords).toEqual(['First phrase', 'Other phrase']);
    expect(compound.headwordHtml).toContain(' or ');
    expect(
      compound.content.filter((block) => block.kind === 'sense').map((block) => block.number)
    ).toEqual(['(a)', '(b)']);
    const first = compound.content[0];
    if (first.kind !== 'sense') throw new Error('Missing compound sense');
    expect(first.content.at(-1)?.kind).toBe('quotation');
  });

  test('keeps compound etymology and definitions after an early closing wrapper', () => {
    const blocks = content(
      '<div class="cs"><div class="col">First phrase</div><div class="sd">(a)</div><div class="cd">First meaning.</div></div><div class="sd">(b)</div><div class="def">Second meaning.</div><div class="col">Second phrase</div><div class="ety">Origin.</div><div class="cd">Other meaning.</div>'
    );
    expect(blocks.map((block) => block.kind)).toEqual(['compound', 'compound']);
    expect(
      blocks.filter((block) => block.kind === 'compound').map((block) => text(block.content))
    ).toEqual(['(a)First meaning.(b)Second meaning.', 'Origin.Other meaning.']);
  });

  test('does not turn empty definitions or explicit separators into compound aliases', () => {
    const blocks = content(
      '<div class="col">First phrase</div><div class="cd"/>. – <div class="col">Second phrase</div><div class="cd">Meaning.</div><div class="col">Third phrase</div> – <div class="col">Fourth phrase</div><div class="cd">Other meaning.</div>'
    );
    expect(
      blocks.filter((block) => block.kind === 'compound').map((block) => block.headwords)
    ).toEqual([['First phrase'], ['Second phrase'], ['Third phrase'], ['Fourth phrase']]);
  });

  test('keeps bare compound explanations and definitions outside a cs wrapper', () => {
    const blocks = content(
      '<div class="col">First phrase</div>, bare meaning.<div class="col">Second phrase</div><div class="cd">Second meaning.</div>'
    );
    expect(
      blocks.filter((block) => block.kind === 'compound').map((block) => text(block.content))
    ).toEqual([', bare meaning.', 'Second meaning.']);
  });
});

describe('lexical presentation fidelity', () => {
  test('closes punctuation gaps after inline words without changing decimal or table spacing', () => {
    expect(
      plain(
        preprocess(
          '<div class="def">Give up <i>entirely </i>; <i>fully</i> , or <i>finally </i>.</div>'
        )
      )
    ).toBe('Give up entirely; fully, or finally.');
    expect(plain(preprocess('<i>value</i> .1'))).toBe('value .1');
    expect(plain(preprocess('<div class="q">Before . . . after.</div>'))).toBe(
      'Before . . . after.'
    );
    expect(text(parseEntry('Abandon', sourceHtml('Abandon')).homographs[0].content)).toContain(
      'forsake entirely;'
    );
    expect(text(parseEntry('Abandoned', sourceHtml('Abandoned')).homographs[0].content)).toContain(
      'irreclaimably wicked;'
    );

    expect(plain(preprocess('<pre><span>value</span> ; column</pre>'))).toBe('value ; column');
  });

  test('keeps pronunciation emphasis without changing plain lookup metadata', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2><div class="pr">(-m<i>e</i>nt)</div><div class="def">Meaning.</div>'
    );
    expect(entry.homographs[0].pronunciation).toBe('-ment');
    expect(entry.homographs[0].header[1]).toEqual({
      kind: 'pronunciation',
      html: '(-m<em>e</em>nt)',
    });
  });

  test('omits placeholder-only pronunciation nodes while retaining real phonetics and other uncertainty', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2><div class="pr">(#)</div><div class="pos">noun</div><div class="plu">pl. <div class="plw">Examples</div><div class="pr">(?)</div></div><div class="def">Unknown (?) character #.</div><h2 class="hw">Example</h2><div class="pr">(real?)</div><div class="def">Other.</div>'
    );
    expect(entry.homographs[0].pronunciation).toBeNull();
    expect(text(entry.homographs[0].content)).toBe('pl. ExamplesUnknown (?) character #.');
    expect(entry.homographs[1].pronunciation).toBe('real?');
  });

  test('keeps foreign marks with their following headword, outside lookup metadata', () => {
    const entry = parseEntry(
      'Example',
      '‖<h2 class="hw">Example</h2><div class="def">First.</div> ‖<h2 class="hw">Other</h2><div class="def">Second.</div>'
    );
    expect(entry.homographs.map((homograph) => homograph.headword)).toEqual(['Example', 'Other']);
    expect(entry.homographs.map((homograph) => homograph.header[0])).toEqual([
      { kind: 'headword', text: '‖Example' },
      { kind: 'headword', text: '‖Other' },
    ]);
    expect(text(entry.homographs[0].content).trim()).toBe('First.');
  });

  test.each(['Abandon', 'Abandoned', 'Abase'])(
    'keeps concluding synonyms and usage outside the final sense in %s',
    (key) => {
      const blocks = parseEntry(key, sourceHtml(key)).homographs[0].content;
      expect(blocks.some((block) => block.kind === 'synonyms')).toBe(true);
      for (const block of blocks) {
        if (block.kind === 'sense')
          expect(
            block.content.some((child) => child.kind === 'synonyms' || child.kind === 'usage')
          ).toBe(false);
      }
    }
  );
});

test('preserves sense-local synonyms and standalone usage', () => {
  const acknowledgment = parseEntry('Acknowledgement', sourceHtml('Acknowledgement')).homographs[0];
  const third = acknowledgment.content.find(
    (block) => block.kind === 'sense' && block.number === '3.'
  );
  if (third?.kind !== 'sense') throw new Error('Missing third sense');
  expect(third.content.some((block) => block.kind === 'synonyms')).toBe(true);
  expect(acknowledgment.content.some((block) => block.kind === 'synonyms')).toBe(true);
  const artifact = parseEntry('Artifact', sourceHtml('Artifact')).homographs[0];
  for (const sense of artifact.content.filter((block) => block.kind === 'sense')) {
    expect(sense.content.some((block) => block.kind === 'synonyms')).toBe(true);
  }
  expect(artifact.content.some((block) => block.kind === 'synonyms')).toBe(false);
  const blocks = content(
    '<div class="sn">1.</div><div class="def">First.</div><div class="sn">2.</div><div class="usage">Usage for the second sense.</div><div class="def">Second.</div>'
  );
  expect(blocks.map((block) => block.kind)).toEqual(['sense', 'sense']);
  expect(preprocess('<div class="q"><i>word</i> . . . another.</div>')).toContain(
    '</em> . . . another.'
  );
});

test('allows only explicit synonym homograph scope metadata', () => {
  const html = preprocess(
    '<div class="syn" data-scope="homograph">Whole entry.</div><div class="syn" data-scope="other">Other.</div><div class="def" data-scope="homograph">Meaning.</div>'
  );
  expect(html.match(/data-scope/g)).toHaveLength(1);
  const blocks = content(
    '<div class="sn">1.</div><div class="def">First.</div><div class="sn">2.</div><div class="def">Second.</div><div class="syn" data-scope="homograph">Whole-entry comparison.</div>'
  );
  expect(blocks.at(-1)).toEqual({ kind: 'synonyms', html: 'Whole-entry comparison.' });
});
