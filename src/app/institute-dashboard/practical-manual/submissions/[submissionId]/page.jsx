"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  FileText,
  ExternalLink,
  Eye,
} from "lucide-react";
import StatusModal from "@/components/molecules/StatusModal";
import {
  practicalManualDetail,
  getPracticalSubmissions,
  gradePracticalSubmission,
} from "@/services/practical-Manual/page.jsx";

export default function PracticalSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.submissionId; // This is the practical manual ID based on your route

  const [manual, setManual] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [manualRes, subRes] = await Promise.all([
          practicalManualDetail(id),
          getPracticalSubmissions(id),
        ]);

        const manualData = manualRes?.data || manualRes;
        setManual(manualData?.data || manualData);

        const subData = subRes?.data?.data || subRes?.data;
        setSubmissions(subData?.submissions || []);
      } catch (error) {
        console.error("Failed to fetch submissions data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleGradeSubmission = async (submissionId, marks, feedback) => {
    try {
      await gradePracticalSubmission(id, submissionId, {
        marks: marks === "" ? undefined : Number(marks),
        feedback,
      });
      const response = await getPracticalSubmissions(id);
      const data = response?.data?.data || response?.data;
      setSubmissions(data?.submissions || []);
      return true;
    } catch (error) {
      console.error("Grade Practical Submission Error:", error);
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

  const isFileSolution =
    manual?.submission_type === "file" ||
    !manual?.questions ||
    manual?.questions.length === 0;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 w-full space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to Manuals
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-100/80 p-6 md:p-10 space-y-6">
        <div className="border-b border-orange-50 pb-6 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200/50 shadow-sm">
            Student Submissions
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            {manual?.title}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {submissions.length} student submission
            {submissions.length === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-slate-100">
              No submissions yet.
            </div>
          ) : (
            submissions.map((sub) => (
              <PracticalSubmissionRow
                key={sub._id}
                manualId={id}
                submission={sub}
                isFileSolution={isFileSolution}
                onGrade={(marks, feedback) =>
                  handleGradeSubmission(sub._id, marks, feedback)
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_LABELS = {
  draft: "Open Solution",
  submitted: "Submitted",
  reviewed: "Reviewed",
};

function PracticalSubmissionRow({
  manualId,
  submission,
  isFileSolution,
  onGrade,
}) {
  const router = useRouter();
  const [marks, setMarks] = useState(submission.marks ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);

  const [modalState, setModalState] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleSaveClick = async () => {
    setSaving(true);
    try {
      await onGrade(marks, feedback);
      setModalState({
        open: true,
        type: "success",
        title: "Grade Saved!",
        message:
          "The student's grade and feedback have been successfully updated.",
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

const handleViewAnswerSheet = () => {
router.push(
  `/institute-dashboard/practical-manual/submissions/${submission._id}/view?manualId=${manualId}`
);
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
              <span className="font-semibold text-slate-500 uppercase">
                {STATUS_LABELS[submission.status] || submission.status}
              </span>
            </p>
          </div>

          {isFileSolution ? (
            submission.attachment_url && (
              <a
                href={submission.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline shrink-0 self-start sm:self-auto bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100"
              >
                <FileText size={13} /> Open Submitted PDF{" "}
                <ExternalLink size={12} />
              </a>
            )
          ) : (
            <button
              type="button"
              onClick={handleViewAnswerSheet}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:bg-orange-100 shrink-0 self-start sm:self-auto bg-orange-50 px-3 py-2 rounded-xl border border-orange-100 transition-all shadow-sm"
            >
              <Eye size={14} /> View Answer Sheet
            </button>
          )}
        </div>

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