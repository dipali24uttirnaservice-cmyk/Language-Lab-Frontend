"use client";

import { motion } from "framer-motion";
import { FaBook, FaRobot, FaAward, FaFire } from "react-icons/fa";

export default function DashboardStats({ statsData = {} }) {
  const stats = [
    {
      title: "Enrolled Courses",
      value: statsData.enrolledCourses !== undefined ? String(statsData.enrolledCourses) : "0",
      icon: <FaBook />,
      color: "from-blue-500 to-indigo-600",
      shadow: "rgba(79,70,229,0.15)",
      label: "Active course enrollment"
    },
    {
      title: "AI Chat Interactions",
      value: statsData.aiInteractions !== undefined ? String(statsData.aiInteractions) : "0",
      icon: <FaRobot />,
      color: "from-amber-400 to-orange-500",
      shadow: "rgba(245,158,11,0.15)",
      label: "Tutor queries logged"
    },
    {
      title: "Attendance Rate",
      value: statsData.attendanceRate !== undefined ? `${statsData.attendanceRate}%` : "0%",
      icon: <FaAward />,
      color: "from-emerald-400 to-teal-500",
      shadow: "rgba(16,185,129,0.15)",
      label: statsData.attendanceRate < 75 ? "⚠️ Below 75% threshold" : "✅ In good standing"
    },
    {
      title: "Active Learning Streak",
      value: statsData.streakDays !== undefined ? `${statsData.streakDays} Days` : "0 Days",
      icon: <FaFire />,
      color: "from-orange-500 to-red-500",
      shadow: "rgba(239,68,68,0.15)",
      label: "Keep learning daily! 🔥"
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.title}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{item.value}</h3>
            </div>
            
            {/* Beautiful Floating Colored Icon Hub */}
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white text-lg shadow-sm`}>
              {item.icon}
            </div>
          </div>

          {/* Card Meta Indicator Base Line */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>{item.label}</span>
            <span className="text-slate-300 font-mono">✦</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}