import Link from "next/link";

export default function NotFound() {
  return (
    <main className="route-state">
      <p className="eyebrow">404 · Not found</p>
      <h1>We couldn&apos;t find that page.</h1>
      <p>The place or address may have changed.</p>
      <Link className="route-state-action" href="/map">Back to the map</Link>
    </main>
  );
}
