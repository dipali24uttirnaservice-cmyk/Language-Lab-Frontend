"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, History, Loader2 } from "lucide-react";

import { reportApi } from "@/services/institute/reportApi";
import { studentApi } from "@/services/student/studentApi";

const LIMIT = 50;

export default function ActivityHistoryPage() {
  const { studentId } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const formatActivityType = (type) =>
    String(type || "")
      .split("_")
      .join(" ")
      .replace(/^./, (c) => c.toUpperCase());

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const [studentRes, historyRes] = await Promise.all([
        studentApi.getStudentById(studentId),
        reportApi.getActivityHistory(studentId, { page: 1, limit: LIMIT }),
      ]);
      setStudent(studentRes.data?.data || studentRes.data || null);
      const data = historyRes.data?.data || {};
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPage(1);
    } catch (error) {
      console.error("Get Activity History Error:", error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await reportApi.getActivityHistory(studentId, {
        page: nextPage,
        limit: LIMIT,
      });
      const data = res.data?.data || {};
      setLogs((prev) => [...prev, ...(data.logs || [])]);
      setPage(nextPage);
    } catch (error) {
      console.error("Get Activity History Error:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="relative min-h-screen p-8 space-y-8 overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/60 via-orange-50/40 to-amber-200/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-400/10 to-amber-500/10 blur-3xl" />
      </div>

      <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md hover:shadow-orange-500/25 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Activity History
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {student
              ? `${student.full_name} (${student.enrollment_no})`
              : "Loading student…"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {total} recorded activit{total === 1 ? "y" : "ies"}
          </p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-6">Module</th>
                    <th className="py-4 px-6">Action</th>
                    <th className="py-4 px-6">Time Spent</th>
                    <th className="py-4 px-6">Score</th>
                    <th className="py-4 px-6">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-4 px-6 text-slate-800">
                          <div className="font-bold">{log.topic_id?.title || "—"}</div>
                          {log.sub_topic_id?.title && (
                            <div className="text-xs text-slate-400">{log.sub_topic_id.title}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {formatActivityType(log.activity_type)}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {log.time_spent_sec ? `${Math.round(log.time_spent_sec / 60)} min` : "—"}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {log.score != null ? `${log.score}${log.max_score ? `/${log.max_score}` : ""}` : "—"}
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs">
                          {log.logged_at ? new Date(log.logged_at).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-semibold">
                        No activity recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {logs.length > 0 && logs.length < total && (
              <div className="p-4 text-center border-t border-slate-100">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all disabled:opacity-60"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
