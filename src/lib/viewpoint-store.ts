"use client";

import { mockViewpoints, type Viewpoint } from "./mock-viewpoints";
import type { JSONContent } from "@tiptap/react";

const VIEWPOINT_STORE_KEY = "viewfinder-viewpoints";
const VIEWPOINT_STORE_EVENT = "viewfinder:viewpoints-change";

export type SubmittedViewpoint = Viewpoint & {
  description: JSONContent;
  photoName: string;
};

function isViewpointRecord(value: unknown): value is SubmittedViewpoint {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.area === "string" &&
    typeof record.image === "string" &&
    typeof record.latitude === "number" &&
    Number.isFinite(record.latitude) &&
    typeof record.longitude === "number" &&
    Number.isFinite(record.longitude)
  );
}

/**
 * Parses the raw localStorage value, dropping anything that is not a usable
 * viewpoint so one corrupt entry cannot break the map or a detail page.
 */
export function parseSubmittedViewpoints(raw: string | null): SubmittedViewpoint[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isViewpointRecord) : [];
  } catch {
    return [];
  }
}

/**
 * Finds a viewpoint by id among the sample data and the given raw store value.
 * Pure, so it behaves the same on the server and the client.
 */
export function findViewpoint(
  id: string,
  rawStore: string | null,
): Viewpoint | SubmittedViewpoint | undefined {
  return (
    mockViewpoints.find((viewpoint) => viewpoint.id === id) ??
    parseSubmittedViewpoints(rawStore).find((viewpoint) => viewpoint.id === id)
  );
}

/**
 * Stable snapshot for `useSyncExternalStore`: the raw stored string (a
 * primitive, so React can compare it by value), or "" when nothing is stored
 * or storage is unavailable.
 */
export function getViewpointStoreSnapshot(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(VIEWPOINT_STORE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Server snapshot: browser-only data is not known yet, so report "unknown". */
export function getViewpointStoreServerSnapshot(): string | null {
  return null;
}

export function getSubmittedViewpoints(): SubmittedViewpoint[] {
  if (typeof window === "undefined") return [];
  return parseSubmittedViewpoints(getViewpointStoreSnapshot());
}

export function getAllViewpoints(): (Viewpoint | SubmittedViewpoint)[] {
  return [...mockViewpoints, ...getSubmittedViewpoints()];
}

export function getViewpoint(id: string): Viewpoint | SubmittedViewpoint | undefined {
  return findViewpoint(id, getViewpointStoreSnapshot());
}

export function saveSubmittedViewpoint(viewpoint: SubmittedViewpoint): void {
  const submitted = getSubmittedViewpoints();
  const next = [...submitted, viewpoint];

  try {
    window.localStorage.setItem(VIEWPOINT_STORE_KEY, JSON.stringify(next));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Could not save the viewpoint: ${error.message}`
        : "Could not save the viewpoint.",
    );
  }

  window.dispatchEvent(new Event(VIEWPOINT_STORE_EVENT));
}

export function subscribeToViewpoints(listener: () => void): () => void {
  window.addEventListener(VIEWPOINT_STORE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(VIEWPOINT_STORE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}