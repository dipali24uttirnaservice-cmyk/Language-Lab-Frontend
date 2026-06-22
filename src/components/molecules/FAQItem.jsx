"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`
        rounded-2xl
        border
        backdrop-blur-xl
        -webkit-backdrop-blur-xl
        overflow-hidden
        transition-all
        duration-300
        
        /* Dynamic state borders to avoid sharp visual snaps */
        ${
          open
            ? "border-amber-500/30 bg-white/90 shadow-[0_12px_30px_rgba(245,158,11,0.03)]"
            : "border-white/90 bg-white/45 hover:border-slate-300/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
        }
      `}
    >
      {/* Accordion Interactive Trigger Header Button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex w-full items-center justify-between
          p-6 text-left
          cursor-pointer
          outline-none
        "
      >
        <span className="text-base font-extrabold text-slate-900 tracking-tight pr-4">
          {question}
        </span>

        {/* Interactive Indicator Icons */}
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
          open ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
        }`}>
          {open ? (
            <FaMinus className="text-xs" />
          ) : (
            <FaPlus className="text-xs" />
          )}
        </div>
      </button>

      {/* Frame Engine: Framer Motion Heights calculation ensures a smooth drop container expansion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 text-sm font-medium text-slate-500 leading-relaxed border-t border-slate-200/30 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}