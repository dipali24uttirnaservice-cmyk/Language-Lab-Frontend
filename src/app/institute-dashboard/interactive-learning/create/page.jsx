"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AudioWaveform,
  BookOpen,
  Layers,
  Volume2,
  VolumeX,
  Loader2,
  Award,
  Clock,
  Mic,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { courseApi } from "@/services/course/courseApi";
import { topicApi } from "@/services/topic/topicApi";
import { interactiveLearningApi } from "@/services/interactiveLearning/interactiveLearningApi";
import StatusModal from "@/app/components/molecules/StatusModal";

export default function CreateInteractiveTaskPage() {
  const router = useRouter();

  // =========================
  // STATES
  // =========================
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const [formData, setFormData] = useState({
    course_id: "",
    topic_id: "",
    title: "",
    paragraph: "",
    max_retries: 3,
    target_wpm: 120,
    min_accuracy: 75,
  });

  const [isSpeakingPreview, setIsSpeakingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [statusData, setStatusData] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
    onClose: null,
  });

  // =========================
  // FETCH COURSES
  // =========================
  useEffect(() => {
    setCoursesLoading(true);
    courseApi
      .getCourses()
      .then((res) => {
        const all = res.data?.data?.courses || [];
        const active = all.filter((c) => c.is_downloaded);
        setCourses(active);
        if (active.length > 0) {
          setFormData((prev) => ({ ...prev, course_id: active[0]._id }));
        }
      })
      .catch((err) => {
        console.error("Fetch courses error:", err);
      })
      .finally(() => setCoursesLoading(false));
  }, []);

  // =========================
  // FETCH TOPICS ON COURSE CHANGE
  // =========================
  useEffect(() => {
    if (!formData.course_id) {
      setTopics([]);
      setFormData((prev) => ({ ...prev, topic_id: "" }));
      return;
    }

    setTopicsLoading(true);
    topicApi
      .getTopics(formData.course_id)
      .then((res) => {
        const list = res.data?.data || [];
        setTopics(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, topic_id: list[0]._id }));
        } else {
          setFormData((prev) => ({ ...prev, topic_id: "" }));
        }
      })
      .catch((err) => {
        console.error("Fetch topics error:", err);
        setTopics([]);
      })
      .finally(() => setTopicsLoading(false));
  }, [formData.course_id]);

  // =========================
  // TTS PREVIEW (BROWSER SPEECH SYNTHESIS)
  // =========================
  const handleTogglePreviewTTS = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeakingPreview) {
      window.speechSynthesis.cancel();
      setIsSpeakingPreview(false);
      return;
    }

    if (!formData.paragraph || !formData.paragraph.trim()) return;

    const utterance = new SpeechSynthesisUtterance(formData.paragraph);
    utterance.rate = 0.95;
    utterance.lang = "en-IN";

    utterance.onend = () => setIsSpeakingPreview(false);
    utterance.onerror = () => setIsSpeakingPreview(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeakingPreview(true);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Word count & estimate
  const wordCount = useMemo(() => {
    if (!formData.paragraph) return 0;
    return formData.paragraph.trim().split(/\s+/).filter(Boolean).length;
  }, [formData.paragraph]);

  const estimatedReadingTime = useMemo(() => {
    if (wordCount === 0) return 0;
    const wpm = formData.target_wpm || 120;
    return Math.ceil((wordCount / wpm) * 60);
  }, [wordCount, formData.target_wpm]);

  // =========================
  // SUBMIT HANDLER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setStatusData({
        open: true,
        type: "error",
        title: "Title Required",
        message: "Please enter a title for the reading task.",
      });
      return;
    }

    if (!formData.course_id) {
      setStatusData({
        open: true,
        type: "error",
        title: "Course Required",
        message: "Please select a course for this task.",
      });
      return;
    }

    if (!formData.topic_id) {
      setStatusData({
        open: true,
        type: "error",
        title: "Topic Required",
        message: "Please select a topic for this task.",
      });
      return;
    }

    if (!formData.paragraph.trim()) {
      setStatusData({
        open: true,
        type: "error",
        title: "Paragraph Required",
        message: "Please provide the target paragraph text for students to read.",
      });
      return;
    }

    if (wordCount > 100) {
      setStatusData({
        open: true,
        type: "error",
        title: "Paragraph Word Limit Exceeded",
        message: `The paragraph cannot exceed 100 words. It currently contains ${wordCount} words. Please shorten it by ${wordCount - 100} word(s) before saving.`,
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await interactiveLearningApi.createTask(formData);
      const created = res.data?.data || res.data;
      const createdId = created?._id || created?.task?._id;

      setStatusData({
        open: true,
        type: "success",
        title: "Task Created Successfully",
        message: "Interactive paragraph reading task has been created. Proceeding to assign departments and batches...",
        onClose: () => {
          if (createdId) {
            router.push(`/institute-dashboard/interactive-learning/assign/${createdId}`);
          } else {
            router.push("/institute-dashboard/interactive-learning");
          }
        },
      });
    } catch (error) {
      console.error("Create task error:", error);
      setStatusData({
        open: true,
        type: "error",
        title: "Submission Error",
        message:
          error?.response?.data?.message ||
          "Failed to create interactive task. Please verify your connection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/institute-dashboard/interactive-learning")}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interactive Tasks
        </button>

        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase inline-flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-orange-600" />
          Vosk Speech Studio
        </span>
      </div>

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Create <span className="text-orange-600">Reading Task</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure a paragraph reading exercise for speech-to-text accuracy analysis, retry limits, and WPM tracking.
        </p>
      </div>

      {/* ================= FORM CARD CONTAINER ================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: TASK INFO & CURRICULUM */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
              <BookOpen className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                1. Curriculum & Task Details
              </span>
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Passage 1: Professional Self-Introduction"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Course & Topic Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Course *
                </label>
                <select
                  required
                  value={formData.course_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      course_id: e.target.value,
                      topic_id: "",
                    })
                  }
                  disabled={coursesLoading}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.course_name || c.title || c.name || "Course"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Topic *
                </label>
                <select
                  required
                  value={formData.topic_id}
                  onChange={(e) =>
                    setFormData({ ...formData, topic_id: e.target.value })
                  }
                  disabled={!formData.course_id || topicsLoading}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="">
                    {topicsLoading
                      ? "Loading topics..."
                      : !formData.course_id
                      ? "Choose Course First"
                      : "Select Topic"}
                  </option>
                  {topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PARAGRAPH TEXT & SPEECH PREVIEW */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  2. Target Reading Passage
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Max 100 words
                </span>
              </div>

              {/* TTS Listen Reference Button */}
              <button
                type="button"
                onClick={handleTogglePreviewTTS}
                disabled={!formData.paragraph.trim()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSpeakingPreview ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" /> Stop Voice
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" /> Listen Reference (TTS)
                  </>
                )}
              </button>
            </div>

            <div>
              <textarea
                required
                rows={6}
                placeholder="Enter or paste the paragraph text that the student will read aloud into their microphone (maximum 100 words). The Vosk Speech-to-Text model will analyze student voice accuracy word-by-word against this text..."
                value={formData.paragraph}
                onChange={(e) =>
                  setFormData({ ...formData, paragraph: e.target.value })
                }
                className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium text-slate-800 focus:outline-none transition-all leading-relaxed resize-none font-serif ${
                  wordCount > 100
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20"
                    : "border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                }`}
              />

              {/* Metrics Bar below text area */}
              <div className="flex flex-wrap items-center justify-between text-xs mt-2 px-1 gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    Word Count:{" "}
                    <strong
                      className={`font-black ${
                        wordCount > 100
                          ? "text-rose-600"
                          : wordCount > 85
                          ? "text-amber-600"
                          : "text-slate-800"
                      }`}
                    >
                      {wordCount} / 100 words
                    </strong>
                  </span>
                  {wordCount > 100 && (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      Exceeds limit by {wordCount - 100} word{wordCount - 100 > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-slate-400">
                  Est. Reading Time:{" "}
                  <strong className="text-slate-700 font-bold">
                    ~{estimatedReadingTime} seconds
                  </strong>{" "}
                  (@ {formData.target_wpm || 120} WPM)
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: ASSESSMENT & RETRY RULES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
              <Award className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                3. Evaluation & Retry Rules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* RETRY LIMITS DROPDOWN: 1 to 5 options */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Allowed Retries *
                </label>
                <select
                  value={formData.max_retries}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_retries: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                >
                  <option value={1}>1 Attempt (No Retries)</option>
                  <option value={2}>2 Attempts (1 Retry)</option>
                  <option value={3}>3 Attempts (2 Retries)</option>
                  <option value={4}>4 Attempts (3 Retries)</option>
                  <option value={5}>5 Attempts (4 Retries)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Select between 1 to 5 allowed student attempts before submission.
                </p>
              </div>

              {/* TARGET WPM */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target WPM (Speed)
                </label>
                <input
                  type="number"
                  min={60}
                  max={250}
                  value={formData.target_wpm}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_wpm: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-[11px] text-slate-400">
                  Expected natural reading pace (standard: 100 - 140 WPM).
                </p>
              </div>

              {/* MIN ACCURACY % */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Passing Accuracy %
                </label>
                <input
                  type="number"
                  min={40}
                  max={100}
                  value={formData.min_accuracy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_accuracy: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-[11px] text-slate-400">
                  Minimum pronunciation match score required to pass.
                </p>
              </div>
            </div>
          </div>

          {/* ================= ACTIONS BAR ================= */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/institute-dashboard/interactive-learning")}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting || wordCount > 100}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-black text-sm shadow-md shadow-orange-500/20 border-b-2 border-orange-700 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting
                ? "Saving Reading Task..."
                : wordCount > 100
                ? "Word Limit Exceeded (Max 100)"
                : "Save Reading Task"}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Status Modal Component */}
      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={() => {
          setStatusData({ open: false, type: "", title: "", message: "", onClose: null });
          if (statusData.onClose) statusData.onClose();
        }}
      />
    </div>
  );
}

