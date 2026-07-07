"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Play,
  Headphones,
  FileText,
  BookOpen,
  Award,
  Clock,
  ArrowLeft,
  GraduationCap,
  Volume2,
  User,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { moduleApi } from "@/services/topic/topicApi";

const CONTENT_TYPES = [
  { id: "all", label: "All Content", icon: BookOpen },
  { id: "video", label: "Videos", icon: Play },
  { id: "audio", label: "Audios", icon: Headphones },
  { id: "exercise", label: "Exercises", icon: Award },
  { id: "text", label: "Readings", icon: FileText },
  { id: "vocabulary", label: "Vocab", icon: BookOpen },
];

export default function ModuleListPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = params?.type;
  const subtopicId = params?.subtopicId;

  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState(type || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [resultData, setResultData] = useState(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // To store answers
  // Add this near your other state declarations
  const startTimeRef = React.useRef(Date.now());
  useEffect(() => {
    if (type) {
      setActiveTab(type);
    }
  }, [type]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const res = await moduleApi.getModulesBySubtopic(type, subtopicId);
        const fetchedData = res?.data?.data || res?.data || [];
        setModules(fetchedData);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [type, subtopicId]);

  const filteredModules = useMemo(() => {
    if (!Array.isArray(modules)) return [];
    return modules
      .filter((mod) => {
        if (!mod) return false;
        const actualType = mod.module_type || "";
        const matchesTab = activeTab === "all" || actualType === activeTab || type === actualType;
        const matchesSearch =
          mod.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mod.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "title" && a?.title && b?.title) {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [modules, activeTab, searchQuery, sortBy, type]);

  const videoModules = useMemo(() => {
    if (!Array.isArray(modules)) return [];
    return modules.filter((item) => item && (item.module_type || type) === "video");
  }, [modules, type]);

  const audioModules = useMemo(() => {
    if (!Array.isArray(modules)) return [];
    return modules.filter((item) => item && (item.module_type || type) === "audio");
  }, [modules, type]);

  const textModules = useMemo(() => {
    if (!Array.isArray(modules)) return [];
    return modules.filter((item) => item && (item.module_type || type) === "text");
  }, [modules, type]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const currentModuleType = selectedModule?.module_type || type;

  // Inside ModuleListPage component...
  const handleSubmit = async () => {
    const formattedAnswers = Object.keys(userAnswers).map((index) => ({
      question_index: Number(index),
      given_answer: userAnswers[index],
    }));

    const timeSpent = Math.floor(
      (Date.now() - startTimeRef.current) / 1000
    );

    const payload = {
      answers: formattedAnswers,
      time_spent_sec: timeSpent,
    };

    try {
      const response = await moduleApi.submitExercise(
        selectedModule._id,
        payload
      );

      console.log("Exercise Submit Response:", response);

      // Get the attempt object
      const attempt =
        response?.data?.data?.attempt ||
        response?.data?.attempt ||
        response?.attempt ||
        response?.data; console.log("Attempt =", attempt);
      console.log("Score =", attempt?.score);
      console.log("ResultData before set =", resultData);

      if (attempt) {
        console.log("Attempt:", attempt);

        setResultData({
          score: attempt.score,
          max_score: attempt.max_score,
          accuracy: attempt.accuracy,
          is_passed: attempt.is_passed,
        });

        setIsQuizActive(false);
        setShowResults(true);
      } else {
        console.error("Attempt data not found.", response);
        alert("Unable to load result.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Could not submit answers. Please try again.");
    }
  };
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 text-slate-800 p-4 md:p-6 font-sans antialiased overflow-x-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[150px] pointer-events-none" />

      <div className="max-w-[1700px] mx-auto space-y-8 relative z-10">

        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div className="flex items-center gap-3.5">
            {selectedModule && (
              <button
                onClick={() => setSelectedModule(null)}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm rounded-xl transition-all text-slate-600 active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {selectedModule
                  ? currentModuleType === "video"
                    ? "Now Playing"
                    : currentModuleType === "audio"
                      ? "Audio Lesson"
                      : currentModuleType === "exercise"
                        ? "Quiz Overview"
                        : "Reading Lesson"
                  : "Explore Lessons"}
              </h1>

              <div className="hidden md:flex items-center bg-orange-500/[0.04] backdrop-blur-xl px-3 py-1 rounded-full border border-orange-500/20 shadow-[inset_0_1px_12px_rgba(249,115,22,0.08)]">
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent text-[10px] font-black tracking-wider uppercase">
                  Enjoy Your Learning Journey
                </span>
              </div>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search course content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Selected Module Detail Views */}
        {selectedModule ? (
          currentModuleType === "video" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative shadow-xl shadow-slate-200 border border-slate-200">
                  {selectedModule?.video?.url ? (
                    <video
                      key={selectedModule._id}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                      src={selectedModule.video.url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                      No active media source URL available.
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2">
                    {selectedModule.title}
                  </h1>

                  <div className="mt-4 p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-2.5">
                      <Clock className="animate-pulse" size={14} />
                      <span>
                        {selectedModule.video?.duration_sec
                          ? `${Math.floor(selectedModule.video.duration_sec / 60)} minutes duration`
                          : "Video Module"}
                      </span>
                    </div>
                    <div
                      className="text-sm text-slate-600 leading-relaxed prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedModule.description || "No description available." }}
                    />
                  </div>
                </div>
              </div>

              {/* Video Sidebar Queue */}
              <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px] lg:h-[680px] shadow-xl shadow-slate-100">
                <div className="p-4 border-b border-slate-200 bg-white/90 flex items-center justify-between backdrop-blur-sm">
                  <h3 className="font-bold text-xs tracking-wider text-slate-700 uppercase flex items-center gap-2">
                    <Play className="text-orange-500 fill-orange-500 drop-shadow-[0_2px_4px_rgba(249,115,22,0.3)]" size={14} />
                    Dynamic Course Queue
                  </h3>
                  <span className="text-xs text-orange-600 font-bold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full shadow-sm">
                    {videoModules.length} lessons
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/40">
                  {videoModules.map((item) => {
                    if (!item) return null;
                    const isPlaying = selectedModule?._id === item._id;
                    const thumbnailSource = item.video?.thumbnail_url || item.thumbnail || item.thumbnail_url;

                    return (
                      <button
                        key={item._id}
                        onClick={() => {
                          setSelectedModule(item);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-full p-2.5 rounded-xl flex gap-3 text-left transition-all duration-200 group/item ${isPlaying
                            ? "bg-gradient-to-r from-orange-500/5 to-transparent border border-orange-300 shadow-sm"
                            : "hover:bg-white border border-transparent shadow-sm hover:shadow"
                          }`}
                      >
                        <div className="relative w-28 h-16 rounded-lg bg-slate-950 flex-shrink-0 overflow-hidden border border-slate-200/80 shadow-inner flex items-center justify-center">
                          {thumbnailSource ? (
                            <img
                              src={thumbnailSource}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                            />
                          ) : item.video?.url ? (
                            <video
                              src={`${item.video.url}#t=2`}
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-full object-cover opacity-60 pointer-events-none"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                              <Play className="text-slate-500 fill-slate-500" size={16} />
                            </div>
                          )}

                          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black/30 backdrop-blur-[1px] ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}>
                            <div className="h-7 w-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md transform scale-90 group-hover/item:scale-100 transition-transform">
                              <Play className="fill-white ml-0.5" size={10} />
                            </div>
                          </div>

                          {item.video?.duration_sec && (
                            <span className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-sm text-[9px] font-mono px-1 py-0.5 rounded font-bold text-white z-10">
                              {Math.floor(item.video.duration_sec / 60)}m
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className={`font-bold text-xs leading-snug line-clamp-2 transition-colors duration-200 ${isPlaying ? "text-orange-600" : "text-slate-800 group-hover/item:text-orange-600"}`}>
                            {item.title}
                          </h4>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : currentModuleType === "audio" ? (
            /* Dedicated Audio Player Layout View */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-6">

                  {/* Title and Top Context Metadata tags */}
                  <div>
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                        <Headphones size={12} /> Audio Lesson
                      </span>
                      {selectedModule.audio?.language && (
                        <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                          {selectedModule.audio.language}
                        </span>
                      )}
                      {selectedModule.audio?.speed && (
                        <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                          Speed: {selectedModule.audio.speed}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                      {selectedModule.title}
                    </h1>
                    <div
                      className="text-sm text-slate-500 mt-2 prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedModule.description || "" }}
                    />
                  </div>

                  {/* Minimalist Native Audio Player UI */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-orange-500 text-white rounded-lg flex items-center justify-center shadow-md">
                        <Volume2 size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          {selectedModule.audio?.speaker_name || "Audio Resource Narration"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Duration: {selectedModule.audio?.duration_sec ? `${Math.floor(selectedModule.audio.duration_sec / 60)}m ${selectedModule.audio.duration_sec % 60}s` : "Dynamic"}
                        </p>
                      </div>
                    </div>
                    <audio
                      key={selectedModule._id}
                      src={selectedModule.audio?.url}
                      controls
                      autoPlay
                      className="w-full sm:w-72 md:w-96 focus:outline-none"
                    />
                  </div>

                  <hr className="border-slate-100" />

                  {/* Transcript View Container block */}
                  {selectedModule.audio?.transcript && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={14} /> Audio Lesson Transcript
                      </h3>
                      <div
                        className="bg-slate-50/50 border border-slate-100 text-slate-800 p-5 rounded-xl text-sm md:text-base leading-relaxed prose prose-slate max-w-none shadow-sm"
                        dangerouslySetInnerHTML={{ __html: selectedModule.audio.transcript }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Related Audio Lessons Queue Sidebar */}
              <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px] lg:h-[680px] shadow-xl shadow-slate-100">
                <div className="p-4 border-b border-slate-200 bg-white/90 flex items-center justify-between backdrop-blur-sm">
                  <h3 className="font-bold text-xs tracking-wider text-slate-700 uppercase flex items-center gap-2">
                    <Headphones className="text-orange-500" size={14} />
                    Related Audios Queue
                  </h3>
                  <span className="text-xs text-orange-600 font-bold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full shadow-sm">
                    {audioModules.length} lessons
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/40">
                  {audioModules.map((item) => {
                    if (!item) return null;
                    const isListening = selectedModule?._id === item._id;
                    return (
                      <button
                        key={item._id}
                        onClick={() => {
                          setSelectedModule(item);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-full p-3 rounded-xl flex gap-3 items-center text-left transition-all duration-200 group/item border ${isListening
                            ? "bg-gradient-to-r from-orange-500/5 to-transparent border-orange-300 shadow-sm"
                            : "hover:bg-white border-transparent shadow-sm hover:shadow"
                          }`}
                      >
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isListening ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 group-hover/item:bg-orange-50'}`}>
                          <Headphones className={isListening ? "text-white" : "group-hover/item:text-orange-500"} size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-xs leading-snug line-clamp-1 transition-colors duration-200 ${isListening ? "text-orange-600" : "text-slate-800 group-hover/item:text-orange-600"}`}>
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            {item.audio?.language || "Audio"} • {item.audio?.duration_sec ? `${Math.floor(item.audio.duration_sec / 60)}m` : "Play"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : currentModuleType === "exercise" ? (
            /* Quiz / Exercise Active View Details Block */
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
              {/* 1. Header Area */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Award size={100} />
                </div>
                <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm inline-flex items-center gap-1.5 mb-3">
                  <Award size={12} /> Challenge Activity
                </span>
                <h2 className="text-2xl font-black tracking-tight">{selectedModule.title}</h2>
              </div>

              {/* 2. Content Area: Logic to switch between Intro, Active Quiz, and Results */}
              <div className="p-6 space-y-6">
                {!isQuizActive && !showResults ? (
                  // --- PRE-ASSESSMENT VIEW ---
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* ... (Keep your existing stats cards here) ... */}
                    </div>
                    <div className="bg-orange-500/[0.02] border border-orange-500/10 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="text-orange-500" size={14} /> Evaluation Rules
                      </h4>
                      <ul className="text-xs text-slate-500 space-y-1 pl-1 list-inside list-disc">
                        {selectedModule.shuffle_questions && <li>Questions randomized dynamically.</li>}
                        {selectedModule.show_explanation && <li>Step-by-step resolution provided.</li>}
                      </ul>
                    </div>
                    <button
                      onClick={() => setIsQuizActive(true)} // Toggle to show quiz interface
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      Start Assessment Activity Now &rarr;
                    </button>
                  </>
                ) : showResults ? (
                  // --- POST-ASSESSMENT RESULTS VIEW ---
                  <div className="text-center py-10 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award size={40} />
                    </div>

                    <h3 className="text-xl font-black text-slate-900">
                      {resultData?.is_passed ? "Assessment Passed!" : "Assessment Complete!"}
                    </h3>

                    <div className="mt-6 grid grid-cols-2 gap-4 max-w-xs mx-auto">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                        <p className="font-black text-orange-600 text-lg">
                          {resultData?.score} / {resultData?.max_score}        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                        <p className="font-black text-slate-800 text-lg">{resultData?.accuracy}%</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowResults(false)}
                      className="mt-8 text-slate-400 hover:text-slate-600 text-sm font-bold underline"
                    >
                      Review Answers
                    </button>
                  </div>
                ) : (
                  // --- ACTIVE QUIZ COMPONENT ---
                  <div className="space-y-8">
                    {/* --- ACTIVE QUIZ COMPONENT --- */}
                    {/* --- ACTIVE QUIZ COMPONENT --- */}
                    <div className="min-h-[300px]">
                      {selectedModule.questions && selectedModule.questions.length > 0 ? (
                        (() => {
                          const q = selectedModule.questions[currentQuestionIndex];
                          const isLastQuestion = currentQuestionIndex === selectedModule.questions.length - 1;



                          return (
                            <div className="space-y-6">
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Question {currentQuestionIndex + 1} of {selectedModule.questions.length}
                              </div>

                              <p className="text-xl font-bold text-slate-800">{q.question_text}</p>

                              <div className="space-y-3">
                                {q.question_type === "mcq" ? (
                                  q.options.map((opt, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setUserAnswers({ ...userAnswers, [currentQuestionIndex]: opt })}
                                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${userAnswers[currentQuestionIndex] === opt
                                          ? "border-orange-500 bg-orange-50"
                                          : "border-slate-200"
                                        }`}
                                    >
                                      {opt}
                                    </button>
                                  ))
                                ) : (
                                  <input
                                    type="text"
                                    placeholder="Type your answer..."
                                    value={userAnswers[currentQuestionIndex] || ""}
                                    onChange={(e) => setUserAnswers({ ...userAnswers, [currentQuestionIndex]: e.target.value })}
                                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-orange-500 outline-none"
                                  />
                                )}
                              </div>

                              {/* NAVIGATION BUTTONS */}
                              <div className="flex gap-3">
                                {!isLastQuestion ? (
                                  <button
                                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                    disabled={!userAnswers[currentQuestionIndex]}
                                    className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl disabled:opacity-50"
                                  >
                                    Next Question
                                  </button>
                                ) : (
                                  <button
                                    onClick={handleSubmit} // Trigger the API call
                                    disabled={!userAnswers[currentQuestionIndex]}
                                    className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl disabled:opacity-50"
                                  >
                                    Submit All Answers
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <p>No questions available.</p>
                      )}
                    </div>


                  </div>
                )}
              </div>
            </div>
       ) : currentModuleType === "vocabulary" ? (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
    {/* Main Content */}
    <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
      <div>
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
            <BookOpen size={12} />
            Vocabulary Lesson
          </span>

          {selectedModule.level && (
            <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
              <GraduationCap size={12} />
              Level {selectedModule.level}
            </span>
          )}

          {selectedModule.time_limit_sec && (
            <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
              <Clock size={12} />
              {selectedModule.time_limit_sec}s
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {selectedModule.title}
        </h1>

        <div
          className="text-sm text-slate-500 mt-2 italic border-l-2 border-slate-200 pl-3 prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{
            __html: selectedModule.description || "",
          }}
        />
      </div>

      <hr className="border-slate-100" />

      {/* Vocabulary Content */}
      <div
        className="text-slate-800 text-sm md:text-base leading-relaxed prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{
          __html:
            selectedModule.content?.body ||
            selectedModule.body ||
            selectedModule.vocabulary ||
            "<p>No vocabulary content available.</p>",
        }}
      />
    </div>

    {/* Sidebar */}
    <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px] lg:h-[680px] shadow-xl shadow-slate-100">
      <div className="p-4 border-b border-slate-200 bg-white/90 flex items-center justify-between backdrop-blur-sm">
        <h3 className="font-bold text-xs tracking-wider text-slate-700 uppercase flex items-center gap-2">
          <BookOpen className="text-amber-500" size={14} />
          Vocabulary Queue
        </h3>

        <span className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full shadow-sm">
          {
            modules.filter(
              (m) => (m.module_type || type) === "vocabulary"
            ).length
          }{" "}
          lessons
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/40">
        {modules
          .filter((m) => (m.module_type || type) === "vocabulary")
          .map((item) => {
            const isCurrent = selectedModule?._id === item._id;

            return (
              <button
                key={item._id}
                onClick={() => {
                  setSelectedModule(item);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className={`w-full p-3 rounded-xl flex gap-3 items-center text-left transition-all duration-200 group border ${
                  isCurrent
                    ? "bg-gradient-to-r from-amber-500/5 to-transparent border-amber-300 shadow-sm"
                    : "hover:bg-white border-transparent shadow-sm hover:shadow"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCurrent
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-amber-50"
                  }`}
                >
                  <BookOpen
                    className={
                      isCurrent
                        ? "text-white"
                        : "group-hover:text-amber-500"
                    }
                    size={18}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-bold text-xs leading-snug line-clamp-1 ${
                      isCurrent
                        ? "text-amber-600"
                        : "text-slate-800 group-hover:text-amber-600"
                    }`}
                  >
                    {item.title}
                  </h4>

                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                    {item.total_marks || 0} Words •{" "}
                    {item.max_attempts || 0} Attempts
                  </span>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  </div>
) : currentModuleType === "text" ? (
            /* Text layout view fallback default */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <div>
                  <div className="flex flex-wrap gap-2 items-center mb-3">
                    <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                      Text Lesson
                    </span>
                    {selectedModule.content?.level && (
                      <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                        <GraduationCap size={12} /> Level {selectedModule.content.level}
                      </span>
                    )}
                    {selectedModule.content?.read_time_min && (
                      <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                        <Clock size={12} /> {selectedModule.content.read_time_min} mins read
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                    {selectedModule.title}
                  </h1>
                  <div
                    className="text-sm text-slate-500 mt-2 italic border-l-2 border-slate-200 pl-3 prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedModule.description || "" }}
                  />
                </div>

                <hr className="border-slate-100" />

                <div
                  className="text-slate-800 text-sm md:text-base leading-relaxed prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedModule.content?.body || "No document reading context content configured." }}
                />
              </div>

              {/* Text Sidebar Queue */}
              <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px] lg:h-[680px] shadow-xl shadow-slate-100">
                <div className="p-4 border-b border-slate-200 bg-white/90 flex items-center justify-between backdrop-blur-sm">
                  <h3 className="font-bold text-xs tracking-wider text-slate-700 uppercase flex items-center gap-2">
                    <FileText className="text-orange-500" size={14} />
                    Related Readings Queue
                  </h3>
                  <span className="text-xs text-orange-600 font-bold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full shadow-sm">
                    {textModules.length} lessons
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/40">
                  {textModules.map((item) => {
                    if (!item) return null;
                    const isReading = selectedModule?._id === item._id;
                    return (
                      <button
                        key={item._id}
                        onClick={() => {
                          setSelectedModule(item);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-full p-3 rounded-xl flex gap-3 items-center text-left transition-all duration-200 group/item border ${isReading
                            ? "bg-gradient-to-r from-orange-500/5 to-transparent border-orange-300 shadow-sm"
                            : "hover:bg-white border-transparent shadow-sm hover:shadow"
                          }`}
                      >
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isReading ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 group-hover/item:bg-orange-50'}`}>
                          <FileText className={isReading ? "text-white" : "group-hover/item:text-orange-500"} size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-xs leading-snug line-clamp-1 transition-colors duration-200 ${isReading ? "text-orange-600" : "text-slate-800 group-hover/item:text-orange-600"}`}>
                            {item.title}
                          </h4>
                          {item.content?.level && (
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                              Level {item.content.level} • {item.content.read_time_min || "5"}m read
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
                   
          ) : (
            <div className="p-10 text-center text-slate-500">
              Unsupported module type.
            </div>
          )
        ) : (
          /* Grid list view for unselected state modules cards */
          <div className="space-y-6 animate-fade-in">
            {!type && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {CONTENT_TYPES.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${isActive
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-400 shadow-md shadow-orange-500/10 transform -translate-y-0.5"
                          : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-slate-200 shadow-sm"
                        }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredModules.length === 0 ? (
              <div className="text-center py-20 bg-white/40 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 text-sm font-medium">No learning modules match your selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredModules.map((item) => {
                  if (!item) return null;
                  const isVideo = (item.module_type || type) === "video";
                  const isAudio = (item.module_type || type) === "audio";
                  const isText = (item.module_type || type) === "text";
                  const isExercise = (item.module_type || type) === "exercise";
                  const isVocabulary = (item.module_type || type) === "vocabulary";
                  const thumbnailSource = item.video?.thumbnail_url || item.thumbnail || item.thumbnail_url;

                  /* EXERCISE COMPONENT UI BLOCK - HIGHER CONVERTING INTERACTIVE LIST COMPONENT BANNER */
                  if (isExercise) {
                    return (
                      <div
                        key={item._id}
                        onClick={() => setSelectedModule(item)}
                        className="group relative bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex items-center gap-4 cursor-pointer col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4"
                      >
                        {/* Interactive Quiz Decorative Block Icon */}
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-900 flex items-center justify-center flex-shrink-0 text-white shadow-md relative overflow-hidden group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300">
                          <Award className="z-10 group-hover:scale-110 transition-transform text-orange-400 group-hover:text-white" size={22} />
                        </div>

                        {/* Text description values */}
                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                          <div className="md:col-span-6 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black tracking-wider uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                                {item.exercise_type === "mcq" ? "Quiz Assessment" : "Fill In Blanks"}
                              </span>
                              <span className="text-[9px] font-semibold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                Difficulty: {item.difficulty || "medium"}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-sm md:text-base text-slate-900 truncate tracking-tight group-hover:text-orange-600 transition-colors">
                              {item.title}
                            </h3>
                          </div>

                          <div className="hidden md:block md:col-span-4">
                            <p className="text-xs text-slate-400 font-medium truncate">
                              Max available limits configured: {item.max_attempts || 5} active attempt options.
                            </p>
                          </div>

                          {/* Evaluation statistics tags */}
                          <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <HelpCircle size={12} className="text-indigo-500" />
                              <span>
                                {item.total_marks ? `${item.total_marks} Pts` : "Practice"}
                              </span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                              <RotateCcw className="group-hover:rotate-45 transition-transform" size={12} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  /* Audio Track list Layout */
                  if (isAudio) {
                    return (
                      <div
                        key={item._id}
                        onClick={() => setSelectedModule(item)}
                        className="group relative bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex items-center gap-4 cursor-pointer col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4"
                      >
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center flex-shrink-0 text-white shadow-md relative overflow-hidden group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300">
                          <Headphones className="z-10 group-hover:scale-110 transition-transform text-orange-400 group-hover:text-white" size={22} />
                        </div>

                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                          <div className="md:col-span-6 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black tracking-wider uppercase bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">
                                Audio Track
                              </span>
                              {item.audio?.speaker_name && (
                                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                  <User size={10} /> {item.audio.speaker_name}
                                </span>
                              )}
                            </div>
                            <h3 className="font-extrabold text-sm md:text-base text-slate-900 truncate tracking-tight group-hover:text-orange-600 transition-colors">
                              {item.title}
                            </h3>
                          </div>

                          <div className="hidden md:block md:col-span-4">
                            <div
                              className="text-xs text-slate-400 line-clamp-1 pr-4 prose prose-slate"
                              dangerouslySetInnerHTML={{ __html: item.description || "No context description." }}
                            />
                          </div>

                          <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                              <Clock size={12} className="text-slate-400" />
                              <span>
                                {item.audio?.duration_sec
                                  ? `${Math.floor(item.audio.duration_sec / 60)}m`
                                  : "Listen"}
                              </span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                              <Play className="fill-current ml-0.5" size={12} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isText) {
                    return (
                      <div
                        key={item._id}
                        onClick={() => setSelectedModule(item)}
                        className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-500" />

                        <div className="flex items-start gap-4 mb-3">
                          <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                            <FileText size={24} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                Text Lesson
                              </span>
                              {item.content?.level && (
                                <span className="text-[9px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  Level {item.content.level}
                                </span>
                              )}
                            </div>
                            <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        <div
                          className="text-xs text-slate-500 line-clamp-3 leading-relaxed flex-1 mt-1 prose prose-slate"
                          dangerouslySetInnerHTML={{ __html: item.description || "No description available." }}
                        />

                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {item.content?.read_time_min ? `${item.content.read_time_min}m read` : "Quick read"}
                          </span>
                          <span className="text-orange-500 font-bold group-hover:underline flex items-center gap-1">
                            Read Document &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  }
                  /* VOCABULARY MODULE CARD */
                  if (isVocabulary) {
                    return (
                      <div
                        key={item._id}
                        onClick={() => setSelectedModule(item)}
                        className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex items-center gap-5 cursor-pointer col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4"
                      >
                        {/* Left Icon */}
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                          <BookOpen className="text-white" size={28} />
                        </div>

                        {/* Center */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="px-2 py-1 text-[10px] rounded-full bg-amber-100 text-amber-700 font-bold uppercase">
                              Vocabulary
                            </span>

                            <span className="px-2 py-1 text-[10px] rounded-full bg-slate-100 text-slate-600 font-semibold">
                              {item.total_marks} Words
                            </span>
                          </div>

                          <h3 className="font-black text-lg text-slate-900 group-hover:text-orange-600 transition">
                            {item.title}
                          </h3>

                          <div
                            className="text-sm text-slate-500 line-clamp-2 mt-2"
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                          />
                        </div>

                        {/* Right */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border">
                            ⏱ {item.time_limit_sec}s
                          </div>

                          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border">
                            🔄 {item.max_attempts} Attempts
                          </div>

                          <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow hover:scale-105 transition">
                            Learn →
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item._id}
                      onClick={() => {
                        if (isVideo) {
                          setSelectedModule(item);
                        } else {
                          const nextParams = new URLSearchParams(searchParams?.toString() || "");
                          nextParams.set("lessonName", item.title || "");
                          router.push(`/dashboard/${item.module_type || type}/${item._id}?${nextParams.toString()}`);
                        }
                      }}
                      className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-video w-full bg-slate-950 relative overflow-hidden border-b border-slate-100 flex items-center justify-center">
                        {thumbnailSource ? (
                          <img
                            src={thumbnailSource}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : item.video?.url ? (
                          <video
                            src={`${item.video.url}#t=2`}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Play className="text-slate-500 fill-slate-500" size={16} />
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/30">
                          <div className="h-12 w-12 rounded-full bg-white/90 text-slate-900 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110">
                            <Play className="fill-current ml-0.5 transition-transform" size={20} />
                          </div>
                        </div>

                        {item.video?.duration_sec && (
                          <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-[10px] font-mono px-1.5 py-0.5 rounded font-bold text-white tracking-wide z-10">
                            {Math.floor(item.video.duration_sec / 60)}m
                          </span>
                        )}

                        <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm border border-slate-200 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md text-slate-700 shadow-sm z-10">
                          {item.module_type || type || "lesson"}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors duration-200">
                            {item.title}
                          </h3>
                          <div
                            className="text-xs text-slate-500 line-clamp-2 leading-relaxed prose prose-slate"
                            dangerouslySetInnerHTML={{ __html: item.description || "No description available." }}
                          />
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Available Now
                          </span>
                          <span className="text-orange-500 font-bold group-hover:underline flex items-center gap-0.5">
                            Start Lesson &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


        )}

      </div>
    </div>
  );
}