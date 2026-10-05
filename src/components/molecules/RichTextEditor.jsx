"use client";

import dynamic from "next/dynamic";

// CKEditor touches `window`/`document` on import, so it can only run client-side.
const RichTextEditor = dynamic(() => import("./RichTextEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[150px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" />
  ),
});

export default RichTextEditor;
