"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Send,
  Loader2,
  Sparkles,
  Play,
  Award,
  FileText,
  RotateCcw,
  UploadCloud,
  ExternalLink,
  X,
} from "lucide-react";

import { studentPracticalApi } from "@/services/practical-Manual/studentPracticalApi";
import RichTextEditor from "@/components/molecules/RichTextEditor";

/* ==========================================================
   WIDE ROW — same list-item language as the Exercise/Text/Audio
   module rows in dashboard/module/[type]/[subtopicId]/page.js.
========================================================== */
function WideRow({
  onClick,
  disabled,
  iconBg,
  icon,
  eyebrow,
  eyebrowClass,
  title,
  middle,
  right,
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`group relative bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex items-center gap-4 ${
        disabled ? "opacity-60" : "cursor-pointer"
      }`}
    >
      <div
        className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md relative overflow-hidden transition-all duration-300 ${iconBg}`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <div className="md:col-span-6 space-y-0.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded border ${eyebrowClass}`}
            >
              {eyebrow}
            </span>
          </div>
          <h3 className="font-extrabold text-sm md:text-base text-slate-900 truncate tracking-tight group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
        </div>

        {middle && (
          <div className="hidden md:block md:col-span-4">{middle}</div>
        )}
        <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
          {right}
        </div>
      </div>
    </div>
  );
}

function PracticalRow({ manual, onSelect, disabled }) {
  const submission = manual.my_submission;
  const status = submission?.status;

  const eyebrow =
    status === "reviewed"
      ? "Reviewed"
      : status === "submitted"
        ? "Submitted"
        : "Open Solution";
  const eyebrowClass =
    status === "reviewed"
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : status === "submitted"
        ? "bg-sky-50 text-sky-600 border-sky-100"
        : "bg-orange-50 text-orange-600 border-orange-100";

  return (
    <WideRow
      onClick={() => onSelect(manual)}
      disabled={disabled}
      iconBg="bg-orange-50 group-hover:bg-orange-500 transition-colors duration-200"
      icon={
        <FileText
          className="text-orange-500 group-hover:text-white transition-all duration-200 group-hover:scale-105"
          size={18}
        />
      }
      eyebrow={eyebrow}
      eyebrowClass={eyebrowClass}
      title={manual.title}
      middle={
        <p className="text-xs text-slate-400 font-medium truncate">
          {manual.questions.length} question
          {manual.questions.length === 1 ? "" : "s"}
          {submission?.submitted_at &&
            ` · Submitted ${new Date(submission.submitted_at).toLocaleDateString()}`}
        </p>
      }
      right={
        <>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <Award size={12} className="text-orange-500" />
            <span>
              {submission?.marks != null
                ? `${submission.marks} Pts`
                : "Ungraded"}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
            {status ? (
              <RotateCcw
                className="group-hover:rotate-45 transition-transform"
                size={12}
              />
            ) : (
              <Play className="fill-current ml-0.5" size={12} />
            )}
          </div>
        </>
      }
    />
  );
}

/* ==========================================================
   PROGRESS BAR
========================================================== */
function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
      />
    </div>
  );
}

/* ==========================================================
   QUESTION DOTS
========================================================== */
function QuestionDots({ total, current, answers }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => {
        const hasAnswered = !!answers[i]?.trim();
        const isCurrent = i === current;

        return (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              isCurrent
                ? "w-6 bg-orange-500"
                : hasAnswered
                  ? "w-2 bg-emerald-400"
                  : "w-2 bg-slate-200"
            }`}
          />
        );
      })}
    </div>
  );
}

/* ==========================================================
   SIDEBAR WORKSPACE
========================================================== */
function Sidebar({ manuals, current, answers, setCurrent, search, setSearch }) {
  const completed = Object.values(answers).filter((val) => val?.trim()).length;
  const progress = manuals.length ? (completed / manuals.length) * 100 : 0;

  const filtered = manuals
    .map((item, originalIndex) => ({ ...item, originalIndex }))
    .filter((q) =>
      q.question_text.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
      {/* HEADER */}
      <div className="p-5 border-b border-slate-100 space-y-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-200">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-900 leading-tight">
              Practical Manual
            </h2>
            <p className="text-[11px] font-semibold text-slate-400">
              {completed}/{manuals.length} completed
            </p>
          </div>
        </div>

        <ProgressBar value={progress} />

        {/* SEARCH */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
            size={15}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
          />
        </div>
      </div>

      {/* QUESTIONS LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-sidebar-scroll">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            No matches found.
          </p>
        ) : (
          filtered.map((item) => {
            const index = item.originalIndex;
            const hasAnswered = !!answers[index]?.trim();
            const isActive = current === index;

            return (
              <motion.button
                key={item._id}
                onClick={() => setCurrent(index)}
                whileHover={{ x: isActive ? 0 : 3 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                  isActive
                    ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-200"
                    : "bg-white hover:bg-orange-50/60 border-slate-100 hover:border-orange-100"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider ${
                      isActive ? "text-orange-100" : "text-orange-500"
                    }`}
                  >
                    Question {String(index + 1).padStart(2, "0")}
                  </span>
                  {hasAnswered && (
                    <div
                      className={`p-1 rounded-full ${
                        isActive ? "bg-white/20" : "bg-slate-100"
                      }`}
                    >
                      <CheckCircle2
                        size={13}
                        className={isActive ? "text-white" : "text-emerald-500"}
                      />
                    </div>
                  )}
                </div>
                <div
                  className={`text-sm truncate font-semibold ${
                    isActive ? "text-white" : "text-slate-700"
                  }`}
                >
                  {item.question_text}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ==========================================================
   MAIN COMPONENT
========================================================== */
export default function StudentPracticalManualPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const containerRef = useRef(null);

  const topicId = routeParams?.topicId || searchParams.get("topicId");
  const courseId = searchParams.get("courseId");
  const courseName = searchParams.get("courseName");
  const topicName = searchParams.get("topicName");

  const [manualsList, setManualsList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [selectedManual, setSelectedManual] = useState(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Solution type is chosen once for the whole practical, not per question.
  const [solutionType, setSolutionType] = useState("text");
  const [solutionFile, setSolutionFile] = useState(null);
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState(null);

  useEffect(() => {
    const params = {};
    if (topicId) params.topicId = topicId;
    if (courseId) params.courseId = courseId;

    studentPracticalApi
      .getMine(params)
      .then((res) => setManualsList(res.data?.data?.practicals || []))
      .catch((error) => console.error("Get Practicals Error:", error))
      .finally(() => setListLoading(false));
  }, [topicId, courseId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const enterFullscreen = async () => {
    if (containerRef.current?.requestFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.log(
          "Auto-fullscreen blocked by browser policy. User interaction required.",
        );
      }
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error("Exit fullscreen failed:", err);
      }
    }
  };

  // Automatically trigger fullscreen on mount / container availability
  useEffect(() => {
    if (!isFullscreen && containerRef.current) {
      enterFullscreen();
    }
  }, [selectedManual]);

  const handleStartManual = useCallback(async (manual) => {
    setDetailLoading(true);
    try {
      const res = await studentPracticalApi.getOneMine(manual._id);
      const detail = res.data?.data;
      const mySubmission = detail?.my_submission;

      // Pre-fill previously saved answers, matched by question_id.
      const answerByQuestionId = {};
      (mySubmission?.answers || []).forEach((a) => {
        answerByQuestionId[a.question_id] = a.answer_html;
      });
      const prefilled = {};
      (detail?.questions || []).forEach((q, idx) => {
        if (answerByQuestionId[q._id])
          prefilled[idx] = answerByQuestionId[q._id];
      });

      setSelectedManual(detail);
      setCurrent(0);
      setAnswers(prefilled);
      setSubmitted(
        mySubmission?.status === "submitted" ||
          mySubmission?.status === "reviewed",
      );
      setSubmitError("");
      setSolutionType(mySubmission?.solution_type || "text");
      setSolutionFile(null);
      setExistingAttachmentUrl(mySubmission?.attachment_url || null);
    } catch (error) {
      console.error("Get Practical Detail Error:", error);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const saveAnswer = (data) => {
    setAnswers((prev) => ({ ...prev, [current]: data }));
  };

  const submitManual = async () => {
    if (!selectedManual) return;
    setSubmitError("");

    if (solutionType === "file" && !solutionFile && !existingAttachmentUrl) {
      setSubmitError("Please upload a PDF solution file before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("solution_type", solutionType);

      if (solutionType === "file") {
        if (solutionFile)
          formData.append("practicalSubmissionAttachment", solutionFile);
      } else {
        const payload = selectedManual.questions.map((q, idx) => ({
          question_id: q._id,
          answer_html: answers[idx] || "",
        }));
        formData.append("answers", JSON.stringify(payload));
      }

      await studentPracticalApi.submit(selectedManual._id, formData);
      setSubmitted(true);
    } catch (error) {
      console.error("Submit Practical Error:", error);
      setSubmitError(
        error?.response?.data?.message || "Failed to submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ==========================================================
     VIEW 1: LIST OF PRACTICAL MANUALS
  ========================================================== */
  if (!selectedManual) {
    return (
      <div
        ref={containerRef}
        className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-amber-50/20 p-6 md:p-8"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-orange-100/60 border border-orange-200/50 text-orange-700 font-bold text-xs flex items-center gap-2">
                <BookOpen size={16} />
                {manualsList.length} Practical Manuals
              </div>
              <button
                onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:scale-105 transition"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
              </button>
            </div>
          </div>

          <h1 className="text-xl font-black text-slate-800">
            {topicName || courseName || "Practical Manuals"}
          </h1>

          {listLoading ? (
            <div className="py-20 flex items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : manualsList.length === 0 ? (
            <div className="py-16 text-center bg-white/60 rounded-3xl border border-dashed border-orange-200">
              <p className="text-slate-400 text-sm font-semibold">
                No practical manuals have been assigned for this course yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {manualsList.map((manual) => (
                <PracticalRow
                  key={manual._id}
                  manual={manual}
                  onSelect={handleStartManual}
                  disabled={detailLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const manuals = selectedManual.questions;
  const currentQuestion = manuals[current];
  const hasFileSolution = !!(solutionFile || existingAttachmentUrl);
  const completedCount =
    solutionType === "file"
      ? hasFileSolution
        ? manuals.length
        : 0
      : Object.values(answers).filter((val) => val?.trim()).length;
  const progressPct = (completedCount / manuals.length) * 100;
  const allAttempted = completedCount === manuals.length;
  // Feeds QuestionDots/Sidebar's per-question "answered" indicator — in file
  // mode there's one solution for the whole practical, not per question.
  const dotsAnswers =
    solutionType === "file"
      ? Object.fromEntries(
          manuals.map((_, idx) => [idx, hasFileSolution ? "1" : ""]),
        )
      : answers;

  /* ==========================================================
     SUBMITTED SUCCESS STATE
  ========================================================== */
  /* ==========================================================
     SUBMITTED SUCCESS / REVIEW STATE (LIST OF QUESTIONS & ANSWERS) - FULL WIDTH
  ========================================================== */
  if (submitted) {
    return (
      <div
        ref={containerRef}
        className="min-h-screen w-full bg-slate-50 p-6 md:p-8 overflow-y-auto custom-main-scroll"
      >
        <div className="w-full space-y-6">
          {/* Top Banner Header */}
          <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-[0_20px_60px_rgba(249,115,22,0.10)] relative overflow-hidden flex items-center justify-between">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-orange-100 opacity-60 blur-2xl pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">
                  Practical Submitted Successfully
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Manual ID:{" "}
                  <span className="font-mono text-slate-600">
                    {selectedManual._id}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedManual(null);
                setSubmitted(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md hover:shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition shrink-0"
            >
              Back to Manuals List
            </button>
          </div>

          {/* List of Attempted Questions and Answers */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider px-1">
              Attempted Questions & Answers ({manuals.length})
            </h2>

            {manuals.map((q, idx) => {
              const studentAnswer =
                answers[idx] ||
                "<p class='text-slate-400 italic'>No answer provided.</p>";
              return (
                <div
                  key={q._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm w-full"
                >
                  {/* Question Info Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">
                        Question {idx + 1}
                      </span>
                      <p className="text-xs font-mono text-slate-400">
                        ID: <span className="text-slate-600">{q._id}</span>
                      </p>
                    </div>
                    {q.marks > 0 && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200/80 rounded-lg px-2.5 py-1 text-xs font-bold shrink-0">
                        {q.marks} Marks
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Question Text
                    </h3>
                    <p className="text-slate-800 font-semibold text-sm leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>

                  {/* Submitted Answer Display */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Your Answer
                    </span>
                    <div
                      className="rounded-xl bg-slate-50 border border-slate-200/60 p-4 text-slate-700 text-sm leading-relaxed prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: studentAnswer }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     VIEW 2: WORKSPACE EDITOR VIEW
  ========================================================== */
  return (
    <div
      ref={containerRef}
      className="flex bg-slate-50 h-screen w-full overflow-hidden"
    >
      <style jsx global>{`
        .custom-sidebar-scroll::-webkit-scrollbar,
        .custom-main-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-track,
        .custom-main-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb,
        .custom-main-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover,
        .custom-main-scroll::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>

      <Sidebar
        manuals={manuals}
        current={current}
        answers={dotsAnswers}
        setCurrent={setCurrent}
        search={search}
        setSearch={setSearch}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-main-scroll">
        {/* TOP BAR */}
        <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm px-8 pt-6 pb-2 flex items-center justify-end shrink-0">
          <button
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:scale-105 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        {/* CONTENT CARD CONTAINER */}
        <div className="px-8 pb-10 pt-4 w-full flex-1">
          <div className="w-full relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-8 shadow-[0_20px_60px_rgba(249,115,22,0.10)] transition-all duration-300">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-orange-100 opacity-50 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-100 opacity-50 blur-2xl pointer-events-none" />

            <div className="relative space-y-6">
              {/* HEADER INFO & PROGRESS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-wide">
                    Question {current + 1} of {manuals.length}
                  </span>
                  <QuestionDots
                    total={manuals.length}
                    current={current}
                    answers={dotsAnswers}
                  />
                </div>
                <ProgressBar value={progressPct} />
              </div>

              {/* SOLUTION TYPE TOGGLE — applies to the whole practical, not per question */}
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200/80 p-1.5 w-fit">
                <button
                  type="button"
                  onClick={() => setSolutionType("text")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    solutionType === "text"
                      ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Paragraph / Text
                </button>
                <button
                  type="button"
                  onClick={() => setSolutionType("file")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    solutionType === "file"
                      ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  File Upload
                </button>
              </div>

              {allAttempted && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm font-semibold"
                >
                  <Sparkles size={16} />
                  All practical questions completed — great job!
                </motion.div>
              )}

              {submitError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-semibold">
                  {submitError}
                </div>
              )}

              {/* CARD MAIN BODY */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold text-slate-800 leading-snug">
                      {currentQuestion.question_text}
                    </h1>
                    {currentQuestion.marks > 0 && (
                      <div className="bg-amber-50 text-amber-700 border border-amber-200/80 rounded-xl px-4 py-2 text-xs font-bold shrink-0">
                        {currentQuestion.marks} Marks
                      </div>
                    )}
                  </div>

                  {solutionType === "text" ? (
                    <>
                      {/* Instruction Box */}
                      <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Suggested Length
                        </h3>
                        <p className="text-slate-700 font-medium text-sm leading-relaxed">
                          Write approximately {currentQuestion.answer_lines}{" "}
                          lines for this solution.
                        </p>
                      </div>

                      {/* RICH TEXT SOLUTION FIELD */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Your Solution
                        </label>
                        <RichTextEditor
                          value={answers[current] || ""}
                          onChange={saveAnswer}
                          placeholder="Type your detailed solution here..."
                          minHeight={250}
                        />
                      </div>
                    </>
                  ) : (
                    /* FILE UPLOAD SOLUTION — one file covers the whole practical */
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Your Solution (PDF)
                      </label>
                      <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-6 text-center space-y-3">
                        {solutionFile ? (
                          <div className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200 text-left">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-5 h-5 text-orange-500 shrink-0" />
                              <span className="text-sm font-semibold text-slate-700 truncate">
                                {solutionFile.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSolutionFile(null)}
                              className="text-slate-400 hover:text-rose-500 shrink-0"
                              title="Remove selected file"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : existingAttachmentUrl ? (
                          <div className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200 text-left">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                              <span className="text-sm font-semibold text-slate-700">
                                A solution PDF is already submitted.
                              </span>
                            </div>
                            <a
                              href={existingAttachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline shrink-0"
                            >
                              Open PDF <ExternalLink size={12} />
                            </a>
                          </div>
                        ) : (
                          <UploadCloud className="w-8 h-8 text-orange-300 mx-auto" />
                        )}

                        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-orange-300 text-orange-600 font-bold text-xs cursor-pointer hover:bg-orange-50 transition-all">
                          <UploadCloud size={14} />
                          {existingAttachmentUrl || solutionFile
                            ? "Replace PDF"
                            : "Choose PDF"}
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) =>
                              setSolutionFile(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Upload a single PDF covering your solution for all
                          questions in this practical (max 10 MB).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* BOTTOM ACTION NAVIGATION */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setCurrent((p) => p - 1)}
                      disabled={current === 0}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all font-medium text-sm"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>

                    <div className="flex items-center gap-3">
                      {current === manuals.length - 1 ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={submitManual}
                          disabled={submitting}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-emerald-200 flex items-center gap-2 disabled:opacity-60"
                        >
                          {submitting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                          {submitting ? "Submitting..." : "Submit Practical"}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrent((p) => p + 1)}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2.5 rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-orange-200 flex items-center gap-1.5"
                        >
                          Next
                          <ChevronRight size={18} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
