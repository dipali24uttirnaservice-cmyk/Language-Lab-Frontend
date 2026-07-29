"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
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
  Save,
  Sparkles,
  Play,
  Clock,
  Award,
  FileText,
} from "lucide-react";

/* Dynamic import for CKEditor to handle SSR in Next.js */
const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);

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
function Sidebar({
  manuals,
  current,
  answers,
  setCurrent,
  search,
  setSearch,
}) {
  const completed = Object.values(answers).filter((val) => val?.trim()).length;
  const progress = manuals.length ? (completed / manuals.length) * 100 : 0;

  const filtered = manuals
    .map((item, originalIndex) => ({ ...item, originalIndex }))
    .filter((q) => q.title.toLowerCase().includes(search.toLowerCase()));

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
                key={item.id}
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
                  {item.title}
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

  // Extract params from URL
  const topicId = routeParams?.topicId || searchParams.get("topicId");
  const topicName = searchParams.get("topicName");
  const courseName = searchParams.get("courseName");

  // Practical manuals list
  const manualsList = useMemo(
    () => [
      {
        id: "6a509b7175de4d60103689d3",
        manualTitle: topicName || "English Vocabulary Skills Practical",
        duration: "40 Mins",
        totalMarks: 50,
        questions: [
          {
            id: 1,
            title: "Contextual Vocabulary Application",
            marks: 10,
            description:
              "Construct five original sentences demonstrating the usage of advanced academic vocabulary in context.",
          },
          {
            id: 2,
            title: "Synonym & Antonym Analysis",
            marks: 15,
            description:
              "Analyze nuances between subtle synonyms and provide precise contextual replacements.",
          },
          {
            id: 3,
            title: "Idiomatic Expressions & Phrasal Verbs",
            marks: 25,
            description:
              "Write a short paragraph incorporating at least three phrasal verbs and two idiomatic expressions correctly.",
          },
        ],
      },
      {
        id: "manual-1",
        manualTitle: "React & Next.js Advanced Architecture",
        duration: "45 Mins",
        totalMarks: 55,
        questions: [
          {
            id: 1,
            title: "Implement React Context API",
            marks: 10,
            description: "Create a Context Provider and explain how useContext works.",
          },
          {
            id: 2,
            title: "Create Custom useLocalStorage Hook",
            marks: 15,
            description: "Write reusable hook using localStorage.",
          },
          {
            id: 3,
            title: "JWT Authentication Flow",
            marks: 20,
            description: "Explain JWT Authentication with NodeJS.",
          },
          {
            id: 4,
            title: "Redux Toolkit Counter",
            marks: 10,
            description: "Build Counter using Redux Toolkit.",
          },
        ],
      },
      {
        id: "manual-2",
        manualTitle: "Node.js REST API & Express Fundamentals",
        duration: "30 Mins",
        totalMarks: 40,
        questions: [
          {
            id: 1,
            title: "Express Middleware Chain",
            marks: 15,
            description: "Build custom logging and auth middleware in Express.",
          },
          {
            id: 2,
            title: "MongoDB Schema Validation",
            marks: 25,
            description: "Define Mongoose schema with strict field validation.",
          },
        ],
      },
    ],
    [topicName]
  );

  // Selected state initialized dynamically based on URL params
  const [selectedManual, setSelectedManual] = useState(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [ClassicEditor, setClassicEditor] = useState(null);

  // Auto-select topic if passed via URL parameters
  useEffect(() => {
    if (topicId || topicName) {
      const match = manualsList.find(
        (m) =>
          m.id === topicId ||
          (topicName && m.manualTitle.toLowerCase() === topicName.toLowerCase())
      );

      if (match) {
        setSelectedManual(match);
      } else {
        // Fallback: Create dynamic manual based on query params
        setSelectedManual({
          id: topicId || "custom-topic",
          manualTitle: topicName ? decodeURIComponent(topicName) : "Practical Assignment",
          duration: "45 Mins",
          totalMarks: 50,
          questions: [
            {
              id: 1,
              title: `${topicName || "Topic"} Core Exercise 1`,
              marks: 25,
              description: `Complete the practical exercises for ${topicName || "this topic"}. Write full explanations and step-by-step solutions below.`,
            },
            {
              id: 2,
              title: `${topicName || "Topic"} Application Exercise 2`,
              marks: 25,
              description: "Demonstrate practical application and real-world examples in your response.",
            },
          ],
        });
      }
    }
  }, [topicId, topicName, manualsList]);

  useEffect(() => {
    import("@ckeditor/ckeditor5-build-classic").then((mod) => {
      setClassicEditor(() => mod.default);
    });

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleStartManual = (manual) => {
    setSelectedManual(manual);
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);
  };

  const enterFullscreen = async () => {
    if (containerRef.current?.requestFullscreen) {
      await containerRef.current.requestFullscreen();
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const saveAnswer = (data) => {
    setAnswers((prev) => ({
      ...prev,
      [current]: data,
    }));
  };

  const submitManual = () => {
    setSubmitted(true);
  };

  /* ==========================================================
     VIEW 1: LIST OF PRACTICAL MANUALS
  ========================================================== */
  if (!selectedManual) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-amber-50/20 p-6 md:p-8">
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
            <div className="px-4 py-2 rounded-xl bg-orange-100/60 border border-orange-200/50 text-orange-700 font-bold text-xs flex items-center gap-2">
              <BookOpen size={16} />
              {manualsList.length} Practical Manuals
            </div>
          </div>

          {/* Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white shadow-xl shadow-orange-200">
            <div className="relative z-10 max-w-xl space-y-3">
              <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                {courseName ? `${courseName} Practical Exercises` : "Laboratory Practical Exercises"}
              </span>
              <h1 className="text-3xl font-black leading-tight">
                Practical Manuals
              </h1>
              <p className="text-orange-100 text-sm leading-relaxed">
                Select a practical manual from the list below to review the instructions, write your solutions, and submit your work.
              </p>
            </div>
          </div>

          {/* Manual Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {manualsList.map((manual) => (
              <motion.div
                key={manual.id}
                whileHover={{ y: -4 }}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-600 font-black flex items-center justify-center border border-orange-100">
                      <FileText size={20} />
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Clock size={14} className="text-orange-500" />
                      {manual.duration}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {manual.manualTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Contains {manual.questions.length} experiment exercises requiring detailed code & theory solutions.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-2">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Award size={14} className="text-amber-500" />
                      {manual.totalMarks} Total Marks
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <BookOpen size={14} className="text-orange-500" />
                      {manual.questions.length} Questions
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartManual(manual)}
                  className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md hover:shadow-orange-200 transition flex items-center justify-center gap-2"
                >
                  <Play size={16} fill="white" />
                  Start Practical
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const manuals = selectedManual.questions;
  const currentQuestion = manuals[current];
  const completedCount = Object.values(answers).filter((val) => val?.trim()).length;
  const progressPct = (completedCount / manuals.length) * 100;
  const allAttempted = completedCount === manuals.length;

  /* ==========================================================
     SUBMITTED SUCCESS STATE
  ========================================================== */
  if (submitted) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 text-center max-w-md w-full border border-orange-100 shadow-[0_20px_60px_rgba(249,115,22,0.15)] relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-orange-100 opacity-60 blur-2xl pointer-events-none" />
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <CheckCircle2 size={44} />
          </div>
          <h1 className="mt-6 text-2xl font-black text-slate-800">
            Practical Submitted!
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Your instructor will review your submitted practical manual answers.
          </p>
          <button
            onClick={() => setSelectedManual(null)}
            className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md hover:shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            Back to Manuals List
          </button>
        </motion.div>
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
        .ck-editor__editable_inline {
          min-height: 250px;
          border-bottom-left-radius: 0.75rem !important;
          border-bottom-right-radius: 0.75rem !important;
        }
        .ck-toolbar {
          border-top-left-radius: 0.75rem !important;
          border-top-right-radius: 0.75rem !important;
          background: #f8fafc !important;
        }
        .ck.ck-editor__main > .ck-editor__editable:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15) !important;
        }

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
        answers={answers}
        setCurrent={setCurrent}
        search={search}
        setSearch={setSearch}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-main-scroll">
        {/* TOP BAR */}
        <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm px-8 pt-6 pb-2 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSelectedManual(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-orange-600 font-semibold text-sm transition"
          >
            <ArrowLeft size={18} />
            Back to Manuals List
          </button>

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
                    answers={answers}
                  />
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
                  All practical questions completed — great job!
                </motion.div>
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
                      {currentQuestion.title}
                    </h1>
                    <div className="bg-amber-50 text-amber-700 border border-amber-200/80 rounded-xl px-4 py-2 text-xs font-bold shrink-0">
                      {currentQuestion.marks} Marks
                    </div>
                  </div>

                  {/* Instruction Box */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Practical Instruction
                    </h3>
                    <p className="text-slate-700 font-medium text-sm leading-relaxed">
                      {currentQuestion.description}
                    </p>
                  </div>

                  {/* CKEDITOR ANSWER FIELD */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Your Answer
                    </label>
                    <div className="rounded-xl overflow-hidden">
                      {ClassicEditor ? (
                        <CKEditor
                          editor={ClassicEditor}
                          data={answers[current] || ""}
                          config={{
                            placeholder: "Type your detailed solution here...",
                          }}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            saveAnswer(data);
                          }}
                        />
                      ) : (
                        <div className="h-60 border-2 border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 text-sm font-medium">
                          Loading Editor...
                        </div>
                      )}
                    </div>
                  </div>

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
                      <button
                        onClick={() => alert("Draft saved!")}
                        className="px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50 text-slate-700 font-semibold text-sm transition flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save Draft
                      </button>

                      {current === manuals.length - 1 ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={submitManual}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-emerald-200 flex items-center gap-2"
                        >
                          <Send size={16} />
                          Submit Practical
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