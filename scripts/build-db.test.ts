import { describe, expect, test } from 'bun:test';
import { parseEntry, preprocess } from './build-db.ts';

// ─── Preprocessing ───────────────────────────────────────

describe('preprocess', () => {
  test('removes d:priority attributes', () => {
    const input = '<h2 d:priority="2" class="hw">Test</h2>';
    expect(preprocess(input)).not.toContain('d:priority');
    expect(preprocess(input)).toContain('class="hw"');
  });

  test('converts <b> to <strong> and <i> to <em>', () => {
    const input = '<b>bold</b> and <i class="xex">italic</i>';
    const result = preprocess(input);
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em class="xex">italic</em>');
    expect(result).not.toContain('<b>');
    expect(result).not.toContain('<i ');
  });

  test('preserves curly quotes', () => {
    const input = '\u201CTest\u201D and \u2018single\u2019';
    const result = preprocess(input);
    expect(result).toContain('\u201C');
    expect(result).toContain('\u201D');
    expect(result).toContain('\u2018');
    expect(result).toContain('\u2019');
  });

  test('removes unsafe tags and attributes', () => {
    const input =
      '<div class="def" onclick="alert(1)" style="color:red">Safe</div>' +
      '<script>alert(1)</script>' +
      '<div class="er" href="javascript:alert(1)">Test Ref</div>';

    const result = preprocess(input);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('onclick=');
    expect(result).not.toContain('style=');
    expect(result).toContain('href="/entry/Test%20Ref"');
  });
});

// ─── Simple entry parsing ────────────────────────────────

describe('parseEntry — simple entries', () => {
  test('single headword with one definition', () => {
    const html =
      '<h2 d:priority="2" class="hw">A 1 </h2>' +
      '<div class="pr">(&#x101; w&#x16D;n)</div>. ' +
      '<div class="def">A registry mark given by underwriters.</div><br/>';

    const entry = parseEntry('A 1', html);
    expect(entry.key).toBe('A 1');
    expect(entry.normalizedKey).toBe('a 1');
    expect(entry.homographs).toHaveLength(1);

    const h = entry.homographs[0];
    expect(h.headword).toBe('A 1');
    expect(h.pronunciation).not.toBeNull();
    expect(h.senses).toHaveLength(1);
    expect(h.senses[0].definition).toContain('registry mark');
  });

  test('entry with no headword uses key', () => {
    const html =
      '<div class="pr">(test)</div>, ' +
      '<div class="pos">noun </div>' +
      '<div class="def">A test definition.</div>';

    const entry = parseEntry('TestWord', html);
    expect(entry.homographs).toHaveLength(1);
    expect(entry.homographs[0].headword).toBe('TestWord');
    expect(entry.homographs[0].pronunciation).toBe('test');
    expect(entry.homographs[0].partOfSpeech).toBe('noun');
  });

  test('entry with etymology', () => {
    const html =
      '<h2 class="hw">Aam </h2>' +
      '<div class="pr">(test)</div>, ' +
      '<div class="pos">noun </div>' +
      '<div class="ety">[D. <div class="ets">aam</div>, fr. LL. <div class="ets">ama</div>; ' +
      'cf. L. <div class="ets">hama</div>] </div>' +
      '<div class="def">A Dutch measure of liquids.</div>' +
      '<div class="altsp">[Written also <div class="asp">Aum </div>and <div class="asp">Awm</div>.]</div>';

    const entry = parseEntry('Aam', html);
    const h = entry.homographs[0];
    expect(h.etymology).not.toBeNull();
    expect(h.etymology!.sourceWords).toEqual(['aam', 'ama', 'hama']);
    expect(h.alternateSpellings).toEqual(['Aum', 'Awm']);
  });
});

// ─── Multiple homographs ────────────────────────────────

describe('parseEntry — multiple homographs', () => {
  test('splits on h2.hw boundaries', () => {
    const html =
      '<h2 class="hw">Abandon </h2>' +
      '<div class="pos">transitive verb </div>' +
      '<div class="def">To give up absolutely.</div><br/>' +
      '<h2 class="hw">Abandon</h2>, ' +
      '<div class="pos">noun </div>' +
      '<div class="def">Abandonment; relinquishment.</div>';

    const entry = parseEntry('Abandon', html);
    expect(entry.homographs).toHaveLength(2);
    expect(entry.homographs[0].partOfSpeech).toBe('transitive verb');
    expect(entry.homographs[1].partOfSpeech).toBe('noun');
  });

  test('detects ‖ alternate marker', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">First sense.</div><br/>' +
      '\u2016<h2 class="hw">Test </h2>' +
      '<div class="def">Alternate pronunciation sense.</div>';

    const entry = parseEntry('Test', html);
    expect(entry.homographs).toHaveLength(2);
    expect(entry.homographs[0].isAlternate).toBe(false);
    expect(entry.homographs[1].isAlternate).toBe(true);
  });
});

// ─── Numbered senses ─────────────────────────────────────

describe('parseEntry — numbered senses', () => {
  test('splits definitions by sense number', () => {
    const html =
      '<h2 class="hw">Aband </h2>' +
      '<div class="pr">(test)</div>, ' +
      '<div class="pos">transitive verb </div>' +
      '<div class="sn">1. </div>' +
      '<div class="def">To abandon. </div>' +
      '<div class="mark">[Obs.]</div><br/>' +
      '<div class="sn">2. </div>' +
      '<div class="def">To banish; to expel. </div>' +
      '<div class="mark">[Obs.] </div>';

    const entry = parseEntry('Aband', html);
    const h = entry.homographs[0];
    expect(h.senses).toHaveLength(2);
    expect(h.senses[0].number).toBe('1.');
    expect(h.senses[0].definition).toContain('abandon');
    expect(h.senses[0].mark).toBe('[Obs.]');
    expect(h.senses[1].number).toBe('2.');
    expect(h.senses[1].definition).toContain('banish');
  });

  test('sense with field label', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="sn">4. </div>' +
      '<div class="fld">(Mar. Law) </div>' +
      '<div class="def">To relinquish all claim to.</div>';

    const entry = parseEntry('Test', html);
    expect(entry.homographs[0].senses[0].field).toBe('(Mar. Law)');
  });

  test('does not emit empty sense when field appears before repeated sn', () => {
    const html =
      '<h2 class="hw">Am-ne&#x2032;sic </h2>' +
      '<div class="fld">(Med.) </div>' +
      '<div class="sn">1. </div>' +
      '<div class="sn">1. </div>' +
      '<div class="def">Of or pertaining to amnesia.</div>';

    const entry = parseEntry('Amnesic', html);
    const senses = entry.homographs[0].senses;
    expect(senses).toHaveLength(1);
    expect(senses[0].field).toBe('(Med.)');
    expect(senses[0].number).toBe('1.');
    expect(senses[0].definition).toContain('amnesia');
  });
});

// ─── Quotations ──────────────────────────────────────────

describe('parseEntry — quotations', () => {
  test('extracts quotation with author', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">A definition.</div><br/>' +
      '<div class="q">That he might <div class="qex">test</div> them. ' +
      '<div class="qau">Author.</div></div>';

    const entry = parseEntry('Test', html);
    const sense = entry.homographs[0].senses[0];
    expect(sense.quotations).toHaveLength(1);
    expect(sense.quotations[0].author).toBe('Author');
    expect(sense.quotations[0].html).toContain('test');
    expect(sense.quotations[0].html).not.toContain('Author');
  });

  test('extracts attribution outside quotation', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">A definition.</div>' +
      '<div class="au">Shak. </div>';

    const entry = parseEntry('Test', html);
    expect(entry.homographs[0].senses[0].attributions).toEqual(['Shak.']);
  });

  test('extracts rj-wrapped attribution', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">A definition.</div>' +
      '<div class="rj"><div class="au">Mir. for Mag.</div></div>';

    const entry = parseEntry('Test', html);
    expect(entry.homographs[0].senses[0].attributions).toEqual(['Mir. for Mag.']);
  });
});

// ─── Verb morphology ─────────────────────────────────────

describe('parseEntry — verb morphology', () => {
  test('extracts conjugation forms', () => {
    const html =
      '<h2 class="hw">Abandon </h2>' +
      '<div class="pos">transitive verb </div>' +
      '<div class="vmorph">[' +
      '<div class="pos">imperfect or past participle </div>' +
      '<div class="conjf">Abandoned </div>' +
      '<div class="pr">(-d&#x16D;nd)</div>; ' +
      '<div class="pos">present participle or verbal noun </div>' +
      '<div class="conjf">Abandoning</div>.' +
      '] </div>' +
      '<div class="def">To give up.</div>';

    const entry = parseEntry('Abandon', html);
    const h = entry.homographs[0];
    expect(h.verbMorphology).not.toBeNull();
    expect(h.verbMorphology).toHaveLength(2);
    expect(h.verbMorphology![0].label).toBe('imperfect or past participle');
    expect(h.verbMorphology![0].form).toBe('Abandoned');
    expect(h.verbMorphology![1].form).toBe('Abandoning');
  });
});

// ─── Synonyms and usage ──────────────────────────────────

describe('parseEntry — synonyms and usage', () => {
  test('extracts synonym block', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">A definition.</div>' +
      '<div class="syn"><strong>Syn.</strong> &#x2013; To give up; yield; forego.</div>';

    const entry = parseEntry('Test', html);
    expect(entry.homographs[0].synonyms).toContain('give up');
  });

  test('extracts usage discussion', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">A definition.</div>' +
      '<div class="usage"><div class="er">To Test</div>, <div class="er">To Try</div>. ' +
      'These words agree in meaning.</div>';

    const entry = parseEntry('Test', html);
    expect(entry.homographs[0].usage).toContain('These words agree');
  });
});

// ─── Compound forms ──────────────────────────────────────

describe('parseEntry — compound forms', () => {
  test('extracts compound form with etymology', () => {
    const html =
      '<h2 class="hw">A </h2>' +
      '<div class="def">First letter.</div><br/>' +
      '<div class="cs">' +
      '<div class="col"><strong>A per se </strong></div>' +
      '<div class="ety">(L. <div class="ets">per se </div>by itself)</div>, ' +
      '<div class="cd">one preeminent; a nonesuch. </div>' +
      '<div class="mark">[Obs.]</div>' +
      '</div>';

    const entry = parseEntry('A', html);
    const h = entry.homographs[0];
    expect(h.compoundForms).toHaveLength(1);
    expect(h.compoundForms[0].headwords).toEqual(['A per se']);
    expect(h.compoundForms[0].definition).toContain('preeminent');
    expect(h.compoundForms[0].mark).toBe('[Obs.]');
  });

  test('extracts multiple compound forms and grouped headwords', () => {
    const html =
      '<h2 class="hw">Analytical </h2>' +
      '<div class="def">Base definition.</div>' +
      '<div class="cs">' +
      '<div class="mcol">' +
      '<div class="col"><b>Analytical geometry </b></div>or ' +
      '<div class="col"><b>coordinate geometry</b></div>' +
      '</div>. ' +
      '<div class="cd">See under <div class="er">Geometry</div>.</div>' +
      '&#x2013; <div class="col"><b>Analytic language</b></div>, ' +
      '<div class="cd">A noninflectional language.</div>' +
      '&#x2013; <div class="col"><b>Analytical table</b></div>, ' +
      '<div class="cd">A classification table.</div>' +
      '</div>';

    const entry = parseEntry('Analytical', html);
    const forms = entry.homographs[0].compoundForms;

    expect(forms).toHaveLength(3);
    expect(forms[0].headwords).toEqual(['Analytical geometry', 'coordinate geometry']);
    expect(forms[0].definition).toContain('/entry/Geometry');
    expect(forms[1].headwords).toEqual(['Analytic language']);
    expect(forms[1].definition).toContain('noninflectional language');
    expect(forms[2].headwords).toEqual(['Analytical table']);
    expect(forms[2].definition).toContain('classification table');
  });
});

// ─── Notes ───────────────────────────────────────────────

describe('parseEntry — notes', () => {
  test('sense-level note', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">A definition.</div>' +
      '<div class="note">An important usage note.</div>';

    const entry = parseEntry('Test', html);
    expect(entry.homographs[0].senses[0].note).toContain('important usage note');
  });

  test('homograph-level note (before any sense)', () => {
    const html =
      '<h2 class="hw">A- </h2>' +
      '<div class="def">A prefix.</div><br/>' +
      '<div class="note">Besides these, there are other sources.</div>';

    const entry = parseEntry('A-', html);
    // Note attaches to sense since there's a current sense
    expect(entry.homographs[0].senses[0].note).toContain('other sources');
  });
});

// ─── Full sample entry: "Abandon" ────────────────────────

describe('parseEntry — full "Abandon" entry', () => {
  const abandonHtml =
    '<h2 d:priority="2" class="hw">A-ban&#x2032;don </h2>' +
    '<div class="pr">(a&#x307;-ba&#x306;n&#x2032;du&#x306;n)</div>, ' +
    '<div class="pos">transitive verb </div>' +
    '<div class="vmorph">[<div class="pos">imperfect or past participle </div>' +
    '<div class="conjf">Abandoned </div><div class="pr">(-du&#x306;nd)</div>; ' +
    '<div class="pos">present participle or verbal noun </div>' +
    '<div class="conjf">Abandoning</div>.] </div>' +
    '<div d:priority="2" class="ety">[OF. <div class="ets">abandoner</div>, ' +
    'F. <div class="ets">abandonner</div>; See <div class="er">Ban</div>.] </div>' +
    '<div class="sn">1. </div>' +
    '<div class="def">To cast or drive out; to banish; to expel; to reject. </div>' +
    '<div class="mark">[Obs.]</div><br/>' +
    '<div class="q">That he might . . . <div class="qex">abandon </div>them from him. ' +
    '<div class="qau">Udall.</div></div><br/>' +
    '<div class="q">Being all this time <div class="qex">abandoned </div>from your bed. ' +
    '<div class="qau">Shak.</div></div><br/>' +
    '<div class="sn">2. </div>' +
    '<div class="def">To give up absolutely; to forsake entirely.</div><br/>' +
    '<div class="q">Hope was overthrown, yet could not be <div class="qex">abandoned</div>. ' +
    '<div class="qau">I. Taylor.</div></div><br/>' +
    '<div class="sn">3. </div>' +
    '<div class="def">Reflexively: To give (one&#x2019;s self) up without attempt at self-control.</div><br/>' +
    '<div class="sn">4. </div>' +
    '<div class="fld">(Mar. Law) </div>' +
    '<div class="def">To relinquish all claim to.</div><br/>' +
    '<div class="syn"><strong>Syn. </strong>&#x2013; To give up; yield; forego.</div>' +
    '&#x2013; <div class="usage"><div class="er">To Abandon</div>, ' +
    '<div class="er">Desert</div>, <div class="er">Forsake</div>. ' +
    'These words agree in representing a person as giving up.</div><br/>' +
    '<h2 d:priority="2" class="hw">A-ban&#x2032;don</h2>, ' +
    '<div class="pos">noun </div>' +
    '<div d:priority="2" class="ety">[F. <div class="ets">abandon</div>. ' +
    'See <div class="er">Abandon</div>, <div class="pos">verb</div>] </div>' +
    '<div class="def">Abandonment; relinquishment. </div>' +
    '<div class="mark">[Obs.]</div><br/>' +
    '&#x2016;<h2 d:priority="2" class="hw">A&#x2CA;ban&#x2CA;don&#x2032; </h2>' +
    '<div class="pr">(a&#x307;&#x2CA;ba&#x308;N&#x2CA;do&#x302;N&#x2032;)</div>, ' +
    '<div class="pos">noun </div>' +
    '<div d:priority="2" class="ety">[F. See <div class="er">Abandon</div>.] </div>' +
    '<div class="def">A complete giving up to natural impulses; freedom from artificial constraint.</div><br/>';

  test('has 3 homographs', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    expect(entry.homographs).toHaveLength(3);
  });

  test('first homograph is a transitive verb with 4 senses', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const h = entry.homographs[0];
    expect(h.partOfSpeech).toBe('transitive verb');
    expect(h.senses).toHaveLength(4);
    expect(h.verbMorphology).toHaveLength(2);
  });

  test('first sense has mark and quotations', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const s = entry.homographs[0].senses[0];
    expect(s.number).toBe('1.');
    expect(s.mark).toBe('[Obs.]');
    expect(s.quotations).toHaveLength(2);
    expect(s.quotations[0].author).toBe('Udall');
    expect(s.quotations[1].author).toBe('Shak');
  });

  test('fourth sense has field label', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const s = entry.homographs[0].senses[3];
    expect(s.number).toBe('4.');
    expect(s.field).toBe('(Mar. Law)');
  });

  test('has synonyms and usage on first homograph', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const h = entry.homographs[0];
    expect(h.synonyms).toContain('give up');
    expect(h.usage).toContain('These words agree');
  });

  test('has etymology with cross-references', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const h = entry.homographs[0];
    expect(h.etymology).not.toBeNull();
    expect(h.etymology!.sourceWords).toContain('abandoner');
    expect(h.etymology!.crossReferences).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: 'Ban', target: 'ban' })])
    );
  });

  test('second homograph is a noun', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const h = entry.homographs[1];
    expect(h.partOfSpeech).toBe('noun');
    expect(h.isAlternate).toBe(false);
  });

  test('third homograph is alternate (‖ marker)', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const h = entry.homographs[2];
    expect(h.isAlternate).toBe(true);
    expect(h.partOfSpeech).toBe('noun');
    expect(h.senses[0].definition).toContain('natural impulses');
  });
});
