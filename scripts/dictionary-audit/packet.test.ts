import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { deriveProgress, preparePacket } from './packet';
import type {
  EntryReview,
  FileProof,
  FrozenKey,
  ImageEvidence,
  Packet,
  Rect,
  TextEvidence,
} from './packet';

const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

function crc(bytes: Uint8Array): number {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
  }
  return (value ^ 0xffffffff) >>> 0;
}

function chunk(name: string, bytes: Uint8Array): Buffer {
  const type = Buffer.from(name);
  const header = Buffer.alloc(4);
  const trailer = Buffer.alloc(4);
  header.writeUInt32BE(bytes.length);
  trailer.writeUInt32BE(crc(Buffer.concat([type, bytes])));
  return Buffer.concat([header, type, bytes, trailer]);
}

function png(width: number, height: number): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(scanlines)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'dictionary-packet-'));
  async function file(path: string, content: Uint8Array): Promise<FileProof> {
    await writeFile(join(directory, path), content);
    return { path, sha256: hash(content), byteLength: content.byteLength };
  }
  const rules = await file('rules.txt', Buffer.from('settled rules'));
  const content = Buffer.from('source text');
  const source = await file('source.txt', content);
  const image = png(2, 2);
  const original = await file('original.png', image);
  const generationReceipt = await file(
    'crop-generation.json',
    Buffer.from(JSON.stringify({ originalSha256: original.sha256, pieces: [original.sha256] }))
  );
  const square: Rect = { x: 0, y: 0, width: 2, height: 2 };
  const text: TextEvidence[] = [
    'raw',
    'decoded',
    'parsed',
    'browserText',
    'gcide',
    'gutenberg',
  ].map((field) => ({
    field:
      field === 'raw' ||
      field === 'decoded' ||
      field === 'parsed' ||
      field === 'browserText' ||
      field === 'gcide'
        ? field
        : 'gutenberg',
    file: source,
    delivery: [{ start: 0, end: content.length, sha256: hash(content) }],
    inspected: { reviewer: 'reader', trace: 'saved trace' },
  }));
  const rendered: ImageEvidence = {
    role: 'rendered',
    pageId: 'entry-a',
    file: original,
    nativeWidth: 2,
    nativeHeight: 2,
    required: [square],
    pieces: [
      {
        file: original,
        rect: square,
        deliveredSha256: hash(image),
        inspected: { reviewer: 'reader', trace: 'image read' },
      },
    ],
  };
  const print: ImageEvidence = {
    ...rendered,
    role: 'print',
    pageId: 'leaf-a',
    source: { url: 'https://example.test/leaf-a', edition: 'test printing' },
    generationReceipt,
    entryIdentity: {
      reviewer: 'reader',
      trace: 'page inspection',
      key: 'A',
      pageId: 'leaf-a',
      printedPage: '1',
      runningHead: 'A',
      entryText: 'A',
    },
  };
  const packet: Packet = {
    assignedKeys: ['A'],
    rules,
    dossiers: [{ key: 'A', text, images: [rendered, print] }],
  };
  return { directory, file, packet, content, source };
}

test('file proofs and ordered identities fail closed', async () => {
  const { directory, packet } = await fixture();
  expect((await preparePacket(packet, directory))[0]?.status).toBe('ready');
  packet.rules.sha256 = '0'.repeat(64);
  expect(preparePacket(packet, directory)).rejects.toThrow('File proof mismatch');
  packet.rules.sha256 = hash(Buffer.from('settled rules'));
  packet.assignedKeys.push('A');
  expect(preparePacket(packet, directory)).rejects.toThrow('Duplicate assigned key');
  packet.assignedKeys = ['B'];
  expect(preparePacket(packet, directory)).rejects.toThrow('Dossiers do not exactly match');
});

test('text gaps are held without treating delivery as inspection', async () => {
  const { directory, packet, content } = await fixture();
  const raw = packet.dossiers[0]?.text[0];
  if (!raw) throw new Error('fixture');
  raw.delivery = [
    { start: 0, end: 4, sha256: hash(content.subarray(0, 4)) },
    { start: 5, end: content.length, sha256: hash(content.subarray(5)) },
  ];
  delete raw.inspected;
  const row = (await preparePacket(packet, directory, 'review'))[0];
  expect(row?.status).toBe('hold');
  expect(row?.reasons).toContain('incomplete raw delivery');
  expect(row?.reasons).toContain('uninspected raw');
});

test('native crops need full inspected coverage and exact dimensions', async () => {
  const { directory, packet, file } = await fixture();
  const print = packet.dossiers[0]?.images[1];
  if (!print) throw new Error('fixture');
  const half = png(2, 1);
  const halfProof = await file('half.png', half);
  print.pieces = [
    {
      file: halfProof,
      rect: { x: 0, y: 0, width: 2, height: 1 },
      deliveredSha256: hash(half),
      inspected: { reviewer: 'reader', trace: 'top read' },
    },
  ];
  expect((await preparePacket(packet, directory))[0]?.reasons).toContain(
    'incomplete print image preparation: leaf-a'
  );
  print.pieces[0].rect.height = 2;
  expect(preparePacket(packet, directory)).rejects.toThrow('Scaled or invalid image piece');
});

test('native JPEG frame dimensions can guard PNG crop coordinates', async () => {
  const { directory, packet, file } = await fixture();
  const print = packet.dossiers[0]?.images[1];
  if (!print) throw new Error('fixture');
  const jpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x4a, 0x46, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x02, 0x00,
    0x02, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9,
  ]);
  print.file = await file('original.jpg', jpeg);
  expect((await preparePacket(packet, directory))[0]?.status).toBe('ready');
  print.nativeWidth = 3;
  expect(preparePacket(packet, directory)).rejects.toThrow('Native image dimensions differ');
});

test('print provenance is a distinct preparation obligation', async () => {
  const { directory, packet } = await fixture();
  const print = packet.dossiers[0]?.images[1];
  if (!print) throw new Error('fixture');
  delete print.source;
  delete print.generationReceipt;
  const row = (await preparePacket(packet, directory))[0];
  expect(row?.reasons).toContain('missing print source metadata: leaf-a');
  expect(row?.reasons).toContain('missing crop generation receipt: leaf-a');
});

test('print identity mismatch fails; missing witness stays on its entry', async () => {
  const { directory, packet } = await fixture();
  const dossier = packet.dossiers[0];
  const print = dossier?.images[1];
  if (!dossier || !print?.entryIdentity) throw new Error('fixture');
  print.entryIdentity.pageId = 'different-leaf';
  expect(preparePacket(packet, directory)).rejects.toThrow('Mismatched entry identity');
  print.entryIdentity.pageId = print.pageId;
  dossier.text = dossier.text.filter((evidence) => evidence.field !== 'gutenberg');
  dossier.images = dossier.images.filter((evidence) => evidence.role !== 'print');
  const row = (await preparePacket(packet, directory))[0];
  expect(row?.reasons).toContain('missing gutenberg');
  expect(row?.reasons).toContain('missing print');
});

test('a missing witness holds only its assigned key', async () => {
  const { directory, packet } = await fixture();
  const second = structuredClone(packet.dossiers[0]);
  if (!second) throw new Error('fixture');
  second.key = 'B';
  const print = second.images.find((image) => image.role === 'print');
  if (!print?.entryIdentity) throw new Error('fixture');
  print.entryIdentity.key = 'B';
  second.text = second.text.filter((evidence) => evidence.field !== 'gcide');
  packet.assignedKeys.push('B');
  packet.dossiers.push(second);
  expect(await preparePacket(packet, directory)).toEqual([
    { key: 'A', phase: 'prepare', status: 'ready', reasons: [] },
    { key: 'B', phase: 'prepare', status: 'hold', reasons: ['missing gcide'] },
  ]);
});

test('preparation does not claim reviewer delivery or inspection', async () => {
  const { directory, packet } = await fixture();
  const dossier = packet.dossiers[0];
  if (!dossier) throw new Error('fixture');
  for (const evidence of dossier.text) {
    evidence.delivery = [];
    delete evidence.inspected;
  }
  for (const image of dossier.images) {
    delete image.entryIdentity;
    for (const piece of image.pieces) {
      delete piece.deliveredSha256;
      delete piece.inspected;
    }
  }
  expect((await preparePacket(packet, directory))[0]).toEqual({
    key: 'A',
    phase: 'prepare',
    status: 'ready',
    reasons: [],
  });
  const reviewed = (await preparePacket(packet, directory, 'review'))[0];
  expect(reviewed?.phase).toBe('review');
  expect(reviewed?.status).toBe('hold');
  expect(reviewed?.reasons).toContain('incomplete raw delivery');
  expect(reviewed?.reasons).toContain('incomplete print image inspection: leaf-a');
  expect(reviewed?.reasons).toContain('unverified entry identity: leaf-a');
});

test('progress uses frozen source and code identities, not glyph-only credit', () => {
  const frozen: FrozenKey[] = ['A', 'B', 'C'].map((key) => ({
    key,
    sourceHash: 'source',
    codeHash: 'code',
  }));
  const reviews: EntryReview[] = [
    { key: 'A', examined: true, source: { hash: 'source' }, glyph: { hash: 'source' }, holds: [] },
    {
      key: 'B',
      examined: true,
      complete: { sourceHash: 'source', codeHash: 'code' },
      holds: [{ field: 'print', reason: 'absent leaf' }],
    },
    { key: 'C', examined: false, holds: [] },
  ];
  expect(deriveProgress(frozen, reviews)).toEqual({
    total: 3,
    examined: 2,
    closed: 0,
    held: 1,
    unstarted: 1,
    sourceReviewed: 1,
    glyphReviewed: 1,
    completeReviewed: 1,
    nextUnstarted: 'C',
  });
  reviews[1].holds = [];
  expect(deriveProgress(frozen, reviews).closed).toBe(1);
  reviews[1].complete = { sourceHash: 'source', codeHash: 'old' };
  expect(() => deriveProgress(frozen, reviews)).toThrow('Stale complete review');
  reviews[1].complete = { sourceHash: 'source', codeHash: 'code' };
  reviews[2].key = 'A';
  expect(() => deriveProgress(frozen, reviews)).toThrow('Duplicate review key');
  reviews[2].key = 'D';
  expect(() => deriveProgress(frozen, reviews)).toThrow(
    'Review rows must exactly match frozen keys'
  );
});
