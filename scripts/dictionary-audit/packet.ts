import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export type FileProof = { path: string; sha256: string; byteLength: number };
export type Receipt = { reviewer: string; trace: string };
export type IdentityReceipt = Receipt & {
  key: string;
  pageId: string;
  printedPage: string;
  runningHead: string;
  entryText: string;
};
export type Window = { start: number; end: number; sha256: string };
export type Rect = { x: number; y: number; width: number; height: number };
export type TextField = 'raw' | 'decoded' | 'parsed' | 'browserText' | 'gcide' | 'gutenberg';
export type TextEvidence = {
  field: TextField;
  file: FileProof;
  delivery: Window[];
  inspected?: Receipt;
};
export type ImagePiece = {
  file: FileProof;
  rect: Rect;
  deliveredSha256?: string;
  inspected?: Receipt;
};
export type ImageEvidence = {
  role: 'rendered' | 'print';
  pageId: string;
  file: FileProof;
  source?: { url: string; edition: string };
  generationReceipt?: FileProof;
  nativeWidth: number;
  nativeHeight: number;
  required: Rect[];
  pieces: ImagePiece[];
  entryIdentity?: IdentityReceipt;
};
export type Dossier = { key: string; text: TextEvidence[]; images: ImageEvidence[] };
export type Packet = { assignedKeys: string[]; rules: FileProof; dossiers: Dossier[] };
export type PacketPhase = 'prepare' | 'review';
export type PacketRow = {
  key: string;
  phase: PacketPhase;
  status: 'ready' | 'hold';
  reasons: string[];
};
export type FrozenKey = { key: string; sourceHash: string; codeHash: string };
export type FieldHold = { field: string; reason: string };
export type EntryReview = {
  key: string;
  examined: boolean;
  source?: { hash: string };
  glyph?: { hash: string };
  complete?: { sourceHash: string; codeHash: string };
  holds: FieldHold[];
};

const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const digest = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const positive = (value: unknown): value is number =>
  Number.isSafeInteger(value) && typeof value === 'number' && value > 0;
const offset = (value: unknown): value is number =>
  Number.isSafeInteger(value) && typeof value === 'number' && value >= 0;
const named = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const proof = (value: unknown): value is FileProof =>
  record(value) && named(value.path) && digest(value.sha256) && offset(value.byteLength);
const receipt = (value: unknown): value is Receipt =>
  record(value) && named(value.reviewer) && named(value.trace);
const identityReceipt = (value: unknown): value is IdentityReceipt =>
  record(value) &&
  named(value.key) &&
  named(value.pageId) &&
  named(value.printedPage) &&
  named(value.runningHead) &&
  named(value.entryText) &&
  receipt(value);
const rect = (value: unknown): value is Rect =>
  record(value) &&
  offset(value.x) &&
  offset(value.y) &&
  positive(value.width) &&
  positive(value.height);
const windowProof = (value: unknown): value is Window =>
  record(value) && offset(value.start) && positive(value.end) && digest(value.sha256);
const field = (value: unknown): value is TextField =>
  value === 'raw' ||
  value === 'decoded' ||
  value === 'parsed' ||
  value === 'browserText' ||
  value === 'gcide' ||
  value === 'gutenberg';
const textEvidence = (value: unknown): value is TextEvidence =>
  record(value) &&
  field(value.field) &&
  proof(value.file) &&
  Array.isArray(value.delivery) &&
  value.delivery.every(windowProof) &&
  (value.inspected === undefined || receipt(value.inspected));
const imagePiece = (value: unknown): value is ImagePiece =>
  record(value) &&
  proof(value.file) &&
  rect(value.rect) &&
  (value.deliveredSha256 === undefined || digest(value.deliveredSha256)) &&
  (value.inspected === undefined || receipt(value.inspected));
const imageEvidence = (value: unknown): value is ImageEvidence =>
  record(value) &&
  (value.role === 'rendered' || value.role === 'print') &&
  named(value.pageId) &&
  proof(value.file) &&
  (value.source === undefined ||
    (record(value.source) && named(value.source.url) && named(value.source.edition))) &&
  (value.generationReceipt === undefined || proof(value.generationReceipt)) &&
  positive(value.nativeWidth) &&
  positive(value.nativeHeight) &&
  Array.isArray(value.required) &&
  value.required.every(rect) &&
  Array.isArray(value.pieces) &&
  value.pieces.every(imagePiece) &&
  (value.entryIdentity === undefined || identityReceipt(value.entryIdentity));
const dossier = (value: unknown): value is Dossier =>
  record(value) &&
  named(value.key) &&
  Array.isArray(value.text) &&
  value.text.every(textEvidence) &&
  Array.isArray(value.images) &&
  value.images.every(imageEvidence);

export function parsePacket(value: unknown): Packet {
  if (
    !record(value) ||
    !Array.isArray(value.assignedKeys) ||
    !value.assignedKeys.every(named) ||
    !proof(value.rules) ||
    !Array.isArray(value.dossiers) ||
    !value.dossiers.every(dossier)
  ) {
    throw new Error('Invalid packet schema');
  }
  return { assignedKeys: value.assignedKeys, rules: value.rules, dossiers: value.dossiers };
}

function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}`);
}

function inside(rectangle: Rect, width: number, height: number): boolean {
  return rectangle.x + rectangle.width <= width && rectangle.y + rectangle.height <= height;
}

function covers(required: Rect, pieces: Rect[]): boolean {
  const xs = [required.x, required.x + required.width];
  const ys = [required.y, required.y + required.height];
  for (const piece of pieces) {
    xs.push(
      Math.max(required.x, piece.x),
      Math.min(required.x + required.width, piece.x + piece.width)
    );
    ys.push(
      Math.max(required.y, piece.y),
      Math.min(required.y + required.height, piece.y + piece.height)
    );
  }
  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  for (let x = 0; x < xs.length - 1; x++) {
    for (let y = 0; y < ys.length - 1; y++) {
      if (xs[x] === xs[x + 1] || ys[y] === ys[y + 1]) continue;
      const cx = (xs[x] + xs[x + 1]) / 2;
      const cy = (ys[y] + ys[y + 1]) / 2;
      if (
        cx < required.x ||
        cx >= required.x + required.width ||
        cy < required.y ||
        cy >= required.y + required.height
      )
        continue;
      if (
        !pieces.some(
          (piece) =>
            cx >= piece.x &&
            cx < piece.x + piece.width &&
            cy >= piece.y &&
            cy < piece.y + piece.height
        )
      )
        return false;
    }
  }
  return true;
}

function pngSize(bytes: Uint8Array): { width: number; height: number } {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (
    bytes.length < 33 ||
    !signature.every((byte, index) => bytes[index] === byte) ||
    bytes[8] !== 0 ||
    bytes[9] !== 0 ||
    bytes[10] !== 0 ||
    bytes[11] !== 13 ||
    bytes[12] !== 73 ||
    bytes[13] !== 72 ||
    bytes[14] !== 68 ||
    bytes[15] !== 82
  ) {
    throw new Error('Invalid PNG header');
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (!width || !height) throw new Error('Invalid PNG dimensions');
  return { width, height };
}

function nativeSize(bytes: Uint8Array): { width: number; height: number } {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return pngSize(bytes);
  for (let at = 2; at < bytes.length;) {
    if (bytes[at] !== 0xff) throw new Error('Invalid JPEG marker');
    while (bytes[at] === 0xff) at++;
    const marker = bytes[at++];
    if (marker === undefined || marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
    if (at + 2 > bytes.length) throw new Error('Truncated JPEG segment');
    const length = (bytes[at] << 8) | bytes[at + 1];
    if (length < 2 || at + length > bytes.length) throw new Error('Invalid JPEG segment');
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      if (length < 7) throw new Error('Invalid JPEG frame');
      const height = (bytes[at + 3] << 8) | bytes[at + 4];
      const width = (bytes[at + 5] << 8) | bytes[at + 6];
      if (!width || !height) throw new Error('Invalid JPEG dimensions');
      return { width, height };
    }
    at += length;
  }
  throw new Error('JPEG frame dimensions unavailable');
}

export async function preparePacket(
  packet: Packet,
  baseDir: string,
  phase: PacketPhase = 'prepare'
): Promise<PacketRow[]> {
  unique(packet.assignedKeys, 'assigned key');
  unique(
    packet.dossiers.map((item) => item.key),
    'dossier key'
  );
  if (
    packet.assignedKeys.length !== packet.dossiers.length ||
    packet.assignedKeys.some((key, index) => key !== packet.dossiers[index]?.key)
  ) {
    throw new Error('Dossiers do not exactly match ordered assigned keys');
  }
  const files = new Map<string, Uint8Array>();
  async function bytes(file: FileProof): Promise<Uint8Array> {
    const path = resolve(baseDir, file.path);
    let content = files.get(path);
    if (!content) {
      content = await readFile(path);
      files.set(path, content);
    }
    if (content.byteLength !== file.byteLength || sha256(content) !== file.sha256) {
      throw new Error(`File proof mismatch: ${file.path}`);
    }
    return content;
  }
  await bytes(packet.rules);
  const rows: PacketRow[] = [];
  for (const item of packet.dossiers) {
    unique(
      item.text.map((evidence) => evidence.field),
      `${item.key} text field`
    );
    unique(
      item.images.map((evidence) => `${evidence.role}:${evidence.pageId}`),
      `${item.key} image identity`
    );
    const reasons: string[] = [];
    const requiredFields: TextField[] = [
      'raw',
      'decoded',
      'parsed',
      'browserText',
      'gcide',
      'gutenberg',
    ];
    for (const required of requiredFields) {
      if (!item.text.some((evidence) => evidence.field === required))
        reasons.push(`missing ${required}`);
    }
    for (const evidence of item.text) {
      const content = await bytes(evidence.file);
      const intervals = [...evidence.delivery].sort((a, b) => a.start - b.start);
      let end = 0;
      for (const part of intervals) {
        if (
          part.end > content.byteLength ||
          part.end <= part.start ||
          sha256(content.subarray(part.start, part.end)) !== part.sha256
        ) {
          throw new Error(`Invalid delivered text window: ${item.key}/${evidence.field}`);
        }
        if (phase === 'review' && part.start > end)
          reasons.push(`incomplete ${evidence.field} delivery`);
        end = Math.max(end, part.end);
      }
      if (phase === 'review' && (!intervals.length || end !== content.byteLength))
        reasons.push(`incomplete ${evidence.field} delivery`);
      if (phase === 'review' && !evidence.inspected) reasons.push(`uninspected ${evidence.field}`);
    }
    const requiredImages: ImageEvidence['role'][] = ['rendered', 'print'];
    for (const role of requiredImages) {
      if (!item.images.some((evidence) => evidence.role === role)) reasons.push(`missing ${role}`);
    }
    for (const evidence of item.images) {
      const original = nativeSize(await bytes(evidence.file));
      if (original.width !== evidence.nativeWidth || original.height !== evidence.nativeHeight) {
        throw new Error(`Native image dimensions differ: ${item.key}/${evidence.pageId}`);
      }
      if (
        !evidence.required.length ||
        evidence.required.some((area) => !inside(area, original.width, original.height))
      ) {
        throw new Error(`Invalid required image rectangle: ${item.key}/${evidence.pageId}`);
      }
      if (evidence.generationReceipt) await bytes(evidence.generationReceipt);
      if (evidence.role === 'print' && !evidence.source)
        reasons.push(`missing print source metadata: ${evidence.pageId}`);
      if (evidence.role === 'print' && !evidence.generationReceipt)
        reasons.push(`missing crop generation receipt: ${evidence.pageId}`);
      for (const piece of evidence.pieces) {
        const content = await bytes(piece.file);
        const size = pngSize(content);
        if (
          !inside(piece.rect, original.width, original.height) ||
          size.width !== piece.rect.width ||
          size.height !== piece.rect.height
        ) {
          throw new Error(`Scaled or invalid image piece: ${item.key}/${evidence.pageId}`);
        }
        if (piece.deliveredSha256 && piece.deliveredSha256 !== sha256(content))
          throw new Error(`Invalid delivered image: ${item.key}/${evidence.pageId}`);
      }
      const prepared = evidence.pieces.map((piece) => piece.rect);
      if (evidence.required.some((area) => !covers(area, prepared)))
        reasons.push(`incomplete ${evidence.role} image preparation: ${evidence.pageId}`);
      if (phase === 'review') {
        const inspected = evidence.pieces
          .filter((piece) => piece.deliveredSha256 && piece.inspected)
          .map((piece) => piece.rect);
        if (evidence.required.some((area) => !covers(area, inspected)))
          reasons.push(`incomplete ${evidence.role} image inspection: ${evidence.pageId}`);
        if (evidence.role === 'print' && !evidence.entryIdentity)
          reasons.push(`unverified entry identity: ${evidence.pageId}`);
      }
      if (
        evidence.entryIdentity &&
        (evidence.entryIdentity.key !== item.key ||
          evidence.entryIdentity.pageId !== evidence.pageId)
      ) {
        throw new Error(`Mismatched entry identity: ${item.key}/${evidence.pageId}`);
      }
    }
    rows.push({ key: item.key, phase, status: reasons.length ? 'hold' : 'ready', reasons });
  }
  return rows;
}

export function deriveProgress(frozen: FrozenKey[], reviews: EntryReview[]) {
  unique(
    frozen.map((item) => item.key),
    'frozen key'
  );
  unique(
    reviews.map((item) => item.key),
    'review key'
  );
  const byKey = new Map(reviews.map((item) => [item.key, item]));
  if (
    frozen.length !== reviews.length ||
    reviews.some((item) => !frozen.some((entry) => entry.key === item.key))
  ) {
    throw new Error('Review rows must exactly match frozen keys');
  }
  let examined = 0;
  let closed = 0;
  let held = 0;
  let unstarted = 0;
  let sourceReviewed = 0;
  let glyphReviewed = 0;
  let completeReviewed = 0;
  let nextUnstarted: string | null = null;
  for (const entry of frozen) {
    const review = byKey.get(entry.key);
    if (!review) throw new Error(`Missing review row: ${entry.key}`);
    if (review.source && review.source.hash !== entry.sourceHash)
      throw new Error(`Stale source review: ${entry.key}`);
    if (review.glyph && review.glyph.hash !== entry.sourceHash)
      throw new Error(`Stale glyph review: ${entry.key}`);
    if (
      review.complete &&
      (review.complete.sourceHash !== entry.sourceHash ||
        review.complete.codeHash !== entry.codeHash)
    ) {
      throw new Error(`Stale complete review: ${entry.key}`);
    }
    if (
      (review.source || review.glyph || review.complete || review.holds.length) &&
      !review.examined
    ) {
      throw new Error(`Evidence recorded as unexamined: ${entry.key}`);
    }
    if (review.source) sourceReviewed++;
    if (review.glyph) glyphReviewed++;
    if (review.complete) completeReviewed++;
    if (review.examined) examined++;
    else {
      unstarted++;
      nextUnstarted ??= entry.key;
    }
    if (review.holds.length) held++;
    if (review.complete && !review.holds.length) closed++;
  }
  return {
    total: frozen.length,
    examined,
    closed,
    held,
    unstarted,
    sourceReviewed,
    glyphReviewed,
    completeReviewed,
    nextUnstarted,
  };
}

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const phase = args.includes('--review') ? 'review' : 'prepare';
  const paths = args.filter((arg) => arg !== '--review');
  const path = paths[0];
  if (!path || paths.length !== 1)
    throw new Error('Usage: bun scripts/dictionary-audit/packet.ts <packet.json> [--review]');
  const packet = parsePacket(JSON.parse(await Bun.file(path).text()));
  console.log(JSON.stringify(await preparePacket(packet, dirname(resolve(path)), phase), null, 2));
}
