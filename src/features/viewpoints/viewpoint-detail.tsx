"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import {
  fetchSubmittedViewpoint,
  getMockViewpoint,
  type SubmittedViewpoint,
} from "@/lib/viewpoint-store";
import type { Viewpoint } from "@/lib/mock-viewpoints";
import { RichText } from "@/features/viewpoints/rich-text";
import { getDirectionsUrl } from "@/features/viewpoints/directions";

function ViewpointImage({ name, src }: { name: string; src: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="detail-image-wrap" aria-busy={!imageLoaded && !imageFailed}>
      {!imageLoaded && !imageFailed && (
        <div className="detail-image-loading" role="status">Loading photo…</div>
      )}
      {imageFailed ? (
        <div className="detail-image-error" role="alert">
          <MapPin size={22} aria-hidden="true" />
          <span>The photo couldn&apos;t be loaded.</span>
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={imageLoaded ? "detail-image loaded" : "detail-image"}
            src={src}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        </>
      )}
    </div>
  );
}

export function ViewpointDetail({ id }: { id: string }) {
  const [viewpoint, setViewpoint] = useState<
    Viewpoint | SubmittedViewpoint | undefined
  >(() => getMockViewpoint(id));
  const [loading, setLoading] = useState(() => !getMockViewpoint(id));
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    const mock = getMockViewpoint(id);
    if (mock) {
      return () => {
        active = false;
      };
    }

    void fetchSubmittedViewpoint(id)
      .then((submitted) => {
        if (active) setViewpoint(submitted);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not load viewpoint from Supabase.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="detail-shell detail-not-found">
        <p className="eyebrow">One moment</p>
        <h1>Loading viewpoint…</h1>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="detail-shell detail-not-found">
        <p className="eyebrow">Couldn&apos;t load this place</p>
        <h1>{loadError}</h1>
        <Link className="detail-back-link" href="/map">Back to the map</Link>
      </main>
    );
  }

  if (!viewpoint) {
    return (
      <main className="detail-shell detail-not-found">
        <p className="eyebrow">Nothing here</p>
        <h1>We couldn&apos;t find that viewpoint.</h1>
        <p>It may have moved or the link may be incomplete.</p>
        <Link className="detail-back-link" href="/map">Back to the map</Link>
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
        <ViewpointImage key={viewpoint.image} name={viewpoint.name} src={viewpoint.image} />
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
