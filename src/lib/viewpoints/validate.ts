import type { CreateViewpointInput, Result } from "./types";

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 2000;

export function ok<T>(data: T): Result<T> {
  return { data, error: null };
}

export function fail(
  code: NonNullable<Result<never>["error"]>["code"],
  message: string,
  fields?: Record<string, string>,
): Result<never> {
  return { data: null, error: { code, message, ...(fields && { fields }) } };
}

/**
 * Rules every implementation enforces before writing, so the mock and the
 * real database reject the same input with the same error.
 *
 * TODO: once the shared zod schemas from #50 are on `main`, replace this with
 * `viewpointInputSchema` so there is a single source of truth.
 */
export function validateCreateViewpointInput(
  input: CreateViewpointInput,
): Result<null> {
  const fields: Record<string, string> = {};
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";

  if (!input.user_id) fields.user_id = "A creator is required.";
  if (!title) fields.title = "Title is required.";
  else if (title.length > TITLE_MAX_LENGTH)
    fields.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  if (!description) fields.description = "Description is required.";
  else if (description.length > DESCRIPTION_MAX_LENGTH)
    fields.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  if (
    !Number.isFinite(input.latitude) ||
    input.latitude < -90 ||
    input.latitude > 90
  )
    fields.latitude = "Latitude must be between -90 and 90.";
  if (
    !Number.isFinite(input.longitude) ||
    input.longitude < -180 ||
    input.longitude > 180
  )
    fields.longitude = "Longitude must be between -180 and 180.";
  if (!/^https?:\/\/\S+$/.test(input.photo_url ?? ""))
    fields.photo_url = "A valid photo URL is required.";

  return Object.keys(fields).length > 0
    ? fail("invalid_input", "Some fields are invalid.", fields)
    : ok(null);
}