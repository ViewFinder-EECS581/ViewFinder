"use client";

import { mockViewpoints, type Viewpoint } from "@/lib/mock-viewpoints";
import type { JSONContent } from "@tiptap/react";

const VIEWPOINT_STORE_KEY = "viewfinder-viewpoints";
const VIEWPOINT_STORE_EVENT = "viewfinder:viewpoints-change";

export type SubmittedViewpoint = Viewpoint & {
  description: JSONContent;
  photoName: string;
};

export function getSubmittedViewpoints(): SubmittedViewpoint[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(VIEWPOINT_STORE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAllViewpoints(): (Viewpoint | SubmittedViewpoint)[] {
  return [...mockViewpoints, ...getSubmittedViewpoints()];
}

export function getViewpoint(id: string): Viewpoint | SubmittedViewpoint | undefined {
  return getAllViewpoints().find((viewpoint) => viewpoint.id === id);
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
