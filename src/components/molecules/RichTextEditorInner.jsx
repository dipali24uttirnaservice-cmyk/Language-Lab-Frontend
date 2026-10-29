"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  BlockQuote,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

export default function RichTextEditorInner({
  value,
  onChange,
  placeholder,
  error = false,
  minHeight = 150,
}) {
  return (
    <div
      className={`rich-text-editor rounded-2xl border text-sm ${
        error ? "border-red-500" : "border-slate-200"
      }`}
      style={{ "--rte-min-h": `${minHeight}px` }}
    >
      <style>{`
        .rich-text-editor .ck.ck-editor__editable_inline {
          min-height: var(--rte-min-h, 150px);
          padding-left: 1rem;
          padding-right: 1rem;
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
        }
        .rich-text-editor .ck.ck-toolbar {
          background: rgba(240, 253, 250, 0.7);
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }
        .rich-text-editor .ck.ck-editor__editable.ck-focused {
          border-color: #14b8a6 !important;
          box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.15) !important;
        }
      `}</style>
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={{
          licenseKey: "GPL",
          plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Link, List, BlockQuote],
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "link",
            "blockQuote",
            "|",
            "undo",
            "redo",
          ],
          placeholder,
        }}
        onChange={(_, editor) => onChange(editor.getData())}
      />
    </div>
  );
}
