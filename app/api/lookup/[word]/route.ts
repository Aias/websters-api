import { findClosestEntry } from '~/lib/db.server';

export async function GET(_request: Request, { params }: { params: Promise<{ word: string }> }) {
  const { word } = await params;
  const entry = findClosestEntry(word);

  if (!entry) {
    return Response.json({ exists: false });
  }

  return Response.json({ exists: true, key: entry.key });
}
