import Cookies from "js-cookie";
import api, { masterApiInstance } from "../apiMethod/apiMethod";

// A request that never reached the server at all (no internet, master
// unreachable, ...) comes back from axios with no `error.response` — that's
// the only case worth falling back to the local backend's already-synced
// copy for. A real error FROM master (401, 404, 500, ...) still means
// something is actually wrong and should surface normally, not be masked by
// silently swapping to local data.
const isNetworkError = (error) => !error.response;

// Tries master first (freshest data when online), falls back to the local
// backend's mirrored copy when master can't be reached at all — this is what
// makes an already-downloaded course/list usable with no internet, since the
// local backend + local Mongo + locally-cached video/audio files need none.
async function masterWithLocalFallback(masterCall, localCall) {
  try {
    return await masterCall();
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    console.warn("Master unreachable (offline?) — using local backend's cached copy.");
    return await localCall();
  }
}

export const courseApi = {
  getCourses: () =>
    masterWithLocalFallback(
      () => masterApiInstance.get("/institute/me/courses"),
      () => api.get("/institute/me/courses"),
    ),

  bulkAssignCourses: (data) => api.put("/student/bulk-assign-courses", data),

  getModuleCount: (courseId) => api.get(`/module/course/${courseId}/count`),

  // When online: master's response is what the UI renders immediately, while
  // this institute's own LOCAL backend is also told to pull+cache the same
  // course/topic/subtopic/module tree (and its videos/audio to its own disk —
  // see queueVideoDownloads/queueAudioDownloads) in the background, so it
  // works as a standalone offline server afterward. The local pull forwards
  // the master-issued token (masterToken cookie) as x-master-token, since
  // that's what instituteController.downloadCourseData's fallback sync needs
  // to call master's protected download route itself.
  // When offline (master unreachable): skips straight to the local backend's
  // already-cached response — no internet needed once a course has been
  // downloaded before.
  downloadCourse: (courseId) => {
    const masterToken = Cookies.get("masterToken");
    const localHeaders = masterToken ? { "x-master-token": masterToken } : {};
    const localCall = () =>
      api.get(`/institute/me/courses/${courseId}/download`, { headers: localHeaders });

    return masterWithLocalFallback(() => {
      // Fire-and-forget: if this fails, the course still displays fine from
      // master's response below — it just isn't cached locally yet.
      localCall().catch((error) => {
        console.error("Local course pull failed:", error);
      });
      return masterApiInstance.get(`/institute/me/courses/${courseId}/download`);
    }, localCall);
  },

  getCourseLastUpdated: (courseId) =>
    masterWithLocalFallback(
      () => masterApiInstance.get(`/institute/me/courses/${courseId}/last-updated`),
      () => api.get(`/institute/me/courses/${courseId}/last-updated`),
    ),

  // Poll target while the backend finishes caching this course's videos to
  // local disk in the background (kicked off by downloadCourse above). Stays
  // on the LOCAL backend always — this tracks video files landing on THIS
  // machine's own disk (see queueVideoDownloads/DownloadedAsset), which
  // master has no route for and never will (master doesn't cache to your
  // institute's disk). Already fully offline-capable — no fallback needed.
  getCourseDownloadStatus: (courseId) =>
    api.get(`/institute/me/courses/${courseId}/download-status`),
};
