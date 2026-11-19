export default function Loading() {
  return (
    <main className="route-state" role="status" aria-live="polite">
      <div className="route-state-spinner" aria-hidden="true" />
      <p>Loading ViewFinder…</p>
    </main>
  );
}
