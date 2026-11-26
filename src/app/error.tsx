"use client";

import { useEffect } from "react";
import Link from "next/link";
import { InlineError } from "@/components/ui/inline-error";

export default function ViewpointError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="route-state">
      <p className="eyebrow">Something went wrong</p>
      <h1>We couldn&apos;t load this viewpoint.</h1>
      <InlineError
        message="Check your connection, then try again."
        onRetry={reset}
      />
      <div className="route-state-actions">
        <Link className="route-state-action" href="/map">
          Back to the map
        </Link>
      </div>
    </main>
  );
}