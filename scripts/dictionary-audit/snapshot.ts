import { createHash } from 'node:crypto';
import { closeSync, openSync, readFileSync, writeSync } from 'node:fs';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { SOURCE_FILE } from '../dictionary-source';
import { createEntryReferences } from '../entry-references';
import {
  compareEntry,
  compareLookup,
  snapshotEntry,
  snapshotLookup,
  type EntrySnapshot,
  type LookupSnapshot,
  type TextCandidate,
} from './conservation';

interface Header {
  type: 'header';
  version: 1;
  sourceSha256: string;
  sourceEntries: number;
}

type RecordLine = Header | EntrySnapshot | LookupSnapshot;

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSourceEntry(value: unknown): value is { key: string; html: string } {
  return isObject(value) && typeof value.key === 'string' && typeof value.html === 'string';
}

function readSource(bytes: Uint8Array): Map<string, string> {
  const source = new Map<string, string>();
  for (const [index, line] of new TextDecoder().decode(bytes).split('\n').entries()) {
    if (!line) continue;
    const entry: unknown = JSON.parse(line);
    if (!isSourceEntry(entry)) throw new Error(`Invalid source line ${index + 1}`);
    if (source.has(entry.key)) throw new Error(`Duplicate dictionary key: ${entry.key}`);
    source.set(entry.key, entry.html);
  }
  return source;
}

function isTextCandidate(value: unknown): value is TextCandidate | null {
  return (
    value === null ||
    (isObject(value) &&
      typeof value.before === 'string' &&
      typeof value.after === 'string' &&
      ['whitespace', 'placeholder', 'unclassified'].includes(String(value.classification)))
  );
}

function isStringMap(value: unknown): value is Record<string, string> {
  return isObject(value) && Object.values(value).every((item) => typeof item === 'string');
}

function isRecordLine(value: unknown): value is RecordLine {
  if (!isObject(value)) return false;
  if (value.type === 'header')
    return (
      value.version === 1 &&
      typeof value.sourceSha256 === 'string' &&
      typeof value.sourceEntries === 'number'
    );
  if (value.type === 'lookup')
    return (
      isStringMap(value.canonical) &&
      isStringMap(value.aliases) &&
      isStringMap(value.routes) &&
      isObject(value.ambiguousClaims) &&
      Object.values(value.ambiguousClaims).every(
        (item) => Array.isArray(item) && item.every((owner) => typeof owner === 'string')
      )
    );
  if (value.type !== 'entry' || !isObject(value.projection)) return false;
  return (
    typeof value.key === 'string' &&
    isTextCandidate(value.rawToPreprocess) &&
    isTextCandidate(value.preprocessToParsed) &&
    typeof value.preprocessedText === 'string' &&
    typeof value.projection.text === 'string' &&
    Array.isArray(value.projection.parts) &&
    value.projection.parts.every(
      (part) => isObject(part) && typeof part.owner === 'string' && typeof part.text === 'string'
    ) &&
    Array.isArray(value.projection.structure) &&
    value.projection.structure.every((item) => typeof item === 'string')
  );
}

async function* readSnapshot(path: string): AsyncGenerator<RecordLine> {
  const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line) continue;
    const value: unknown = JSON.parse(line);
    if (!isRecordLine(value)) throw new Error(`Invalid snapshot record in ${path}`);
    yield value;
  }
}

export function writeSnapshot(outputPath: string, sourcePath = SOURCE_FILE): Header {
  const bytes = readFileSync(sourcePath);
  const sourceSha256 = createHash('sha256').update(bytes).digest('hex');
  const source = readSource(bytes);
  const references = createEntryReferences(source);
  const header: Header = {
    type: 'header',
    version: 1,
    sourceSha256,
    sourceEntries: source.size,
  };
  const file = openSync(outputPath, 'wx');
  try {
    writeSync(file, `${JSON.stringify(header)}\n`);
    for (const [key, html] of [...source].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      writeSync(file, `${JSON.stringify(snapshotEntry(key, html, references.resolve))}\n`);
    }
    writeSync(file, `${JSON.stringify(snapshotLookup(source, references))}\n`);
  } finally {
    closeSync(file);
  }
  return header;
}

async function nextRecord(iterator: AsyncIterator<RecordLine>): Promise<RecordLine | undefined> {
  return (await iterator.next()).value;
}

async function lookupAtEnd(
  iterator: AsyncIterator<RecordLine>,
  header: Header
): Promise<LookupSnapshot> {
  let count = 0;
  for (;;) {
    const record = await nextRecord(iterator);
    if (record?.type === 'lookup') {
      if (count !== header.sourceEntries)
        throw new Error('Snapshot entry count differs from header');
      if (await nextRecord(iterator)) throw new Error('Trailing snapshot records');
      return record;
    }
    if (record?.type !== 'entry') throw new Error('Incomplete snapshot');
    count++;
  }
}

export async function compareSnapshotFiles(
  beforePath: string,
  afterPath: string,
  lookupOnly = false
): Promise<void> {
  const before = readSnapshot(beforePath)[Symbol.asyncIterator]();
  const after = readSnapshot(afterPath)[Symbol.asyncIterator]();
  const beforeHeader = await nextRecord(before);
  const afterHeader = await nextRecord(after);
  if (beforeHeader?.type !== 'header' || afterHeader?.type !== 'header')
    throw new Error('Snapshots must begin with a header');
  const sourceChanged = beforeHeader.sourceSha256 !== afterHeader.sourceSha256;
  if (sourceChanged && !lookupOnly) {
    console.log(
      JSON.stringify({
        type: 'sourceChanged',
        before: beforeHeader.sourceSha256,
        after: afterHeader.sourceSha256,
      })
    );
    return;
  }
  if (lookupOnly) {
    const oldLookup = await lookupAtEnd(before, beforeHeader);
    const newLookup = await lookupAtEnd(after, afterHeader);
    console.log(
      JSON.stringify({
        type: 'lookupDifference',
        sourceChanged,
        ...compareLookup(oldLookup, newLookup),
      })
    );
    console.log(JSON.stringify({ type: 'summary', sourceChanged, lexicalComparison: false }));
    return;
  }
  let entryDifferences = 0;
  let entryCount = 0;
  for (;;) {
    const oldRecord = await nextRecord(before);
    const newRecord = await nextRecord(after);
    if (oldRecord?.type === 'lookup' && newRecord?.type === 'lookup') {
      if (entryCount !== beforeHeader.sourceEntries || entryCount !== afterHeader.sourceEntries)
        throw new Error('Snapshot entry count differs from header');
      console.log(
        JSON.stringify({ type: 'lookupDifference', ...compareLookup(oldRecord, newRecord) })
      );
      if ((await nextRecord(before)) || (await nextRecord(after)))
        throw new Error('Trailing snapshot records');
      break;
    }
    if (oldRecord?.type !== 'entry' || newRecord?.type !== 'entry')
      throw new Error('Snapshots differ in entry order or are incomplete');
    entryCount++;
    const difference = compareEntry(oldRecord, newRecord);
    if (difference) {
      entryDifferences++;
      console.log(JSON.stringify({ type: 'entryDifference', ...difference }));
    }
  }
  console.log(JSON.stringify({ type: 'summary', sourceChanged: false, entryDifferences }));
}

if (import.meta.main) {
  const [command, first, second] = process.argv.slice(2);
  if ((command === '--compare' || command === '--lookup-only') && first && second) {
    await compareSnapshotFiles(first, second, command === '--lookup-only');
  } else if (command && command !== '--compare' && !process.argv[4]) {
    console.log(JSON.stringify(writeSnapshot(command, first)));
  } else {
    throw new Error(
      'Usage: bun scripts/dictionary-audit/snapshot.ts output.jsonl [source.jsonl] | --compare before.jsonl after.jsonl | --lookup-only before.jsonl after.jsonl'
    );
  }
}
