"use client";

export const AUTH_SESSION_KEY = "viewfinder-auth-session";
const AUTH_SESSION_EVENT = "viewfinder:auth-session-change";

export function isSignedIn(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(AUTH_SESSION_KEY) === "signed-in";
}

export function signIn(): void {
  window.sessionStorage.setItem(AUTH_SESSION_KEY, "signed-in");
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function subscribeToAuthSession(listener: () => void): () => void {
  window.addEventListener(AUTH_SESSION_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
