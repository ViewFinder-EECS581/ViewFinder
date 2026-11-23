import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main className="route-state">
      <Spinner label="Loading ViewFinder…" />
      {/* Visible copy only; Spinner's label is what screen readers announce. */}
      <p aria-hidden="true">Loading ViewFinder…</p>
    </main>
  );
}
