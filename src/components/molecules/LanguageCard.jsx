"use client";

import { motion } from "framer-motion";

export default function LanguageCard({ flag, name, learners }) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.01,
        borderColor: "rgba(16, 185, 129, 0.35)", // Accent emerald halo on focus
      }}
      className="
        group
        relative
        flex
        items-center
        gap-5
        rounded-3xl
        
        /* Glassmorphic Layer Specifications */
        border border-white/80
        bg-white/45
        backdrop-blur-xl
        -webkit-backdrop-blur-xl
        
        p-6
        shadow-[0_8px_32px_rgba(0,0,0,0.015)]
        hover:shadow-[0_20px_40px_rgba(16,185,129,0.04)]
        transition-all
        duration-300
        cursor-pointer
      "
    >
      {/* Light Glare Mask Accent */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

      {/* Flag Circle Base with unique continuous rotation on hover */}
      <motion.div 
        whileHover={{ scale: 1.1 }}
        className="
          flex
          h-14
          w-14
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-white
          border border-slate-200/50
          text-3xl
          shadow-[0_4px_12px_rgba(0,0,0,0.02)]
          group-hover:shadow-md
          transition-all
          duration-300
        "
      >
        {flag}
      </motion.div>

      {/* Label Descriptions */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight transition-colors duration-300 group-hover:text-emerald-700">
          {name}
        </h3>
        {learners && (
          <p className="mt-0.5 text-xs font-bold text-slate-400 tracking-wide uppercase group-hover:text-slate-500 transition-colors duration-300">
            {learners}
          </p>
        )}
      </div>

    

      {/* Minimalist interactive color accent line */}
      <div className="absolute bottom-0 right-10 h-[2px] w-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-all duration-300 group-hover:w-16 group-hover:opacity-100" />
    </motion.div>
  );
}