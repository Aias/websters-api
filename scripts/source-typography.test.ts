import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { normalizeSourceTypography } from './source-typography.ts';

const source: unknown = JSON.parse(
  readFileSync(new URL('../src/dict.json', import.meta.url), 'utf8')
);

function sourceDocument(key: string): cheerio.CheerioAPI {
  if (!source || typeof source !== 'object') throw new Error('Dictionary source is not an object');
  const html = Reflect.get(source, key);
  if (typeof html !== 'string') throw new Error(`Missing dictionary entry: ${key}`);
  const $ = cheerio.load(
    html,
    { xml: { xmlMode: false, recognizeSelfClosing: true, encodeEntities: 'utf8' } },
    false
  );
  $('div').each((_, element) => {
    element.tagName = 'span';
  });
  normalizeSourceTypography($);
  return cheerio.load($.html());
}

describe('source typography', () => {
  test('subscripts chemical formula digits without changing text or existing superscripts', () => {
    const $ = cheerio.load(
      '<span class="chform">C6H5.NH.CO.CH3</span><span class="chform">NO3<sup>-</sup></span><span class="chform">H<sub>2</sub>O</span><span>Chapter 12</span>'
    );
    const before = $.text();
    normalizeSourceTypography($);
    normalizeSourceTypography($);
    expect($.text()).toBe(before);
    expect($('.chform').eq(0).html()).toBe('C<sub>6</sub>H<sub>5</sub>.NH.CO.CH<sub>3</sub>');
    expect($('.chform').eq(1).html()).toBe('NO<sub>3</sub><sup>-</sup>');
    expect($('.chform').eq(2).html()).toBe('H<sub>2</sub>O');
    expect($('sub sub')).toHaveLength(0);
    expect($('span').last().html()).toBe('Chapter 12');
  });

  test.each([
    ['Aard-wolf', 'wo͝olf'],
    ['Abb wool', 'wo͝ol'],
    ['Ado', 'do͞o′'],
  ])('%s places its double diacritic between the two vowels', (key, pronunciation) => {
    expect(sourceDocument(key)('.pr').first().text()).toContain(pronunciation);
  });

  test('writes Greek final sigma and iota subscripts without changing other text', () => {
    const $ = cheerio.load(
      '<span class="grk">ζῦθοσ ξιφοειδήσ σ ἀσ- ζῶ,ον ὠ,όν</span><span class="grk">α,</span><span class="ets">os, as</span>'
    );
    normalizeSourceTypography($);
    normalizeSourceTypography($);
    expect($('.grk').first().text()).toBe('ζῦθος ξιφοειδής σ ἀσ- ζῷον ᾠόν');
    expect($('.grk').last().text()).toBe('ᾳ');
    expect($('.ets').text()).toBe('os, as');
  });

  test.each([
    ['Zythum', 'ζῦθος'],
    ['Egg', 'ᾠόν'],
  ])('%s writes its Greek etymon as printed', (key, greek) => {
    expect(sourceDocument(key)('.grk').text().normalize('NFC')).toContain(greek.normalize('NFC'));
  });

  test('leaves correctly encoded double and single diacritics unchanged', () => {
    const text = 'o͝o o͞o ō ŏ';
    const $ = cheerio.load(`<span class="pr">${text}</span>`);
    normalizeSourceTypography($);
    normalizeSourceTypography($);
    expect($('.pr').text()).toBe(text);
  });

  test('preserves explicit calendar cells and spanning headers in native tables', () => {
    const $ = sourceDocument('Perpetual calendar');
    const calendar = $('table.table');
    expect(calendar.find('caption').text()).toBe('PERPETUAL CALENDAR');
    expect(calendar.find('tr')).toHaveLength(8);
    expect(calendar.find('th').first().attr('colspan')).toBe('5');
    expect(calendar.find('tr').eq(4).children('td').eq(4).text()).toBe('\u00a0');
    calendar
      .find('tr')
      .slice(1)
      .each((_, row) => {
        expect($(row).children('td')).toHaveLength(13);
      });
    expect($('table.mtable tr td')).toHaveLength(2);
    expect($('table.mtable pre').text()).toContain('1753');
  });

  test('preserves empty legislative cells and keeps malformed rows unassigned', () => {
    const $ = sourceDocument('Legislature');
    expect($('table')).toHaveLength(1);
    expect($('th[colspan="2"]')).toHaveLength(2);
    const austria = $('tr').filter((_, row) => $(row).text().startsWith('Austria'));
    expect(austria.children('td')).toHaveLength(6);
    expect(austria.children('td').eq(2).text()).toBe('');
    const prussia = $('tr').filter((_, row) => $(row).text().startsWith('Prussia'));
    expect(prussia.children('td')).toHaveLength(1);
    expect(prussia.children('td').attr('colspan')).toBe('6');
    expect(prussia.text()).toContain('Landtag Herrenhaus');
    expect(prussia.text()).toContain('Abgeordnetenhaus');
  });

  test.each(['Hindu calendar', 'Periodical', 'Solar'])('%s does not invent table cells', (key) => {
    const $ = sourceDocument(key);
    expect($('table, td, th')).toHaveLength(0);
    expect($('pre.table').length).toBeGreaterThan(0);
  });

  test('retains existing Jewish calendar whitespace and line breaks', () => {
    const $ = sourceDocument('Jewish calendar');
    expect($('table')).toHaveLength(0);
    expect($('pre').text()).toContain('\n 1 Tishri');
    expect($('pre').text()).toContain('5661');
    expect($('pre').text()).toContain('5696');
  });

  test('preserves row boundaries when cell boundaries are unavailable', () => {
    const $ = sourceDocument('Law');
    expect($('pre.table .row')).toHaveLength(6);
    expect($('pre.table').text()).toContain('Nep. \n');
    expect($('td')).toHaveLength(0);
  });

  test('does not interpret transliteration markers as table rows', () => {
    const $ = sourceDocument('Kimono');
    expect($('.tr').length).toBeGreaterThan(0);
    expect($('tr')).toHaveLength(0);
  });

  test('renders marked powers and charges as superscripts', () => {
    const $ = sourceDocument('Ion');
    expect($('sup.exp').text().trim()).toBe('-10');
    expect(
      $('sup.sups')
        .map((_, element) => $(element).text())
        .get()
    ).toContain('+++');
    expect($('.sn').last().text().trim()).toBe('2.');
  });

  test('renders explicitly marked subscripts', () => {
    const $ = sourceDocument('Subscript');
    expect($('sub.subs').length).toBeGreaterThan(0);
  });
});
