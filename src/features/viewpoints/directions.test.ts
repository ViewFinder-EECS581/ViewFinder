import { describe, expect, it } from "vitest";
import {
  buildDirectionsUrl,
  isAppleDevice,
  type DirectionsDevice,
} from "./directions";

describe("directions links", () => {
  it("recognizes iPhone and iPad devices", () => {
    expect(
      isAppleDevice({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
        platform: "iPhone",
        maxTouchPoints: 5,
      }),
    ).toBe(true);
  });

  it("recognizes iPadOS that reports a Macintosh platform", () => {
    expect(
      isAppleDevice({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
        platform: "MacIntel",
        maxTouchPoints: 5,
      }),
    ).toBe(true);
  });

  it("falls back to Google Maps outside Apple devices", () => {
    const device: DirectionsDevice = {
      userAgent: "Mozilla/5.0 (Linux; Android 14)",
      platform: "Linux armv8l",
      maxTouchPoints: 5,
    };

    expect(isAppleDevice(device)).toBe(false);
  });

  it("builds an Apple Maps directions URL", () => {
    expect(buildDirectionsUrl(38.9497772, -95.2359095, true)).toBe(
      "https://maps.apple.com/?daddr=38.9497772%2C-95.2359095&dirflg=d",
    );
  });

  it("builds a Google Maps directions URL", () => {
    expect(buildDirectionsUrl(38.9497772, -95.2359095, false)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=38.9497772%2C-95.2359095&travelmode=driving",
    );
  });

  it("rejects invalid coordinates", () => {
    expect(() => buildDirectionsUrl(Number.NaN, -95.2359095, false)).toThrow(
      "valid latitude and longitude",
    );
  });
});
