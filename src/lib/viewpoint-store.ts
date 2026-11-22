import { mockViewpoints, type Viewpoint } from "./mock-viewpoints";
import {
  richTextText,
  sanitizeRichTextJson,
} from "../features/viewpoints/rich-text";
import { createSupabaseBrowserClient } from "./supabase/client";
import type { Json } from "./supabase/database.types";

export type SubmittedViewpoint = Viewpoint & {
  description: ReturnType<typeof sanitizeRichTextJson>;
  photoName: string;
  photoPath: string;
  userId: string;
  createdAt: string;
};

export type ViewpointRow = {
  id: string;
  user_id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  description: Json;
  photo_path: string;
  photo_name: string;
  created_at: string;
};

const VIEWPOINTS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "viewpoints";
const VIEWPOINT_COLUMNS =
  "id,user_id,name,area,latitude,longitude,description,photo_path,photo_name,created_at";

function fromRow(row: ViewpointRow): SubmittedViewpoint {
  const supabase = createSupabaseBrowserClient();
  const { data } = supabase.storage
    .from(VIEWPOINTS_BUCKET)
    .getPublicUrl(row.photo_path);

  return mapViewpointRow(row, data.publicUrl);
}

export function mapViewpointRow(
  row: ViewpointRow,
  image: string,
): SubmittedViewpoint {
  const description = sanitizeRichTextJson(row.description);
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    area: row.area,
    latitude: row.latitude,
    longitude: row.longitude,
    note: richTextText(description),
    description,
    image,
    photoName: row.photo_name,
    photoPath: row.photo_path,
    createdAt: row.created_at,
  };
}

export async function fetchSubmittedViewpoints(): Promise<SubmittedViewpoint[]> {
  const { data, error } = await createSupabaseBrowserClient()
    .from("viewpoints")
    .select(VIEWPOINT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load viewpoints: ${error.message}`);
  }
  if (!data) {
    throw new Error("Supabase returned no viewpoint data.");
  }

  return data.map(fromRow);
}

export async function fetchSubmittedViewpoint(
  id: string,
): Promise<SubmittedViewpoint | undefined> {
  const { data, error } = await createSupabaseBrowserClient()
    .from("viewpoints")
    .select(VIEWPOINT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load viewpoint: ${error.message}`);
  }

  return data ? fromRow(data) : undefined;
}

export function getAllViewpoints(
  submitted: SubmittedViewpoint[] = [],
): (Viewpoint | SubmittedViewpoint)[] {
  return [...mockViewpoints, ...submitted];
}

export function getMockViewpoint(id: string): Viewpoint | undefined {
  return mockViewpoints.find((viewpoint) => viewpoint.id === id);
}
