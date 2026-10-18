import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const SOURCE_FILE = join(import.meta.dir, '..', 'src', 'dict.jsonl');
const AUTHOR_NAMES_FILE = join(import.meta.dir, '..', 'app', 'lib', 'author-names.json');

function isEntry(value: unknown): value is { key: string; html: string } {
  return (
    value !== null &&
    typeof value === 'object' &&
    'key' in value &&
    'html' in value &&
    typeof value.key === 'string' &&
    typeof value.html === 'string'
  );
}

export function readDictionarySource(): Map<string, string> {
  const source = new Map<string, string>();
  for (const line of readFileSync(SOURCE_FILE, 'utf8').split('\n')) {
    if (!line) continue;
    const entry: unknown = JSON.parse(line);
    if (!isEntry(entry)) throw new Error(`Invalid dictionary line: ${line.slice(0, 80)}`);
    if (source.has(entry.key)) throw new Error(`Duplicate dictionary key: ${entry.key}`);
    source.set(entry.key, entry.html);
  }
  return source;
}

export function serializeDictionarySource(source: ReadonlyMap<string, string>): string {
  return [...source.keys()]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((key) => `${JSON.stringify({ key, html: source.get(key) })}\n`)
    .join('');
}

export function writeDictionarySource(source: ReadonlyMap<string, string>): void {
  writeFileSync(SOURCE_FILE, serializeDictionarySource(source));
}

export function sourceFingerprint(): { size: number; mtimeMs: number } {
  const stats = [SOURCE_FILE, AUTHOR_NAMES_FILE].map((file) => statSync(file));
  return {
    size: stats.reduce((total, stat) => total + stat.size, 0),
    mtimeMs: Math.max(...stats.map((stat) => stat.mtimeMs)),
  };
}
