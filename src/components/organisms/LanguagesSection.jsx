"use client";

import { motion } from "framer-motion";
import LanguageCard from "@/components/molecules/LanguageCard";

const languages = [
  {
    flag: "🇬🇧",
    name: "Spoken English",
    learners: "Daily Conversation Skills",
  },
  {
    flag: "💼",
    name: "Business English",
    learners: "Professional Communication",
  },
  {
    flag: "🎤",
    name: "Public Speaking",
    learners: "Confidence & Presentation",
  },
  {
    flag: "💬",
    name: "Interview English",
    learners: "Job & Placement Preparation",
  },
  {
    flag: "📚",
    name: "Grammar Mastery",
    learners: "Accuracy & Fluency",
  },
  {
    flag: "🌍",
    name: "Global Communication",
    learners: "International English Skills",
  },
];

export default function LanguagesSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-tr from-slate-50 via-emerald-50/10 to-orange-50/20">
      
      {/* =========================================================================
          GLASS INTERSECTION BACKDROP (ALIGNED WITH MAIN THEME VISUALS)
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Soft, Sunny Ambient Light Points */}
        <div className="absolute top-1/3 left-[-10%] h-[550px] w-[550px] rounded-full bg-amber-200/20 blur-[130px]" />
        <div className="absolute bottom-0 right-[-5%] h-[600px] w-[600px] rounded-full bg-emerald-200/20 blur-[140px]" />

        {/* Floating Crystalline Glass Plate Accent */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [5, 7, 5] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute right-[8%] top-[15%] w-[400px] h-[400px] rounded-[3rem] border border-white/60 bg-white/10 backdrop-blur-[4px] shadow-xl"
        />

        {/* Delicate structural architectural lines */}
        <div className="absolute left-[15%] top-0 w-[1px] h-full bg-gradient-to-b from-slate-200/60 via-slate-200/20 to-transparent" />
        <div className="absolute right-[25%] top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-slate-200/40 to-slate-200/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Modern Section Header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-20">
  <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
    Master{" "}
    <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
      English Communication
    </span>
  </h2>

  <p className="mt-4 text-base font-semibold text-slate-500/90">
    Build confidence in speaking, interviews, presentations, and professional communication with AI-powered practice and feedback.
  </p>
</div>

        {/* Adaptive Grid Frame */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((lang, index) => (
            <LanguageCard
              key={index}
              flag={lang.flag}
              name={lang.name}
             
            />
          ))}
        </div>

      </div>
    </section>
  );
}