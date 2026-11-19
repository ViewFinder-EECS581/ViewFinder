"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, LoaderCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSignedIn } from "@/lib/auth-session";
import { saveSubmittedViewpoint } from "@/lib/viewpoint-store";

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [signedIn] = useState(() => isSignedIn());
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!signedIn) {
      router.replace("/?next=/upload");
    }
  }, [router, signedIn]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose a photo smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  function readPhoto(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("The photo could not be read."));
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!photo) {
      setError("Add a photo to continue.");
      fileInputRef.current?.focus();
      return;
    }

    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const latitude = Number(data.get("latitude"));
    const longitude = Number(data.get("longitude"));
    if (!title || !description) {
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
      const photoData = await readPhoto(photo);
      const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}-${Date.now()}`;
      saveSubmittedViewpoint({
        id,
        name: title,
        area: "Uploaded viewpoint",
        latitude,
        longitude,
        note: description,
        description,
        image: photoData,
        photoName: photo.name,
      });
      router.push(`/viewpoints/${id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The upload failed. Nothing was saved.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!signedIn) return null;

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
            <textarea
              name="description"
              placeholder="What makes this place worth finding?"
              required
              rows={5}
            />
          </label>

          <div className="photo-field">
            <span>Photo</span>
            <input
              ref={fileInputRef}
              accept="image/*"
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
                  <strong>Choose a photo</strong>
                  <span>PNG, JPG, or other image · up to 5 MB</span>
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

          <Button className="upload-submit" disabled={submitting} type="submit">
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
