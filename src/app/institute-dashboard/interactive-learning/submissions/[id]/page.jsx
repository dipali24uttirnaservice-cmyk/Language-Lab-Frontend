"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  UserCheck,
  UserX,
  Building2,
  GraduationCap,
  Bell,
  Mic,
  Volume2,
  Award,
  Zap,
} from "lucide-react";
import StatusModal from "@/app/components/molecules/StatusModal";
import { interactiveLearningApi } from "@/services/interactiveLearning/interactiveLearningApi";

export default function InteractiveTaskSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [unsubmitted, setUnsubmitted] = useState([]);
  const [activeTab, setActiveTab] = useState("submitted"); // "submitted" | "unsubmitted"
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationModal, setNotificationModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [taskRes, subRes] = await Promise.all([
          interactiveLearningApi.getTaskById(id),
          interactiveLearningApi.getSubmissions(id),
        ]);

        const taskData = taskRes?.data?.data || taskRes?.data || taskRes;
        setTask(taskData);

        const subData = subRes?.data?.data || subRes?.data;
        setSubmissions(subData?.submissions || []);
        setUnsubmitted(subData?.unsubmitted || []);
      } catch (error) {
        console.error("Failed to fetch interactive task submissions data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSendNotification = async () => {
    if (unsubmitted.length === 0) return;
    try {
      setSendingNotification(true);
      const res = await interactiveLearningApi.notifyUnsubmitted(id);
      const data = res?.data || res;
      setNotificationModal({
        open: true,
        type: "success",
        title: "Reminder Sent!",
        message:
          data?.message ||
          `Notification sent successfully to ${unsubmitted.length} unsubmitted student(s).`,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
      setNotificationModal({
        open: true,
        type: "error",
        title: "Send Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to send reminder notification. Please try again.",
      });
    } finally {
      setSendingNotification(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return submissions;
    const q = searchQuery.toLowerCase();
    return submissions.filter((sub) => {
      const name =
        sub.student_id?.full_name?.toLowerCase() ||
        sub.student_id?.name?.toLowerCase() ||
        "";
      const enroll = sub.student_id?.enrollment_no?.toLowerCase() || "";
      const roll = sub.student_id?.roll_no?.toLowerCase() || "";
      return name.includes(q) || enroll.includes(q) || roll.includes(q);
    });
  }, [submissions, searchQuery]);

  const filteredUnsubmitted = useMemo(() => {
    if (!searchQuery.trim()) return unsubmitted;
    const q = searchQuery.toLowerCase();
    return unsubmitted.filter((s) => {
      const name = s.full_name?.toLowerCase() || "";
      const enroll = s.enrollment_no?.toLowerCase() || "";
      const roll = s.roll_no?.toLowerCase() || "";
      const seg = s.segment?.toLowerCase() || "";
      return name.includes(q) || enroll.includes(q) || roll.includes(q) || seg.includes(q);
    });
  }, [unsubmitted, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const totalAssigned = submissions.length + unsubmitted.length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 w-full space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/institute-dashboard/interactive-learning")}
          className="group inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 cursor-pointer"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Speech Tasks
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-100/80 p-6 md:p-10 space-y-6">
        {/* Header */}
        <div className="border-b border-orange-50 pb-6 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200/50 shadow-sm flex items-center gap-1.5">
              <Mic size={12} />
              Interactive Speech Submissions
            </span>
            {task?.min_accuracy && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                Min Accuracy: {task.min_accuracy}%
              </span>
            )}
            {task?.target_wpm && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
                Target: {task.target_wpm} WPM
              </span>
            )}
            {task?.max_retries && (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/50">
                Max Retries: {task.max_retries}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {task?.title}
          </h1>

          {task?.paragraph && (
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-relaxed line-clamp-2">
              &quot;{task.paragraph}&quot;
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium pt-1">
            <span>
              Total Assigned: <strong className="text-slate-800">{totalAssigned}</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">
              Submitted: {submissions.length}
            </span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">
              Pending: {unsubmitted.length}
            </span>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("submitted")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "submitted"
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-100"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 size={15} className={activeTab === "submitted" ? "text-emerald-600" : "text-slate-400"} />
              Submitted Students
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "submitted" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                }`}
              >
                {submissions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("unsubmitted")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "unsubmitted"
                  ? "bg-white text-amber-700 shadow-sm border border-amber-100"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock size={15} className={activeTab === "unsubmitted" ? "text-amber-600" : "text-slate-400"} />
              Unsubmitted Students
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === "unsubmitted" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"
                }`}
              >
                {unsubmitted.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "submitted"
                  ? "Search submitted students..."
                  : "Search unsubmitted students..."
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Content Area */}
        {activeTab === "submitted" ? (
          /* ================= SUBMITTED STUDENTS LIST ================= */
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-100">
                {submissions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <UserX className="w-8 h-8 text-slate-300" />
                    <p className="text-slate-600 font-semibold">No speech submissions yet.</p>
                    <p className="text-xs text-slate-400">
                      Students who record and turn in their speech practice will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-300" />
                    <p className="text-slate-600 font-semibold">No submitted students matched your search.</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3.5 px-4 pl-6">Student</th>
                      <th className="py-3.5 px-4 text-center">Accuracy</th>
                      <th className="py-3.5 px-4 text-center">Reading WPM</th>
                      <th className="py-3.5 px-4 text-center">Attempts Used</th>
                      <th className="py-3.5 px-4">Voice Playback</th>
                      <th className="py-3.5 px-4 pr-6 text-right">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredSubmissions.map((sub, idx) => {
                      const studentName =
                        sub.student_id?.full_name ||
                        sub.student_id?.name ||
                        "Student";
                      const studentIdDisplay =
                        sub.student_id?.enrollment_no ||
                        sub.student_id?.roll_no ||
                        "";
                      const accuracy = sub.accuracy_score || 0;
                      const isPassing = accuracy >= (task?.min_accuracy || 75);

                      return (
                        <tr key={sub._id || idx} className="hover:bg-slate-50/80 transition-colors">
                          {/* Student Name & Roll */}
                          <td className="py-3.5 px-4 pl-6 font-bold text-slate-800">
                            {studentName}
                            {studentIdDisplay && (
                              <span className="block text-xs text-slate-400 font-normal">
                                {studentIdDisplay}
                              </span>
                            )}
                          </td>

                          {/* Accuracy Score */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full font-extrabold text-xs ${
                                isPassing
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                                  : "bg-rose-100 text-rose-800 border border-rose-200/60"
                              }`}
                            >
                              {accuracy}%
                            </span>
                          </td>

                          {/* WPM */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                            {sub.wpm || sub.reading_speed || "--"} WPM
                          </td>

                          {/* Attempts */}
                          <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-600">
                            {sub.attempts_count || 1} / {task?.max_retries || 3}
                          </td>

                          {/* Audio Player */}
                          <td className="py-3.5 px-4">
                            {sub.audio_url ? (
                              <audio
                                controls
                                src={sub.audio_url}
                                className="h-8 w-48"
                              />
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                No audio recorded
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 pr-6 text-right text-xs text-slate-400 font-medium">
                            {sub.createdAt
                              ? new Date(sub.createdAt).toLocaleDateString()
                              : "--"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* ================= UNSUBMITTED STUDENTS LIST ================= */
          <div className="space-y-4">
            {/* Action Bar for Unsubmitted View */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50/80 to-orange-50/50 p-4 rounded-2xl border border-amber-200/70 shadow-sm">
              <div className="flex items-center gap-2.5 text-xs text-amber-950 font-medium">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {unsubmitted.length} pending student{unsubmitted.length === 1 ? "" : "s"}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    These students have not recorded their speech practice yet.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendNotification}
                disabled={sendingNotification || unsubmitted.length === 0}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                {sendingNotification ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                <span>Send Notification ({unsubmitted.length})</span>
              </button>
            </div>

            {filteredUnsubmitted.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-100">
                {unsubmitted.length === 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <UserCheck className="w-10 h-10 text-emerald-500" />
                    <p className="text-emerald-700 font-bold text-base">Great job!</p>
                    <p className="text-xs text-slate-500">
                      All assigned students have completed this speech task.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-300" />
                    <p className="text-slate-600 font-semibold">No unsubmitted students matched your search.</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredUnsubmitted.map((student, idx) => (
                <div
                  key={student._id || idx}
                  className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 hover:border-amber-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-bold text-sm flex items-center justify-center shrink-0 border border-amber-200/60">
                      {student.full_name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {student.full_name || "Unknown Student"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                        {student.enrollment_no && (
                          <span className="font-medium text-slate-600">
                            Enrollment: {student.enrollment_no}
                          </span>
                        )}
                        {student.roll_no && (
                          <span>· Roll: {student.roll_no}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:self-center">
                    {student.segment && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        <Building2 size={12} />
                        {student.segment}
                      </span>
                    )}
                    {student.year && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        <GraduationCap size={12} />
                        Year {student.year}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/80">
                      <Clock size={12} className="text-amber-600" />
                      Pending Speech Practice
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Notification Status Modal */}
      <StatusModal
        open={notificationModal.open}
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
        onClose={() => setNotificationModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
