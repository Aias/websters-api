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
    expect(h.etymology!.html).toContain('hama');
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

  test('strips ‖ marker between homographs', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">First sense.</div><br/>' +
      '\u2016<h2 class="hw">Test </h2>' +
      '<div class="def">Alternate pronunciation sense.</div>';

    const entry = parseEntry('Test', html);
    expect(entry.homographs).toHaveLength(2);
    expect(entry.homographs[1].senses[0].definition).toContain('Alternate pronunciation sense');
    expect(entry.homographs[1].senses[0].definition).not.toContain('\u2016');
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
    expect(h.morphology).not.toBeNull();
    expect(h.morphology).toHaveLength(2);
    expect(h.morphology![0].label).toBe('imperfect or past participle');
    expect(h.morphology![0].form).toBe('Abandoned');
    expect(h.morphology![1].form).toBe('Abandoning');
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
    expect(h.morphology).toHaveLength(2);
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

  test('has etymology html with linked references', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const h = entry.homographs[0];
    expect(h.etymology).not.toBeNull();
    expect(h.etymology!.html).toContain('abandoner');
    expect(h.etymology!.html).toContain('/entry/Ban');
  });

  test('second homograph is a noun', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const h = entry.homographs[1];
    expect(h.partOfSpeech).toBe('noun');
  });

  test('third homograph keeps expected noun sense', () => {
    const entry = parseEntry('Abandon', abandonHtml);
    const h = entry.homographs[2];
    expect(h.partOfSpeech).toBe('noun');
    expect(h.senses[0].definition).toContain('natural impulses');
  });
});

// ─── Sub-definitions (sd) ───────────────────────────────

describe('parseEntry — sub-definitions', () => {
  test('sd creates separate sub-senses with letter labels', () => {
    const html =
      '<h2 class="hw">Abacus </h2>' +
      '<div class="sn">3. </div>' +
      '<div class="fld">(Arch.) </div>' +
      '<div class="sd">(a) </div>' +
      '<div class="def">The uppermost member of a column.</div>' +
      '<div class="sd">(b) </div>' +
      '<div class="def">A tablet or panel.</div>';

    const entry = parseEntry('Abacus', html);
    const senses = entry.homographs[0].senses;
    // sn 3. with field (Arch.) has no definition; sd (a) takes over that sense slot
    expect(senses).toHaveLength(2);
    expect(senses[0].number).toBe('(a)');
    expect(senses[0].field).toBe('(Arch.)');
    expect(senses[0].definition).toContain('uppermost member');
    expect(senses[1].number).toBe('(b)');
    expect(senses[1].definition).toContain('tablet or panel');
  });

  test('sd after definition flushes as new sense', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="sn">1. </div>' +
      '<div class="def">General def. </div>' +
      '<div class="sd">(a) </div>' +
      '<div class="def">Sub-def A.</div>' +
      '<div class="sd">(b) </div>' +
      '<div class="def">Sub-def B.</div>';

    const entry = parseEntry('Test', html);
    const senses = entry.homographs[0].senses;
    expect(senses).toHaveLength(3);
    expect(senses[0].number).toBe('1.');
    expect(senses[0].definition).toContain('General def');
    expect(senses[1].number).toBe('(a)');
    expect(senses[2].number).toBe('(b)');
  });
});

// ─── Secondary POS definitions (def2) ───────────────────

describe('parseEntry — def2 secondary POS', () => {
  test('def2 creates sense with secondary partOfSpeech', () => {
    const html =
      '<h2 class="hw">Abortifacient </h2>' +
      '<div class="pos">adjective </div>' +
      '<div class="def">Producing miscarriage. </div>' +
      '<div class="def2">' +
      '<div class="pos">noun </div>' +
      '<div class="def">A drug that causes premature delivery.</div>' +
      '</div>';

    const entry = parseEntry('Abortifacient', html);
    const h = entry.homographs[0];
    expect(h.partOfSpeech).toBe('adjective');
    expect(h.senses).toHaveLength(2);
    expect(h.senses[0].definition).toContain('Producing miscarriage');
    expect(h.senses[0].partOfSpeech).toBeNull();
    expect(h.senses[1].definition).toContain('drug that causes');
    expect(h.senses[1].partOfSpeech).toBe('noun');
  });

  test('def2 with sd sub-senses', () => {
    const html =
      '<h2 class="hw">Chaldean </h2>' +
      '<div class="def">Of or pertaining to Chaldea. </div>' +
      '<div class="def2">' +
      '<div class="pos">noun </div>' +
      '<div class="sd">(a) </div>' +
      '<div class="def">A native of Chaldea. </div>' +
      '<div class="sd">(b) </div>' +
      '<div class="def">A learned man.</div>' +
      '</div>';

    const entry = parseEntry('Chaldean', html);
    const senses = entry.homographs[0].senses;
    expect(senses).toHaveLength(3);
    expect(senses[0].definition).toContain('pertaining to Chaldea');
    expect(senses[1].number).toBe('(a)');
    expect(senses[1].definition).toContain('native of Chaldea');
    expect(senses[1].partOfSpeech).toBe('noun');
    expect(senses[2].number).toBe('(b)');
    expect(senses[2].definition).toContain('learned man');
  });
});

// ─── Plural forms (plu) ─────────────────────────────────

describe('parseEntry — plural forms', () => {
  test('extracts plural forms with pronunciation', () => {
    const html =
      '<h2 class="hw">Abacus </h2>' +
      '<div class="pos">noun </div>' +
      '<div class="plu"><i class="it">pl. </i>' +
      '<div class="plw">Abacuses </div>; L. pl. ' +
      '<div class="plw">Abaci </div><div class="pr">(-sī)</div>. </div>' +
      '<div class="def">A frame with beads.</div>';

    const entry = parseEntry('Abacus', html);
    const h = entry.homographs[0];
    expect(h.pluralForms).not.toBeNull();
    expect(h.pluralForms).toHaveLength(2);
    expect(h.pluralForms![0].form).toBe('Abacuses');
    expect(h.pluralForms![0].pronunciation).toBeNull();
    expect(h.pluralForms![1].form).toBe('Abaci');
    expect(h.pluralForms![1].pronunciation).toBe('-sī');
  });
});

// ─── Derived forms (wordforms) ──────────────────────────

describe('parseEntry — derived forms', () => {
  test('extracts derived word forms', () => {
    const html =
      '<h2 class="hw">Absent-minded </h2>' +
      '<div class="pos">adjective </div>' +
      '<div class="def">Inattentive to surroundings.</div>' +
      '<div class="wordforms">' +
      '<div class="wf">Absent-mindedness</div>, <div class="pos">noun </div>' +
      '– <div class="wf">Absent-mindedly</div>, <div class="pos">adverb</div>' +
      '</div>';

    const entry = parseEntry('Absent-minded', html);
    const h = entry.homographs[0];
    expect(h.derivedForms).not.toBeNull();
    expect(h.derivedForms).toHaveLength(2);
    expect(h.derivedForms![0].form).toBe('Absent-mindedness');
    expect(h.derivedForms![0].partOfSpeech).toBe('noun');
    expect(h.derivedForms![1].form).toBe('Absent-mindedly');
    expect(h.derivedForms![1].partOfSpeech).toBe('adverb');
  });

  test('accumulates derived forms across multiple wordforms blocks', () => {
    const html =
      '<h2 class="hw">Fad </h2>' +
      '<div class="pos">noun </div>' +
      '<div class="def">A hobby; whim.</div>' +
      '<div class="wordforms"><div class="wf">Faddist</div>, <div class="pos">noun</div></div>' +
      '<div class="wordforms"><div class="wf">Faddish</div>, <div class="pos">adjective</div></div>';

    const entry = parseEntry('Fad', html);
    const h = entry.homographs[0];
    expect(h.derivedForms).not.toBeNull();
    expect(h.derivedForms).toHaveLength(2);
    expect(h.derivedForms![0]).toEqual({
      form: 'Faddist',
      partOfSpeech: 'noun',
      pronunciation: null,
    });
    expect(h.derivedForms![1]).toEqual({
      form: 'Faddish',
      partOfSpeech: 'adjective',
      pronunciation: null,
    });
  });
});

// ─── Adjective morphology (amorph) ─────────────────────

describe('parseEntry — adjective morphology', () => {
  test('extracts comparative and superlative forms', () => {
    const html =
      '<h2 class="hw">Able </h2>' +
      '<div class="pos">adjective </div>' +
      '<div class="amorph">[' +
      '<div class="pos">comparative </div><div class="adjf">Abler</div>; ' +
      '<div class="pos">superlative </div><div class="adjf">Ablest</div>.' +
      '] </div>' +
      '<div class="def">Having sufficient power.</div>';

    const entry = parseEntry('Able', html);
    const h = entry.homographs[0];
    expect(h.morphology).not.toBeNull();
    expect(h.morphology).toHaveLength(2);
    expect(h.morphology![0].label).toBe('comparative');
    expect(h.morphology![0].form).toBe('Abler');
    expect(h.morphology![1].label).toBe('superlative');
    expect(h.morphology![1].form).toBe('Ablest');
  });
});

// ─── Multi-headword (mhw) ──────────────────────────────

describe('parseEntry — multi-headword entries', () => {
  test('mhw extracts alternate headwords', () => {
    const html =
      '<div class="mhw">' +
      '<h2 class="hw">Aaronic </h2>, ' +
      '<h2 class="hw">Aaronical </h2>' +
      '</div>' +
      '<div class="pos">adjective </div>' +
      '<div class="def">Of or pertaining to Aaron.</div>';

    const entry = parseEntry('Aaronic', html);
    expect(entry.homographs).toHaveLength(1);
    const h = entry.homographs[0];
    expect(h.headword).toBe('Aaronic');
    expect(h.alternateHeadwords).toEqual(['Aaronical']);
    expect(h.senses[0].definition).toContain('pertaining to Aaron');
  });
});

// ─── Compound form improvements ─────────────────────────

describe('parseEntry — compound form content', () => {
  test('mcol preserves headwordHtml with connectors', () => {
    const html =
      '<h2 class="hw">Strength </h2>' +
      '<div class="def">A definition.</div>' +
      '<div class="cs">' +
      '<div class="mcol">' +
      '<div class="col"><b>On the strength of</b></div>, ' +
      '<i class="it">or </i>' +
      '<div class="col"><b>Upon the strength of</b></div>' +
      '</div>, ' +
      '<div class="cd">in reliance upon.</div>' +
      '</div>';

    const entry = parseEntry('Strength', html);
    const cf = entry.homographs[0].compoundForms[0];
    expect(cf.headwords).toEqual(['On the strength of', 'Upon the strength of']);
    expect(cf.headwordHtml).toContain('or');
    expect(cf.definition).toContain('reliance upon');
  });

  test('dash separators between compound forms are not captured as quotations', () => {
    const html =
      '<h2 class="hw">Visible </h2>' +
      '<div class="def">Perceivable by the eye.</div>' +
      '<div class="cs">' +
      '<div class="col"><b>Visible church </b></div>' +
      '<div class="fld">(Theol.)</div>, ' +
      '<div class="cd">the apparent church of Christ on earth. </div>' +
      '&#x2013; <div class="col"><b>Visible horizon</b></div>. ' +
      '<div class="cd">Same as Apparent horizon.</div>' +
      '</div>';

    const entry = parseEntry('Visible', html);
    const forms = entry.homographs[0].compoundForms;

    expect(forms).toHaveLength(2);
    expect(forms[0].headwords).toEqual(['Visible church']);
    expect(forms[0].field).toBe('(Theol.)');
    expect(forms[0].definition).toContain('apparent church');
    expect(forms[0].quotations).toHaveLength(0);
    expect(forms[1].headwords).toEqual(['Visible horizon']);
    expect(forms[1].field).toBeNull();
    expect(forms[1].definition).toContain('Apparent horizon');
  });

  test('compound form captures inline quotation and attribution', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">A definition.</div>' +
      '<div class="cs">' +
      '<div class="col"><b>Test phrase</b></div>, ' +
      '<div class="cd">the meaning. </div>' +
      '\u201CExample usage with <i class="xex">test </i>phrase.\u201D ' +
      '<div class="au">Author.</div>' +
      '</div>';

    const entry = parseEntry('Test', html);
    const cf = entry.homographs[0].compoundForms[0];
    expect(cf.definition).toContain('the meaning');
    expect(cf.quotations).toHaveLength(1);
    expect(cf.quotations[0].html).toContain('xex');
    expect(cf.quotations[0].author).toBe('Author');
  });
});

// ─── Catch-all fallback ─────────────────────────────────

describe('parseEntry — inline element fallback', () => {
  test('xex inline element preserved in definition', () => {
    const html =
      '<h2 class="hw">Strength </h2>' +
      '<div class="sn">3. </div>' +
      '<div class="def">Power of resisting attacks; impregnability. </div>' +
      '\u201COur castle\u2019s <i class="xex">strength </i>will laugh a siege to scorn.\u201D' +
      '<div class="rj"><div class="au">Shak.</div></div>';

    const entry = parseEntry('Strength', html);
    const def = entry.homographs[0].senses[0].definition;
    expect(def).toContain('xex');
    expect(def).toContain('strength');
    expect(def).toContain('castle\u2019s');
    expect(def).toContain('laugh a siege');
  });

  test('multiple inline elements between text nodes are preserved', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<div class="def">Base def. </div>' +
      'A <i class="it">special</i> <b>note</b> here.';

    const entry = parseEntry('Test', html);
    const def = entry.homographs[0].senses[0].definition;
    expect(def).toContain('special');
    expect(def).toContain('note');
    expect(def).toContain('here.');
  });

  test('no crash when unrecognized element precedes any sense', () => {
    const html =
      '<h2 class="hw">Test </h2>' +
      '<i class="xex">before-sense </i>' +
      '<div class="def">A definition.</div>';

    const entry = parseEntry('Test', html);
    expect(entry.homographs[0].senses[0].definition).toContain('A definition');
  });
});
