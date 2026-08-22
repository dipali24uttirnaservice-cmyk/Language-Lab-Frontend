"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, RotateCcw } from "lucide-react";
import ProgressBar from "@/components/atoms/ProgressBar";

export default function ChunkedFileUpload({
  accept,
  label = "Upload file",
  onUploaded,
}) {
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, uploading, done, error
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("uploading");
    setProgress(30);

    const formData = new FormData();
    formData.append("file", file); // Multer field name on backend

    try {
      // Post directly to your local backend server upload route
      const response = await fetch("http://localhost:5000/api/upload/local", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");

      setProgress(100);
      setStatus("done");
      
      // Pass back the local URL
      onUploaded?.({
        cdnUrl: data.fileUrl,
        fullS3URL: data.fileUrl,
      });
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <UploadCloud size={18} className="text-orange-500" />
          {label}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={status === "uploading"}
        onChange={handleFileChange}
        className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-orange-600 hover:file:bg-orange-100"
      />

      {fileName && status === "uploading" && (
        <div className="mt-4">
          <ProgressBar percentage={progress} label={fileName} />
        </div>
      )}

      {status === "done" && (
        <p className="mt-2 text-xs font-medium text-emerald-600">File uploaded locally successfully!</p>
      )}

      {status === "error" && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}