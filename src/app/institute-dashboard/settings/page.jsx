"use client";

import { useEffect, useState } from "react";
import { AlertCircle, BookOpen, Check, Download, Inbox, RefreshCw, Settings as SettingsIcon } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import StatusModal from "@/components/molecules/StatusModal";
import { courseApi } from "@/services/course/courseApi";

const storageKey = (courseId) => `downloaded_course_${courseId}`;

export default function SettingsPage() {
  const { user: institute } = useAuth();
  const instituteName = institute?.institute_name || "Institute";

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState(null); // null = not fetched yet
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadedIds, setDownloadedIds] = useState({});
  const [staleIds, setStaleIds] = useState({});

  const [modal, setModal] = useState({ open: false, type: "", title: "", message: "" });

  useEffect(() => {
    if (!courses) return;

    const next = {};
    for (const course of courses) {
      next[course._id] = !!localStorage.getItem(storageKey(course._id));
    }
    setDownloadedIds(next);

    // For courses already pulled, check if the source content has changed
    // since the last pull — if so, flag them as needing "Update Data".
    const checkStale = async () => {
      const downloaded = courses.filter((c) => next[c._id]);
      const results = await Promise.all(
        downloaded.map(async (course) => {
          try {
            const saved = JSON.parse(localStorage.getItem(storageKey(course._id)));
            const response = await courseApi.getCourseLastUpdated(course._id);
            const latest = response.data?.data?.last_updated;

            const isStale =
              latest && saved?.last_updated &&
              new Date(latest).getTime() > new Date(saved.last_updated).getTime();

            return [course._id, !!isStale];
          } catch (error) {
            console.error("Last Updated Check Error:", error);
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
      const response = await courseApi.downloadCourse(course._id);
      const pulledData = response.data?.data;

      localStorage.setItem(storageKey(course._id), JSON.stringify(pulledData));
      setDownloadedIds((prev) => ({ ...prev, [course._id]: true }));
      setStaleIds((prev) => ({ ...prev, [course._id]: false }));

      setModal({
        open: true,
        type: "success",
        title: "Course Data Pulled",
        message: `"${course.course_name}" is now downloaded successfully.`,
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
              const isDownloaded = !!downloadedIds[course._id];
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
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(course)}
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
