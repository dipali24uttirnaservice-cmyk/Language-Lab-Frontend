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

  // Whether this institute's LOCAL mirrored copy of a course is behind
  // master's source content — i.e. whether "Update Data" should show. Reads
  // both sides directly (not masterWithLocalFallback, which only ever
  // returns one) and compares their timestamps, so "since when is this
  // stale" lives on the two backends, never in browser storage — it stays
  // correct across tabs, machines, and sessions, unlike a client-side cache.
  // With no masterToken (plain institute login, no master access) there's
  // nothing to compare against, so the local copy is treated as current.
  getCourseSyncStatus: async (courseId) => {
    if (!Cookies.get("masterToken")) return { isStale: false };

    const [masterResult, localResult] = await Promise.allSettled([
      masterApiInstance.get(`/institute/me/courses/${courseId}/last-updated`),
      api.get(`/institute/me/courses/${courseId}/last-updated`),
    ]);

    if (localResult.status === "rejected") {
      const error = localResult.reason;
      if (isNetworkError(error)) return { isStale: false }; // local server itself unreachable — nothing to conclude
      // A 404 here specifically means the local backend has no Course doc
      // for this course at all — e.g. an earlier download's local mirror
      // silently failed (see downloadCourse above, before it started
      // awaiting/reporting that). `is_downloaded` can be true (master says
      // so) while this is still 404ing. That's not "can't tell" — it's
      // definitely stale, so surface it as such and let "Update Data"
      // re-trigger a real local sync instead of masking it forever behind a
      // console error.
      if (error.response?.status === 404) return { isStale: true };
      throw error;
    }

    if (masterResult.status === "rejected") {
      if (!isNetworkError(masterResult.reason)) throw masterResult.reason;
      // Master unreachable — nothing to compare against, don't falsely flag.
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
