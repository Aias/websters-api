import { describe, expect, test } from 'bun:test';
import * as cheerio from 'cheerio';
import type { LexicalBlock } from '../app/lib/types.ts';
import { parseEntry, preprocess } from './build-db.ts';
import { readDictionarySource } from './dictionary-source';

const source = readDictionarySource();

function sourceHtml(key: string): string {
  const html = source.get(key);
  if (html === undefined) throw new Error(`Missing entry: ${key}`);
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

  test.each(['#', '?', '�'])('omits an unwrapped unknown conjugation field: %s', (marker) => {
    const html = `<div class="vmorph"><div class="conjf">Given</div>(${marker});</div>`;
    expect(plain(preprocess(html))).toBe('Given;');
  });

  test.each([
    '<div class="vmorph"><div class="conjf">Given</div>(-n�);</div>',
    '<div class="vmorph"><div class="conjf">Given</div>(�; 73);</div>',
    '<div class="vmorph"><div class="conjf">Given</div>(�)word;</div>',
    '<div class="q"><div class="conjf">Given</div>(�);</div>',
    '<div class="conjf">Given</div>(�);',
  ])('retains uncertainty outside a complete conjugation placeholder: %s', (html) => {
    expect(plain(preprocess(html))).toContain('�');
  });

  test('omits source sense annotations from display text and reference slugs', () => {
    const result = preprocess('<div class="er">Whitecap{2}</div> tissue{1}');
    expect(result).toContain('href="/entry/whitecap"');
    expect(plain(result)).toBe('Whitecap tissue');
  });

  test('keeps Greek etymons distinct from entry references', () => {
    const $ = cheerio.load(
      preprocess(
        '<div class="ety">Gr. <div class="er">λόγος </div>word. See <div class="er">Logic</div>.</div><div class="def">See <div class="er">λόγος</div>.</div>'
      )
    );
    expect($('.ety .grk').text()).toBe('λόγος');
    expect($('.ety .grk').is('a')).toBe(false);
    expect($('.ety a').attr('href')).toBe('/entry/logic');
    expect($('.def a').text()).toBe('λόγος');
    expect($('.def a').attr('href')).toBe('/entry/λόγος');
  });

  test.each([
    ['Ampulla, 2.', 'ampulla'],
    ['Apple, 2.', 'apple'],
    ['Appointee, 2', 'appointee'],
    ['Common, noun', 'common_noun'],
    ['A 1', 'a_1'],
    ['Doe, John', 'doe_john'],
  ])('preserves %s while resolving its lexical target', (label, slug) => {
    const result = preprocess(`<div class="er">${label}</div>`);
    expect(result).toContain(`href="/entry/${slug}"`);
    expect(plain(result)).toBe(label);
  });

  test('preserves local dictionary illustrations and descriptions without allowing remote image sources', () => {
    const result = preprocess(
      '<img src="/illustrations/example.png" alt="Coordinate diagram" width="156" height="129" onerror="alert(1)"/><img src="https://example.com/image.png"/><img src="/illustrations/../private.png"/>'
    );
    expect(result).toContain('src="/illustrations/example.png"');
    expect(result).toContain('alt="Coordinate diagram"');
    expect(result).toContain('width="156" height="129"');
    expect(result).not.toMatch(/onerror|https:|\.\./);
  });

  test('retains unresolved source characters and typographic quotation marks', () => {
    expect(plain(preprocess('“word” ‘word’ &#xFFFD;'))).toBe('“word” ‘word’ �');
  });

  test.each(['note', 'usage', 'def'])(
    'retains native quotations inside %s without splitting the surrounding content',
    (kind) => {
      const blocks = content(
        `<div class="${kind}">Before.<div class="q">First line.<br/>Second line.<div class="qau">Author.</div></div>After.</div>`
      );
      expect(blocks).toHaveLength(1);
      const block = blocks[0];
      if (!('html' in block)) throw new Error('Expected retained HTML');
      const $ = cheerio.load(block.html);
      expect($('blockquote.q')).toHaveLength(1);
      expect($('blockquote.q > .qau').text()).toBe('Author.');
      expect($('blockquote.q br')).toHaveLength(1);
      expect(plain(block.html)).toBe('Before.First line.Second line.Author.After.');
    }
  );

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
    const entry = parseEntry(
      'A 1',
      '<h2 class="hw">A 1</h2><div class="def">A registry mark.</div>'
    );
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

  test.each(['Bechic', 'Beetle-browed', 'Condemnable'])(
    '%s recognizes its unmarked adjective label without changing the abbreviation',
    (key) => {
      const homograph = parseEntry(key, sourceHtml(key)).homographs[0];
      expect(homograph.partOfSpeech).toBe('a.');
      expect(homograph.header.slice(-2)).toEqual([
        { kind: 'text', text: ',' },
        { kind: 'partOfSpeech', text: 'a.' },
      ]);
      expect(text(homograph.content).trimStart()).not.toMatch(/^, a\./);
    }
  );

  test('keeps an unmarked adjective label within an adjacent-headword group', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">First</h2>, a. <h2 class="hw">Second</h2><div class="pos">adjective</div><div class="def">Meaning.</div>'
    );
    expect(entry.homographs).toHaveLength(1);
    expect(entry.homographs[0].alternateHeadwords).toEqual(['Second']);
    expect(text(entry.homographs[0].content)).toBe('Meaning.');
  });

  test.each([
    '<div class="ety">, a. </div><div class="def">Meaning.</div>',
    '<div class="def">Meaning.</div>, a. <h2 class="hw">Second</h2><div class="def">Other.</div>',
    ', a. longer text <div class="def">Meaning.</div>',
  ])('keeps label-like body text out of the header: %s', (html) => {
    const entry = parseEntry('Example', `<h2 class="hw">Example</h2>${html}`);
    expect(entry.homographs[0].partOfSpeech).toBeNull();
    expect(text(entry.homographs[0].content)).toContain(', a.');
  });

  test('keeps usage marks, joined labels and base words on the header line', () => {
    const header = (html: string) =>
      parseEntry('Example', html).homographs[0].header.map((part) =>
        'html' in part ? plain(part.html) : part.text
      );
    expect(
      header(
        '<h2 class="hw">Example</h2>, <div class="mark">obs. </div><div class="pos">past participle </div>of <div class="er">Base</div>. <div class="def">Meaning.</div>'
      )
    ).toEqual(['Example', 'obs.', 'past participle', 'of Base.']);
    expect(
      header(
        '<h2 class="hw">Example</h2>, <div class="pos">adjective</div>, <div class="pos">comparative </div>of <div class="er">Base</div>. <div class="ety">[Origin.]</div>'
      )
    ).toEqual(['Example', 'adjective', ',', 'comparative', 'of Base.']);
    expect(
      header(
        '<h2 class="hw">Example</h2>, <div class="pos">plural noun </div>of Base. <div class="ety">[Origin.]</div>'
      )
    ).toEqual(['Example', 'plural noun', 'of Base.']);
    expect(
      header(
        '<h2 class="hw">First </h2><i class="it">or </i><h2 class="hw">Second</h2><div class="def">Meaning.</div>'
      )
    ).toEqual(['First', 'or', 'Second']);
  });

  test('keeps header attributions before grammatical labels', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2><div class="au">Editor</div>, <div class="pos">noun</div><div class="def">Meaning.</div><div class="au">Writer</div>, <div class="pos">adjective</div>'
    );
    const homograph = entry.homographs[0];
    expect(homograph.partOfSpeech).toBe('noun');
    expect(homograph.header[1]).toEqual({ kind: 'inline', html: '<span class="au">Editor</span>' });
    expect(homograph.header[2]).toEqual({ kind: 'text', text: ',' });
    expect(homograph.header.at(-1)).toEqual({ kind: 'partOfSpeech', text: 'noun' });
    expect(text(homograph.content)).toBe('Meaning.Writer, adjective');
  });

  test('keeps connective text in a headword group with one header', () => {
    const entry = parseEntry(
      'Example',
      '<div class="mhw"><h2 class="hw">First</h2>, <div class="pos">noun </div>Also <h2 class="hw">Second</h2>, older <h2 class="hw">Third</h2>, etc. }</div><div class="def">Meaning.</div>'
    );
    expect(entry.homographs).toHaveLength(1);
    expect(entry.homographs[0].alternateHeadwords).toEqual(['Second', 'Third']);
    expect(text(entry.homographs[0].content)).toBe('Meaning.');
  });

  test('omits bare header placeholders without dropping grammar or body uncertainty', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2><div class="pr">(sound)</div>(#), <div class="pos">noun</div><div class="def">Meaning (#).</div>'
    );
    expect(entry.homographs[0].pronunciation).toBe('sound');
    expect(entry.homographs[0].partOfSpeech).toBe('noun');
    expect(text(entry.homographs[0].content)).toBe('Meaning (#).');
  });

  test('keeps singular-use qualifications with the plural header forms', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2>, <div class="pos">plural noun</div>, but often used as <i class="xex">sing</i>. with <div class="plu"><i>pl.</i> Examples.</div><div class="def">Meaning.</div>'
    );
    const homograph = entry.homographs[0];
    expect(homograph.partOfSpeech).toBe('plural noun');
    const qualification = homograph.header.at(-1);
    expect(qualification?.kind === 'inline' && plain(qualification.html)).toBe(
      ', but often used as sing. with pl. Examples.'
    );
    expect(text(homograph.content)).toBe('Meaning.');
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

  test('keeps pronunciation guide references when omitting unknown transcriptions', () => {
    const entry = parseEntry(
      'Example',
      '<h2 class="hw">Example</h2><div class="pr">(? or ?; 277)</div><div class="pos">noun</div><div class="vmorph">[<div class="conjf">Examples</div><div class="pr">(? or &#xFFFD;)</div>.]</div><div class="def">Meaning.</div>'
    );
    const header = entry.homographs[0].header.find((part) => part.kind === 'pronunciation');
    expect(header && 'html' in header ? header.html : null).toBe('(277)');
    expect(entry.homographs[0].pronunciation).toBeNull();
    expect(text(entry.homographs[0].content)).toBe('[Examples.]Meaning.');
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

test('allows explicit lexical scope only for notes and synonyms', () => {
  const html = preprocess(
    '<div class="syn" data-scope="homograph">Whole entry.</div><div class="syn" data-scope="sense">Sense.</div><div class="syn" data-scope="other">Other.</div><div class="note" data-scope="homograph">Whole-entry note.</div><div class="def" data-scope="sense">Meaning.</div>'
  );
  expect(html.match(/data-scope/g)).toHaveLength(3);
  const blocks = content(
    '<div class="sn">1.</div><div class="def">First.</div><div class="sn">2.</div><div class="def">Second.</div><div class="syn" data-scope="homograph">Whole-entry comparison.</div>'
  );
  expect(blocks.at(-1)).toEqual({ kind: 'synonyms', html: 'Whole-entry comparison.' });
});

test('places a numbered-sense comparison after its lettered subsenses', () => {
  const blocks = content(
    '<div class="sd">I.</div><div class="sn">1.</div><div class="sd">(a)</div><div class="def">First case.</div><div class="note">Local note.</div><div class="sd">(b)</div><div class="def">Second case.</div><div class="syn" data-scope="sense">Both cases.</div><div class="sn">2.</div><div class="def">Another meaning.</div>'
  );
  const section = blocks[0];
  if (section.kind !== 'sense') throw new Error('Missing Roman section');
  const first = section.content[0];
  if (first.kind !== 'sense') throw new Error('Missing numbered sense');
  expect(first.content.map((block) => block.kind)).toEqual(['sense', 'sense', 'synonyms']);
  const subsense = first.content[0];
  if (subsense.kind !== 'sense') throw new Error('Missing lettered subsense');
  expect(subsense.content.at(-1)).toEqual({ kind: 'note', html: 'Local note.' });
  expect(first.content.at(-1)).toEqual({ kind: 'synonyms', html: 'Both cases.' });
  expect(section.content).toHaveLength(2);
});

test('keeps an explicitly extended secondary definition in its sense', () => {
  const blocks = content(
    '<div class="sn">1.</div><div class="def">A person.</div><div class="specif">Also</div><div class="def2"><div class="pos">adjective</div><div class="def">Descriptive.</div></div><div class="au">Writer.</div><div class="sn">2.</div><div class="def">A language.</div>'
  );
  expect(blocks.map((block) => block.kind)).toEqual(['sense', 'sense']);
  const first = blocks[0];
  if (first.kind !== 'sense') throw new Error('Missing first sense');
  expect(first.content.at(-1)?.kind).toBe('section');
  expect(text(first.content)).toBe('A person.AlsoadjectiveDescriptive.Writer.');
});

test('keeps unintroduced secondary parts of speech at homograph level', () => {
  const blocks = content(
    '<div class="sn">1.</div><div class="sd">(a)</div><div class="def">First.</div><div class="sd">(b)</div><div class="def">Second.</div><div class="def2"><div class="pos">noun</div><div class="def">Another part of speech.</div></div><div class="col">A compound</div><div class="def">Its meaning.</div>'
  );
  expect(blocks.map((block) => block.kind)).toEqual(['sense', 'section', 'compound']);
});

test('keeps numbered grammatical labels in the header', () => {
  const homograph = parseEntry(
    'Example',
    '<h2 class="hw">Example</h2><div class="pr">(example)</div>, (1) <div class="pos">infinitive verb</div>, (2) <div class="pos">noun</div><div class="sn">1.</div><div class="def">To act.</div><div class="sn">2.</div><div class="def">An action.</div>'
  ).homographs[0];
  expect(homograph.header.slice(2)).toEqual([
    { kind: 'text', text: ', (1)' },
    { kind: 'partOfSpeech', text: 'infinitive verb' },
    { kind: 'text', text: ', (2)' },
    { kind: 'partOfSpeech', text: 'noun' },
  ]);
  expect(homograph.partOfSpeech).toBe('infinitive verb');
  expect(homograph.content.map((block) => block.kind)).toEqual(['sense', 'sense']);
});

test('keeps an explicitly scoped compound and its continuation in its numbered sense', () => {
  const blocks = content(
    '<div class="sn">1.</div><div class="def">Mineral.</div><div class="cs" data-scope="sense"><div class="col">A mineral variety</div><div class="cd">Its description.</div></div><div class="q">An example.</div><div class="qau">Writer.</div><div class="sn">2.</div><div class="def">A color.</div><div class="cs"><div class="col">A general compound</div><div class="cd">Another description.</div></div>'
  );
  expect(blocks.map((block) => block.kind)).toEqual(['sense', 'sense', 'compound']);
  const first = blocks[0];
  if (first.kind !== 'sense') throw new Error('Missing mineral sense');
  const compound = first.content.at(-1);
  if (compound?.kind !== 'compound') throw new Error('Missing mineral compound');
  expect(compound.content.at(-1)).toEqual({
    kind: 'quotation',
    html: 'An example.',
    authors: ['Writer.'],
  });
});

test('keeps Agreement synonyms after both subsenses and Amethyst compounds in sense one', () => {
  const agreement = parseEntry('Agreement', sourceHtml('Agreement')).homographs[0];
  const third = agreement.content.find((block) => block.kind === 'sense' && block.number === '3.');
  if (third?.kind !== 'sense') throw new Error('Missing Agreement sense three');
  expect(third.content.filter((block) => block.kind === 'sense')).toHaveLength(2);
  expect(third.content.some((block) => block.kind === 'synonyms')).toBe(true);

  const amethyst = parseEntry('Amethyst', sourceHtml('Amethyst')).homographs[0];
  const first = amethyst.content.find((block) => block.kind === 'sense' && block.number === '1.');
  if (first?.kind !== 'sense') throw new Error('Missing Amethyst sense one');
  expect(first.content.some((block) => block.kind === 'compound')).toBe(true);
  expect(amethyst.content.some((block) => block.kind === 'compound')).toBe(false);
});

test.each(['note', 'syn'])(
  'keeps a sense-scoped %s after a sense-local compound with its numbered sense',
  (className) => {
    const blocks = content(
      `<div class="sn">1.</div><div class="def">First.</div><div class="cs" data-scope="sense"><div class="col">A phrase</div><div class="cd">Its meaning.</div></div><div class="${className}" data-scope="sense">Applies to the first sense.</div><div class="sn">2.</div><div class="def">Second.</div>`
    );
    expect(blocks.map((block) => block.kind)).toEqual(['sense', 'sense']);
    const first = blocks[0];
    if (first.kind !== 'sense') throw new Error('Missing first sense');
    expect(first.content.map((block) => block.kind)).toEqual([
      'definition',
      'compound',
      className === 'note' ? 'note' : 'synonyms',
    ]);
  }
);

test('keeps unscoped notes with their sense and scoped notes at homograph level', () => {
  const blocks = content(
    '<div class="sn">1.</div><div class="def">Meaning.</div><div class="note">Sense note.</div><div class="note" data-scope="homograph">Whole-entry note.</div>'
  );
  const sense = blocks[0];
  if (sense.kind !== 'sense') throw new Error('Missing sense');
  expect(sense.content.at(-1)).toEqual({ kind: 'note', html: 'Sense note.' });
  expect(blocks.at(-1)).toEqual({ kind: 'note', html: 'Whole-entry note.' });
});

test('keeps attributions with the note or trailing derivative line they close', () => {
  const blocks = content(
    '<div class="sn">1.</div><div class="def">First.</div><div class="sn">2.</div><div class="def">Second.</div><div class="note">A note.</div><div class="rj"><div class="au">Author.</div></div>– <div class="wordforms"><div class="wf">Example-ness</div>, <div class="pos">noun</div></div><div class="rj"><div class="au">Writer.</div></div><br/>'
  );
  const visible = blocks.filter((block) => !('html' in block) || plain(block.html).trim());
  expect(visible.map((block) => block.kind)).toEqual(['sense', 'sense', 'forms']);
  const second = blocks[1];
  if (second.kind !== 'sense') throw new Error('Missing sense');
  expect(text(second.content)).toBe('Second.A note. Author.');
  expect(text(blocks.filter((block) => block.kind === 'forms'))).toBe('Example-ness, noun Writer.');
});

test('keeps a run-in derivative in its sense when sense content follows it', () => {
  const blocks = content(
    '<div class="sn">1.</div><div class="def">First.</div>– <div class="wordforms"><div class="wf">Example-ic</div></div><div class="q">A quotation.</div><div class="sn">2.</div><div class="def">Second.</div>'
  );
  expect(blocks.map((block) => block.kind)).toEqual(['sense', 'sense']);
  const first = blocks[0];
  if (first.kind !== 'sense') throw new Error('Missing sense');
  expect(first.content.map((block) => block.kind)).toEqual(['definition', 'forms', 'quotation']);
});

test('omits verifier metadata without removing lexical abbreviations', () => {
  const entry = parseEntry(
    'Example',
    '<h2 class="hw">Example</h2><div class="ety">AS. example.</div><div class="def">Meaning.</div><div class="ver">AS</div>'
  );
  expect(text(entry.homographs[0].content)).toBe('AS. example.Meaning.');
  expect(preprocess('<div class="ver">PJC</div>')).toBe('');
});

test.each([
  ['Abide', 'Followed by by:'],
  ['Aboard', '(Naut.):'],
])('keeps the compound introduction outside the final sense in %s', (key, phrase) => {
  const blocks = parseEntry(key, sourceHtml(key)).homographs[0].content;
  const compoundIndex = blocks.findIndex((block) => block.kind === 'compound');
  expect(compoundIndex).toBeGreaterThan(0);
  const lastSenseIndex = blocks
    .slice(0, compoundIndex)
    .findLastIndex((block) => block.kind === 'sense');
  expect(text(blocks.slice(lastSenseIndex + 1, compoundIndex)).trim()).toBe(phrase);
});

test('keeps foreign compound marks with headings and out of lookup names', () => {
  const blocks = content(
    '<div class="sn">1.</div><div class="def">Meaning.</div><div class="cs">‖<div class="col">First phrase</div><div class="cd">First.</div> – ‖<div class="col">Second phrase</div><div class="cd">Second.</div></div>'
  );
  expect(blocks.map((block) => block.kind)).toEqual(['sense', 'compound', 'compound']);
  const compounds = blocks.filter((block) => block.kind === 'compound');
  expect(compounds.map((block) => block.headwords)).toEqual([['First phrase'], ['Second phrase']]);
  expect(compounds.map((block) => plain(block.headwordHtml))).toEqual([
    '‖First phrase',
    '‖Second phrase',
  ]);
});

test('treats isolated hyphens as compound separators without changing lexical hyphens', () => {
  const blocks = content(
    '<div class="ety">prefix-suffix</div><div class="cs">- <div class="col">First phrase</div> - <div class="col">Second phrase</div><div class="cd">Meaning.</div></div>'
  );
  expect(blocks.map((block) => block.kind)).toEqual(['etymology', 'compound', 'compound']);
  expect(text([blocks[0]])).toBe('prefix-suffix');
});

test('removes compound separator dashes while retaining adjacent author punctuation and prose', () => {
  const blocks = content(
    '<div class="cs"><div class="col">First phrase</div><div class="cd">Meaning – with qualification.</div><div class="qau">Author</div>. – <div class="mcol"><div class="col">Second phrase</div>, or <div class="col">Another phrase</div></div><div class="cd">Other meaning.</div></div>'
  );
  const compounds = blocks.filter((block) => block.kind === 'compound');
  expect(compounds).toHaveLength(2);
  expect(text(compounds[0].content)).toBe('Meaning – with qualification.Author.');
  expect(compounds[1].headwords).toEqual(['Second phrase', 'Another phrase']);
});

test('keeps punctuation adjacent when joining forms across source wrappers', () => {
  const blocks = content(
    '<div class="plu"><i>pl.</i> E. <div class="plw">Forms</div></div>, L. <div class="plw">Forma</div>.'
  );
  expect(text(blocks)).toBe('pl. E. Forms, L. Forma.');
});

test('keeps a parenthetical plural-use marker inline without splitting a compound', () => {
  const blocks = content(
    '<div class="col">Example phrase</div><div class="def">One meaning;</div><div class="plu">(pl.)</div><div class="def">multiple meanings.</div>'
  );
  expect(blocks).toHaveLength(1);
  const compound = blocks[0];
  if (compound.kind !== 'compound') throw new Error('Missing compound');
  expect(compound.content.map((block) => block.kind)).toEqual([
    'definition',
    'label',
    'definition',
  ]);
});

test.each(['Inadvertency', 'Poseuse'])('%s keeps a header separator on its forms line', (key) => {
  const header = parseEntry(key, sourceHtml(key)).homographs[0].header;
  const formsIndex = header.findIndex((part) => part.kind === 'forms');
  const forms = header[formsIndex];
  if (forms.kind !== 'forms') throw new Error('Missing header forms');
  expect(plain(forms.html)).toMatch(/,$/);
  expect(header[formsIndex + 1].kind).toBe('headword');
});

test('separates explicitly identified nested definitions without splitting example words', () => {
  const entry = parseEntry(
    'Fixture',
    '<h2 class="hw">Fixture</h2><div class="sn">2.</div><div class="sd">(a)</div><div class="def"><i class="xex">re</i>join. <div class="sd" data-role="definition">(b)</div><div class="fld">(Law)</div>Second meaning.</div><div class="au">Author.</div>'
  );
  const sense = entry.homographs[0]?.content[0];
  if (sense?.kind !== 'sense') throw new Error('Missing numbered sense');
  expect(
    sense.content.map((block) => (block.kind === 'sense' ? block.number : block.kind))
  ).toEqual(['(a)', '(b)']);
  const first = sense.content[0];
  const second = sense.content[1];
  if (first?.kind !== 'sense' || second?.kind !== 'sense') throw new Error('Missing subsenses');
  expect(first.content).toEqual([{ kind: 'definition', html: '<em class="xex">re</em>join. ' }]);
  expect(second.content.at(-1)).toEqual({ kind: 'text', html: '<span class="au">Author.</span>' });
});

test('keeps overloaded nested reference markers inline unless their role is explicit', () => {
  const entry = parseEntry(
    'Reference',
    '<h2 class="hw">Reference</h2><div class="sd">(a)</div><div class="def">See Illust. <div class="sd">(b)</div> of <div class="er">Bird</div>.</div>'
  );
  const first = entry.homographs[0]?.content[0];
  if (first?.kind !== 'sense') throw new Error('Missing first subsense');
  expect(entry.homographs[0]?.content).toHaveLength(1);
  expect(first.content[0]).toEqual({
    kind: 'definition',
    html: 'See Illust. <span class="sd">(b)</span> of <a class="er" href="/entry/bird">Bird</a>.',
  });
  expect(
    preprocess(
      '<div class="def" data-role="definition">Body.</div><div class="sd" data-role="unknown">(b)</div>'
    )
  ).not.toContain('data-role');
});

test('retains mixed compound heading spans without widening their emphasis', () => {
  const blocks = content(
    '<div class="mcol"><div class="col">First name</div> or <div class="col">Second name</div> (<div class="spn">Species</div>)</div><div class="cd">Meaning.</div>'
  );
  const compound = blocks[0];
  if (compound?.kind !== 'compound') throw new Error('Missing compound');
  expect(compound.headwords).toEqual(['First name', 'Second name']);
  expect(compound.headwordHtml).toBe(
    '<span class="mcol"><span class="col">First name</span> or <span class="col">Second name</span> (<span class="spn">Species</span>)</span>'
  );
});

test('references an earlier note owner without changing source order', () => {
  const blocks = content(
    '<div class="sn">1.</div><div class="def">First.</div><div class="sn">2.</div><div class="def">Second.</div><div class="sn">3.</div><div class="def">Third.</div><div class="note" data-scope="sense:2">About the second meaning.</div>'
  );
  expect(blocks.map((block) => block.kind)).toEqual(['sense', 'sense', 'sense', 'note']);
  expect(blocks[3]).toEqual({
    kind: 'note',
    html: 'About the second meaning.',
    ownerSense: '2.',
  });
  expect(text(blocks)).toBe('1.First.2.Second.3.Third.About the second meaning.');
});

test('retains separators around unknown alternate-header pronunciations', () => {
  const entry = parseEntry(
    'Pair',
    '<div class="mhw"><h2 class="hw">First</h2> (#), <h2 class="hw">Second</h2> (?), </div><div class="pos">noun</div><div class="def">Meaning.</div>'
  );
  const header = entry.homographs[0]?.header;
  expect(header?.filter((part) => part.kind === 'text')).toEqual([
    { kind: 'text', text: ',' },
    { kind: 'text', text: ',' },
  ]);
  expect(entry.homographs[0]?.pronunciation).toBeNull();
});

test('keeps closing punctuation within its preceding lexical block', () => {
  const blocks = content(
    '<div class="syn">Similar words</div>. <div class="usage">Different uses.</div>'
  );
  expect(blocks).toEqual([
    { kind: 'synonyms', html: 'Similar words. ' },
    { kind: 'usage', html: 'Different uses.' },
  ]);
  expect(content('<div class="syn">Similar words.</div> Different text.')).toEqual([
    { kind: 'synonyms', html: 'Similar words.' },
    { kind: 'text', html: ' Different text.' },
  ]);
});

test('indexes complete compound names without expanding displayed ellipses', () => {
  const blocks = content(
    '<div class="mcol"><div class="col" data-headword="At close range">At close</div> (or <div class="col" data-headword="At long range">long</div>) <div class="col" data-headword="">range</div></div><div class="cd">Meaning.</div>'
  );
  const compound = blocks[0];
  if (compound?.kind !== 'compound') throw new Error('Missing compound');
  expect(compound.headwords).toEqual(['At close range', 'At long range']);
  expect(plain(compound.headwordHtml)).toBe('At close (or long) range');
  expect(preprocess('<div class="def" data-headword="Wrong">Meaning.</div>')).not.toContain(
    'data-headword'
  );
});
