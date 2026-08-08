// utils/media.js
//
// Locally-cached course videos (see Language-Lab-Backend's
// instituteController.downloadCourseData + service/videoDownloadService.js)
// are served from the backend's /media static route, which sits OUTSIDE the
// /api prefix that NEXT_PUBLIC_API_URL points at. This resolves a module's
// relative `video.local_url` (e.g. "/media/<instituteId>/<moduleId>.mp4")
// into an absolute URL against the same backend host.
const getMediaBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  return apiUrl.replace(/\/api\/?$/, "");
};

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
