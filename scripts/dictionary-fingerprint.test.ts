import { expect, test } from 'bun:test';
import { mkdtempSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sourceFingerprint } from './dictionary-source';

test('fingerprint changes for same-size source edits with unchanged timestamps', () => {
  const directory = mkdtempSync(join(tmpdir(), 'webster-fingerprint-'));
  try {
    const source = join(directory, 'source.jsonl');
    writeFileSync(source, 'word');
    const { atime, mtime } = statSync(source);
    const first = sourceFingerprint([source]);
    writeFileSync(source, 'ward');
    utimesSync(source, atime, mtime);
    expect(sourceFingerprint([source])).not.toBe(first);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
