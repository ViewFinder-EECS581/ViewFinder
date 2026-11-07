export type DataSource = "mock" | "supabase";
 
/**
 * Which implementation the data-access functions use, chosen by the
 * NEXT_PUBLIC_DATA_SOURCE environment variable. Defaults to "mock" so the app
 * runs with no setup. An unrecognized value throws instead of silently
 * falling back, so a typo can't hide behind fake data.
 */
export function getDataSource(): DataSource {
  const value = process.env.NEXT_PUBLIC_DATA_SOURCE?.trim().toLowerCase();
  if (!value || value === "mock") return "mock";
  if (value === "supabase") return "supabase";
  throw new Error(
    `Invalid NEXT_PUBLIC_DATA_SOURCE "${value}". Use "mock" or "supabase".`,
  );
}