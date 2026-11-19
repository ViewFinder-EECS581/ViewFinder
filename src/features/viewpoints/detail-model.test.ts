
import { describe, expect, it } from "vitest";
import {
  DEFAULT_CREATOR_NAME,
  formatCoordinates,
  getCreatorName,
  getDetailImageUrl,
  getPhotoAltText,
  normalizeViewpointId,
} from "./detail-model";

describe("viewpoint detail model", () => {
  it("decodes route ids and tolerates malformed encoding", () => {
    expect(normalizeViewpointId("potter-lake")).toBe("potter-lake");
    expect(normalizeViewpointId("my%20spot-123")).toBe("my spot-123");
    expect(normalizeViewpointId("100%")).toBe("100%");
  });

  it("falls back when a creator name is missing or blank", () => {
    expect(getCreatorName({ creator: "Ada" })).toBe("Ada");
    expect(getCreatorName({ creator: "   " })).toBe(DEFAULT_CREATOR_NAME);
    expect(getCreatorName({})).toBe(DEFAULT_CREATOR_NAME);
  });

  it("builds descriptive alt text that includes the place", () => {
    expect(
      getPhotoAltText({ name: "Potter Lake", area: "KU Campus · Lawrence" }),
    ).toBe("Photo of Potter Lake, a viewpoint in KU Campus, Lawrence");
    expect(getPhotoAltText({ name: "Potter Lake", area: "" })).toBe(
      "Photo of Potter Lake",
    );
  });

  it("formats coordinates with hemispheres", () => {
    expect(formatCoordinates(38.9603032, -95.2486305)).toBe(
      "38.96030° N, 95.24863° W",
    );
    expect(formatCoordinates(-33.8688, 151.2093)).toBe(
      "33.86880° S, 151.20930° E",
    );
  });

  it("requests a larger sample photo but leaves uploaded photos untouched", () => {
    expect(
      getDetailImageUrl(
        "https://images.unsplash.com/photo-1?auto=format&fit=crop&w=720&q=85",
      ),
    ).toContain("w=1600");

    const uploaded = "https://project.supabase.co/storage/v1/object/public/p.jpg?w=720";
    expect(getDetailImageUrl(uploaded)).toBe(uploaded);
    expect(getDetailImageUrl("/local/photo.jpg")).toBe("/local/photo.jpg");
  });
});
