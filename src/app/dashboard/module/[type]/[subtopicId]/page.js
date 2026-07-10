"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
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
  ChevronRight,
} from "lucide-react";
import { moduleApi } from "@/services/topic/topicApi";
import { activityApi } from "@/services/activity/activityApi";

/* =========================================================================
   CONSTANTS & DESIGN TOKENS
   Single source of truth for tabs and per-content-type color/icon identity.
   Every card, badge, and detail header pulls from TYPE_ACCENT so colors
   stay consistent instead of being re-picked in every block.
   ========================================================================= */

const CONTENT_TYPES = [
  { id: "all", label: "All Content", icon: BookOpen },
  { id: "video", label: "Videos", icon: Play },
  { id: "audio", label: "Audios", icon: Headphones },
  { id: "exercise", label: "Exercises", icon: Award },
  { id: "text", label: "Readings", icon: FileText },
  { id: "vocabulary", label: "Vocab", icon: BookOpen },
];

const TYPE_ACCENT = {
  video: {
    label: "Video Lesson",
    text: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    solid: "bg-orange-500",
    solidHover: "hover:bg-orange-600",
    gradient: "from-orange-500 to-amber-500",
  },
  audio: {
    label: "Audio Lesson",
    text: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    solid: "bg-indigo-500",
    solidHover: "hover:bg-indigo-600",
    gradient: "from-indigo-500 to-violet-500",
  },
  text: {
    label: "Reading",
    text: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
    solid: "bg-sky-500",
    solidHover: "hover:bg-sky-600",
    gradient: "from-sky-500 to-blue-500",
  },
  vocabulary: {
    label: "Vocabulary",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    solid: "bg-amber-500",
    solidHover: "hover:bg-amber-600",
    gradient: "from-amber-500 to-orange-500",
  },
  exercise: {
    label: "Exercise",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    solid: "bg-emerald-500",
    solidHover: "hover:bg-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
  },
};

const getAccent = (type) => TYPE_ACCENT[type] || TYPE_ACCENT.video;

// Builds the exercise URL safely. (The original inline template string had
// literal newlines/indentation baked into the query string, producing a
// broken URL — this fixes that and removes four copies of duplicated logic.)
function buildExerciseUrl(selectedModule, searchParams) {
  const params = new URLSearchParams();
  params.set("topicId", selectedModule?.topic_id?._id || "");
  params.set("subTopicId", selectedModule?.sub_topic_id?._id || "");
  params.set("courseId", searchParams.get("courseId") || "");
  params.set("courseName", searchParams.get("courseName") || "");
  params.set("topicName", searchParams.get("topicName") || "");
  params.set("subTopicName", searchParams.get("subTopicName") || "");
  return `/dashboard/exercise?${params.toString()}`;
}

function buildPracticeUrl(selectedModule) {
  return `/dashboard/module/practice-quations?data=${encodeURIComponent(
    JSON.stringify(selectedModule)
  )}`;
}

/* =========================================================================
   SMALL SHARED COMPONENTS
   ========================================================================= */

function ContentTypeTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              isActive
                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-400 shadow-md shadow-orange-500/10 -translate-y-0.5"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-slate-200 shadow-sm"
            }`}
          >
            <Icon size={14} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function PrevNextNav({ previousModule, nextModule, currentIndex, total, onNavigate, accent }) {
  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200">
      <button
        disabled={!previousModule}
        onClick={() => previousModule && onNavigate(previousModule)}
        className={`px-5 py-3 rounded-xl font-semibold transition ${
          previousModule
            ? "bg-slate-900 text-white hover:bg-slate-800"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        ← Previous
      </button>

      <span className="text-sm font-medium text-slate-500">
        {total > 0 ? currentIndex + 1 : 0} / {total}
      </span>

      <button
        disabled={!nextModule}
        onClick={() => nextModule && onNavigate(nextModule)}
        className={`px-5 py-3 rounded-xl font-semibold text-white transition ${
          nextModule ? `${accent.solid} ${accent.solidHover}` : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        Next →
      </button>
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

function ActionCard({ icon: Icon, iconClass, title, description, buttonLabel, buttonClass, onClick }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconClass}`}>
        <Icon size={26} />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 mb-6">{description}</p>
      <button
        onClick={onClick}
        className={`w-full py-3 rounded-xl text-white font-bold transition flex items-center justify-center gap-2 ${buttonClass}`}
      >
        {buttonLabel}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function LessonActionsPanel({ onPractice, onExercise }) {
  return (
    <div className="space-y-6">
      <ActionCard
        icon={BookOpen}
        iconClass="bg-orange-50 text-orange-500"
        title="Knowledge Check"
        description="Test what you've learned from this lesson."
        buttonLabel="Start Practice"
        buttonClass="bg-orange-500 hover:bg-orange-600"
        onClick={onPractice}
      />
      <ActionCard
        icon={Award}
        iconClass="bg-emerald-50 text-emerald-600"
        title="Lesson Exercise"
        description="Complete the exercise to improve your understanding."
        buttonLabel="Start Exercise"
        buttonClass="bg-emerald-500 hover:bg-emerald-600"
        onClick={onExercise}
      />
    </div>
  );
}

function RelatedQueueList({ title, icon: Icon, items, activeId, onSelect, accent, getSubtitle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-slate-700">
          <Icon className={accent.text} size={14} />
          {title}
        </h3>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400 px-4 py-6 text-center">No other lessons in this list yet.</p>
      ) : (
        <div className="max-h-[280px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {items.map((item) => {
            const isActive = activeId === item._id;
            return (
              <button
                key={item._id}
                onClick={() => onSelect(item)}
                className={`w-full p-3 rounded-xl flex gap-3 text-left border transition ${
                  isActive ? `${accent.bg} ${accent.border}` : "hover:bg-slate-50 border-transparent"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? `${accent.solid} text-white` : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold truncate ${isActive ? accent.text : "text-slate-800"}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">{getSubtitle ? getSubtitle(item) : ""}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   GRID / LIST CARDS  (unfiltered lesson grid view)
   ========================================================================= */

function WideRow({ onClick, iconBg, icon, eyebrow, eyebrowClass, title, middle, right }) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex items-center gap-4 cursor-pointer col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4"
    >
      <div className={`h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md relative overflow-hidden transition-all duration-300 ${iconBg}`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <div className="md:col-span-6 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded border ${eyebrowClass}`}>
              {eyebrow}
            </span>
          </div>
          <h3 className="font-extrabold text-sm md:text-base text-slate-900 truncate tracking-tight group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
        </div>

        {middle && <div className="hidden md:block md:col-span-4">{middle}</div>}
        <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">{right}</div>
      </div>
    </div>
  );
}

function ExerciseRow({ item, onSelect }) {
  return (
    <WideRow
      onClick={() => onSelect(item)}
      iconBg="bg-gradient-to-br from-indigo-950 to-slate-900 group-hover:from-orange-500 group-hover:to-orange-600"
      icon={<Award className="z-10 group-hover:scale-110 transition-transform text-orange-400 group-hover:text-white" size={22} />}
      eyebrow={item.exercise_type === "mcq" ? "Quiz Assessment" : "Fill In Blanks"}
      eyebrowClass="bg-indigo-50 text-indigo-600 border-indigo-100"
      title={item.title}
      middle={
        <p className="text-xs text-slate-400 font-medium truncate">
          {item.max_attempts || 5} attempt{(item.max_attempts || 5) === 1 ? "" : "s"} allowed · Difficulty: {item.difficulty || "medium"}
        </p>
      }
      right={
        <>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <HelpCircle size={12} className="text-indigo-500" />
            <span>{item.total_marks ? `${item.total_marks} Pts` : "Practice"}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
            <RotateCcw className="group-hover:rotate-45 transition-transform" size={12} />
          </div>
        </>
      }
    />
  );
}

function AudioRow({ item, onSelect }) {
  return (
    <WideRow
      onClick={() => onSelect(item)}
      iconBg="bg-gradient-to-br from-slate-900 to-slate-800 group-hover:from-orange-500 group-hover:to-orange-600"
      icon={<Headphones className="z-10 group-hover:scale-110 transition-transform text-orange-400 group-hover:text-white" size={22} />}
      eyebrow="Audio Track"
      eyebrowClass="bg-orange-50 text-orange-600 border-orange-100"
      title={item.title}
      middle={
        item.audio?.speaker_name ? (
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <User size={10} /> {item.audio.speaker_name}
          </span>
        ) : (
          <div
            className="text-xs text-slate-400 line-clamp-1 pr-4 prose prose-slate"
            dangerouslySetInnerHTML={{ __html: item.description || "No context description." }}
          />
        )
      }
      right={
        <>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            <Clock size={12} className="text-slate-400" />
            <span>{item.audio?.duration_sec ? `${Math.floor(item.audio.duration_sec / 60)}m` : "Listen"}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
            <Play className="fill-current ml-0.5" size={12} />
          </div>
        </>
      }
    />
  );
}

function TextCard({ item, onSelect }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-500" />

      <div className="flex items-start gap-4 mb-3">
        <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
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
          <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
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
        <span className="text-sky-500 font-bold group-hover:underline flex items-center gap-1">
          Read Document &rarr;
        </span>
      </div>
    </div>
  );
}

function VocabularyRow({ item, onSelect }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex items-center gap-5 cursor-pointer col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4"
    >
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition shrink-0">
        <BookOpen className="text-white" size={28} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="px-2 py-1 text-[10px] rounded-full bg-amber-100 text-amber-700 font-bold uppercase">
            Vocabulary
          </span>
          <span className="px-2 py-1 text-[10px] rounded-full bg-slate-100 text-slate-600 font-semibold">
            {item.total_marks || item.words?.length || 0} Words
          </span>
        </div>

        <h3 className="font-black text-lg text-slate-900 group-hover:text-orange-600 transition truncate">
          {item.title}
        </h3>

        <div
          className="text-sm text-slate-500 line-clamp-2 mt-2"
          dangerouslySetInnerHTML={{ __html: item.description || "" }}
        />
      </div>

      <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border">
          ⏱ {item.time_limit_sec || "—"}s
        </div>
        <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border">
          🔄 {item.max_attempts || "—"} Attempts
        </div>
      </div>

      <button className="hidden sm:block px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow hover:scale-105 transition shrink-0">
        Learn →
      </button>
    </div>
  );
}

function VideoCard({ item, type, onSelect }) {
  const thumbnailSource = item.video?.thumbnail_url || item.thumbnail || item.thumbnail_url;

  return (
    <div
      onClick={() => onSelect(item)}
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
}

/* =========================================================================
   DETAIL VIEWS  (one selected module, per content type)
   ========================================================================= */

function VideoDetail({
  selectedModule,
  videoModules,
  previousModule,
  nextModule,
  currentModuleIndex,
  currentModuleList,
  onNavigate,
  onBack,
  onComplete,
  router,
  searchParams,
}) {
  const accent = getAccent("video");
  const relatedVideos = videoModules.filter((m) => m._id !== selectedModule._id);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
      <BackToLessonsButton onBack={onBack} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video shadow-xl border border-slate-200">
            <video
              key={selectedModule._id}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              src={selectedModule.video?.url}
              onEnded={onComplete}
            />
          </div>

          <div className="space-y-5">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${accent.bg} ${accent.text} ${accent.border}`}>
              {accent.label}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">{selectedModule.title}</h1>

            <PrevNextNav
              previousModule={previousModule}
              nextModule={nextModule}
              currentIndex={currentModuleIndex}
              total={currentModuleList.length}
              onNavigate={onNavigate}
              accent={accent}
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <LessonActionsPanel
            onPractice={() => router.push(buildPracticeUrl(selectedModule))}
            onExercise={() => router.push(buildExerciseUrl(selectedModule, searchParams))}
          />
        </div>
      </div>

      {relatedVideos.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4">More Lessons</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedVideos.map((item) => (
              <button
                key={item._id}
                onClick={() => onNavigate(item)}
                className="group block text-left bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {item.thumbnail || item.video?.thumbnail_url ? (
                    <img
                      src={item.thumbnail || item.video?.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : item.video?.url ? (
                    <video
                      src={`${item.video.url}#t=2`}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Play className="text-slate-400 fill-current" size={24} />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition">
                    <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="fill-current ml-0.5 text-slate-900" size={18} />
                    </div>
                  </div>

                  <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                    Video
                  </div>

                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-[9px]">
                    {item.video?.duration_sec ? `${Math.floor(item.video.duration_sec / 60)}m` : item.duration || "5m"}
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="font-bold text-xs text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AudioDetail({
  selectedModule,
  audioModules,
  previousModule,
  nextModule,
  currentModuleIndex,
  currentModuleList,
  onNavigate,
  onBack,
  onComplete,
  router,
  searchParams,
}) {
  const accent = getAccent("audio");

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      <BackToLessonsButton onBack={onBack} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 items-center mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm flex items-center gap-1 ${accent.bg} ${accent.text} ${accent.border}`}>
                  <Headphones size={12} /> {accent.label}
                </span>
                {selectedModule.audio?.language && (
                  <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
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

            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 text-white rounded-lg flex items-center justify-center shadow-md ${accent.solid}`}>
                  <Volume2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User size={12} className="text-slate-400" />
                    {selectedModule.audio?.speaker_name || "Audio Resource Narration"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Duration:{" "}
                    {selectedModule.audio?.duration_sec
                      ? `${Math.floor(selectedModule.audio.duration_sec / 60)}m ${selectedModule.audio.duration_sec % 60}s`
                      : "Dynamic"}
                  </p>
                </div>
              </div>
              <audio
                key={selectedModule._id}
                src={selectedModule.audio?.url}
                controls
                autoPlay
                className="w-full sm:w-72 md:w-96 focus:outline-none"
                onEnded={onComplete}
              />
            </div>

            <hr className="border-slate-100" />

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

            <PrevNextNav
              previousModule={previousModule}
              nextModule={nextModule}
              currentIndex={currentModuleIndex}
              total={currentModuleList.length}
              onNavigate={onNavigate}
              accent={accent}
            />
          </div>

          <RelatedQueueList
            title="Related Audios Queue"
            icon={Headphones}
            items={audioModules}
            activeId={selectedModule._id}
            onSelect={onNavigate}
            accent={accent}
            getSubtitle={(item) => (item.audio?.duration_sec ? `${Math.floor(item.audio.duration_sec / 60)}m` : "Audio")}
          />
        </div>

        <div className="lg:col-span-4">
          <LessonActionsPanel
            onPractice={() => router.push(buildPracticeUrl(selectedModule))}
            onExercise={() => router.push(buildExerciseUrl(selectedModule, searchParams))}
          />
        </div>
      </div>
    </div>
  );
}

function TextDetail({
  selectedModule,
  textModules,
  previousModule,
  nextModule,
  currentModuleIndex,
  currentModuleList,
  onNavigate,
  onBack,
  router,
  searchParams,
}) {
  const accent = getAccent("text");

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      <BackToLessonsButton onBack={onBack} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 items-center mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${accent.bg} ${accent.text} ${accent.border}`}>
                  {accent.label}
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
              className="bg-slate-50 border border-slate-100 rounded-xl p-6 prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedModule.content?.body || "" }}
            />

            <PrevNextNav
              previousModule={previousModule}
              nextModule={nextModule}
              currentIndex={currentModuleIndex}
              total={currentModuleList.length}
              onNavigate={onNavigate}
              accent={accent}
            />

            <RelatedQueueList
              title="Related Reading Lessons"
              icon={BookOpen}
              items={textModules}
              activeId={selectedModule._id}
              onSelect={onNavigate}
              accent={accent}
              getSubtitle={(item) =>
                item.content?.read_time_min ? `${item.content.read_time_min} min read` : "Reading Lesson"
              }
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <LessonActionsPanel
            onPractice={() => router.push(buildPracticeUrl(selectedModule))}
            onExercise={() => router.push(buildExerciseUrl(selectedModule, searchParams))}
          />
        </div>
      </div>
    </div>
  );
}

function VocabularyDetail({
  selectedModule,
  vocabularyModules,
  previousModule,
  nextModule,
  currentModuleIndex,
  currentModuleList,
  onNavigate,
  onBack,
  router,
  searchParams,
}) {
  const accent = getAccent("vocabulary");
  const related = vocabularyModules.filter((item) => item._id !== selectedModule._id);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      <BackToLessonsButton onBack={onBack} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm mb-3 ${accent.bg} ${accent.text} ${accent.border}`}>
              {accent.label}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedModule.title}</h2>
            <div
              className="text-slate-600 mb-6 prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedModule.description || "" }}
            />

            <div className="grid grid-cols-1 gap-4">
              {selectedModule.words?.map((wordObj, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-lg font-bold text-amber-700">{wordObj.word}</h4>
                  <p className="text-xs text-slate-500 italic mb-2">
                    /{wordObj.pronunciation}/ • {wordObj.part_of_speech}
                  </p>
                  <p className="text-sm text-slate-700 mb-2">{wordObj.meaning}</p>
                  <p className="text-sm italic text-slate-500 bg-white p-2 rounded border border-slate-100">
                    <span className="font-bold text-slate-800">Example: </span>
                    {wordObj.example}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-2">
              <PrevNextNav
                previousModule={previousModule}
                nextModule={nextModule}
                currentIndex={currentModuleIndex}
                total={currentModuleList.length}
                onNavigate={onNavigate}
                accent={accent}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="text-orange-500" size={16} /> More Vocabulary Lessons
              </h3>
              <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100">
                {vocabularyModules.length} Lessons
              </span>
            </div>
            <RelatedQueueList
              title="Vocabulary Queue"
              icon={BookOpen}
              items={related}
              activeId={selectedModule._id}
              onSelect={onNavigate}
              accent={accent}
              getSubtitle={(item) => `${item.words?.length || 0} Words • ${item.questions?.length || 0} Questions`}
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <LessonActionsPanel
            onPractice={() => router.push(buildPracticeUrl(selectedModule))}
            onExercise={() => router.push(buildExerciseUrl(selectedModule, searchParams))}
          />
        </div>
      </div>
    </div>
  );
}

function PreAssessment({ selectedModule, onStart }) {
  return (
    <>
      <div className="bg-orange-500/[0.02] border border-orange-500/10 rounded-xl p-4 space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
          <Sparkles className="text-orange-500" size={14} /> Evaluation Rules
        </h4>
        <ul className="text-xs text-slate-500 space-y-1 pl-1 list-inside list-disc">
          {selectedModule.shuffle_questions && <li>Questions randomized dynamically.</li>}
          {selectedModule.show_explanation && <li>Step-by-step resolution provided.</li>}
          {!selectedModule.shuffle_questions && !selectedModule.show_explanation && (
            <li>Answer each question, then submit to see your score.</li>
          )}
        </ul>
      </div>
      <button
        onClick={onStart}
        className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold rounded-xl transition-all shadow-md"
      >
        Start Assessment Activity Now &rarr;
      </button>
    </>
  );
}

function QuizResults({ resultData, onDone }) {
  return (
    <div className="py-10 animate-fade-in">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-orange-400 blur-2xl opacity-30" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-xl shadow-orange-300/40">
              <Award size={42} className="text-white" />
            </div>
          </div>
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

        <button
          onClick={onDone}
          className="mt-10 w-full rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 py-4 font-bold text-white shadow-lg shadow-orange-300/40 transition-all duration-300 hover:scale-[1.02]"
        >
          ← Back to Exercises
        </button>
      </div>
    </div>
  );
}

function ActiveQuiz({ selectedModule, currentQuestionIndex, setCurrentQuestionIndex, userAnswers, setUserAnswers, onSubmit }) {
  if (!selectedModule.questions || selectedModule.questions.length === 0) {
    return <p className="text-sm text-slate-500">No questions available for this exercise.</p>;
  }

  const q = selectedModule.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === selectedModule.questions.length - 1;

  return (
    <div className="min-h-[300px] space-y-6">
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
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                userAnswers[currentQuestionIndex] === opt ? "border-orange-500 bg-orange-50" : "border-slate-200"
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
            onClick={onSubmit}
            disabled={!userAnswers[currentQuestionIndex]}
            className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl disabled:opacity-50"
          >
            Submit All Answers
          </button>
        )}
      </div>
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
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <BackToLessonsButton onBack={onBack} />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Award size={100} />
          </div>
          <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 right-10 h-32 w-32 rounded-full bg-yellow-200/20 blur-3xl" />

          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 shadow-md mb-3">
            <Award size={12} />
            Challenge Activity
          </span>

          <h2 className="relative text-2xl font-black tracking-tight">{selectedModule.title}</h2>
          <p className="relative mt-1 text-sm text-orange-50">
            Complete the challenge to test your understanding.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {!isQuizActive && !showResults ? (
            <PreAssessment
              selectedModule={selectedModule}
              onStart={() => {
                onStart?.();
                setIsQuizActive(true);
              }}
            />
          ) : showResults ? (
            <QuizResults resultData={resultData} onDone={() => router.back()} />
          ) : (
            <ActiveQuiz
              selectedModule={selectedModule}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              userAnswers={userAnswers}
              setUserAnswers={setUserAnswers}
              onSubmit={onSubmit}
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

  // Quiz / exercise flow state
  const [resultData, setResultData] = useState(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  const startTimeRef = React.useRef(Date.now());
  const attendanceLoggedRef = React.useRef(false);

  useEffect(() => {
    if (type) setActiveTab(type);
  }, [type]);

  // Sync selectedModule with URL to allow breadcrumb / back-button navigation
  useEffect(() => {
    const lessonId = searchParams.get("lessonId");
    if (!lessonId) {
      setSelectedModule(null);
    } else if (modules.length > 0 && (!selectedModule || selectedModule._id !== lessonId)) {
      const found = modules.find((m) => m._id === lessonId);
      if (found) setSelectedModule(found);
    }
  }, [searchParams, modules, selectedModule]);

  const logModuleActivity = async (module, activity_type, extra = {}) => {
    if (!module) return;
    try {
      await activityApi.logActivity({
        topic_id: module.topic_id?._id || module.topic_id,
        sub_topic_id: module.sub_topic_id?._id || module.sub_topic_id,
        module_id: module._id,
        module_type: module.module_type || type,
        activity_type,
        ...extra,
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  // Mark today's attendance the first time a module is opened in this visit
  useEffect(() => {
    if (selectedModule && !attendanceLoggedRef.current) {
      attendanceLoggedRef.current = true;
      logModuleActivity(selectedModule, "attendance_marked");
    }
  }, [selectedModule]);

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

  const handleModuleSelection = (item) => {
    // Text/vocabulary lessons have no media-end signal, so treat navigating
    // away (Previous/Next, related list, or back to lessons) as "done".
    if (
      selectedModule &&
      item?._id !== selectedModule._id &&
      (selectedModule.module_type === "text" || selectedModule.module_type === "vocabulary")
    ) {
      logModuleActivity(selectedModule, `${selectedModule.module_type}_complete`);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (item) {
      nextParams.set("lessonId", item._id);
      nextParams.set("lessonName", item.title);
    } else {
      nextParams.delete("lessonId");
      nextParams.delete("lessonName");
    }
    router.push(`?${nextParams.toString()}`);

    // reset quiz flow whenever the lesson changes
    setIsQuizActive(false);
    setShowResults(false);
    setResultData(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.keys(userAnswers).map((index) => ({
      question_index: Number(index),
      given_answer: userAnswers[index],
    }));

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    const payload = { answers: formattedAnswers, time_spent_sec: timeSpent };

    try {
      const response = await moduleApi.submitExercise(selectedModule._id, payload);

      const attempt =
        response?.data?.data?.attempt || response?.data?.attempt || response?.attempt || response?.data;

      if (attempt) {
        setResultData({
          score: attempt.score,
          max_score: attempt.max_score,
          accuracy: attempt.accuracy,
          is_passed: attempt.is_passed,
        });
        logModuleActivity(selectedModule, "exercise_complete", {
          score: attempt.score,
          max_score: attempt.max_score,
          accuracy: attempt.accuracy,
          time_spent_sec: timeSpent,
        });
        setIsQuizActive(false);
        setShowResults(true);
      } else {
        console.error("Attempt data not found.", response);
        toast.error("Unable to load result.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(error?.response?.data?.message || "Failed to submit answers.");
    }
  };

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

  const byType = (t) =>
    Array.isArray(modules) ? modules.filter((item) => item && (item.module_type || type) === t) : [];
  const videoModules = useMemo(() => byType("video"), [modules, type]);
  const audioModules = useMemo(() => byType("audio"), [modules, type]);
  const textModules = useMemo(() => byType("text"), [modules, type]);
  const vocabularyModules = useMemo(() => byType("vocabulary"), [modules, type]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const currentModuleType = selectedModule?.module_type || type;

  const currentModuleList =
    currentModuleType === "video"
      ? videoModules
      : currentModuleType === "audio"
        ? audioModules
        : currentModuleType === "text"
          ? textModules
          : currentModuleType === "vocabulary"
            ? vocabularyModules
            : [];

  const currentModuleIndex = currentModuleList.findIndex((item) => item._id === selectedModule?._id);
  const previousModule = currentModuleIndex > 0 ? currentModuleList[currentModuleIndex - 1] : null;
  const nextModule =
    currentModuleIndex >= 0 && currentModuleIndex < currentModuleList.length - 1
      ? currentModuleList[currentModuleIndex + 1]
      : null;

  const sharedDetailProps = {
    selectedModule,
    previousModule,
    nextModule,
    currentModuleIndex,
    currentModuleList,
    onNavigate: handleModuleSelection,
    onBack: () => handleModuleSelection(null),
    router,
    searchParams,
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 text-slate-800 p-4 md:p-6 font-sans antialiased overflow-x-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[150px] pointer-events-none" />

      <div className="max-w-[1700px] mx-auto space-y-8 relative z-10">
        {selectedModule ? (
          currentModuleType === "video" ? (
            <VideoDetail
              {...sharedDetailProps}
              videoModules={videoModules}
              onComplete={() => logModuleActivity(selectedModule, "video_complete")}
            />
          ) : currentModuleType === "audio" ? (
            <AudioDetail
              {...sharedDetailProps}
              audioModules={audioModules}
              onComplete={() => logModuleActivity(selectedModule, "audio_complete")}
            />
          ) : currentModuleType === "exercise" ? (
            <ExerciseDetail
              selectedModule={selectedModule}
              isQuizActive={isQuizActive}
              setIsQuizActive={setIsQuizActive}
              showResults={showResults}
              resultData={resultData}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              userAnswers={userAnswers}
              setUserAnswers={setUserAnswers}
              onSubmit={handleSubmit}
              onStart={() => logModuleActivity(selectedModule, "exercise_start")}
              onBack={() => handleModuleSelection(null)}
              router={router}
            />
          ) : currentModuleType === "vocabulary" ? (
            <VocabularyDetail {...sharedDetailProps} vocabularyModules={vocabularyModules} />
          ) : currentModuleType === "text" ? (
            <TextDetail {...sharedDetailProps} textModules={textModules} />
          ) : (
            <div className="p-10 text-center text-slate-500">Unsupported module type.</div>
          )
        ) : (
          <div className="space-y-6 animate-fade-in">
            {!type && <ContentTypeTabs tabs={CONTENT_TYPES} activeTab={activeTab} onChange={setActiveTab} />}

            {filteredModules.length === 0 ? (
              <div className="text-center py-20 bg-white/40 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 text-sm font-medium">No learning modules match your selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredModules.map((item) => {
                  if (!item) return null;
                  const itemType = item.module_type || type;

                  if (itemType === "exercise") {
                    return <ExerciseRow key={item._id} item={item} onSelect={handleModuleSelection} />;
                  }
                  if (itemType === "audio") {
                    return <AudioRow key={item._id} item={item} onSelect={handleModuleSelection} />;
                  }
                  if (itemType === "text") {
                    return <TextCard key={item._id} item={item} onSelect={handleModuleSelection} />;
                  }
                  if (itemType === "vocabulary") {
                    return <VocabularyRow key={item._id} item={item} onSelect={handleModuleSelection} />;
                  }
                  return <VideoCard key={item._id} item={item} type={type} onSelect={handleModuleSelection} />;
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
