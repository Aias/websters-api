import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateDecisions, type Decision, type FrozenEdit } from './decisions';
import type { FileProof } from './packet';

const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const textHash = (value: string) => hash(new TextEncoder().encode(value));

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'dictionary-decisions-'));
  async function file(path: string, content: Uint8Array): Promise<FileProof> {
    await writeFile(join(directory, path), content);
    return { path, sha256: hash(content), byteLength: content.byteLength };
  }
  const source = await file('source.html', Buffer.from('<div>old spelling.</div>'));
  const witness = await file('witness.txt', Buffer.from('native print page: Example'));
  const native = await file(
    'page.png',
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRj4AAAAASUVORK5CYII=',
      'base64'
    )
  );
  const frozen: FrozenEdit = {
    id: 'edit-1',
    key: 'Example',
    owner: 'homograph[0]/definition[0]',
    oldSha256: source.sha256,
    old: 'old spelling',
    new: 'new spelling',
    source,
  };
  const decision: Decision = {
    id: frozen.id,
    key: frozen.key,
    owner: frozen.owner,
    oldSha256: frozen.oldSha256,
    old: frozen.old,
    new: frozen.new,
    path: 'independent-agreement',
    eligibility: { supported: true, basis: 'source', reason: 'legible page', evidence: [witness] },
    readings: ['reader-a', 'reader-b'].map((reviewer) => ({
      reviewer,
      certain: true,
      fragmentSha256: textHash(frozen.new),
      native: { file: native, pageId: 'page-1', entryKey: frozen.key, trace: `opened-${reviewer}` },
    })),
  };
  return { directory, frozen, decision, witness };
}

async function withFixture(run: (data: Awaited<ReturnType<typeof fixture>>) => Promise<void>) {
  const data = await fixture();
  try {
    await run(data);
  } finally {
    await rm(data.directory, { recursive: true });
  }
}

test('accepts independent agreement and fresh source adjudication separately', async () => {
  await withFixture(async ({ directory, frozen, decision }) => {
    expect(await validateDecisions([frozen], [decision], directory)).toEqual({
      independentAgreement: 1,
      sourceAdjudication: 0,
      hold: 0,
      reverse: 0,
    });
    const adjudicated: Decision = {
      ...decision,
      path: 'source-adjudication',
      adjudication: {
        reviewer: 'adjudicator',
        reason: 're-read disputed letter',
        initialFragmentSha256: textHash('initial proposal'),
      },
    };
    expect((await validateDecisions([frozen], [adjudicated], directory)).sourceAdjudication).toBe(
      1
    );
    adjudicated.adjudication = {
      reviewer: 'reader-a',
      reason: 're-read disputed letter',
      initialFragmentSha256: textHash('initial proposal'),
    };
    await expect(validateDecisions([frozen], [adjudicated], directory)).rejects.toThrow(
      'Fresh adjudication'
    );
  });
});

test('rejects duplicate, uncertain, and mismatched confirmations', async () => {
  await withFixture(async ({ directory, frozen, decision }) => {
    const duplicate = structuredClone(decision);
    duplicate.readings[1].reviewer = 'reader-a';
    await expect(validateDecisions([frozen], [duplicate], directory)).rejects.toThrow(
      'Duplicate reader'
    );
    const uncertain = structuredClone(decision);
    uncertain.readings[1].certain = false;
    await expect(validateDecisions([frozen], [uncertain], directory)).rejects.toThrow('Uncertain');
    const mismatched = structuredClone(decision);
    mismatched.readings[1].fragmentSha256 = textHash('old spelling');
    await expect(validateDecisions([frozen], [mismatched], directory)).rejects.toThrow(
      'mismatched reading'
    );
    const conventional = structuredClone(decision);
    conventional.eligibility.basis = 'convention';
    await expect(validateDecisions([frozen], [conventional], directory)).rejects.toThrow(
      'Unsupported'
    );
  });
});

test('rejects changed identities, duplicate IDs, and missing evidence', async () => {
  await withFixture(async ({ directory, frozen, decision, witness }) => {
    const changed = { ...decision, new: 'unrelated spelling' };
    await expect(validateDecisions([frozen], [changed], directory)).rejects.toThrow(
      'Changed frozen identity'
    );
    await expect(
      validateDecisions([frozen], [{ ...decision, id: 'absent' }], directory)
    ).rejects.toThrow('Unknown frozen edit');
    await expect(validateDecisions([frozen, frozen], [decision], directory)).rejects.toThrow(
      'Duplicate frozen'
    );
    await expect(
      validateDecisions([frozen, { ...frozen, id: 'edit-2' }], [decision], directory)
    ).rejects.toThrow('Duplicate frozen fragment');
    await expect(validateDecisions([frozen], [decision, decision], directory)).rejects.toThrow(
      'Duplicate decision'
    );
    await rm(join(directory, witness.path));
    await expect(validateDecisions([frozen], [decision], directory)).rejects.toThrow();
    await writeFile(join(directory, witness.path), Buffer.from('tampered'));
    await expect(validateDecisions([frozen], [decision], directory)).rejects.toThrow(
      'File proof mismatch'
    );
  });
});

test('holds and reversals cannot receive acceptance credit', async () => {
  await withFixture(async ({ directory, frozen, decision }) => {
    const held: Decision = { ...decision, path: 'hold', readings: [] };
    expect((await validateDecisions([frozen], [held], directory)).hold).toBe(1);
    const reversed: Decision = { ...decision, path: 'reverse', readings: [] };
    expect((await validateDecisions([frozen], [reversed], directory)).reverse).toBe(1);
  });
});
