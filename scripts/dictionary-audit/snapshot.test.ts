import { expect, spyOn, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compareSnapshotFiles, writeSnapshot } from './snapshot';

test('snapshot binds frozen bytes and refuses a false complete comparison', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dictionary-snapshot-'));
  try {
    const source = join(directory, 'source.jsonl');
    const output = join(directory, 'snapshot.jsonl');
    const bytes = Buffer.from(
      `${JSON.stringify({ key: 'Example', html: '<h2 class="hw">Example</h2><div class="def">text</div>' })}\n`
    );
    await writeFile(source, bytes);
    const header = writeSnapshot(output, source);
    expect(header.sourceSha256).toBe(createHash('sha256').update(bytes).digest('hex'));
    const truncated = join(directory, 'truncated.jsonl');
    const rows = (await readFile(output, 'utf8')).trimEnd().split('\n');
    await writeFile(
      truncated,
      `${JSON.stringify({ ...header, sourceEntries: 2 })}\n${rows[1]}\n${rows[2]}\n`
    );
    await expect(compareSnapshotFiles(truncated, truncated)).rejects.toThrow('entry count');
  } finally {
    await rm(directory, { recursive: true });
  }
});

test('lookup-only compares source-changed snapshots without lexical attribution', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dictionary-lookup-'));
  const log = spyOn(console, 'log').mockImplementation(() => {});
  try {
    const oldSource = join(directory, 'old-source.jsonl');
    const newSource = join(directory, 'new-source.jsonl');
    const oldSnapshot = join(directory, 'old.jsonl');
    const newSnapshot = join(directory, 'new.jsonl');
    await writeFile(
      oldSource,
      `${JSON.stringify({ key: 'A', html: '<h2 class="hw">Shared</h2>' })}\n`
    );
    await writeFile(
      newSource,
      `${JSON.stringify({ key: 'A', html: '<h2 class="hw">Renamed</h2>' })}\n`
    );
    writeSnapshot(oldSnapshot, oldSource);
    writeSnapshot(newSnapshot, newSource);
    await compareSnapshotFiles(oldSnapshot, newSnapshot, true);
    expect(log.mock.calls.some(([line]) => String(line).includes('"sourceChanged":true'))).toBe(
      true
    );
    expect(log.mock.calls.some(([line]) => String(line).includes('entryDifference'))).toBe(false);
  } finally {
    log.mockRestore();
    await rm(directory, { recursive: true });
  }
});
