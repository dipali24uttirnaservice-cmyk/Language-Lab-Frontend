"use client";

import { useCallback, useRef, useState } from "react";
import { chunkUploadApi } from "@/services/upload/chunkUploadApi";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB — matches the backend's 12MB per-chunk multer limit with headroom
const MAX_RETRIES_PER_CHUNK = 3;
const RESUME_KEY_PREFIX = "chunkUpload:";

// Identifies "the same file" across page reloads so an interrupted upload
// can resume instead of restarting from byte zero.
const resumeKey = (file, fieldname) =>
  `${RESUME_KEY_PREFIX}${fieldname}:${file.name}:${file.size}:${file.lastModified}`;

export function useChunkedUpload() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | uploading | completing | done | error | cancelled
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setStatus("idle");
    setError(null);
  }, []);

  // Returns the AWS upload result ({ cdnUrl / fullS3URL, ... }) on success.
  const upload = useCallback(async (file, fieldname) => {
    setStatus("uploading");
    setError(null);
    setProgress(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const key = resumeKey(file, fieldname);

      let uploadId = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      let uploadedIndexes = [];

      if (uploadId) {
        try {
          const statusRes = await chunkUploadApi.getStatus(uploadId);
          uploadedIndexes = statusRes?.data?.data?.uploadedChunks || [];
        } catch {
          uploadId = null; // session expired/gone server-side — start fresh below
        }
      }

      if (!uploadId) {
        const initRes = await chunkUploadApi.init({
          fileName: file.name,
          totalChunks,
          fieldname,
          mimetype: file.type,
        });
        uploadId = initRes?.data?.data?.uploadId;
        if (typeof window !== "undefined") localStorage.setItem(key, uploadId);
      }

      const uploadedSet = new Set(uploadedIndexes);
      let uploadedBytes = uploadedSet.size * CHUNK_SIZE;

      for (let index = 0; index < totalChunks; index += 1) {
        if (uploadedSet.has(index)) continue;

        const start = index * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const blob = file.slice(start, end);

        let uploaded = false;
        for (let attempt = 0; attempt <= MAX_RETRIES_PER_CHUNK && !uploaded; attempt += 1) {
          try {
            await chunkUploadApi.uploadChunk(uploadId, index, blob, {
              signal: controller.signal,
              onUploadProgress: (evt) => {
                const totalLoaded = uploadedBytes + (evt.loaded || 0);
                setProgress(Math.min(99, Math.round((totalLoaded / file.size) * 100)));
              },
            });
            uploaded = true;
          } catch (err) {
            if (controller.signal.aborted || attempt === MAX_RETRIES_PER_CHUNK) throw err;
            await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
          }
        }

        uploadedBytes += blob.size;
      }

      setStatus("completing");
      const completeRes = await chunkUploadApi.complete(uploadId);
      if (typeof window !== "undefined") localStorage.removeItem(key);

      setProgress(100);
      setStatus("done");
      return completeRes?.data?.data;
    } catch (err) {
      if (controller.signal.aborted) {
        setStatus("cancelled");
      } else {
        setStatus("error");
        setError(err?.response?.data?.message || err.message || "Upload failed.");
      }
      throw err;
    }
  }, []);

  return { upload, cancel, reset, progress, status, error };
}
