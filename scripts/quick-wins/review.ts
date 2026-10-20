import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { finalItems } from './apply.ts';
import { PACKETS, loose, readJson } from './lib.ts';
import type { Item } from './validate.ts';

const args = process.argv.slice(2);
const option = (name: string): string | undefined =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const spec = option('packets') ?? '';
const mode = option('mode') ?? 'review';
const packets: string[] = [];
for (const part of spec.split(',').filter(Boolean)) {
  const range = /^p(\d{3})-p(\d{3})$/.exec(part);
  if (range)
    for (let n = Number(range[1]); n <= Number(range[2]); n++)
      packets.push(`p${String(n).padStart(3, '0')}`);
  else packets.push(part);
}

const wordList = new Set(
  readFileSync('/usr/share/dict/words', 'utf8')
    .split('\n')
    .map((line) => line.toLowerCase())
);
const words = (text: string): string[] => loose(text).split(' ').filter(Boolean);
const STEMS: [RegExp, string][] = [
  [/s$/, ''],
  [/es$/, ''],
  [/ies$/, 'y'],
  [/ed$/, ''],
  [/ed$/, 'e'],
  [/ied$/, 'y'],
  [/ing$/, ''],
  [/ing$/, 'e'],
  [/ly$/, ''],
  [/er$/, ''],
  [/est$/, ''],
  [/ness$/, ''],
];
const known = (word: string): boolean =>
  wordList.has(word) ||
  STEMS.some(([pattern, tail]) => pattern.test(word) && wordList.has(word.replace(pattern, tail)));
const changedWords = (from: string, to: string): string[] =>
  words(from).filter((word) => !words(to).includes(word));

function classify(item: Item): 'typo' | 'swap' | 'quote' | 'other' {
  const oldWords = changedWords(item.old, item.new);
  const newWords = changedWords(item.new, item.old);
  if (item.container === 'q') return 'quote';
  if (oldWords.length && oldWords.every(known)) return 'swap';
  if (oldWords.length && newWords.length && newWords.every(known) && !oldWords.some(known))
    return 'typo';
  return 'other';
}

const totals = {
  packets: 0,
  accepted: 0,
  typo: 0,
  swap: 0,
  quote: 0,
  other: 0,
  hold: 0,
  rejected: 0,
  missing: [] as string[],
};
for (const packet of packets) {
  const file = join(PACKETS, packet, 'manifest.json');
  if (!existsSync(file)) {
    totals.missing.push(packet);
    continue;
  }
  totals.packets += 1;
  const manifest = readJson(file);
  const all: unknown =
    typeof manifest === 'object' && manifest !== null && 'items' in manifest ? manifest.items : [];
  const items = finalItems(packet);
  const accepted = new Set(items.map((item) => item.id));
  if (Array.isArray(all))
    for (const raw of all)
      if (
        typeof raw === 'object' &&
        raw !== null &&
        'status' in raw &&
        'id' in raw &&
        typeof raw.id === 'string' &&
        !accepted.has(raw.id)
      )
        totals[raw.status === 'rejected' ? 'rejected' : 'hold'] += 1;
  for (const item of items) {
    const kind = classify(item);
    totals.accepted += 1;
    totals[kind] += 1;
    if (mode === 'all' || (mode === 'review' && kind !== 'typo'))
      console.log(
        `${item.id} ${item.key} [${kind}/${item.gcide ?? ''}] ${JSON.stringify(item.old)} => ${JSON.stringify(item.new)}`
      );
    if (mode === 'typo' && kind === 'typo')
      console.log(
        `${changedWords(item.old, item.new).join(' ')} => ${changedWords(item.new, item.old).join(' ')}`
      );
  }
  if (mode === 'holds' && Array.isArray(all))
    for (const raw of all)
      if (
        typeof raw === 'object' &&
        raw !== null &&
        'id' in raw &&
        'status' in raw &&
        'old' in raw &&
        'new' in raw &&
        'key' in raw &&
        'problems' in raw &&
        typeof raw.id === 'string' &&
        !accepted.has(raw.id) &&
        raw.status !== 'rejected'
      )
        console.log(
          `${raw.id} ${String(raw.key)} ${JSON.stringify(raw.problems)} ${JSON.stringify(raw.old)} => ${JSON.stringify(raw.new)}`
        );
}
console.error(JSON.stringify(totals));
