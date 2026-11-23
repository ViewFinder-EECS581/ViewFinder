import type { JSONContent } from "@tiptap/react";
// Relative import (not "@/…") so Vitest can resolve it without a path-alias config.
import { richTextText, sanitizeRichTextJson } from "../../features/viewpoints/rich-text";

// One source of truth: the upload form calls this for instant feedback, and
// /api/viewpoints/validate calls it as the authoritative check.

export const TITLE_MAX_LENGTH = 80;
export const DESCRIPTION_MAX_LENGTH = 2000;
export const LATITUDE_MIN = -90;
export const LATITUDE_MAX = 90;
export const LONGITUDE_MIN = -180;
export const LONGITUDE_MAX = 180;

export type ViewpointField = "title" | "description" | "latitude" | "longitude";
export type ViewpointFieldErrors = Partial<Record<ViewpointField, string>>;

export type ValidViewpointInput = {
  title: string;
  description: JSONContent;
  descriptionText: string;
  latitude: number;
  longitude: number;
};

export type ViewpointValidationResult =
  | { ok: true; value: ValidViewpointInput }
  | { ok: false; fieldErrors: ViewpointFieldErrors };

// Accepts numbers or numeric strings (form fields are strings). Empty strings
// must be rejected explicitly because Number("") is 0, a "valid" coordinate.
function parseCoordinate(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateViewpointInput(input: unknown): ViewpointValidationResult {
  const record =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const fieldErrors: ViewpointFieldErrors = {};

  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!title) {
    fieldErrors.title = "Add a title.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    fieldErrors.title = `Keep the title to ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  // The limit applies to the visible text, so formatting marks and list
  // structure don't count against it. Sanitizing here also means the server
  // never trusts rich-text JSON straight from the client.
  const description = sanitizeRichTextJson(record.description);
  const descriptionText = richTextText(description);
  if (!descriptionText) {
    fieldErrors.description = "Add a description.";
  } else if (descriptionText.length > DESCRIPTION_MAX_LENGTH) {
    fieldErrors.description = "Keep the description to 2,000 characters or fewer.";
  }

  const latitude = parseCoordinate(record.latitude);
  if (latitude === null || latitude < LATITUDE_MIN || latitude > LATITUDE_MAX) {
    fieldErrors.latitude = "Enter a valid latitude between -90 and 90.";
  }

  const longitude = parseCoordinate(record.longitude);
  if (longitude === null || longitude < LONGITUDE_MIN || longitude > LONGITUDE_MAX) {
    fieldErrors.longitude = "Enter a valid longitude between -180 and 180.";
  }

  // The null checks are already covered by fieldErrors; repeating them lets
  // TypeScript narrow latitude/longitude to number below.
  if (Object.keys(fieldErrors).length > 0 || latitude === null || longitude === null) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    value: { title, description, descriptionText, latitude, longitude },
  };
}

export type ViewpointValidationResponse =
  | { status: 200; body: { viewpoint: ValidViewpointInput } }
  | { status: 422; body: { error: string; fieldErrors: ViewpointFieldErrors } };

// Kept outside route.ts so unit tests can cover the server's response shape
// without spinning up Next.js.
export function validateViewpointRequest(body: unknown): ViewpointValidationResponse {
  const result = validateViewpointInput(body);
  if (!result.ok) {
    return {
      status: 422,
      body: { error: "Fix the highlighted fields.", fieldErrors: result.fieldErrors },
    };
  }
  return { status: 200, body: { viewpoint: result.value } };
}
