import { test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEntry } from './build-db';
import { readDictionarySource } from './dictionary-source';

const entities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function normalize(text: string): string {
  const plain = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&(\w+);/g, (entity, name: string) => entities[name] ?? entity);
  const words = plain
    .normalize('NFKD')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .match(/[\p{L}\p{N}]+/gu);
  return ` ${(words ?? []).join(' ')} `;
}

function textOf(node: unknown): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  if (node !== null && typeof node === 'object')
    return Object.entries(node)
      .filter(([key]) => !['id', 'kind', 'slug', 'key'].includes(key))
      .map(([, value]) => textOf(value))
      .join(' ');
  return '';
}

function atPointer(root: unknown, pointer: string): unknown {
  if (!pointer.startsWith('/')) return undefined;
  let node: unknown = root;
  for (const part of pointer.slice(1).split('/')) {
    const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
    if (Array.isArray(node)) {
      if (!/^(0|[1-9]\d*)$/.test(key)) return undefined;
      node = node[Number(key)];
    } else if (node !== null && typeof node === 'object' && key in node) {
      node = node[key];
    } else return undefined;
  }
  return node;
}

test('later-addition owner pointers contain their registered spans', () => {
  const source = readDictionarySource();
  const parsed = new Map<string, ReturnType<typeof parseEntry>>();
  const lines = readFileSync(
    join(import.meta.dir, '..', 'reports', 'dictionary-later-additions.jsonl'),
    'utf8'
  ).split('\n');
  const failures: string[] = [];

  for (const [index, line] of lines.entries()) {
    if (!line) continue;
    const row: unknown = JSON.parse(line);
    if (row === null || typeof row !== 'object' || !('scope' in row))
      throw new Error(`Invalid later-addition row at line ${index + 1}`);
    if (row.scope === 'entry') continue;
    if (
      row.scope !== 'span' ||
      !('key' in row) ||
      typeof row.key !== 'string' ||
      !('text' in row) ||
      typeof row.text !== 'string' ||
      !('owner' in row) ||
      (row.owner !== null && typeof row.owner !== 'string')
    )
      throw new Error(`Invalid later-addition span at line ${index + 1}`);
    if (row.owner === null) continue;

    let entry = parsed.get(row.key);
    if (!entry) {
      const html = source.get(row.key);
      if (html === undefined) {
        failures.push(`${row.key} line ${index + 1}: missing source entry`);
        continue;
      }
      entry = parseEntry(row.key, html);
      parsed.set(row.key, entry);
    }
    const owner = atPointer(entry, row.owner);
    const span = normalize(row.text);
    if (owner === undefined || !span.trim() || !normalize(textOf(owner)).includes(span))
      failures.push(
        `${row.key} line ${index + 1}: ${row.owner} does not contain ${JSON.stringify(row.text)}`
      );
  }

  if (failures.length)
    throw new Error(
      `${failures.length} invalid owner pointers:\n${failures.slice(0, 20).join('\n')}`
    );
});
