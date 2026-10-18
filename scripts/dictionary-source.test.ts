import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';

const source: unknown = JSON.parse(
  readFileSync(new URL('../src/dict.json', import.meta.url), 'utf8')
);

function entrySource(key: string): string {
  if (!source || typeof source !== 'object') throw new Error('Dictionary source is not an object');
  const html = Reflect.get(source, key);
  if (typeof html !== 'string') throw new Error(`Missing dictionary entry: ${key}`);
  return html;
}

describe('dictionary source restoration', () => {
  test.each([
    ['Carpenter', 'An artificer who works in timber'],
    ['Carping', 'Fault-finding; censorious caviling'],
    ['Genre', 'Kind; genus; class; form; style'],
    ['Hardened', 'Made hard, or harder, or compact'],
    ['Highway', 'A road or way open to the use of the public; a main road or thoroughfare'],
    ['Electricity', 'A power in nature, a manifestation of energy'],
  ])('%s retains its headword and original definition', (key, definition) => {
    const $ = cheerio.load(entrySource(key));
    expect($('h2.hw').length).toBeGreaterThan(0);
    expect($('.def').text()).toContain(definition);
  });

  test('keeps the retained compound forms after the recovered Carpenter definition', () => {
    const $ = cheerio.load(entrySource('Carpenter'));
    expect($('.cs .col').text()).toContain('Carpenter ant');
    expect($('.cs .col').text()).toContain('Carpenter bee');
    expect($('.usage').text()).toContain('the two trades are commonly united');
  });

  test('restores the Jewish calendar definition and tabular note', () => {
    const $ = cheerio.load(entrySource('Jewish calendar'));
    expect($('.def').text()).toContain('A lunisolar calendar');
    expect($('.note pre').text()).toContain('Tishri');
    expect($('.note pre').text()).toContain('5696');
    expect($('.note').text()).toContain('defective leap year');
  });

  test('recovers Laden grammatical metadata', () => {
    const $ = cheerio.load(entrySource('Laden'));
    expect($('.pos').first().text().trim()).toBe('participle and adjective');
    expect($('.def').text()).toContain('Loaded; freighted; burdened');
  });

  test('directs Abaca to the existing Manila hemp entry', () => {
    const $ = cheerio.load(entrySource('Abaca'));
    expect($('.er').text()).toBe('Manila hemp');
    expect(entrySource('Manila hemp')).toContain('Musa textilis');
  });

  test('restores the printed Greek word in the Aam etymology', () => {
    const $ = cheerio.load(entrySource('Aam'));
    expect($('.ety').text()).toContain('Gr. ἄμη');
    expect($('.ety').text()).not.toContain('�');
  });

  test('restores the Phoenician letter and article history in A', () => {
    const $ = cheerio.load(entrySource('A'));
    expect($('.def').first().text()).toContain('first letter (𐤀)');
    expect($('.note').text()).toContain('Formerly an was used');
  });

  test('restores Collyrium Greek and complete pronunciation fields', () => {
    const $ = cheerio.load(entrySource('Collyrium'));
    expect($('.ety').text()).toContain('κολλύριον');
    expect(
      $('.pr')
        .map((_, node) => $(node).text())
        .get()
    ).toEqual(['(kŏl-lĭr′ĭ-ŭm)', '(-ŭmz)', '(-ȧ)']);
  });

  test.each([
    'Aaronical',
    'Aback',
    'Abactinal',
    'Abaisance',
    'Abalienate',
    'Abalienation',
    'Abandonment',
    'Abasement',
  ])('%s retains reduced-vowel italic notation', (key) => {
    const $ = cheerio.load(entrySource(key));
    expect($('.pr i').text()).toMatch(/^[ae]$/);
  });
});

test.each([
  ['Abietine', 'A resinous substance obtained'],
  ['Ability', 'It always supposes something to be'],
  ['Abiogenist', 'independently of antecedent life'],
  ['Able', 'A manly man, to ben an abbot'],
  ['Abnormal', 'That abnormal and singular condition.'],
  ['Abolish', 'a power of attorney'],
])('%s retains the complete printed text', (key, phrase) => {
  expect(cheerio.load(entrySource(key)).text()).toContain(phrase);
});

test.each([
  ['Ablastemic', 'βλάστημα'],
  ['Ablepsy', 'ἀβλεψία'],
  ['Abnormal', 'ἀνώμαλος'],
])('%s retains its Greek etymon', (key, word) => {
  const $ = cheerio.load(entrySource(key));
  expect($('.ety .grk').text()).toContain(word);
  expect($('.ety').text()).not.toContain('�');
});

test('Ablation keeps consecutive senses and Ablative keeps its noun homograph', () => {
  const ablation = cheerio.load(entrySource('Ablation'));
  expect(
    ablation('.sn')
      .map((_, node) => ablation(node).text().trim())
      .get()
  ).toEqual(['1.', '2.', '3.']);
  const ablative = cheerio.load(entrySource('Ablative'));
  expect(ablative('.pos').last().text().trim()).toBe('noun');
});

test('keeps the Abominator definition and attribution separate from Abomination', () => {
  const $ = cheerio.load(entrySource('Abominator'));
  expect($('.hw').text()).toBe('A-bom′i-naˊtor');
  expect($('.pos').text().trim()).toBe('noun');
  expect($('.def').text().trim()).toBe('One who abominates.');
  expect($('.au').text()).toBe('Sir W. Scott.');
  expect(cheerio.load(entrySource('Abomination'))('.au').text()).not.toContain('Sir W. Scott.');
});
