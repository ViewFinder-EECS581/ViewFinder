"use client";

export const AUTH_SESSION_KEY = "viewfinder-auth-session";

export function isSignedIn(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(AUTH_SESSION_KEY) === "signed-in";
}

export function signIn(): void {
  window.sessionStorage.setItem(AUTH_SESSION_KEY, "signed-in");
}
