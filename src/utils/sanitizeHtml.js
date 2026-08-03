import DOMPurify from "dompurify";

// dangerouslySetInnerHTML sites render rich-text (CKEditor) content that
// comes back from the API — sanitize it so a compromised/malicious payload
// can't inject scripts. DOMPurify needs a DOM, so this is a no-op passthrough
// during SSR; the "use client" pages that call it only render post-mount anyway.
export function sanitizeHtml(html) {
  if (!html) return "";
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html);
}
