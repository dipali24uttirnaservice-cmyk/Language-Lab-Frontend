"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FaBookOpen, FaMicrophone, FaBriefcase, FaGraduationCap, FaCheckCircle, FaRegClipboard } from "react-icons/fa";

const MODULE_TYPE_DETAILS = {
  audio: { label: "Speaking/Listening", color: "#f59e0b", icon: <FaMicrophone className="text-amber-500" /> },
  video: { label: "Comprehension", color: "#3b82f6", icon: <FaBookOpen className="text-blue-500" /> },
  text: { label: "Reading", color: "#ec4899", icon: <FaBriefcase className="text-pink-500" /> },
  exercise: { label: "Grammar/Quiz", color: "#10b981", icon: <FaGraduationCap className="text-emerald-500" /> },
  vocabulary: { label: "Vocabulary", color: "#8b5cf6", icon: <FaRegClipboard className="text-purple-500" /> },
};

export default function RecommendationHub({ progress = [], moduleBreakdown = null }) {
  // 1. Calculate completion metrics per module type
  const metrics = {
    audio: { completed: 0, total: 0 },
    video: { completed: 0, total: 0 },
    text: { completed: 0, total: 0 },
    exercise: { completed: 0, total: 0 },
    vocabulary: { completed: 0, total: 0 },
  };

  const hasBreakdown = moduleBreakdown && Object.values(moduleBreakdown).some(item => item.total > 0);

  if (hasBreakdown) {
    Object.keys(metrics).forEach(type => {
      if (moduleBreakdown[type]) {
        metrics[type].total = moduleBreakdown[type].total || 0;
        metrics[type].completed = moduleBreakdown[type].completed || 0;
      }
    });
  } else {
    progress.forEach((item) => {
      const type = item.module_type;
      if (metrics[type] !== undefined) {
        metrics[type].total += 1;
        if (item.is_completed) {
          metrics[type].completed += 1;
        }
      }
    });
  }

  // Calculate percentages for pie chart data
  const pieData = Object.keys(MODULE_TYPE_DETAILS).map((type) => {
    const total = metrics[type].total;
    const completed = metrics[type].completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      name: MODULE_TYPE_DETAILS[type].label,
      value: completed || 0, // pie slice sized by completed module count
      total,
      percent,
      color: MODULE_TYPE_DETAILS[type].color,
    };
  });

  // Check if at least one completed lesson exists to render pie slices
  const totalCompleted = Object.values(metrics).reduce((sum, item) => sum + item.completed, 0);
  const totalModulesCount = Object.values(metrics).reduce((sum, item) => sum + item.total, 0);
  const overallPercentage = totalModulesCount > 0 ? Math.round((totalCompleted / totalModulesCount) * 100) : 0;

  // Placeholder data if no modules are completed yet (so Pie chart shows a grey ring/circle)
  const chartData = totalCompleted > 0
    ? pieData.filter(item => item.value > 0)
    : [{ name: "No completed modules yet", value: 1, color: "#e2e8f0", percent: 0, total: 0 }];

  // 2. Identify incomplete modules
  const incompleteModules = progress.filter((item) => !item.is_completed);
  const displayIncomplete = incompleteModules.slice(0, 3); // show first 3

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur-md">
          <p className="text-sm font-black text-slate-800">{data.name}</p>
          <p className="text-base font-black text-indigo-600 mt-1">
            {data.value} Lessons Completed
          </p>
          <p className="text-base font-bold text-slate-400">
            Completion Rate: {data.percent}%
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
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col h-full justify-between gap-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Syllabus Completion & Progress
          </h3>
          <p className="text-sm text-slate-400 font-medium mt-0.5">
            Module breakdown and pending learning targets
          </p>
        </div>
        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {overallPercentage}% Overall Complete
        </span>
      </div>

      {/* Grid of Pie Chart + Incomplete Modules list */}
      <div className="grid gap-6 md:grid-cols-2 items-center flex-1">

        {/* Left Side: Pie Chart & Legend */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-[130px] h-[130px] flex items-center justify-center shrink-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={130} minHeight={130}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={totalCompleted > 0 ? 38 : 0}
                  outerRadius={55}
                  paddingAngle={totalCompleted > 0 ? 3 : 0}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {totalCompleted > 0 && <Tooltip content={<CustomTooltip />} />}
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring stats */}
            {totalCompleted > 0 && (
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-800 leading-none">
                  {totalCompleted}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Done
                </span>
              </div>
            )}
          </div>

          {/* Color Indicators with Progress Percentages */}
          <div className="flex-1 space-y-1.5 w-full">
            {Object.keys(MODULE_TYPE_DETAILS).map((type) => {
              const info = MODULE_TYPE_DETAILS[type];
              const item = metrics[type];
              const pct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
              return (
                <div key={type} className="flex items-center justify-between text-sm font-bold">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
                    <span className="truncate">{info.label}</span>
                  </div>
                  <span className="text-slate-700 font-mono">
                    {pct}% <span className="text-sm text-slate-400">({item.completed}/{item.total})</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Incomplete Modules Panel */}
        <div className="flex flex-col h-full justify-between gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Pending Tasks ({incompleteModules.length})
            </h4>

            <div className="space-y-2">
              {displayIncomplete.length > 0 ? (
                displayIncomplete.map((item, index) => {
                  const info = MODULE_TYPE_DETAILS[item.module_type] || { label: "Module", icon: null };
                  return (
                    <div
                      key={item._id || index}
                      className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-sm shrink-0">
                        {info.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate leading-snug">
                          {item.subtopic?.title || "Pending Lesson"}
                        </p>
                        <p className="text-sm font-bold text-slate-400 leading-none">
                          {info.label} • {item.progress_percentage}% Done
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                  <FaCheckCircle className="text-emerald-500 text-3xl mb-2" />
                  <p className="text-sm font-bold text-slate-700">Course Fully Completed!</p>
                  <p className="text-sm text-slate-400 mt-0.5">You have checked off all standard curriculum requirements.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
