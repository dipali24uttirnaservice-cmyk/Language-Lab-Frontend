"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";import {
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
import {
  getMatchPairs,
  hasAnswer,
  checkAnswerLocally,
  shuffledPool,
} from "@/utils/questionAnswers";

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
            className={`h-2 rounded-full transition-all duration-300 ${isCurrent
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
    <div className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
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
                className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${isActive
                  ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-200"
                  : "bg-white hover:bg-orange-50/60 border-slate-100 hover:border-orange-100"
                  }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-orange-100" : "text-orange-500"
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
                  className={`text-sm truncate font-semibold ${isActive ? "text-white" : "text-slate-700"
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
   PER-TYPE ANSWER INPUTS
   Answer shapes: see src/utils/questionAnswers.js
   ========================================================================= */

function FillBlankText({ answer, setAnswer }) {
  return (
    <input
      type="text"
      autoFocus
      value={answer?.value || ""}
      onChange={(e) => setAnswer({ value: e.target.value })}
      placeholder="Type the missing word..."
      className="w-full p-4 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-orange-500 transition"
    />
  );
}

function ShortAnswerBox({ answer, setAnswer }) {
  return (
    <textarea
      rows={4}
      value={answer?.text || ""}
      onChange={(e) => setAnswer({ text: e.target.value })}
      placeholder="Write your answer..."
      className="w-full p-4 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-orange-500 transition resize-none"
    />
  );
}

function SequenceBuilder({ question, answer, setAnswer }) {
  const order = answer?.order || [];
  const options = question.options || [];
  const pool = options
    .map((value, id) => ({ id, value }))
    .filter((item) => !order.includes(item.id));

  return (
    <div className="space-y-4">
      <div className="min-h-16 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/40 flex flex-wrap items-center gap-2 p-3">
        {order.length === 0 && (
          <span className="text-sm text-slate-400 italic">
            Tap the words below in the right order…
          </span>
        )}
        {order.map((id, pos) => (
          <button
            key={pos}
            onClick={() => setAnswer({ order: order.filter((_, i) => i !== pos) })}
            className="px-3.5 py-2 rounded-lg border-2 border-orange-400 bg-orange-100 text-orange-800 font-semibold text-sm hover:border-orange-500 transition"
          >
            {options[id]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((item) => (
          <button
            key={item.id}
            onClick={() => setAnswer({ order: [...order, item.id] })}
            className="px-3.5 py-2 rounded-lg border-2 border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 transition"
          >
            {item.value}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchPanel({ question, answer, setAnswer }) {
  const pairs = answer?.pairs || {};
  const activeLeft = answer?.activeLeft || null;

  const matchPairs = useMemo(() => getMatchPairs(question), [question]);
  const rightPool = useMemo(
    () => shuffledPool(matchPairs.map((p) => p.right)),
    [matchPairs]
  );

  const usedRights = new Set(Object.values(pairs));

  // Different colors for each match pair
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

      {/* LEFT SIDE */}
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
                  : "border-slate-300 bg-white text-slate-700 hover:border-orange-300"
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


      {/* RIGHT SIDE */}
      <div className="space-y-2">

        {rightPool.map((item) => {

          const matchedLeft = Object.keys(pairs).find(
            key => pairs[key] === item.value
          );

          const matchedColor = matchedLeft
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

                  ? `${matchedColor?.border || "border-slate-100"} 
                     ${matchedColor?.bg || "bg-slate-50"} 
                     ${matchedColor?.text || "text-slate-300"}`

                  : "border-slate-300 bg-white text-slate-700 hover:border-orange-300"
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

/* =========================================================================
   MAIN PAGE
   ========================================================================= */

export default function PracticeQuestionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
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

  // Automatically trigger fullscreen on page load
  useEffect(() => {
    if (!isFullscreen) {
      enterFullscreen();
    }
  }, []);

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
  const [drafts, setDrafts] = useState({});
  const [answers, setAnswers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  if (!moduleData) {
    return <EmptyCard title="No Practice Data Found" subtitle="Go back and select a lesson to practice." />;
  }

  if (!questions.length) {
    return <EmptyCard title="No Questions Available" subtitle="This lesson has no practice questions yet." />;
  }

  const question = questions[current];
  const draft = drafts[current];
  const setDraft = (next) => setDrafts((prev) => ({ ...prev, [current]: next }));

  const rawOptions = Array.isArray(question.options) ? question.options.filter(Boolean) : [];

  const options =
    question.question_type === "true_false"
      ? (rawOptions.length === 2 ? rawOptions : ["True", "False"])
      : rawOptions;

  const isChoiceType =
    question.question_type === "mcq" ||
    question.question_type === "true_false" ||
    question.question_type === "spell_word" ||
    (question.question_type === "fill_blank" && options.length > 0);

  const letterMap = ["A", "B", "C", "D", "a", "b", "c", "d"];
  const correctAnswer =
    isChoiceType && letterMap.includes(question.correct_answer)
      ? options[letterMap.indexOf(question.correct_answer) % 4]
      : question.correct_answer;

  const answered = hasAnswer(question, draft);

  const isAnswered = !!answers[current];
  const answeredCount = Object.keys(answers).length;
  const allAttempted = answeredCount === questions.length;
  const progressPct = (answeredCount / questions.length) * 100;

  const submitAnswer = () => {
    if (answers[current]) return;
    if (!answered) return;

    let isCorrect;
    if (isChoiceType) {
      const given = (draft?.value || "").toString().trim().toLowerCase();
      isCorrect = given === (correctAnswer || "").toString().trim().toLowerCase();
    } else {
      isCorrect = checkAnswerLocally(question, draft);
    }

    setAnswers((prev) => ({
      ...prev,
      [current]: { isCorrect },
    }));
  };

  const retryQuestion = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[current];
      return next;
    });
    setDrafts((prev) => ({ ...prev, [current]: undefined }));
  };

  return (
    <div
      ref={containerRef}
      className={`flex bg-slate-50 overflow-hidden ${
        isFullscreen ? "h-screen w-screen" : "h-full"
      }`}
    >       
      <QuestionSidebar
        questions={questions}
        current={current}
        answers={answers}
        onSelect={setCurrent}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm px-8 pt-6 pb-2 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-orange-600 font-semibold text-sm"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:scale-105 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 size={18} />
            ) : (
              <Maximize2 size={18} />
            )}
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
                  <div className="px-3 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider shadow-sm">
                    {question.question_type === "mcq"
                      ? "Multiple Choice"
                      : question.question_type === "true_false"
                      ? "True / False"
                      : question.question_type === "fill_blank"
                      ? "Fill in the Blank"
                      : question.question_type}
                  </div>
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
              
              <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                  {isAnswered ? (
                    <motion.div
                      key={`result-${current}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-2xl py-20 px-8 text-center text-white relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col justify-center ${
                        answers[current].isCorrect ? "bg-[#16b471]" : "bg-[#df3c43]"
                      }`}
                    >
                      {answers[current].isCorrect ? (
                        <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'hidden' }}>
                          <div className="absolute top-0 left-0 w-full h-full bg-white/5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[20px] bg-white/10 -rotate-45 origin-center translate-y-[200px]" />
                          <div className="absolute top-[20%] left-[25%] w-2.5 h-2.5 rounded-full bg-[#1de9b6]" />
                          <div className="absolute top-[15%] left-[8%] w-3 h-3 rounded-full bg-[#ffd54f]" />
                          <div className="absolute top-[20%] right-[22%] w-2.5 h-2.5 rounded-full bg-[#b388ff]" />
                          <div className="absolute top-[50%] right-[12%] w-3 h-3 rounded-full bg-[#ffd54f]" />
                          <div className="absolute bottom-[25%] left-[20%] w-3 h-3 rounded-full bg-[#1de9b6]" />
                          <div className="absolute bottom-[10%] left-[35%] w-2.5 h-2.5 rounded-full bg-[#ffd54f]" />
                          <div className="absolute bottom-[25%] right-[25%] w-3.5 h-3.5 rounded-full bg-white/30" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                          <div className="absolute w-[200%] h-[120px] bg-white/[0.04] -rotate-45" />
                          <div className="absolute w-[200%] h-[120px] bg-white/[0.04] rotate-45" />
                        </div>
                      )}

                      <div className="relative z-10 space-y-4">
                        <h2 className="text-3xl !text-white font-normal tracking-wide drop-shadow-sm">
                          {answers[current].isCorrect ? "Correct Answer!" : "Wrong Answer!"}
                        </h2>
                        <p className="font-bold !text-white mb-16 text-[15px] drop-shadow-sm">
                          {answers[current].isCorrect
                            ? "Nice work. That one was spot on."
                            : "Close, but not quite. Give it another shot."}
                        </p>

                        <div className="flex justify-center mt-4">
                          {answers[current].isCorrect ? (
                            <button
                              onClick={() => {
                                if (current < questions.length - 1) {
                                  setCurrent((p) => p + 1);
                                }
                              }}
                              disabled={current === questions.length - 1}
                              className="bg-[#2d3748] hover:bg-[#1a202c] text-white font-semibold py-2.5 px-5 rounded transition-colors shadow-lg disabled:opacity-0 text-sm tracking-wide"
                            >
                              Next Question &raquo;
                            </button>
                          ) : (
                            <button
                              onClick={retryQuestion}
                              className="bg-[#2d3748] hover:bg-[#1a202c] text-white font-semibold py-2.5 px-5 rounded transition-colors shadow-lg text-sm tracking-wide"
                            >
                              Try Again
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`question-${current}`}
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
                        {question.question_type === "short_answer" ? (
                          <ShortAnswerBox answer={draft} setAnswer={setDraft} />
                        ) : question.question_type === "match" ? (
                          <MatchPanel question={question} answer={draft} setAnswer={setDraft} />
                        ) : question.question_type === "recorder" ? (
                          <SequenceBuilder question={question} answer={draft} setAnswer={setDraft} />
                        ) : isChoiceType ? (
                          options.filter(Boolean).map((opt, i) => {
                            const isSelected = draft?.value === opt;

                            return (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setDraft({ value: opt })}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 font-medium ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                                    : "border-slate-300 bg-white text-slate-700 hover:border-orange-300"
                                }`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? "border-orange-500" : "border-slate-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                  )}
                                </div>

                                <span className="text-[15px]">{opt}</span>
                              </motion.button>
                            );
                          })
                        ) : (
                          <FillBlankText answer={draft} setAnswer={setDraft} />
                        )}
                      </div>

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
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={submitAnswer}
                            disabled={!answered}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-500 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-md hover:shadow-emerald-200 flex items-center gap-2"
                          >
                            Submit Answer &raquo;
                          </motion.button>
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
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}