
import type { Viewpoint } from "@/lib/mock-viewpoints";

export const DEFAULT_CREATOR_NAME = "A ViewFinder member";

/** Route params can arrive percent-encoded; never throw on malformed input. */
export function normalizeViewpointId(rawId: string): string {
  try {
    return decodeURIComponent(rawId).trim();
  } catch {
    return rawId.trim();
  }
}

export function getCreatorName(viewpoint: Pick<Viewpoint, "creator">): string {
  const name = viewpoint.creator?.trim();
  return name ? name : DEFAULT_CREATOR_NAME;
}

/** Alt text that says what the photo shows and where, not just the title. */
export function getPhotoAltText(viewpoint: Pick<Viewpoint, "name" | "area">): string {
  const place = viewpoint.area.replace(/\s*·\s*/g, ", ").trim();
  return place
    ? `Photo of ${viewpoint.name}, a viewpoint in ${place}`
    : `Photo of ${viewpoint.name}`;
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(5)}° ${latitude >= 0 ? "N" : "S"}`;
  const lng = `${Math.abs(longitude).toFixed(5)}° ${longitude >= 0 ? "E" : "W"}`;
  return `${lat}, ${lng}`;
}

const SAMPLE_PHOTO_WIDTH = 1600;

/**
 * Sample photos are Unsplash thumbnails sized for map cards (w=720). The
 * detail page asks the CDN for a larger rendition. Uploaded photos are already
 * the original file and are returned unchanged.
 */
export function getDetailImageUrl(image: string): string {
  try {
    const url = new URL(image);
    if (url.hostname === "images.unsplash.com" && url.searchParams.has("w")) {
      url.searchParams.set("w", String(SAMPLE_PHOTO_WIDTH));
      return url.toString();
    }
  } catch {
    // Not an absolute URL (for example a relative path): use it as-is.
  }
  return image;
}