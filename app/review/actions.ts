'use server';

import { notFound, redirect } from 'next/navigation';
import {
  appliedReviewIds,
  recordReviewDecision,
  reviewDecisions,
  reviewItems,
} from '~/lib/review-queue';
import { encodeEdit, tagsOf } from '~/lib/review-text';

export async function decide(formData: FormData) {
  if (process.env.NODE_ENV === 'production') notFound();
  const id = formData.get('id');
  const text = formData.get('text');
  if (typeof id !== 'string' || typeof text !== 'string') throw new Error('Malformed decision');
  const items = reviewItems();
  const item = items.find((candidate) => candidate.id === id);
  if (!item || appliedReviewIds().has(id)) notFound();
  const base = item.proposed ?? item.old;
  const kept = formData.get('choice') === 'keep';
  const next = kept ? item.old : encodeEdit(base, text.replace(/\r\n/g, '\n'));
  if (!kept && tagsOf(next) !== tagsOf(base)) throw new Error('The markup tags changed');
  await recordReviewDecision({ id, new: next, decidedAt: new Date().toISOString() });
  const decisions = reviewDecisions();
  const following = items.find((candidate) => !decisions.has(candidate.id)) ?? item;
  redirect(`/review?item=${encodeURIComponent(following.id)}`);
}
