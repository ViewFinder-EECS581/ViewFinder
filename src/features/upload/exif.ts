import { parse } from "exifr";

export type PhotoMetadata = {
  /** Signed decimal degrees (south and west are negative). */
  latitude?: number;
  longitude?: number;
  /**
   * When the photo was taken, as "YYYY-MM-DDTHH:mm" (the format of a
   * `datetime-local` input). EXIF stores camera-local wall-clock time without a
   * time zone, so this is deliberately not converted to UTC.
   */
  capturedAt?: string;
};

export function isValidCoordinates(latitude: unknown, longitude: unknown): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    // Many cameras write 0,0 when they had no GPS fix. That is not a real
    // viewpoint location, so treat it as "no location".
    !(latitude === 0 && longitude === 0)
  );
}

/**
 * Converts an EXIF date ("2024:06:03 16:12:09") to "2024-06-03T16:12".
 * Returns undefined for anything that is not a real calendar date/time.
 */
export function parseExifDateTime(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const match = /^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(
    value.trim(),
  );
  if (!match) return undefined;

  const [year, month, day, hour, minute] = match.slice(1, 6).map(Number);
  if (year < 1900 || month < 1 || month > 12 || hour > 23 || minute > 59) {
    return undefined;
  }

  // Reject impossible dates such as February 30th (and the all-zero date that
  // some cameras write when their clock was never set).
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return undefined;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${String(year).padStart(4, "0")}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

/**
 * Reads GPS location and capture time from a photo. Never throws: a photo
 * without EXIF (or with damaged EXIF) simply yields an empty result so the
 * user can fall back to entering the details by hand.
 */
export async function extractPhotoMetadata(
  input: ArrayBuffer | Uint8Array,
): Promise<PhotoMetadata> {
  let tags: Record<string, unknown> | undefined;
  try {
    tags = await parse(input, {
      gps: true,
      exif: true,
      tiff: true,
      // Keep raw values so dates stay as strings and we control the parsing.
      reviveValues: false,
      translateValues: false,
    });
  } catch {
    return {};
  }
  if (!tags) return {};

  const metadata: PhotoMetadata = {};

  if (isValidCoordinates(tags.latitude, tags.longitude)) {
    metadata.latitude = tags.latitude as number;
    metadata.longitude = tags.longitude as number;
  }

  const capturedAt =
    parseExifDateTime(tags.DateTimeOriginal) ??
    parseExifDateTime(tags.CreateDate) ??
    parseExifDateTime(tags.DateTime);
  if (capturedAt) metadata.capturedAt = capturedAt;

  return metadata;
}