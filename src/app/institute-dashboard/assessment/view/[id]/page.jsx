"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Hash,
  Loader2,
  RotateCcw,
  Shuffle,
  Target,
} from "lucide-react";

import { assessmentApi } from "@/services/assessment/assessmentApi";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export default function AssessmentViewPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH ASSESSMENT
  // =====================================================

  useEffect(() => {
    if (!id) return;

    const fetchAssessment = async () => {
      try {
        setLoading(true);

        const response =
          await assessmentApi.getAssessment(id);

        console.log(
          "Assessment Detail Response:",
          response
        );

        const responseData = response?.data;

        const data =
          responseData?.data ??
          responseData;

        setAssessment(data || null);
      } catch (error) {
        console.error(
          "Failed to fetch assessment:",
          error
        );

        setAssessment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  // =====================================================
  // NORMALIZED DATA
  // =====================================================

  const subjectName = useMemo(() => {
    if (!assessment?.subject_id) return "-";

    if (
      typeof assessment.subject_id === "object"
    ) {
      return (
        assessment.subject_id?.title ||
        assessment.subject_id?.name ||
        assessment.subject_id?.subject_name ||
        "-"
      );
    }

    return assessment.subject_id;
  }, [assessment]);

  const visibility = Number(
    assessment?.userType
  ) === 1;

  const questions = Array.isArray(
    assessment?.questions
  )
    ? assessment.questions
    : [];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />

          <p className="text-sm text-slate-400 mt-3">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/institute-dashboard/assessment"
            )
          }
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft size={16} />
          Back to Assessments
        </button>

        <div className="mt-6 bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 flex items-center justify-center">
            <FileText className="w-7 h-7 text-orange-500" />
          </div>

          <h2 className="mt-4 text-lg font-black text-slate-800">
            Assessment Not Found
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            The requested assessment could not be found.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6 w-full">

      {/* ================================================= */}
      {/* TOP BAR */}
      {/* ================================================= */}

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/institute-dashboard/assessment"
            )
          }
          className="group inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm transition-all bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />

          Back to Assessments
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/institute-dashboard/assessment/${id}`
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-sm transition-colors"
        >
          Edit Assessment
        </button>
      </div>

      {/* ================================================= */}
      {/* MAIN CARD */}
      {/* ================================================= */}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-100/80 p-6 md:p-10 space-y-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="border-b border-orange-50 pb-7">

          <div className="flex flex-wrap items-center gap-2">

            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              <FileText className="w-3.5 h-3.5" />
              Assessment
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full uppercase border ${
                visibility
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {visibility ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  Show
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Hidden
                </>
              )}
            </span>

            {assessment.difficulty && (
              <span
                className={`px-3 py-1.5 text-[11px] font-bold rounded-full uppercase border ${
                  assessment.difficulty === "easy"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : assessment.difficulty ===
                      "medium"
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {assessment.difficulty}
              </span>
            )}

          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-4">
            {assessment.title}
          </h1>

          {assessment.description && (
            <p className="text-sm text-slate-500 mt-2 max-w-4xl leading-relaxed">
              {assessment.description}
            </p>
          )}

        </div>

        {/* ================================================= */}
        {/* META INFORMATION */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <InfoCard
            icon={<Target className="w-4 h-4" />}
            label="Subject"
            value={subjectName}
          />

          <InfoCard
            icon={<Hash className="w-4 h-4" />}
            label="Questions"
            value={questions.length}
          />

          <InfoCard
            icon={<Award className="w-4 h-4" />}
            label="Total Marks"
            value={assessment.total_marks ?? 0}
          />

          <InfoCard
            icon={<RotateCcw className="w-4 h-4" />}
            label="Max Attempts"
            value={assessment.max_attempts ?? 5}
          />

        </div>

        {/* ================================================= */}
        {/* SECONDARY INFORMATION */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <SmallInfo
            label="Order"
            value={assessment.order ?? 0}
          />

          <SmallInfo
            label="Time Limit"
            value={
              assessment.time_limit_sec !==
                undefined &&
              assessment.time_limit_sec !==
                null &&
              assessment.time_limit_sec !== ""
                ? `${assessment.time_limit_sec} seconds`
                : "No limit"
            }
            icon={
              <Clock3 className="w-3.5 h-3.5" />
            }
          />

          <SmallInfo
            label="Created"
            value={
              assessment.createdAt
                ? new Date(
                    assessment.createdAt
                  ).toLocaleDateString()
                : "-"
            }
            icon={
              <Calendar className="w-3.5 h-3.5" />
            }
          />

          <SmallInfo
            label="Module Type"
            value={
              assessment.module_type ||
              "assessment"
            }
          />

        </div>

        {/* ================================================= */}
        {/* SETTINGS */}
        {/* ================================================= */}

        <div className="border-t border-slate-100 pt-6">

          <h3 className="text-base font-black text-slate-900 mb-4">
            Assessment Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <SettingItem
              label="Shuffle Questions"
              enabled={
                assessment.shuffle_questions
              }
              icon={
                <Shuffle className="w-4 h-4" />
              }
            />

            <SettingItem
              label="Shuffle Options"
              enabled={
                assessment.shuffle_options
              }
              icon={
                <Shuffle className="w-4 h-4" />
              }
            />

            <SettingItem
              label="Show Explanation"
              enabled={
                assessment.show_explanation
              }
              icon={
                <CheckCircle2 className="w-4 h-4" />
              }
            />

          </div>
        </div>

        {/* ================================================= */}
        {/* QUESTIONS */}
        {/* ================================================= */}

        <div className="border-t border-slate-100 pt-7">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Questions
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Multiple choice questions in this
                assessment.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              {questions.length}{" "}
              {questions.length === 1
                ? "Question"
                : "Questions"}
            </span>

          </div>

          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-semibold text-slate-400">
                No questions available.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {questions.map(
                (question, index) => (
                  <QuestionCard
                    key={index}
                    question={question}
                    index={index}
                  />
                )
              )}

            </div>
          )}

        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="text-xs text-slate-400">
            {assessment.updatedAt
              ? `Last updated ${new Date(
                  assessment.updatedAt
                ).toLocaleString()}`
              : ""}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/institute-dashboard/assessment"
              )
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-orange-300 text-orange-600 bg-white font-bold text-sm hover:bg-orange-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assessment List
          </button>

        </div>

      </div>
    </div>
  );
}

// =====================================================
// QUESTION CARD
// =====================================================

function QuestionCard({
  question,
  index,
}) {
  const options = [
    {
      key: "optionA",
      label: "A",
      value: question?.optionA,
    },
    {
      key: "optionB",
      label: "B",
      value: question?.optionB,
    },
    {
      key: "optionC",
      label: "C",
      value: question?.optionC,
    },
    {
      key: "optionD",
      label: "D",
      value: question?.optionD,
    },
  ].filter(
    (option) =>
      option.value &&
      String(option.value).trim()
  );

  return (
    <div className="border border-orange-100/70 rounded-2xl p-5 md:p-6 bg-gradient-to-br from-slate-50/80 to-white shadow-sm">

      {/* QUESTION HEADER */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-start gap-3">

          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black">
            {index + 1}
          </span>

          <div>
            <p className="font-bold text-slate-900 text-sm md:text-base leading-relaxed">
              {question?.question_text ||
                "-"}
            </p>
          </div>

        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/50 shrink-0">
          <Award className="w-3.5 h-3.5" />

          {question?.marks ?? 1}

          {Number(question?.marks) ===
          1
            ? " Mark"
            : " Marks"}
        </span>

      </div>

      {/* OPTIONS */}

      {options.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">

          {options.map((option) => {

            const isCorrect =
              String(
                question?.correct_answer ?? ""
              ).trim() ===
              String(
                option.value ?? ""
              ).trim();

            return (
              <div
                key={option.key}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-slate-200"
                }`}
              >

                <div className="flex items-center gap-3 min-w-0">

                  <span
                    className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-black ${
                      isCorrect
                        ? "bg-green-200 text-green-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {option.label}
                  </span>

                  <span
                    className={`text-sm font-medium break-words ${
                      isCorrect
                        ? "text-green-800"
                        : "text-slate-700"
                    }`}
                  >
                    {option.value}
                  </span>

                </div>

                {isCorrect && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Correct
                  </span>
                )}

              </div>
            );
          })}

        </div>
      )}

      {/* CORRECT ANSWER */}

      {!options.length &&
        question?.correct_answer && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">

            <CheckCircle2 className="w-4 h-4 text-green-600" />

            <span className="text-xs font-bold text-green-700">
              Correct Answer:
            </span>

            <span className="text-sm font-semibold text-green-800">
              {question.correct_answer}
            </span>

          </div>
        )}

      {/* NEGATIVE MARKS */}

      {Number(
        question?.negative_marks
      ) > 0 && (
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
          Negative Marks:{" "}
          {question.negative_marks}
        </div>
      )}

      {/* EXPLANATION */}

      {question?.explanation && (
        <div className="mt-4">

          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            Explanation
          </p>

          <div
            className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                question.explanation
              ),
            }}
          />

        </div>
      )}

      {/* HINT */}

      {question?.hint && (
        <div className="mt-4">

          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            Hint
          </p>

          <div className="text-sm text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
            {question.hint}
          </div>

        </div>
      )}

    </div>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-orange-50/20 rounded-2xl p-4 border border-orange-100/50 shadow-sm">

      <div className="flex items-center gap-2 text-orange-600">
        {icon}

        <span className="text-[10px] font-extrabold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="font-black text-slate-800 text-sm mt-2 break-words">
        {value ?? "-"}
      </p>

    </div>
  );
}

// =====================================================
// SMALL INFO
// =====================================================

function SmallInfo({
  label,
  value,
  icon,
}) {
  return (
    <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100">

      <div className="flex items-center gap-1.5 text-slate-400">

        {icon}

        <span className="text-[10px] font-extrabold uppercase tracking-wider">
          {label}
        </span>

      </div>

      <p className="text-sm font-bold text-slate-700 mt-1.5">
        {value ?? "-"}
      </p>

    </div>
  );
}

// =====================================================
// SETTING ITEM
// =====================================================

function SettingItem({
  label,
  enabled,
  icon,
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border ${
        enabled
          ? "bg-green-50 border-green-100"
          : "bg-slate-50 border-slate-100"
      }`}
    >

      <div
        className={`flex items-center gap-2 text-sm font-bold ${
          enabled
            ? "text-green-700"
            : "text-slate-500"
        }`}
      >
        {icon}
        {label}
      </div>

      <span
        className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
          enabled
            ? "bg-green-100 text-green-700"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {enabled ? "Enabled" : "Disabled"}
      </span>

    </div>
  );
}