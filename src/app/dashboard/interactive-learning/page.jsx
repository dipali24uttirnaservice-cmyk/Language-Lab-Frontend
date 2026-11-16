"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mic,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Play,
  Pause,
  PartyPopper,
  Info,
  AudioWaveform,
} from "lucide-react";

import { interactiveLearningApi } from "@/services/interactiveLearning/interactiveLearningApi";
import StatusModal from "@/app/components/molecules/StatusModal";

// ─────────────────────────────────────────────────────────────────────────────
// AUDIO UTILITY: ENCODE FLOAT32 SAMPLES INTO 16KHZ 16-BIT MONO WAV BLOB
// ─────────────────────────────────────────────────────────────────────────────
function encodeWAV(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(v, offset, str) {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * 1 channel * 2 bytes)
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN STUDENT INTERACTIVE STUDIO COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function InteractiveStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");
  const courseName = searchParams.get("courseName");
  const topicId = searchParams.get("topicId");
  const topicName = searchParams.get("topicName");

  // =========================
  // TASK LIST & CURRENT INDEX
  // =========================
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active task object
  const currentTask = tasks[currentIndex] || null;

  // =========================
  // RECORDING & AUDIO STATE
  // =========================
  const [recordingState, setRecordingState] = useState("idle"); // "idle" | "recording" | "analyzing" | "evaluated"
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [localAudioUrl, setLocalAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const audioElementRef = useRef(null);

  // =========================
  // EVALUATION RESULTS
  // =========================
  const [evaluation, setEvaluation] = useState(null);
  const [attemptsUsed, setAttemptsUsed] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // =========================
  // TTS "LISTEN FIRST" STATE
  // =========================
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [activeTTSWordIndex, setActiveTTSWordIndex] = useState(-1);

  // =========================
  // GUIDED PACING TELEPROMPTER STATE
  // =========================
  const [teleprompterIndex, setTeleprompterIndex] = useState(-1);
  const [isPacerPracticing, setIsPacerPracticing] = useState(false);
  const teleprompterIntervalRef = useRef(null);

  // Status modal
  const [statusData, setStatusData] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
  });

  // =========================
  // FETCH TASKS FOR STUDENT
  // =========================
  useEffect(() => {
    if (!courseId) {
      router.replace("/dashboard");
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        const params = {};
        if (topicId) params.topicId = topicId;

        const res = await interactiveLearningApi.getStudentTasks(courseId, params);
        const list = res.data?.data?.tasks || [];
        setTasks(list);

        if (list.length > 0) {
          // If the task was previously attempted, initialize attempts
          const first = list[0];
          setAttemptsUsed(first.user_attempts ? first.user_attempts + 1 : 1);
        }
      } catch (err) {
        console.error("[InteractiveStudio] Fetch error:", err);
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [courseId, topicId, router]);

  // When switching tasks, reset studio state
  useEffect(() => {
    resetStudioForTask();
  }, [currentIndex]);

  const resetStudioForTask = () => {
    stopRecordingImmediate();
    stopTTS();
    stopPacer();
    setEvaluation(null);
    setAudioBlob(null);
    if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    setLocalAudioUrl(null);
    setRecordingState("idle");
    setRecordingDuration(0);

    const task = tasks[currentIndex];
    if (task) {
      setAttemptsUsed(task.user_attempts ? task.user_attempts + 1 : 1);
    }
  };

  // Pre-calculate words with character positions for live reading highlight
  const paragraphWords = useMemo(() => {
    if (!currentTask?.paragraph) return [];
    const text = currentTask.paragraph;
    const words = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      words.push({
        word: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
    return words;
  }, [currentTask?.paragraph]);

  // =========================
  // "LISTEN FIRST" TTS
  // =========================
  const handleToggleTTS = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeakingTTS) {
      stopTTS();
      return;
    }

    stopPacer();

    if (!currentTask?.paragraph) return;

    const utterance = new SpeechSynthesisUtterance(currentTask.paragraph);
    utterance.rate = 0.95;
    utterance.lang = "en-IN";

    // Track word boundaries for live karaoke reading highlight
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const charIdx = event.charIndex;
        const wordIdx = paragraphWords.findIndex(
          (w) => charIdx >= w.startIndex && charIdx <= w.endIndex
        );
        if (wordIdx !== -1) {
          setActiveTTSWordIndex(wordIdx);
        }
      }
    };

    utterance.onend = () => {
      setIsSpeakingTTS(false);
      setActiveTTSWordIndex(-1);
    };
    utterance.onerror = () => {
      setIsSpeakingTTS(false);
      setActiveTTSWordIndex(-1);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeakingTTS(true);
  };

  const stopTTS = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingTTS(false);
    setActiveTTSWordIndex(-1);
  };

  // =========================
  // GUIDED PACING TELEPROMPTER
  // =========================
  const stopPacer = () => {
    if (teleprompterIntervalRef.current) {
      clearInterval(teleprompterIntervalRef.current);
      teleprompterIntervalRef.current = null;
    }
    setIsPacerPracticing(false);
    setTeleprompterIndex(-1);
  };

  const startPacer = (isPractice = false) => {
    if (teleprompterIntervalRef.current) {
      clearInterval(teleprompterIntervalRef.current);
      teleprompterIntervalRef.current = null;
    }
    stopTTS();
    setTeleprompterIndex(0);
    setIsPacerPracticing(isPractice);

    const targetWpm = currentTask?.target_wpm || 120;
    // Calculate interval ms per word: (60 / targetWpm) * 1000
    const intervalMs = Math.max(120, Math.round((60 / targetWpm) * 1000));

    teleprompterIntervalRef.current = setInterval(() => {
      setTeleprompterIndex((prev) => {
        if (prev + 1 >= paragraphWords.length) {
          if (teleprompterIntervalRef.current) {
            clearInterval(teleprompterIntervalRef.current);
            teleprompterIntervalRef.current = null;
          }
          if (isPractice) setIsPacerPracticing(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
  };

  // =========================
  // MICROPHONE RECORDING (16KHZ MONO PCM)
  // =========================
  const startRecording = async () => {
    stopTTS();
    setEvaluation(null);
    setAudioBlob(null);
    if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    setLocalAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      // Buffer size: 4096 samples
      const scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Clone samples into chunks array
        audioChunksRef.current.push(new Float32Array(inputData));
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(ctx.destination);

      setRecordingDuration(0);
      setRecordingState("recording");
      startPacer(false);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("[MicError]", err);
      setStatusData({
        open: true,
        type: "error",
        title: "Microphone Access Denied",
        message:
          "Please grant microphone permission in your browser to record your voice reading.",
      });
    }
  };

  const stopRecordingAndEvaluate = async () => {
    if (teleprompterIntervalRef.current) {
      clearInterval(teleprompterIntervalRef.current);
      teleprompterIntervalRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Merge Float32 chunks
    const chunks = audioChunksRef.current;
    let totalLength = 0;
    for (const chunk of chunks) totalLength += chunk.length;

    const mergedSamples = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      mergedSamples.set(chunk, offset);
      offset += chunk.length;
    }

    if (mergedSamples.length < 16000 * 0.5) {
      setRecordingState("idle");
      setStatusData({
        open: true,
        type: "error",
        title: "Recording Too Short",
        message: "Please speak for at least 1 second while reading the paragraph.",
      });
      return;
    }

    // Encode to 16kHz WAV Blob
    const wavBlob = encodeWAV(mergedSamples, 16000);
    const wavUrl = URL.createObjectURL(wavBlob);
    setAudioBlob(wavBlob);
    setLocalAudioUrl(wavUrl);
    setRecordingState("analyzing");

    // Send to Vosk Evaluation API
    try {
      const formData = new FormData();
      formData.append("interactiveAudio", wavBlob, `attempt_${Date.now()}.wav`);

      const res = await interactiveLearningApi.evaluateSpeech(
        currentTask._id,
        formData,
      );
      const evalData = res.data?.data || res.data;

      setEvaluation(evalData);
      setRecordingState("evaluated");
    } catch (err) {
      console.error("[VoskEvaluationError]", err);
      setRecordingState("idle");
      setStatusData({
        open: true,
        type: "error",
        title: "Evaluation Failed",
        message:
          err?.response?.data?.message ||
          "Vosk speech analysis could not process the audio. Please try speaking again.",
      });
    }
  };

  const stopRecordingImmediate = () => {
    if (teleprompterIntervalRef.current) {
      clearInterval(teleprompterIntervalRef.current);
      teleprompterIntervalRef.current = null;
    }
    setIsPacerPracticing(false);
    setTeleprompterIndex(-1);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingImmediate();
      stopTTS();
      stopPacer();
      if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // =========================
  // ACTIONS: RETRY & SAVE/NEXT
  // =========================
  const handleRetry = () => {
    if (!currentTask) return;
    const maxRetries = currentTask.max_retries || 3;

    if (attemptsUsed >= maxRetries) {
      setStatusData({
        open: true,
        type: "error",
        title: "Max Retries Reached",
        message: `You have reached the maximum allowed limit of ${maxRetries} attempt(s). Please click 'Save & Next' to submit your result.`,
      });
      return;
    }

    // Increment attempt and reset recording studio for another try
    setAttemptsUsed((prev) => prev + 1);
    stopPacer();
    setEvaluation(null);
    setAudioBlob(null);
    if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    setLocalAudioUrl(null);
    setRecordingState("idle");
    setRecordingDuration(0);
  };

  const handleSaveAndNext = async () => {
    if (!currentTask || !evaluation) return;

    try {
      setIsSubmitting(true);

      const payload = {
        accuracy_score: evaluation.accuracy_score,
        wpm: evaluation.wpm,
        duration_seconds: evaluation.duration_seconds,
        transcribed_text: evaluation.transcribed_text,
        word_analysis: evaluation.word_analysis,
        audio_url: evaluation.audio_url,
        attempts_count: attemptsUsed,
      };

      await interactiveLearningApi.submitSpeech(currentTask._id, payload);

      // Check if there are more tasks in this list
      if (currentIndex + 1 < tasks.length) {
        setStatusData({
          open: true,
          type: "success",
          title: "Attempt Saved!",
          message: `Your score (${evaluation.accuracy_score}%) has been recorded. Moving to the next reading task!`,
        });
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsAllCompleted(true);
      }
    } catch (err) {
      console.error("[SubmitError]", err);
      setStatusData({
        open: true,
        type: "error",
        title: "Submission Error",
        message:
          err?.response?.data?.message ||
          "Could not save your reading task. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // RENDER CONDITIONAL STATES
  // =========================
  if (loadingTasks) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        <p className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
          Loading Interactive Reading Studio...
        </p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
          <AudioWaveform className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            No Reading Tasks Assigned
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Your faculty has not published any interactive reading tasks for this topic yet.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  if (isAllCompleted) {
    return (
      <div className="max-w-2xl mx-auto my-16 bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
          <PartyPopper className="w-10 h-10 animate-bounce" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            All Tasks Completed
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-3">
            Outstanding Job!
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            You have successfully read and submitted all interactive reading passages in this module. Your pronunciation and fluency have been recorded.
          </p>
        </div>
        <button
          onClick={() => router.push(`/dashboard/topics?courseId=${courseId}&courseName=${courseName || ""}`)}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
        >
          Return to Learning Journey <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const maxRetries = currentTask?.max_retries || 3;
  const passingScore = currentTask?.min_accuracy || 75;
  const isPassed = (evaluation?.accuracy_score || 0) >= passingScore;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* ================= NAVIGATION BREADCRUMB ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Topics
        </button>

        {/* Task Counter Badge */}
        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
          <span>Task {currentIndex + 1} of {tasks.length}</span>
          <div className="flex gap-1 ml-2">
            {tasks.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? "bg-orange-500 w-4"
                    : i < currentIndex
                    ? "bg-emerald-500"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ================= HEADER CARD ================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1.5">
            <AudioWaveform className="w-4 h-4 text-orange-600" />
            <span>Interactive Speech & Pronunciation Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            {currentTask.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Course: <strong>{courseName || "English"}</strong> • Topic: <strong>{topicName || currentTask.topic_id?.title || "Reading"}</strong>
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center min-w-[90px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Target WPM</p>
            <p className="text-base font-black text-slate-800 mt-0.5">{currentTask.target_wpm || 120}</p>
          </div>
          <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200/60 text-center min-w-[90px]">
            <p className="text-[10px] font-bold text-orange-500 uppercase">Min Accuracy</p>
            <p className="text-base font-black text-orange-700 mt-0.5">{passingScore}%</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center min-w-[90px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Attempts</p>
            <p className="text-base font-black text-slate-800 mt-0.5">{attemptsUsed} / {maxRetries}</p>
          </div>
        </div>
      </div>

      {/* ================= TARGET PARAGRAPH CARD ================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-md space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Target Reading Passage
            </span>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
              Pace: {currentTask?.target_wpm || 120} WPM
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* "Practice Pacing" Teleprompter Button */}
            <button
              type="button"
              onClick={() => {
                if (isPacerPracticing) {
                  stopPacer();
                } else {
                  startPacer(true);
                }
              }}
              disabled={recordingState === "recording"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isPacerPracticing
                  ? "bg-amber-600 text-white border-amber-700 shadow-md animate-pulse"
                  : "bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border-slate-200"
              }`}
            >
              {isPacerPracticing ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" /> Stop Pacer
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Practice Pacing
                </>
              )}
            </button>

            {/* "Listen First" TTS Speaker Button */}
            <button
              type="button"
              onClick={handleToggleTTS}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isSpeakingTTS
                  ? "bg-orange-600 text-white border-orange-700 shadow-md animate-pulse"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
              }`}
            >
              {isSpeakingTTS ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" /> Stop Reference
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" /> Listen First (Native TTS)
                </>
              )}
            </button>
          </div>
        </div>

        {/* PARAGRAPH TEXT / COLOR-CODED WORD HIGHLIGHTING */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 md:p-8 min-h-[140px]">
          {evaluation?.word_analysis ? (
            /* Word-by-word diff view after evaluation */
            <div className="text-base sm:text-lg md:text-xl leading-loose font-serif">
              {evaluation.word_analysis.map((item, idx) => {
                let badgeClass = "text-slate-700";
                let tooltip = "";

                if (item.status === "correct") {
                  badgeClass =
                    "bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg border border-emerald-300";
                } else if (item.status === "missing") {
                  badgeClass =
                    "bg-rose-100 text-rose-700 line-through px-2 py-0.5 rounded-lg border border-rose-300 opacity-80";
                  tooltip = "Omitted word";
                } else if (item.status === "mispronounced") {
                  badgeClass =
                    "bg-amber-100 text-amber-900 font-bold underline decoration-wavy decoration-amber-500 px-2 py-0.5 rounded-lg border border-amber-300";
                  tooltip = item.spoken
                    ? `Heard: "${item.spoken}"`
                    : "Mispronounced";
                }

                return (
                  <span
                    key={idx}
                    title={tooltip || undefined}
                    className={`inline-block mx-1 transition-all ${badgeClass}`}
                  >
                    {item.expected}
                  </span>
                );
              })}
            </div>
          ) : (
            /* Interactive Word-by-word highlighted paragraph (Teleprompter & TTS) */
            <div className="text-base sm:text-lg md:text-xl leading-loose font-serif text-slate-800">
              {paragraphWords.map((item, idx) => {
                const isPacerCurrent = teleprompterIndex === idx;
                const isPacerPast = teleprompterIndex > idx;
                const isTTSCurrent = isSpeakingTTS && activeTTSWordIndex === idx;
                const isActive = isPacerCurrent || isTTSCurrent;

                return (
                  <span
                    key={idx}
                    className={`inline-block mx-1 px-1.5 py-0.5 rounded-lg transition-all duration-150 select-none ${
                      isActive
                        ? "bg-orange-500 text-white font-extrabold scale-110 shadow-lg shadow-orange-500/30 ring-2 ring-orange-300 z-10"
                        : isPacerPast
                        ? "bg-orange-100/70 text-slate-900 font-medium"
                        : "text-slate-800 hover:bg-orange-50 hover:text-orange-700"
                    }`}
                  >
                    {item.word}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Real-time Pacer / TTS Active Progress Bar */}
        {(teleprompterIndex >= 0 || isSpeakingTTS) && !evaluation && (
          <div className="flex items-center gap-3 pt-1 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-orange-600 font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              {isSpeakingTTS
                ? "Reference Audio Playing"
                : isPacerPracticing
                ? `Practicing Pace (${currentTask?.target_wpm || 120} WPM)`
                : `Teleprompter Active (${currentTask?.target_wpm || 120} WPM)`}
            </span>
            <div className="flex-1 bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-150"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (((isSpeakingTTS ? activeTTSWordIndex : teleprompterIndex) + 1) /
                        Math.max(1, paragraphWords.length)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
            <span className="tabular-nums font-mono text-[11px] shrink-0 text-slate-600">
              Word {(isSpeakingTTS ? activeTTSWordIndex : teleprompterIndex) + 1} of {paragraphWords.length}
            </span>
          </div>
        )}

        {/* Legend / Feedback Explanation */}
        {evaluation?.word_analysis && (
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 px-1 text-slate-500">
            <span className="font-bold text-slate-700">Legend:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              🟢 Correctly Spoken
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              🟡 Mispronounced / Substituted
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              🔴 Missed / Skipped
            </span>
          </div>
        )}
      </div>

      {/* ================= RECORDING STUDIO & RESULTS ================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* EVALUATION RESULTS PANEL */}
        {evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
              isPassed
                ? "bg-emerald-50/60 border-emerald-200"
                : "bg-amber-50/60 border-amber-200"
            }`}
          >
            {/* Accuracy Speedo / Circular Gauge */}
            <div className="flex items-center gap-4">
              <div
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-white shadow-lg ${
                  isPassed
                    ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/20"
                    : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20"
                }`}
              >
                <span className="text-2xl leading-none">{evaluation.accuracy_score}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Accuracy</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {isPassed ? "Pass - Great Pronunciation!" : "Needs Improvement"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target passing threshold: <strong>{passingScore}%</strong>
                </p>
              </div>
            </div>

            {/* Reading Speed & Duration */}
            <div className="flex items-center gap-4 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 min-w-[100px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reading Speed</p>
                <p className="text-base font-black text-slate-800 mt-0.5">{evaluation.wpm} WPM</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 min-w-[100px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Speaking Time</p>
                <p className="text-base font-black text-slate-800 mt-0.5">{evaluation.duration_seconds}s</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* AUDIO PLAYBACK: LISTEN TO RECORDED VOICE */}
        {localAudioUrl && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Your Recorded Audio</p>
                <p className="text-[11px] text-slate-400">Listen back to your voice reading</p>
              </div>
            </div>
            <audio controls src={localAudioUrl} className="h-9 w-full sm:w-72" />
          </div>
        )}

        {/* RECORDING CONTROLS */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {recordingState === "idle" && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={startRecording}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-4 rounded-2xl font-black text-base shadow-xl shadow-orange-500/25 border-b-4 border-orange-700 flex items-center gap-3 cursor-pointer transition-all"
            >
              <Mic className="w-6 h-6 animate-pulse" />
              Start Speaking & Record
            </motion.button>
          )}

          {recordingState === "recording" && (
            <div className="flex flex-col items-center space-y-4">
              {/* Pulsing visual wave */}
              <div className="flex items-center gap-1.5 h-12">
                {[...Array(9)].map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: ["12px", "40px", "16px"] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.08,
                    }}
                    className="w-1.5 bg-orange-500 rounded-full"
                  />
                ))}
              </div>

              {/* Recording timer */}
              <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-lg">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                Recording: {formatTime(recordingDuration)}
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={stopRecordingAndEvaluate}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-black text-base shadow-lg shadow-red-500/25 flex items-center gap-3 cursor-pointer transition-all"
              >
                <Square className="w-5 h-5 fill-white" />
                Stop & Analyze Voice
              </motion.button>
            </div>
          )}

          {recordingState === "analyzing" && (
            <div className="flex flex-col items-center space-y-3 py-6">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="text-sm font-black text-slate-800">
                Vosk AI is analyzing your speech pronunciation...
              </p>
              <p className="text-xs text-slate-400">
                Matching Indian English acoustic patterns and computing fluency...
              </p>
            </div>
          )}
        </div>

        {/* ================= ACTION BUTTONS (RETRY vs SAVE & NEXT) ================= */}
        {recordingState === "evaluated" && evaluation && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            {/* RETRY BUTTON */}
            <div>
              <button
                type="button"
                onClick={handleRetry}
                disabled={attemptsUsed >= maxRetries}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border ${
                  attemptsUsed >= maxRetries
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm cursor-pointer"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                {attemptsUsed >= maxRetries
                  ? `Max Attempts Reached (${maxRetries}/${maxRetries})`
                  : `Retry (${maxRetries - attemptsUsed} retries left)`}
              </button>
            </div>

            {/* SAVE & NEXT BUTTON */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveAndNext}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-3.5 rounded-xl font-black text-sm shadow-lg shadow-emerald-500/25 border-b-2 border-emerald-700 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {currentIndex + 1 < tasks.length
                ? "Save & Next Task"
                : "Save & Complete"}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Status Modal */}
      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={() =>
          setStatusData({ open: false, type: "", title: "", message: "" })
        }
      />
    </div>
  );
}

export default function InteractiveLearningPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      }
    >
      <InteractiveStudioContent />
    </Suspense>
  );
}

