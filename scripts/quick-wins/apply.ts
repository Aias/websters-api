import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readDictionarySource, writeDictionarySource } from '../dictionary-source.ts';
import { PACKETS, WORK, readJson, readPacketEntries, sha256 } from './lib.ts';
import { applyItems, isItem, type Item } from './validate.ts';

const dryRun = process.argv.includes('--dry-run');
const only = process.argv
  .find((arg) => arg.startsWith('--packets='))
  ?.slice('--packets='.length)
  .split(',');

interface Decision {
  id: string;
  decision: 'accept' | 'hold';
  note?: string;
}

function isDecision(value: unknown): value is Decision {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'decision' in value &&
    (value.decision === 'accept' || value.decision === 'hold')
  );
}

export function readDecisions(
  packet: string,
  name: 'review.json' | 'integrator.json'
): Map<string, Decision> {
  const file = join(PACKETS, packet, name);
  const decisions = new Map<string, Decision>();
  if (!existsSync(file)) return decisions;
  const parsed = readJson(file);
  const list: unknown =
    typeof parsed === 'object' && parsed !== null && 'decisions' in parsed ? parsed.decisions : [];
  if (Array.isArray(list))
    for (const entry of list) if (isDecision(entry)) decisions.set(entry.id, entry);
  return decisions;
}

export function finalItems(packet: string): Item[] {
  const parsed = readJson(join(PACKETS, packet, 'manifest.json'));
  const items: unknown =
    typeof parsed === 'object' && parsed !== null && 'items' in parsed ? parsed.items : [];
  const vetoes = readDecisions(packet, 'review.json');
  const integrator = readDecisions(packet, 'integrator.json');
  return (Array.isArray(items) ? items.filter(isItem) : []).filter((item) => {
    if (item.status === 'rejected' || vetoes.get(item.id)?.decision === 'hold') return false;
    const decision = integrator.get(item.id)?.decision;
    return decision ? decision === 'accept' : item.status === 'accepted';
  });
}

if (import.meta.main) {
  const packets = readdirSync(PACKETS)
    .filter(
      (name) =>
        /^p\d{3}$/.test(name) &&
        (!only || only.includes(name)) &&
        existsSync(join(PACKETS, name, 'manifest.json'))
    )
    .sort();
  const source = readDictionarySource();
  const byKey = new Map<string, { packet: string; items: Item[] }>();
  const summary = {
    packets: packets.length,
    applied: 0,
    keys: 0,
    skipped: [] as string[],
    unreviewed: [] as string[],
  };
  for (const packet of packets) {
    if (!existsSync(join(PACKETS, packet, 'review.json'))) summary.unreviewed.push(packet);
    for (const item of finalItems(packet)) {
      const existing = byKey.get(item.key);
      if (existing && existing.packet !== packet)
        throw new Error(`${item.key} patched by ${existing.packet} and ${packet}`);
      byKey.set(item.key, { packet, items: [...(existing?.items ?? []), item] });
    }
  }
  const frozenByPacket = new Map<string, Map<string, string>>();
  const ledger: {
    key: string;
    packet: string;
    ids: string[];
    oldSha256: string;
    newSha256: string;
  }[] = [];
  for (const [key, { packet, items }] of byKey) {
    const frozen =
      frozenByPacket.get(packet) ??
      new Map([...readPacketEntries(packet)].map(([k, entry]) => [k, entry.sha256]));
    frozenByPacket.set(packet, frozen);
    const current = source.get(key);
    const expected = frozen.get(key);
    if (current === undefined || expected === undefined || sha256(current) !== expected) {
      summary.skipped.push(`${key}: source changed since freeze`);
      continue;
    }
    const applied = applyItems(current, items);
    if (applied.failed) {
      summary.skipped.push(`${key}: ${applied.failed.id} does not match the current source`);
      continue;
    }
    source.set(key, applied.html);
    ledger.push({
      key,
      packet,
      ids: items.map((item) => item.id),
      oldSha256: expected,
      newSha256: sha256(applied.html),
    });
    summary.applied += items.length;
    summary.keys += 1;
  }
  if (!dryRun) {
    writeDictionarySource(source);
    mkdirSync(join(WORK, 'applied'), { recursive: true });
    writeFileSync(
      join(WORK, 'applied', `${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
      `${JSON.stringify({ summary, ledger }, null, 2)}\n`
    );
  }
  console.log(JSON.stringify({ dryRun, ...summary }, null, 2));
}
