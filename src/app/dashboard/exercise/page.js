"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { moduleApi } from "@/services/topic/topicApi";
import { activityApi } from "@/services/activity/activityApi";
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getMatchPairs, hasAnswer, answerToString, shuffledPool } from "@/utils/questionAnswers";

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

function EmptyState({ scopedToLesson = false }) {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center">
          <Award className="text-orange-400" size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No exercises found</h3>
        <p className="text-sm text-slate-400 mt-1">
          {scopedToLesson
            ? "There is no exercise created for this lesson yet."
            : "There are no exercises available for this topic yet."}
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

function QuestionDots({ total, current, answers }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => {
        const isDone = answers[i] !== undefined;
        const isCurrent = i === current;
        return (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${isCurrent
              ? "w-6 bg-blue-500"
              : isDone
                ? "w-2 bg-green-500"
                : "w-2 bg-yellow-400"
              }`}
          />
        );
      })}
    </div>
  );
}

function QuestionNumberGrid({ total, current, answers, onSelect }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Questions</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const isDone = answers[i] !== undefined;
          const isCurrent = i === current;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-200 border-2 ${isCurrent
                ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200"
                : isDone
                  ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200"
                  : "bg-yellow-400 border-yellow-400 text-white"
                }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-4 pt-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Legend</p>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Attempted</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Current</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Unattempted</span>
      </div>
    </div>
  );
}



function AttemptHistory({ attempts }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [attempts]);

  if (!attempts || attempts.length === 0) return null;

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -320 : 320,
      behavior: 'smooth'
    });
  };

  return (
    <div className="mt-8 relative px-2">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Clock size={15} className="text-orange-400" />
          Previous Attempts
        </h4>
      </div>

      <div className="relative group">
        {/* Navigation Arrows: Only show if there are more than 4 items */}
        {attempts.length > 4 && (
          <>
            <button
              onClick={() => scroll("left")}
              className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg border border-slate-100 transition-opacity ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg border border-slate-100 transition-opacity ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
        >
          {attempts.map((attempt, i) => (
            <motion.div
              key={i}
              className="flex-shrink-0 w-40 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-orange-200 transition-colors"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Attempt {i + 1}</p>
              <div className="text-xl font-black text-slate-900">{attempt.score}/{attempt.max_score}</div>
              <div className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${attempt.is_passed ? "text-emerald-700 bg-emerald-50" : "text-orange-700 bg-orange-50"
                }`}>
                {attempt.is_passed ? "Passed" : "Failed"}
              </div>
            </motion.div>
          ))}
        </div>
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

/* =========================================================================
   INTRO / PRE-ASSESSMENT PANEL
   ========================================================================= */

function IntroPanel({ selectedExercise, onStart, attempts }) {
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-start gap-4">
        {/* ... existing header content ... */}
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
          <Target size={26} />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-500">
            Assessment
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {selectedExercise.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* ... existing stats ... */}
        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4">
          <div className="flex items-center gap-2 text-orange-500 mb-1">
            <HelpCircle size={14} />
            <span className="text-[10px] font-black uppercase tracking-wide">Questions</span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {selectedExercise.questions?.length || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock size={14} />
            <span className="text-[10px] font-black uppercase tracking-wide">Time Limit</span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {selectedExercise.time_limit_sec || "—"}s
          </p>
        </div>
      </div>



      <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5">
        <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2 text-sm">
          <Sparkles size={16} /> What to expect
        </h4>
        <ul className="text-sm text-orange-700 space-y-1.5">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            Answer each question to move to the next
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            Your score and accuracy shown at the end
          </li>
        </ul>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-bold text-white shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
      >
        <Zap size={18} />
        Start Assessment
      </motion.button>
    </motion.div>
  );
}




/* =========================================================================
   PER-TYPE ANSWER INPUTS
   ========================================================================= */

function ChoiceOptions({ question, answer, setAnswer, grid = false }) {
  return (
    <div className={grid ? "grid grid-cols-2 gap-3" : "space-y-3"}>
      {question.options.map((opt, i) => {
        const isSelected = answer?.value === opt;
        return (
          <motion.button
            key={i}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setAnswer({ value: opt })}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${isSelected
              ? "border-orange-500 bg-orange-50 shadow-sm"
              : "border-gray-200 hover:border-orange-300 bg-white"
              }`}
          >
            <span className={isSelected ? "text-orange-700 font-semibold" : "text-slate-700"}>
              {opt}
            </span>
            {isSelected && <CheckCircle2 size={18} className="text-orange-500 shrink-0" />}
          </motion.button>
        );
      })}
    </div>
  );
}

function TextAnswerInput({ answer, setAnswer, placeholder = "Type your answer..." }) {
  return (
    <input
      type="text"
      autoFocus
      value={answer?.value || ""}
      onChange={(e) => setAnswer({ value: e.target.value })}
      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all text-slate-700"
      placeholder={placeholder}
    />
  );
}

function ShortAnswerInput({ answer, setAnswer }) {
  return (
    <textarea
      autoFocus
      rows={4}
      value={answer?.text || ""}
      onChange={(e) => setAnswer({ text: e.target.value })}
      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all text-slate-700 resize-none"
      placeholder="Write your answer..."
    />
  );
}

// Shared builder for "reorder" (arrange items) and "spell_word" (arrange
// letters) — both work the same way: tap pool items to build a sequence.
function SequenceBuilder({ question, answer, setAnswer, isSpell }) {
  const order = answer?.order || [];
  const pool = question.options
    .map((value, id) => ({ id, value }))
    .filter((item) => !order.includes(item.id));

  return (
    <div className="space-y-3">
      <div className="min-h-14 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/40 flex flex-wrap items-center gap-2 p-3">
        {order.length === 0 && (
          <span className="text-sm text-slate-400 italic">
            Tap {isSpell ? "letters" : "items"} below to build your answer…
          </span>
        )}
        {order.map((id, pos) => (
          <button
            key={pos}
            onClick={() => setAnswer({ order: order.filter((_, i) => i !== pos) })}
            className="px-3.5 py-2 rounded-lg border-2 border-orange-400 bg-orange-100 text-orange-800 font-semibold text-sm transition-all hover:border-orange-500"
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
            className="px-3.5 py-2 rounded-lg border-2 border-gray-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 transition-all"
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
    [matchPairs],
  );
  const usedRights = new Set(Object.values(pairs));

  const pickLeft = (left) => {
    if (pairs[left]) return;
    setAnswer({ pairs, activeLeft: left });
  };
  const pickRight = (right) => {
    if (!activeLeft) return;
    setAnswer({ pairs: { ...pairs, [activeLeft]: right }, activeLeft: null });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        {matchPairs.map((p) => {
          const isPaired = !!pairs[p.left];
          const isActive = activeLeft === p.left;
          return (
            <button
              key={p.left}
              onClick={() => pickLeft(p.left)}
              disabled={isPaired}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-semibold transition-all ${isActive
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : isPaired
                  ? "border-orange-300 bg-orange-50/60 text-orange-700"
                  : "border-gray-200 bg-white text-slate-700 hover:border-orange-300"
                }`}
            >
              {p.left} {isPaired && <span className="text-orange-400">→ {pairs[p.left]}</span>}
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {rightPool.map((item) => (
          <button
            key={item.id}
            onClick={() => pickRight(item.value)}
            disabled={usedRights.has(item.value)}
            className={`w-full text-left p-3 rounded-xl border-2 text-sm font-semibold transition-all ${usedRights.has(item.value)
              ? "border-gray-100 bg-gray-50 text-slate-300 cursor-not-allowed"
              : "border-gray-200 bg-white text-slate-700 hover:border-orange-300"
              }`}
          >
            {item.value}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionInput({ question, answer, setAnswer }) {
  switch (question.question_type) {
    case "mcq":
      return <ChoiceOptions question={question} answer={answer} setAnswer={setAnswer} />;
    case "true_false": {
      // Some older records were saved with blank options (["", ""])
      // instead of ["True", "False"] — fall back rather than render
      // unlabeled buttons.
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
      return <SequenceBuilder question={question} answer={answer} setAnswer={setAnswer} isSpell={false} />;
    case "spell_word":
      return <SequenceBuilder question={question} answer={answer} setAnswer={setAnswer} isSpell />;
    case "match":
      return <MatchBuilder question={question} answer={answer} setAnswer={setAnswer} />;
    default:
      return <TextAnswerInput answer={answer} setAnswer={setAnswer} />;
  }
}

/* =========================================================================
   ACTIVE QUIZ PANEL
   ========================================================================= */

function QuizPanel({
  selectedExercise,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  setUserAnswers,
  onSubmit,
}) {
  const [hintOpen, setHintOpen] = useState({});
  const question = selectedExercise.questions[currentQuestionIndex];
  const answer = userAnswers[currentQuestionIndex];
  const setAnswer = (next) => setUserAnswers({ ...userAnswers, [currentQuestionIndex]: next });
  const total = selectedExercise.questions.length;
  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === total - 1;
  const answeredCount = selectedExercise.questions.filter((q, i) => hasAnswer(q, userAnswers[i])).length;
  const allAnswered = answeredCount === total;
  const progress = (answeredCount / total) * 100;

  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header: Question counter + progress bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-orange-500 uppercase tracking-wide">
            Question {currentQuestionIndex + 1} of {total}
          </span>
          <span className="text-xs font-semibold text-slate-400">{answeredCount}/{total} answered</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* Question number grid */}
      <QuestionNumberGrid
        total={total}
        current={currentQuestionIndex}
        answers={userAnswers}
        onSelect={setCurrentQuestionIndex}
      />

      {/* Question content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <p className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
            {question.question_text}
          </p>

          {question.hint && (
            <div>
              <button
                type="button"
                onClick={() =>
                  setHintOpen((h) => ({ ...h, [currentQuestionIndex]: !h[currentQuestionIndex] }))
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition"
              >
                <Lightbulb size={14} />
                {hintOpen[currentQuestionIndex] ? "Hide hint" : "Show hint"}
              </button>
              {hintOpen[currentQuestionIndex] && (
                <p className="mt-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  {question.hint}
                </p>
              )}
            </div>
          )}

          <QuestionInput question={question} answer={answer} setAnswer={setAnswer} />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-40 hover:bg-slate-50 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Submit Exercise — only shown when ALL questions are answered */}
        {allAnswered && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSubmit}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl shadow-[0_4px_15px_rgba(34,197,94,0.4)] hover:shadow-[0_8px_25px_rgba(34,197,94,0.5)] transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <span className="relative z-10 tracking-wide">Submit Exercise</span>
            <ChevronRight size={16} className="relative z-10 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        )}

        <button
          onClick={() => setCurrentQuestionIndex((i) => i + 1)}
          disabled={isLast}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   RESULTS PANEL
   ========================================================================= */

function ResultsPanel({ resultData, onDone }) {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-orange-400 blur-2xl opacity-30" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-xl shadow-orange-300/40">
            <Award size={42} className="text-white" />
          </div>
        </motion.div>
      </div>

      <div className="text-center mt-6">
        <h3 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
          {resultData?.is_passed ? "Congratulations!" : "Assessment Completed"}
        </h3>
        <p className="mt-2 text-slate-500">
          {resultData?.is_passed
            ? "Excellent work! You successfully passed this assessment."
            : "Nice effort! Try again and keep improving."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 mt-8">
        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest font-bold text-orange-500">Score</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            {resultData?.score}
            <span className="text-lg text-slate-400"> / {resultData?.max_score}</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest font-bold text-amber-500">Accuracy</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            {resultData?.accuracy}
            <span className="text-lg text-slate-400">%</span>
          </h2>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <div
          className={`px-6 py-3 rounded-full text-sm font-bold ${resultData?.is_passed ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
            }`}
        >
          {resultData?.is_passed ? "🎉 Passed Successfully" : "📖 Keep Practicing"}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onDone}
        className="mt-10 w-full rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 py-4 font-bold text-white shadow-lg shadow-orange-300/40 transition-all duration-300"
      >
        ← Back to Exercises
      </motion.button>
    </motion.div>
  );
}

/* =========================================================================
   MAIN PAGE
   ========================================================================= */

export default function ExercisePage() {
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
      setExercises(data);
      if (data.length) setSelectedExercise(data[0]);
      else setSelectedExercise(null);
    } catch (err) {
      console.error(err);
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
  if (!selectedExercise) return <EmptyState scopedToLesson={Boolean(contentModuleId)} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <ExerciseSidebar
        exercises={exercises}
        selectedExercise={selectedExercise}
        onSelect={setSelectedExercise}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        scopedToLesson={Boolean(contentModuleId)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm px-8 pt-6 pb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-orange-600 font-semibold text-sm transition"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>

        <div className="px-8 pb-16 pt-4">
          {/* Main Assessment Container */}
          <div className="relative max-w-2xl mx-auto overflow-hidden rounded-3xl border border-orange-100 bg-white p-8 shadow-[0_20px_60px_rgba(249,115,22,0.10)] transition-all duration-300">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-orange-100 opacity-50 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-100 opacity-50 blur-2xl pointer-events-none" />

            <div className="relative">
              <AnimatePresence mode="wait">
                {!isQuizActive && !showResults ? (
                  <IntroPanel
                    key="intro-panel"
                    selectedExercise={selectedExercise}
                    attempts={attempts}
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
                      setIsQuizActive(true);
                    }}
                  />
                ) : showResults ? (
                  <ResultsPanel
                    key="results-panel"
                    resultData={resultData}
                    onDone={() => router.back()}
                  />
                ) : (
                  <QuizPanel
                    key="quiz-panel"
                    selectedExercise={selectedExercise}
                    currentQuestionIndex={currentQuestionIndex}
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                    userAnswers={userAnswers}
                    setUserAnswers={setUserAnswers}
                    onSubmit={handleSubmit}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Attempt History: Placed outside main box, but centered within the same max-width */}
          {!isQuizActive && !showResults && attempts.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <AttemptHistory attempts={attempts} />
            </div>
          )}
        </div>

      </div>

    </div>

  );
}
