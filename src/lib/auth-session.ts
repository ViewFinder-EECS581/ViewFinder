"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfig } from "@/lib/supabase/config";

type AuthSessionState =
  | { status: "loading"; user: null; error: null }
  | { status: "signed-out"; user: null; error: null }
  | { status: "signed-in"; user: User; error: null }
  | { status: "error"; user: null; error: string };

export function useAuthSession(): AuthSessionState {
  let configError: string | null = null;
  try {
    getSupabaseConfig();
  } catch (error) {
    configError =
      error instanceof Error
        ? error.message
        : "Supabase is not configured.";
  }
  const [state, setState] = useState<AuthSessionState>(() =>
    configError
      ? { status: "error", user: null, error: configError }
      : { status: "loading", user: null, error: null },
  );

  useEffect(() => {
    if (configError) return;
    let active = true;
    const { data } = createSupabaseBrowserClient().auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        setState(
          session?.user
            ? { status: "signed-in", user: session.user, error: null }
            : { status: "signed-out", user: null, error: null },
        );
      },
    );
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [configError]);

  return state;
}
