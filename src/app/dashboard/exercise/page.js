"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { moduleApi } from "@/services/topic/topicApi";
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
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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

function EmptyState() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center">
          <Award className="text-orange-400" size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No exercises found</h3>
        <p className="text-sm text-slate-400 mt-1">
          There are no exercises available for this topic yet.
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
            className={`h-2 rounded-full transition-all duration-300 ${
              isCurrent
                ? "w-6 bg-orange-500"
                : isDone
                ? "w-2 bg-emerald-400"
                : "w-2 bg-slate-200"
            }`}
          />
        );
      })}
    </div>
  );
}

/* =========================================================================
   SIDEBAR
   ========================================================================= */

function ExerciseSidebar({ exercises, selectedExercise, onSelect, searchTerm, setSearchTerm }) {
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
            <h2 className="font-black text-lg text-slate-900 leading-tight">Exercises</h2>
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
                className={`w-full p-4 rounded-2xl text-left transition-all border-2 relative overflow-hidden group ${
                  isActive
                    ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-200"
                    : "bg-white hover:bg-orange-50/60 border-slate-100 hover:border-orange-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div
                      className={`text-[9px] font-black uppercase tracking-wider mb-1 ${
                        isActive ? "text-orange-100" : "text-orange-500"
                      }`}
                    >
                      Exercise {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="font-bold text-sm truncate">{item.title}</div>
                    <div
                      className={`flex items-center gap-3 mt-2 text-[11px] font-semibold ${
                        isActive ? "text-orange-50" : "text-slate-400"
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

function IntroPanel({ selectedExercise, onStart }) {
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
  const question = selectedExercise.questions[currentQuestionIndex];
  const total = selectedExercise.questions.length;
  const isLast = currentQuestionIndex === total - 1;
  const progress = ((currentQuestionIndex + (userAnswers[currentQuestionIndex] ? 1 : 0)) / total) * 100;

  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-orange-500 uppercase tracking-wide">
            Question {currentQuestionIndex + 1} of {total}
          </span>
          <QuestionDots total={total} current={currentQuestionIndex} answers={userAnswers} />
        </div>
        <ProgressBar value={progress} />
      </div>

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

          <div className="space-y-3">
            {question.question_type === "mcq" ? (
              question.options.map((opt, i) => {
                const isSelected = userAnswers[currentQuestionIndex] === opt;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() =>
                      setUserAnswers({ ...userAnswers, [currentQuestionIndex]: opt })
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                      isSelected
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
              })
            ) : (
              <input
                type="text"
                autoFocus
                value={userAnswers[currentQuestionIndex] || ""}
                onChange={(e) =>
                  setUserAnswers({ ...userAnswers, [currentQuestionIndex]: e.target.value })
                }
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-all text-slate-700"
                placeholder="Type your answer..."
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => (isLast ? onSubmit() : setCurrentQuestionIndex(currentQuestionIndex + 1))}
        disabled={!userAnswers[currentQuestionIndex]}
        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isLast ? "Submit Assessment" : "Next Question"}
        <ChevronRight size={18} />
      </motion.button>
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
          className={`px-6 py-3 rounded-full text-sm font-bold ${
            resultData?.is_passed ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
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

  useEffect(() => {
    fetchExercise();
  }, [subTopicId]);

  useEffect(() => {
    setIsQuizActive(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
  }, [selectedExercise]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      const res = await moduleApi.getModulesBySubtopic("exercise", subTopicId);
      const data = res.data?.data || [];
      setExercises(data);
      if (data.length) setSelectedExercise(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.keys(userAnswers).map((index) => ({
      question_index: Number(index),
      given_answer: userAnswers[index],
    }));

    try {
      const response = await moduleApi.submitExercise(selectedExercise._id, {
        answers: formattedAnswers,
        time_spent_sec: 10,
      });

      if (response?.data?.success) {
        setResultData(response.data.data.attempt);
        setIsQuizActive(false);
        setShowResults(true);
        toast.success("Submitted successfully!");
      } else {
        toast.error(response?.data?.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Submission failed.");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!selectedExercise) return <EmptyState />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <ExerciseSidebar
        exercises={exercises}
        selectedExercise={selectedExercise}
        onSelect={setSelectedExercise}
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
          <div className="relative max-w-2xl mx-auto overflow-hidden rounded-3xl border border-orange-100 bg-white p-8 shadow-[0_20px_60px_rgba(249,115,22,0.10)] transition-all duration-300">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-orange-100 opacity-50 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-100 opacity-50 blur-2xl pointer-events-none" />

            <div className="relative">
              <AnimatePresence mode="wait">
                {!isQuizActive && !showResults ? (
                  <IntroPanel
                    key="intro-panel"
                    selectedExercise={selectedExercise}
                    onStart={() => setIsQuizActive(true)}
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
        </div>
      </div>
    </div>
  );
}
