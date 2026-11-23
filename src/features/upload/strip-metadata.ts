import { orientation as readOrientation } from "exifr";
import { PhotoUploadError, type PhotoMimeType } from "./upload-service";

/**
 * Removes embedded metadata (EXIF, XMP, IPTC, text comments) from an image so
 * that stored and public copies never carry the photographer's GPS location.
 *
 * This only rewrites the container: the compressed pixel data is copied
 * byte-for-byte, so there is no re-encoding and no quality loss.
 *
 * JPEG photos keep a minimal EXIF block holding only the Orientation tag.
 * Phones record "rotate me" there rather than rotating the pixels, so without
 * it portrait photos would display sideways.
 */
export async function stripImageMetadata(
  bytes: Uint8Array,
  type: PhotoMimeType,
): Promise<Uint8Array> {
  try {
    if (type === "image/jpeg") {
      return stripJpeg(bytes, await readJpegOrientation(bytes));
    }
    if (type === "image/png") return stripPng(bytes);
    return stripWebp(bytes);
  } catch (error) {
    if (error instanceof PhotoUploadError) throw error;
    throw malformed();
  }
}

function malformed(): PhotoUploadError {
  return new PhotoUploadError("The photo could not be processed. Try a different image.");
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end));
}

async function readJpegOrientation(bytes: Uint8Array): Promise<number | undefined> {
  try {
    const value = await readOrientation(bytes);
    return typeof value === "number" && value >= 2 && value <= 8 ? value : undefined;
  } catch {
    return undefined;
  }
}

/** An APP1 segment whose only EXIF tag is Orientation (big-endian TIFF). */
export function buildOrientationSegment(orientation: number): Uint8Array {
  return Uint8Array.from([
    0xff, 0xe1, 0x00, 0x22, // APP1 marker, length 34
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // "MM", 42, IFD0 at offset 8
    0x00, 0x01, // one entry
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, // tag 0x0112, SHORT, count 1
    0x00, orientation, 0x00, 0x00, // value
    0x00, 0x00, 0x00, 0x00, // no next IFD
  ]);
}

function isExifSegment(bytes: Uint8Array, payloadStart: number): boolean {
  return ascii(bytes, payloadStart, payloadStart + 6) === "Exif\0\0";
}

function stripJpeg(bytes: Uint8Array, orientation: number | undefined): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw malformed();

  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  let orientationWritten = false;
  let i = 2;

  while (i < bytes.length) {
    if (bytes[i] !== 0xff) throw malformed();
    // Skip any 0xFF fill bytes before the marker code.
    while (i + 1 < bytes.length && bytes[i + 1] === 0xff) i++;
    if (i + 1 >= bytes.length) throw malformed();
    const marker = bytes[i + 1];

    if (marker === 0xd9) {
      parts.push(bytes.subarray(i));
      break;
    }
    if (marker === 0xda) {
      // Start of scan: the rest of the file is image data. Copy it untouched.
      parts.push(bytes.subarray(i));
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(bytes.subarray(i, i + 2));
      i += 2;
      continue;
    }

    if (i + 4 > bytes.length) throw malformed();
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    const end = i + 2 + length;
    if (length < 2 || end > bytes.length) throw malformed();

    // APP1 holds EXIF and XMP, APP13 holds Photoshop/IPTC, COM is free text.
    const drop = marker === 0xe1 || marker === 0xed || marker === 0xfe;
    if (!drop) {
      parts.push(bytes.subarray(i, end));
    } else if (
      marker === 0xe1 &&
      !orientationWritten &&
      orientation &&
      isExifSegment(bytes, i + 4)
    ) {
      parts.push(buildOrientationSegment(orientation));
      orientationWritten = true;
    }
    i = end;
  }

  return concat(parts);
}

const PNG_DROPPED_CHUNKS = new Set(["eXIf", "tEXt", "zTXt", "iTXt"]);

function stripPng(bytes: Uint8Array): Uint8Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  let i = 8;

  while (i + 12 <= bytes.length) {
    const length = view.getUint32(i);
    const end = i + 12 + length;
    if (end > bytes.length) throw malformed();

    const chunkType = ascii(bytes, i + 4, i + 8);
    if (!PNG_DROPPED_CHUNKS.has(chunkType)) parts.push(bytes.subarray(i, end));
    i = end;
    if (chunkType === "IEND") break;
  }

  return concat(parts);
}

const WEBP_DROPPED_CHUNKS = new Set(["EXIF", "XMP "]);
const WEBP_VP8X_EXIF_FLAG = 0x08;
const WEBP_VP8X_XMP_FLAG = 0x04;

function stripWebp(bytes: Uint8Array): Uint8Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const declaredEnd = Math.min(bytes.length, view.getUint32(4, true) + 8);
  const parts: Uint8Array[] = [bytes.slice(0, 12)];
  let i = 12;

  while (i + 8 <= declaredEnd) {
    const size = view.getUint32(i + 4, true);
    const end = i + 8 + size + (size & 1); // chunks are padded to even length
    if (end > bytes.length) throw malformed();

    const chunkType = ascii(bytes, i, i + 4);
    if (!WEBP_DROPPED_CHUNKS.has(chunkType)) {
      const chunk = bytes.slice(i, end);
      if (chunkType === "VP8X" && size >= 1) {
        // Tell decoders there is no longer any EXIF or XMP chunk.
        chunk[8] &= ~(WEBP_VP8X_EXIF_FLAG | WEBP_VP8X_XMP_FLAG);
      }
      parts.push(chunk);
    }
    i = end;
  }

  const out = concat(parts);
  new DataView(out.buffer).setUint32(4, out.length - 8, true);
  return out;
}