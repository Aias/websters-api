import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntryView } from '~/components/entry';
import { getEntry } from '~/lib/db.server';

type EntryPageProps = {
  params: Promise<{ word: string }>;
};

function readEntry(word: string) {
  return getEntry(word);
}

export async function generateMetadata({ params }: EntryPageProps): Promise<Metadata> {
  const { word } = await params;
  const entry = readEntry(word);

  if (!entry) {
    return { title: 'Not Found' };
  }

  return { title: `${entry.key} — Webster's 1913` };
}

export default async function EntryPage({ params }: EntryPageProps) {
  const { word } = await params;
  const entry = readEntry(word);

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
