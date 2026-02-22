import BetterSqlite3 from 'better-sqlite3';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DictionaryEntry } from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../data/dictionary.db');

let db: BetterSqlite3.Database | null = null;

function getDb(): BetterSqlite3.Database {
	if (!db) {
		db = new BetterSqlite3(DB_PATH, { readonly: true });
		db.pragma('cache_size = -64000');
	}
	return db;
}

export function getEntry(word: string): DictionaryEntry | null {
	const row = getDb()
		.prepare('SELECT data FROM entries WHERE normalized_key = ?')
		.get(word.toLowerCase().trim()) as { data: string } | undefined;
	if (!row) return null;
	return JSON.parse(row.data);
}

export function searchEntries(prefix: string, limit = 20): Array<{ key: string }> {
	return getDb()
		.prepare('SELECT key FROM entries WHERE normalized_key LIKE ? ORDER BY normalized_key LIMIT ?')
		.all(`${prefix.toLowerCase().trim()}%`, limit) as Array<{ key: string }>;
}

export function getRandomEntry(): DictionaryEntry | null {
	const row = getDb()
		.prepare('SELECT data FROM entries ORDER BY RANDOM() LIMIT 1')
		.get() as { data: string } | undefined;
	if (!row) return null;
	return JSON.parse(row.data);
}
