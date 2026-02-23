import Link from 'next/link';
import { EntryView } from '~/components/entry';
import { getRandomEntry, searchEntries } from '~/lib/db.server';

type HomePageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export const dynamic = 'force-dynamic';

function normalizeQuery(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? '';
  }

  return value?.trim() ?? '';
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q: rawQuery } = await searchParams;
  const q = normalizeQuery(rawQuery);
  const featured = q ? null : getRandomEntry();
  const results = q ? searchEntries(q, 50) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-4xl font-bold">Webster&rsquo;s 1913</h1>

      <form action="/" method="get" className="mb-8">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Look up a word..."
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-lg text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          autoFocus
        />
      </form>

      {q && results.length > 0 && (
        <ul className="space-y-1">
          {results.map((result) => (
            <li key={result.key}>
              <Link
                href={`/entry/${encodeURIComponent(result.key)}`}
                className="text-foreground/80 hover:text-foreground hover:underline"
              >
                {result.key}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {q && results.length === 0 && (
        <p className="text-muted-foreground">No entries found for &ldquo;{q}&rdquo;</p>
      )}

      {!q && featured && (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">Random entry:</p>
          <h2 className="mb-4 text-2xl font-bold">
            <Link href={`/entry/${encodeURIComponent(featured.key)}`} className="hover:underline">
              {featured.key}
            </Link>
          </h2>
          <EntryView entry={featured} />
        </div>
      )}
    </div>
  );
}
