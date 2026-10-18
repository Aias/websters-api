import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { parseEntry } from './build-db.ts';

const source: unknown = JSON.parse(
  readFileSync(new URL('../src/dict.json', import.meta.url), 'utf8')
);

function entrySource(key: string): string {
  if (!source || typeof source !== 'object') throw new Error('Dictionary source is not an object');
  const html = Reflect.get(source, key);
  if (typeof html !== 'string') throw new Error(`Missing dictionary entry: ${key}`);
  return html;
}

describe('dictionary extraction recovery', () => {
  test.each([
    'Undoubtful',
    'Unheritable',
    'Unobjectionable',
    'Unzealous',
    'Unyielded',
    'Unyielding',
    'Unabolishable',
    'Undrainable',
    'Unhigh',
    'Unobnoxious',
    'Unabased',
    'Unaccommodating',
  ])('%s contains its own negative-prefix entry', (key) => {
    const entry = parseEntry(key, entrySource(key));
    expect(entry.homographs).toHaveLength(1);
    expect(entry.homographs[0]?.headword).toBe(key);
    expect(entry.homographs[0]?.senses).toHaveLength(1);
    expect(entry.homographs[0]?.senses[0]?.definition).toContain('See ');
    expect(entry.homographs[0]?.senses[0]?.note).toContain('/entry/Un-');
  });

  test('keeps the prefix explanation and example lists under Un-', () => {
    const html = entrySource('Un-');
    expect(html.match(/<h2\b/g)).toHaveLength(2);
    expect(html).toContain('To past particles');
    expect(html).toContain('To present participles');
    expect(html).toContain('Those which have acquired an opposed or contrary');
    expect(html).toContain('is prefixed to nouns to express the absence');
    expect(html).toContain('class="er">Unabolishable');
    expect(html).toContain('class="er">Unyielded');
    expect(html).toContain('class="er">Unyielding');
  });

  test('retains the distinct lexical definition for Unarmed', () => {
    expect(entrySource('Unarmed')).toContain('Not armed or armored');
  });

  test('keeps Rule verb definitions outside the noun compounds', () => {
    const entry = parseEntry('Rule', entrySource('Rule'));
    expect(entry.homographs.map((homograph) => homograph.partOfSpeech)).toEqual([
      'noun',
      'transitive verb',
      'intransitive verb',
    ]);
    expect(entry.homographs[0]?.synonyms).toContain('regulation');
    expect(entry.homographs[1]?.senses[0]?.definition).toContain('To control the will and actions');
    expect(entry.homographs[2]?.senses[0]?.definition).toContain('To have power or command');
  });

  test('places the swinging blow sense under Sidewinder, not Sidewise', () => {
    const sidewinder = parseEntry('Sidewinder', entrySource('Sidewinder'));
    const sidewise = parseEntry('Sidewise', entrySource('Sidewise'));
    expect(sidewinder.homographs[0]?.senses).toHaveLength(2);
    expect(sidewinder.homographs[0]?.senses[1]?.number).toBe('2.');
    expect(sidewinder.homographs[0]?.senses[1]?.definition).toContain('A heavy swinging blow');
    expect(sidewinder.homographs[0]?.senses[1]?.mark).toBe('[Slang.]');
    expect(sidewise.homographs[0]?.partOfSpeech).toBe('adverb');
    expect(sidewise.homographs[0]?.senses[0]?.number).toBeNull();
    expect(sidewise.homographs[0]?.senses[0]?.mark).toBeNull();
    expect(sidewise.homographs[0]?.senses[0]?.quotations[0]?.author).toBe('Emerson');
  });
});
