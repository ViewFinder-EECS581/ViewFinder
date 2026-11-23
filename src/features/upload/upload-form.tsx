"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, LoaderCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSignedIn, subscribeToAuthSession } from "@/lib/auth-session";
import { saveSubmittedViewpoint } from "@/lib/viewpoint-store";
import {
  PHOTO_ACCEPT,
  getFriendlyUploadError,
  validatePhoto,
} from "@/features/upload/upload-service";
import { extractPhotoMetadata, type PhotoMetadata } from "@/features/upload/exif";
import { RichTextEditor, type JSONContent } from "@/features/upload/rich-text-editor";
import {
  TITLE_MAX_LENGTH,
  validateViewpointInput,
  type ValidViewpointInput,
  type ViewpointField,
  type ViewpointFieldErrors,
} from "@/lib/validation/viewpoint";

const subscribeToNothing = () => () => {};

type FormField = ViewpointField | "photo";
type FormFieldErrors = Partial<Record<FormField, string>>;

// Visual order of the fields, so focus lands on the first problem a sighted
// user would see, and the element to focus for each one.
const FIELD_FOCUS_TARGETS: [FormField, string][] = [
  ["title", "[name='title']"],
  ["description", ".rich-text-editor-content"],
  ["photo", "#viewpoint-photo"],
  ["latitude", "[name='latitude']"],
  ["longitude", "[name='longitude']"],
];

type ServerCheck =
  | { ok: true; value: ValidViewpointInput }
  | { ok: false; fieldErrors: ViewpointFieldErrors };

// The server is the authoritative check; the client-side pass only gives
// faster feedback. Field errors come back as data, anything else throws.
async function checkViewpointOnServer(input: Record<string, unknown>): Promise<ServerCheck> {
  let response: Response;
  try {
    response = await fetch("/api/viewpoints/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // getFriendlyUploadError would blame "photo storage" for a TypeError here.
    throw new Error("We couldn't reach ViewFinder. Check your connection and try again.");
  }

  const body = (await response.json().catch(() => ({}))) as {
    viewpoint?: ValidViewpointInput;
    error?: string;
    fieldErrors?: ViewpointFieldErrors;
  };
  if (response.status === 422 && body.fieldErrors) {
    return { ok: false, fieldErrors: body.fieldErrors };
  }
  if (!response.ok || !body.viewpoint) {
    throw new Error(body.error ?? "We couldn't check this viewpoint. Try again.");
  }
  return { ok: true, value: body.viewpoint };
}

// Rendered inside each field's <label>, so it is aria-hidden to keep it out of
// the input's accessible name; aria-describedby still reads it, because
// directly referenced content is announced even when aria-hidden.
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p aria-hidden="true" className="form-error" id={id}>
      {message}
    </p>
  );
}

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const signedIn = useSyncExternalStore(
    subscribeToAuthSession,
    isSignedIn,
    () => false,
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [capturedAt, setCapturedAt] = useState("");
  const [metadataNote, setMetadataNote] = useState("");
  // Whether the current field values came from the photo (not typed by the
  // user), so a later photo without EXIF can clear them without ever wiping
  // something the user entered themselves.
  const locationFromPhoto = useRef(false);
  const timeFromPhoto = useRef(false);
  // Guards against a slow read of an earlier photo overwriting a newer choice.
  const photoRequest = useRef(0);
  const [description, setDescription] = useState<JSONContent>({
    type: "doc",
    content: [{ type: "paragraph" }],
  });

  useEffect(() => {
    if (hydrated && !signedIn) {
      router.replace("/?next=/upload");
    }
  }, [hydrated, router, signedIn]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clearFieldError(field: FormField) {
    // Returning the same object skips a re-render when there's nothing to clear.
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function showFieldErrors(form: HTMLFormElement, errors: FormFieldErrors) {
    setFieldErrors(errors);
    // Focus the first invalid field so keyboard and screen-reader users land on the problem.
    const first = FIELD_FOCUS_TARGETS.find(([field]) => errors[field]);
    if (first) form.querySelector<HTMLElement>(first[1])?.focus();
  }

  function applyMetadata(metadata: PhotoMetadata) {
    const { latitude: lat, longitude: lng } = metadata;
    const hasLocation = lat !== undefined && lng !== undefined;

    if (hasLocation) {
      setLatitude(String(Number(lat.toFixed(6))));
      setLongitude(String(Number(lng.toFixed(6))));
      locationFromPhoto.current = true;
    } else if (locationFromPhoto.current) {
      // The previous photo filled these in; this one has nothing to offer.
      setLatitude("");
      setLongitude("");
      locationFromPhoto.current = false;
    }

    if (metadata.capturedAt) {
      setCapturedAt(metadata.capturedAt);
      timeFromPhoto.current = true;
    } else if (timeFromPhoto.current) {
      setCapturedAt("");
      timeFromPhoto.current = false;
    }

    setMetadataNote(
      hasLocation
        ? "Location filled in from the photo's GPS data. Adjust it if it isn't right."
        : "This photo has no GPS location. Enter where it was taken below.",
    );
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0] ?? null;
    const requestId = ++photoRequest.current;
    setError("");
    clearFieldError("photo");
    setMetadataNote("");
    if (!file) {
      setPhoto(null);
      setPreview("");
      setReadingPhoto(false);
      return;
    }
    setReadingPhoto(true);
    setPhoto(null);
    setPreview("");
    void (async () => {
      try {
        const buffer = await file.arrayBuffer();
        validatePhoto(new Uint8Array(buffer), file.type, file.size);
        // Never throws: a photo without readable EXIF just returns {}.
        const metadata = await extractPhotoMetadata(buffer);
        if (requestId !== photoRequest.current) return;
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
        applyMetadata(metadata);
      } catch (validationError) {
        if (requestId !== photoRequest.current) return;
        const message =
          validationError instanceof Error
            ? validationError.message
            : "Choose a valid PNG, JPEG, or WEBP image.";
        setFieldErrors((current) => ({ ...current, photo: message }));
        input.value = "";
      } finally {
        if (requestId === photoRequest.current) setReadingPhoto(false);
      }
    })();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");

    const input = {
      title: String(new FormData(form).get("title") ?? ""),
      description,
      latitude,
      longitude,
    };
    const clientCheck = validateViewpointInput(input);
    const clientErrors: FormFieldErrors = clientCheck.ok ? {} : { ...clientCheck.fieldErrors };
    if (!photo) clientErrors.photo = "Add a photo to continue.";
    if (!clientCheck.ok || !photo) {
      showFieldErrors(form, clientErrors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      // Server check runs before the photo upload so a rejected viewpoint
      // never leaves an orphaned file in storage.
      const serverCheck = await checkViewpointOnServer(input);
      if (!serverCheck.ok) {
        showFieldErrors(form, serverCheck.fieldErrors);
        return;
      }
      // Save what the server approved, not the client's own copy.
      const { title, description: descriptionJson, descriptionText } = serverCheck.value;
      const { latitude, longitude } = serverCheck.value;

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

      const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}-${Date.now()}`;
      saveSubmittedViewpoint({
        id,
        name: title,
        area: "Uploaded viewpoint",
        latitude,
        longitude,
        note: descriptionText,
        description: descriptionJson,
        image: uploaded.publicUrl,
        photoName: photo.name,
        ...(capturedAt ? { capturedAt } : {}),
      });
      router.push(`/viewpoints/${id}`);
    } catch (submitError) {
      setError(getFriendlyUploadError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated || !signedIn) return null;

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
            <Input
              name="title"
              placeholder="Name this view"
              required
              maxLength={TITLE_MAX_LENGTH}
              aria-invalid={fieldErrors.title ? true : undefined}
              aria-describedby={fieldErrors.title ? "title-error" : undefined}
              onChange={() => clearFieldError("title")}
            />
            <FieldError id="title-error" message={fieldErrors.title} />
          </label>

          <label className="field">
            <span>Description</span>
            <RichTextEditor
              value={description}
              onChange={(value) => {
                clearFieldError("description");
                setDescription(value);
              }}
            />
            <FieldError id="description-error" message={fieldErrors.description} />
          </label>

          <div className="photo-field">
            <span>Photo</span>
            <input
              ref={fileInputRef}
              accept={PHOTO_ACCEPT}
              aria-invalid={fieldErrors.photo ? true : undefined}
              aria-describedby={fieldErrors.photo ? "photo-error" : undefined}
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
            {/* Not inside a <label>, and photo errors appear after an async
                file read without moving focus, so this one announces itself. */}
            {fieldErrors.photo && (
              <p className="form-error" id="photo-error" role="alert">{fieldErrors.photo}</p>
            )}
          </div>

          <fieldset className="location-fields">
            <legend><MapPin size={15} aria-hidden="true" /> Location</legend>
            <label className="field">
              <span>Latitude</span>
              <Input
                name="latitude"
                inputMode="decimal"
                placeholder="38.9717"
                required
                step="any"
                type="number"
                value={latitude}
                aria-invalid={fieldErrors.latitude ? true : undefined}
                aria-describedby={fieldErrors.latitude ? "latitude-error" : undefined}
                onChange={(event) => {
                  locationFromPhoto.current = false;
                  setMetadataNote("");
                  clearFieldError("latitude");
                  setLatitude(event.target.value);
                }}
              />
              <FieldError id="latitude-error" message={fieldErrors.latitude} />
            </label>
            <label className="field">
              <span>Longitude</span>
              <Input
                name="longitude"
                inputMode="decimal"
                placeholder="-95.2353"
                required
                step="any"
                type="number"
                value={longitude}
                aria-invalid={fieldErrors.longitude ? true : undefined}
                aria-describedby={fieldErrors.longitude ? "longitude-error" : undefined}
                onChange={(event) => {
                  locationFromPhoto.current = false;
                  setMetadataNote("");
                  clearFieldError("longitude");
                  setLongitude(event.target.value);
                }}
              />
              <FieldError id="longitude-error" message={fieldErrors.longitude} />
            </label>
            {metadataNote && (
              <p className="upload-hint" role="status">{metadataNote}</p>
            )}
          </fieldset>

          <label className="field">
            <span>Date and time taken (optional)</span>
            <Input
              name="capturedAt"
              type="datetime-local"
              value={capturedAt}
              onChange={(event) => {
                timeFromPhoto.current = false;
                setCapturedAt(event.target.value);
              }}
            />
          </label>

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