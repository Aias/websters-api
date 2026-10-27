import 'server-only';
import { join } from 'node:path';
import BetterSqlite3 from 'better-sqlite3';
import { normalizeLookup, rankHeadwords } from './lookup';
import { porterStem } from './stemmer';
import type { Author, DictionaryEntry, Quotation, QuotedWord, SearchResult } from './types';

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
  const query = getDb().prepare<[string], { data: string }>(
    'SELECT entries.data FROM aliases JOIN entries ON entries.key = aliases.key WHERE aliases.normalized_key = ?'
  );
  const normalized = normalizeLookup(word);
  const withoutDiaeresis = normalized
    .normalize('NFD')
    .replace(/\u0308/g, '')
    .normalize('NFC');
  return parseEntryRow(query.get(normalized) ?? query.get(withoutDiaeresis));
}

export function getEntryBySlug(slug: string): DictionaryEntry | null {
  const row = getDb()
    .prepare<[string], { data: string }>('SELECT data FROM entries WHERE slug = ?')
    .get(slug);
  return parseEntryRow(row) ?? getEntry(slug.replace(/_/g, ' '));
}

let headwords: Array<string> | null = null;

export function searchEntries(query: string, limit = 20): Array<SearchResult> {
  headwords ??= getDb()
    .prepare<[], { normalized_key: string }>('SELECT normalized_key FROM entries')
    .all()
    .map((row) => row.normalized_key);
  return getDb()
    .prepare<[string], SearchResult>(
      `SELECT entries.key,
              entries.slug,
              json_extract(entries.data, '$.homographs[0].partOfSpeech') AS partOfSpeech
       FROM json_each(?) AS ranked
       JOIN entries ON entries.normalized_key = ranked.value
       ORDER BY ranked.key`
    )
    .all(JSON.stringify(rankHeadwords(normalizeLookup(query), headwords, limit)));
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

const SELECT_AUTHORS = 'SELECT slug, name, quotation_count AS quotationCount FROM authors';

export function getAuthors(): Array<Author> {
  return getDb().prepare<[], Author>(`${SELECT_AUTHORS} ORDER BY quotation_count DESC, name`).all();
}

export function getAuthor(slug: string): Author | null {
  return getDb().prepare<[string], Author>(`${SELECT_AUTHORS} WHERE slug = ?`).get(slug) ?? null;
}

export function getCitedForm(authorSlug: string): string | null {
  return (
    getDb()
      .prepare<[string], { cited: string }>(
        'SELECT cited FROM quotations WHERE author_slug = ? GROUP BY cited ORDER BY COUNT(*) DESC, cited LIMIT 1'
      )
      .get(authorSlug)?.cited ?? null
  );
}

export function getQuotedWords(authorSlug: string): Array<QuotedWord> {
  const rows = getDb()
    .prepare<[string], { key: string; slug: string; html: string; citation: string | null }>(
      `SELECT entries.key, entries.slug, quotations.html, quotations.citation
       FROM quotations JOIN entries ON entries.key = quotations.key
       WHERE quotations.author_slug = ?
       ORDER BY entries.normalized_key, quotations.rowid`
    )
    .all(authorSlug);
  const words = new Map<string, { key: string; slug: string; quotations: Array<Quotation> }>();
  for (const { key, slug, html, citation } of rows) {
    const word = words.get(key) ?? { key, slug, quotations: [] };
    word.quotations.push({ kind: 'quotation', html, authors: citation ? [citation] : [] });
    words.set(key, word);
  }
  return [...words.values()];
}
