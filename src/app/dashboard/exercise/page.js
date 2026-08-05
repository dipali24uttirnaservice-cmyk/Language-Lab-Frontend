"use client";
import { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { moduleApi } from "@/services/topic/topicApi";
import { activityApi } from "@/services/activity/activityApi";
import Swal from "sweetalert2";
import {
  ChevronRight,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Clock,
  HelpCircle,
  Search,
  Target,
  Zap,
  ChevronLeft,
  Lightbulb,
  X,
  Check,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getMatchPairs, hasAnswer, answerToString, shuffledPool } from "@/utils/questionAnswers";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

/* =========================================================================
   SMALL SHARED PIECES
   ========================================================================= */

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading exercises…</p>
      </div>
    </div>
  );
}

function EmptyState({ scopedToLesson = false,  onBack
 }) {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-sm">

            <BackToLessonsButton onBack={onBack} />


        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center">
          <Award className="text-orange-400" size={28} />
        </div>

        <h3 className="text-lg font-bold text-slate-800">
          No exercises found
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          {scopedToLesson
            ? "There is no exercise created for this lesson yet."
            : "There are no exercises available for this topic yet."}
        </p>

      </div>
    </div>
  );
}



/* =========================================================================
   SIDEBAR
   ========================================================================= */

function ExerciseSidebar({ exercises, selectedExercise, onSelect, searchTerm, setSearchTerm, scopedToLesson }) {
  const filtered = exercises.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col h-screen">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-200">
            <Award size={18} />
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-900 leading-tight">
              {scopedToLesson ? "Lesson Exercises" : "Exercises"}
            </h2>
            <p className="text-[11px] font-semibold text-slate-400">
              {exercises.length} total
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No matches found.</p>
        ) : (
          filtered.map((item, idx) => {
            const isActive = selectedExercise?._id === item._id;
            return (
              <motion.button
                key={item._id}
                onClick={() => onSelect(item)}
                whileHover={{ x: isActive ? 0 : 3 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-2xl text-left transition-all border-2 relative overflow-hidden group ${isActive
                  ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-200"
                  : "bg-white hover:bg-orange-50/60 border-slate-100 hover:border-orange-100"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div
                      className={`text-[9px] font-black uppercase tracking-wider mb-1 ${isActive ? "text-orange-100" : "text-orange-500"
                        }`}
                    >
                      Exercise {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="font-bold text-sm truncate">{item.title}</div>
                    <div
                      className={`flex items-center gap-3 mt-2 text-[11px] font-semibold ${isActive ? "text-orange-50" : "text-slate-400"
                        }`}
                    >
                      <span className="flex items-center gap-1">
                        <HelpCircle size={11} />
                        {item.questions?.length || 0} Qs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {item.time_limit_sec || "—"}s
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <ChevronRight size={14} />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}


function BackToLessonsButton({ onBack }) {
  return (
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
    >
      <ArrowLeft size={16} />
      Back to lessons
    </button>
  );
}

function formatDuration(totalSeconds) {
  const secs = Number(totalSeconds) || 0;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function AttemptStrip({ attempts, onSelect }) {
  if (!attempts || attempts.length === 0) return null;
  return (
    <div className="space-y-4 mt-2">
      <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
        <Clock className="text-orange-400" size={16} /> Previous Attempts
      </h4>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {attempts.map((a, i) => (
          <button
            key={a._id || i}
            onClick={() => onSelect(a)}
            className="shrink-0 w-44 text-left rounded-2xl border-2 border-slate-100 bg-white hover:border-orange-200 hover:shadow-lg transition-all p-4 cursor-pointer"
          >
            <p className="text-xs font-black text-slate-400 uppercase mb-2">
              Attempt {a.attempt_number}
            </p>
            <p className="text-2xl font-black text-slate-900">
              {a.score}
              <span className="text-sm font-bold text-slate-400 ml-0.5">/{a.max_score}</span>
            </p>
            <span
              className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${a.is_passed
                ? "bg-emerald-50 text-emerald-700"
                : "bg-orange-50 text-orange-700"
                }`}
            >
              {a.is_passed ? "Passed" : "Failed"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AttemptResultModal({ attempt, onClose }) {
  if (!attempt) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white text-center">
          <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 right-10 h-32 w-32 rounded-full bg-yellow-200/20 blur-3xl" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
          <div className="relative mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
            <Award size={30} />
          </div>
          <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">
            Attempt {attempt.attempt_number}
          </p>
          <h3 className="relative text-xl font-black mt-1">
            {attempt.is_passed ? "Passed" : "Not Passed"}
          </h3>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-orange-500">
                Score
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {attempt.score}
                <span className="text-sm text-slate-400"> / {attempt.max_score}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-amber-500">
                Accuracy
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {attempt.accuracy}
                <span className="text-sm text-slate-400">%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {formatDuration(attempt.time_spent_sec)}
            </span>
            {attempt.submitted_at && (
              <span>{new Date(attempt.submitted_at).toLocaleString()}</span>
            )}
          </div>

          <div
            className={`text-center px-4 py-3 rounded-full text-sm font-bold ${attempt.is_passed
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
              }`}
          >
            {attempt.is_passed ? "🎉 Passed Successfully" : "📖 Keep Practicing"}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreAssessment({ selectedModule, onStart, attempts, onSelectAttempt }) {
  const maxAttempts = selectedModule.max_attempts || 5;
  const attemptsUsed = attempts?.length || 0;
  const isExhausted = attemptsUsed >= maxAttempts;
  const bestAttempt = (attempts || []).reduce(
    (best, a) => (!best || a.score > best.score ? a : best),
    null,
  );

  if (isExhausted) {
    return (
      <>
        <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-8 text-center space-y-3 mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Award className="text-orange-500" size={28} />
          </div>
          <h4 className="text-2xl font-black text-slate-800">Exercise Completed</h4>
          <p className="text-lg font-medium text-slate-500 max-w-lg mx-auto">
            You&apos;ve used all {maxAttempts} attempt{maxAttempts === 1 ? "" : "s"} for this
            exercise.
            {bestAttempt && (
              <>
                {" "}
                Your best score was{" "}
                <span className="font-black text-orange-600">
                  {bestAttempt.score}/{bestAttempt.max_score}
                </span>
                .
              </>
            )}
          </p>
        </div>
        <AttemptStrip attempts={attempts} onSelect={onSelectAttempt} />
      </>
    );
  }

  return (
    <div className="space-y-5 text-base">
      <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />
        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="text-orange-500" size={18} /> Evaluation Rules
        </h4>
        <ul className="text-[15px] font-medium text-slate-600 space-y-2.5 pl-2 list-none">
          {selectedModule.shuffle_questions && (
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Questions randomized dynamically.</li>
          )}
          {selectedModule.show_explanation && (
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Step-by-step resolution provided.</li>
          )}
          {!selectedModule.shuffle_questions &&
            !selectedModule.show_explanation && (
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Answer each question, then submit to see your score.</li>
            )}
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span className="text-slate-800 font-semibold">{maxAttempts - attemptsUsed} of {maxAttempts} attempt{maxAttempts === 1 ? "" : "s"}</span> remaining.
          </li>
        </ul>
      </div>
      <div className="flex justify-center mt-2 mb-2">
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-full shadow-[0_8px_30px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_40px_rgba(34,197,94,0.6)] transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          <span className="relative z-10 tracking-wide">Start Assessment Activity Now</span>
          <ChevronRight size={22} className="relative z-10 stroke-[3] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      <AttemptStrip attempts={attempts} onSelect={onSelectAttempt} />
    </div>
  );
}

function ScoreGauge({ percent, passed }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent || 0));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#fde8d3" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={passed ? "#f97316" : "#f59e0b"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-900">{clamped}%</span>
        <Award size={14} className={passed ? "text-orange-500" : "text-amber-500"} />
      </div>
    </div>
  );
}

function QuizResults({ resultData, onDone, onReview, hasReview }) {
  return (
    <div className="py-10 animate-fade-in">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center">
          <ScoreGauge percent={resultData?.accuracy} passed={resultData?.is_passed} />
        </div>

        <div className="text-center mt-6">
          <h3 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
            {resultData?.is_passed
              ? "Congratulations!"
              : "Assessment Completed"}
          </h3>
          <p className="mt-2 text-slate-500">
            {resultData?.is_passed
              ? "Excellent work! You successfully passed this assessment."
              : "Nice effort! Try again and keep improving."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 mt-8">
          <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-widest font-bold text-orange-500">
              Score
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {resultData?.score}
              <span className="text-lg text-slate-400">
                {" "}
                / {resultData?.max_score}
              </span>
            </h2>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-widest font-bold text-amber-500">
              Accuracy
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {resultData?.accuracy}
              <span className="text-lg text-slate-400">%</span>
            </h2>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div
            className={`px-6 py-3 rounded-full text-sm font-bold ${resultData?.is_passed
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
              }`}
          >
            {resultData?.is_passed
              ? "🎉 Passed Successfully"
              : "📖 Keep Practicing"}
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          {hasReview && (
            <button
              onClick={onReview}
              className="flex-1 rounded-2xl border-2 border-orange-200 text-orange-600 hover:bg-orange-50 py-4 font-bold transition-all duration-300"
            >
              View Answers
            </button>
          )}
          <button
            onClick={onDone}
            className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 py-4 font-bold text-white shadow-lg shadow-orange-300/40 transition-all duration-300 hover:scale-[1.02]"
          >
            ← Back to Exercises
          </button>
        </div>
      </div>
    </div>
  );
}

// Turns the compact string the backend grades against (e.g.
// "Evaporation,Condensation,..." or "India:Delhi|Japan:Tokyo") back into a
// readable form for the review screen, using the question's own metadata.
function prettifyAnswer(question, raw) {
  if (raw === undefined || raw === null || raw === "") return "(no answer)";
  switch (question?.question_type) {
    case "reorder":
      return String(raw).split(",").filter(Boolean).join(" → ");
    case "match":
      return String(raw)
        .split("|")
        .filter(Boolean)
        .map((entry) => {
          const [left, right] = entry.split(":");
          return `${left} → ${right}`;
        })
        .join(", ");
    default:
      return String(raw);
  }
}









function ReviewScreen({ selectedModule, questionResults, onBack }) {
  const [filter, setFilter] = useState("all"); // 'all' | 'correct' | 'incorrect'
  const [activeCard, setActiveCard] = useState(null);

  // Filter questions based on selection tab
  const filteredResults = questionResults.filter((r) => {
    if (filter === "correct") return r.is_correct;
    if (filter === "incorrect") return !r.is_correct;
    return true;
  });

  const correctCount = questionResults.filter((r) => r.is_correct).length;
  const incorrectCount = questionResults.length - correctCount;

  return (
    <div className="min-h-screen w-full bg-slate-50/50 py-8 px-4 sm:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Bar / Navigation & Filters Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-3xl shadow-sm">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors bg-slate-50 border border-slate-200/60 px-4 py-2.5 rounded-2xl shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Result
          </button>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 text-xs font-bold w-full sm:w-auto justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
                filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All ({questionResults.length})
            </button>
            <button
              onClick={() => setFilter("correct")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
                filter === "correct" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-emerald-700"
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilter("incorrect")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
                filter === "incorrect" ? "bg-red-600 text-white shadow-sm" : "text-slate-500 hover:text-red-700"
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
          </div>
        </div>

        {/* Review Cards List */}
        <div className="space-y-4">
          {filteredResults.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 font-bold text-sm">No questions found for this filter.</p>
            </div>
          ) : (
            filteredResults.map((r, i) => {
              const originalIndex = questionResults.indexOf(r);
              const q = selectedModule.questions[r.question_index ?? originalIndex] || {};
              const isSelected = activeCard === originalIndex;

              return (
                <div
                  key={originalIndex}
                  onClick={() => setActiveCard(isSelected ? null : originalIndex)}
                  className={`group rounded-3xl border transition-all duration-300 p-6 sm:p-8 space-y-4 cursor-pointer ${
                    r.is_correct
                      ? "bg-emerald-100 border-emerald-400 hover:border-emerald-500 shadow-sm shadow-emerald-500/10"
                      : "bg-red-100 border-red-400 hover:border-red-500 shadow-sm shadow-red-500/10"
                  } ${isSelected ? "ring-2 ring-orange-400/50" : ""}`}
                >
                  {/* Header info */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black uppercase tracking-widest ${r.is_correct ? "text-emerald-900" : "text-red-900"}`}>
                      Question {(r.question_index ?? originalIndex) + 1} · {q.marks || 1} mark
                      {(q.marks || 1) > 1 ? "s" : ""}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                        r.is_correct
                          ? "bg-emerald-600 text-white border border-emerald-700 shadow-sm"
                          : "bg-red-600 text-white border border-red-700 shadow-sm"
                      }`}
                    >
                      {r.is_correct ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                      {r.is_correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  {/* Question text */}
                  <p className="font-bold text-slate-900 text-base sm:text-lg">
                    {r.question_text || q.question_text}
                  </p>

                  {/* Answer Comparisons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className={`p-4 rounded-2xl border bg-white ${r.is_correct ? "border-emerald-300" : "border-red-300"}`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${r.is_correct ? "text-emerald-800" : "text-red-800"}`}>
                        Your Answer
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {prettifyAnswer(q, r.given_answer)}
                      </p>
                    </div>

                    {!r.is_correct && (
                      <div className="p-4 rounded-2xl border bg-white border-emerald-300">
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider mb-1">
                          Correct Answer
                        </p>
                        <p className="text-sm font-bold text-emerald-950">
                          {prettifyAnswer(q, r.correct_answer)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Explanation Block */}
                  {r.explanation && (
                    <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-2xl px-4 py-3.5">
                      <Lightbulb size={16} className="shrink-0 mt-0.5 text-amber-600" />
                      <span
                        className="prose prose-sm [&_p]:m-0 [&_p]:text-amber-900 font-medium"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(r.explanation) }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

/* =========================================================================
   PER-TYPE ANSWER INPUTS (Exercise "Challenge Activity" quiz)
   Answer shapes: see src/utils/questionAnswers.js
   ========================================================================= */

function ChoiceOptions({ question, answer, setAnswer, grid = false }) {
  return (
    <div className={grid ? "grid grid-cols-2 gap-3" : "space-y-3"}>
      {question.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => setAnswer({ value: opt })}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answer?.value === opt
            ? "border-orange-500 bg-orange-50"
            : "border-slate-200 hover:border-orange-300"
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function TextAnswerInput({ answer, setAnswer, placeholder = "Type your answer..." }) {
  return (
    <input
      type="text"
      value={answer?.value || ""}
      onChange={(e) => setAnswer({ value: e.target.value })}
      className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-orange-500 outline-none"
      placeholder={placeholder}
    />
  );
}

function ShortAnswerInput({ answer, setAnswer }) {
  return (
    <textarea
      rows={4}
      value={answer?.text || ""}
      onChange={(e) => setAnswer({ text: e.target.value })}
      className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-orange-500 outline-none resize-none"
      placeholder="Write your answer..."
    />
  );
}

function SequenceBuilder({ question, answer, setAnswer }) {
  const order = answer?.order || [];
  const pool = question.options
    .map((value, id) => ({ id, value }))
    .filter((item) => !order.includes(item.id));

  return (
    <div className="space-y-3">
      <div className="min-h-14 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/40 flex flex-wrap items-center gap-2 p-3">
        {order.length === 0 && (
          <span className="text-sm text-slate-400 italic">
            Tap items below to build your answer…
          </span>
        )}
        {order.map((id, pos) => (
          <button
            key={pos}
            onClick={() => setAnswer({ order: order.filter((_, i) => i !== pos) })}
            className="px-3.5 py-2 rounded-lg border-2 border-orange-400 bg-orange-100 text-orange-800 font-semibold text-sm hover:border-orange-500"
          >
            {question.options[id]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((item) => (
          <button
            key={item.id}
            onClick={() => setAnswer({ order: [...order, item.id] })}
            className="px-3.5 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300"
          >
            {item.value}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchBuilder({ question, answer, setAnswer }) {
  const pairs = answer?.pairs || {};
  const activeLeft = answer?.activeLeft || null;

  const matchPairs = useMemo(() => getMatchPairs(question), [question]);

  const rightPool = useMemo(
    () => shuffledPool(matchPairs.map((p) => p.right)),
    [matchPairs]
  );

  const usedRights = new Set(Object.values(pairs));


  // Different color for every match
  const pairColors = [
    {
      border: "border-blue-400",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      border: "border-green-400",
      bg: "bg-green-50",
      text: "text-green-700",
    },
    {
      border: "border-purple-400",
      bg: "bg-purple-50",
      text: "text-purple-700",
    },
    {
      border: "border-pink-400",
      bg: "bg-pink-50",
      text: "text-pink-700",
    },
    {
      border: "border-yellow-400",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
    },
  ];


  const getPairColor = (left) => {
    const index = matchPairs.findIndex(
      (item) => item.left === left
    );

    return pairColors[index % pairColors.length];
  };


  const getMatchedLeft = (right) => {
    return Object.keys(pairs).find(
      (left) => pairs[left] === right
    );
  };


  const pickLeft = (left) => {
    if (pairs[left]) return;

    setAnswer({
      pairs,
      activeLeft: left,
    });
  };


  const pickRight = (right) => {
    if (!activeLeft) return;

    setAnswer({
      pairs: {
        ...pairs,
        [activeLeft]: right,
      },
      activeLeft: null,
    });
  };


  return (
    <div className="grid grid-cols-2 gap-4">

      {/* LEFT OPTIONS */}
      <div className="space-y-2">

        {matchPairs.map((p) => {

          const isPaired = !!pairs[p.left];
          const isActive = activeLeft === p.left;

          const color = getPairColor(p.left);


          return (
            <button
              key={p.left}
              onClick={() => pickLeft(p.left)}
              disabled={isPaired}

              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-semibold transition-all

              ${
                isActive
                  ? "border-orange-500 bg-orange-50 text-orange-700"

                  : isPaired
                  ? `${color.border} ${color.bg} ${color.text}`

                  : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
              }`}
            >

              {p.left}

              {isPaired && (
                <span className="ml-2">
                  → {pairs[p.left]}
                </span>
              )}

            </button>
          );
        })}

      </div>


      {/* RIGHT OPTIONS */}
      <div className="space-y-2">

        {rightPool.map((item) => {

          const matchedLeft = getMatchedLeft(item.value);

          const color = matchedLeft
            ? getPairColor(matchedLeft)
            : null;


          return (
            <button
              key={item.id}
              onClick={() => pickRight(item.value)}
              disabled={usedRights.has(item.value)}

              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-semibold transition-all

              ${
                usedRights.has(item.value)

                ? `${color?.border || "border-slate-100"}
                   ${color?.bg || "bg-slate-50"}
                   ${color?.text || "text-slate-300"}`

                : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
              }`}
            >

              {item.value}

            </button>
          );

        })}

      </div>

    </div>
  );
}

function QuestionInput({ question, answer, setAnswer }) {
  switch (question.question_type) {
    case "mcq":
      return <ChoiceOptions question={question} answer={answer} setAnswer={setAnswer} />;
    case "true_false": {
      const hasValidOptions = question.options?.filter(Boolean).length === 2;
      const tfQuestion = hasValidOptions ? question : { ...question, options: ["True", "False"] };
      return <ChoiceOptions question={tfQuestion} answer={answer} setAnswer={setAnswer} grid />;
    }
    case "fill_blank":
      return question.options?.length ? (
        <ChoiceOptions question={question} answer={answer} setAnswer={setAnswer} grid />
      ) : (
        <TextAnswerInput answer={answer} setAnswer={setAnswer} />
      );
    case "short_answer":
      return <ShortAnswerInput answer={answer} setAnswer={setAnswer} />;
    case "reorder":
    // Authored "recorder" content is an arrange-the-words task (options are
    // discrete words/phrases, correct_answer is them joined in order) — not
    // an audio recording — so it reuses the same sequence builder.
    case "recorder":
      return <SequenceBuilder question={question} answer={answer} setAnswer={setAnswer} />;
    case "spell_word":
      // Authored "spell_word" content gives whole candidate spellings as
      // options (e.g. "Recommend" / "Recomend" / "Reommend"), not individual
      // letters, so it's a plain choice among them, same as mcq.
      return <ChoiceOptions question={question} answer={answer} setAnswer={setAnswer} />;
    case "match":
      return <MatchBuilder question={question} answer={answer} setAnswer={setAnswer} />;
    default:
      return <TextAnswerInput answer={answer} setAnswer={setAnswer} />;
  }
}

function formatTimer(totalSeconds) {
  const secs = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ActiveQuiz({
  selectedModule,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  setUserAnswers,
  onSubmit,
  onTimeUp,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedModule.time_limit_sec || null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!selectedModule.time_limit_sec) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [selectedModule.time_limit_sec]);

  // Separate useEffect to handle time expiration safely outside render phase
  useEffect(() => {
    if (timeLeft === 0 && onTimeUp) {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp]);

  const questions = selectedModule.questions || [];
  const total = questions.length;

  if (total === 0) {
    return (
      <p className="text-sm text-slate-500">
        No questions available for this exercise.
      </p>
    );
  }

  const q = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === total - 1;
  const answer = userAnswers[currentQuestionIndex];
  const setAnswer = (next) =>
    setUserAnswers({ ...userAnswers, [currentQuestionIndex]: next });
  const timePct =
    selectedModule.time_limit_sec != null
      ? Math.max(0, Math.min(100, (timeLeft / selectedModule.time_limit_sec) * 100))
      : null;

  return (
    <div className="space-y-4">
      {timePct !== null && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-black text-slate-800 truncate pr-3">
              {selectedModule.title}
            </span>
            <span className="font-black text-slate-800 flex items-center gap-1.5 shrink-0">
              <Clock size={16} /> Time: {formatTimer(timeLeft)}
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500">
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-white border-2 border-slate-700 flex items-center justify-center shadow transition-all duration-1000"
              style={{ left: `${timePct}%` }}
            >
              <Clock size={11} className="text-slate-700" />
            </div>
          </div>
        </div>
      )}

     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-5">
         <div className="flex items-center justify-between gap-4">
  <div className="flex items-center gap-3 flex-wrap">
    <span className="h-10 w-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center shrink-0">
      {currentQuestionIndex + 1}
    </span>
    <div>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
        Question {currentQuestionIndex + 1} of {total}
      </p>
    </div>

   {/* ADDED: Question Type Badge */}
       
  </div>
   <div className="px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            {q.question_type === "mcq"
              ? "Multiple Choice"
              : q.question_type === "true_false"
              ? "True / False"
              : q.question_type === "fill_blank"
              ? "Fill in the Blank"
              : q.question_type === "reorder"
              ? "Reorder Sequence"
              : q.question_type === "match"
              ? "Match the Pairs"
              : q.question_type === "short_answer"
              ? "Short Answer"
              : q.question_type}
          </div>
  <span className="text-xs font-bold text-slate-500 shrink-0">
    • {q.marks || 1} Mark{(q.marks || 1) > 1 ? "s" : ""}
  </span>
</div>

          <p className="text-xl font-bold text-slate-800">{q.question_text}</p>

          <QuestionInput question={q} answer={answer} setAnswer={setAnswer} />

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-40 hover:bg-slate-50 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div className="flex items-center gap-3">
              {!isLastQuestion && (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-all cursor-pointer"
                >
                  Next <ChevronRight size={16} />
                </button>
              )}
              {questions.every((qq, i) => hasAnswer(qq, userAnswers[i])) && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl shadow-[0_4px_15px_rgba(34,197,94,0.4)] hover:shadow-[0_8px_25px_rgba(34,197,94,0.5)] transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  <span className="relative z-10 tracking-wide">Submit Exercise</span>
                  <ChevronRight size={16} className="relative z-10 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 h-fit">
          <h4 className="font-black text-slate-800 text-sm">Questions</h4>
          <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
            {questions.map((qq, i) => {
              const answered = hasAnswer(qq, userAnswers[i]);
              const isCurrent = i === currentQuestionIndex;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer border-2 ${isCurrent
                    ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200"
                    : answered
                      ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200"
                      : "bg-yellow-400 border-yellow-400 text-white"
                    }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Legend
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-3 w-3 rounded-full bg-green-500 shrink-0" /> Attempted
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-3 w-3 rounded-full bg-blue-500 shrink-0" /> Current Question
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-3 w-3 rounded-full bg-yellow-400 shrink-0" /> Unattempted
            </div>
          </div>
        </div>
      </div>
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-16 h-16 rounded-full border-2 border-sky-300 flex items-center justify-center mb-4">
              <HelpCircle size={30} className="text-sky-400" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Are you sure?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Once submitted, you cannot change your answers.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  onSubmit();
                }}
                className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all cursor-pointer"
              >
                Yes, Submit
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all cursor-pointer"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseDetail({
  selectedModule,
  isQuizActive,
  setIsQuizActive,
  showResults,
  resultData,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  setUserAnswers,
  onSubmit,
  onStart,
  onBack,
  router,
  attempts,
  onSelectAttempt,
  questionResults,
  showReview,
  setShowReview,
}) {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-3 animate-fade-in pb-8">
      <BackToLessonsButton onBack={onBack} />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 py-5 text-white">
          <div className="absolute top-0 right-0 p-6 opacity-15 pointer-events-none">
            <Award size={80} />
          </div>
          <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-yellow-200/25 blur-2xl" />

          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 shadow-sm mb-2">
            <Award size={12} />
            Challenge Activity
          </span>

          <h2 className="relative text-xl md:text-2xl font-black tracking-tight">
            {selectedModule.title}
          </h2>
          <p className="relative mt-0.5 text-xs md:text-sm text-orange-50">
            Complete the challenge to test your understanding.
          </p>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {!isQuizActive && !showResults ? (
            <PreAssessment
              selectedModule={selectedModule}
              attempts={attempts}
              onSelectAttempt={onSelectAttempt}
              onStart={() => {
                onStart?.();
                setIsQuizActive(true);
              }}
            />
          ) : showResults ? (
            showReview ? (
              <ReviewScreen
                selectedModule={selectedModule}
                questionResults={questionResults}
                onBack={() => setShowReview(false)}
              />
            ) : (
              <QuizResults
                resultData={resultData}
                onDone={() => router.back()}
                onReview={() => setShowReview(true)}
                hasReview={questionResults && questionResults.length > 0}
              />
            )
          ) : (
            <ActiveQuiz
              selectedModule={selectedModule}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              userAnswers={userAnswers}
              setUserAnswers={setUserAnswers}
              onSubmit={onSubmit}
              onTimeUp={() => {
                Swal.fire({
                  icon: "warning",
                  title: "Time's Up!",
                  text: "You ran out of time for this exercise. Try again!",
                  confirmButtonColor: "#f97316",
                  confirmButtonText: "Okay",
                  target: document.fullscreenElement || document.body,
                });
                setIsQuizActive(false);
                setUserAnswers({});
                setCurrentQuestionIndex(0);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN PAGE
   ========================================================================= */


/* =========================================================================
   MAIN PAGE
   ========================================================================= */

function ExercisePageContent() {
  const searchParams = useSearchParams();
  const subTopicId = searchParams.get("subTopicId");
  const topicId = searchParams.get("topicId");
  const contentModuleId = searchParams.get("contentModuleId");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [resultData, setResultData] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [questionResults, setQuestionResults] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

 const enterFullscreen = async () => {
  if (containerRef.current?.requestFullscreen) {
    try {
      await containerRef.current.requestFullscreen();
    } catch (err) {
      // Safely catches the browser's automatic restriction error without spamming the console
      console.log("Auto-fullscreen blocked by browser policy. User interaction required.");
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

  // Automatically enter fullscreen on mount (once loading finishes or data is ready)
  useEffect(() => {
    if (!loading && selectedExercise && !isFullscreen) {
      enterFullscreen();
    }
  }, [loading, selectedExercise]);

  useEffect(() => {
    fetchExercise();
  }, [subTopicId, contentModuleId]);

  useEffect(() => {
    setIsQuizActive(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});

    // Fetch history whenever the selected exercise changes
    if (selectedExercise?._id) {
      moduleApi.getExerciseAttempts(selectedExercise._id)
        .then(res => setAttempts(res.data?.data || []))
        .catch(console.error);
    }
  }, [selectedExercise]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      const res = contentModuleId
        ? await moduleApi.getExercisesByContentModule(contentModuleId)
        : await moduleApi.getModulesBySubtopic("exercise", subTopicId);
      const data = res.data?.data || [];
      console.log(
        `[Exercise] ${contentModuleId ? `GET exercises for contentModule ${contentModuleId}` : `GET /module/exercise/${subTopicId}`} -> ${data.length} item(s)`,
        data,
      );
      setExercises(data);
      if (data.length) setSelectedExercise(data[0]);
      else setSelectedExercise(null);
    } catch (err) {
      console.error(`[Exercise] fetch failed:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.keys(userAnswers).map((index) => ({
      question_index: Number(index),
      given_answer: answerToString(
        selectedExercise.questions[Number(index)],
        userAnswers[index],
      ),
    }));

    try {
      const response = await moduleApi.submitExercise(selectedExercise._id, {
        answers: formattedAnswers,
        time_spent_sec: 10,
      });

      if (response?.data?.success) {
        const attempt = response.data.data.attempt;
        setResultData(attempt);
setQuestionResults(response.data.data.question_results || []);
        setIsQuizActive(false);
        setShowResults(true);
        toast.success("Submitted successfully!");

        if (topicId && subTopicId) {
          activityApi.logActivity({
            topic_id: topicId,
            sub_topic_id: subTopicId,
            module_id: selectedExercise._id,
            module_type: "exercise",
            activity_type: "exercise_complete",
            score: attempt?.score,
            max_score: attempt?.max_score,
            accuracy: attempt?.accuracy,
            time_spent_sec: 10,
          }).catch((err) => console.error("Failed to log activity:", err));
        }
      } else {
        toast.error(response?.data?.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Submission failed.");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!selectedExercise) {
    return (
      <EmptyState
        scopedToLesson={Boolean(contentModuleId)}
        onBack={() => router.back()}
      />
    );
  }

  return (
   <div
    ref={containerRef}
    className={`flex bg-slate-50 overflow-hidden ${
      isFullscreen ? "h-screen w-screen" : "h-screen"
    } w-full`}
  > 
    <ExerciseSidebar
      exercises={exercises}
      selectedExercise={selectedExercise}
      onSelect={setSelectedExercise}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      scopedToLesson={Boolean(contentModuleId)}
    />

    <div className="flex-1 w-full h-full relative flex flex-col p-6 md:p-8 overflow-hidden">
      <div className="z-20 flex justify-end pb-4 bg-slate-50/80 backdrop-blur-sm shrink-0">
        <button
          onClick={isFullscreen ? exitFullscreen : enterFullscreen}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:scale-105 active:scale-95"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 size={18} />
          ) : (
            <Maximize2 size={18} />
          )}
        </button>
      </div>

      {/* Added scrollbar-none and inline styles to hide scrollbars across different browsers */}
      <div 
        className="flex-1 overflow-y-auto min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <ExerciseDetail
          selectedModule={selectedExercise}
          isQuizActive={isQuizActive}
          setIsQuizActive={setIsQuizActive}
          showResults={showResults}
          resultData={resultData}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          onSubmit={handleSubmit}
          onStart={() => {
            if (topicId && subTopicId) {
              activityApi
                .logActivity({
                  topic_id: topicId,
                  sub_topic_id: subTopicId,
                  module_id: selectedExercise._id,
                  module_type: "exercise",
                  activity_type: "exercise_start",
                })
                .catch((err) => console.error("Failed to log activity:", err));
            }
          }}
          onBack={() => router.back()}
          router={router}
          attempts={attempts}
          onSelectAttempt={(attempt) => setSelectedAttempt(attempt)}
          questionResults={questionResults}
          showReview={showReview}
          setShowReview={setShowReview}
        />
      </div>
        
      {selectedAttempt && (
        <AttemptResultModal
          attempt={selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
        />
      )}
    </div>
  </div>
  );
}

export default function ExercisePage() {
  return (
    <Suspense fallback={null}>
      <ExercisePageContent />
    </Suspense>
  );
}