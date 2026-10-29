import Cookies from "js-cookie";
import api, { masterApiInstance } from "../apiMethod/apiMethod";

// A request that never reached the server at all (no internet, master
// unreachable, ...) comes back from axios with no `error.response` — that's
// the only case worth falling back to the local backend's already-synced
// copy for. A real error FROM master (404, 500, ...) still means something
// is actually wrong and should surface normally, not be masked by silently
// swapping to local data. 401 is handled separately below — see masterToken.
const isNetworkError = (error) => !error.response;

// Tries master first (freshest data when online), falls back to the local
// backend's mirrored copy when master can't be reached at all — this is what
// makes an already-downloaded course/list usable with no internet, since the
// local backend + local Mongo + locally-cached video/audio files need none.
//
// Also skips straight to `localCall` when there's no masterToken cookie at
// all, WITHOUT ever attempting `masterCall` — a plain /login session
// (instituteLogin, not instituteConfigLogin) never obtains one, so calling
// master here would predictably 401 every single time, not just when
// offline. That's a real "master can't answer this" case, same as a network
// error, not an auth problem worth surfacing to the user.
async function masterWithLocalFallback(masterCall, localCall) {
  if (!Cookies.get("masterToken")) {
    return await localCall();
  }

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

  // When online (and a masterToken exists): master's download call lands
  // first, then this institute's own LOCAL backend is told to pull+cache the
  // same course/topic/subtopic/module tree (and its videos/audio to its own
  // disk — see queueVideoDownloads/queueAudioDownloads), so it works as a
  // standalone offline server afterward. The local pull forwards the
  // master-issued token (masterToken cookie) as x-master-token, since that's
  // what instituteController.downloadCourseData's fallback sync needs to
  // call master's protected download route itself.
  // Otherwise (offline, or no masterToken this session): skips straight to
  // the local backend's already-cached response.
  //
  // The local mirror is AWAITED (not fire-and-forget) and its outcome
  // reported back as `{ localSyncError }` — callers (Settings' Download
  // button, course-content's "start caching" retry) rely on knowing whether
  // it actually succeeded before treating the course as locally available,
  // e.g. querying /module/course/:id/count immediately afterward. Returning
  // before the mirror lands is what causes that call to 404 with "course
  // not found".
  downloadCourse: async (courseId) => {
    const masterToken = Cookies.get("masterToken");
    const localHeaders = masterToken ? { "x-master-token": masterToken } : {};
    const localCall = () =>
      api.get(`/institute/me/courses/${courseId}/download`, { headers: localHeaders });

    let masterSucceeded = false;
    if (masterToken) {
      // A real error from master (not a network drop) means nothing
      // downloaded at all — let that throw normally instead of falling
      // through to also attempt the local call.
      try {
        await masterApiInstance.get(`/institute/me/courses/${courseId}/download`);
        masterSucceeded = true;
      } catch (error) {
        if (!isNetworkError(error)) throw error;
        console.warn("Master unreachable (offline?) — using local backend's cached copy.");
      }
    }

    if (!masterSucceeded) {
      // No masterToken, or master was unreachable — this local call IS the
      // whole download (not a background mirror of an already-succeeded
      // master download), so let a failure here throw and surface as a real
      // "Download Failed", same as before.
      return await localCall();
    }

    // Master already succeeded — this is just mirroring that data to the
    // local backend, so a failure here doesn't mean the download failed,
    // just that offline access won't work yet. Reported back, not thrown.
    try {
      await localCall();
      return { localSyncError: null };
    } catch (error) {
      console.error("Local course pull failed:", error);
      return {
        localSyncError: error?.response?.data?.message || error.message || "Unknown error",
      };
    }
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

  // Whether this institute's LOCAL mirrored copy of a course is behind the
  // source content — i.e. whether "Update Data" should show. Two deployment
  // shapes need two different checks, so both are combined here:
  //
  // 1. Standalone (no separate master DB, or masterToken missing this
  //    session): the local backend's own .../sync-status already compares
  //    its live content against the snapshot stamped at the last successful
  //    downloadCourseData (see instituteController.js) — no masterToken
  //    needed.
  // 2. Master+local split deployment (this frontend's normal case —
  //    NEXT_PUBLIC_MASTER_API_URL is a different server/DB than
  //    NEXT_PUBLIC_API_URL): a topic/subtopic/module added on MASTER never
  //    shows up in the local backend's own DB until the course is
  //    re-downloaded, so #1 alone stays "not stale" forever even after
  //    content changes upstream — masterApi's own last-updated has to be
  //    compared against local's directly.
  //
  // The old implementation only ever did #2, and silently fell back to
  // "not stale" whenever masterToken was missing — breaking #1 entirely for
  // standalone setups. This does both and flags stale if either says so.
  getCourseSyncStatus: async (courseId) => {
    const localSyncStatus = await api
      .get(`/institute/me/courses/${courseId}/sync-status`)
      .then((res) => !!res.data?.data?.is_stale)
      .catch(() => false);

    if (localSyncStatus) return { isStale: true };

    if (!Cookies.get("masterToken")) return { isStale: false };

    const [masterResult, localResult] = await Promise.allSettled([
      masterApiInstance.get(`/institute/me/courses/${courseId}/last-updated`),
      api.get(`/institute/me/courses/${courseId}/last-updated`),
    ]);

    if (masterResult.status === "rejected" || localResult.status === "rejected") {
      // Either side unreachable/erroring — nothing reliable to compare,
      // don't falsely flag (the #1 check above already covers what it can).
      return { isStale: false };
    }

    const masterUpdated = masterResult.value.data?.data?.last_updated;
    const localUpdated = localResult.value.data?.data?.last_updated;
    const isStale =
      !!masterUpdated && !!localUpdated &&
      new Date(masterUpdated).getTime() > new Date(localUpdated).getTime();

    return { isStale };
  },
};
