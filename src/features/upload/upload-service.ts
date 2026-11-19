export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type PhotoMimeType = (typeof ALLOWED_PHOTO_TYPES)[number];

export type PhotoUploadResult = {
  path: string;
  publicUrl: string;
};

export class PhotoUploadError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export function getFriendlyUploadError(error: unknown): string {
  if (
    error instanceof TypeError ||
    (error instanceof Error &&
      /failed to fetch|network|load failed/i.test(error.message))
  ) {
    return "We couldn't reach photo storage. Check your connection and try again.";
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "The upload failed. Nothing was saved.";
}

export function detectPhotoMimeType(bytes: Uint8Array): PhotoMimeType | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function validatePhoto(
  bytes: Uint8Array,
  declaredType: string,
  size: number,
): PhotoMimeType {
  if (size <= 0) {
    throw new PhotoUploadError("Choose a photo to upload.");
  }
  if (size > MAX_PHOTO_BYTES) {
    throw new PhotoUploadError("The photo exceeds the 10 MB limit.");
  }

  const detectedType = detectPhotoMimeType(bytes);
  if (!detectedType) {
    throw new PhotoUploadError("The file must be a valid PNG, JPEG, or WEBP image.");
  }

  if (!ALLOWED_PHOTO_TYPES.includes(detectedType)) {
    throw new PhotoUploadError("The file must be a PNG, JPEG, or WEBP image.");
  }
  if (declaredType && declaredType !== detectedType) {
    throw new PhotoUploadError("The declared file type does not match the image.");
  }

  return detectedType;
}
