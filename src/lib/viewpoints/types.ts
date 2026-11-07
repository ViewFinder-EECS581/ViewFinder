/**
 * Shared data types for viewpoints and photos.
 *
 * Field names are snake_case and mirror the database columns (architecture
 * doc, section 4), so the Supabase rows and these types are the same shape and
 * need no mapping layer. When the generated types from #37 land, replace
 * `src/lib/supabase/database.types.ts` and keep these exports as they are.
 *
 * This file is safe to import from client components (types only, no runtime
 * dependencies).
 */

export type Viewpoint = {
    id: string;
    /** The creator (a `profiles.id`). */
    user_id: string;
    title: string;
    /** Rich-text description. */
    description: string;
    /** Decimal degrees, -90 to 90. */
    latitude: number;
    /** Decimal degrees, -180 to 180. */
    longitude: number;
    /** ISO 8601 timestamp. */
    created_at: string;
  };
  
  export type Photo = {
    id: string;
    viewpoint_id: string;
    /** Public URL of the stored image. */
    url: string;
    /** 0-based position in the viewpoint's gallery. */
    sort_order: number;
    /** ISO 8601 upload timestamp. */
    created_at: string;
  };
  
  /** A viewpoint with its photos, ordered by `sort_order`. */
  export type ViewpointWithPhotos = Viewpoint & { photos: Photo[] };
  
  /** Everything needed to create a viewpoint and its first photo record. */
  export type CreateViewpointInput = {
    user_id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    /** URL of an image that has already been uploaded to storage. */
    photo_url: string;
  };
  
  export type ViewpointErrorCode =
    /** No viewpoint exists for the given id. */
    | "not_found"
    /** The input broke a rule (see `validateCreateViewpointInput`). */
    | "invalid_input"
    /** The caller is not allowed to do this (signed out, or blocked by policy). */
    | "unauthorized"
    /** The data source is misconfigured or could not be reached. */
    | "unavailable"
    /** Anything else. */
    | "unknown";
  
  export type ViewpointError = {
    code: ViewpointErrorCode;
    /** Human-readable, safe to show to a user. */
    message: string;
    /** For `invalid_input`: the first message for each offending field. */
    fields?: Record<string, string>;
  };
  
  /** Every data-access function resolves to exactly one of these two shapes. */
  export type Result<T> =
    | { data: T; error: null }
    | { data: null; error: ViewpointError };
  
  /**
   * The contract both implementations (mock and Supabase) satisfy. Methods never
   * throw for expected failures; they return a `Result`.
   */
  export type ViewpointStore = {
    list(): Promise<Result<ViewpointWithPhotos[]>>;
    get(id: string): Promise<Result<ViewpointWithPhotos>>;
    create(input: CreateViewpointInput): Promise<Result<ViewpointWithPhotos>>;
  };