"use client";
import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  LogIn,
  Activity,
  History,
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

function StudentStatisticsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get("studentId");
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

  const [activitySummary, setActivitySummary] = useState(null);

  useEffect(() => {
    studentApi
      .getStudents()
      .then((res) => setStudents(res.data?.data?.students || []))
      .catch((error) => console.error("Get Students Error:", error));

    courseApi
      .getCourses()
      .then((res) => {
        const allCourses = res.data?.data?.courses || [];
        setCourses(allCourses.filter((course) => course.is_downloaded));
      })
      .catch((error) => console.error("Get Courses Error:", error));
  }, []);

  useEffect(() => {
    if (!studentIdParam || !students.length) return;
    if (selectedStudent?._id === studentIdParam) return;
    const match = students.find((s) => s._id === studentIdParam);
    if (match) setSelectedStudent(match);
  }, [studentIdParam, students, selectedStudent]);

  const loadReports = useCallback(async () => {
    if (!selectedStudent) return;
    try {
      setLoading(true);
      const [topicsRes, exercisesRes, practicalRes, tasksRes, progressRes, activityRes] =
        await Promise.all([
          reportApi.getTopicDetails(selectedStudent._id, courseId),
          reportApi.getExerciseReport(selectedStudent._id, courseId),
          reportApi.getPracticalReport(selectedStudent._id, courseId),
          reportApi.getTaskReport(selectedStudent._id, courseId),
          reportApi.getProgressReport(selectedStudent._id, courseId),
          reportApi.getActivitySummary(selectedStudent._id),
        ]);
      setReportData({
        topics: topicsRes.data?.data?.topics || [],
        exercises: exercisesRes.data?.data?.exercises || [],
        practical: practicalRes.data?.data?.practicals || [],
        tasks: tasksRes.data?.data?.tasks || [],
      });
      setProgress(progressRes.data?.data || null);
      setActivitySummary(activityRes.data?.data || null);
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
    <div className="relative min-h-screen p-6 md:p-8 space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          {activeTab !== "overview" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("overview")}
              className="p-2.5 rounded-xl bg-orange-600 text-white shadow-sm hover:bg-orange-700 transition-all"
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

        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-orange-600" />
          <span>Real-time Analytics Active</span>
        </div>
      </div>

      {/* Student Picker */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {!selectedStudent && matchingStudents.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
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
          className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.course_name}</option>
          ))}
        </select>
      </div>

      {/* Login Time / Last Activity / Activity History */}
      {selectedStudent && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <LogIn className="w-3.5 h-3.5 text-orange-500" />
              Login Time:{" "}
              {activitySummary?.last_login
                ? new Date(activitySummary.last_login).toLocaleString()
                : "—"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Last Activity:{" "}
              {activitySummary?.last_activity
                ? new Date(activitySummary.last_activity).toLocaleString()
                : "—"}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              router.push(`/institute-dashboard/student-statistics/${selectedStudent._id}/activity-history`)
            }
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-800 transition-all"
          >
            <History className="w-3.5 h-3.5" /> View Activity History
          </motion.button>
        </div>
      )}

      {!selectedStudent ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-400 text-sm font-semibold">Search and select a student above to load their reports.</p>
        </div>
      ) : loading ? (
        <div className="py-20 flex items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
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
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(key)}
                  className={`relative bg-white p-6 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md group overflow-hidden ${
                    activeTab === key
                      ? `ring-2 border-orange-500 bg-orange-50/20`
                      : `border-slate-200 hover:border-slate-300`
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{meta.label}</p>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">{count}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 mt-3 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                        <Sparkles className="w-3 h-3 text-orange-500" /> Inspect records →
                      </span>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
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
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8"
              >
                <div className="space-y-3 relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-xl">
                    <Layers className="w-4 h-4" /> {selectedStudent.full_name}
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    Overall completion:{" "}
                    <span className="text-orange-600">
                      {progress?.overall_completion_percentage ?? 0}%
                    </span>
                  </h2>
                  {progress?.breakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {Object.entries(progress.breakdown).map(([key, b]) => (
                        <div
                          key={key}
                          className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200/60 shadow-sm"
                        >
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{key}</p>
                          <p className="text-lg font-black text-slate-900">{b.completion_percentage}%</p>
                          <p className="text-[10px] text-slate-500">{b.completed}/{b.total} completed</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab("topics")}
                  className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-sm shrink-0"
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
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
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
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
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

export default function StudentStatisticsPage() {
  return (
    <Suspense fallback={null}>
      <StudentStatisticsPageContent />
    </Suspense>
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
          <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
            {columns.map((col) => (
              <th key={col.key} className="py-4 px-6">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm font-medium">
          {rows.length > 0 ? (
            rows.map((row, i) => (
              <tr key={row._id || row.topic_id || row.module_id || row.practical_id || row.task_id || i} className="hover:bg-slate-50/65 transition-colors">
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