import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEntry } from '../build-db.ts';
import {
  PACKETS,
  encodeText,
  flatten,
  gcideText,
  levenshtein,
  loose,
  readJson,
  readPacketEntries,
  tokenAt,
  type Flat,
  type PacketEntry,
} from './lib.ts';

const DENY = new Set([
  'hw',
  'pr',
  'ety',
  'ets',
  'etsep',
  'grk',
  'er',
  'cref',
  'spn',
  'gen',
  'fam',
  'ord',
  'class',
  'phylum',
  'subclass',
  'suborder',
  'subfam',
  'subphylum',
  'asp',
  'wf',
  'plw',
  'pluf',
  'singf',
  'plu',
  'sing',
  'vmorph',
  'amorph',
  'nmorph',
  'conjf',
  'adjf',
  'decf',
  'pos',
  'fld',
  'mark',
  'sn',
  'au',
  'qau',
  'rj',
  'col',
  'mcol',
  'chform',
  'chname',
  'chreact',
  'mathex',
  'fract',
  'ver',
  'wns',
  'person',
  'persfn',
  'country',
  'city',
  'geog',
  'state',
  'river',
  'street',
  'abbr',
  'figref',
  'illust',
  'musfig',
  'table',
  'tr',
  'td',
  'th',
  'pre',
  'row',
  'mtable',
  'matrix',
  'date',
  'sups',
  'subs',
  'exp',
  'fexp',
]);
const ALLOW = new Set([
  'def',
  'cd',
  'note',
  'usage',
  'syn',
  'q',
  'specif',
  'def2',
  'sd',
  'wordforms',
  'altsp',
  'caption',
]);
const INLINE = new Set(['ex', 'xex', 'qex']);
const MAX_DISTANCE = 8;
const PROBE = 20;

interface Finding {
  key: string;
  old: string;
  new: string;
  reason: string;
}

function isFinding(value: unknown): value is Finding {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    'old' in value &&
    'new' in value &&
    typeof value.key === 'string' &&
    typeof value.old === 'string' &&
    typeof value.new === 'string'
  );
}

function readFindings(file: string): Finding[] {
  const parsed = readJson(file);
  const list: unknown =
    typeof parsed === 'object' && parsed !== null && 'findings' in parsed
      ? parsed.findings
      : parsed;
  if (!Array.isArray(list)) throw new Error(`${file}: expected {findings: [...]}`);
  return list.map((item: unknown, index) => {
    if (!isFinding(item)) throw new Error(`${file}: finding ${index} needs key, old, new`);
    return {
      key: item.key,
      old: item.old,
      new: item.new,
      reason: 'reason' in item && typeof item.reason === 'string' ? item.reason : '',
    };
  });
}

export interface Item {
  id: string;
  key: string;
  status: 'accepted' | 'hold' | 'rejected';
  old: string;
  new: string;
  rawStart?: number;
  rawEnd?: number;
  rawOld?: string;
  rawNew?: string;
  container?: string;
  distance?: number;
  gcide?: 'confirmed' | 'shared' | 'both' | 'neither' | 'no-entry';
  wordSwap?: boolean;
  gcideSnippet?: string;
  reason: string;
  problems: string[];
}

export function isItem(value: unknown): value is Item {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'key' in value &&
    'status' in value &&
    'problems' in value
  );
}

const skeleton = (value: unknown): string =>
  JSON.stringify(value, (_, v: unknown) => (typeof v === 'string' ? '' : v));

function snippet(text: string, needle: string): string | undefined {
  const words = loose(needle).split(' ');
  for (const probe of [words.slice(0, 3).join(' '), words.slice(-3).join(' '), words[0]]) {
    const at = probe ? text.indexOf(probe) : -1;
    if (at >= 0) return `…${text.slice(Math.max(0, at - 120), at + probe.length + 120)}…`;
  }
  return undefined;
}

interface Located {
  rawStart: number;
  rawEnd: number;
  rawOld: string;
  rawNew: string;
  container: string;
  distance: number;
  duplicate: boolean;
  insertion: boolean;
  boundary: boolean;
  edgePunctuation: boolean;
  wordSwap: boolean;
  probeOld: string;
  probeNew: string;
}

const words = (text: string): string[] => loose(text).split(' ').filter(Boolean);
let wordList: Set<string> | undefined;
function isWord(word: string): boolean {
  wordList ??= new Set(
    readFileSync('/usr/share/dict/words', 'utf8')
      .split('\n')
      .map((line) => line.toLowerCase())
  );
  return wordList.has(word);
}

function wordInsertion(before: string, after: string): boolean {
  const oldWords = words(before);
  const newWords = words(after);
  if (newWords.length <= oldWords.length) return false;
  let i = 0;
  for (const word of newWords) if (word === oldWords[i]) i++;
  return i === oldWords.length;
}

function nodeEnd(flat: Flat, offset: number): number {
  let i = tokenAt(flat, offset);
  while (i + 1 < flat.tokens.length && flat.tokens[i + 1].start === flat.tokens[i].end) i++;
  return flat.pos[i + 1];
}

function locate(
  entry: PacketEntry,
  flat: Flat,
  oldText: string,
  newText: string
): Located | { problem: string; container?: string } {
  const trimmedOld = oldText.trim();
  const leading = oldText.length - oldText.trimStart().length;
  const trailing = oldText.length - oldText.trimEnd().length;
  const replacement = newText
    .slice(Math.min(leading, newText.length), Math.max(0, newText.length - trailing))
    .trim();
  const pattern = new RegExp(
    trimmedOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'),
    'g'
  );
  const matches = [...flat.text.matchAll(pattern)];
  if (matches.length !== 1)
    return { problem: matches.length ? `ambiguous(${matches.length})` : 'not-found' };
  const start = matches[0].index ?? 0;
  const matched = matches[0][0];
  const end = start + matched.length;
  let prefix = 0;
  while (
    prefix < matched.length &&
    prefix < replacement.length &&
    matched[prefix] === replacement[prefix]
  )
    prefix++;
  let suffix = 0;
  while (
    suffix < Math.min(matched.length, replacement.length) - prefix &&
    matched[matched.length - 1 - suffix] === replacement[replacement.length - 1 - suffix]
  )
    suffix++;
  const changedOld = matched.slice(prefix, matched.length - suffix);
  const changedNew = replacement.slice(prefix, replacement.length - suffix);
  if (!changedOld && !changedNew) return { problem: 'old-equals-new' };
  const windows: [number, number][] = [[start + prefix, end - suffix]];
  let duplicate = false;
  if (!changedNew) {
    const width = changedOld.length;
    if (matched.slice(prefix - width, prefix) === changedOld) {
      duplicate = true;
      windows.push([start + prefix - width, end - suffix - width]);
    }
    if (matched.slice(prefix + width, prefix + 2 * width) === changedOld) {
      duplicate = true;
      windows.push([start + prefix + width, end - suffix + width]);
    }
  }
  let denied: string | undefined;
  for (const [a, b] of windows) {
    const anchor = b > a ? tokenAt(flat, a) : tokenAt(flat, Math.max(0, a - 1));
    const rawStart = b > a || a === 0 ? flat.tokens[anchor].start : flat.tokens[anchor].end;
    const rawEnd = b > a ? flat.tokens[tokenAt(flat, b - 1)].end : rawStart;
    const rawOld = entry.html.slice(rawStart, rawEnd);
    if (rawOld.includes('<')) continue;
    const ancestors = [...flat.tokens[anchor].ancestors].reverse();
    const deniedHere = ancestors.find((cls) => DENY.has(cls));
    if (deniedHere) {
      denied = deniedHere;
      continue;
    }
    const container = ancestors.find((cls) => ALLOW.has(cls));
    if (!container)
      return { problem: `container:${ancestors[0] ?? 'none'}`, container: ancestors[0] ?? 'none' };
    return {
      rawStart,
      rawEnd,
      rawOld,
      rawNew: encodeText(changedNew),
      container,
      distance: levenshtein(changedOld, changedNew),
      duplicate,
      insertion: wordInsertion(matched, replacement),
      boundary:
        b === a &&
        !/^\s*$/.test(changedNew) &&
        a > 0 &&
        a < flat.text.length &&
        flat.tokens[tokenAt(flat, a - 1)].end !== flat.tokens[tokenAt(flat, a)].start,
      edgePunctuation:
        INLINE.has(ancestors[0] ?? '') &&
        /[^\p{L}\p{N}\s]$/u.test(changedNew) &&
        /^\s*$/.test(flat.text.slice(b, nodeEnd(flat, Math.max(a, 1) - 1))),
      wordSwap:
        words(matched).some((word) => !words(replacement).includes(word)) &&
        words(matched)
          .filter((word) => !words(replacement).includes(word))
          .every(isWord),
      probeOld: matched.slice(Math.max(0, prefix - PROBE), matched.length - suffix + PROBE),
      probeNew: replacement.slice(Math.max(0, prefix - PROBE), replacement.length - suffix + PROBE),
    };
  }
  return denied
    ? { problem: `container:${denied}`, container: denied }
    : { problem: 'spans-markup' };
}

export function applyItems(html: string, items: Item[]): { html: string; failed?: Item } {
  const ordered = [...items].sort((a, b) => (b.rawStart ?? 0) - (a.rawStart ?? 0));
  let result = html;
  let floor = Number.POSITIVE_INFINITY;
  for (const item of ordered) {
    if (
      item.rawStart === undefined ||
      item.rawEnd === undefined ||
      item.rawOld === undefined ||
      item.rawNew === undefined
    )
      return { html, failed: item };
    if (item.rawEnd > floor || result.slice(item.rawStart, item.rawEnd) !== item.rawOld)
      return { html, failed: item };
    result = result.slice(0, item.rawStart) + item.rawNew + result.slice(item.rawEnd);
    floor = item.rawStart;
  }
  return { html: result };
}

export function validatePacket(packet: string): {
  items: Item[];
  newRawByKey: Record<string, { oldSha256: string; newRaw: string }>;
} {
  const dir = join(PACKETS, packet);
  const entries = readPacketEntries(packet);
  const findings = readFindings(join(dir, 'findings.json'));
  const seen = new Set<string>();
  const items: Item[] = findings.map((finding, index) => {
    const item: Item = {
      id: `${packet}:${index}`,
      key: finding.key,
      status: 'rejected',
      old: finding.old,
      new: finding.new,
      reason: finding.reason,
      problems: [],
    };
    const entry = entries.get(finding.key);
    if (!entry) return { ...item, problems: ['unknown-key'] };
    if (finding.old === finding.new) return { ...item, problems: ['old-equals-new'] };
    if (/[<>]/.test(finding.new)) return { ...item, problems: ['markup-in-new'] };
    if (finding.old.includes('\uFFFD')) return { ...item, problems: ['replacement-char'] };
    const signature = `${finding.key}\u0000${finding.old}`;
    if (seen.has(signature)) return { ...item, problems: ['duplicate-finding'] };
    seen.add(signature);
    const located = locate(entry, flatten(entry.html), finding.old, finding.new);
    if ('problem' in located)
      return { ...item, container: located.container, problems: [located.problem] };
    const witness = gcideText(entry.gcideKey ?? entry.key);
    let gcide: Item['gcide'] = 'no-entry';
    let gcideSnippet: string | undefined;
    if (witness !== undefined) {
      const text = loose(witness);
      const hasOld = text.includes(loose(located.probeOld));
      const hasNew = text.includes(loose(located.probeNew));
      gcide = hasOld && hasNew ? 'both' : hasNew ? 'confirmed' : hasOld ? 'shared' : 'neither';
      if (gcide === 'neither') gcideSnippet = snippet(text, located.probeOld);
    }
    const holds: string[] = [];
    if (located.distance > MAX_DISTANCE && !located.duplicate)
      holds.push(`large-edit(${located.distance})`);
    if (gcide === 'neither') holds.push('gcide-neither');
    if (located.insertion && gcide !== 'confirmed') holds.push('insertion');
    if (located.boundary) holds.push('boundary-insertion');
    if (located.edgePunctuation) holds.push('edge-punctuation');
    const {
      probeOld: _probeOld,
      probeNew: _probeNew,
      duplicate: _duplicate,
      insertion: _insertion,
      boundary: _boundary,
      edgePunctuation: _edgePunctuation,
      ...fields
    } = located;
    return {
      ...item,
      ...fields,
      status: holds.length ? 'hold' : 'accepted',
      gcide,
      gcideSnippet,
      problems: holds,
    };
  });

  const newRawByKey: Record<string, { oldSha256: string; newRaw: string }> = {};
  const byKey = new Map<string, Item[]>();
  for (const item of items)
    if (item.status === 'accepted') byKey.set(item.key, [...(byKey.get(item.key) ?? []), item]);
  for (const [key, group] of byKey) {
    const entry = entries.get(key);
    if (!entry) continue;
    let applied = applyItems(entry.html, group);
    while (applied.failed) {
      applied.failed.status = 'hold';
      applied.failed.problems.push('overlap');
      applied = applyItems(
        entry.html,
        group.filter((item) => item.status === 'accepted')
      );
    }
    const accepted = group.filter((item) => item.status === 'accepted');
    if (!accepted.length) continue;
    try {
      if (skeleton(parseEntry(key, entry.html)) !== skeleton(parseEntry(key, applied.html)))
        throw new Error('structure-changed');
      newRawByKey[key] = { oldSha256: entry.sha256, newRaw: applied.html };
    } catch (error) {
      for (const item of accepted) {
        item.status = 'hold';
        item.problems.push(error instanceof Error ? error.message : 'parse-failed');
      }
    }
  }
  return { items, newRawByKey };
}

function manifestMarkdown(packet: string, items: Item[]): string {
  const counts = { accepted: 0, hold: 0, rejected: 0 };
  for (const item of items) counts[item.status]++;
  const section = (status: Item['status']): string =>
    items
      .filter((item) => item.status === status)
      .map((item) => {
        const meta = [
          item.gcide ? `gcide: ${item.gcide}` : '',
          item.distance === undefined ? '' : `distance: ${item.distance}`,
          item.container ? `in: ${item.container}` : '',
          ...item.problems,
        ]
          .filter(Boolean)
          .join(' · ');
        const lines = [
          `### ${item.id} ${item.key}`,
          meta,
          `- ${item.old}`,
          `+ ${item.new}`,
          item.rawOld === undefined
            ? ''
            : `raw: ${JSON.stringify(item.rawOld)} → ${JSON.stringify(item.rawNew)}`,
          item.reason ? `reason: ${item.reason}` : '',
        ];
        if (item.gcideSnippet) lines.push(`GCIDE: ${item.gcideSnippet}`);
        return lines.filter(Boolean).join('\n');
      })
      .join('\n\n');
  return `# ${packet} manifest — accepted ${counts.accepted}, hold ${counts.hold}, rejected ${counts.rejected}\n\n## accepted\n\n${section('accepted')}\n\n## hold\n\n${section('hold')}\n\n## rejected\n\n${section('rejected')}\n`;
}

if (import.meta.main) {
  const packet = process.argv[2];
  if (!packet || !existsSync(join(PACKETS, packet, 'findings.json')))
    throw new Error(
      'usage: bun scripts/quick-wins/validate.ts <packet> (needs .cache/quick-wins/packets/<packet>/findings.json)'
    );
  const { items, newRawByKey } = validatePacket(packet);
  const counts = { accepted: 0, hold: 0, rejected: 0 };
  for (const item of items) counts[item.status]++;
  writeFileSync(
    join(PACKETS, packet, 'manifest.json'),
    `${JSON.stringify({ packet, counts, items, newRawByKey }, null, 2)}\n`
  );
  writeFileSync(join(PACKETS, packet, 'manifest.md'), manifestMarkdown(packet, items));
  console.log(
    JSON.stringify(
      {
        packet,
        ...counts,
        problems: items
          .filter((item) => item.status !== 'accepted')
          .map((item) => `${item.id} ${item.key}: ${item.problems.join(',')}`),
      },
      null,
      2
    )
  );
}
