import { describe, expect, test } from 'bun:test';
import * as cheerio from 'cheerio';
import { readDictionarySource } from './dictionary-source';

const source = readDictionarySource();

function entrySource(key: string): string {
  const html = source.get(key);
  if (html === undefined) throw new Error(`Missing dictionary entry: ${key}`);
  return html;
}

describe('dictionary headword keys', () => {
  test.each([
    ['Advisable-ness', 'Advisableness', 'The quality of being advisable'],
    ['Aemail ombrant', 'Émail ombrant', 'An art or process of flooding'],
    ['AEsthetican', 'AEsthetician', 'One versed in æsthetics'],
    ['Aisless', 'Aisleless', 'Without an aisle'],
    ['Anemorphilous', 'Anemophilous', 'Fertilized by the agency of the wind'],
    ['Apprehensibiity', 'Apprehensibility', 'The quality of being apprehensible'],
    ["Alectryom'achy", 'Alectryomachy', 'Cockfighting'],
  ])('resolves %s through corrected key %s', (oldKey, key, definition) => {
    expect(source.has(oldKey)).toBe(false);
    const $ = cheerio.load(entrySource(key), { xml: false }, false);
    expect($('.def').first().text()).toContain(definition);
  });

  test.each([
    ['Argentamine', 'A solution of silver phosphate'],
    ['Azotine', 'An explosive consisting of sodium nitrate'],
    ['Bicarbureted', 'Containing two atoms or equivalents of carbon'],
    ['Apophasis', 'A figure by which a speaker formally declines'],
    ['Piperazine', 'A crystalline substance'],
    ['Pyrazine', 'A feebly basic solid'],
    ['Yakamik', 'See Trumpeter'],
    ['Yallah', 'The oil of the mahwa tree'],
    ['Zincographical', 'Of or pertaining to zincography'],
    ['Zoophorus', 'The part between the architrave and cornice'],
  ])('%s resolves to its complete source definition', (key, definition) => {
    const $ = cheerio.load(entrySource(key), { xml: false }, false);
    expect($('.def').first().text()).toContain(definition);
    expect($('h2.hw')).not.toHaveLength(0);
  });

  test.each([
    '-min',
    '-tin',
    '-retted',
    '-zin',
    'Arboraceous',
    '. . .',
    '‖Apophasis',
    'Yakamilk',
    'Yalah',
    'Zincongraphical',
    'Zoophorous',
  ])('%s is not a standalone dictionary key', (key) => {
    expect(() => entrySource(key)).toThrow(`Missing dictionary entry: ${key}`);
  });

  test('keeps Arbor Day with Arbor rather than an excluded neighboring entry', () => {
    const $ = cheerio.load(entrySource('Arbor'), { xml: false }, false);
    expect($('.cs .col').text()).toBe('Arbor Day');
    expect($('.cs .cd').text()).toContain('a day appointed for planting trees and shrubs');
  });

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
