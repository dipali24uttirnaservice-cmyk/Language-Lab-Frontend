"use client";

import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

export default function TestimonialCard({ name, role, review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -6,
        scale: 1.01,
        borderColor: "rgba(245, 158, 11, 0.35)", // Subtle amber halo accent on hover
      }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="
        group
        relative
        flex
        flex-col
        justify-between
        rounded-3xl
        
        /* Premium Frosted Thick Glass Styling */
        border border-white/90
        bg-white/45
        backdrop-blur-xl
        -webkit-backdrop-blur-xl
        
        p-8
        shadow-[0_8px_30px_rgba(0,0,0,0.015)]
        hover:shadow-[0_20px_45px_rgba(245,158,11,0.05)]
        transition-all
        duration-300
      "
    >
      {/* Light Glare Mask overlay effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

      <div>
        {/* Star Ranking Group with Sunny Amber Tint */}
        <div className="flex gap-1 text-amber-500 text-sm">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} />
          ))}
        </div>

        {/* High-Contrast Review Quote Text */}
        <p className="mt-5 text-sm font-medium text-slate-600 leading-relaxed italic group-hover:text-slate-700 transition-colors duration-300">
          "{review}"
        </p>
      </div>

      {/* User Information Footer Panel */}
      <div className="mt-8 pt-4 border-t border-slate-200/40 flex items-center gap-3">
        {/* Elegant Avatar Initials Badge */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 text-xs font-extrabold border border-white shadow-sm">
          {name.split(' ').map(n => n[0]).join('')}
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight transition-colors duration-300 group-hover:text-amber-700">
            {name}
          </h4>
          <p className="text-xs font-bold tracking-wide uppercase text-slate-400/90 mt-0.5">
            {role}
          </p>
        </div>
      </div>

      {/* Interactive Micro Gradient Accent Line */}
      <div className="absolute bottom-0 left-10 h-[2px] w-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-all duration-300 group-hover:w-16 group-hover:opacity-100" />
    </motion.div>
  );
}