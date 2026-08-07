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
