'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <h1 className="mb-3 text-3xl font-bold">Something went wrong</h1>
      <p className="mb-6 text-muted-foreground">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-input px-4 py-2 hover:bg-secondary"
      >
        Try again
      </button>
    </>
  );
}
