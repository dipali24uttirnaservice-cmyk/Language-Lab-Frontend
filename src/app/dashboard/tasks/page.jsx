"use client";

import { useState, useEffect, useCallback, useMemo,useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckSquare,
  FileText,
  Link2,
  Video,
  Music,
  File,
  Loader2,
  Send,
  Upload,
  Award,
  MessageSquare,
  HelpCircle,
  Play,
  RotateCcw,
   CheckCircle2, 
  Clock, 
  Sparkles,
  ChevronRight, 
  Minimize2,
  Maximize2,
  ChevronLeft 
} from "lucide-react";

import { studentTaskApi } from "@/services/task/studentTaskApi";
import { getMatchPairs, hasAnswer, answerToString, shuffledPool } from "@/utils/questionAnswers";

const TYPE_META = {
  text: { label: "Text", Icon: FileText, gradient: "from-blue-500 to-blue-600" },
  link: { label: "Link", Icon: Link2, gradient: "from-slate-500 to-slate-600" },
  audio: { label: "Audio", Icon: Music, gradient: "from-teal-500 to-teal-600" },
  video: { label: "Video", Icon: Video, gradient: "from-purple-500 to-purple-600" },
  document: { label: "Document", Icon: File, gradient: "from-amber-500 to-amber-600" },
};

const STATUS_META = {
  pending: { label: "Pending", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  submitted: { label: "Submitted", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  late: { label: "Late", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  reviewed: { label: "Reviewed", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  overdue: { label: "Overdue", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

function taskStatusKey(task) {
  const submission = task.my_submission;
  return task.overdue && !submission ? "overdue" : submission?.status || "pending";
}

/* ==========================================================
   MAIN PAGE
========================================================== */
export default function StudentTasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const topicId = searchParams.get("topicId");
  const topicName = searchParams.get("topicName");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  // Reflects the currently open task in the URL as `lessonName` so the
  // global breadcrumb (which reads searchParams, not component state) shows
  // it as the final crumb, matching every other module page.
  const syncLessonNameInUrl = useCallback(
    (lessonName) => {
      const params = new URLSearchParams(searchParams.toString());
      if (lessonName) {
        params.set("lessonName", lessonName);
      } else {
        params.delete("lessonName");
      }
      router.replace(`/dashboard/tasks?${params.toString()}`);
    },
    [searchParams, router],
  );

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (courseId) params.courseId = courseId;
      if (topicId) params.topicId = topicId;
      const res = await studentTaskApi.getMine(params);
      setTasks(res.data?.data?.tasks || []);
    } catch (error) {
      console.error("Get My Tasks Error:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId, topicId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSubmitted = (taskId, submission) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, my_submission: submission, overdue: false } : t)),
    );
    setSelectedTask((prev) => (prev && prev._id === taskId ? { ...prev, my_submission: submission } : prev));
  };

  if (selectedTask) {
    return (
      <TaskWorkspace
        task={selectedTask}
        onBack={() => {
          setSelectedTask(null);
          syncLessonNameInUrl(null);
        }}
        onSubmitted={(submission) => handleSubmitted(selectedTask._id, submission)}
      />
    );
  }

  const pendingCount = tasks.filter((t) => !t.my_submission).length;

  return (
    <div className="relative min-h-screen p-6 md:p-8 space-y-8 overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-teal-50/40 to-emerald-100/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-500/10 blur-3xl" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Assignments
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {topicName ? `${topicName} Tasks` : "My Tasks"}
          </h1>
        </div>
        <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          {pendingCount} pending of {tasks.length}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-20 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-400 text-sm font-semibold">
            No tasks have been assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskRow
              key={task._id}
              task={task}
              onSelect={() => {
                setSelectedTask(task);
                syncLessonNameInUrl(task.title);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   WIDE ROW — same list-item language as the Practical Manual /
   Exercise / Text / Audio module rows.
========================================================== */
function WideRow({ onClick, iconBg, icon, eyebrow, eyebrowClass, title, middle, right }) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex items-center gap-4 cursor-pointer"
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
          <h3 className="font-extrabold text-sm md:text-base text-slate-900 truncate tracking-tight group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>
        </div>

        {middle && <div className="hidden md:block md:col-span-4">{middle}</div>}
        <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
          {right}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onSelect }) {
  const meta = TYPE_META[task.type] || TYPE_META.text;
  const TypeIcon = meta.Icon;
  const submission = task.my_submission;
  const statusMeta = STATUS_META[taskStatusKey(task)];

  return (
    <WideRow
      onClick={onSelect}
      iconBg={`bg-gradient-to-br ${meta.gradient} group-hover:brightness-110`}
      icon={<TypeIcon size={18} />}
      eyebrow={statusMeta.label}
      eyebrowClass={`${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
      title={task.title}
      middle={
        <p className="text-xs text-slate-400 font-medium truncate">
          {task.course_id?.course_name || "Course"} · {meta.label}
          {task.due_date && ` · Due ${new Date(task.due_date).toLocaleDateString()}`}
        </p>
      }
      right={
        <>
          {submission?.grade != null && (
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <Award size={12} className="text-emerald-500" />
              <span>{submission.grade} Pts</span>
            </div>
          )}
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
            {submission ? (
              <RotateCcw className="group-hover:rotate-45 transition-transform" size={12} />
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
   TASK WORKSPACE — dedicated detail view, same shell language
   as the Practical Manual workspace (top bar + content card).
========================================================== */









export function TaskWorkspace({ task, onBack, onSubmitted }) {
  const meta = TYPE_META[task.type] || TYPE_META.text;
  const TypeIcon = meta.Icon;
  const submission = task.my_submission;
  const statusMeta = STATUS_META[taskStatusKey(task)];

  const [isExpanded, setIsExpanded] = useState(true);
  
  // Track the current step index for sequential card navigation
  const [currentStep, setCurrentStep] = useState(0);

  // Define steps dynamically based on available task content
  const steps = [
    {
      id: 'overview',
      title: 'Overview & Instructions',
    },
    ...(task.type && (task.text_content || task.link_url || task.media_url) ? [{
      id: 'content',
      title: 'Task Material',
    }] : []),
    {
      id: 'submission',
      title: submission?.status === 'reviewed' ? 'Evaluation & Review' : 'Your Submission',
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
      await containerRef.current.requestFullscreen();
    }
  };
  
  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/30 overflow-y-auto flex flex-col transition-all ${
        isFullscreen ? "h-screen w-screen p-2 md:p-4 bg-white" : "min-h-screen p-4 md:p-8"
      }`}
    >
      <div className={`mx-w-4xl mx-auto space-y-6 flex-1 flex flex-col w-full ${isFullscreen ? "max-w-none h-full space-y-3 p-2" : ""}`}>
        
        {/* Top Navigation & Context Bar */}
        <div className="flex items-center justify-between shrink-0">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-semibold text-sm transition-all duration-200 bg-white/80 hover:bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200/60"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Tasks
          </button>
          
          <div className="flex items-center gap-2">
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
        </div>

        {/* Main Workspace Card */}
        <div className={`relative overflow-hidden border border-emerald-100/80 bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(16,185,129,0.07)] transition-all flex flex-col ${
          isFullscreen ? "flex-1 rounded-3xl p-6 md:p-8 overflow-y-auto" : "rounded-[2.5rem] p-6 md:p-10"
        }`}>
          
          {/* Ambient Background Glows */}
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl pointer-events-none" />

          <div className="relative space-y-8 flex-1 flex flex-col justify-between">
            
            <div className="space-y-8">
              {/* STEP 0: Overview & Instructions */}
              {currentStep === 0 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      <span className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0 transform hover:scale-105 transition-transform`}>
                        <TypeIcon size={28} />
                      </span>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} shadow-sm`}>
                            {statusMeta.label}
                          </span>
                          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {meta.label}
                          </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{task.title}</h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                          <Clock size={14} />
                          {task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : "No due date"}
                        </p>
                      </div>
                    </div>

                    {submission?.grade != null && (
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50/80 px-4 py-3 rounded-2xl border border-emerald-200/60 shadow-inner shrink-0 self-start md:self-auto">
                        <Award size={20} className="text-emerald-600 animate-pulse" />
                        <div>
                          <p className="text-[10px] uppercase text-emerald-500 font-semibold">Score</p>
                          <p className="text-base">{submission.grade} Pts</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {task.description && (
                      <p className="text-base text-slate-600 leading-relaxed font-normal">{task.description}</p>
                    )}

                    {task.instructions && (
                      <div className="bg-gradient-to-br from-slate-50 to-emerald-50/20 rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={14} className="text-emerald-600" />
                          Instructions & Guidelines
                        </p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{task.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 1: Content Renderers (Text, Link, Media) - Only renders if content exists */}
              {steps[currentStep]?.id === 'content' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-lg font-bold text-slate-800">Task Material & Resources</h3>
                  {task.type === "text" && task.text_content && (
                    <div
                      className="bg-white rounded-2xl p-6 border border-slate-200/60 text-sm text-slate-700 prose prose-sm max-w-none shadow-sm"
                      dangerouslySetInnerHTML={{ __html: task.text_content }}
                    />
                  )}
                  
                  {task.type === "link" && task.link_url && (
                    <a
                      href={task.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-3 text-sm font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200 px-5 py-3 rounded-2xl hover:bg-emerald-100/80 transition-all shadow-sm"
                    >
                      <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <span>Open External Resource</span>
                      <ChevronRight size={16} className="text-emerald-500 transition-transform group-hover:translate-x-1" />
                    </a>
                  )}

                  {["audio", "video", "document"].includes(task.type) && task.media_url && (
                    <div className="bg-slate-900/5 rounded-3xl p-4 border border-slate-200/60">
                      {task.type === "audio" && <audio controls src={task.media_url} className="w-full" />}
                      {task.type === "video" && (
                        <video controls src={task.media_url} className="w-full rounded-2xl shadow-md max-h-[420px] object-cover" />
                      )}
                      {task.type === "document" && (
                        <a
                          href={task.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-3 text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-5 py-3 rounded-2xl hover:bg-amber-100 transition-all shadow-sm"
                        >
                          <div className="p-2 bg-amber-600 text-white rounded-xl">
                            <FileText className="w-4 h-4" />
                          </div>
                          View Document Asset
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* FINAL STEP: Submission Section / Review State */}
              {steps[currentStep]?.id === 'submission' && (
                <div className="space-y-6 animate-fadeIn">
                  {submission?.status === "reviewed" ? (
                    <div className="space-y-6">
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 space-y-3 shadow-sm">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 
                          Instructor Evaluation Completed
                          {submission.grade != null && ` — ${submission.grade} marks`}
                        </p>
                        {submission.feedback && (
                          <p className="text-sm text-emerald-900 bg-white/60 p-4 rounded-2xl border border-emerald-100/60 leading-relaxed">
                            "{submission.feedback}"
                          </p>
                        )}
                      </div>
                      {task.questions?.length > 0 && (
                        <TaskQuestionsReview questions={task.questions} answers={submission.answers} />
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
                      <SubmissionForm task={task} submission={submission} onSubmitted={onSubmitted} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
                  currentStep === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
                }`}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all ${
                  currentStep === steps.length - 1
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                }`}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Turns a stored given_answer string back into the structured shape
// QuestionInput/ChoiceOptions/SequenceBuilder/MatchBuilder expect, so a
// resubmit starts from what was answered before.
function parseGivenAnswer(question, given_answer) {
  if (!given_answer) return null;
  switch (question.question_type) {
    case "mcq":
    case "true_false":
    case "fill_blank":
    case "spell_word":
      return { value: given_answer };
    case "short_answer":
      return { text: given_answer };
    case "recorder": {
      const order = given_answer
        .split(",")
        .map((word) => (question.options || []).indexOf(word.trim()))
        .filter((i) => i !== -1);
      return { order };
    }
    case "match": {
      const pairs = {};
      given_answer
        .split("|")
        .filter(Boolean)
        .forEach((entry) => {
          const [left, right] = entry.split(":");
          pairs[left] = right;
        });
      return { pairs };
    }
    default:
      return null;
  }
}

function SubmissionForm({ task, submission, onSubmitted }) {
  const [text, setText] = useState(submission?.submitted_text || "");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Track the current active question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState(() => {
    const prefilled = {};
    (submission?.answers || []).forEach((a) => {
      const question = task.questions?.[a.question_index];
      if (question) prefilled[a.question_index] = parseGivenAnswer(question, a.given_answer);
    });
    return prefilled;
  });

  const totalQuestions = task.questions?.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answeredEntries = (task.questions || [])
      .map((q, idx) => [idx, q])
      .filter(([idx, q]) => hasAnswer(q, answers[idx]));

    if (!text.trim() && !file && answeredEntries.length === 0) {
      setError("Add a file, write a response, or answer the questions before submitting.");
      return;
    }
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("submitted_text", text.trim());
      if (file) formData.append("taskSubmissionMedia", file);
      if (answeredEntries.length > 0) {
        const payload = answeredEntries.map(([idx, q]) => ({
          question_index: idx,
          given_answer: answerToString(q, answers[idx]),
        }));
        formData.append("answers", JSON.stringify(payload));
      }
      const res = await studentTaskApi.submit(task._id, formData);
      onSubmitted(res.data?.data);
      setSuccess(true);
    } catch (err) {
      console.error("Submit Task Error:", err);
      setError(err?.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1 border-t border-slate-100">
      {submission && (
        <p className="text-xs font-semibold text-sky-600 flex items-center gap-1.5 pt-3">
          <Send className="w-3.5 h-3.5" /> Already submitted — resubmitting will replace it.
        </p>
      )}

      {/* Checkpoint Questions Step-by-Step View */}
      {totalQuestions > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Checkpoint Question {currentQuestionIndex + 1} of {totalQuestions}
            </label>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {task.questions[currentQuestionIndex].marks || 1} mark{(task.questions[currentQuestionIndex].marks || 1) > 1 ? "s" : ""}
            </span>
          </div>

          {/* Active Question Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 shadow-sm animate-fadeIn">
            <p className="text-sm font-bold text-slate-800 leading-relaxed">
              {currentQuestionIndex + 1}. {task.questions[currentQuestionIndex].question_text}
            </p>
            <QuestionInput
              question={task.questions[currentQuestionIndex]}
              answer={answers[currentQuestionIndex]}
              setAnswer={(next) => setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: next }))}
            />
          </div>

          {/* Question Navigation & Submit Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentQuestionIndex === 0
                  ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
              }`}
            >
              Previous Question
            </button>

            {/* Render Next Button if not on the last question, or Submit Button if it is the last question */}
            {!isLastQuestion ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                Next Question
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-60 flex items-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {submitting ? "Submitting..." : submission ? "Resubmit" : "Submit Task"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fallback Submit Button if there are no checkpoint questions at all */}
      {totalQuestions === 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100 animate-fadeIn">
          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          {success && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" /> Submitted successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-60 flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Submitting..." : submission ? "Resubmit" : "Submit Task"}
          </button>
        </div>
      )}

      {/* Global Form Error & Success Messages on Last Question */}
      {totalQuestions > 0 && isLastQuestion && (
        <div className="pt-2 space-y-2">
          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          {success && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" /> Submitted successfully.
            </p>
          )}
        </div>
      )}
    </form>
  );
}

/* ==========================================================
   CHECKPOINT QUESTION ANSWER INPUTS — same components/interaction
   as the Exercise module's Challenge Activity quiz, recolored to
   Task's emerald theme.
========================================================== */
function ChoiceOptions({ question, answer, setAnswer, grid = false }) {
  return (
    <div className={grid ? "grid grid-cols-2 gap-3" : "space-y-2.5"}>
      {question.options.map((opt, i) => (
        <button
          type="button"
          key={i}
          onClick={() => setAnswer({ value: opt })}
          className={`w-full text-left p-3.5 rounded-xl border-2 text-sm font-semibold transition-all ${
            answer?.value === opt
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
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
      className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none text-sm"
      placeholder={placeholder}
    />
  );
}

function ShortAnswerInput({ answer, setAnswer }) {
  return (
    <textarea
      rows={3}
      value={answer?.text || ""}
      onChange={(e) => setAnswer({ text: e.target.value })}
      className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none resize-none text-sm"
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
    <div className="space-y-2.5">
      <div className="min-h-14 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 flex flex-wrap items-center gap-2 p-3">
        {order.length === 0 && (
          <span className="text-sm text-slate-400 italic">Tap items below to build your answer…</span>
        )}
        {order.map((id, pos) => (
          <button
            type="button"
            key={pos}
            onClick={() => setAnswer({ order: order.filter((_, i) => i !== pos) })}
            className="px-3.5 py-2 rounded-lg border-2 border-emerald-400 bg-emerald-100 text-emerald-800 font-semibold text-sm hover:border-emerald-500"
          >
            {question.options[id]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setAnswer({ order: [...order, item.id] })}
            className="px-3.5 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-emerald-300"
          >
            {item.value}
          </button>
        ))}
      </div>
    </div>
  );
}

const MATCH_PAIR_COLORS = [
  { border: "border-blue-400", bg: "bg-blue-50", text: "text-blue-700" },
  { border: "border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
  { border: "border-purple-400", bg: "bg-purple-50", text: "text-purple-700" },
  { border: "border-pink-400", bg: "bg-pink-50", text: "text-pink-700" },
  { border: "border-amber-400", bg: "bg-amber-50", text: "text-amber-700" },
];

function MatchBuilder({ question, answer, setAnswer }) {
  const pairs = answer?.pairs || {};
  const activeLeft = answer?.activeLeft || null;

  const matchPairs = useMemo(() => getMatchPairs(question), [question]);
  const rightPool = useMemo(() => shuffledPool(matchPairs.map((p) => p.right)), [matchPairs]);
  const usedRights = new Set(Object.values(pairs));

  const getPairColor = (left) => {
    const index = matchPairs.findIndex((item) => item.left === left);
    return MATCH_PAIR_COLORS[index % MATCH_PAIR_COLORS.length];
  };
  const getMatchedLeft = (right) => Object.keys(pairs).find((left) => pairs[left] === right);
  const pickLeft = (left) => {
    if (pairs[left]) return;
    setAnswer({ pairs, activeLeft: left });
  };
  const pickRight = (right) => {
    if (!activeLeft) return;
    setAnswer({ pairs: { ...pairs, [activeLeft]: right }, activeLeft: null });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {matchPairs.map((p) => {
          const isPaired = !!pairs[p.left];
          const isActive = activeLeft === p.left;
          const color = getPairColor(p.left);
          return (
            <button
              type="button"
              key={p.left}
              onClick={() => pickLeft(p.left)}
              disabled={isPaired}
              className={`w-full text-left p-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : isPaired
                  ? `${color.border} ${color.bg} ${color.text}`
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
              }`}
            >
              {p.left}
              {isPaired && <span className="ml-2">→ {pairs[p.left]}</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {rightPool.map((item) => {
          const matchedLeft = getMatchedLeft(item.value);
          const color = matchedLeft ? getPairColor(matchedLeft) : null;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => pickRight(item.value)}
              disabled={usedRights.has(item.value)}
              className={`w-full text-left p-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                usedRights.has(item.value)
                  ? `${color?.border || "border-slate-100"} ${color?.bg || "bg-slate-50"} ${color?.text || "text-slate-300"}`
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
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
    case "recorder":
      return <SequenceBuilder question={question} answer={answer} setAnswer={setAnswer} />;
    case "spell_word":
      return <ChoiceOptions question={question} answer={answer} setAnswer={setAnswer} />;
    case "match":
      return <MatchBuilder question={question} answer={answer} setAnswer={setAnswer} />;
    default:
      return <TextAnswerInput answer={answer} setAnswer={setAnswer} />;
  }
}

// Turns the compact string stored/graded against back into something
// readable for the review screen (same convention as Exercise's review).
function prettifyAnswer(question, raw) {
  if (raw === undefined || raw === null || raw === "") return "(no answer)";
  switch (question?.question_type) {
    case "recorder":
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

/* ==========================================================
   READ-ONLY QUESTIONS REVIEW (once graded)
========================================================== */
function TaskQuestionsReview({ questions, answers }) {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const answerByIndex = {};
  
  (answers || []).forEach((a) => {
    answerByIndex[a.question_index] = a.given_answer;
  });

  const totalQuestions = questions?.length || 0;
  if (totalQuestions === 0) return null;

  const currentQuestion = questions[currentReviewIndex];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> Checkpoint Review ({currentReviewIndex + 1} of {totalQuestions})
        </p>
      </div>

      {/* Review Active Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 shadow-sm animate-fadeIn">
        <p className="text-sm font-bold text-slate-800 leading-relaxed">
          {currentReviewIndex + 1}. {currentQuestion.question_text}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Your answer:{" "}
          <span className="font-semibold text-slate-700">
            {prettifyAnswer(currentQuestion, answerByIndex[currentReviewIndex])}
          </span>
        </p>
      </div>

      {/* Review Pagination Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          disabled={currentReviewIndex === 0}
          onClick={() => setCurrentReviewIndex((prev) => Math.max(0, prev - 1))}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentReviewIndex === 0
              ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
          }`}
        >
          Previous Question
        </button>

        <button
          type="button"
          disabled={currentReviewIndex === totalQuestions - 1}
          onClick={() => setCurrentReviewIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentReviewIndex === totalQuestions - 1
              ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          }`}
        >
          Next Question
        </button>
      </div>
    </div>
  );
}
