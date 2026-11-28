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
  Mail,
  AlertCircle,
  Bell,
} from "lucide-react";
import StatusModal from "@/app/components/molecules/StatusModal";
import { taskApi } from "@/services/task/taskApi";

export default function StudentTaskSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.taskId || params?.id;

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
          taskApi.getTaskById(id),
          taskApi.getSubmissions(id),
        ]);

        const taskData = taskRes?.data || taskRes;
        setTask(taskData?.data || taskData);

        const subData = subRes?.data?.data || subRes?.data;
        setSubmissions(subData?.submissions || []);
        setUnsubmitted(subData?.unsubmitted || []);
      } catch (error) {
        console.error("Failed to fetch task submissions data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleGradeSubmission = async (submissionId, marks, feedback) => {
    try {
      await taskApi.gradeSubmission(id, submissionId, {
        grade: marks === "" ? undefined : Number(marks),
        feedback,
        status: "reviewed",
      });
      const response = await taskApi.getSubmissions(id);
      const data = response?.data?.data || response?.data;
      setSubmissions(data?.submissions || []);
      setUnsubmitted(data?.unsubmitted || []);
      return true;
    } catch (error) {
      console.error("Grade Task Submission Error:", error);
      throw error;
    }
  };

  const handleSendNotification = async () => {
    if (unsubmitted.length === 0) return;
    try {
      setSendingNotification(true);
      const res = await taskApi.notifyUnsubmitted(id);
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
      const name = sub.student_id?.full_name?.toLowerCase() || "";
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
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Tasks
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-100/80 p-6 md:p-10 space-y-6">
        {/* Header */}
        <div className="border-b border-orange-50 pb-6 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200/50 shadow-sm">
              Task Submissions & Tracking
            </span>
            {task?.status && (
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  task.status === "published"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {task.status}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {task?.title}
          </h1>

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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
                    <p className="text-slate-600 font-semibold">No submissions yet.</p>
                    <p className="text-xs text-slate-400">
                      Students who turn in this task will appear here for grading.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-300" />
                    <p className="text-slate-600 font-semibold">No submitted students matched your search.</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-orange-600 font-bold hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredSubmissions.map((sub) => (
                <TaskSubmissionRow
                  key={sub._id}
                  taskId={id}
                  submission={sub}
                  questions={task?.questions || []}
                  onGrade={(marks, feedback) =>
                    handleGradeSubmission(sub._id, marks, feedback)
                  }
                />
              ))
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
                    These students have not turned in their task yet.
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
                      All assigned students have submitted this task.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-300" />
                    <p className="text-slate-600 font-semibold">No unsubmitted students matched your search.</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-orange-600 font-bold hover:underline"
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
                      Pending Submission
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

function TaskSubmissionRow({ taskId, submission, questions, onGrade }) {
  const [marks, setMarks] = useState(submission.grade ?? submission.marks ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  // Modal State Management
  const [modalState, setModalState] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // Map answers by question_index correctly matching the data payload structure
  const answerByIndex = {};
  (submission.answers || []).forEach((a) => {
    if (a.question_index !== undefined) {
      answerByIndex[a.question_index] = a.given_answer;
    }
  });

  const handleSaveClick = async () => {
    setSaving(true);
    try {
      await onGrade(marks, feedback);
      setModalState({
        open: true,
        type: "success",
        title: "Grade Saved!",
        message: "The student's grade and feedback have been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to save grade:", error);
      setModalState({
        open: true,
        type: "error",
        title: "Oops...",
        message: "Failed to save the grade. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-slate-50/80 to-white rounded-2xl p-5 border border-orange-100/60 space-y-4 shadow-sm hover:border-orange-200 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {submission.student_id?.full_name || "Unknown student"}
            </p>
            <p className="text-xs text-slate-400">
              {submission.student_id?.enrollment_no} ·{" "}
              <span className="font-semibold text-slate-500 uppercase">{submission.status}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              router.push(
                `/institute-dashboard/student-task/submissions/${taskId}/view?submissionId=${submission._id}`
              )
            }
            className="text-xs font-bold text-orange-600 hover:underline shrink-0 self-start sm:self-auto bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100"
          >
            View answers
          </button>
        </div>

        {expanded && (
          <div className="space-y-2 pt-1">
            {questions.map((q, idx) => {
              const givenAnswer = answerByIndex[idx];

              return (
                <div key={q._id || idx} className="bg-white rounded-xl p-4 border border-slate-100 shadow-inner">
                  <p className="text-xs font-bold text-slate-800 mb-1.5">
                    {idx + 1}. {q.question_text}
                  </p>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {givenAnswer ? (
                      <span className="font-medium text-slate-700">{givenAnswer}</span>
                    ) : (
                      <em className="text-slate-400">No answer given.</em>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <input
            type="number"
            placeholder="Marks"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-full sm:w-28 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
          />
          <input
            type="text"
            placeholder="Feedback comments..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
          />
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveClick}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-orange-600/20 transition-all"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving..." : "Save Grade"}
          </button>
        </div>
      </div>

      {/* Reusable Status Modal */}
      <StatusModal
        open={modalState.open}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={() => setModalState((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}