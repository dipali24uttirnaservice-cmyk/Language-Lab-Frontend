"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Headphones,
  Layers3,
  ListChecks,
  Loader2,
  RefreshCw,
  Video,
  VideoOff,
  XCircle,
} from "lucide-react";

import { courseApi } from "@/services/course/courseApi";
import { topicApi, moduleApi } from "@/services/topic/topicApi";

// Single source of truth for the 5 content types every subtopic can hold —
// order here drives the order they're rendered in everywhere below.
const MODULE_TYPES = [
  { id: "video", label: "Video", icon: Video, accent: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", cachable: true },
  { id: "audio", label: "Audio", icon: Headphones, accent: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", cachable: true },
  { id: "text", label: "Text", icon: FileText, accent: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100", cachable: false },
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen, accent: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", cachable: false },
  { id: "exercise", label: "Exercise", icon: ListChecks, accent: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", cachable: false },
];

// Reads whichever shape the API happened to respond with — some endpoints
// here wrap the array in { data: { data: [...] } }, others in { data: [...] }.
const unwrapList = (res) => {
  const body = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(body) ? body : Array.isArray(body?.courses) ? body.courses : [];
};

const formatBytes = (bytes) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
};

export default function CourseContentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const courseId = params?.courseId;
  const courseName = searchParams.get("courseName") || "Course";
  const courseCode = searchParams.get("courseCode") || "";

  const [topics, setTopics] = useState(null); // null = loading
  const [topicsError, setTopicsError] = useState("");

  // topicId -> { loading, subtopics: [] }
  const [topicDetails, setTopicDetails] = useState({});
  // subtopicId -> { loading, counts: { video: n, audio: n, ... } }
  const [subtopicDetails, setSubtopicDetails] = useState({});

  const [openTopics, setOpenTopics] = useState({});
  const [openSubtopics, setOpenSubtopics] = useState({});
  // `${subtopicId}:${type}` -> bool — which content-type panel is expanded
  // to show the actual file list under a given subtopic.
  const [openTypePanels, setOpenTypePanels] = useState({});

  // module_id -> full local-caching asset record { status, downloaded_bytes,
  // total_bytes, error_message, title, module_type }, straight off the
  // download-status endpoint — this is what drives the per-video/audio
  // progress bars below, not just a plain "downloaded" count.
  const [assetMap, setAssetMap] = useState({});
  const [statusLoading, setStatusLoading] = useState(false);

  // Course-wide module totals (video/audio/text/vocabulary/exercise) — used
  // to work out how many video/audio files exist in total vs. how many were
  // actually queued for local caching (assetMap), so the "X not cached yet"
  // banner is accurate even before any topic/subtopic has been expanded.
  // Stays `null` until this genuinely loads — never defaulted to `{}`, so a
  // failed fetch can't quietly get treated as "0 modules exist" and cancel
  // out the not-queued count below.
  const [moduleCounts, setModuleCounts] = useState(null);
  const [moduleCountsError, setModuleCountsError] = useState(false);

  // Re-triggers the local caching pull (Settings → Download/Update Data does
  // the same thing) straight from this page, for files stuck at "Not queued
  // yet" — see courseApi.js: the local pull is fire-and-forget, so it can
  // silently fail to queue anything without the course ever looking
  // "un-downloaded" from Settings.
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState("");
  const [pollingActive, setPollingActive] = useState(false);

  const fetchTopics = async () => {
    try {
      setTopicsError("");
      const res = await topicApi.getTopics(courseId);
      setTopics(unwrapList(res));
    } catch (error) {
      console.error("Get Topics Error:", error);
      setTopics([]);
      setTopicsError(error?.response?.data?.message || "Could not load topics for this course.");
    }
  };

  // Builds module_id -> full asset record so the Video/Audio pills — and the
  // per-file list underneath them — can show exactly how much of this
  // subtopic's video/audio is actually cached to local disk, not just how
  // many modules exist.
  const fetchDownloadStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await courseApi.getCourseDownloadStatus(courseId);
      const assets = res.data?.data?.assets || [];
      const map = {};
      assets.forEach((asset) => {
        map[asset.module_id] = asset;
      });
      setAssetMap(map);
    } catch (error) {
      console.error("Course Download Status Error:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchModuleCounts = async () => {
    try {
      setModuleCountsError(false);
      const res = await courseApi.getModuleCount(courseId);
      // `?? {}` here (not `|| {}`) so an actual empty object from the API —
      // meaning "this course really has 0 modules" — isn't confused with a
      // response that came back malformed.
      setModuleCounts(res.data?.data?.module_counts ?? {});
    } catch (error) {
      console.error("Get Module Count Error:", error);
      // Deliberately leaves moduleCounts as null (not {}) on failure — the
      // banner below treats null as "unknown", not "0 modules", so a failed
      // request can never silently look like "nothing to cache".
      setModuleCountsError(true);
    }
  };

  // Repeatedly re-checks download-status every 4s while anything is still
  // pending/downloading, updating the progress bars live — same polling
  // shape as Settings' pollVideoProgress, just scoped to this page.
  const pollDownloadStatus = () => {
    setPollingActive(true);
    const tick = async () => {
      try {
        const res = await courseApi.getCourseDownloadStatus(courseId);
        const data = res.data?.data;
        const assets = data?.assets || [];
        const map = {};
        assets.forEach((asset) => {
          map[asset.module_id] = asset;
        });
        setAssetMap(map);

        const stillWorking =
          data && data.total > 0 && !data.all_completed &&
          (data.summary?.pending > 0 || data.summary?.downloading > 0);
        if (stillWorking) {
          setTimeout(tick, 4000);
        } else {
          setPollingActive(false);
        }
      } catch (error) {
        console.error("Poll Download Status Error:", error);
        setPollingActive(false);
      }
    };
    tick();
  };

  // Re-fires the same download call Settings' "Download"/"Update Data"
  // button uses — for files stuck at "Not queued yet" because the earlier
  // fire-and-forget local pull never queued them (see courseApi.js).
  const handleStartCaching = async () => {
    setTriggering(true);
    setTriggerError("");
    try {
      await courseApi.downloadCourse(courseId);
      await fetchModuleCounts();
      pollDownloadStatus();
    } catch (error) {
      console.error("Start Caching Error:", error);
      setTriggerError(
        error?.response?.data?.message || "Could not start caching — check your local server connection.",
      );
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    if (!courseId) return;
    fetchTopics();
    fetchDownloadStatus();
    fetchModuleCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const toggleTopic = async (topic) => {
    const topicId = topic._id;
    setOpenTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));

    if (topicDetails[topicId]) return; // already loaded

    setTopicDetails((prev) => ({ ...prev, [topicId]: { loading: true, subtopics: [] } }));
    try {
      const res = await topicApi.getTopicById(topicId);
      const subtopics = res.data?.data?.subtopics || [];
      setTopicDetails((prev) => ({ ...prev, [topicId]: { loading: false, subtopics } }));
    } catch (error) {
      console.error("Get Topic Error:", error);
      setTopicDetails((prev) => ({ ...prev, [topicId]: { loading: false, subtopics: [], error: true } }));
    }
  };

  const toggleSubtopic = async (subtopic) => {
    const subtopicId = subtopic._id;
    setOpenSubtopics((prev) => ({ ...prev, [subtopicId]: !prev[subtopicId] }));

    if (subtopicDetails[subtopicId]) return; // already loaded

    setSubtopicDetails((prev) => ({ ...prev, [subtopicId]: { loading: true, counts: null } }));
    try {
      const results = await Promise.all(
        MODULE_TYPES.map((t) => moduleApi.getModulesBySubtopic(t.id, subtopicId)),
      );

      // Deliberately stores just the module list (id + title), not asset
      // status — asset status is read live from `assetMap` at render time
      // (via the `assetMap` prop below) so the counts/progress bars keep
      // updating while pollDownloadStatus is running, instead of freezing at
      // whatever assetMap looked like the moment this subtopic was expanded.
      const counts = {};
      MODULE_TYPES.forEach((t, i) => {
        const list = unwrapList(results[i]);
        counts[t.id] = { total: list.length, modules: list };
      });

      setSubtopicDetails((prev) => ({ ...prev, [subtopicId]: { loading: false, counts } }));
    } catch (error) {
      console.error("Get Subtopic Modules Error:", error);
      setSubtopicDetails((prev) => ({ ...prev, [subtopicId]: { loading: false, counts: null, error: true } }));
    }
  };

  const totalSubtopics = (topics || []).reduce((sum, t) => sum + (t.subtopic_count || 0), 0);
  const assetList = Object.values(assetMap);
  const cachableAssetsDone = assetList.filter((a) => a.status === "completed").length;

  // Real course-wide video+audio total (from getModuleCount) vs. how many of
  // those were ever queued for local caching (assetMap has an entry only for
  // queued ones) — the gap is exactly what "Not queued yet" means. `null`
  // (not 0) while moduleCounts hasn't loaded/failed, so a slow or failed
  // request can never read as "0 total = nothing missing" and hide the fix.
  const cachableAssetsTotal = moduleCounts ? (moduleCounts.video || 0) + (moduleCounts.audio || 0) : null;
  const notQueuedCount = cachableAssetsTotal === null ? null : Math.max(0, cachableAssetsTotal - assetList.length);

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

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => router.push("/institute-dashboard/settings")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Settings
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 mb-3">
              <BookOpen size={16} /> Course Content
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 truncate">{courseName}</h1>
            {courseCode && (
              <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">{courseCode}</p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchDownloadStatus}
              disabled={statusLoading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-2.5 text-slate-600 font-bold text-sm transition-all hover:bg-slate-50 shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={16} className={statusLoading ? "animate-spin" : ""} />
              Refresh Status
            </button>

            {/* Always available, independent of the not-queued count below —
                so there's a manual way to (re)trigger local caching even if
                getModuleCount fails/is slow and the banner can't tell yet. */}
            <button
              type="button"
              onClick={handleStartCaching}
              disabled={triggering || pollingActive}
              className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-white font-bold text-sm transition-all hover:bg-orange-600 shadow-sm disabled:opacity-60"
            >
              {triggering ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Starting…
                </>
              ) : pollingActive ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Caching…
                </>
              ) : (
                <>
                  <Download size={16} /> Sync Video/Audio
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Layers3 size={16} />} label="Topics" value={topics === null ? "–" : topics.length} />
          <StatCard icon={<BookOpen size={16} />} label="Subtopics" value={topics === null ? "–" : totalSubtopics} />
          <StatCard
            icon={<Video size={16} />}
            label="Video & Audio Cached"
            value={cachableAssetsTotal ? `${cachableAssetsDone}/${cachableAssetsTotal}` : "–"}
          />
        </div>

        {/* Files that exist on the course but were never queued for local
            caching — the fire-and-forget local pull (see courseApi.js) can
            silently fail to queue anything without the course ever looking
            "un-downloaded" from Settings. `notQueuedCount === null` means
            the total itself couldn't be verified (getModuleCount failed) —
            shown as its own state rather than hidden, since the "Sync
            Video/Audio" header button above still works either way. */}
        {notQueuedCount === null && moduleCountsError && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 flex items-center gap-3">
            <AlertTriangle size={16} className="text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500">
              Couldn't verify how many video/audio files this course has — use{" "}
              <span className="font-semibold text-slate-700">Sync Video/Audio</span> above if playback seems
              incomplete offline.
            </p>
          </div>
        )}

        {notQueuedCount > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-amber-800 text-sm">
                  {notQueuedCount} video/audio file{notQueuedCount === 1 ? "" : "s"} not cached locally yet
                </p>
                <p className="text-xs text-amber-700/80 mt-0.5">
                  These won't play without internet until caching finishes.
                </p>
                {triggerError && <p className="text-xs text-red-600 mt-1 font-semibold">{triggerError}</p>}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartCaching}
              disabled={triggering || pollingActive}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-white font-bold text-sm shadow-sm transition-all hover:bg-amber-600 disabled:opacity-60 shrink-0 self-start sm:self-auto"
            >
              {triggering ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Starting…
                </>
              ) : pollingActive ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Caching…
                </>
              ) : (
                <>
                  <Download size={16} /> Start Caching Now
                </>
              )}
            </button>
          </div>
        )}

        {topics === null && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin" /> Loading topics…
          </div>
        )}

        {topicsError && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center text-sm text-red-500">
            {topicsError}
          </div>
        )}

        {topics !== null && topics.length === 0 && !topicsError && (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-10 text-center text-sm text-slate-400">
            No topics found for this course.
          </div>
        )}

        {topics !== null && topics.length > 0 && (
          <div className="space-y-3">
            {topics.map((topic, index) => {
              const isOpen = !!openTopics[topic._id];
              const detail = topicDetails[topic._id];

              return (
                <div
                  key={topic._id}
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{topic.title}</p>
                        <p className="text-xs font-semibold text-slate-400">
                          {topic.subtopic_count || 0} Subtopic{(topic.subtopic_count || 0) === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 space-y-2">
                      {detail?.loading && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 py-4 justify-center">
                          <Loader2 size={16} className="animate-spin" /> Loading subtopics…
                        </div>
                      )}

                      {detail?.error && (
                        <p className="text-sm text-red-500 py-2 text-center">Could not load subtopics.</p>
                      )}

                      {detail && !detail.loading && detail.subtopics.length === 0 && !detail.error && (
                        <p className="text-sm text-slate-400 py-2 text-center">No subtopics in this topic.</p>
                      )}

                      {detail?.subtopics.map((subtopic, sIndex) => (
                        <SubtopicRow
                          key={subtopic._id}
                          subtopic={subtopic}
                          index={sIndex}
                          isOpen={!!openSubtopics[subtopic._id]}
                          detail={subtopicDetails[subtopic._id]}
                          onToggle={() => toggleSubtopic(subtopic)}
                          openTypePanels={openTypePanels}
                          onToggleType={(typeId) => {
                            const key = `${subtopic._id}:${typeId}`;
                            setOpenTypePanels((prev) => ({ ...prev, [key]: !prev[key] }));
                          }}
                          assetMap={assetMap}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

function SubtopicRow({ subtopic, index, isOpen, detail, onToggle, openTypePanels, onToggleType, assetMap }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
            {index + 1}
          </div>
          <p className="font-semibold text-slate-700 text-sm truncate">{subtopic.title}</p>
        </div>
        <ChevronRight
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-3">
          {detail?.loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-3 justify-center">
              <Loader2 size={14} className="animate-spin" /> Loading module details…
            </div>
          )}

          {detail?.error && (
            <p className="text-xs text-red-500 py-2 text-center">Could not load module details.</p>
          )}

          {detail?.counts && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MODULE_TYPES.map((t) => {
                const Icon = t.icon;
                const raw = detail.counts[t.id] || { total: 0, modules: [] };
                // Read live off assetMap (not a stored snapshot) so this
                // count keeps advancing while pollDownloadStatus is running.
                const cached = t.cachable
                  ? raw.modules.filter((m) => assetMap[m._id]?.status === "completed").length
                  : 0;
                const c = { ...raw, cached };
                const fullyCached = t.cachable && c.total > 0 && c.cached === c.total;
                const partiallyCached = t.cachable && c.cached > 0 && c.cached < c.total;
                const panelKey = `${subtopic._id}:${t.id}`;
                const panelOpen = !!openTypePanels[panelKey];

                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => c.total > 0 && onToggleType(t.id)}
                    disabled={c.total === 0}
                    className={`rounded-xl border ${t.border} ${t.bg} px-3 py-2.5 flex flex-col gap-1 text-left transition-all ${
                      c.total > 0 ? "hover:brightness-95 cursor-pointer" : "opacity-60 cursor-default"
                    } ${panelOpen ? "ring-2 ring-offset-1 ring-slate-300" : ""}`}
                  >
                    <div className={`flex items-center justify-between gap-1.5 text-xs font-bold ${t.accent}`}>
                      <span className="flex items-center gap-1.5">
                        <Icon size={13} /> {t.label}
                      </span>
                      {c.total > 0 &&
                        (panelOpen ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />)}
                    </div>
                    <p className="text-lg font-black text-slate-800 leading-none">{c.total}</p>
                    {t.cachable && (
                      <p
                        className={`flex items-center gap-1 text-[11px] font-semibold ${
                          fullyCached ? "text-emerald-600" : partiallyCached ? "text-amber-600" : "text-slate-400"
                        }`}
                      >
                        {c.total === 0 ? (
                          "—"
                        ) : fullyCached ? (
                          <>
                            <CheckCircle2 size={12} /> {c.cached}/{c.total} downloaded
                          </>
                        ) : partiallyCached ? (
                          <>
                            <Clock size={12} /> {c.cached}/{c.total} downloaded
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> 0/{c.total} downloaded
                          </>
                        )}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* File list for whichever type card is expanded — video/audio get
              a real per-file progress bar, text/vocabulary/exercise just get
              a plain "available offline" checklist since those are small
              JSON records synced with the course pull, not separately
              downloaded files. */}
          {detail?.counts &&
            MODULE_TYPES.map((t) => {
              const panelKey = `${subtopic._id}:${t.id}`;
              if (!openTypePanels[panelKey]) return null;
              const c = detail.counts[t.id];
              if (!c || c.modules.length === 0) return null;

              return (
                <div key={t.id} className={`rounded-xl border ${t.border} ${t.bg} divide-y divide-white/60 overflow-hidden`}>
                  {c.modules.map((m) =>
                    t.cachable ? (
                      <VideoAssetRow key={m._id} title={m.title} asset={assetMap[m._id]} />
                    ) : (
                      <div key={m._id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-700 truncate">{m.title || "Untitled"}</p>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 shrink-0">
                          <CheckCircle2 size={12} /> Available offline
                        </span>
                      </div>
                    ),
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// One video/audio file's live caching progress — mirrors the row style used
// on the dedicated Video & Audio Download Progress page, just compact enough
// to sit inside this nested list.
function VideoAssetRow({ title, asset }) {
  // No asset record yet = this file was never queued for local caching
  // (see Settings → "Update Data" / "Start Caching Now"). Still rendered as
  // a 0% bar, same shape as every other row, instead of a bar-less line —
  // so "not started" reads as a state of the same progress bar, not a
  // different kind of row.
  const pct = !asset
    ? 0
    : asset.total_bytes > 0
    ? Math.min(100, Math.round((asset.downloaded_bytes / asset.total_bytes) * 100))
    : asset.status === "completed"
    ? 100
    : 0;

  const statusMeta = !asset
    ? { icon: Clock, color: "text-slate-400", bar: "bg-slate-300", label: "Not queued yet" }
    : {
        completed: { icon: CheckCircle2, color: "text-emerald-600", bar: "bg-emerald-500", label: "Downloaded" },
        downloading: { icon: Loader2, color: "text-orange-600", bar: "bg-orange-500", label: `${pct}%`, spin: true },
        pending: { icon: Clock, color: "text-slate-400", bar: "bg-slate-300", label: "Waiting…" },
        failed: { icon: VideoOff, color: "text-red-500", bar: "bg-red-400", label: "Failed" },
      }[asset.status] || { icon: Clock, color: "text-slate-400", bar: "bg-slate-300", label: asset.status };

  const Icon = statusMeta.icon;
  const barWidth = !asset || asset.status === "pending" ? 0 : pct;

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <p className="text-xs font-semibold text-slate-700 truncate min-w-0">{title || asset?.title || "Untitled"}</p>
        <span className={`flex items-center gap-1 text-[11px] font-bold shrink-0 ${statusMeta.color}`}>
          <Icon size={12} className={statusMeta.spin ? "animate-spin" : ""} />
          {statusMeta.label}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/70 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${statusMeta.bar}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      {asset?.status === "downloading" && asset.total_bytes > 0 && (
        <p className="mt-1 text-[10px] text-slate-400">
          {formatBytes(asset.downloaded_bytes)} / {formatBytes(asset.total_bytes)}
        </p>
      )}
      {asset?.status === "failed" && asset.error_message && (
        <p className="mt-1 text-[10px] text-red-500 truncate" title={asset.error_message}>
          {asset.error_message}
        </p>
      )}
    </div>
  );
}
