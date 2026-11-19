import { describe, expect, it } from "vitest";
import {
  ONBOARDING_STORAGE_KEY,
  hasDismissedOnboarding,
  rememberOnboardingDismissal,
} from "./onboarding";

describe("first-visit onboarding persistence", () => {
  it("shows the onboarding when there is no dismissal", () => {
    const storage = { getItem: () => null };
    expect(hasDismissedOnboarding(storage)).toBe(false);
  });

  it("hides the onboarding after dismissal", () => {
    let value: string | null = null;
    const storage = {
      getItem: () => value,
      setItem: (key: string, nextValue: string) => {
        expect(key).toBe(ONBOARDING_STORAGE_KEY);
        value = nextValue;
      },
    };

    rememberOnboardingDismissal(storage);
    expect(hasDismissedOnboarding(storage)).toBe(true);
  });

  it("does not treat an unrelated value as dismissal", () => {
    const storage = { getItem: () => "other" };
    expect(hasDismissedOnboarding(storage)).toBe(false);
  });
});
