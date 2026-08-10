"use client";

import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useParams,
    useRouter,
    useSearchParams,
} from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import StatusModal from "@/components/molecules/StatusModal";

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
    ChevronLeft,
    Maximize2,
    X,
    Minimize2,
    Check,
    Lightbulb,
} from "lucide-react";
import { moduleApi } from "@/services/topic/topicApi";
import { activityApi } from "@/services/activity/activityApi";
import { getMatchPairs, hasAnswer, answerToString, shuffledPool } from "@/utils/questionAnswers";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { getPlayableVideoUrl, getPlayableAudioUrl } from "@/utils/media";

// next-video/react-player are heavy media deps — only load them when a
// video-type lesson is actually rendered, not on every module page load.
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
    ssr: false,
    loading: () => (
        <div className="aspect-video w-full animate-pulse rounded-2xl bg-slate-100" />
    ),
});

/* =========================================================================
   CONSTANTS & DESIGN TOKENS
   Single source of truth for tabs and per-content-type color/icon identity.
   Every card, badge, and detail header pulls from TYPE_ACCENT so colors
   stay consistent instead of being re-picked in every block.
   ========================================================================= */

const CONTENT_TYPES = [
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

function useFullscreen(ref) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handleChange);
        return () => document.removeEventListener("fullscreenchange", handleChange);
    }, []);

    const enter = () => ref.current?.requestFullscreen?.();
    const exit = () => document.fullscreenElement && document.exitFullscreen();

    return { isFullscreen, enter, exit };
}

function FullscreenButton({ isFullscreen, onEnter, onExit }) {
    if (isFullscreen) {
        return (
            <button
                onClick={onExit}
                className="fixed top-4 right-4 z-[100] h-10 w-10 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition shadow-lg backdrop-blur-sm"
                title="Exit Fullscreen"
            >
                <X size={18} />
            </button>
        );
    }
    return (
        <button
            onClick={onEnter}
            className="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition shrink-0"
            title="View Fullscreen"
        >
            <Maximize2 size={16} />
        </button>
    );
}

// Builds the exercise URL safely.
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
    // Scopes the exercise page to only the exercise(s) attached to this
    // specific lesson (via ExerciseModule.content_module_id) instead of
    // every exercise in the subtopic.
    if (selectedModule?._id) params.set("contentModuleId", selectedModule._id);
    return `/dashboard/exercise?${params.toString()}`;
}

function buildPracticeUrl(selectedModule) {
    return `/dashboard/module/practice-quations?data=${encodeURIComponent(
        JSON.stringify(selectedModule),
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
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${isActive
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

function PrevNextNav({
    previousModule,
    nextModule,
    currentIndex,
    total,
    onNavigate,
    accent,
}) {
    return (
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <button
                disabled={!previousModule}
                onClick={() => previousModule && onNavigate(previousModule)}
                className={`px-5 py-3 rounded-xl font-semibold transition ${previousModule
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
                className={`px-5 py-3 rounded-xl font-semibold text-white transition ${nextModule
                    ? `${accent.solid} ${accent.solidHover}`
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
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

function ActionCard({
    icon: Icon,
    iconClass,
    title,
    description,
    buttonLabel,
    buttonClass,
    onClick,
}) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconClass}`}
            >
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

function RelatedQueueList({
    title,
    icon: Icon,
    items,
    activeId,
    onSelect,
    accent,
    getSubtitle,
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-200 bg-white">
                <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-slate-700">
                    <Icon className={accent.text} size={14} />
                    {title}
                </h3>
            </div>

            {items.length === 0 ? (
                <p className="text-xs text-slate-400 px-4 py-6 text-center">
                    No other lessons in this list yet.
                </p>
            ) : (
                <div className="max-h-[280px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {items.map((item) => {
                        const isActive = activeId === item._id;
                        return (
                            <button
                                key={item._id}
                                onClick={() => onSelect(item)}
                                className={`w-full p-3 rounded-xl flex gap-3 text-left border transition ${isActive
                                    ? `${accent.bg} ${accent.border}`
                                    : "hover:bg-slate-50 border-transparent"
                                    }`}
                            >
                                <div
                                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isActive
                                        ? `${accent.solid} text-white`
                                        : "bg-slate-100 text-slate-500"
                                        }`}
                                >
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4
                                        className={`text-xs font-bold truncate ${isActive ? accent.text : "text-slate-800"}`}
                                    >
                                        {item.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-400">
                                        {getSubtitle ? getSubtitle(item) : ""}
                                    </span>
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

function WideRow({
    onClick,
    iconBg,
    icon,
    eyebrow,
    eyebrowClass,
    title,
    middle,
    right,
}) {
    return (
        <div
            onClick={onClick}
            className="group relative bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex items-center gap-4 cursor-pointer col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4"
        >
            <div
                className={`h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md relative overflow-hidden transition-all duration-300 ${iconBg}`}
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
                    <h3 className="font-extrabold text-sm md:text-base text-slate-900 truncate tracking-tight group-hover:text-orange-600 transition-colors">
                        {title}
                    </h3>
                </div>

                {middle && (
                    <div className="hidden md:block md:col-span-4">{middle}</div>
                )}
                <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                    {right}
                </div>
            </div>
        </div>
    );
}

function ExerciseRow({ item, onSelect }) {
    return (
        <WideRow
            onClick={() => onSelect(item)}
            iconBg="bg-gradient-to-br from-indigo-950 to-slate-900 group-hover:from-orange-500 group-hover:to-orange-600"
            icon={
                <Award
                    className="z-10 group-hover:scale-110 transition-transform text-orange-400 group-hover:text-white"
                    size={22}
                />
            }
            eyebrow={
                item.exercise_type === "mcq" ? "Quiz Assessment" : "Fill In Blanks"
            }
            eyebrowClass="bg-indigo-50 text-indigo-600 border-indigo-100"
            title={item.title}
            middle={
                <p className="text-xs text-slate-400 font-medium truncate">
                    {item.max_attempts || 5} attempt
                    {(item.max_attempts || 5) === 1 ? "" : "s"} allowed · Difficulty:{" "}
                    {item.difficulty || "medium"}
                </p>
            }
            right={
                <>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <HelpCircle size={12} className="text-indigo-500" />
                        <span>
                            {item.total_marks ? `${item.total_marks} Pts` : "Practice"}
                        </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                        <RotateCcw
                            className="group-hover:rotate-45 transition-transform"
                            size={12}
                        />
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
            icon={
                <Headphones
                    className="z-10 group-hover:scale-110 transition-transform text-orange-400 group-hover:text-white"
                    size={22}
                />
            }
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
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(item.description || "No context description.",)
                        }}
                    />
                )
            }
            right={
                <>
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
                </>
            }
        />
    );
}

function TextRow({ item, onSelect }) {
    return (
        <WideRow
            onClick={() => onSelect(item)}
            // Orange theme transition
            iconBg="bg-orange-50 group-hover:bg-orange-500 transition-colors duration-200"
            icon={
                <FileText
                    className="text-orange-500 group-hover:text-white transition-all duration-200 group-hover:scale-105"
                    size={18}
                />
            }
            eyebrow="Text Lesson"
            eyebrowClass="bg-orange-50 text-orange-600 border-orange-100"
            title={item.title}
           
                 middle={
                item.description?.speaker_name ? (
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                        <User size={10} /> {item.audio.speaker_name}
                    </span>
                ) : (
                    <div
                        className="text-xs text-slate-400 line-clamp-1 pr-4 prose prose-slate"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(item.description || "No context description.",)
                        }}
                    />
                )
            }
            right={
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        <Clock size={11} />
                        <span>
                            {item.content?.read_time_min ? `${item.content.read_time_min}m` : "Quick"}
                        </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                        <ChevronRight size={12} />
                    </div>
                </div>
            }
        />
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
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description || "")
                        }}
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

// Same NotSupportedError guard as VideoCard's thumbnail (see its comment) —
// pulled into its own component because it lives inside a .map() and needs
// its own per-item error state.
function RelatedVideoThumb({ video }) {
    const [failed, setFailed] = useState(false);
    const playableUrl = getPlayableVideoUrl(video);

    if (!playableUrl || failed) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-200">
                <Play className="text-slate-400 fill-current" size={24} />
            </div>
        );
    }

    return (
        <video
            src={`${playableUrl}#t=2`}
            preload="metadata"
            muted
            playsInline
            onError={() => setFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
        />
    );
}

function VideoCard({ item, type, onSelect }) {
    const thumbnailSource =
        item.video?.thumbnail_url || item.thumbnail || item.thumbnail_url;
    // A bare <video src> that fails to load (e.g. still downloading locally,
    // or a stale AWS link) fires a MediaError the browser surfaces as an
    // uncaught "NotSupportedError" — Next's dev overlay treats that as a
    // crash even though it's harmless here. Falling back to the placeholder
    // icon on error avoids ever leaving a broken <video> in the DOM.
    const [thumbFailed, setThumbFailed] = useState(false);
    const playableUrl = getPlayableVideoUrl(item.video);

    return (
        <div
            onClick={() => onSelect(item)}
            className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
            <div className="aspect-video w-full bg-slate-950 relative overflow-hidden border-b border-slate-100 flex items-center justify-center">
                {thumbnailSource ? (
                    <Image
                        src={thumbnailSource}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : playableUrl && !thumbFailed ? (
                    <video
                        src={`${playableUrl}#t=2`}
                        preload="metadata"
                        muted
                        playsInline
                        onError={() => setThumbFailed(true)}
                        className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <Play className="text-slate-500 fill-slate-500" size={16} />
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/30">
                    <div className="h-12 w-12 rounded-full bg-white/90 text-slate-900 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110">
                        <Play
                            className="fill-current ml-0.5 transition-transform"
                            size={20}
                        />
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
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(item.description || "No description available.",)
                        }}
                    />
                </div>

                <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Clock size={14} />
                        Available Now
                    </span>
                    <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-md group-hover:shadow-orange-500/30 group-hover:scale-105 transition-all duration-300">
                        Start Lesson <Play className="fill-current text-white/90" size={10} />
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
    const relatedVideos = videoModules.filter(
        (m) => m._id !== selectedModule._id,
    );

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <BackToLessonsButton onBack={onBack} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video shadow-xl border border-slate-200">
             <VideoPlayer
  src={getPlayableVideoUrl(selectedModule.video) || undefined}
  poster={
    selectedModule.video?.thumbnail_url?.trim() ||
    undefined
  }
  onEnded={onComplete}
/>
                    </div>

                    <div className="space-y-5">
                        <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${accent.bg} ${accent.text} ${accent.border}`}
                        >
                            {accent.label}
                        </span>
                        <h1 className="text-2xl font-extrabold text-slate-900">
                            {selectedModule.title}
                        </h1>

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
                        onExercise={() =>
                            router.push(buildExerciseUrl(selectedModule, searchParams))
                            
                        }

                    />
                </div>
            </div>

            {relatedVideos.length > 0 && (
                <div>
                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-4">
                        More Lessons
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {relatedVideos.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => onNavigate(item)}
                                className="group block text-left bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                    {item.thumbnail || item.video?.thumbnail_url ? (
                                        <Image
                                            src={item.thumbnail || item.video?.thumbnail_url}
                                            alt={item.title}
                                            fill
                                            sizes="(min-width: 1024px) 20vw, 50vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <RelatedVideoThumb video={item.video} />
                                    )}

                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition">
                                        <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                            <Play
                                                className="fill-current ml-0.5 text-slate-900"
                                                size={18}
                                            />
                                        </div>
                                    </div>

                                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                                        Video
                                    </div>

                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-[9px]">
                                        {item.video?.duration_sec
                                            ? `${Math.floor(item.video.duration_sec / 60)}m`
                                            : item.duration || "5m"}
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
const containerRef = useRef(null);
    const { isFullscreen, enter, exit } = useFullscreen(containerRef);
    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
            <BackToLessonsButton onBack={onBack} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <div
                        ref={containerRef}
                        className={`bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-6 ${isFullscreen ? "h-screen w-screen overflow-y-auto rounded-none" : ""
                            }`}
                    >
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-3 gap-3">
                                    {/* Left Side - Badges */}
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm flex items-center gap-1 ${accent.bg} ${accent.text} ${accent.border}`}
                                        >
                                            <Headphones size={12} />
                                            {accent.label}
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

                                    {/* Right Side - Fullscreen */}
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={isFullscreen ? exit : enter}
                                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:scale-105 active:scale-95"
                                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                        >
                                            {isFullscreen ? (
                                                <Minimize2 size={18} strokeWidth={2.2} />
                                            ) : (
                                                <Maximize2 size={18} strokeWidth={2.2} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                                    {selectedModule.title}
                                </h1>

                                <div
                                    className="text-sm text-slate-500 mt-2 prose prose-slate max-w-none"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedModule.description || "")
                        }}
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
                                {selectedModule.audio?.url ? (
                                    <audio
                                        key={selectedModule._id}
                                        src={getPlayableAudioUrl(selectedModule.audio)}
                                        controls
                                        className="w-full sm:w-72 md:w-96 focus:outline-none"
                                        onEnded={onComplete}
                                        onError={() =>
                                            toast.error("This audio failed to load.")
                                        }
                                    />
                                ) : (
                                    <p className="text-sm text-slate-400 italic">
                                        Audio not available.
                                    </p>
                                )}
                            </div>

                            <hr className="border-slate-100" />

                            {selectedModule.audio?.transcript && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <FileText size={14} /> Audio Lesson Transcript
                                    </h3>
                                    <div
                                        className="bg-slate-50/50 border border-slate-100 text-slate-800 p-5 rounded-xl text-sm md:text-base leading-relaxed prose prose-slate max-w-none shadow-sm"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedModule.audio.transcript)
                        }}
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

                             <RelatedQueueList
                        title="Related Audios Queue"
                        icon={Headphones}
                        items={audioModules}
                        activeId={selectedModule._id}
                        onSelect={onNavigate}
                        accent={accent}
                        getSubtitle={(item) =>
                            item.audio?.duration_sec
                                ? `${Math.floor(item.audio.duration_sec / 60)}m`
                                : "Audio"
                        }
                    />
                        </div>
                        
                    </div>

                   
                </div>

                <div className="lg:col-span-4">
                    <LessonActionsPanel
                        onPractice={() => router.push(buildPracticeUrl(selectedModule))}
                        onExercise={() =>
                            router.push(buildExerciseUrl(selectedModule, searchParams))
                        }

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
    const containerRef = useRef(null);
    const { isFullscreen, enter, exit } = useFullscreen(containerRef);
    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
            <BackToLessonsButton onBack={onBack} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <div
                        ref={containerRef}
                        className={`bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6 ${isFullscreen ? "h-screen w-screen overflow-y-auto rounded-none" : ""
                            }`}
                    >
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/50 space-y-6">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                {/* Left Side */}
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${accent.bg} ${accent.text} ${accent.border}`}
                                    >
                                        {accent.label}
                                    </span>

                                    {selectedModule.content?.level && (
                                        <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                                            <GraduationCap size={12} />
                                            Level {selectedModule.content.level}
                                        </span>
                                    )}

                                    {selectedModule.content?.read_time_min && (
                                        <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                                            <Clock size={12} />
                                            {selectedModule.content.read_time_min} mins read
                                        </span>
                                    )}
                                </div>

                                {/* Right Side */}
                                <button
                                    onClick={isFullscreen ? exit : enter}
                                    className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:scale-105 active:scale-95"
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? (
                                        <Minimize2 size={18} strokeWidth={2.2} />
                                    ) : (
                                        <Maximize2 size={18} strokeWidth={2.2} />
                                    )}
                                </button>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                                {selectedModule.title}
                            </h1>

                            <div
                                className="text-sm text-slate-500 mt-2 italic border-l-2 border-slate-200 pl-3 prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedModule.description || "")
                        }}
                            />

                            <hr className="border-slate-100" />

                            <div
                                className="bg-slate-50 border border-slate-100 rounded-xl p-6 prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedModule.content?.body || "")
                        }}
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
                </div>

                <div className="lg:col-span-4">
                    <LessonActionsPanel
                        onPractice={() => router.push(buildPracticeUrl(selectedModule))}
                        onExercise={() =>
                            router.push(buildExerciseUrl(selectedModule, searchParams))}
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
    const containerRef = useRef(null);
    const { isFullscreen, enter, exit } = useFullscreen(containerRef);

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
            <BackToLessonsButton onBack={onBack} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                    <div
                        ref={containerRef}
                        className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${isFullscreen ? "h-screen w-screen overflow-y-auto rounded-none" : ""
                            }`}
                    >
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                                {/* Left */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${accent.bg} ${accent.text} ${accent.border}`}
                                    >
                                        {accent.label}
                                    </span>
                                </div>

                                {/* Right */}
                                <button
                                    onClick={isFullscreen ? exit : enter}
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                >
                                    {isFullscreen ? (
                                        <Minimize2 size={18} strokeWidth={2.2} />
                                    ) : (
                                        <Maximize2 size={18} strokeWidth={2.2} />
                                    )}
                                </button>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-black text-slate-900 mb-2">
                                {selectedModule.title}
                            </h2>

                            {/* Description */}
                            <div
                                className="text-slate-600 mb-6 prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHtml(selectedModule.description || "",)
                        }}
                            />

                            {/* Vocabulary */}
                            <div className="grid grid-cols-1 gap-4">
                                {selectedModule.words?.map((wordObj, i) => (
                                    <div
                                        key={i}
                                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl"
                                    >
                                        <h4 className="text-lg font-bold text-amber-700">
                                            {wordObj.word}
                                        </h4>

                                        <p className="text-xs text-slate-500 italic mb-2">
                                            /{wordObj.pronunciation}/ • {wordObj.part_of_speech}
                                        </p>

                                        <p className="text-sm text-slate-700 mb-2">
                                            {wordObj.meaning}
                                        </p>

                                        <p className="text-sm italic text-slate-500 bg-white p-2 rounded border border-slate-100">
                                            <span className="font-bold text-slate-800">
                                                Example:
                                            </span>{" "}
                                            {wordObj.example}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="pt-6 mt-2">
                                <PrevNextNav
                                    previousModule={previousModule}
                                    nextModule={nextModule}
                                    currentIndex={currentModuleIndex}
                                    total={currentModuleList.length}
                                    onNavigate={onNavigate}
                                    accent={accent}
                                />

                                  {/* More Lessons */}
                    <div className="space-y-4 mt-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="text-orange-500" size={16} />
                                More Vocabulary Lessons
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
                            getSubtitle={(item) =>
                                `${item.words?.length || 0} Words • ${item.questions?.length || 0
                                } Questions`
                            }
                        />
                    </div>
                            </div>
                        </div>
                    </div>

                  
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-4">
                    <LessonActionsPanel
                        onPractice={() => router.push(buildPracticeUrl(selectedModule))}
                        onExercise={() =>
                            router.push(buildExerciseUrl(selectedModule, searchParams))
                        }

                    />
                </div>
            </div>
        </div>
    );
}

function formatDuration(totalSeconds) {
    const secs = Number(totalSeconds) || 0;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function AttemptStrip({ attempts, onSelect }) {
    if (!attempts || attempts.length === 0) return null;
    return (
        <div className="space-y-4 mt-2">
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Clock className="text-orange-400" size={16} /> Previous Attempts
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                {attempts.map((a, i) => (
                    <button
                        key={a._id || i}
                        onClick={() => onSelect(a)}
                        className="shrink-0 w-44 text-left rounded-2xl border-2 border-slate-100 bg-white hover:border-orange-200 hover:shadow-lg transition-all p-4 cursor-pointer"
                    >
                        <p className="text-xs font-black text-slate-400 uppercase mb-2">
                            Attempt {a.attempt_number}
                        </p>
                        <p className="text-2xl font-black text-slate-900">
                            {a.score}
                            <span className="text-sm font-bold text-slate-400 ml-0.5">/{a.max_score}</span>
                        </p>
                        <span
                            className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${a.is_passed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-orange-50 text-orange-700"
                                }`}
                        >
                            {a.is_passed ? "Passed" : "Failed"}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function AttemptResultModal({ attempt, onClose }) {
    if (!attempt) return null;
    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white text-center">
                    <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute -bottom-10 right-10 h-32 w-32 rounded-full bg-yellow-200/20 blur-3xl" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                    <div className="relative mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                        <Award size={30} />
                    </div>
                    <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">
                        Attempt {attempt.attempt_number}
                    </p>
                    <h3 className="relative text-xl font-black mt-1">
                        {attempt.is_passed ? "Passed" : "Not Passed"}
                    </h3>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-orange-500">
                                Score
                            </p>
                            <p className="mt-1 text-2xl font-black text-slate-900">
                                {attempt.score}
                                <span className="text-sm text-slate-400"> / {attempt.max_score}</span>
                            </p>
                        </div>
                        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-amber-500">
                                Accuracy
                            </p>
                            <p className="mt-1 text-2xl font-black text-slate-900">
                                {attempt.accuracy}
                                <span className="text-sm text-slate-400">%</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} /> {formatDuration(attempt.time_spent_sec)}
                        </span>
                        {attempt.submitted_at && (
                            <span>{new Date(attempt.submitted_at).toLocaleString()}</span>
                        )}
                    </div>

                    <div
                        className={`text-center px-4 py-3 rounded-full text-sm font-bold ${attempt.is_passed
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                            }`}
                    >
                        {attempt.is_passed ? "🎉 Passed Successfully" : "📖 Keep Practicing"}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PreAssessment({ selectedModule, onStart, attempts, onSelectAttempt }) {
    const maxAttempts = selectedModule.max_attempts || 5;
    const attemptsUsed = attempts?.length || 0;
    const isExhausted = attemptsUsed >= maxAttempts;
    const bestAttempt = (attempts || []).reduce(
        (best, a) => (!best || a.score > best.score ? a : best),
        null,
    );

    if (isExhausted) {
        return (
            <>
                <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-8 text-center space-y-3 mb-6">
                    <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                        <Award className="text-orange-500" size={28} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-800">Exercise Completed</h4>
                    <p className="text-lg font-medium text-slate-500 max-w-lg mx-auto">
                        You&apos;ve used all {maxAttempts} attempt{maxAttempts === 1 ? "" : "s"} for this
                        exercise.
                        {bestAttempt && (
                            <>
                                {" "}
                                Your best score was{" "}
                                <span className="font-black text-orange-600">
                                    {bestAttempt.score}/{bestAttempt.max_score}
                                </span>
                                .
                            </>
                        )}
                    </p>
                </div>
                <AttemptStrip attempts={attempts} onSelect={onSelectAttempt} />
            </>
        );
    }

    return (
        <div className="space-y-5 text-base">
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="text-orange-500" size={18} /> Evaluation Rules
                </h4>
                <ul className="text-[15px] font-medium text-slate-600 space-y-2.5 pl-2 list-none">
                    {selectedModule.shuffle_questions && (
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Questions randomized dynamically.</li>
                    )}
                    {selectedModule.show_explanation && (
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Step-by-step resolution provided.</li>
                    )}
                    {!selectedModule.shuffle_questions &&
                        !selectedModule.show_explanation && (
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Answer each question, then submit to see your score.</li>
                        )}
                    <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <span className="text-slate-800 font-semibold">{maxAttempts - attemptsUsed} of {maxAttempts} attempt{maxAttempts === 1 ? "" : "s"}</span> remaining.
                    </li>
                </ul>
            </div>
            <div className="flex justify-center mt-2 mb-2">
                <button
                    onClick={onStart}
                    className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-full shadow-[0_8px_30px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_40px_rgba(34,197,94,0.6)] transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    <span className="relative z-10 tracking-wide">Start Assessment Activity Now</span>
                    <ChevronRight size={22} className="relative z-10 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            <AttemptStrip attempts={attempts} onSelect={onSelectAttempt} />
        </div>
    );
}

function ScoreGauge({ percent, passed }) {
    const r = 54;
    const circumference = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(100, percent || 0));
    const offset = circumference * (1 - clamped / 100);

    return (
        <div className="relative w-32 h-32 mx-auto">
            <svg width="128" height="128" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={r} fill="none" stroke="#fde8d3" strokeWidth="10" />
                <circle
                    cx="64"
                    cy="64"
                    r={r}
                    fill="none"
                    stroke={passed ? "#f97316" : "#f59e0b"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 64 64)"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900">{clamped}%</span>
                <Award size={14} className={passed ? "text-orange-500" : "text-amber-500"} />
            </div>
        </div>
    );
}

function QuizResults({ resultData, onDone, onReview, hasReview }) {
    return (
        <div className="py-10 animate-fade-in">
            <div className="max-w-lg mx-auto">
                <div className="flex justify-center">
                    <ScoreGauge percent={resultData?.accuracy} passed={resultData?.is_passed} />
                </div>

                <div className="text-center mt-6">
                    <h3 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                        {resultData?.is_passed
                            ? "Congratulations!"
                            : "Assessment Completed"}
                    </h3>
                    <p className="mt-2 text-slate-500">
                        {resultData?.is_passed
                            ? "Excellent work! You successfully passed this assessment."
                            : "Nice effort! Try again and keep improving."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-8">
                    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-widest font-bold text-orange-500">
                            Score
                        </p>
                        <h2 className="mt-2 text-3xl font-black text-slate-900">
                            {resultData?.score}
                            <span className="text-lg text-slate-400">
                                {" "}
                                / {resultData?.max_score}
                            </span>
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-widest font-bold text-amber-500">
                            Accuracy
                        </p>
                        <h2 className="mt-2 text-3xl font-black text-slate-900">
                            {resultData?.accuracy}
                            <span className="text-lg text-slate-400">%</span>
                        </h2>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <div
                        className={`px-6 py-3 rounded-full text-sm font-bold ${resultData?.is_passed
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                            }`}
                    >
                        {resultData?.is_passed
                            ? "🎉 Passed Successfully"
                            : "📖 Keep Practicing"}
                    </div>
                </div>

                <div className="mt-10 flex gap-3">
                    {hasReview && (
                        <button
                            onClick={onReview}
                            className="flex-1 rounded-2xl border-2 border-orange-200 text-orange-600 hover:bg-orange-50 py-4 font-bold transition-all duration-300"
                        >
                            View Answers
                        </button>
                    )}
                    <button
                        onClick={onDone}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 py-4 font-bold text-white shadow-lg shadow-orange-300/40 transition-all duration-300 hover:scale-[1.02]"
                    >
                        ← Back to Exercises
                    </button>
                </div>
            </div>
        </div>
    );
}

// Turns the compact string the backend grades against (e.g.
// "Evaporation,Condensation,..." or "India:Delhi|Japan:Tokyo") back into a
// readable form for the review screen, using the question's own metadata.
function prettifyAnswer(question, raw) {
    if (raw === undefined || raw === null || raw === "") return "(no answer)";
    switch (question?.question_type) {
        case "reorder":
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

function ReviewScreen({ selectedModule, questionResults, onBack }) {
    return (
        <div className="py-6 animate-fade-in space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-orange-600 hover:border-orange-200 shadow-sm transition-all"
                >
                    <ArrowLeft size={16} /> Back to result
                </button>
                <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Reviewing {questionResults.length} Questions
                </div>
            </div>

            <div className="space-y-4">
                {questionResults.map((r, i) => {
                    const q = selectedModule.questions[r.question_index ?? i] || {};
                    const isCorrect = r.is_correct;

                    return (
                        <div
                            key={i}
                            className={`rounded-3xl border p-6 space-y-5 transition-all shadow-sm ${
                                isCorrect
                                    ? "border-emerald-300 bg-emerald-50"
                                    : "border-rose-300 bg-rose-50"
                            }`}
                        >
                            {/* Question Header Card info */}
                            <div className={`flex items-center justify-between border-b pb-4 ${
                                isCorrect ? "border-emerald-200" : "border-rose-200"
                            }`}>
                                <div className="flex items-center gap-3">
                                    <span className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                        isCorrect ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"
                                    }`}>
                                        {(r.question_index ?? i) + 1}
                                    </span>
                                    <div>
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                                            Question {(r.question_index ?? i) + 1}
                                        </span>
                                        <span className="text-xs font-bold text-slate-700">
                                            {q.marks || 1} {(q.marks || 1) > 1 ? "Marks" : "Mark"}
                                        </span>
                                    </div>
                                </div>

                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                                        isCorrect
                                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                            : "bg-rose-100 text-rose-800 border-rose-300"
                                    }`}
                                >
                                    {isCorrect ? <Check size={14} /> : <X size={14} />}
                                    {isCorrect ? "Correct" : "Incorrect"}
                                </span>
                            </div>

                            {/* Question Text */}
                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                                {r.question_text || q.question_text}
                            </h3>

                            {/* Answers Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="rounded-2xl bg-white border border-slate-200/80 p-4 space-y-1.5 shadow-xs">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        Your Answer
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {prettifyAnswer(q, r.given_answer)}
                                    </p>
                                </div>

                                {!isCorrect && (
                                    <div className="rounded-2xl bg-white border border-emerald-200 p-4 space-y-1.5 shadow-xs">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                            Correct Answer
                                        </p>
                                        <p className="text-sm font-bold text-emerald-950">
                                            {prettifyAnswer(q, r.correct_answer)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Explanation Box */}
                            {r.explanation && (
                                <div className="flex items-start gap-3 text-xs text-amber-950 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
                                    <div className="h-7 w-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                                        <Lightbulb size={15} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block">
                                            Explanation
                                        </span>
                                        <div
                                            className="prose prose-sm text-slate-800 leading-relaxed [&_p]:m-0"
                                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(r.explanation) }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
    /* =========================================================================
   PER-TYPE ANSWER INPUTS (Exercise "Challenge Activity" quiz)
   Answer shapes: see src/utils/questionAnswers.js
   ========================================================================= */

function ChoiceOptions({ question, answer, setAnswer, grid = false }) {
    return (
        <div className={grid ? "grid grid-cols-2 gap-3" : "space-y-3"}>
            {question.options.map((opt, i) => (
                <button
                    key={i}
                    onClick={() => setAnswer({ value: opt })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answer?.value === opt
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 hover:border-orange-300"
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
            className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-orange-500 outline-none"
            placeholder={placeholder}
        />
    );
}

function ShortAnswerInput({ answer, setAnswer }) {
    return (
        <textarea
            rows={4}
            value={answer?.text || ""}
            onChange={(e) => setAnswer({ text: e.target.value })}
            className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-orange-500 outline-none resize-none"
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
        <div className="space-y-3">
            <div className="min-h-14 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/40 flex flex-wrap items-center gap-2 p-3">
                {order.length === 0 && (
                    <span className="text-sm text-slate-400 italic">
                        Tap items below to build your answer…
                    </span>
                )}
                {order.map((id, pos) => (
                    <button
                        key={pos}
                        onClick={() => setAnswer({ order: order.filter((_, i) => i !== pos) })}
                        className="px-3.5 py-2 rounded-lg border-2 border-orange-400 bg-orange-100 text-orange-800 font-semibold text-sm hover:border-orange-500"
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
                        className="px-3.5 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300"
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
    const rightPool = useMemo(() => shuffledPool(matchPairs.map((p) => p.right)), [matchPairs]);
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
                                    : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
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
                            ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                            : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
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
        // Authored "recorder" content is an arrange-the-words task (options
        // are discrete words/phrases, correct_answer is them joined in
        // order) — not an audio recording — so it reuses the sequence
        // builder used for "reorder".
        case "recorder":
            return <SequenceBuilder question={question} answer={answer} setAnswer={setAnswer} />;
        case "spell_word":
            // Authored "spell_word" content gives whole candidate spellings
            // as options (e.g. "Recommend" / "Recomend" / "Reommend"), not
            // individual letters, so it's a plain choice among them.
            return <ChoiceOptions question={question} answer={answer} setAnswer={setAnswer} />;
        case "match":
            return <MatchBuilder question={question} answer={answer} setAnswer={setAnswer} />;
        default:
            return <TextAnswerInput answer={answer} setAnswer={setAnswer} />;
    }
}

function formatTimer(totalSeconds) {
    const secs = Math.max(0, Math.floor(totalSeconds || 0));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ActiveQuiz({
    selectedModule,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    setUserAnswers,
    onSubmit,
    onTimeUp,
}) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [timeLeft, setTimeLeft] = useState(selectedModule.time_limit_sec || null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!selectedModule.time_limit_sec) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [selectedModule.time_limit_sec]);

    // Separate useEffect to handle time expiration safely outside render phase
    useEffect(() => {
        if (timeLeft === 0 && onTimeUp) {
            onTimeUp();
        }
    }, [timeLeft, onTimeUp]);

    const questions = selectedModule.questions || [];
    const total = questions.length;

    if (total === 0) {
        return (
            <p className="text-sm text-slate-500">
                No questions available for this exercise.
            </p>
        );
    }

    const q = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === total - 1;
    const answer = userAnswers[currentQuestionIndex];
    const setAnswer = (next) =>
        setUserAnswers({ ...userAnswers, [currentQuestionIndex]: next });
    const timePct =
        selectedModule.time_limit_sec != null
            ? Math.max(0, Math.min(100, (timeLeft / selectedModule.time_limit_sec) * 100))
            : null;

    return (
        <div className="space-y-4">
            {timePct !== null && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="font-black text-slate-800 truncate pr-3">
                            {selectedModule.title}
                        </span>
                        <span className="font-black text-slate-800 flex items-center gap-1.5 shrink-0">
                            <Clock size={16} /> Time: {formatTimer(timeLeft)}
                        </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500">
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-white border-2 border-slate-700 flex items-center justify-center shadow transition-all duration-1000"
                            style={{ left: `${timePct}%` }}
                        >
                            <Clock size={11} className="text-slate-700" />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="h-10 w-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center shrink-0">
                                {currentQuestionIndex + 1}
                            </span>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                                Question {currentQuestionIndex + 1} of {total}
                            </p>
                        </div>
                        <span className="text-xs font-bold text-slate-500 shrink-0">
                            • {q.marks || 1} Mark{(q.marks || 1) > 1 ? "s" : ""}
                        </span>
                    </div>

                    <p className="text-xl font-bold text-slate-800">{q.question_text}</p>

                    <QuestionInput question={q} answer={answer} setAnswer={setAnswer} />

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-40 hover:bg-slate-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>

                        <div className="flex items-center gap-3">
                            {!isLastQuestion && (
                                <button
                                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-all cursor-pointer"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            )}
                            {questions.every((qq, i) => hasAnswer(qq, userAnswers[i])) && (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl shadow-[0_4px_15px_rgba(34,197,94,0.4)] hover:shadow-[0_8px_25px_rgba(34,197,94,0.5)] transition-all duration-300 overflow-hidden cursor-pointer"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                                    <span className="relative z-10 tracking-wide">Submit Exercise</span>
                                    <ChevronRight size={16} className="relative z-10 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 h-fit">
                    <h4 className="font-black text-slate-800 text-sm">Questions</h4>
                    <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                        {questions.map((qq, i) => {
                            const answered = hasAnswer(qq, userAnswers[i]);
                            const isCurrent = i === currentQuestionIndex;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQuestionIndex(i)}
                                    className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer border-2 ${isCurrent
                                        ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200"
                                        : answered
                                            ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200"
                                            : "bg-yellow-400 border-yellow-400 text-white"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wide">
                            Legend
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="h-3 w-3 rounded-full bg-green-500 shrink-0" /> Attempted
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="h-3 w-3 rounded-full bg-blue-500 shrink-0" /> Current Question
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="h-3 w-3 rounded-full bg-yellow-400 shrink-0" /> Unattempted
                        </div>
                    </div>
                </div>
            </div>

            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto w-16 h-16 rounded-full border-2 border-sky-300 flex items-center justify-center mb-4">
                            <HelpCircle size={30} className="text-sky-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Are you sure?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Once submitted, you cannot change your answers.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    onSubmit();
                                }}
                                className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all cursor-pointer"
                            >
                                Yes, Submit
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all cursor-pointer"
                            >
                                No, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
    attempts,
    onSelectAttempt,
    questionResults,
    showReview,
    setShowReview,
}) {
    // StatusModal state management
    const [modalState, setModalState] = useState({
        open: false,
        type: "warning",
        title: "",
        message: "",
        onClose: null,
    });

    const triggerModal = (type, title, message, onClose = null) => {
        setModalState({
            open: true,
            type,
            title,
            message,
            onClose: () => {
                setModalState((prev) => ({ ...prev, open: false }));
                if (onClose) onClose();
            },
        });
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-4 animate-fade-in">
            {/* Status Modal Integration */}
            <StatusModal
                open={modalState.open}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
                onClose={modalState.onClose}
            />

            <BackToLessonsButton onBack={onBack} />

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl min-h-[calc(100vh-140px)]">
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

                    <h2 className="relative text-2xl font-black tracking-tight">
                        {selectedModule.title}
                    </h2>
                    <p className="relative mt-1 text-sm text-orange-50">
                        Complete the challenge to test your understanding.
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {!isQuizActive && !showResults ? (
                        <PreAssessment
                            selectedModule={selectedModule}
                            attempts={attempts}
                            onSelectAttempt={onSelectAttempt}
                            onStart={() => {
                                onStart?.();
                                setIsQuizActive(true);
                            }}
                        />
                    ) : showResults ? (
                        showReview ? (
                            <ReviewScreen
                                selectedModule={selectedModule}
                                questionResults={questionResults}
                                onBack={() => setShowReview(false)}
                            />
                        ) : (
                            <QuizResults
                                resultData={resultData}
                                onDone={() => router.back()}
                                onReview={() => setShowReview(true)}
                                hasReview={questionResults && questionResults.length > 0}
                            />
                        )
                    ) : (
                        <ActiveQuiz
                            selectedModule={selectedModule}
                            currentQuestionIndex={currentQuestionIndex}
                            setCurrentQuestionIndex={setCurrentQuestionIndex}
                            userAnswers={userAnswers}
                            setUserAnswers={setUserAnswers}
                            onSubmit={onSubmit}
                            onTimeUp={() => {
                                triggerModal(
                                    "warning",
                                    "Time's Up!",
                                    "You ran out of time for this exercise. Try again!",
                                    () => {
                                        setIsQuizActive(false);
                                        setUserAnswers({});
                                        setCurrentQuestionIndex(0);
                                    }
                                );
                            }}
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

function ModuleListPageContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();


      const startTimeRef = useRef(Date.now());
const attendanceLoggedRef = useRef(false);
const moduleStartTimeRef = useRef(Date.now());

    const rawType = params?.type;

    const typeValue = Array.isArray(rawType)
        ? rawType[0]
        : rawType;

    const type =
        typeValue &&
        typeValue !== "null" &&
        typeValue !== "undefined"
            ? String(typeValue).toLowerCase()
            : null;

    const subtopicId = params?.subtopicId;

    const [selectedModule, setSelectedModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);

    const [activeTab, setActiveTab] = useState(type || "video");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("default");

    const [resultData, setResultData] = useState(null);
    const [isQuizActive, setIsQuizActive] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [attempts, setAttempts] = useState([]);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [questionResults, setQuestionResults] = useState([]);
    const [showReview, setShowReview] = useState(false);

    
       useEffect(() => {
        if (type) {
           setActiveTab(type);
        }
    }, [type]);


        const logModuleActivity = useCallback(
        async (module, activityType, extra = {}) => {
            if (!module) return;

            try {
                await activityApi.logActivity({
                    topic_id:
                        module.topic_id?._id ||
                        module.topic_id,

                    sub_topic_id:
                        module.sub_topic_id?._id ||
                        module.sub_topic_id,

                    module_id: module._id,

                    module_type:
                        module.module_type ||
                        type,

                    activity_type: activityType,

                    ...extra,
                });
            } catch (error) {
                console.error(
                    "Failed to log activity:",
                    error
                );
            }
        },
        [type]
    );

      const logModuleTime = useCallback(
        async (module) => {
            if (!module) return;

            const elapsed = Math.floor(
                (Date.now() -
                    moduleStartTimeRef.current) /
                    1000
            );

            if (elapsed <= 0) return;

            try {
                await activityApi.logActivity({
                    topic_id:
                        module.topic_id?._id ||
                        module.topic_id,

                    sub_topic_id:
                        module.sub_topic_id?._id ||
                        module.sub_topic_id,

                    module_id: module._id,

                    module_type:
                        module.module_type ||
                        type,

                    activity_type: "module_time",

                    time_spent_sec: elapsed,
                });
            } catch (error) {
                console.error(
                    "Failed to log module time:",
                    error
                );
            }
        },
        [type]
    );

    // Sync selectedModule with URL to allow breadcrumb / back-button navigation
    useEffect(() => {
        const lessonId = searchParams.get("lessonId");

        if (!lessonId) {
            setSelectedModule((prev) => {
                return prev !== null ? null : prev;
            });

            return;
        }

        if (!modules.length) return;

        const found = modules.find(
            (module) => module?._id === lessonId
        );

        setSelectedModule((prev) => {
            if (prev?._id === found?._id) {
                return prev;
            }

            return found || null;
        });
    }, [searchParams, modules]);



    // Mark today's attendance the first time a module is opened in this visit
    useEffect(() => {
        if (
            !selectedModule ||
            attendanceLoggedRef.current
        ) {
            return;
        }

        attendanceLoggedRef.current = true;

        logModuleActivity(
            selectedModule,
            "attendance_marked"
        );
    }, [
        selectedModule,
        logModuleActivity,
    ]);




    useEffect(() => {
    moduleStartTimeRef.current = Date.now();

    return () => {
        if (selectedModule) {
            logModuleTime(selectedModule);
        }
    };
}, [selectedModule, logModuleTime]);

    // Fetch past attempts whenever an exercise module is opened
    useEffect(() => {
        if (!selectedModule || (selectedModule.module_type || type) !== "exercise") {
            setAttempts([]);
            return;
        }
        moduleApi
            .getExerciseAttempts(selectedModule._id)
            .then((res) => setAttempts(res.data?.data || []))
            .catch((err) => console.error("Failed to load attempts:", err));
    }, [selectedModule, type]);

useEffect(() => {
    let cancelled = false;

    const fetchModules = async () => {
        if (!type || !subtopicId) {
            if (!cancelled) {
                setModules([]);
                setLoading(false);
            }
            return;
        }

        try {
            setLoading(true);

            const res = await moduleApi.getModulesBySubtopic(
                type,
                subtopicId
            );

            if (cancelled) return;

            const fetchedData =
                res?.data?.data ||
                res?.data ||
                [];

            setModules(Array.isArray(fetchedData) ? fetchedData : []);
        } catch (error) {
            if (!cancelled) {
                console.error(
                    `[Module] GET /module/${type}/${subtopicId} failed:`,
                    error
                );
            }
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    };

    fetchModules();

    return () => {
        cancelled = true;
    };
}, [type, subtopicId]);

    const handleModuleSelection = useCallback(
    (item) => {
        if (
            selectedModule &&
            item?._id !== selectedModule._id &&
            (
                selectedModule.module_type === "text" ||
                selectedModule.module_type === "vocabulary"
            )
        ) {
            logModuleActivity(
                selectedModule,
                `${selectedModule.module_type}_complete`
            );
        }

        const nextParams = new URLSearchParams(
            searchParams.toString()
        );

        if (item) {
            nextParams.set("lessonId", item._id);
            nextParams.set(
                "lessonName",
                item.title || ""
            );

            // Reset timers for the newly selected module
            moduleStartTimeRef.current = Date.now();
            startTimeRef.current = Date.now();
        } else {
            nextParams.delete("lessonId");
            nextParams.delete("lessonName");
        }

        router.push(`?${nextParams.toString()}`);

        setIsQuizActive(false);
        setShowResults(false);
        setShowReview(false);
        setResultData(null);
        setQuestionResults([]);
        setCurrentQuestionIndex(0);
        setUserAnswers({});

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    },
    [
        selectedModule,
        logModuleActivity,
        searchParams,
        router,
    ]
);

    const handleBack = useCallback(() => { handleModuleSelection(null); }, [handleModuleSelection]);

    

      const handleSubmit = useCallback(async () => {
        if (!selectedModule) return;

        const formattedAnswers =
            Object.keys(userAnswers).map(
                (index) => ({
                    question_index: Number(index),

                    given_answer:
                        answerToString(
                            selectedModule.questions[
                                Number(index)
                            ],
                            userAnswers[index]
                        ),
                })
            );

        const timeSpent = Math.floor(
            (Date.now() -
                startTimeRef.current) /
                1000
        );

        const payload = {
            answers: formattedAnswers,
            time_spent_sec: timeSpent,
        };

        try {
            const response =
                await moduleApi.submitExercise(
                    selectedModule._id,
                    payload
                );

            const attempt =
                response?.data?.data?.attempt ||
                response?.data?.attempt ||
                response?.attempt ||
                response?.data;

            const results =
                response?.data?.data
                    ?.question_results ||
                response?.data
                    ?.question_results ||
                [];

            if (!attempt) {
                console.error(
                    "Attempt data not found.",
                    response
                );

                toast.error(
                    "Unable to load result."
                );

                return;
            }

            setResultData({
                score: attempt.score,
                max_score: attempt.max_score,
                accuracy: attempt.accuracy,
                is_passed: attempt.is_passed,
            });

            setQuestionResults(results);

            logModuleActivity(
                selectedModule,
                "exercise_complete",
                {
                    score: attempt.score,
                    max_score: attempt.max_score,
                    accuracy: attempt.accuracy,
                    time_spent_sec: timeSpent,
                }
            );

            setAttempts((prev) => [
                attempt,
                ...prev,
            ]);

            setIsQuizActive(false);
            setShowResults(true);
            setShowReview(false);
        } catch (error) {
            console.error(
                "Submission failed:",
                error
            );

            toast.error(
                error?.response?.data?.message ||
                    "Failed to submit answers."
            );
        }
    }, [
        selectedModule,
        userAnswers,
        logModuleActivity,
    ]);

    const handleVideoComplete = useCallback(() => {
    if (!selectedModule) return;

    logModuleActivity(
        selectedModule,
        "video_complete"
    );
}, [
    selectedModule,
    logModuleActivity,
]);

const handleAudioComplete = useCallback(() => {
    if (!selectedModule) return;

    logModuleActivity(
        selectedModule,
        "audio_complete"
    );
}, [
    selectedModule,
    logModuleActivity,
]);

       const filteredModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return modules
        .filter((mod) => {
            if (!mod) return false;

            const actualType =
                mod.module_type || type;

            const matchesTab =
                activeTab === "all" ||
                actualType === activeTab;

            const matchesSearch =
                !query ||
                mod.title
                    ?.toLowerCase()
                    .includes(query) ||
                mod.description
                    ?.toLowerCase()
                    .includes(query);

            return (
                matchesTab &&
                matchesSearch
            );
        })
        .sort((a, b) => {
            if (
                sortBy === "title" &&
                a?.title &&
                b?.title
            ) {
                return a.title.localeCompare(
                    b.title
                );
            }

            return 0;
        });
}, [
    modules,
    activeTab,
    searchQuery,
    sortBy,
    type,
]);

  
const videoModules = useMemo(
    () =>
        modules.filter(
            (item) =>
                item &&
                (item.module_type || type) === "video"
        ),
    [modules, type]
);

const audioModules = useMemo(
    () =>
        modules.filter(
            (item) =>
                item &&
                (item.module_type || type) === "audio"
        ),
    [modules, type]
);

const exerciseModules = useMemo(
    () =>
        modules.filter(
            (item) =>
                item &&
                (item.module_type || type) === "exercise"
        ),
    [modules, type]
);

const textModules = useMemo(
    () =>
        modules.filter(
            (item) =>
                item &&
                (item.module_type || type) === "text"
        ),
    [modules, type]
);

const vocabularyModules = useMemo(
    () =>
        modules.filter(
            (item) =>
                item &&
                (item.module_type || type) === "vocabulary"
        ),
    [modules, type]
);

/* -----------------------------------------
   Current module type
----------------------------------------- */

const currentModuleType =
    selectedModule?.module_type || type;

/* -----------------------------------------
   Current module list
----------------------------------------- */

const currentModuleList =
    currentModuleType === "video"
        ? videoModules
        : currentModuleType === "audio"
            ? audioModules
            : currentModuleType === "exercise"
                ? exerciseModules
                : currentModuleType === "text"
                    ? textModules
                    : currentModuleType === "vocabulary"
                        ? vocabularyModules
                        : [];

/* -----------------------------------------
   Current module index
----------------------------------------- */

const currentModuleIndex =
    currentModuleList.findIndex(
        (item) =>
            item?._id === selectedModule?._id
    );

/* -----------------------------------------
   Previous / Next
----------------------------------------- */

const previousModule =
    currentModuleIndex > 0
        ? currentModuleList[currentModuleIndex - 1]
        : null;

const nextModule =
    currentModuleIndex >= 0 &&
    currentModuleIndex <
        currentModuleList.length - 1
        ? currentModuleList[currentModuleIndex + 1]
        : null;

/* -----------------------------------------
   Shared detail props
----------------------------------------- */

const sharedDetailProps = useMemo(
    () => ({
        selectedModule,
        previousModule,
        nextModule,
        currentModuleIndex,
        currentModuleList,
        onNavigate: handleModuleSelection,
        onBack: handleBack,
        router,
        searchParams,
    }),
    [
        selectedModule,
        previousModule,
        nextModule,
        currentModuleIndex,
        currentModuleList,
        handleModuleSelection,
        handleBack,
        router,
        searchParams,
    ]
);

/* -----------------------------------------
   NOW conditional return is safe
----------------------------------------- */

if (loading) {
    return (
        <div className="h-[70vh] flex items-center justify-center bg-slate-50">
            <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        </div>
    );
}

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
    onComplete={handleVideoComplete}
/>
) : currentModuleType === "audio" ? (
                      <AudioDetail
    {...sharedDetailProps}
    audioModules={audioModules}
    onComplete={handleAudioComplete}
/>
                    ) : currentModuleType === "exercise" ? (
                     <ExerciseDetail
    selectedModule={selectedModule}
    isQuizActive={isQuizActive}
    setIsQuizActive={setIsQuizActive}
    showResults={showResults}
    resultData={resultData}
    currentQuestionIndex={currentQuestionIndex}
    setCurrentQuestionIndex={
        setCurrentQuestionIndex
    }
    userAnswers={userAnswers}
    setUserAnswers={setUserAnswers}
    onSubmit={handleSubmit}
    onStart={() =>
        logModuleActivity(
            selectedModule,
            "exercise_start"
        )
    }
    onBack={handleBack}
    router={router}
    attempts={attempts}
    onSelectAttempt={setSelectedAttempt}
    questionResults={questionResults}
    showReview={showReview}
    setShowReview={setShowReview}
/>
                    ) : currentModuleType === "vocabulary" ? (
                        <VocabularyDetail
                            {...sharedDetailProps}
                            vocabularyModules={vocabularyModules}
                        />
                    ) : currentModuleType === "text" ? (
                        <TextDetail {...sharedDetailProps} textModules={textModules} />
                    ) : (
                        <div className="p-10 text-center text-slate-500">
                            Unsupported module type.
                        </div>
                    )
                ) : (
                    <div className="space-y-6 animate-fade-in">
 <BackToLessonsButton
    onBack={() => {
        const params = new URLSearchParams();

        const topicId = searchParams.get("topicId");
        const courseId = searchParams.get("courseId");
        const courseName = searchParams.get("courseName");
        const type = searchParams.get("type");
        const topicName = searchParams.get("topicName");

        if (courseId) params.set("courseId", courseId);
        if (courseName) params.set("courseName", courseName);
        if (type) params.set("type", type);
        if (topicName) params.set("topicName", topicName);

        router.push(
            `/dashboard/topics/${topicId}?${params.toString()}`
        );
    }}
/>
                        {filteredModules.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredModules.map((item) => {
                                    if (!item) return null;
                                    const itemType = item.module_type || type;

                                    if (itemType === "exercise") {
                                        return (
                                            <ExerciseRow
                                                key={item._id}
                                                item={item}
                                                onSelect={handleModuleSelection}
                                            />
                                        );
                                    }
                                    if (itemType === "audio") {
                                        return (
                                            <AudioRow
                                                key={item._id}
                                                item={item}
                                                onSelect={handleModuleSelection}
                                            />
                                        );
                                    }
                                    if (itemType === "text") {
                                        return (
                                            <TextRow
                                                key={item._id}
                                                item={item}
                                                onSelect={handleModuleSelection}
                                            />
                                        );
                                    }
                                    if (itemType === "vocabulary") {
                                        return (
                                            <VocabularyRow
                                                key={item._id}
                                                item={item}
                                                onSelect={handleModuleSelection}
                                            />
                                        );
                                    }
                                    return (
                                        <VideoCard
                                            key={item._id}
                                            item={item}
                                            type={type}
                                            onSelect={handleModuleSelection}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedAttempt && (
                <AttemptResultModal
                    attempt={selectedAttempt}
                    onClose={() => setSelectedAttempt(null)}
                />
            )}
        </div>
    );
}

export default function ModuleListPage() {
    return (
        <Suspense
            fallback={
                <div className="h-[70vh] flex items-center justify-center bg-slate-50">
                    <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                </div>
            }
        >
            <ModuleListPageContent />
        </Suspense>
    );
}