import { describe, expect, it } from "vitest";
import { mapViewpointRow } from "./viewpoint-store";

describe("viewpoint database mapping", () => {
  it("maps stored metadata and rich text into a displayable viewpoint", () => {
    const viewpoint = mapViewpointRow(
      {
        id: "shared-view",
        user_id: "user-1",
        name: "Riverside overlook",
        area: "Uploaded viewpoint",
        latitude: 38.98,
        longitude: -95.24,
        description: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "A quiet place to pause." }],
            },
          ],
        },
        photo_path: "user-1/photo.webp",
        photo_name: "photo.webp",
        created_at: "2026-03-01T12:00:00.000Z",
      },
      "https://example.test/photo.webp",
    );

    expect(viewpoint).toMatchObject({
      id: "shared-view",
      name: "Riverside overlook",
      latitude: 38.98,
      longitude: -95.24,
      note: "A quiet place to pause.",
      image: "https://example.test/photo.webp",
      photoPath: "user-1/photo.webp",
      photoName: "photo.webp",
      userId: "user-1",
    });
  });

  it("sanitizes stored rich text before rendering", () => {
    const viewpoint = mapViewpointRow(
      {
        id: "unsafe-view",
        user_id: "user-1",
        name: "Safe text",
        area: "Uploaded viewpoint",
        latitude: 38.98,
        longitude: -95.24,
        description: {
          type: "doc",
          content: [
            { type: "script", content: [{ type: "text", text: "bad" }] },
            { type: "paragraph", content: [{ type: "text", text: "safe" }] },
          ],
        },
        photo_path: "user-1/photo.webp",
        photo_name: "photo.webp",
        created_at: "2026-03-01T12:00:00.000Z",
      },
      "https://example.test/photo.webp",
    );

    expect(viewpoint.note).toBe("safe");
  });
});
