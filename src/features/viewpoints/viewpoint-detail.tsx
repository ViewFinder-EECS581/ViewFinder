"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Navigation, UserRound } from "lucide-react";
import {
  findViewpoint,
  getViewpointStoreServerSnapshot,
  getViewpointStoreSnapshot,
  subscribeToViewpoints,
} from "@/lib/viewpoint-store";
import { RichText } from "@/features/viewpoints/rich-text";
import { getDirectionsUrl } from "@/features/viewpoints/directions";
import {
  formatCapturedAt,
  formatCoordinates,
  getCreatorName,
  getDetailImageUrl,
  getPhotoAltText,
  normalizeViewpointId,
} from "@/features/viewpoints/detail-model";

function DetailHeader() {
  return (
    <header className="detail-header">
      <Link className="wordmark" href="/map" aria-label="ViewFinder map">
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <span>viewfinder</span>
      </Link>
      <Link className="upload-back" href="/map"><ArrowLeft size={16} aria-hidden="true" /> Back to map</Link>
    </header>
  );
}

function ViewpointImage({ alt, src }: { alt: string; src: string }) {
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
            alt={alt}
            decoding="async"
            fetchPriority="high"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        </>
      )}
    </div>
  );
}

function DetailLoading() {
  return (
    <main className="detail-shell" aria-busy="true">
      <DetailHeader />
      <div className="detail-layout" role="status">
        <span className="sr-only">Loading viewpoint…</span>
        <div className="detail-skeleton detail-skeleton-image" aria-hidden="true" />
        <div className="detail-copy" aria-hidden="true">
          <div className="detail-skeleton detail-skeleton-line short" />
          <div className="detail-skeleton detail-skeleton-title" />
          <div className="detail-skeleton detail-skeleton-line" />
          <div className="detail-skeleton detail-skeleton-line" />
          <div className="detail-skeleton detail-skeleton-line medium" />
        </div>
      </div>
    </main>
  );
}

function DetailNotFound() {
  return (
    <main className="detail-shell detail-not-found">
      <p className="eyebrow">Nothing here</p>
      <h1>We couldn&apos;t find that viewpoint.</h1>
      <p>It may have moved, or the link may be incomplete.</p>
      <Link className="detail-back-link" href="/map">Back to the map</Link>
    </main>
  );
}

export function ViewpointDetail({ id }: { id: string }) {
  // Submitted viewpoints live in browser storage, which the server cannot
  // read. The server snapshot is `null` ("not read yet"), so a direct visit to
  // /viewpoints/[id] shows a loading state instead of a false "not found",
  // and hydration never disagrees with the server HTML.
  const rawStore = useSyncExternalStore(
    subscribeToViewpoints,
    getViewpointStoreSnapshot,
    getViewpointStoreServerSnapshot,
  );
  const viewpoint = findViewpoint(normalizeViewpointId(id), rawStore);

  if (!viewpoint) {
    return rawStore === null ? <DetailLoading /> : <DetailNotFound />;
  }

  const creator = getCreatorName(viewpoint);
  const capturedAt = formatCapturedAt(viewpoint.capturedAt);

  return (
    <main className="detail-shell">
      <DetailHeader />
      <article className="detail-layout" aria-labelledby="viewpoint-title">
        <ViewpointImage
          key={viewpoint.image}
          alt={getPhotoAltText(viewpoint)}
          src={getDetailImageUrl(viewpoint.image)}
        />
        <div className="detail-copy">
          <p className="eyebrow">{viewpoint.area}</p>
          <h1 id="viewpoint-title">{viewpoint.name}</h1>
          <p className="detail-creator">
            <UserRound size={15} aria-hidden="true" />
            <span>Shared by <strong>{creator}</strong></span>
          </p>
          {capturedAt && <p className="detail-captured">Photographed {capturedAt}</p>}
          {"description" in viewpoint ? (
            <RichText value={viewpoint.description} />
          ) : (
            <p className="detail-description">{viewpoint.note}</p>
          )}
          <div className="detail-location">
            <MapPin size={16} aria-hidden="true" />
            <span className="sr-only">Coordinates: </span>
            <span>{formatCoordinates(viewpoint.latitude, viewpoint.longitude)}</span>
          </div>
          <a
            className="directions-link"
            href={getDirectionsUrl(viewpoint.latitude, viewpoint.longitude)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Navigation aria-hidden="true" size={16} />
            <span>Get directions</span>
            <span className="sr-only"> to {viewpoint.name} (opens in a new tab)</span>
          </a>
        </div>
      </article>
    </main>
  );
}