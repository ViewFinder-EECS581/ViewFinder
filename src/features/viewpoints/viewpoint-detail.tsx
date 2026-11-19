"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { getViewpoint, subscribeToViewpoints, type SubmittedViewpoint } from "@/lib/viewpoint-store";
import type { Viewpoint } from "@/lib/mock-viewpoints";

export function ViewpointDetail({ id }: { id: string }) {
  const [viewpoint, setViewpoint] = useState<Viewpoint | SubmittedViewpoint | undefined>(() => getViewpoint(id));

  useEffect(() => {
    return subscribeToViewpoints(() => setViewpoint(getViewpoint(id)));
  }, [id]);

  if (!viewpoint) {
    return (
      <main className="detail-shell detail-not-found">
        <h1>Viewpoint not found</h1>
        <Link href="/map">Back to the map</Link>
      </main>
    );
  }

  return (
    <main className="detail-shell">
      <header className="detail-header">
        <Link className="wordmark" href="/map" aria-label="ViewFinder map">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>viewfinder</span>
        </Link>
        <Link className="upload-back" href="/map"><ArrowLeft size={16} /> Back to map</Link>
      </header>
      <article className="detail-layout">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="detail-image" src={viewpoint.image} alt={viewpoint.name} />
        <div className="detail-copy">
          <p className="eyebrow">{viewpoint.area}</p>
          <h1>{viewpoint.name}</h1>
          <p className="detail-description">{viewpoint.note}</p>
          <div className="detail-location">
            <MapPin size={16} aria-hidden="true" />
            <span>{viewpoint.latitude.toFixed(5)}, {viewpoint.longitude.toFixed(5)}</span>
          </div>
        </div>
      </article>
    </main>
  );
}
