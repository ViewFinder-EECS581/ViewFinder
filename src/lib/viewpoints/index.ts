/**
 * Data-access entry point. Import these functions (never the mock or Supabase
 * implementation directly) so the data source can change without touching
 * feature code. See docs/data-access.md for inputs, outputs, and errors.
 *
 * Server-side only: with the Supabase source these use the cookie-based server
 * client. Call them from Server Components, Server Actions, or Route Handlers
 * and pass the results to Client Components as props. Types are importable
 * anywhere from "@/lib/viewpoints/types".
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDataSource } from "./config";
import { createMockStore } from "./mock";
import { createSupabaseStore } from "./supabase";
import type {
  CreateViewpointInput,
  Result,
  ViewpointStore,
  ViewpointWithPhotos,
} from "./types";
import { fail } from "./validate";
 
export type * from "./types";
 
// Module-level so created mock viewpoints persist between calls.
const mockStore = createMockStore();
 
async function getStore(): Promise<ViewpointStore> {
  return getDataSource() === "supabase"
    ? createSupabaseStore(await createSupabaseServerClient())
    : mockStore;
}
 
/** Run a store call, converting any unexpected throw into an error result. */
async function run<T>(
  call: (store: ViewpointStore) => Promise<Result<T>>,
): Promise<Result<T>> {
  try {
    return await call(await getStore());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return fail("unavailable", message);
  }
}
 
/** All viewpoints with their photos, newest first. */
export function listViewpoints(): Promise<Result<ViewpointWithPhotos[]>> {
  return run((store) => store.list());
}
 
/** One viewpoint with its photos, or a `not_found` error. */
export function getViewpoint(id: string): Promise<Result<ViewpointWithPhotos>> {
  return run((store) => store.get(id));
}
 
/** Create a viewpoint and its first photo record. */
export function createViewpoint(
  input: CreateViewpointInput,
): Promise<Result<ViewpointWithPhotos>> {
  return run((store) => store.create(input));
}