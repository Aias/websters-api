import Link from 'next/link';
import { EntryView } from '~/components/entry';
import { getRandomEntry, searchEntries, semanticSearch } from '~/lib/db.server';

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
  const prefixResults = q ? searchEntries(q, 50) : [];
  const semanticResults = q && prefixResults.length === 0 ? await semanticSearch(q, 20) : [];

  return (
    <>
      {q && prefixResults.length > 0 && (
        <ul className="space-y-1">
          {prefixResults.map((result) => (
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

      {q && prefixResults.length === 0 && semanticResults.length > 0 && (
        <>
          <p className="mb-2 text-sm text-muted-foreground">Similar to &ldquo;{q}&rdquo;:</p>
          <ul className="space-y-1">
            {semanticResults.map((result) => (
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
        </>
      )}

      {q && prefixResults.length === 0 && semanticResults.length === 0 && (
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
    </>
  );
}
