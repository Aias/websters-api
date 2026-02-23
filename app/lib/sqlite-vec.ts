import { existsSync } from 'node:fs';
import { platform } from 'node:process';
import * as sqliteVec from 'sqlite-vec';

const SQLITE_PATH_CANDIDATES = {
  darwin: [
    '/opt/homebrew/opt/sqlite/lib/libsqlite3.dylib',
    '/usr/local/opt/sqlite/lib/libsqlite3.dylib',
  ],
  linux: ['/usr/lib/x86_64-linux-gnu/libsqlite3.so', '/usr/lib/aarch64-linux-gnu/libsqlite3.so'],
};

export interface SqliteExtensionDb {
  loadExtension(file: string, entrypoint?: string): void;
}

export function resolveCustomSqlitePath(): string | null {
  const envPath = process.env.SQLITE_DYLIB_PATH;
  if (envPath) {
    if (!existsSync(envPath)) {
      throw new Error(`SQLITE_DYLIB_PATH does not exist: ${envPath}`);
    }
    return envPath;
  }

  const candidates =
    platform === 'darwin'
      ? SQLITE_PATH_CANDIDATES.darwin
      : platform === 'linux'
        ? SQLITE_PATH_CANDIDATES.linux
        : null;

  if (!candidates) {
    return null;
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function configureCustomSqlite(setCustomSqlite: (path: string) => void): string | null {
  const path = resolveCustomSqlitePath();
  if (!path) {
    return null;
  }
  setCustomSqlite(path);
  return path;
}

export function loadSqliteVec(db: SqliteExtensionDb): void {
  sqliteVec.load(db);
}
