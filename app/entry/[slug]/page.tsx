import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { EntryView } from '~/components/entry';
import { getEntryBySlug } from '~/lib/db.server';
import { slugify } from '~/lib/slug';

type EntryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntryBySlug(decodeURIComponent(slug));

  if (!entry) {
    return { title: 'Not Found' };
  }

  return { title: `${entry.key} — Webster's 1913` };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const slug = decodeURIComponent((await params).slug);
  const canonical = slugify(slug);
  if (canonical && slug !== canonical) {
    permanentRedirect(`/entry/${encodeURIComponent(canonical)}`);
  }
  const entry = getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  return (
    <>
      <h1 className="mb-6 text-4xl font-bold">{entry.key}</h1>
      <EntryView entry={entry} />
    </>
  );
}
