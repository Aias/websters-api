import { describe, expect, test } from 'bun:test';
import { parseEntry } from './build-db';
import { renderDictionaryEntry } from './build-macos-dictionary';

const entriesBySlug = new Map([
  ['cafe', 'e1'],
  ['plain', 'e2'],
]);

function render(html: string): string {
  return renderDictionaryEntry(
    parseEntry('Café', html),
    ['cafe', 'Coffee & tea'],
    'e1',
    entriesBySlug
  );
}

describe('macOS dictionary source', () => {
  test('reflects changes to the parsed source definition', () => {
    const source = '<h2 class="hw">Café</h2><div class="def">A small café.</div>';
    expect(render(source)).toContain('A small caf&#xe9;.');
    expect(render(source.replace('small', 'quiet'))).toContain('A quiet caf&#xe9;.');
  });

  test('escapes special characters and indexes aliases', () => {
    const xml = render('<h2 class="hw">Café</h2><div class="def">Coffee &amp; tea &lt;3</div>');
    expect(xml).toContain('d:value="Coffee &amp; tea" d:title="Café"');
    expect(xml).toContain('Coffee &amp; tea &lt;3');
    expect(xml).toContain('d:title="Café"');
    expect(xml).toContain('<div class="header"><h2 class="headword">Café</h2>');
  });

  test('uses a block wrapper for tables', () => {
    const xml = render(
      '<h2 class="hw">Café</h2><div class="def"><table><tr><td>One</td></tr></table></div>'
    );
    expect(xml).toContain('<div class="definition"><table>');
    expect(xml).not.toContain('<span class="definition"><table>');
  });

  test('lifts spans that contain block elements', () => {
    const xml = renderDictionaryEntry(
      {
        key: 'Café',
        slug: 'cafe',
        homographs: [
          {
            headword: 'Café',
            alternateHeadwords: [],
            pronunciation: null,
            partOfSpeech: null,
            header: [{ kind: 'headword', text: 'Café' }],
            content: [
              { kind: 'definition', html: '<span class="matrix"><div class="row">1</div></span>' },
            ],
          },
        ],
      },
      [],
      'e1',
      entriesBySlug
    );
    expect(xml).toContain('<div class="matrix"><div class="row">1</div></div>');
    expect(xml).not.toContain('<span class="matrix"><div');
  });

  test('joins a compound headword to following punctuation', () => {
    const xml = renderDictionaryEntry(
      {
        key: 'Café',
        slug: 'cafe',
        homographs: [
          {
            headword: 'Café',
            alternateHeadwords: [],
            pronunciation: null,
            partOfSpeech: null,
            header: [{ kind: 'headword', text: 'Café' }],
            content: [
              {
                kind: 'compound',
                headwords: ['Café noir'],
                headwordHtml: 'Café noir',
                content: [
                  { kind: 'text', html: ', ' },
                  { kind: 'definition', html: 'black coffee.' },
                ],
              },
            ],
          },
        ],
      },
      [],
      'e1',
      entriesBySlug
    );
    expect(xml).toContain('<strong>Caf&#xe9; noir</strong><span class="text">, </span>');
  });

  test('sets a quotation apart with each author on a line', () => {
    const xml = renderDictionaryEntry(
      {
        key: 'Café',
        slug: 'cafe',
        homographs: [
          {
            headword: 'Café',
            alternateHeadwords: [],
            pronunciation: null,
            partOfSpeech: null,
            header: [{ kind: 'headword', text: 'Café' }],
            content: [
              {
                kind: 'sense',
                number: '1.',
                content: [
                  { kind: 'quotation', html: 'A quiet café.', authors: ['Pope.', 'Shak.'] },
                ],
              },
            ],
          },
        ],
      },
      [],
      'e1',
      entriesBySlug
    );
    expect(xml).toContain(
      '<strong>1.</strong> <div><blockquote class="q">A quiet caf&#xe9;. <span class="quotation-author">— Pope.</span> <span class="quotation-author">— Shak.</span></blockquote></div>'
    );
  });

  test('preserves MathML namespace', () => {
    const xml = renderDictionaryEntry(
      {
        key: 'Café',
        slug: 'cafe',
        homographs: [
          {
            headword: 'Café',
            alternateHeadwords: [],
            pronunciation: null,
            partOfSpeech: null,
            header: [{ kind: 'headword', text: 'Café' }],
            content: [{ kind: 'definition', html: '<math><mrow><mi>x</mi></mrow></math>' }],
          },
        ],
      },
      [],
      'e1',
      entriesBySlug
    );
    expect(xml).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML">');
  });

  test('links a sense reference to its entry', () => {
    const xml = renderDictionaryEntry(
      parseEntry(
        'Café',
        '<h2 class="hw">Café</h2><div class="def"><a href="/entry/plain#2">Plain</a></div>'
      ),
      [],
      'e1',
      entriesBySlug
    );
    expect(xml).toContain('x-dictionary:r:e2:org.websters1913.dictionary');
    expect(xml).not.toContain('x-dictionary:r:e2-');
  });

  test('rewrites cross-references to native Dictionary links', () => {
    const xml = render(
      '<h2 class="hw">Café</h2><div class="def">See <div class="er">Plain</div>.</div>'
    );
    expect(xml).toContain('x-dictionary:r:e2:org.websters1913.dictionary');
    expect(xml).not.toContain('/entry/plain');
  });
});
