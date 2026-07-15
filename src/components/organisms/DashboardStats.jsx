"use client";

import { motion } from "framer-motion";
import {
  FaGraduationCap,
  FaBookOpen,
  FaHourglassHalf,
} from "react-icons/fa";

export default function DashboardStats({ statsData = {} }) {
  const stats = [
    {
      title: "Enrolled Courses",
      value:
        statsData.enrolledCourses !== undefined
          ? String(statsData.enrolledCourses)
          : "0",
      icon: <FaGraduationCap />,
      color: "from-blue-500 to-cyan-500",
      shadow: "rgba(59,130,246,0.18)",
      label: "Active course enrollment",
    },

    {
      title: "Total Lessons",
      value:
        statsData.totalLessons !== undefined
          ? String(statsData.totalLessons)
          : "0",
      icon: <FaBookOpen />,
      color: "from-violet-500 to-purple-600",
      shadow: "rgba(139,92,246,0.18)",
      label: `Completed: ${statsData.completedLessons !== undefined
        ? statsData.completedLessons
        : 0
        } lessons`,
    },

    {
      title: "Incomplete Lessons",
      value:
        statsData.incompleteLessons !== undefined
          ? String(statsData.incompleteLessons)
          : "0",
      icon: <FaHourglassHalf />,
      color: "from-amber-500 to-orange-600",
      shadow: "rgba(245,158,11,0.18)",
      label: `In Progress: ${statsData.inProgressLessons || 0
        } | Not Started: ${statsData.notStartedLessons || 0}`,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          style={{ boxShadow: `0, 20px, 40px, ${item.shadow}` }}
        >
          {/* Card Top Row Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.title}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1">{item.value}</h3>
            </div>

            {/* Beautiful Floating Colored Icon Hub */}
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white text-xl shadow-sm`}>
              {item.icon}
            </div>
          </div>

          {/* Card Meta Indicator Base Line */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-base font-bold text-slate-500">
            <span>{item.label}</span>
            <span className="text-slate-300 font-mono">✦</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}