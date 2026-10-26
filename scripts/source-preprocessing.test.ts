import { expect, test } from 'bun:test';
import * as cheerio from 'cheerio';
import { parseEntry, preprocess } from './build-db';

test.each(['', '()', '( )'])('omits an empty tagged pronunciation: %s', (field) => {
  const raw = `<h2 class="hw">Example</h2><div class="pr">${field}</div>, <div class="pos">noun</div><div class="plu">pl. <div class="plw">Examples</div><div class="pr">${field}</div></div><div class="def">Literal () remains.</div>`;
  const entry = parseEntry('Example', raw);
  const $ = cheerio.load(preprocess(raw));
  expect($('.pr')).toHaveLength(0);
  expect($.text()).toContain('Example, noun');
  expect($.text()).toContain('pl. ExamplesLiteral () remains.');
  expect(entry.homographs[0].pronunciation).toBeNull();
  expect(entry.homographs[0].header).toEqual([
    { kind: 'headword', text: 'Example' },
    { kind: 'partOfSpeech', text: 'noun' },
  ]);
});
