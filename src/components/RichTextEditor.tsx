// src/components/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  Palette,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Paletas de cores restauradas
const TEXT_COLORS = [
  { name: "Default", color: "#000000" },
  { name: "Grey", color: "#6B7280" },
  { name: "Red", color: "#EF4444" },
  { name: "Orange", color: "#F97316" },
  { name: "Green", color: "#22C55E" },
  { name: "Blue", color: "#3B82F6" },
  { name: "Purple", color: "#8B5CF6" },
  { name: "Pink", color: "#EC4899" },
];

const HIGHLIGHT_COLORS = [
  { name: "Yellow", color: "#FEF3C7" },
  { name: "Red", color: "#FEE2E2" },
  { name: "Green", color: "#D1FAE5" },
  { name: "Blue", color: "#DBEAFE" },
  { name: "Purple", color: "#F3E8FF" },
  { name: "Pink", color: "#FCE7F3" },
];

// Componente da paleta de cores
const ColorPalette = ({
  editor,
  type,
}: {
  editor: Editor;
  type: "color" | "highlight";
}) => {
  const colors = type === "color" ? TEXT_COLORS : HIGHLIGHT_COLORS;
  const command =
    type === "color"
      ? (color: string) => editor.chain().focus().setColor(color).run()
      : (color: string) =>
          editor.chain().focus().toggleHighlight({ color }).run();
  const unsetColorCommand =
    type === "color"
      ? () => editor.chain().focus().unsetColor().run()
      : () => editor.chain().focus().unsetHighlight().run();

  return (
    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 w-48">
      <div className="grid grid-cols-4 gap-1">
        {colors.map(({ name, color }) => (
          <button
            key={name}
            type="button"
            onClick={() => command(color)}
            className="w-8 h-8 rounded-full border border-gray-200 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={name}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={unsetColorCommand}
        className="w-full text-xs text-center text-gray-500 hover:text-gray-800 pt-2 mt-2 border-t"
      >
        Remover
      </button>
    </div>
  );
};

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) => {
  const [showColorPalette, setShowColorPalette] = useState<
    "color" | "highlight" | null
  >(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none p-4 min-h-[200px]",
      },
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const isSame = editor.getHTML() === value;
      if (!isSame) {
        editor.commands.setContent(value, false);
      }
    }
  }, [value, editor]);

  const toggleColorPalette = (type: "color" | "highlight") => {
    if (showColorPalette === type) {
      setShowColorPalette(null);
    } else {
      setShowColorPalette(type);
    }
  };

  if (!editor) return <div>Carregando editor...</div>;

  return (
    <div className={`bg-white border border-gray-300 rounded-lg ${className}`}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <Redo size={16} />
        </button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-100 text-blue-600"
              : ""
          }`}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-100 text-blue-600"
              : ""
          }`}
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-100 text-blue-600"
              : ""
          }`}
        >
          <Heading3 size={16} />
        </button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("bold") ? "bg-blue-100 text-blue-600" : ""
          }`}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("italic") ? "bg-blue-100 text-blue-600" : ""
          }`}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("underline") ? "bg-blue-100 text-blue-600" : ""
          }`}
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("strike") ? "bg-blue-100 text-blue-600" : ""
          }`}
        >
          <Strikethrough size={16} />
        </button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleColorPalette("color")}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Type size={16} />
          </button>
          {showColorPalette === "color" && (
            <ColorPalette editor={editor} type="color" />
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleColorPalette("highlight")}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Palette size={16} />
          </button>
          {showColorPalette === "highlight" && (
            <ColorPalette editor={editor} type="highlight" />
          )}
        </div>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("bulletList") ? "bg-blue-100 text-blue-600" : ""
          }`}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("orderedList") ? "bg-blue-100 text-blue-600" : ""
          }`}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 ${
            editor.isActive("blockquote") ? "bg-blue-100 text-blue-600" : ""
          }`}
        >
          <Quote size={16} />
        </button>
      </div>
      <div className="relative">
        <EditorContent editor={editor} />
        {placeholder && editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
