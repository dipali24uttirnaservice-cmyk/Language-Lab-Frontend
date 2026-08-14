"use client";

import { useEffect, useState } from "react";

// utils/media.js
//
// Locally-cached course videos (see Language-Lab-Backend's
// instituteController.downloadCourseData + service/videoDownloadService.js)
// are served from the backend's /api/media static route (server.js also
// mounts a bare /media for setups with no reverse proxy in front). This
// resolves a module's relative `video.local_url` (e.g.
// "/media/<instituteId>/<moduleId>.mp4") into an absolute URL.
//
// Deliberately built by appending straight onto NEXT_PUBLIC_API_URL as-is
// (not stripping its /api suffix) — some deployments sit behind a reverse
// proxy that only forwards paths starting with /api, so a URL built from the
// bare host+port (no /api) would 404 at the proxy before ever reaching this
// server. Piggybacking on the exact same base every other API call already
// uses successfully avoids having to guess at the network setup.
const getMediaBaseUrl = () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${getMediaBaseUrl()}${path}`;
};

// Prefer the video already downloaded to this institute's local server —
// falls back to the AWS-hosted URL when the local copy isn't ready yet
// (still "pending"/"downloading", or the course was never downloaded).
export const getPlayableVideoUrl = (video) => {
  if (!video) return "";
  if (video.local_url) return resolveMediaUrl(video.local_url);
  return video.url?.trim() || "";
};

// Same idea, for an audio module (see instituteController.downloadCourseData
// — audio modules get the same download_status/local_url treatment as video).
export const getPlayableAudioUrl = (audio) => {
  if (!audio) return "";
  if (audio.local_url) return resolveMediaUrl(audio.local_url);
  return audio.url?.trim() || "";
};

// The institute's own logo, once cached locally (see downloadCourseData's
// opportunistic queueSingleAssetDownload for institute_logo + getMe's
// local_logo_url) — falls back to the AWS-hosted logo, then a bundled
// default if the institute has no logo at all.
export const getInstituteLogoUrl = (institute, fallback = "/collage-logo.png") => {
  if (!institute) return fallback;
  if (institute.local_logo_url) return resolveMediaUrl(institute.local_logo_url);
  return institute.logo || fallback;
};

// Same three-way preference as getInstituteLogoUrl (local copy → AWS-hosted
// → bundled placeholder), but also recovers when the *preferred* one 404s —
// e.g. the institute's DB record says the local download "completed" but the
// file is actually missing from this server's disk (cleared uploads/,
// redeployed backend, download row left stale), which otherwise leaves the
// sidebar/navbar logo blank after a refresh since next/image has no
// built-in onError fallback. Wire the returned `onError` to the <Image>.
export function useInstituteLogoSrc(institute, fallback = "/collage-logo.png") {
  const localSrc = institute?.local_logo_url ? resolveMediaUrl(institute.local_logo_url) : null;
  const awsSrc = institute?.logo || null;
  const chain = [localSrc, awsSrc, fallback].filter(Boolean);

  const [src, setSrc] = useState(chain[0]);

  // Re-sync when the institute (or its logo fields) actually changes —
  // e.g. profile data finishes loading after being null on first render —
  // rather than every render, so a previous onError fallback isn't undone.
  useEffect(() => {
    setSrc(chain[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSrc, awsSrc, fallback]);

  const onError = () => {
    const next = chain[chain.indexOf(src) + 1];
    if (next) setSrc(next);
  };

  return { src, onError };
}
