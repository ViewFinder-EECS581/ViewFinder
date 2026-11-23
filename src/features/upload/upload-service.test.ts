import { describe, expect, it } from "vitest";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  PHOTO_ACCEPT,
  PhotoUploadError,
  detectPhotoMimeType,
  getFriendlyUploadError,
  validatePhoto,
} from "./upload-service";

describe("photo upload validation", () => {
  it("accepts valid PNG, JPEG, and WEBP signatures", () => {
    expect(detectPhotoMimeType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(detectPhotoMimeType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(detectPhotoMimeType(Uint8Array.from([
      0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
    ]))).toBe("image/webp");
  });

  it("rejects files with an unsupported signature", () => {
    expect(() => validatePhoto(Uint8Array.from([0x25, 0x50, 0x44, 0x46]), "application/pdf", 4))
      .toThrow("valid PNG");
  });

  it("rejects oversized files before storage", () => {
    expect(() => validatePhoto(
      Uint8Array.from([0xff, 0xd8, 0xff]),
      "image/jpeg",
      MAX_PHOTO_BYTES + 1,
    )).toThrow("10 MB");
  });

  it("rejects a declared type that differs from the image signature", () => {
    expect(() => validatePhoto(
      Uint8Array.from([0xff, 0xd8, 0xff]),
      "image/png",
      3,
    )).toThrow(PhotoUploadError);
  });

  it("accepts a photo of exactly the maximum size", () => {
    expect(validatePhoto(
      Uint8Array.from([0xff, 0xd8, 0xff]),
      "image/jpeg",
      MAX_PHOTO_BYTES,
    )).toBe("image/jpeg");
  });

  it("rejects an empty file", () => {
    expect(() => validatePhoto(new Uint8Array(), "image/jpeg", 0)).toThrow("Choose a photo");
  });

  it("rejects GIFs by content even when the declared type looks allowed", () => {
    const gif = Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    expect(() => validatePhoto(gif, "image/gif", gif.length)).toThrow("valid PNG");
    expect(() => validatePhoto(gif, "image/png", gif.length)).toThrow("valid PNG");
  });

  it("builds the file-picker accept list from the allowed types", () => {
    expect(PHOTO_ACCEPT.split(",")).toEqual([...ALLOWED_PHOTO_TYPES]);
  });

  it("shows a friendly message for upload network failures", () => {
    expect(getFriendlyUploadError(new TypeError("Failed to fetch"))).toBe(
    "We couldn't reach photo storage. Check your connection and try again.",
    );
  });
});
