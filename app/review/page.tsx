import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { EntryView } from '~/components/entry';
import { getEntryBySlug } from '~/lib/db.server';
import { appliedReviewIds, reviewDecisions, reviewItems } from '~/lib/review-queue';
import { changeBetween, decodeFragment } from '~/lib/review-text';
import { slugify } from '~/lib/slug';
import { decide } from './actions';

export const metadata: Metadata = { title: "Review — Webster's 1913" };

type ReviewPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  if (process.env.NODE_ENV === 'production') notFound();
  const items = reviewItems();
  const decisions = reviewDecisions();
  const applied = appliedReviewIds();
  const requested = (await searchParams).item;
  const item =
    items.find((candidate) => candidate.id === requested) ??
    items.find((candidate) => !decisions.has(candidate.id)) ??
    items[0];
  if (!item) notFound();
  const decision = decisions.get(item.id);
  const target = decision?.new ?? item.proposed ?? item.old;
  const change = changeBetween(item.old, target);
  const entry = getEntryBySlug(slugify(item.key));

  return (
    <div data-wide className="grid grid-cols-[12rem_1fr] gap-10">
      <nav aria-label="Review items">
        <ol className="space-y-1">
          {items.map((candidate) => (
            <li key={candidate.id}>
              <Link
                href={`/review?item=${encodeURIComponent(candidate.id)}`}
                aria-current={candidate.id === item.id ? 'page' : undefined}
                data-state={
                  applied.has(candidate.id)
                    ? 'applied'
                    : decisions.has(candidate.id)
                      ? 'decided'
                      : 'open'
                }
                className="block rounded-sm px-2 py-1 aria-[current=page]:bg-secondary data-[state=applied]:text-muted-foreground data-[state=applied]:line-through data-[state=decided]:text-muted-foreground"
              >
                {candidate.key}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <article className="min-w-0 space-y-6">
        <header>
          <h1 className="text-4xl font-bold">{item.key}</h1>
          <p className="mt-2">{item.question}</p>
        </header>
        {item.images.map((image) => (
          <figure key={image.file}>
            <img
              src={`/review/image/${image.file}`}
              alt={image.label}
              className="w-full rounded-sm border border-border"
            />
            <figcaption className="mt-1 text-sm text-muted-foreground">{image.label}</figcaption>
          </figure>
        ))}
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
          {item.readings.map((reading) => (
            <Fragment key={reading.reader}>
              <dt className="text-sm text-muted-foreground">{reading.reader}</dt>
              <dd>{reading.text}</dd>
            </Fragment>
          ))}
          <dt className="text-sm text-muted-foreground">Ours</dt>
          <dd>
            {change.prefix}
            <del className="bg-destructive/20 no-underline">{change.removed}</del>
            {change.suffix}
          </dd>
          {target !== item.old && (
            <>
              <dt className="text-sm text-muted-foreground">{decision ? 'Decided' : 'Proposed'}</dt>
              <dd>
                {change.prefix}
                <ins className="bg-chart-2/30 no-underline">{change.added}</ins>
                {change.suffix}
              </dd>
            </>
          )}
        </dl>
        <form action={decide} className="space-y-3">
          <input type="hidden" name="id" value={item.id} />
          <textarea
            key={item.id}
            name="text"
            aria-label="Corrected text"
            defaultValue={decodeFragment(target)}
            rows={4}
            disabled={applied.has(item.id)}
            className="w-full rounded-sm border border-input bg-card p-2 font-mono text-sm"
          />
          <div className="flex gap-3">
            <button
              name="choice"
              value="save"
              disabled={applied.has(item.id)}
              className="rounded-sm bg-primary px-3 py-1 text-primary-foreground disabled:opacity-50"
            >
              Accept
            </button>
            <button
              name="choice"
              value="keep"
              disabled={applied.has(item.id)}
              className="rounded-sm bg-secondary px-3 py-1 text-secondary-foreground disabled:opacity-50"
            >
              Keep ours
            </button>
          </div>
        </form>
        {entry && (
          <details>
            <summary className="cursor-pointer text-sm text-muted-foreground">{entry.key}</summary>
            <div className="mt-4">
              <EntryView entry={entry} />
            </div>
          </details>
        )}
      </article>
    </div>
  );
}
