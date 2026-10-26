import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { FileProof } from './packet';

export type FrozenEdit = {
  id: string;
  key: string;
  owner: string;
  oldSha256: string;
  old: string;
  new: string;
  source: FileProof;
};

export type NativeReading = {
  reviewer: string;
  certain: boolean;
  fragmentSha256: string;
  native: { file: FileProof; pageId: string; entryKey: string; trace: string };
};

export type Decision = Pick<FrozenEdit, 'id' | 'key' | 'owner' | 'oldSha256' | 'old' | 'new'> & {
  path: 'independent-agreement' | 'source-adjudication' | 'hold' | 'reverse';
  eligibility: {
    supported: boolean;
    basis: 'source' | 'convention';
    reason: string;
    evidence: FileProof[];
  };
  readings: NativeReading[];
  adjudication?: { reviewer: string; reason: string; initialFragmentSha256: string };
};

export type DecisionCounts = {
  independentAgreement: number;
  sourceAdjudication: number;
  hold: number;
  reverse: number;
};

const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const named = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const digest = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const proof = (value: unknown): value is FileProof =>
  object(value) &&
  named(value.path) &&
  digest(value.sha256) &&
  typeof value.byteLength === 'number' &&
  Number.isSafeInteger(value.byteLength) &&
  value.byteLength >= 0;
const frozenEdit = (value: unknown): value is FrozenEdit =>
  object(value) && frozenIdentity(value) && proof(value.source);
const nativeReading = (value: unknown): value is NativeReading =>
  object(value) &&
  named(value.reviewer) &&
  typeof value.certain === 'boolean' &&
  digest(value.fragmentSha256) &&
  object(value.native) &&
  proof(value.native.file) &&
  named(value.native.pageId) &&
  named(value.native.entryKey) &&
  named(value.native.trace);
const decision = (value: unknown): value is Decision =>
  object(value) &&
  frozenIdentity(value) &&
  (value.path === 'independent-agreement' ||
    value.path === 'source-adjudication' ||
    value.path === 'hold' ||
    value.path === 'reverse') &&
  object(value.eligibility) &&
  typeof value.eligibility.supported === 'boolean' &&
  (value.eligibility.basis === 'source' || value.eligibility.basis === 'convention') &&
  named(value.eligibility.reason) &&
  Array.isArray(value.eligibility.evidence) &&
  value.eligibility.evidence.every(proof) &&
  Array.isArray(value.readings) &&
  value.readings.every(nativeReading) &&
  (value.adjudication === undefined ||
    (object(value.adjudication) &&
      named(value.adjudication.reviewer) &&
      named(value.adjudication.reason) &&
      digest(value.adjudication.initialFragmentSha256)));

function frozenIdentity(value: unknown): boolean {
  return (
    object(value) &&
    named(value.id) &&
    named(value.key) &&
    named(value.owner) &&
    digest(value.oldSha256) &&
    named(value.old) &&
    typeof value.new === 'string'
  );
}

export function parseFrozenEdits(value: unknown): FrozenEdit[] {
  if (!Array.isArray(value) || !value.every(frozenEdit)) throw new Error('Invalid frozen edits');
  return value;
}

export function parseDecisions(value: unknown): Decision[] {
  if (!Array.isArray(value) || !value.every(decision)) throw new Error('Invalid decisions');
  return value;
}

export async function validateDecisions(
  frozen: FrozenEdit[],
  decisions: Decision[],
  baseDir: string
): Promise<DecisionCounts> {
  const identities = new Map(frozen.map((item) => [item.id, item]));
  if (identities.size !== frozen.length) throw new Error('Duplicate frozen edit ID');
  if (
    new Set(frozen.map((item) => JSON.stringify([item.key, item.oldSha256, item.old]))).size !==
    frozen.length
  )
    throw new Error('Duplicate frozen fragment');
  if (new Set(decisions.map((item) => item.id)).size !== decisions.length)
    throw new Error('Duplicate decision ID');
  if (decisions.length !== frozen.length) throw new Error('Decision partition is incomplete');
  const files = new Map<string, Uint8Array>();
  async function verified(file: FileProof): Promise<Uint8Array> {
    const path = resolve(baseDir, file.path);
    let bytes = files.get(path);
    if (!bytes) {
      bytes = await readFile(path);
      files.set(path, bytes);
    }
    if (bytes.byteLength !== file.byteLength || sha256(bytes) !== file.sha256)
      throw new Error(`File proof mismatch: ${file.path}`);
    return bytes;
  }
  const counts: DecisionCounts = {
    independentAgreement: 0,
    sourceAdjudication: 0,
    hold: 0,
    reverse: 0,
  };
  for (const record of decisions) {
    const original = identities.get(record.id);
    if (!original) throw new Error(`Unknown frozen edit ID: ${record.id}`);
    if (
      record.key !== original.key ||
      record.owner !== original.owner ||
      record.oldSha256 !== original.oldSha256 ||
      record.old !== original.old ||
      record.new !== original.new
    )
      throw new Error(`Changed frozen identity: ${record.id}`);
    const source = await verified(original.source);
    const raw = new TextDecoder().decode(source);
    if (original.source.sha256 !== original.oldSha256 || raw.split(original.old).length !== 2)
      throw new Error(`Frozen source or old fragment mismatch: ${record.id}`);
    for (const evidence of record.eligibility.evidence) await verified(evidence);
    for (const reading of record.readings) {
      const bytes = await verified(reading.native.file);
      if (reading.native.entryKey !== record.key || !nativeImage(bytes))
        throw new Error(`Native evidence mismatch: ${record.id}`);
    }
    if (record.path === 'hold') {
      counts.hold++;
      continue;
    }
    if (record.path === 'reverse') {
      counts.reverse++;
      continue;
    }
    if (
      !record.eligibility.supported ||
      record.eligibility.basis !== 'source' ||
      !record.eligibility.evidence.length
    )
      throw new Error(`Unsupported source eligibility: ${record.id}`);
    if (record.old === record.new) throw new Error(`No replacement: ${record.id}`);
    const expected = sha256(new TextEncoder().encode(record.new));
    const readers = new Set<string>();
    for (const reading of record.readings) {
      if (!reading.certain || reading.fragmentSha256 !== expected)
        throw new Error(`Uncertain or mismatched reading: ${record.id}`);
      if (readers.has(reading.reviewer)) throw new Error(`Duplicate reader: ${record.id}`);
      readers.add(reading.reviewer);
    }
    if (readers.size < 2) throw new Error(`Two independent readings required: ${record.id}`);
    if (record.path === 'source-adjudication') {
      if (!record.adjudication || readers.has(record.adjudication.reviewer))
        throw new Error(`Fresh adjudication required: ${record.id}`);
      counts.sourceAdjudication++;
    } else {
      if (record.adjudication) throw new Error(`Unexpected adjudication: ${record.id}`);
      counts.independentAgreement++;
    }
  }
  return counts;
}

function nativeImage(bytes: Uint8Array): boolean {
  const png = [137, 80, 78, 71, 13, 10, 26, 10];
  return (
    (bytes.length >= 33 && png.every((byte, index) => bytes[index] === byte)) ||
    (bytes.length >= 4 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[bytes.length - 2] === 0xff &&
      bytes[bytes.length - 1] === 0xd9)
  );
}

if (import.meta.main) {
  const [frozenPath, decisionsPath] = process.argv.slice(2);
  if (!frozenPath || !decisionsPath || process.argv[4])
    throw new Error('Usage: bun scripts/dictionary-audit/decisions.ts frozen.json decisions.json');
  const frozen: unknown = JSON.parse(await Bun.file(frozenPath).text());
  const decisions: unknown = JSON.parse(await Bun.file(decisionsPath).text());
  console.log(
    JSON.stringify(
      await validateDecisions(
        parseFrozenEdits(frozen),
        parseDecisions(decisions),
        dirname(resolve(decisionsPath))
      )
    )
  );
}
