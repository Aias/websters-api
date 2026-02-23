import 'server-only';
import { join } from 'node:path';
import type { FeatureExtractionPipeline } from '@huggingface/transformers';
import BetterSqlite3 from 'better-sqlite3';
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL_ID,
  entryToEmbeddingText,
  queryToEmbeddingText,
  vectorToSqlLiteral,
} from './embedding';
import { loadSqliteVec } from './sqlite-vec';
import type { DictionaryEntry } from './types';

// Next route/page code runs in the Node runtime; Bun's SQLite API is still used in scripts/build-db.ts.
const DB_PATH = join(process.cwd(), 'app', 'data', 'dictionary.db');
const SIMILAR_SEARCH_BUFFER = 8;

let db: BetterSqlite3.Database | null = null;
let vectorSearchReady: boolean | null = null;
let featureExtractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getDb(): BetterSqlite3.Database {
  if (!db) {
    db = new BetterSqlite3(DB_PATH, { readonly: true });
    db.pragma('cache_size = -64000');
    initializeVectorSearch(db);
  }
  return db;
}

function initializeVectorSearch(database: BetterSqlite3.Database): void {
  if (vectorSearchReady !== null) {
    return;
  }

  try {
    loadSqliteVec(database);
    vectorSearchReady = true;
  } catch (error) {
    vectorSearchReady = false;
    console.warn('Vector search disabled: sqlite-vec extension failed to load.', error);
  }
}

function hasVectorTable(database: BetterSqlite3.Database): boolean {
  const row = database
    .prepare<[], { has_table: number }>(
      "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'entry_vectors') AS has_table"
    )
    .get();
  return row?.has_table === 1;
}

function canUseVectorSearch(database: BetterSqlite3.Database): boolean {
  return vectorSearchReady === true && hasVectorTable(database);
}

async function getFeatureExtractor(): Promise<FeatureExtractionPipeline> {
  if (!featureExtractorPromise) {
    featureExtractorPromise = import('@huggingface/transformers').then(({ pipeline }) =>
      pipeline<'feature-extraction'>('feature-extraction', EMBEDDING_MODEL_ID)
    );
  }

  try {
    return await featureExtractorPromise;
  } catch (error) {
    featureExtractorPromise = null;
    throw error;
  }
}

async function embedText(text: string): Promise<ReadonlyArray<number>> {
  const extractor = await getFeatureExtractor();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  const dimensions = output.dims.length === 2 ? (output.dims[1] ?? 0) : (output.dims[0] ?? 0);
  if (dimensions !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Unexpected embedding dimensions: ${dimensions}. Expected: ${EMBEDDING_DIMENSIONS}`
    );
  }

  const values: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    values.push(Number(output.data[i]));
  }
  return values;
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

export async function semanticSearch(
  query: string,
  limit = 20
): Promise<Array<{ key: string; distance: number }>> {
  const normalizedQuery = queryToEmbeddingText(query);
  if (!normalizedQuery || limit < 1) {
    return [];
  }

  const database = getDb();
  if (!canUseVectorSearch(database)) {
    return [];
  }

  try {
    const vector = await embedText(normalizedQuery);
    return database
      .prepare<[string, number], { key: string; distance: number }>(
        `SELECT key, distance
         FROM entry_vectors
         WHERE embedding MATCH ? AND k = ?
         ORDER BY distance`
      )
      .all(vectorToSqlLiteral(vector), limit);
  } catch (error) {
    console.warn('Vector semantic search failed. Returning no semantic results.', error);
    return [];
  }
}

export async function getSimilarEntries(
  entry: DictionaryEntry,
  limit = 6
): Promise<Array<{ key: string; distance: number }>> {
  if (limit < 1) {
    return [];
  }

  const database = getDb();
  if (!canUseVectorSearch(database)) {
    return [];
  }

  try {
    const vector = await embedText(entryToEmbeddingText(entry));
    const rows = database
      .prepare<[string, number, string], { key: string; distance: number }>(
        `SELECT key, distance
         FROM entry_vectors
         WHERE embedding MATCH ? AND k = ? AND key <> ?
         ORDER BY distance`
      )
      .all(vectorToSqlLiteral(vector), limit + SIMILAR_SEARCH_BUFFER, entry.key);

    return rows.slice(0, limit);
  } catch (error) {
    console.warn('Similar entries lookup failed. Returning no similar entries.', error);
    return [];
  }
}
