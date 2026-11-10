import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { notFound } from 'next/navigation';
import { REVIEW_IMAGES } from '~/lib/review-queue';

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (process.env.NODE_ENV === 'production' || !/^[\w.-]+\.png$/.test(file)) notFound();
  const image = await readFile(join(REVIEW_IMAGES, file)).catch(() => null);
  if (!image) notFound();
  return new Response(image, { headers: { 'Content-Type': 'image/png' } });
}
