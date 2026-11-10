import { createHash } from 'node:crypto';
import {
  appliedReviewIds,
  recordReviewReceipt,
  reviewDecisions,
  reviewItems,
  type ReviewReceipt,
} from '../../app/lib/review-queue.ts';
import { readDictionarySource, writeDictionarySource } from '../dictionary-source.ts';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const decisions = reviewDecisions();
const applied = appliedReviewIds();
const source = readDictionarySource();
const receipts: ReviewReceipt[] = [];

for (const item of reviewItems()) {
  const decision = decisions.get(item.id);
  if (!decision || applied.has(item.id)) continue;
  const raw = source.get(item.key);
  if (raw === undefined) throw Error(`Missing key ${item.key}`);
  const count = raw.split(item.old).length - 1;
  if (count !== 1) throw Error(`Anchor count ${count} for ${item.id}`);
  source.set(item.key, raw.replace(item.old, decision.new));
  receipts.push({
    id: item.id,
    key: item.key,
    oldSha256: sha256(raw),
    newSha256: sha256(source.get(item.key) ?? ''),
  });
}

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ dryRun: true, wouldApply: receipts.map((receipt) => receipt.id) }));
} else {
  if (receipts.some((receipt) => receipt.oldSha256 !== receipt.newSha256))
    writeDictionarySource(source);
  receipts.forEach(recordReviewReceipt);
  console.log(JSON.stringify({ applied: receipts.map((receipt) => receipt.id) }));
}
