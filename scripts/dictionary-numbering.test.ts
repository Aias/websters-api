import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';

const source: unknown = JSON.parse(
  readFileSync(new URL('../src/dict.json', import.meta.url), 'utf8')
);

function entrySource(key: string): cheerio.CheerioAPI {
  if (!source || typeof source !== 'object') throw new Error('Dictionary source is not an object');
  const html = Reflect.get(source, key);
  if (typeof html !== 'string') throw new Error(`Missing dictionary entry: ${key}`);
  return cheerio.load(html);
}

describe('historical sense numbering', () => {
  test.each(['Menu', 'Cocoanut', 'Flying fox', 'Starchy', 'Coverage'])(
    '%s keeps its original unnumbered definitions',
    (key) => {
      const $ = entrySource(key);
      expect($('.sn')).toHaveLength(0);
      expect($('.def').length).toBeGreaterThan(0);
    }
  );

  test('uses Parameter original mathematics and crystallography sense numbers', () => {
    const $ = entrySource('Parameter');
    expect(
      $('.sn')
        .map((_, element) => $(element).text().trim())
        .get()
    ).toEqual(['1.', '2.']);
  });

  test('keeps the shell and toy labels under Noah’s ark', () => {
    const $ = entrySource("Noah's ark");
    expect(
      $('.sd')
        .map((_, element) => $(element).text().trim())
        .get()
    ).toEqual(['(a)', '(b)']);
    expect($('.pos').text()).not.toContain('proper noun');
  });

  test('restores Mannite original first sense without renumbering the second', () => {
    const $ = entrySource('Mannite');
    expect(
      $('.sn')
        .map((_, element) => $(element).text().trim())
        .get()
    ).toEqual(['1.', '2.']);
    expect($('.def').first().text()).toContain('Fraxinus ornus');
    expect($('.def').last().text()).toContain('efflorescence');
  });

  test('restores both original lettered Moor fowl meanings', () => {
    const $ = entrySource('Moor fowl');
    expect(
      $('.sd')
        .map((_, element) => $(element).text().trim())
        .get()
    ).toEqual(['(a)', '(b)']);
    expect($('.def').first().text()).toContain('European ptarmigan');
    expect($('.def').last().text()).toContain('European heath grouse');
  });
});
