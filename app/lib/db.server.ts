import 'server-only';
import { join } from 'node:path';
import BetterSqlite3 from 'better-sqlite3';
import { normalizeLookup } from './lookup';
import { porterStem } from './stemmer';
import type { DictionaryEntry, SearchResult } from './types';

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

function parseEntryRow(row: { data: string } | undefined): DictionaryEntry | null {
  if (!row) return null;
  const entry: DictionaryEntry = JSON.parse(row.data);
  return entry;
}

function getEntry(word: string): DictionaryEntry | null {
  const row = getDb()
    .prepare<[string], { data: string }>(
      'SELECT entries.data FROM aliases JOIN entries ON entries.key = aliases.key WHERE aliases.normalized_key = ?'
    )
    .get(normalizeLookup(word));
  return parseEntryRow(row);
}

export function getEntryBySlug(slug: string): DictionaryEntry | null {
  const row = getDb()
    .prepare<[string], { data: string }>('SELECT data FROM entries WHERE slug = ?')
    .get(slug);
  return parseEntryRow(row);
}

export function searchEntries(prefix: string, limit = 20): Array<SearchResult> {
  return getDb()
    .prepare<[string, number], SearchResult>(
      `SELECT MIN(key) AS key,
              slug,
              json_extract(data, '$.homographs[0].partOfSpeech') AS partOfSpeech
       FROM entries
       WHERE normalized_key LIKE ?
       GROUP BY normalized_key
       ORDER BY normalized_key
       LIMIT ?`
    )
    .all(`${normalizeLookup(prefix)}%`, limit);
}

/**
 * Fuzzy entry lookup: exact match → Porter stem → common headword variations.
 * Used by the hover-link lookup to resolve inflected forms (plurals, tenses)
 * back to their dictionary headword.
 */
export function findClosestEntry(word: string): DictionaryEntry | null {
  const exact = getEntry(word);
  if (exact) return exact;

  const normalized = normalizeLookup(word);
  const stemmed = porterStem(normalized);
  if (stemmed === normalized) return null;

  const candidates = [
    stemmed,
    stemmed + 'e', // Porter strips silent -e (besiege → besieg, derive → deriv)
    ...(stemmed.endsWith('i') ? [stemmed.slice(0, -1) + 'y'] : []), // Porter converts -y → -i (fly → fli, apply → appli)
  ];

  for (const candidate of candidates) {
    const match = getEntry(candidate);
    if (match) return match;
  }

  return null;
}

export function getRandomEntry(): DictionaryEntry | null {
  const row = getDb()
    .prepare<[], { data: string }>('SELECT data FROM entries ORDER BY RANDOM() LIMIT 1')
    .get();
  return parseEntryRow(row);
}
