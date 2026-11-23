// No "use client": the sanitizers are shared with /api/viewpoints/validate,
// and a "use client" module's functions can't be called from a route handler.
// Only client components import RichText, so it still renders on the client.

import type { ReactNode } from "react";
import type { JSONContent } from "@tiptap/react";

const SAFE_NODE_TYPES = new Set([
  "doc",
  "paragraph",
  "text",
  "bulletList",
  "orderedList",
  "listItem",
  "hardBreak",
  "heading",
  "blockquote",
  "codeBlock",
  "horizontalRule",
]);

const SAFE_MARK_TYPES = new Set(["bold", "italic", "strike", "code", "link"]);

function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) return null;
  return href;
}

export function sanitizeRichTextJson(input: unknown): JSONContent {
  if (!input || typeof input !== "object") {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }

  const root = input as JSONContent;
  function sanitizeNode(node: JSONContent): JSONContent | null {
    if (!node || typeof node !== "object" || !SAFE_NODE_TYPES.has(node.type ?? "")) {
      return null;
    }
    if (node.type === "text") {
      if (typeof node.text !== "string") return null;
      const marks: Array<{ type: string; attrs?: Record<string, unknown> }> = [];
      for (const mark of node.marks ?? []) {
        if (!SAFE_MARK_TYPES.has(mark.type ?? "")) continue;
        if (mark.type === "link") {
          const href = safeHref(mark.attrs?.href);
          if (href) {
            marks.push({
              type: "link",
              attrs: { href, target: "_blank", rel: "noopener noreferrer" },
            });
          }
        } else if (mark.type) {
          marks.push({ type: mark.type });
        }
      }
      return marks?.length ? { type: "text", text: node.text, marks } : { type: "text", text: node.text };
    }

    const content = Array.isArray(node.content)
      ? node.content.map(sanitizeNode).filter((child): child is JSONContent => child !== null)
      : undefined;
    const attrs: Record<string, unknown> = {};
    if (node.type === "heading") {
      const level = Number(node.attrs?.level);
      if (level >= 1 && level <= 6) attrs.level = level;
    }
    if (node.type === "orderedList") {
      const start = Number(node.attrs?.start);
      if (Number.isInteger(start)) attrs.start = start;
    }
    return {
      type: node.type,
      ...(content?.length ? { content } : {}),
      ...(Object.keys(attrs).length ? { attrs } : {}),
    };
  }

  const content = root.type === "doc" && Array.isArray(root.content)
    ? root.content.map(sanitizeNode).filter((child): child is JSONContent => child !== null)
    : [];

  return content.length
    ? { type: "doc", content }
    : { type: "doc", content: [{ type: "paragraph" }] };
}

export function richTextText(input: unknown): string {
  const doc = sanitizeRichTextJson(input);
  const pieces: string[] = [];
  function collect(node: JSONContent) {
    if (node.type === "text") pieces.push(node.text ?? "");
    if (node.type === "hardBreak") pieces.push("\n");
    node.content?.forEach(collect);
  }
  doc.content?.forEach(collect);
  return pieces.join("").trim();
}

export function RichText({ value }: { value: unknown }) {
  const doc = sanitizeRichTextJson(value);

  function renderInline(node: JSONContent, key: string): ReactNode {
    if (node.type === "text") {
      let result: ReactNode = node.text ?? "";
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") result = <strong>{result}</strong>;
        if (mark.type === "italic") result = <em>{result}</em>;
        if (mark.type === "strike") result = <s>{result}</s>;
        if (mark.type === "code") result = <code>{result}</code>;
        if (mark.type === "link") {
          const href = safeHref(mark.attrs?.href);
          if (href) result = <a href={href} target="_blank" rel="noopener noreferrer">{result}</a>;
        }
      }
      return <span key={key}>{result}</span>;
    }
    if (node.type === "hardBreak") return <br key={key} />;
    return null;
  }

  function renderNode(node: JSONContent, key: string): ReactNode {
    const children = node.content?.map((child, index) =>
      child.type === "text" || child.type === "hardBreak"
        ? renderInline(child, `${key}-${index}`)
        : renderNode(child, `${key}-${index}`),
    );
    if (node.type === "paragraph") return <p key={key}>{children}</p>;
    if (node.type === "bulletList") return <ul key={key}>{children}</ul>;
    if (node.type === "orderedList") return <ol key={key} start={Number(node.attrs?.start) || 1}>{children}</ol>;
    if (node.type === "listItem") return <li key={key}>{children}</li>;
    if (node.type === "heading") {
      const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 2));
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return <Tag key={key}>{children}</Tag>;
    }
    if (node.type === "blockquote") return <blockquote key={key}>{children}</blockquote>;
    if (node.type === "codeBlock") return <pre key={key}><code>{children}</code></pre>;
    if (node.type === "horizontalRule") return <hr key={key} />;
    if (node.type === "doc") return <>{children}</>;
    return null;
  }

  return <div className="detail-rich-text">{doc.content?.map((node, index) => renderNode(node, String(index)))}</div>;
}
