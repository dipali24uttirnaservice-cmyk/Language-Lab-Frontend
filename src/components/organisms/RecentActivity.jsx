"use client";

import { motion } from "framer-motion";
import { FaCheckCircle, FaMicrophone, FaGraduationCap, FaCheck } from "react-icons/fa";

export default function RecentActivity() {
  const activities = [
    { text: "Completed English Vocabulary Lesson 5", time: "10 mins ago", icon: <FaCheckCircle className="text-indigo-500" /> },
    { text: "Practiced Conversational Speaking for 20 mins", time: "2 hours ago", icon: <FaMicrophone className="text-amber-500" /> },
    { text: "Passed Level Assessment Grammar Quiz", time: "Yesterday", icon: <FaCheck className="text-emerald-500" /> },
    { text: "Earned Certified Beginner Fluency Certificate", time: "3 days ago", icon: <FaGraduationCap className="text-orange-500" /> },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.025)]">
      
      {/* Widget Header Mapping */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Recent Activity Log
          </h3>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Automated AI learning ledger</p>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Live Syncing
        </span>
      </div>

      {/* Chronological Vertical Timeline Core */}
      <div className="relative pl-4 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
        {activities.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ x: 4 }}
            className="group relative flex items-start gap-4 transition-all duration-200"
          >
            {/* Timeline Icon Node Pin */}
            <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-slate-100 shadow-2xs group-hover:border-slate-300 transition-colors mt-0.5 text-xs">
              {item.icon}
            </div>

            {/* Timeline Row Content Body Container */}
            <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                {item.text}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                {item.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}