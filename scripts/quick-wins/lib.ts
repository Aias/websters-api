import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const ROOT = join(import.meta.dir, '..', '..');
export const WORK = join(ROOT, '.cache', 'quick-wins');
export const PACKETS = join(WORK, 'packets');
export const GCIDE_DIR = join(WORK, 'reference', 'gcide_xml-0.53');

export const sha256 = (value: string): string =>
  createHash('sha256').update(value, 'utf8').digest('hex');

const stripMarks = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe');
export const fold = (value: string): string => stripMarks(value).replace(/[^a-z0-9]/g, '');
export const loose = (value: string): string =>
  stripMarks(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const NAMED: Record<string, string> = {
  amp: '&',
  apos: "'",
  quot: '"',
  lt: '<',
  gt: '>',
  nbsp: ' ',
};
const ENTITY = /&(#[xX]?[0-9a-fA-F]+|[a-zA-Z]+);/;

function decodeEntity(body: string): string | undefined {
  if (!body.startsWith('#')) return NAMED[body];
  const hex = body[1] === 'x' || body[1] === 'X';
  const code = Number.parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff
    ? String.fromCodePoint(code)
    : undefined;
}

export const decodeAll = (value: string): string =>
  value.replace(
    new RegExp(ENTITY.source, 'g'),
    (whole, body: string) => decodeEntity(body) ?? whole
  );

export const stripTags = (value: string): string =>
  value.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ');

export function encodeText(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (ch === '&') out += '&amp;';
    else if (ch === '<') out += '&lt;';
    else if (ch === '>') out += '&gt;';
    else if (ch === "'") out += '&apos;';
    else if (ch === '"') out += '&quot;';
    else if (code > 0x7e) out += `&#x${code.toString(16).toUpperCase()};`;
    else out += ch;
  }
  return out;
}

export type Token =
  | {
      kind: 'open';
      name: string;
      classes: string[];
      selfClosing: boolean;
      start: number;
      end: number;
    }
  | { kind: 'close'; name: string; start: number; end: number }
  | { kind: 'text'; char: string; start: number; end: number; ancestors: string[] };

const VOID = new Set(['br', 'img', 'hr']);

export function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let stack: string[] = [];
  let i = 0;
  while (i < html.length) {
    const ch = html[i];
    if (ch === '<') {
      const end = html.indexOf('>', i);
      if (end >= 0) {
        const body = html.slice(i + 1, end);
        if (body.startsWith('/')) {
          tokens.push({
            kind: 'close',
            name: body.slice(1).trim().toLowerCase(),
            start: i,
            end: end + 1,
          });
          stack = stack.slice(0, -1);
        } else {
          const name = (/^[a-zA-Z0-9]+/.exec(body)?.[0] ?? '').toLowerCase();
          const classes = (/class="([^"]*)"/.exec(body)?.[1] ?? '').split(/\s+/).filter(Boolean);
          const selfClosing = body.endsWith('/') || VOID.has(name);
          tokens.push({ kind: 'open', name, classes, selfClosing, start: i, end: end + 1 });
          if (!selfClosing) stack = [...stack, classes[0] ?? name];
        }
        i = end + 1;
        continue;
      }
    }
    if (ch === '&') {
      const match = ENTITY.exec(html.slice(i, i + 12));
      const decoded = match?.index === 0 ? decodeEntity(match[1]) : undefined;
      if (match && decoded !== undefined) {
        tokens.push({
          kind: 'text',
          char: decoded,
          start: i,
          end: i + match[0].length,
          ancestors: stack,
        });
        i += match[0].length;
        continue;
      }
    }
    const length = (html.codePointAt(i) ?? 0) > 0xffff ? 2 : 1;
    tokens.push({
      kind: 'text',
      char: html.slice(i, i + length),
      start: i,
      end: i + length,
      ancestors: stack,
    });
    i += length;
  }
  return tokens;
}

export interface Flat {
  text: string;
  tokens: Extract<Token, { kind: 'text' }>[];
  pos: number[];
}

export function flatten(html: string): Flat {
  const tokens: Flat['tokens'] = [];
  const pos: number[] = [];
  let text = '';
  for (const token of tokenize(html)) {
    if (token.kind !== 'text') continue;
    tokens.push(token);
    pos.push(text.length);
    text += token.char;
  }
  pos.push(text.length);
  return { text, tokens, pos };
}

export function tokenAt(flat: Flat, offset: number): number {
  let low = 0;
  let high = flat.tokens.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (flat.pos[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return low;
}

const SKIP = new Set(['pr', 'ety', 'ver']);
const PLACEHOLDER: Record<string, string> = { pr: ' ⟨pr⟩', ety: ' ⟨ety⟩' };
const MARKS: Record<string, [string, string]> = {
  hw: ['\n**', '**'],
  mhw: ['\n', ''],
  sn: ['\n', ''],
  sd: ['\n   ', ''],
  q: ['\n> ', ''],
  qau: [' — ', ''],
  au: [' — ', ''],
  note: ['\n', ''],
  syn: ['\n', ''],
  usage: ['\n', ''],
  cs: ['\n• ', ''],
  col: ['**', '**'],
  wordforms: ['\n~ ', ''],
  def2: ['\n', ''],
  tr: ['\n', ''],
  td: [' | ', ''],
  th: [' | ', ''],
  pre: ['\n', '\n'],
};

export function render(html: string): string {
  let out = '';
  let skip = 0;
  const open: { cls: string | undefined; skipped: boolean }[] = [];
  for (const token of tokenize(html)) {
    if (token.kind === 'text') {
      if (!skip) out += token.char;
    } else if (token.kind === 'open') {
      const cls = token.classes.find((c) => SKIP.has(c) || c in MARKS);
      if (token.selfClosing) {
        if (!skip && token.name === 'br') out += '\n';
        continue;
      }
      const skipped = cls !== undefined && SKIP.has(cls);
      if (skipped) {
        if (!skip) out += PLACEHOLDER[cls] ?? '';
        skip += 1;
      } else if (!skip && cls !== undefined) out += MARKS[cls][0];
      open.push({ cls, skipped });
    } else {
      const top = open.pop();
      if (!top) continue;
      if (top.skipped) skip -= 1;
      else if (!skip && top.cls !== undefined) out += MARKS[top.cls][1];
    }
  }
  return out
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

const gcideByLetter = new Map<string, Map<string, string>>();

function gcideLetter(letter: string): Map<string, string> {
  const cached = gcideByLetter.get(letter);
  if (cached) return cached;
  const index = new Map<string, string>();
  const file = join(GCIDE_DIR, `gcide_${letter}.xml`);
  if (existsSync(file)) {
    const xml = readFileSync(file, 'utf8');
    const starts = [...xml.matchAll(/<p><ent>(.*?)<\/ent>/g)];
    starts.forEach((match, i) => {
      const start = match.index ?? 0;
      const stop = starts[i + 1]?.index ?? xml.length;
      const id = fold(stripTags(match[1]));
      const text = decodeAll(stripTags(xml.slice(start, stop))).replace(/\s+/g, ' ');
      index.set(id, `${index.get(id) ?? ''}\n${text}`);
    });
  }
  gcideByLetter.set(letter, index);
  return index;
}

export function gcideText(key: string): string | undefined {
  const id = fold(key);
  const letter = id[0];
  return letter ? gcideLetter(letter).get(id) : undefined;
}

export interface PacketEntry {
  key: string;
  sha256: string;
  html: string;
  gcideKey?: string;
}

function isPacketEntry(value: unknown): value is PacketEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    'sha256' in value &&
    'html' in value &&
    typeof value.key === 'string' &&
    typeof value.sha256 === 'string' &&
    typeof value.html === 'string'
  );
}

export function readPacketEntries(packet: string): Map<string, PacketEntry> {
  const entries = new Map<string, PacketEntry>();
  for (const line of readFileSync(join(PACKETS, packet, 'entries.jsonl'), 'utf8').split('\n')) {
    if (!line) continue;
    const parsed: unknown = JSON.parse(line);
    if (!isPacketEntry(parsed)) throw new Error(`Invalid packet entry: ${line.slice(0, 80)}`);
    entries.set(parsed.key, parsed);
  }
  return entries;
}

export function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function levenshtein(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[b.length];
}
