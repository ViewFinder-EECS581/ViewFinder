"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, LoaderCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/lib/auth-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getFriendlyUploadError,
  validatePhoto,
} from "@/features/upload/upload-service";
import { RichTextEditor, type JSONContent } from "@/features/upload/rich-text-editor";
import { richTextText, sanitizeRichTextJson } from "@/features/viewpoints/rich-text";

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = useAuthSession();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [description, setDescription] = useState<JSONContent>({
    type: "doc",
    content: [{ type: "paragraph" }],
  });

  useEffect(() => {
    if (auth.status === "signed-out") {
      router.replace("/?next=/upload");
    }
  }, [auth.status, router]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");
    if (!file) {
      setPhoto(null);
      setPreview("");
      return;
    }
    setReadingPhoto(true);
    setPhoto(null);
    setPreview("");
    void file.arrayBuffer()
      .then((buffer) => {
        validatePhoto(new Uint8Array(buffer), file.type, file.size);
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
      })
      .catch((validationError) => {
        setError(
          validationError instanceof Error
            ? validationError.message
            : "Choose a valid PNG, JPEG, or WEBP image.",
        );
        event.target.value = "";
      })
      .finally(() => setReadingPhoto(false));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (auth.status !== "signed-in") {
      setError("Sign in before publishing a viewpoint.");
      return;
    }
    if (!photo) {
      setError("Add a photo to continue.");
      fileInputRef.current?.focus();
      return;
    }

    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const descriptionJson = sanitizeRichTextJson(description);
    const descriptionText = richTextText(descriptionJson);
    const latitude = Number(data.get("latitude"));
    const longitude = Number(data.get("longitude"));
    if (!title || !descriptionText) {
      setError("Add a title and description.");
      return;
    }
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setError("Enter a valid latitude between -90 and 90.");
      return;
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setError("Enter a valid longitude between -180 and 180.");
      return;
    }

    setSubmitting(true);
    try {
      const uploadData = new FormData();
      uploadData.append("photo", photo);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const uploaded = await uploadResponse.json() as
        | { path: string; publicUrl: string }
        | { error: string };
      if (!uploadResponse.ok) {
        throw new Error(
          "error" in uploaded ? uploaded.error : "The photo upload failed.",
        );
      }
      if (!("publicUrl" in uploaded)) {
        throw new Error("The photo upload did not return a public URL.");
      }

      const id = crypto.randomUUID();
      const { error: insertError } = await createSupabaseBrowserClient()
        .from("viewpoints")
        .insert({
          id,
          user_id: auth.user.id,
          name: title,
          area: "Uploaded viewpoint",
          latitude,
          longitude,
          description: descriptionJson,
          photo_path: uploaded.path,
          photo_name: photo.name,
        });
      if (insertError) {
        throw new Error(`The viewpoint could not be saved: ${insertError.message}`);
      }

      router.push(`/viewpoints/${id}`);
    } catch (submitError) {
      setError(getFriendlyUploadError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  if (auth.status === "loading" || auth.status === "signed-out") return null;
  if (auth.status === "error") {
    return (
      <main className="upload-shell">
        <p className="form-error" role="alert">{auth.error}</p>
      </main>
    );
  }

  return (
    <main className="upload-shell">
      <header className="upload-header">
        <Link className="wordmark" href="/map" aria-label="ViewFinder map">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>viewfinder</span>
        </Link>
        <Link className="upload-back" href="/map">
          <ArrowLeft size={16} aria-hidden="true" /> Back to map
        </Link>
      </header>

      <div className="upload-layout">
        <div className="upload-heading">
          <p className="eyebrow">Share a good find</p>
          <h1>Add your viewpoint</h1>
          <p>One photo, a little context, and the place that made you stop.</p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <Input name="title" placeholder="Name this view" required maxLength={80} />
          </label>

          <label className="field">
            <span>Description</span>
            <RichTextEditor value={description} onChange={setDescription} />
          </label>

          <div className="photo-field">
            <span>Photo</span>
            <input
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              className="photo-input"
              id="viewpoint-photo"
              name="photo"
              onChange={handlePhoto}
              type="file"
            />
            <label className={preview ? "photo-preview" : "photo-drop"} htmlFor="viewpoint-photo">
              {preview ? (
                <>
                  {/* The preview is intentionally local and revoked when replaced/unmounted. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="Selected viewpoint preview" src={preview} />
                  <span>Change photo</span>
                </>
              ) : (
                <>
                  <ImagePlus size={26} aria-hidden="true" />
                  <strong>{readingPhoto ? "Reading photo…" : "Choose a photo"}</strong>
                  <span>{readingPhoto ? "Checking the image" : "PNG, JPG, or WEBP · up to 10 MB"}</span>
                </>
              )}
            </label>
          </div>

          <fieldset className="location-fields">
            <legend><MapPin size={15} aria-hidden="true" /> Location</legend>
            <label className="field">
              <span>Latitude</span>
              <Input name="latitude" inputMode="decimal" placeholder="38.9717" required step="any" type="number" />
            </label>
            <label className="field">
              <span>Longitude</span>
              <Input name="longitude" inputMode="decimal" placeholder="-95.2353" required step="any" type="number" />
            </label>
          </fieldset>

          {error && <p className="form-error" role="alert">{error}</p>}

          <Button className="upload-submit" disabled={submitting || readingPhoto} type="submit">
            {submitting ? (
              <>
                <LoaderCircle className="spinner" size={17} aria-hidden="true" />
                <span>Submitting…</span>
              </>
            ) : (
              <>
                <span>Publish viewpoint</span>
                <span aria-hidden="true">↗</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
