"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from "lucide-react";

export type { JSONContent } from "@tiptap/react";

type RichTextEditorProps = {
  value: JSONContent;
  onChange: (value: JSONContent) => void;
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        isAllowedUri: (url) => /^https?:\/\/|^mailto:/i.test(url),
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
        role: "textbox",
        "aria-label": "Description",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON());
    },
  });

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    if (!/^https?:\/\/|^mailto:/i.test(url.trim())) {
      window.alert("Use an http://, https://, or mailto: link.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({
      href: url.trim(),
      target: "_blank",
      rel: "noopener noreferrer",
    }).run();
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Description formatting">
        <button
          type="button"
          aria-label="Bold"
          aria-pressed={editor?.isActive("bold") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Italic"
          aria-pressed={editor?.isActive("italic") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Bulleted list"
          aria-pressed={editor?.isActive("bulletList") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          aria-pressed={editor?.isActive("orderedList") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Add link"
          aria-pressed={editor?.isActive("link") ?? false}
          disabled={!editor}
          onClick={setLink}
        >
          <LinkIcon size={16} aria-hidden="true" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
