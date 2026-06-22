"use client";

import { motion } from "framer-motion";

export default function StatCard({ value, label, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -6,
        scale: 1.01,
        borderColor: "rgba(245, 158, 11, 0.35)", // Radiant orange glow ring on focus
      }}
      // Staggered smooth activation delay based on card position in grid arrays
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="
        group
        relative
        flex
        flex-col
        justify-center
        items-center
        rounded-3xl
        
        /* High-End Glassmorphic Finish Specifications */
        border border-white/80
        bg-white/45
        backdrop-blur-xl
        -webkit-backdrop-blur-xl
        
        p-8
        text-center
        shadow-[0_8px_30px_rgba(0,0,0,0.015)]
        hover:shadow-[0_20px_40px_rgba(245,158,11,0.04)]
        transition-all
        duration-300
      "
    >
      {/* Light Glare Mask Accent Overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

      {/* Radiant Metric Gradient Value */}
      <h3 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-600 via-orange-500 to-orange-600 bg-clip-text text-transparent tracking-tight">
        {value}
      </h3>

      {/* Label Metadata Text */}
      <p className="mt-3 text-sm font-bold text-slate-500 tracking-wide uppercase group-hover:text-slate-700 transition-colors duration-300">
        {label}
      </p>

      {/* Decorative Minimalist Core Bottom Anchor Line */}
      <div className="absolute bottom-0 h-[2px] w-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-all duration-300 group-hover:w-20 group-hover:opacity-100" />
    </motion.div>
  );
}