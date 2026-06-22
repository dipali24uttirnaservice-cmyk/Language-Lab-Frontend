"use client";

import { motion } from "framer-motion";

export default function JourneyStep({ number, title, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -6,
        scale: 1.01,
        borderColor: "rgba(245, 158, 11, 0.35)",
      }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="
        group
        relative
        flex
        flex-col
        items-center
        rounded-3xl
        
        /* Premium Thick Frosted Glass Properties */
        border border-white/90
        bg-white/45
        backdrop-blur-xl
        -webkit-backdrop-blur-xl
        
        p-8
        text-center
        shadow-[0_8px_30px_rgba(0,0,0,0.015)]
        hover:shadow-[0_20px_45px_rgba(245,158,11,0.05)]
        transition-all
        duration-300
      "
    >
      {/* Light Reflection Shield Accent */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

      {/* Tactile Numeric Bubble Badge */}
      <div
        className="
          mb-6
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          
          /* Layered White Core Look */
          bg-white
          border border-slate-200/60
          shadow-[0_4px_12px_rgba(0,0,0,0.02)]
          
          text-lg
          font-black
          bg-gradient-to-br
          from-amber-600
          to-orange-500
          bg-clip-text
          text-transparent
          
          group-hover:scale-105
          group-hover:border-amber-200
          transition-all
          duration-300
        "
      >
        {number}
      </div>

      {/* Structured Text Elements */}
      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-amber-700 transition-colors duration-300">
        {title}
      </h3>

      <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
        {description}
      </p>

      {/* Decorative Interactive Step Timeline Dash */}
      <div className="absolute bottom-0 h-[2px] w-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-all duration-300 group-hover:w-16 group-hover:opacity-100" />
    </motion.div>
  );
}