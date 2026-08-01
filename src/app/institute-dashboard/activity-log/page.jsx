"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Search, Download, Loader2, Calendar, Clock, Layers } from "lucide-react";

import { activityLogApi } from "@/services/institute/activityLogApi";
import { courseApi } from "@/services/course/courseApi";

export default function ActivityLogPage() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    courseApi
      .getCourses()
      .then((res) => setCourses(res.data?.data?.courses || []))
      .catch((error) => console.error("Get Courses Error:", error));
  }, []);

  const loadLog = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (courseId) params.courseId = courseId;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await activityLogApi.getActivityLog(params);
      setRows(res.data?.data?.students || []);
    } catch (error) {
      console.error("Get Activity Log Error:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId, from, to]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {};
      if (courseId) params.courseId = courseId;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await activityLogApi.exportActivityLog(params);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "activity-log.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export Activity Log Error:", error);
    } finally {
      setExporting(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.full_name?.toLowerCase().includes(q) ||
        r.enrollment_no?.toLowerCase().includes(q),
    );
  }, [rows, searchQuery]);

  const formatDuration = (sec) => {
    const s = sec || 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="relative min-h-screen p-8 space-y-8 overflow-hidden font-sans">
      {/* Background Theme Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/60 via-indigo-50/40 to-sky-100/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-sky-500/10 blur-3xl" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              Institute Management Portal
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Student Activity Log
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white disabled:opacity-60"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export CSV
        </motion.button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or enrollment no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.course_name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Calendar className="w-4 h-4" />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm"
          />
          <span>to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" /> Activity Overview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{filteredRows.length} students with recorded activity</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Last Login</th>
                  <th className="py-4 px-6">Sessions</th>
                  <th className="py-4 px-6">Time Spent</th>
                  <th className="py-4 px-6">Modules Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {filteredRows.length > 0 ? (
                  filteredRows.map((row) => (
                    <tr key={row.student_id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{row.full_name}</div>
                        <div className="text-xs text-slate-500 font-normal">{row.enrollment_no}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        {row.last_login ? new Date(row.last_login).toLocaleString() : "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 text-xs">
                          <Layers className="w-3.5 h-3.5" /> {row.session_count}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200 text-xs">
                          <Clock className="w-3.5 h-3.5" /> {formatDuration(row.time_spent_sec)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-800">{row.modules_opened}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-semibold">
                      No activity recorded for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
