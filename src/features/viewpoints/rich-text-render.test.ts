
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RichText } from "./rich-text";

function render(value: unknown): string {
  return renderToStaticMarkup(createElement(RichText, { value }));
}

describe("RichText rendering", () => {
  it("renders supported formatting as real elements", () => {
    const html = render({
      type: "doc",
      content: [{
        type: "paragraph",
        content: [
          { type: "text", text: "Bold", marks: [{ type: "bold" }] },
          { type: "text", text: " and " },
          {
            type: "text",
            text: "link",
            marks: [{ type: "link", attrs: { href: "https://example.com" } }],
          },
        ],
      }],
    });

    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("escapes markup typed into text instead of executing it", () => {
    const html = render({
      type: "doc",
      content: [{
        type: "paragraph",
        content: [{ type: "text", text: '<script>alert(1)</script><img src=x onerror=alert(1)>' }],
      }],
    });

    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
  });

  it("drops unknown nodes, event handler attributes and javascript: links", () => {
    const html = render({
      type: "doc",
      content: [
        { type: "script", content: [{ type: "text", text: "alert(1)" }] },
        { type: "image", attrs: { src: "x", onerror: "alert(1)" } },
        {
          type: "paragraph",
          attrs: { onclick: "alert(1)" },
          content: [{
            type: "text",
            text: "click",
            marks: [{ type: "link", attrs: { href: "javascript:alert(1)", onclick: "alert(1)" } }],
          }],
        },
      ],
    });

    expect(html).not.toMatch(/<script|<img|onerror|onclick|javascript:/i);
    expect(html).toContain("click");
  });

  it("renders a safe empty document for non-document input", () => {
    expect(render(null)).toContain("<p></p>");
    expect(render("<script>alert(1)</script>")).not.toContain("<script");
  });
});
