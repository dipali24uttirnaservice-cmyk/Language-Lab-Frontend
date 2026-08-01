"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import StatusModal from "@/components/molecules/StatusModal";
import { taskApi } from "@/services/task/taskApi";

export default function StudentTaskSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.taskId || params?.id;

  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [taskRes, subRes] = await Promise.all([
          taskApi.getTaskById(id),
          taskApi.getSubmissions(id)
        ]);

        const taskData = taskRes?.data || taskRes;
        setTask(taskData?.data || taskData);

        const subData = subRes?.data?.data || subRes?.data;
        setSubmissions(subData?.submissions || []);
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
        marks: marks === "" ? undefined : Number(marks),
        feedback,
      });
      const response = await taskApi.getSubmissions(id);
      const data = response?.data?.data || response?.data;
      setSubmissions(data?.submissions || []);
      return true;
    } catch (error) {
      console.error("Grade Task Submission Error:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

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
        <div className="border-b border-orange-50 pb-6 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200/50 shadow-sm">
            Student Submissions
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            {task?.title}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {submissions.length} student submission{submissions.length === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-100">
              No submissions yet.
            </div>
          ) : (
            submissions.map((sub) => (
              <TaskSubmissionRow
                key={sub._id}
                submission={sub}
                questions={task?.questions || []}
                onGrade={(marks, feedback) => handleGradeSubmission(sub._id, marks, feedback)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TaskSubmissionRow({ submission, questions, onGrade }) {
  const [marks, setMarks] = useState(submission.grade ?? submission.marks ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

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
            onClick={() => setExpanded((prev) => !prev)}
            className="text-xs font-bold text-orange-600 hover:underline shrink-0 self-start sm:self-auto bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100"
          >
            {expanded ? "Hide answers" : "View answers"}
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