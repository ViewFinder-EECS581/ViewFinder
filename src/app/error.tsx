
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ViewpointError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="route-state" role="alert">
      <p className="eyebrow">Something went wrong</p>
      <h1>We couldn&apos;t load this viewpoint.</h1>
      <p>Check your connection, then try again.</p>
      <div className="route-state-actions">
        <button className="route-state-action" type="button" onClick={() => retry()}>
          Try again
        </button>
        <Link className="route-state-action" href="/map">
          Back to the map
        </Link>
      </div>
    </main>
  );
}
