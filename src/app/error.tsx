"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="route-state" role="alert">
      <p className="eyebrow">Something went wrong</p>
      <h1>ViewFinder couldn&apos;t finish loading.</h1>
      <p>Check your connection, then try again.</p>
      <button className="route-state-action" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
