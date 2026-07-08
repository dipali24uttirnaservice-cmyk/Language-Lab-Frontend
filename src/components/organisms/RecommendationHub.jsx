"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaPlay, FaRedo, FaBrain, FaRegCheckCircle, FaChevronRight } from "react-icons/fa";

const TYPE_COLORS = {
  audio: { bg: "bg-amber-50 text-amber-600 border-amber-100", label: "Speaking/Listening" },
  video: { bg: "bg-blue-50 text-blue-600 border-blue-100", label: "Comprehension" },
  text: { bg: "bg-pink-50 text-pink-600 border-pink-100", label: "Reading" },
  exercise: { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", label: "Grammar/Quiz" },
  vocabulary: { bg: "bg-purple-50 text-purple-600 border-purple-100", label: "Vocabulary" },
};

export default function RecommendationHub({ progress = [] }) {
  // Generate recommendations
  const recommendations = [];

  progress.forEach((item) => {
    const score = item.score || item.progress_percentage || 0;
    const isCompleted = item.is_completed;
    
    // Recommendation 1: Revision needed (completed but low score)
    if (isCompleted && score < 70) {
      recommendations.push({
        id: item._id || `${item.topic_id}-${item.subtopic_id}-${item.module_type}`,
        type: item.module_type,
        topicId: item.topic_id,
        subtopicId: item.subtopic_id,
        title: item.subtopic?.title || "Language Practice",
        reason: `Scored ${score}% - Revision Recommended`,
        actionLabel: "Revise Now",
        icon: <FaRedo className="text-xs" />,
        colorClass: "from-rose-500/10 to-orange-500/5 hover:border-rose-300",
        btnColor: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/10",
      });
    }
    // Recommendation 2: Resume study (started but not completed)
    else if (!isCompleted && item.progress_percentage > 0) {
      recommendations.push({
        id: item._id || `${item.topic_id}-${item.subtopic_id}-${item.module_type}`,
        type: item.module_type,
        topicId: item.topic_id,
        subtopicId: item.subtopic_id,
        title: item.subtopic?.title || "Language Practice",
        reason: `Progress: ${item.progress_percentage}% - Incomplete`,
        actionLabel: "Resume Lesson",
        icon: <FaPlay className="text-[10px]" />,
        colorClass: "from-amber-500/10 to-yellow-500/5 hover:border-amber-300",
        btnColor: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10",
      });
    }
  });

  // Limit to 3 key recommendations
  const displayRecs = recommendations.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FaBrain className="text-indigo-500 text-base" /> AI Recommendation Engine
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Personalized study choices based on past performance
          </p>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Smart Path
        </span>
      </div>

      {/* Body Content */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {displayRecs.length > 0 ? (
          displayRecs.map((rec, index) => {
            const colors = TYPE_COLORS[rec.type] || { bg: "bg-slate-50 text-slate-600", label: "Module" };
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group border border-slate-100 rounded-2xl p-4 bg-gradient-to-r ${rec.colorClass} transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${colors.bg}`}>
                      {colors.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight leading-snug">
                    {rec.title}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 leading-none">
                    {rec.reason}
                  </p>
                </div>

                <Link
                  href={`/dashboard/module/${rec.type}/${rec.subtopicId}`}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all duration-200 shadow-sm ${rec.btnColor}`}
                >
                  {rec.icon}
                  {rec.actionLabel}
                  <FaChevronRight className="text-[9px]" />
                </Link>
              </motion.div>
            );
          })
        ) : progress.length > 0 ? (
          // All caught up state
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-2xl text-emerald-500 shadow-inner">
              <FaRegCheckCircle />
            </div>
            <h4 className="text-sm font-bold text-slate-700">You Are All Caught Up!</h4>
            <p className="text-xs text-slate-400 max-w-[220px]">
              Outstanding job! All completed modules meet passing standards. Continue with new topics to build more skills.
            </p>
            <Link
              href="/dashboard/subLesson"
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-black shadow-sm"
            >
              Explore Curriculum <FaChevronRight className="text-[9px]" />
            </Link>
          </div>
        ) : (
          // Brand new student state
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-2xl shadow-inner">
              🎓
            </div>
            <h4 className="text-sm font-bold text-slate-700">Kickstart Your Learning!</h4>
            <p className="text-xs text-slate-400 max-w-[220px]">
              Ready to learn English? Jump into our structured learning path.
            </p>
            <Link
              href="/dashboard/subLesson"
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-black shadow-md shadow-indigo-600/10"
            >
              Start First Lesson <FaChevronRight className="text-[9px]" />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
