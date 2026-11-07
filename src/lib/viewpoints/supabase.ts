import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type {
  CreateViewpointInput,
  Photo,
  Result,
  ViewpointErrorCode,
  ViewpointStore,
  ViewpointWithPhotos,
} from "./types";
import { fail, ok, validateCreateViewpointInput } from "./validate";
 
type Client = SupabaseClient<Database>;
 
type DbError = { code?: string; message?: string };
 
/** Map a Postgres/PostgREST error onto the shared error codes. */
function fromDbError(error: DbError): Result<never> {
  const code = error.code ?? "";
  let mapped: ViewpointErrorCode = "unknown";
  let message = "Something went wrong. Please try again.";
 
  if (code === "42501" || code === "PGRST301") {
    mapped = "unauthorized";
    message = "You don't have permission to do that.";
  } else if (code === "23514" || code === "23503" || code === "23502") {
    mapped = "invalid_input";
    message = "Some fields are invalid.";
  } else if (code === "22P02") {
    // e.g. an id that is not a valid uuid
    mapped = "not_found";
    message = "That viewpoint doesn't exist.";
  } else if (/fetch failed|network|timeout/i.test(error.message ?? "")) {
    mapped = "unavailable";
    message = "The data service could not be reached.";
  }
  return fail(mapped, message);
}
 
const bySortOrder = (a: Photo, b: Photo) => a.sort_order - b.sort_order;
 
const withSortedPhotos = (row: ViewpointWithPhotos): ViewpointWithPhotos => ({
  ...row,
  photos: [...row.photos].sort(bySortOrder),
});
 
/**
 * `ViewpointStore` backed by Supabase. Pass any typed client: the browser
 * client in Client Components, the server client everywhere else.
 */
export function createSupabaseStore(client: Client): ViewpointStore {
  return {
    async list() {
      const { data, error } = await client
        .from("viewpoints")
        .select("*, photos(*)")
        .order("created_at", { ascending: false });
      if (error) return fromDbError(error);
      return ok(data.map(withSortedPhotos));
    },
 
    async get(id: string) {
      const { data, error } = await client
        .from("viewpoints")
        .select("*, photos(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) return fromDbError(error);
      if (!data) return fail("not_found", "That viewpoint doesn't exist.");
      return ok(withSortedPhotos(data));
    },
 
    async create(
      input: CreateViewpointInput,
    ): Promise<Result<ViewpointWithPhotos>> {
      const valid = validateCreateViewpointInput(input);
      if (valid.error) return valid;
 
      const { data: viewpoint, error } = await client
        .from("viewpoints")
        .insert({
          user_id: input.user_id,
          title: input.title.trim(),
          description: input.description.trim(),
          latitude: input.latitude,
          longitude: input.longitude,
        })
        .select()
        .single();
      if (error) return fromDbError(error);
 
      const { data: photo, error: photoError } = await client
        .from("photos")
        .insert({
          viewpoint_id: viewpoint.id,
          url: input.photo_url,
          sort_order: 0,
        })
        .select()
        .single();
 
      if (photoError) {
        // Best-effort rollback so a failed photo insert doesn't leave a
        // viewpoint with no photo. (A database function would make this
        // atomic; worth revisiting with the schema in #37.)
        await client.from("viewpoints").delete().eq("id", viewpoint.id);
        return fromDbError(photoError);
      }
 
      return ok({ ...viewpoint, photos: [photo] });
    },
  };
}