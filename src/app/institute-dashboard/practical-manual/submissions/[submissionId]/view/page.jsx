"use client";

import React, { useEffect, useState, Suspense } from "react";
import { ArrowLeft, Loader2, FileText, ExternalLink, CheckCircle2, User, BookOpen } from "lucide-react";
import {
  practicalManualDetail,
  getPracticalSubmissions,
} from "@/services/practical-Manual/page.jsx";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

function StudentAnswerSheetViewPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const submissionId = params.submissionId;
  const manualId = searchParams.get("manualId");

  const [loading, setLoading] = useState(true);
  const [manual, setManual] = useState(null);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    if (!manualId || !submissionId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);

        const [manualRes, subRes] = await Promise.all([
          practicalManualDetail(manualId),
          getPracticalSubmissions(manualId),
        ]);

        const manualData = manualRes?.data?.data || manualRes?.data;
        setManual(manualData);

        const subData = subRes?.data?.data || subRes?.data;
        const allSubmissions = subData?.submissions || [];

        const found = allSubmissions.find(
          (item) => item._id === submissionId
        );

        setSubmission(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [manualId, submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const questions = manual?.questions || [];
  const answerByQuestionId = {};
  const answerByIndex = {};

  (submission?.answers || []).forEach((a, index) => {
    if (a.question_id) {
      answerByQuestionId[a.question_id] = a;
    }
    answerByIndex[index] = a;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-12 w-full space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-xs transition-all bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200/80 hover:border-orange-200 hover:shadow"
        >
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
          Back to Submissions List
        </button>
      </div>

      {/* Header Info Card */}
      <div className="bg-gradient-to-br from-white via-white to-orange-50/30 rounded-3xl p-6 md:p-8 border border-orange-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 text-orange-700">
              <CheckCircle2 size={13} /> Student Answer Sheet
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {submission?.student_id?.full_name || "Student Name Unavailable"}
            </h1>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-400 block">Submission ID</span>
            <span className="text-xs font-mono text-slate-600">{submissionId?.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <User size={14} className="text-slate-400" />
            <span>Enrollment No:</span> 
            <span className="text-slate-900 font-bold">{submission?.student_id?.enrollment_no || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <BookOpen size={14} className="text-slate-400" />
            <span>Manual:</span> 
            <span className="text-slate-900 font-bold truncate max-w-[300px]">{manual?.title || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Questions & Answers Section */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm">
            No questions configured for this manual.
          </div>
        ) : (
          questions.map((q, idx) => {
            const answer = answerByQuestionId[q._id] || answerByIndex[idx];
            const hasAnswered = Boolean(answer?.answer_file_url || answer?.answer_html);

            return (
              <div 
                key={q._id || idx} 
                className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      Question {idx + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${hasAnswered ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    {hasAnswered ? "Answered" : "Unanswered"}
                  </span>
                </div>

                {/* Student Answer Box */}
                <div className="bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-slate-100 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Student Submission
                  </p>
                  
                  {q.solution_type === "file" ||
                  (q.solution_type === "both" && answer?.answer_file_url) ? (
                    answer?.answer_file_url ? (
                      <a
                        href={answer.answer_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700 bg-white px-4 py-2.5 rounded-xl border border-orange-200/80 shadow-sm hover:shadow transition-all"
                      >
                        <FileText size={15} /> 
                        <span>View uploaded file</span> 
                        <ExternalLink size={13} className="text-orange-400" />
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No file uploaded for this question.</p>
                    )
                  ) : (
                    <div
                      className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-100"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(
                          answer?.answer_html || "<em class='text-slate-400'>No answer given.</em>"
                        ),
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function StudentAnswerSheetViewPage() {
  return (
    <Suspense fallback={null}>
      <StudentAnswerSheetViewPageContent />
    </Suspense>
  );
}