import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  validateViewpointInput,
  validateViewpointRequest,
} from "./viewpoint";

function doc(text: string) {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: text ? [{ type: "text", text }] : [] }],
  };
}

const valid = {
  title: "Overlook",
  description: doc("A quiet bluff above the river."),
  latitude: "38.9717",
  longitude: "-95.2353",
};

function errorsFor(overrides: Record<string, unknown>) {
  const result = validateViewpointInput({ ...valid, ...overrides });
  return result.ok ? {} : result.fieldErrors;
}

describe("viewpoint title", () => {
  it("requires a non-blank title", () => {
    expect(errorsFor({ title: "" }).title).toBe("Add a title.");
    expect(errorsFor({ title: "   " }).title).toBe("Add a title.");
  });

  it("accepts exactly the maximum length and rejects one more", () => {
    expect(errorsFor({ title: "a".repeat(TITLE_MAX_LENGTH) }).title).toBeUndefined();
    expect(errorsFor({ title: "a".repeat(TITLE_MAX_LENGTH + 1) }).title).toMatch("80 characters");
  });

  it("trims surrounding whitespace before measuring", () => {
    const result = validateViewpointInput({ ...valid, title: `  ${"a".repeat(TITLE_MAX_LENGTH)}  ` });
    expect(result.ok && result.value.title).toBe("a".repeat(TITLE_MAX_LENGTH));
  });
});

describe("viewpoint description", () => {
  it("requires visible text", () => {
    expect(errorsFor({ description: doc("") }).description).toBe("Add a description.");
    expect(errorsFor({ description: undefined }).description).toBe("Add a description.");
  });

  it("accepts exactly 2,000 characters and rejects 2,001", () => {
    expect(errorsFor({ description: doc("a".repeat(DESCRIPTION_MAX_LENGTH)) }).description)
      .toBeUndefined();
    expect(errorsFor({ description: doc("a".repeat(DESCRIPTION_MAX_LENGTH + 1)) }).description)
      .toMatch("2,000 characters");
  });

  it("does not count formatting toward the limit", () => {
    const bold = {
      type: "doc",
      content: [{
        type: "paragraph",
        content: [{ type: "text", text: "a".repeat(DESCRIPTION_MAX_LENGTH), marks: [{ type: "bold" }] }],
      }],
    };
    expect(errorsFor({ description: bold }).description).toBeUndefined();
  });
});

describe("viewpoint coordinates", () => {
  it("accepts the latitude endpoints", () => {
    expect(errorsFor({ latitude: -90 }).latitude).toBeUndefined();
    expect(errorsFor({ latitude: "90" }).latitude).toBeUndefined();
  });

  it.each([-90.0001, 90.0001, "", "abc", Number.NaN, null])(
    "rejects latitude %s",
    (latitude) => {
      expect(errorsFor({ latitude }).latitude).toBe("Enter a valid latitude between -90 and 90.");
    },
  );

  it("accepts the longitude endpoints", () => {
    expect(errorsFor({ longitude: -180 }).longitude).toBeUndefined();
    expect(errorsFor({ longitude: "180" }).longitude).toBeUndefined();
  });

  it.each([-180.0001, 180.0001, "", Number.POSITIVE_INFINITY])(
    "rejects longitude %s",
    (longitude) => {
      expect(errorsFor({ longitude }).longitude).toBe("Enter a valid longitude between -180 and 180.");
    },
  );

  it("returns parsed numbers for valid input", () => {
    const result = validateViewpointInput(valid);
    expect(result.ok && result.value).toMatchObject({ latitude: 38.9717, longitude: -95.2353 });
  });
});

describe("server validation response", () => {
  it("returns 200 with the cleaned viewpoint", () => {
    const response = validateViewpointRequest({ ...valid, title: "  Overlook  " });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      viewpoint: { title: "Overlook", descriptionText: "A quiet bluff above the river." },
    });
  });

  it("returns 422 with every invalid field at once", () => {
    const response = validateViewpointRequest({
      title: "",
      description: doc(""),
      latitude: 91,
      longitude: -181,
    });
    expect(response.status).toBe(422);
    expect(response.status === 422 && Object.keys(response.body.fieldErrors).sort())
      .toEqual(["description", "latitude", "longitude", "title"]);
  });

  it("rejects a body that is not an object", () => {
    expect(validateViewpointRequest("nope").status).toBe(422);
    expect(validateViewpointRequest(null).status).toBe(422);
  });
});
