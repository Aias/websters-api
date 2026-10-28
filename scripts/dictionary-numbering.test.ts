import { describe, expect, test } from 'bun:test';
import * as cheerio from 'cheerio';
import { readDictionarySource } from './dictionary-source';

const source = readDictionarySource();

function entrySource(key: string): cheerio.CheerioAPI {
  const html = source.get(key);
  if (html === undefined) throw new Error(`Missing dictionary entry: ${key}`);
  return cheerio.load(html);
}

describe('historical sense numbering', () => {
  test('retains all three A priori senses', () => {
    const $ = entrySource('A priori');
    expect(
      $('.sn')
        .map((_, element) => $(element).text().trim())
        .get()
    ).toEqual(['1.', '2.', '3.']);
    expect($('.def').eq(1).text()).toBe('Presumptive; presumptively; without examination.');
  });

  test.each(['Menu', 'Cocoanut', 'Starchy', 'Coverage'])(
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

  test('keeps the shell and toy labels under the Noah’s ark compound', () => {
    const $ = entrySource('Noah');
    expect(
      $('.cs .sd')
        .map((_, element) => $(element).text().trim())
        .get()
    ).toEqual(['(a)', '(b)']);
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
