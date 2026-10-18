import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseEntry } from '../../scripts/build-db';
import { EntryView } from './entry';

const source: unknown = JSON.parse(
  readFileSync(new URL('../../src/dict.json', import.meta.url), 'utf8')
);

function rendered(key: string) {
  if (!source || typeof source !== 'object') throw new Error('Invalid dictionary');
  const raw = Reflect.get(source, key);
  if (typeof raw !== 'string') throw new Error(`Missing entry: ${key}`);
  return cheerio.load(
    renderToStaticMarkup(createElement(EntryView, { entry: parseEntry(key, raw) }))
  );
}

test.each([
  ['Aback', 'To be taken aback.'],
  ['Abaft', 'Abaft the beam.'],
  ['Abacus', 'Abacus harmonicus (Mus.),'],
  ['Converging', 'Converging rays (Opt.),'],
  ['Coursey', '(Naut.) A space'],
  ['Crab', '(Naut.) To drift'],
])('%s preserves inline word and punctuation boundaries', (key, phrase) => {
  expect(rendered(key)('article').text().replace(/\s+/g, ' ')).toContain(phrase);
});

test('A per se keeps its etymology on the compound line', () => {
  const $ = rendered('A');
  const heading = $('strong')
    .filter((_, node) => $(node).text().trim() === 'A per se')
    .first();
  const compound = heading.parent();
  expect(compound.text().replace(/\s+/g, ' ')).toContain('A per se (L. per se by itself), one');
  expect(compound.children('div')).toHaveLength(0);
});

test('Abacus forms begin with the language qualifier', () => {
  const $ = rendered('Abacus');
  const forms = $('article section').first().children('div').first();
  expect(forms.text()).toMatch(/^E\. /);
});

test('Abandon renders its comparison without an isolated source separator', () => {
  const $ = rendered('Abandon');
  expect($('article span').filter((_, node) => $(node).text().trim() === '–')).toHaveLength(0);
  expect($('div.border-l-2').first().text()).toMatch(/^To Abandon/);
});
