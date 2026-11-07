import { mockViewpoints } from "./mock-data";
import type {
  CreateViewpointInput,
  Result,
  ViewpointStore,
  ViewpointWithPhotos,
} from "./types";
import { fail, ok, validateCreateViewpointInput } from "./validate";

const clone = <T>(value: T): T => structuredClone(value);

/** Newest first; ties (same timestamp) put the later insertion first. */
const newestFirst = (rows: ViewpointWithPhotos[]) =>
  rows
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        b.row.created_at.localeCompare(a.row.created_at) || b.index - a.index,
    )
    .map(({ row }) => row);

/**
 * In-memory implementation of `ViewpointStore`. State lives in module memory:
 * created viewpoints last until the server restarts, which is enough for UI
 * work. Pass `seed` to start from different data (e.g. in tests).
 */
export function createMockStore(
  seed: ViewpointWithPhotos[] = mockViewpoints,
): ViewpointStore {
  const rows = clone(seed);
  let counter = 0;

  return {
    async list() {
      return ok(clone(newestFirst(rows)));
    },

    async get(id: string) {
      const found = rows.find((row) => row.id === id);
      return found
        ? ok(clone(found))
        : fail("not_found", "That viewpoint doesn't exist.");
    },

    async create(
      input: CreateViewpointInput,
    ): Promise<Result<ViewpointWithPhotos>> {
      const valid = validateCreateViewpointInput(input);
      if (valid.error) return valid;

      counter += 1;
      const now = new Date().toISOString();
      const id = `mock-viewpoint-${counter}`;
      const created: ViewpointWithPhotos = {
        id,
        user_id: input.user_id,
        title: input.title.trim(),
        description: input.description.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        created_at: now,
        photos: [
          {
            id: `${id}-photo-1`,
            viewpoint_id: id,
            url: input.photo_url,
            sort_order: 0,
            created_at: now,
          },
        ],
      };
      rows.push(created);
      return ok(clone(created));
    },
  };
}