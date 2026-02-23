import { searchEntries } from '~/lib/db.server';

export function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';

  if (!q) {
    return Response.json([]);
  }

  return Response.json(searchEntries(q, 20));
}
