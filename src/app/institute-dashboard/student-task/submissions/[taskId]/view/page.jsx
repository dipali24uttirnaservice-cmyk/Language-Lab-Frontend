"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Mic,
  SpellCheck,
} from "lucide-react";
import { taskApi } from "@/services/task/taskApi";

// Matches Task.questions[].question_type (Task.js model / taskValidation.js /
// the add-question form's Q_TYPES) — picks how each question's options and
// the student's given answer are rendered below.
const TYPE_LABELS = {
  mcq: "MCQ",
  fill_blank: "Fill Blank",
  true_false: "True / False",
  short_answer: "Short Answer",
  match: "Match",
  recorder: "Recorder",
  spell_word: "Spell Word",
};

const normalize = (value) => String(value ?? "").trim().toLowerCase();
const isAnswerCorrect = (given, correct) =>
  given !== undefined && given !== null && given !== "" && normalize(given) === normalize(correct);

// "match" answers (both the stored correct_answer and the student's
// given_answer) are "left:right|left:right" strings — split back into pairs
// for a readable side-by-side view.
const parsePairs = (value) => {
  if (!value) return [];
  return String(value)
    .split("|")
    .map((pair) => {
      const [left, right] = pair.split(":");
      return { left: (left || "").trim(), right: (right || "").trim() };
    })
    .filter((p) => p.left || p.right);
};

function StudentTaskAnswerViewPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const taskId = params?.taskId;
  const submissionId = searchParams.get("submissionId");

  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId || !submissionId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [taskRes, subRes] = await Promise.all([
          taskApi.getTaskById(taskId),
          taskApi.getSubmissions(taskId),
        ]);

        const taskData = taskRes?.data || taskRes;
        setTask(taskData?.data || taskData);

        const subData = subRes?.data?.data || subRes?.data;
        const allSubmissions = subData?.submissions || [];
        
        const foundSubmission = allSubmissions.find(
          (item) => item._id === submissionId
        );
        
        setSubmission(foundSubmission || null);
      } catch (error) {
        console.error("Fetch answer view error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-6 w-full space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-600 hover:text-orange-600 transition-all"
      >
        <ArrowLeft size={16} />
        Back to Submissions
      </button>

      <div className="w-full space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-sm">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                Student Task Submission
              </span>

              <h1 className="mt-3 text-3xl font-black text-slate-900">
                {task?.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {task?.description}
              </p>
            </div>

            <div className="px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-bold flex items-center gap-1 shrink-0">
              <CheckCircle2 size={15} />
              {submission?.status || "Submitted"}
            </div>
          </div>

          {/* Student Info */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <InfoCard
              title="Student Name"
              value={submission?.student_id?.full_name}
            />
            <InfoCard
              title="Enrollment No"
              value={submission?.student_id?.enrollment_no}
            />
            <InfoCard
              title="Course"
              value={task?.course_id?.course_name}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-5">
            Submitted Answers
          </h2>

          <div className="space-y-5">
            {task?.questions?.map((question, index) => {
              const answer = submission?.answers?.find(
                (item) => item.question_index === index
              )?.given_answer;

              const type = question.question_type || "mcq";
              const correct = isAnswerCorrect(answer, question.correct_answer);
              const answered = answer !== undefined && answer !== null && answer !== "";

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-bold text-slate-800 text-sm">
                      {index + 1}. {question.question_text}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-200/70 text-slate-600 uppercase tracking-wide">
                        {TYPE_LABELS[type] || type}
                      </span>
                      {answered && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl ${
                            correct
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {correct ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {correct ? "Correct" : "Incorrect"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* MCQ / Recorder / Spell Word — option chips, the
                      student's pick highlighted orange */}
                  {["mcq", "recorder", "spell_word"].includes(type) &&
                    question.options?.length > 0 && (
                      <div className="space-y-2">
                        {question.options.map((option, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border ${
                              normalize(option) === normalize(answer)
                                ? "bg-orange-100 border-orange-300 text-orange-700 font-bold"
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            {type === "recorder" && (
                              <Mic className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            )}
                            {type === "spell_word" && (
                              <SpellCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            )}
                            {option}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* True / False */}
                  {type === "true_false" && (
                    <div className="grid grid-cols-2 gap-2">
                      {["True", "False"].map((choice) => (
                        <div
                          key={choice}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm border font-bold ${
                            normalize(choice) === normalize(answer)
                              ? "bg-orange-100 border-orange-300 text-orange-700"
                              : "bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          {choice}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Match — student's submitted pairs, wrong side flagged */}
                  {type === "match" && (
                    <div className="space-y-2">
                      {parsePairs(answer).length > 0 ? (
                        parsePairs(answer).map((pair, i) => {
                          const expected = parsePairs(question.correct_answer).find(
                            (p) => normalize(p.left) === normalize(pair.left)
                          );
                          const pairCorrect =
                            expected && normalize(expected.right) === normalize(pair.right);
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm border font-medium ${
                                pairCorrect
                                  ? "bg-green-50 border-green-200 text-green-800"
                                  : "bg-red-50 border-red-200 text-red-700"
                              }`}
                            >
                              <span className="flex-1">{pair.left}</span>
                              <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                              <span className="flex-1 text-right">{pair.right}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-slate-400 italic px-1">
                          No pairs submitted
                        </p>
                      )}
                    </div>
                  )}

                  {/* Match already shows both sides as pairs above — the raw
                      "left:right|left:right" string here would just repeat
                      that, less legibly. */}
                  {type !== "match" && (
                    <>
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Student Answer
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {answered ? answer : "No answer submitted"}
                        </p>
                      </div>

                      {answered && (
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <p className="text-xs font-bold text-slate-400 uppercase">
                            Correct Answer
                          </p>
                          <p className="mt-2 text-sm font-semibold text-green-700">
                            {question.correct_answer || "-"}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentTaskAnswerViewPage() {
  return (
    <Suspense fallback={null}>
      <StudentTaskAnswerViewPageContent />
    </Suspense>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-xs font-bold text-slate-400 uppercase">
        {title}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}