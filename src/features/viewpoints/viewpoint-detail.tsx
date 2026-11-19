"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { getViewpoint, subscribeToViewpoints, type SubmittedViewpoint } from "@/lib/viewpoint-store";
import type { Viewpoint } from "@/lib/mock-viewpoints";
import { RichText } from "@/features/viewpoints/rich-text";
import { getDirectionsUrl } from "@/features/viewpoints/directions";

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
          {"description" in viewpoint ? (
            <RichText value={viewpoint.description} />
          ) : (
            <p className="detail-description">{viewpoint.note}</p>
          )}
          <div className="detail-location">
            <MapPin size={16} aria-hidden="true" />
            <span>{viewpoint.latitude.toFixed(5)}, {viewpoint.longitude.toFixed(5)}</span>
          </div>
          <a
            className="directions-link"
            href={getDirectionsUrl(viewpoint.latitude, viewpoint.longitude)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Navigation aria-hidden="true" size={16} />
            <span>Get directions</span>
          </a>
        </div>
      </article>
    </main>
  );
}
