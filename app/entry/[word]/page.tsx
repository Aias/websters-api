import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { EntryView } from '~/components/entry';
import { getEntry } from '~/lib/db.server';

type EntryPageProps = {
  params: Promise<{ word: string }>;
};

export async function generateMetadata({ params }: EntryPageProps): Promise<Metadata> {
  const { word } = await params;
  const entry = getEntry(word);

  if (!entry) {
    return { title: 'Not Found' };
  }

  return { title: `${entry.key} — Webster's 1913` };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const { word } = await params;
  const lowercase = word.toLowerCase();
  if (word !== lowercase) {
    permanentRedirect(`/entry/${encodeURIComponent(lowercase)}`);
  }
  const entry = getEntry(word);

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
