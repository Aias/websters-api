import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SOURCE_FILE, readDictionarySource } from '../dictionary-source.ts';
import { PACKETS, ROOT, WORK, render, sha256 } from './lib.ts';

const MAX_LINES = 1600;
const MAX_CHARS = 80_000;
const [first, last] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const force = process.argv.includes('--force');
if (!first || !last)
  throw new Error('usage: bun scripts/quick-wins/freeze.ts <first> <last> [--force]');

if (existsSync(PACKETS) && !force)
  throw new Error(`${PACKETS} exists; frozen packets are immutable (use --force to rebuild)`);

const source = readDictionarySource();
const keys = [...source.keys()].sort((a, b) => a.localeCompare(b));
const start = keys.indexOf(first);
const stop = keys.indexOf(last);
if (start < 0 || stop < start) throw new Error(`Bad range ${first}..${last}`);
const selected = keys.slice(start, stop + 1);

const baseline = Bun.spawnSync(['git', 'rev-parse', 'HEAD'], { cwd: ROOT })
  .stdout.toString()
  .trim();
const sourceSha256 = sha256(readFileSync(SOURCE_FILE, 'utf8'));

interface Packet {
  id: string;
  first: string;
  last: string;
  count: number;
  lines: number;
  chars: number;
}
const packets: Packet[] = [];
let rows: string[] = [];
let texts: string[] = [];
let lines = 0;
let chars = 0;

function flush(): void {
  if (!rows.length) return;
  const id = `p${String(packets.length + 1).padStart(3, '0')}`;
  const dir = join(PACKETS, id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'entries.jsonl'), `${rows.join('\n')}\n`);
  writeFileSync(join(dir, 'text.md'), `${texts.join('\n\n')}\n`);
  const keysInPacket = rows.map((row) => {
    const parsed: unknown = JSON.parse(row);
    return typeof parsed === 'object' &&
      parsed !== null &&
      'key' in parsed &&
      typeof parsed.key === 'string'
      ? parsed.key
      : '';
  });
  packets.push({
    id,
    first: keysInPacket[0],
    last: keysInPacket[keysInPacket.length - 1],
    count: rows.length,
    lines,
    chars,
  });
  rows = [];
  texts = [];
  lines = 0;
  chars = 0;
}

for (const key of selected) {
  const html = source.get(key) ?? '';
  const text = `### ${key}\n${render(html)}`;
  const textLines = text.split('\n').length + 1;
  if (rows.length && (lines + textLines > MAX_LINES || chars + text.length > MAX_CHARS)) flush();
  rows.push(JSON.stringify({ key, sha256: sha256(html), html }));
  texts.push(text);
  lines += textLines;
  chars += text.length;
}
flush();

const plan = {
  baseline,
  sourceSha256,
  order: 'localeCompare',
  first,
  last,
  next: keys[stop + 1] ?? null,
  count: selected.length,
  limits: { maxLines: MAX_LINES, maxChars: MAX_CHARS },
  packets,
};
writeFileSync(join(WORK, 'plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
console.log(
  JSON.stringify({
    baseline,
    count: selected.length,
    packets: packets.length,
    first,
    last,
    next: plan.next,
  })
);
