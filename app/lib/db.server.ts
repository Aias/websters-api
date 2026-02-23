import 'server-only';
import { join } from 'node:path';
import BetterSqlite3 from 'better-sqlite3';
import type { DictionaryEntry } from './types';

// Next route/page code runs in the Node runtime; Bun's SQLite API is still used in scripts/build-db.ts.
const DB_PATH = join(process.cwd(), 'app', 'data', 'dictionary.db');

let db: BetterSqlite3.Database | null = null;

function getDb(): BetterSqlite3.Database {
  if (!db) {
    db = new BetterSqlite3(DB_PATH, { readonly: true });
    db.pragma('cache_size = -64000');
  }
  return db;
}

export function getEntry(word: string): DictionaryEntry | null {
  const normalizedWord = word.normalize('NFC').toLowerCase().trim();

  const row = getDb()
    .prepare<[string], { data: string }>(
      'SELECT data FROM entries WHERE normalized_key = ? ORDER BY key COLLATE NOCASE LIMIT 1'
    )
    .get(normalizedWord);

  if (!row) return null;
  const entry: DictionaryEntry = JSON.parse(row.data);
  return entry;
}

export function searchEntries(prefix: string, limit = 20): Array<{ key: string }> {
  return getDb()
    .prepare<[string, number], { key: string }>(
      `SELECT MIN(key) AS key
       FROM entries
       WHERE normalized_key LIKE ?
       GROUP BY normalized_key
       ORDER BY normalized_key
       LIMIT ?`
    )
    .all(`${prefix.normalize('NFC').toLowerCase().trim()}%`, limit);
}

export function getRandomEntry(): DictionaryEntry | null {
  const row = getDb()
    .prepare<[], { data: string }>('SELECT data FROM entries ORDER BY RANDOM() LIMIT 1')
    .get();

  if (!row) return null;
  const entry: DictionaryEntry = JSON.parse(row.data);
  return entry;
}
