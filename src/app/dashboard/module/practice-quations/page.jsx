"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================================
   SMALL SHARED PIECES
   ========================================================================= */

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
        const isCorrect = answers[i]?.isCorrect;
        const isCurrent = i === current;
        return (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              isCurrent
                ? "w-6 bg-orange-500"
                : isDone
                ? isCorrect
                  ? "w-2 bg-emerald-400"
                  : "w-2 bg-red-400"
                : "w-2 bg-slate-200"
            }`}
          />
        );
      })}
    </div>
  );
}

function EmptyCard({ title, subtitle }) {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center">
          <BookOpen className="text-orange-400" size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

/* =========================================================================
   SIDEBAR
   ========================================================================= */

function QuestionSidebar({ questions, current, answers, onSelect, searchTerm, setSearchTerm }) {
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length ? (answeredCount / questions.length) * 100 : 0;

  const filtered = questions
    .map((q, idx) => ({ ...q, __idx: idx }))
    .filter((q) => q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col h-screen">
      <div className="p-5 border-b border-slate-100 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-200">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-900 leading-tight">Practice</h2>
            <p className="text-[11px] font-semibold text-slate-400">
              {answeredCount}/{questions.length} answered
            </p>
          </div>
        </div>

        <ProgressBar value={progressPct} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No matches found.</p>
        ) : (
          filtered.map((q) => {
            const index = q.__idx;
            const isCompleted = !!answers[index];
            const isActive = current === index;

            return (
              <motion.button
                key={index}
                onClick={() => onSelect(index)}
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
                  {isCompleted && (
                    <div className={`p-1 rounded-full ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
                      {answers[index].isCorrect ? (
                        <CheckCircle2 size={13} className={isActive ? "text-white" : "text-emerald-500"} />
                      ) : (
                        <XCircle size={13} className={isActive ? "text-white" : "text-red-500"} />
                      )}
                    </div>
                  )}
                </div>
                <div
                  className={`text-sm truncate font-semibold ${
                    isActive ? "text-white" : "text-slate-700"
                  }`}
                >
                  {q.question_text}
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
   OPTION BUTTON (gray -> orange selected -> green/red on answer)
   ========================================================================= */

function OptionButton({ opt, isAnswered, isSelected, isCorrectAnswer, onClick }) {
  let classes = "border-gray-200 hover:border-orange-300 bg-white text-slate-700";

  if (!isAnswered) {
    if (isSelected) {
      classes = "border-orange-500 bg-orange-50 text-orange-700 shadow-sm";
    }
  } else {
    if (isCorrectAnswer) {
      classes = "border-emerald-500 bg-emerald-50 text-emerald-700";
    } else if (isSelected) {
      classes = "border-red-500 bg-red-50 text-red-700";
    } else {
      classes = "border-gray-200 bg-white text-slate-400";
    }
  }

  return (
    <motion.button
      whileHover={!isAnswered ? { scale: 1.005 } : {}}
      whileTap={!isAnswered ? { scale: 0.99 } : {}}
      disabled={isAnswered}
      onClick={onClick}
      className={`block w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between font-medium ${classes}`}
    >
      <span>{opt}</span>
      {isAnswered && isCorrectAnswer && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
      {isAnswered && !isCorrectAnswer && isSelected && <XCircle size={18} className="text-red-500 shrink-0" />}
      {!isAnswered && isSelected && <CheckCircle2 size={18} className="text-orange-500 shrink-0" />}
    </motion.button>
  );
}

/* =========================================================================
   MAIN PAGE
   ========================================================================= */

export default function PracticeQuestionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const moduleData = useMemo(() => {
    const data = searchParams.get("data");
    if (!data) return null;
    try {
      return JSON.parse(decodeURIComponent(data));
    } catch {
      return null;
    }
  }, [searchParams]);

  const questions = moduleData?.questions || [];

  const [current, setCurrent] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [answers, setAnswers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  if (!moduleData) {
    return <EmptyCard title="No Practice Data Found" subtitle="Go back and select a lesson to practice." />;
  }

  if (!questions.length) {
    return <EmptyCard title="No Questions Available" subtitle="This lesson has no practice questions yet." />;
  }

  const question = questions[current];

  const options =
    question.question_type === "true_false"
      ? ["True", "False"]
      : question.question_type === "mcq"
      ? question.options.filter(Boolean)
      : [];

  const correctAnswer = ["A", "B", "C", "D", "a", "b", "c", "d"].includes(question.correct_answer)
    ? options[["A", "B", "C", "D", "a", "b", "c", "d"].indexOf(question.correct_answer) % 4]
    : question.correct_answer;

  const isAnswered = !!answers[current];
  const answeredCount = Object.keys(answers).length;
  const allAttempted = answeredCount === questions.length;
  const progressPct = (answeredCount / questions.length) * 100;

  const submitAnswer = () => {
    if (answers[current]) return;
    const value = selectedOptions[current];
    if (!value) return;

    setAnswers((prev) => ({
      ...prev,
      [current]: {
        isCorrect: value.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase(),
      },
    }));
  };

  const retryQuestion = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[current];
      return next;
    });
    setSelectedOptions((prev) => ({ ...prev, [current]: "" }));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <QuestionSidebar
        questions={questions}
        current={current}
        answers={answers}
        onSelect={setCurrent}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
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
          <div className="max-w-2xl mx-auto relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-8 shadow-[0_20px_60px_rgba(249,115,22,0.10)] transition-all duration-300">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-orange-100 opacity-50 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-100 opacity-50 blur-2xl pointer-events-none" />

            <div className="relative space-y-6">
              {/* Progress header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-wide">
                    Question {current + 1} of {questions.length}
                  </span>
                  <QuestionDots total={questions.length} current={current} answers={answers} />
                </div>
                <ProgressBar value={progressPct} />
              </div>

              {allAttempted && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm font-semibold"
                >
                  <Sparkles size={16} />
                  All questions attempted — nice work!
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <h1 className="text-2xl font-bold text-slate-800 leading-snug">
                    {question.question_text}
                  </h1>

                  <div className="space-y-3">
                    {(question.question_type === "mcq" || question.question_type === "true_false") &&
                      options.map((opt, i) => (
                        <OptionButton
                          key={i}
                          opt={opt}
                          isAnswered={isAnswered}
                          isSelected={selectedOptions[current] === opt}
                          isCorrectAnswer={
                            isAnswered &&
                            opt.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase()
                          }
                          onClick={() => setSelectedOptions((prev) => ({ ...prev, [current]: opt }))}
                        />
                      ))}

                    {(question.question_type === "fill_blank" || question.question_type === "short_answer") && (
                      <input
                        type="text"
                        disabled={isAnswered}
                        value={selectedOptions[current] || ""}
                        onChange={(e) =>
                          setSelectedOptions((prev) => ({ ...prev, [current]: e.target.value }))
                        }
                        className={`border-2 rounded-xl p-4 w-full outline-none transition-colors font-medium ${
                          isAnswered
                            ? answers[current].isCorrect
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-red-500 bg-red-50 text-red-700"
                            : selectedOptions[current]
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 focus:border-orange-500"
                        }`}
                        placeholder="Type your answer here..."
                      />
                    )}
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {isAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 rounded-xl border flex items-center gap-2 ${
                          answers[current].isCorrect
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        {answers[current].isCorrect ? (
                          <CheckCircle2 size={18} className="text-emerald-600" />
                        ) : (
                          <XCircle size={18} className="text-red-600" />
                        )}
                        <h3
                          className={`font-bold text-sm ${
                            answers[current].isCorrect ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {answers[current].isCorrect
                            ? "Correct!"
                            : `Incorrect — correct answer: ${correctAnswer}`}
                        </h3>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Nav row */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setCurrent((p) => p - 1)}
                      disabled={current === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all font-medium"
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>

                    <div className="flex gap-2">
                      {isAnswered && !answers[current].isCorrect && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={retryQuestion}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-md hover:shadow-red-200"
                        >
                          <RotateCcw size={16} />
                          Try Again
                        </motion.button>
                      )}

                      {!isAnswered && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={submitAnswer}
                          disabled={!selectedOptions[current]}
                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-500 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-md hover:shadow-orange-200"
                        >
                          Submit
                        </motion.button>
                      )}
                    </div>

                    <button
                      onClick={() => setCurrent((p) => p + 1)}
                      disabled={current === questions.length - 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all font-medium"
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
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
