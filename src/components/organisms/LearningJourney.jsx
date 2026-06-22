"use client";

import { motion } from "framer-motion";
import JourneyStep from "@/components/molecules/JourneyStep";

const steps = [
  {
    number: "01",
    title: "Choose a Language",
    description: "Select from English, Spanish, French, German, Japanese, and more.",
  },
  {
    number: "02",
    title: "Learn with AI Tutor",
    description: "Get instant explanations, examples, and personalized lessons.",
  },
  {
    number: "03",
    title: "Practice Speaking",
    description: "Improve your real-world pronunciation with instant AI voice feedback.",
  },
  {
    number: "04",
    title: "Achieve Fluency",
    description: "Track performance analytics and reach your target goals faster.",
  },
];

export default function LearningJourney() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-slate-50 text-slate-900 selection:bg-amber-200 selection:text-amber-900">
      
      {/* =========================================================================
          VIBRANT 3D MULTI-COLOR GRADIENT BUBBLE ENGINE
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        
        {/* Consistent base layout flooring */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100/40" />

        {/* --- Bubble 01: Top Left Vibrant Amber/Orange Fluid Asset --- */}
        <motion.div
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.06, 1],
            borderRadius: [
              "42% 58% 70% 30% / 45% 45% 55% 55%",
              "65% 35% 50% 50% / 55% 40% 60% 45%",
              "42% 58% 70% 30% / 45% 45% 55% 55%"
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-8%] left-[-5%] w-[450px] h-[450px] bg-gradient-to-br from-amber-400/20 via-orange-500/15 to-transparent border border-white/50 shadow-[0_25px_60px_rgba(245,158,11,0.05)] backdrop-blur-md"
        >
          {/* Inner Highlights to boost the 3D feeling */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-tl from-white/30 via-transparent to-transparent opacity-60" />
        </motion.div>

        {/* --- Bubble 02: Right Center Vibrant Emerald Fluid Asset --- */}
        <motion.div
          animate={{
            y: [0, 35, 0],
            x: [0, -15, 0],
            scale: [1, 1.08, 1],
            borderRadius: [
              "50% 50% 30% 70% / 50% 60% 40% 50%",
              "35% 65% 65% 35% / 45% 35% 65% 55%",
              "50% 50% 30% 70% / 50% 60% 40% 50%"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[25%] right-[-8%] w-[380px] h-[380px] bg-gradient-to-bl from-emerald-400/15 via-teal-500/10 to-transparent border border-white/60 shadow-[inset_0_4px_25px_rgba(255,255,255,0.5),0_20px_45px_rgba(16,185,129,0.04)] backdrop-blur-lg"
        >
          <div className="absolute inset-4 rounded-full border border-white/20 opacity-40" />
        </motion.div>

        {/* --- Bubble 03: Bottom Center Deep Ambient Gradient Core --- */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            x: [-10, 10, -10]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[25%] w-[500px] h-[350px] rounded-full bg-gradient-to-r from-orange-400/10 via-amber-300/10 to-emerald-400/5 blur-[80px]"
        />

        {/* --- Bubble 04: Small High-Contrast Floating Orb --- */}
        <motion.div
          animate={{
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-[15%] right-[15%] w-16 h-16 rounded-full bg-gradient-to-tr from-orange-400/20 to-amber-300/40 border border-white/70 shadow-[inset_0_2px_8px_rgba(255,255,255,0.7),0_10px_20px_rgba(249,115,22,0.05)] backdrop-blur-xs"
        />

      </div>

      {/* =========================================================================
          FOREGROUND INTERACTIVE STEPS LAYER
          ========================================================================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Section Typography Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 shadow-3xs mb-3">
            ✦ Simple Architecture
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl leading-tight">
            How It{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="mt-4 text-base font-medium text-slate-500">
            Start sharpening your global conversation skills within minutes using our AI roadmap.
          </p>
        </div>

        {/* Balanced Grid Roadmap Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              whileHover={{ y: -6, scale: 1.015 }}
              className="relative rounded-3xl bg-white/80 border border-slate-200/80 p-1 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_20px_45px_rgba(245,158,11,0.04)] hover:border-amber-200/60 flex h-full"
            >
              {/* Internal card surface reflection */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
              
              <div className="w-full flex">
                <JourneyStep
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  index={index}
                />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}