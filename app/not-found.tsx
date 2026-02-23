import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1 className="mb-3 text-3xl font-bold">Not Found</h1>
      <p className="mb-6 text-muted-foreground">Could not find the requested dictionary entry.</p>
      <Link href="/" className="hover:underline">
        &larr; Back to search
      </Link>
    </>
  );
}
