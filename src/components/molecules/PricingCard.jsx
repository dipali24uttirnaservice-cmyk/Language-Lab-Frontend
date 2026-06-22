"use client";

import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

export default function PricingCard({ title, price, description, features }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col h-full rounded-[2.5rem] p-8 border border-white/60 
                 bg-white/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] 
                 transition-all duration-500 overflow-hidden"
    >
      {/* Dynamic Background Layer: This creates the "premium" look */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] 
                      from-amber-100/50 via-emerald-50/30 to-transparent opacity-0 
                      group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Subtle background grain/texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div>
          <h3 className="text-xl font-black bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
            {title}
          </h3>
          <p className="mt-2 text-xs font-bold text-slate-500 leading-normal h-10">
            {description}
          </p>
        </div>

        <div className="mt-8 flex items-baseline text-slate-900">
          <span className="text-5xl font-black tracking-tight">{price}</span>
          <span className="ml-1 text-sm font-extrabold text-slate-400">/ month</span>
        </div>

        <ul className="mt-8 space-y-4 border-t border-slate-200/50 pt-6 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 text-emerald-600 text-xs font-black">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <button className="group/btn mt-10 w-full rounded-2xl py-4 text-sm font-black uppercase tracking-widest bg-gradient-to-r from-amber-600 to-emerald-600 text-white shadow-lg shadow-amber-600/20 hover:shadow-emerald-600/30 transition-all duration-300 flex items-center justify-center gap-2">
          Get Started
          <FaArrowRight className="text-[10px] group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}