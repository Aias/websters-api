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

describe('dictionary headword keys', () => {
  test.each([
    ['Argentamine', 'A solution of silver phosphate'],
    ['Azotine', 'An explosive consisting of sodium nitrate'],
    ['Bicarbureted', 'Containing two atoms or equivalents of carbon'],
    ['Apophasis', 'A figure by which a speaker formally declines'],
    ['Piperazine', 'A crystalline substance'],
    ['Pyrazine', 'A feebly basic solid'],
  ])('%s resolves to its complete source definition', (key, definition) => {
    const $ = cheerio.load(entrySource(key), { xml: false }, false);
    expect($('.def').first().text()).toContain(definition);
    expect($('h2.hw')).not.toHaveLength(0);
  });

  test.each(['-min', '-tin', '-retted', '-zin', '. . .', '‖Apophasis'])(
    '%s is not a standalone dictionary key',
    (key) => {
      expect(() => entrySource(key)).toThrow(`Missing dictionary entry: ${key}`);
    }
  );

  test('keeps Piperazine and Pyrazine in separate source entries', () => {
    const piperazine = cheerio.load(entrySource('Piperazine'), { xml: false }, false);
    const pyrazine = cheerio.load(entrySource('Pyrazine'), { xml: false }, false);
    expect(piperazine('.mhw')).toHaveLength(1);
    expect(pyrazine('.mhw')).toHaveLength(1);
    expect(piperazine('.chform').text()).toBe('(C2H4NH)2');
    expect(pyrazine('.chform').text()).toBe('C4H4N2');
    expect(piperazine('h2.hw').last().text().trim()).toBe('-zin');
    expect(pyrazine('h2.hw').last().text().trim()).toBe('-zin');
  });

  test('keeps both Vocabulary senses with the Macaulay quotation', () => {
    const $ = cheerio.load(entrySource('Vocabulary'), { xml: false }, false);
    expect($('h2.hw')).toHaveLength(1);
    expect(
      $('.sn')
        .map((_, node) => $(node).text().trim())
        .get()
    ).toEqual(['1.', '2.']);
    expect($('.def').eq(1).text()).toBe('A sum or stock of words employed.');
    expect($('.q').text()).toContain('His vocabulary seems to have been no larger');
    expect($('.qau').text()).toBe('Macaulay.');
  });
});
