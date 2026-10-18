import type { Metadata } from 'next';
import Link from 'next/link';
import { getAuthors } from '~/lib/db.server';

export const metadata: Metadata = { title: "Authors — Webster's 1913" };

export default function AuthorsPage() {
  return (
    <>
      <h1 className="mb-6 text-4xl font-bold">Authors</h1>
      <ol className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-6 gap-y-1">
        {getAuthors().map((author) => (
          <li key={author.slug} className="flex items-baseline justify-between gap-2">
            <Link
              href={`/authors/${author.slug}`}
              className="text-foreground/80 hover:text-foreground hover:underline"
            >
              {author.name}
            </Link>
            <span className="text-sm text-muted-foreground tabular-nums">
              {author.quotationCount.toLocaleString('en-US')}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
