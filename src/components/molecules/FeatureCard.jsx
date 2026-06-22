"use client";

import { motion } from "framer-motion";

export default function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.01,
        borderColor: "rgba(245, 158, 11, 0.35)", // Subtle amber halo on active state
      }}
      className="
        group
        relative
        flex
        flex-col
        rounded-3xl
        border border-slate-200/80
        bg-white/70
        backdrop-blur-md
        p-8
        shadow-[0_4px_30px_rgba(0,0,0,0.015)]
        hover:shadow-[0_15px_40px_rgba(245,158,11,0.05)]
        transition-colors
        duration-300
      "
    >
      {/* Icon Frame - Switches to ambient theme color on component hover */}
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-700 transition-colors duration-300 group-hover:bg-amber-100/70 group-hover:text-amber-700">
        {icon}
      </div>

      {/* Structured Text Metadata Layout */}
      <h3 className="mt-6 text-xl font-extrabold text-slate-900 tracking-tight">
        {title}
      </h3>

      <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
        {description}
      </p>

      {/* Decorative Minimalist Bottom Corner Line Accent */}
      <div className="absolute bottom-0 right-8 h-[2px] w-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-all duration-300 group-hover:w-12 group-hover:opacity-100" />
    </motion.div>
  );
}