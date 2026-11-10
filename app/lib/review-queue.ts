import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';

export type ReviewItem = {
  id: string;
  key: string;
  question: string;
  old: string;
  proposed: string | null;
  readings: { reader: string; text: string }[];
  images: { label: string; file: string }[];
};

export type ReviewDecision = { id: string; new: string; decidedAt: string };

export type ReviewReceipt = { id: string; key: string; oldSha256: string; newSha256: string };

const DIRECTORY = join(process.cwd(), '.cache', 'review');
export const REVIEW_IMAGES = join(DIRECTORY, 'images');
const ITEMS = join(DIRECTORY, 'items.jsonl');
const DECISIONS = join(DIRECTORY, 'decisions.jsonl');
const RECEIPTS = join(DIRECTORY, 'applied.jsonl');

function lines(file: string): string[] {
  return existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean) : [];
}

export function reviewItems(): ReviewItem[] {
  return lines(ITEMS).map((line): ReviewItem => JSON.parse(line));
}

export function reviewDecisions(): Map<string, ReviewDecision> {
  const decisions = lines(DECISIONS).map((line): ReviewDecision => JSON.parse(line));
  return new Map(decisions.map((decision) => [decision.id, decision]));
}

export function appliedReviewIds(): Set<string> {
  return new Set(
    lines(RECEIPTS)
      .map((line): ReviewReceipt => JSON.parse(line))
      .map((receipt) => receipt.id)
  );
}

export async function recordReviewDecision(decision: ReviewDecision): Promise<void> {
  await appendFile(DECISIONS, `${JSON.stringify(decision)}\n`);
}

export function recordReviewReceipt(receipt: ReviewReceipt): void {
  appendFileSync(RECEIPTS, `${JSON.stringify(receipt)}\n`);
}
