"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, RotateCcw } from "lucide-react";
import ProgressBar from "@/components/atoms/ProgressBar";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

// Drop-in chunked upload control for any of the backend's supported fields:
// profileImage, logo, profilePhoto, studentPhoto, videoFile, audioFile.
// Large files are split client-side and streamed in 5MB chunks, resume
// automatically after a dropped connection, and land in AWS the same way
// a direct multer upload would — onUploaded receives the same
// { cdnUrl / fullS3URL, ... } shape controllers already read today.
export default function ChunkedFileUpload({
  fieldname,
  accept,
  label = "Upload file",
  onUploaded,
}) {
  const { upload, cancel, reset, progress, status, error } = useChunkedUpload();
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const uploaded = await upload(file, fieldname);
      onUploaded?.(uploaded);
    } catch {
      // status/error are already surfaced via hook state
    }
  };

  const isBusy = status === "uploading" || status === "completing";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <UploadCloud size={18} className="text-orange-500" />
          {label}
        </div>

        {isBusy ? (
          <button
            type="button"
            onClick={cancel}
            className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
          >
            <X size={14} /> Cancel
          </button>
        ) : status === "error" || status === "cancelled" ? (
          <button
            type="button"
            onClick={() => {
              reset();
              inputRef.current?.click();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            <RotateCcw size={14} /> Retry
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={isBusy}
        onChange={handleFileChange}
        className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-orange-600 hover:file:bg-orange-100"
      />

      {fileName && status !== "idle" && (
        <div className="mt-4">
          <ProgressBar
            percentage={progress}
            label={
              status === "completing"
                ? "Finalizing…"
                : status === "done"
                  ? "Uploaded"
                  : fileName
            }
            color={status === "error" ? "from-red-500 to-rose-500" : "from-orange-500 to-amber-500"}
          />
        </div>
      )}

      {status === "error" && error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
