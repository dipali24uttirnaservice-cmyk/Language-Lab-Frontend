"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BookOpen, Check, Download, Inbox, RefreshCw, Settings as SettingsIcon } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import StatusModal from "@/components/molecules/StatusModal";
import { courseApi } from "@/services/course/courseApi";

export default function SettingsPage() {
  const router = useRouter();
  const { user: institute } = useAuth();
  const instituteName = institute?.institute_name || "Institute";

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState(null); // null = not fetched yet
  const [downloadingId, setDownloadingId] = useState(null);
  // Whether the source content has changed since this institute's local copy
  // was synced — courseId -> boolean, computed fresh from the backend each
  // time (see courseApi.getCourseSyncStatus), never cached client-side.
  const [staleIds, setStaleIds] = useState({});
  // Video files finish caching to local disk in the background after the
  // course metadata download responds — this tracks that separately so the
  // "Downloaded" state doesn't lie about videos still being fetched from AWS.
  const [videoProgress, setVideoProgress] = useState({}); // courseId -> { total, completed, summary }

  const [modal, setModal] = useState({ open: false, type: "", title: "", message: "" });

  // Polls download-status until every video for this course has finished
  // (or failed) caching to local disk. Runs on its own after the metadata
  // download responds — the "Downloaded" button doesn't wait on it.
  const pollVideoProgress = (courseId) => {
    const tick = async () => {
      try {
        const response = await courseApi.getCourseDownloadStatus(courseId);
        const status = response.data?.data;
        if (!status) return;

        setVideoProgress((prev) => ({
          ...prev,
          [courseId]: { total: status.total, completed: status.summary.completed, summary: status.summary },
        }));

        const stillWorking = status.total > 0 && !status.all_completed &&
          (status.summary.pending > 0 || status.summary.downloading > 0);
        if (stillWorking) setTimeout(tick, 4000);
      } catch (error) {
        console.error("Video Download Status Error:", error);
      }
    };
    tick();
  };

  // The list is always re-fetched fresh from the server on mount — never
  // cached client-side — so it can't "go missing" after navigating away and
  // back, and it's always correct no matter which browser/profile/session
  // (including incognito) you're looking at it from.
  useEffect(() => {
    handleGetCourses();
  }, []);

  useEffect(() => {
    if (!courses) return;
    const downloaded = courses.filter((c) => c.is_downloaded);

    // Resume tracking video-caching progress for anything already
    // downloaded, in case some videos were still mid-download (or failed)
    // when this page was last closed.
    for (const course of downloaded) pollVideoProgress(course._id);

    // For courses already pulled, ask the backend whether the source
    // content has changed since this institute's copy was synced — if so,
    // flag them as needing "Update Data".
    const checkStale = async () => {
      const results = await Promise.all(
        downloaded.map(async (course) => {
          try {
            const { isStale } = await courseApi.getCourseSyncStatus(course._id);
            return [course._id, isStale];
          } catch (error) {
            console.error("Sync Status Check Error:", error);
            return [course._id, false];
          }
        }),
      );

      setStaleIds(Object.fromEntries(results));
    };

    checkStale();
  }, [courses]);

  const handleGetCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await courseApi.getCourses();
      setCourses(response.data?.data?.courses || []);
    } catch (error) {
      console.error("Get Courses Error:", error);
      setModal({
        open: true,
        type: "error",
        title: "Failed to Load Courses",
        message: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleDownload = async (course) => {
    try {
      setDownloadingId(course._id);
      const { localSyncError } = await courseApi.downloadCourse(course._id);

      // Reflect the now-downloaded state straight in the list rather than a
      // separate client-tracked flag — `is_downloaded` here is exactly what
      // the next getCourses() call from the server would say too. Master did
      // mark it downloaded even if the local mirror below failed, so this
      // stays accurate either way.
      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? { ...c, is_downloaded: true } : c)),
      );
      setStaleIds((prev) => ({ ...prev, [course._id]: false }));
      pollVideoProgress(course._id);

      // A failed local mirror means offline access/course-content browsing
      // won't work for this course yet, even though it now shows
      // "Downloaded" — surface that instead of a false "success", see
      // courseApi.downloadCourse.
      setModal({
        open: true,
        type: localSyncError ? "error" : "success",
        title: localSyncError ? "Downloaded, but Local Sync Failed" : "Course Data Pulled",
        message: localSyncError
          ? `"${course.course_name}" is downloaded, but couldn't be mirrored to your local server: ${localSyncError}. Offline access won't work until this succeeds — try again.`
          : `"${course.course_name}" is now downloaded. Videos are being cached locally in the background.`,
      });
    } catch (error) {
      console.error("Download Course Error:", error);
      setModal({
        open: true,
        type: "error",
        title: "Download Failed",
        message: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F4F7FC] p-4 md:p-8">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.45]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #E2E8F0 1px, transparent 1px),
            linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 mb-3">
              <SettingsIcon size={16} /> Settings
            </div>
            <h1 className="text-3xl font-black text-slate-900">{instituteName}</h1>
            <p className="mt-1 text-slate-500">Fetch and manage the courses assigned to your institute.</p>
          </div>

          <button
            type="button"
            onClick={handleGetCourses}
            disabled={coursesLoading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-white font-bold transition-all hover:bg-orange-600 hover:scale-[1.02] shadow-lg disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw size={18} className={coursesLoading ? "animate-spin" : ""} />
            {coursesLoading ? "Fetching..." : "Get Course"}
          </button>
        </div>

        {(courses === null || courses.length === 0) && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox size={26} />
            </div>
            <p className="font-bold text-slate-500">
              {courses === null ? "No course assigned" : "No courses assigned yet"}
            </p>
            <p className="text-sm text-slate-400">
              Click <span className="font-semibold text-orange-600">Get Course</span> to fetch the latest list.
            </p>
          </div>
        )}

        {courses !== null && courses.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {courses.map((course) => {
              const isDownloading = downloadingId === course._id;
              const isDownloaded = !!course.is_downloaded;
              const isStale = isDownloaded && !!staleIds[course._id];

              return (
                <div
                  key={course._id}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600 shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{course.course_name}</p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {course.course_code}
                      </p>
                      {(() => {
                        const progress = videoProgress[course._id];
                        if (!progress || progress.total === 0) return null;
                        const done = progress.completed === progress.total;
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/institute-dashboard/settings/video-progress/${course._id}?courseName=${encodeURIComponent(course.course_name)}`,
                              )
                            }
                            className={`text-xs mt-0.5 font-medium underline decoration-dotted underline-offset-2 hover:no-underline ${done ? "text-emerald-600" : "text-slate-400"}`}
                          >
                            {done
                              ? `Video & audio cached locally (${progress.total}/${progress.total})`
                              : `Caching video & audio locally… ${progress.completed}/${progress.total}`}
                            {progress.summary.failed > 0 && (
                              <span className="text-red-500"> · {progress.summary.failed} failed</span>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      isDownloaded && !isStale
                        ? router.push(
                            `/institute-dashboard/settings/course-content/${course._id}?courseName=${encodeURIComponent(course.course_name)}&courseCode=${encodeURIComponent(course.course_code || "")}`,
                          )
                        : handleDownload(course)
                    }
                    disabled={isDownloading}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all shadow-sm shrink-0 disabled:opacity-50 ${
                      isStale
                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        : isDownloaded
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Pulling...
                      </>
                    ) : isStale ? (
                      <>
                        <AlertCircle size={16} /> Update Data
                      </>
                    ) : isDownloaded ? (
                      <>
                        <Check size={16} /> Downloaded
                      </>
                    ) : (
                      <>
                        <Download size={16} /> Download
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StatusModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
