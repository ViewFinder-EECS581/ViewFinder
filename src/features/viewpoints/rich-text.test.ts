import { describe, expect, it } from "vitest";
import { richTextText, sanitizeRichTextJson } from "./rich-text";

describe("rich text sanitization", () => {
  it("preserves supported formatting and lists", () => {
    const result = sanitizeRichTextJson({
      type: "doc",
      content: [{
        type: "bulletList",
        content: [{
          type: "listItem",
          content: [{
            type: "paragraph",
            content: [{ type: "text", text: "Safe text", marks: [{ type: "bold" }] }],
          }],
        }],
      }],
    });

    expect(result.type).toBe("doc");
    expect(JSON.stringify(result)).toContain('"type":"bulletList"');
    expect(JSON.stringify(result)).toContain('"type":"bold"');
  });

  it("removes unsupported nodes and event attributes", () => {
    const result = sanitizeRichTextJson({
      type: "doc",
      content: [
        {
          type: "script",
          attrs: { onload: "alert(1)" },
          content: [{ type: "text", text: "bad" }],
        },
        {
          type: "paragraph",
          attrs: { onclick: "alert(1)" },
          content: [{ type: "text", text: "safe" }],
        },
      ],
    });

    expect(JSON.stringify(result)).not.toContain("script");
    expect(JSON.stringify(result)).not.toContain("onload");
    expect(JSON.stringify(result)).not.toContain("onclick");
    expect(richTextText(result)).toBe("safe");
  });

  it("removes javascript links", () => {
    const result = sanitizeRichTextJson({
      type: "doc",
      content: [{
        type: "paragraph",
        content: [{
          type: "text",
          text: "Unsafe",
          marks: [{ type: "link", attrs: { href: "javascript:alert(1)", onmouseover: "alert(1)" } }],
        }],
      }],
    });

    expect(JSON.stringify(result)).not.toContain("javascript:");
    expect(JSON.stringify(result)).not.toContain("onmouseover");
  });

  it("keeps only safe HTTP and mail links", () => {
    const result = sanitizeRichTextJson({
      type: "doc",
      content: [{
        type: "paragraph",
        content: [{
          type: "text",
          text: "Website",
          marks: [{ type: "link", attrs: { href: "https://example.com" } }],
        }],
      }],
    });

    expect(JSON.stringify(result)).toContain("https://example.com");
  });
});
