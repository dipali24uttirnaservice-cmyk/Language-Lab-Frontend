"use client";

import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const MODULE_TYPE_LABELS = {
  audio: "Speaking/Listening",
  video: "Comprehension",
  text: "Reading",
  exercise: "Grammar/Quiz",
  vocabulary: "Vocabulary",
};

const MODULE_COLORS = {
  audio: "#f59e0b",      // amber
  video: "#3b82f6",      // blue
  text: "#ec4899",       // pink
  exercise: "#10b981",   // emerald
  vocabulary: "#8b5cf6", // purple
};

export default function SkillRadarChart({ progress = [] }) {
  // Aggregate average progress / score per module type
  const aggregates = {
    audio: { total: 0, count: 0 },
    video: { total: 0, count: 0 },
    text: { total: 0, count: 0 },
    exercise: { total: 0, count: 0 },
    vocabulary: { total: 0, count: 0 },
  };

  progress.forEach((item) => {
    const type = item.module_type;
    if (aggregates[type] !== undefined) {
      const scoreValue =
        type === "exercise"
          ? (item.score !== undefined && item.score !== null ? item.score : 0)
          : (item.progress_percentage || 0);
      aggregates[type].total += scoreValue;
      aggregates[type].count += 1;
    }
  });

  const chartData = Object.keys(MODULE_TYPE_LABELS).map((type) => {
    const avg =
      aggregates[type].count > 0
        ? Math.round(aggregates[type].total / aggregates[type].count)
        : 0; // default 0 if no lessons done yet

    return {
      subject: MODULE_TYPE_LABELS[type],
      A: avg,
      fullMark: 100,
    };
  });

  // Check if student has done any learning
  const hasData = progress.length > 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (

        <div className="rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-bold text-slate-800">{payload[0].name}</p>
          <p className="text-lg font-black text-indigo-600 mt-1">
            {payload[0].value}% <span className="text-xs text-slate-400 font-medium">Avg Score</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col h-full"
    >
      <div className
        ="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Skill Competency Map
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Real-time cognitive proficiency breakdown
          </p>
        </div>
        {/* <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
          AI Evaluated
        </span> */}
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height={320} minWidth={0} minHeight={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#cbd5e1", fontSize: 9 }}
              />
              <Radar
                name="Skill Level"
                dataKey="A"
                stroke="#6366f1"
                fill="url(#radarGradient)"
                fillOpacity={0.4}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                </radialGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-2xl shadow-inner">
              📊
            </div>
            <h4 className="text-sm font-bold text-slate-700">No Learning History Yet</h4>
            <p className="text-xs text-slate-400 max-w-[200px]">
              Complete lessons in Speaking, Reading, or Quizzes to build your competency map.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-bold text-slate-500">
        {Object.entries(MODULE_TYPE_LABELS).map(([type, label]) => {
          const count = progress.filter((p) => p.module_type === type).length;
          return (
            <div key={type} className="flex flex-col items-center p-1.5 bg-slate-50 rounded-xl">
              <span className="truncate w-full text-center" style={{ color: MODULE_COLORS[type] }}>
                ● {label}
              </span>
              <span className="text-slate-400 font-mono mt-0.5">{count} Done</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
