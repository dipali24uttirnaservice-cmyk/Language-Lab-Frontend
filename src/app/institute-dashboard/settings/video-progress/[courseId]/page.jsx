"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Loader2, RefreshCw, VideoOff, Video, Headphones } from "lucide-react";
import { courseApi } from "@/services/course/courseApi";

const formatBytes = (bytes) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
};

function VideoRow({ asset }) {
  const pct =
    asset.total_bytes > 0
      ? Math.min(100, Math.round((asset.downloaded_bytes / asset.total_bytes) * 100))
      : asset.status === "completed"
      ? 100
      : 0;

  const statusMeta = {
    completed: { icon: CheckCircle2, color: "text-emerald-600", bar: "bg-emerald-500", label: "Downloaded" },
    downloading: { icon: Loader2, color: "text-orange-600", bar: "bg-orange-500", label: `${pct}%`, spin: true },
    pending: { icon: Clock, color: "text-slate-400", bar: "bg-slate-300", label: "Waiting…" },
    failed: { icon: VideoOff, color: "text-red-500", bar: "bg-red-400", label: "Failed" },
  }[asset.status] || { icon: Clock, color: "text-slate-400", bar: "bg-slate-300", label: asset.status };

  const Icon = statusMeta.icon;
  const TypeIcon = asset.module_type === "audio" ? Headphones : Video;

  return (
    <div className="py-4 px-6">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 truncate min-w-0">
          <TypeIcon size={13} className="text-slate-400 shrink-0" />
          <span className="truncate">{asset.title || "Untitled"}</span>
        </p>
        <span className={`flex items-center gap-1 text-xs font-bold shrink-0 ${statusMeta.color}`}>
          <Icon size={14} className={statusMeta.spin ? "animate-spin" : ""} />
          {statusMeta.label}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${statusMeta.bar}`}
          style={{ width: `${asset.status === "pending" ? 0 : pct}%` }}
        />
      </div>
      {asset.status === "downloading" && asset.total_bytes > 0 && (
        <p className="mt-1.5 text-[11px] text-slate-400">
          {formatBytes(asset.downloaded_bytes)} / {formatBytes(asset.total_bytes)}
        </p>
      )}
      {asset.status === "failed" && asset.error_message && (
        <p className="mt-1.5 text-[11px] text-red-500 truncate" title={asset.error_message}>
          {asset.error_message}
        </p>
      )}
    </div>
  );
}

// Dedicated page for tracking a course's per-video local-caching progress —
// one row per video with its own bar, instead of a single aggregate count.
// Reachable from Settings ("Caching videos locally… X/Y" link).
export default function VideoDownloadProgressPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const courseId = params?.courseId;
  const courseName = searchParams.get("courseName") || "";

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;
    let firstRun = true;

    const tick = async () => {
      if (firstRun) {
        firstRun = false;
        setLoading(true);
      }
      try {
        const response = await courseApi.getCourseDownloadStatus(courseId);
        if (cancelled) return;
        setAssets(response.data?.data?.assets || []);
      } catch (error) {
        console.error("Video Download Status Error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    tick();
    const interval = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [courseId]);

  const retryFailed = async () => {
    // Re-hitting the download endpoint re-queues anything not yet
    // "completed" (see instituteController.downloadCourseData ->
    // queueVideoDownloads), so this is enough to retry failures.
    try {
      await courseApi.downloadCourse(courseId);
    } catch (error) {
      console.error("Retry Download Error:", error);
    }
  };

  const failedCount = assets.filter((a) => a.status === "failed").length;

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

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => router.push("/institute-dashboard/settings")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Settings
        </button>

        <div className="border-b border-slate-200/60 pb-5">
          <h1 className="text-2xl font-black text-slate-900">Video & Audio Download Progress</h1>
          <p className="mt-1 text-slate-500">{courseName}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {loading && assets.length === 0 ? (
            <div className="py-16 flex items-center justify-center text-slate-400 gap-2">
              <Loader2 size={18} className="animate-spin" /> Loading…
            </div>
          ) : assets.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No video or audio in this course.</div>
          ) : (
            assets.map((asset) => <VideoRow key={asset.module_id} asset={asset} />)
          )}
        </div>

        {failedCount > 0 && (
          <button
            type="button"
            onClick={retryFailed}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 text-sm font-bold hover:bg-red-100 transition-colors"
          >
            <RefreshCw size={16} /> Retry {failedCount} failed item{failedCount > 1 ? "s" : ""}
          </button>
        )}
      </div>
    </div>
  );
}
