import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PhotoUploadError,
  validatePhoto,
  type PhotoMimeType,
} from "@/features/upload/upload-service";
import { stripImageMetadata } from "@/features/upload/strip-metadata";

export const runtime = "nodejs";

function extensionForType(type: PhotoMimeType): string {
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  return "webp";
}

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  ) {
    return Response.json(
      { error: "Photo storage is not configured." },
      { status: 503 },
    );
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return Response.json(
      { error: "Photo upload is unavailable." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json(
      { error: "Sign in before uploading a photo." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "The upload request must contain a photo." },
      { status: 400 },
    );
  }

  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return Response.json(
      { error: "The upload request must contain a photo." },
      { status: 400 },
    );
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = validatePhoto(bytes, file.type, bytes.byteLength);
    // Never store the photographer's GPS data: public copies must be clean.
    const cleanBytes = await stripImageMetadata(bytes, type);
    const extension = extensionForType(type);
    const path = `${user.id}/${randomUUID()}.${extension}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "viewpoints";

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, cleanBytes, {
        contentType: type,
        upsert: false,
      });

    if (uploadError) {
      return Response.json(
        { error: "The photo could not be stored." },
        { status: 502 },
      );
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return Response.json(
      { path, publicUrl: data.publicUrl },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof PhotoUploadError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json(
      { error: "The photo could not be read." },
      { status: 400 },
    );
  }
}
