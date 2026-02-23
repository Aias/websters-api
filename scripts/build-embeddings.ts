import { Database } from 'bun:sqlite';
import { join } from 'node:path';
import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL_ID,
  entryToEmbeddingText,
  vectorToSqlLiteral,
} from '../app/lib/embedding.ts';
import { configureCustomSqlite, loadSqliteVec } from '../app/lib/sqlite-vec.ts';
import type { DictionaryEntry } from '../app/lib/types.ts';

const ROOT = join(import.meta.dir, '..');
const DB_FILE = join(ROOT, 'app', 'data', 'dictionary.db');

const DEFAULT_BATCH_SIZE = 64;
const DEFAULT_PAUSE_MS = 25;
const DEFAULT_INTRA_THREADS = 2;
const DEFAULT_INTER_THREADS = 1;
const DEFAULT_LOG_EVERY = 10;
const PROGRESS_BAR_WIDTH = 28;

interface EntryRow {
  key: string;
  data: string;
}

interface EntryBatchItem {
  key: string;
  text: string;
}

interface EmbeddingInsert {
  key: string;
  embedding: string;
}

interface BuildConfig {
  limit: number | null;
  batchSize: number;
  pauseMs: number;
  intraThreads: number;
  interThreads: number;
  logEvery: number;
  rebuild: boolean;
}

function parsePositiveIntegerEnv(name: string): number | null {
  const raw = process.env[name];
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer. Received: ${raw}`);
  }

  return parsed;
}

function parseNonNegativeIntegerEnv(name: string): number | null {
  const raw = process.env[name];
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer. Received: ${raw}`);
  }

  return parsed;
}

function parseBooleanEnv(name: string): boolean {
  const raw = process.env[name];
  if (!raw) return false;
  return raw === '1' || raw.toLowerCase() === 'true';
}

function parseConfig(): BuildConfig {
  return {
    limit: parsePositiveIntegerEnv('EMBEDDING_LIMIT'),
    batchSize: parsePositiveIntegerEnv('EMBEDDING_BATCH_SIZE') ?? DEFAULT_BATCH_SIZE,
    pauseMs: parseNonNegativeIntegerEnv('EMBEDDING_PAUSE_MS') ?? DEFAULT_PAUSE_MS,
    intraThreads: parsePositiveIntegerEnv('EMBEDDING_INTRA_THREADS') ?? DEFAULT_INTRA_THREADS,
    interThreads: parsePositiveIntegerEnv('EMBEDDING_INTER_THREADS') ?? DEFAULT_INTER_THREADS,
    logEvery: parsePositiveIntegerEnv('EMBEDDING_LOG_EVERY') ?? DEFAULT_LOG_EVERY,
    rebuild: parseBooleanEnv('EMBEDDING_REBUILD'),
  };
}

function createVectorTable(db: Database): void {
  db.run(
    `CREATE VIRTUAL TABLE IF NOT EXISTS entry_vectors USING vec0(
      key TEXT PRIMARY KEY,
      embedding FLOAT[${EMBEDDING_DIMENSIONS}]
    )`
  );
}

function countRows(db: Database, table: 'entries' | 'entry_vectors'): number {
  const row = db.query<{ total: number }, []>(`SELECT COUNT(*) AS total FROM ${table}`).get();
  return row?.total ?? 0;
}

function countPendingRows(db: Database, limit: number | null): number {
  const row = db
    .query<{ total: number }, []>(
      `SELECT COUNT(*) AS total
       FROM entries e
       LEFT JOIN entry_vectors v ON v.key = e.key
       WHERE v.key IS NULL`
    )
    .get();
  const total = row?.total ?? 0;
  if (limit === null) {
    return total;
  }
  return Math.min(total, limit);
}

function getPendingEntryRows(db: Database, limit: number | null): Iterable<EntryRow> {
  if (limit) {
    return db
      .query<EntryRow, [number]>(
        `SELECT e.key, e.data
         FROM entries e
         LEFT JOIN entry_vectors v ON v.key = e.key
         WHERE v.key IS NULL
         ORDER BY e.normalized_key
         LIMIT ?`
      )
      .iterate(limit);
  }
  return db
    .query<EntryRow, []>(
      `SELECT e.key, e.data
       FROM entries e
       LEFT JOIN entry_vectors v ON v.key = e.key
       WHERE v.key IS NULL
       ORDER BY e.normalized_key`
    )
    .iterate();
}

function tensorToVectors(
  keys: ReadonlyArray<string>,
  data: ArrayLike<number | bigint>,
  dimensions: number
): ReadonlyArray<EmbeddingInsert> {
  if (dimensions !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Unexpected embedding dimensions: ${dimensions}. Expected: ${EMBEDDING_DIMENSIONS}`
    );
  }

  const inserts: EmbeddingInsert[] = [];
  for (let i = 0; i < keys.length; i++) {
    const start = i * dimensions;
    const values: number[] = [];
    for (let j = 0; j < dimensions; j++) {
      values.push(Number(data[start + j]));
    }
    inserts.push({ key: keys[i], embedding: vectorToSqlLiteral(values) });
  }
  return inserts;
}

async function embedBatch(
  extractor: FeatureExtractionPipeline,
  batch: ReadonlyArray<EntryBatchItem>
): Promise<ReadonlyArray<EmbeddingInsert>> {
  const output = await extractor(
    batch.map((item) => item.text),
    { pooling: 'mean', normalize: true }
  );

  const [rows, dimensions] = output.dims.length === 2 ? output.dims : [1, output.dims[0] ?? 0];
  if (rows !== batch.length) {
    throw new Error(`Embedding row count mismatch. Got ${rows}, expected ${batch.length}`);
  }

  return tensorToVectors(
    batch.map((item) => item.key),
    output.data,
    dimensions
  );
}

function parseEntryFromRow(row: EntryRow): DictionaryEntry {
  const parsed: DictionaryEntry = JSON.parse(row.data);
  return parsed;
}

function formatDuration(seconds: number): string {
  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function createProgressReporter(
  total: number,
  logEvery: number
): {
  render: (processed: number, lastChunkSize: number) => void;
  finish: (processed: number) => void;
} {
  const isInteractive = Boolean(process.stdout.isTTY);
  const startedAtMs = Date.now();
  let nextLogAt = logEvery;
  let lastRenderedLength = 0;

  function formatLine(processed: number): string {
    const safeTotal = total > 0 ? total : 1;
    const ratio = Math.min(Math.max(processed / safeTotal, 0), 1);
    const filled = Math.floor(ratio * PROGRESS_BAR_WIDTH);
    const bar = `${'='.repeat(filled)}${'.'.repeat(PROGRESS_BAR_WIDTH - filled)}`;
    const elapsedSeconds = Math.max((Date.now() - startedAtMs) / 1000, 0.001);
    const rate = processed / elapsedSeconds;
    const remaining = Math.max(total - processed, 0);
    const etaSeconds = rate > 0 ? remaining / rate : 0;
    return `[${bar}] ${(ratio * 100).toFixed(1)}% ${processed}/${total} ${rate.toFixed(1)}/s eta ${formatDuration(etaSeconds)}`;
  }

  return {
    render(processed: number, lastChunkSize: number): void {
      if (total < 1) {
        return;
      }

      if (isInteractive) {
        const line = formatLine(processed);
        const paddedLine = line.padEnd(lastRenderedLength, ' ');
        process.stdout.write(`\r${paddedLine}`);
        lastRenderedLength = paddedLine.length;
        return;
      }

      if (processed >= nextLogAt || processed >= total) {
        const percent = ((processed / total) * 100).toFixed(1);
        console.log(
          `Embedded ${processed}/${total} (${percent}%)... (last chunk: ${lastChunkSize})`
        );
        while (processed >= nextLogAt) {
          nextLogAt += logEvery;
        }
      }
    },
    finish(processed: number): void {
      if (total < 1) {
        return;
      }

      if (isInteractive) {
        const line = formatLine(processed);
        const paddedLine = line.padEnd(lastRenderedLength, ' ');
        process.stdout.write(`\r${paddedLine}\n`);
      }
    },
  };
}

async function main(): Promise<void> {
  const config = parseConfig();

  const configuredPath = configureCustomSqlite(Database.setCustomSQLite);
  if (configuredPath) {
    console.log(`Using custom SQLite: ${configuredPath}`);
  } else {
    console.log('Using Bun bundled SQLite');
  }

  if (config.limit) {
    console.log(`EMBEDDING_LIMIT is set: ${config.limit}`);
  }
  console.log(
    `Embedding config: batch=${config.batchSize}, pauseMs=${config.pauseMs}, intraThreads=${config.intraThreads}, interThreads=${config.interThreads}, logEvery=${config.logEvery}, rebuild=${config.rebuild}`
  );

  const db = new Database(DB_FILE);

  try {
    loadSqliteVec(db);
    if (config.rebuild) {
      db.run('DROP TABLE IF EXISTS entry_vectors');
    }
    createVectorTable(db);

    const insert = db.query('INSERT INTO entry_vectors (key, embedding) VALUES (?, ?)');
    const insertMany = db.transaction((rows: ReadonlyArray<EmbeddingInsert>) => {
      for (const row of rows) {
        insert.run(row.key, row.embedding);
      }
    });

    const totalEntries = countRows(db, 'entries');
    const alreadyEmbedded = countRows(db, 'entry_vectors');
    const pendingEntries = countPendingRows(db, config.limit);
    console.log(`Entries total: ${totalEntries}`);
    console.log(`Vectors already present: ${alreadyEmbedded}`);
    console.log(`Entries pending embeddings: ${pendingEntries}`);

    if (pendingEntries < 1) {
      console.log('No pending embeddings to generate.');
      return;
    }

    const extractor = await pipeline('feature-extraction', EMBEDDING_MODEL_ID, {
      session_options: {
        executionMode: 'sequential',
        interOpNumThreads: config.interThreads,
        intraOpNumThreads: config.intraThreads,
      },
    });

    try {
      let processed = 0;
      let batch: EntryBatchItem[] = [];
      const progressReporter = createProgressReporter(pendingEntries, config.logEvery);
      progressReporter.render(0, 0);

      for (const row of getPendingEntryRows(db, config.limit)) {
        const entry = parseEntryFromRow(row);
        batch.push({ key: row.key, text: entryToEmbeddingText(entry) });

        if (batch.length >= config.batchSize) {
          const chunkSize = batch.length;
          insertMany(await embedBatch(extractor, batch));
          processed += chunkSize;
          batch = [];
          progressReporter.render(processed, chunkSize);

          if (config.pauseMs > 0) {
            await Bun.sleep(config.pauseMs);
          }
        }
      }

      if (batch.length > 0) {
        const chunkSize = batch.length;
        insertMany(await embedBatch(extractor, batch));
        processed += chunkSize;
        progressReporter.render(processed, chunkSize);
      }

      progressReporter.finish(processed);

      console.log(`Embedding build complete. Inserted ${processed} new vectors.`);
      console.log(`Vectors total after build: ${countRows(db, 'entry_vectors')}`);
    } finally {
      await extractor.dispose();
    }
  } finally {
    db.close();
  }
}

if (import.meta.main) {
  await main();
}
