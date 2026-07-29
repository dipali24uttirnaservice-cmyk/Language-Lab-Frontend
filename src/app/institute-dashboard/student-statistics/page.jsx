"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenCheck,
  Dumbbell,
  FileText,
  CheckSquare,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  ArrowLeft,
  Sparkles,
  Layers,
  Loader2,
  User,
} from "lucide-react";

import { reportApi } from "@/services/institute/reportApi";
import { studentApi } from "@/services/student/studentApi";
import { courseApi } from "@/services/course/courseApi";

const CARD_META = {
  topics: {
    label: "Topic Details",
    icon: BookOpenCheck,
    color: "from-blue-500 to-indigo-600",
    ring: "border-blue-500 ring-blue-500/20 from-blue-50/50 to-indigo-50/50",
    hover: "hover:border-blue-300",
  },
  exercises: {
    label: "Exercise Report",
    icon: Dumbbell,
    color: "from-purple-500 to-pink-600",
    ring: "border-purple-500 ring-purple-500/20 from-purple-50/50 to-indigo-50/50",
    hover: "hover:border-purple-300",
  },
  practical: {
    label: "Practical Manuals",
    icon: FileText,
    color: "from-amber-500 to-orange-500",
    ring: "border-amber-500 ring-amber-500/20 from-amber-50/50 to-orange-50/50",
    hover: "hover:border-amber-300",
  },
  tasks: {
    label: "Student Task Report",
    icon: CheckSquare,
    color: "from-emerald-500 to-teal-600",
    ring: "border-emerald-500 ring-emerald-500/20 from-emerald-50/50 to-teal-50/50",
    hover: "hover:border-emerald-300",
  },
};

export default function StudentStatisticsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [courseId, setCourseId] = useState("");

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const [progress, setProgress] = useState(null);
  const [reportData, setReportData] = useState({
    topics: [],
    exercises: [],
    practical: [],
    tasks: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    studentApi
      .getStudents()
      .then((res) => setStudents(res.data?.data?.students || []))
      .catch((error) => console.error("Get Students Error:", error));

    courseApi
      .getCourses()
      .then((res) => setCourses(res.data?.data?.courses || []))
      .catch((error) => console.error("Get Courses Error:", error));
  }, []);

  const loadReports = useCallback(async () => {
    if (!selectedStudent) return;
    try {
      setLoading(true);
      const [topicsRes, exercisesRes, practicalRes, tasksRes, progressRes] = await Promise.all([
        reportApi.getTopicDetails(selectedStudent._id, courseId),
        reportApi.getExerciseReport(selectedStudent._id, courseId),
        reportApi.getPracticalReport(selectedStudent._id, courseId),
        reportApi.getTaskReport(selectedStudent._id, courseId),
        reportApi.getProgressReport(selectedStudent._id, courseId),
      ]);
      setReportData({
        topics: topicsRes.data?.data?.topics || [],
        exercises: exercisesRes.data?.data?.exercises || [],
        practical: practicalRes.data?.data?.practicals || [],
        tasks: tasksRes.data?.data?.tasks || [],
      });
      setProgress(progressRes.data?.data || null);
    } catch (error) {
      console.error("Get Student Reports Error:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStudent, courseId]);

  useEffect(() => {
    setActiveTab("overview");
    loadReports();
  }, [loadReports]);

  const matchingStudents = useMemo(() => {
    if (!studentQuery) return [];
    const q = studentQuery.toLowerCase();
    return students
      .filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.enrollment_no?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [studentQuery, students]);

  const getActiveDataset = () => {
    const data = reportData[activeTab] || [];
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(q)),
    );
  };

  return (
    <div className="relative min-h-screen p-8 space-y-8 overflow-hidden font-sans">
      {/* Background Theme Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/60 via-orange-50/40 to-amber-200/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-400/10 to-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ea580c_1px,transparent_1px),linear-gradient(to_bottom,#ea580c_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          {activeTab !== "overview" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("overview")}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md hover:shadow-orange-500/25 transition-all"
              title="Back to Overview"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                {activeTab === "overview" ? "Institute Intelligence Module" : "Granular Filter Mode"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {activeTab === "overview" && "Student Statistics & Performance Reports"}
              {activeTab === "topics" && "Topic Details Report"}
              {activeTab === "exercises" && "Exercise Submission Report"}
              {activeTab === "practical" && "Practical Manual Submissions"}
              {activeTab === "tasks" && "Student Task Report"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 rounded-2xl border border-orange-200/60 shadow-sm text-sm font-bold text-orange-800">
          <Calendar className="w-4 h-4 text-orange-600" />
          <span>Real-time Analytics Active</span>
        </div>
      </div>

      {/* Student Picker */}
      <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name or enrollment no..."
            value={selectedStudent ? `${selectedStudent.full_name} (${selectedStudent.enrollment_no})` : studentQuery}
            onChange={(e) => {
              setSelectedStudent(null);
              setStudentQuery(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {!selectedStudent && matchingStudents.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
              {matchingStudents.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => {
                    setSelectedStudent(s);
                    setStudentQuery("");
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-bold text-slate-800">{s.full_name}</span>
                  <span className="text-xs text-slate-400">{s.enrollment_no}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.course_name}</option>
          ))}
        </select>
      </div>

      {!selectedStudent ? (
        <div className="py-20 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-400 text-sm font-semibold">Search and select a student above to load their reports.</p>
        </div>
      ) : loading ? (
        <div className="py-20 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Interactive Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(CARD_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const count = reportData[key]?.length || 0;
              return (
                <motion.div
                  key={key}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(key)}
                  className={`relative bg-white/90 backdrop-blur-sm p-6 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-xl group overflow-hidden ${
                    activeTab === key
                      ? `ring-4 bg-gradient-to-br ${meta.ring}`
                      : `border-slate-200 ${meta.hover}`
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meta.label}</p>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">{count}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 mt-3 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                        <Sparkles className="w-3 h-3" /> Inspect records →
                      </span>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Conditional Workspace Area */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8"
              >
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-3 relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-xl border border-amber-500/30">
                    <Layers className="w-4 h-4" /> {selectedStudent.full_name}
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">
                    Overall completion: {progress?.overall_completion_percentage ?? 0}%
                  </h2>
                  {progress?.breakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {Object.entries(progress.breakdown).map(([key, b]) => (
                        <div key={key} className="bg-white/5 rounded-2xl px-3 py-2.5 border border-white/10">
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{key}</p>
                          <p className="text-lg font-black">{b.completion_percentage}%</p>
                          <p className="text-[10px] text-slate-400">{b.completed}/{b.total} completed</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab("topics")}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black transition-all shadow-lg shadow-orange-500/25 shrink-0 relative z-10"
                >
                  Explore Topic Details Now
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 capitalize">{CARD_META[activeTab]?.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Showing records for {selectedStudent.full_name}</p>
                  </div>

                  <div className="relative flex-1 sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter this table..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <ReportTable tab={activeTab} rows={getActiveDataset()} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const isGood = ["completed", "approved", "reviewed", "done", "passed"].includes(
    String(status).toLowerCase(),
  );
  const isBad = ["overdue", "rejected"].includes(String(status).toLowerCase());
  const Icon = isBad ? XCircle : isGood ? CheckCircle2 : Clock;
  const color = isBad
    ? "text-rose-700 bg-rose-50 border-rose-200"
    : isGood
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : "text-amber-700 bg-amber-50 border-amber-200";
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-xl border text-xs shadow-sm ${color}`}>
      <Icon className="w-3.5 h-3.5" /> {status ?? "—"}
    </span>
  );
}

function ReportTable({ tab, rows }) {
  const columns = {
    topics: [
      { key: "topic_title", label: "Topic" },
      { key: "completion_percentage", label: "Completion", render: (r) => `${r.completion_percentage}%` },
      { key: "time_spent_sec", label: "Time Spent", render: (r) => `${Math.round((r.time_spent_sec || 0) / 60)} min` },
      { key: "last_accessed", label: "Last Accessed", render: (r) => r.last_accessed ? new Date(r.last_accessed).toLocaleString() : "—" },
    ],
    exercises: [
      { key: "exercise_title", label: "Exercise" },
      { key: "attempts", label: "Attempts" },
      { key: "score_percentage", label: "Score", render: (r) => `${r.best_score ?? 0}/${r.max_score ?? 0} (${r.score_percentage}%)` },
      { key: "is_passed", label: "Status", render: (r) => <StatusPill status={r.is_passed ? "Passed" : "Not Passed"} /> },
    ],
    practical: [
      { key: "title", label: "Practical" },
      { key: "status", label: "Status", render: (r) => <StatusPill status={r.status} /> },
      { key: "marks", label: "Marks", render: (r) => r.marks ?? "—" },
      { key: "submitted_at", label: "Submitted", render: (r) => r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—" },
    ],
    tasks: [
      { key: "title", label: "Task" },
      { key: "type", label: "Type" },
      { key: "status", label: "Status", render: (r) => <StatusPill status={r.overdue ? "overdue" : r.status} /> },
      { key: "due_date", label: "Due", render: (r) => r.due_date ? new Date(r.due_date).toLocaleDateString() : "—" },
      { key: "grade", label: "Grade", render: (r) => r.grade ?? "—" },
    ],
  }[tab];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
            {columns.map((col) => (
              <th key={col.key} className="py-4 px-6">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm font-medium">
          {rows.length > 0 ? (
            rows.map((row, i) => (
              <tr key={row._id || row.topic_id || row.module_id || row.practical_id || row.task_id || i} className="hover:bg-orange-50/40 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-6 text-slate-800">
                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400 text-sm font-semibold">
                No matching records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
