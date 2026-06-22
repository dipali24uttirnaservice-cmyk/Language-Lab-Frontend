"use client";

import React from "react";
import { motion } from "framer-motion";

export default function StudentLandingPage() {
  return (
 <main className="relative overflow-hidden bg-slate-50 text-slate-900 selection:bg-emerald-200">

  {/* Premium Animated Background */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">

    {/* Main Ambient Glows */}
    <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-amber-200/40 blur-[150px]" />

    <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-emerald-200/35 blur-[140px]" />

    <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-sky-200/20 blur-[120px]" />

    {/* Floating Morph Shapes */}
    <div className="absolute top-20 left-[10%] w-[420px] h-[420px] bg-gradient-to-br from-amber-400/20 to-orange-300/20 rounded-[60%_40%_70%_30%_/_40%_60%_40%_60%] animate-[spin_35s_linear_infinite]" />

    <div className="absolute bottom-10 right-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-400/15 to-teal-300/10 rounded-[40%_60%_30%_70%_/_60%_40%_60%_40%] animate-[spin_45s_linear_infinite_reverse]" />

    {/* Grid Overlay */}
    <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:60px_60px]" />

    {/* Noise Layer */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.5) 1px, transparent 0)",
        backgroundSize: "22px 22px",
      }}
    />
  </div>

  {/* Hero Section */}
  <section className="relative z-10 pt-32 pb-20 px-6 text-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto"
    >
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-300 bg-white/70 backdrop-blur-xl shadow-lg text-emerald-700 text-xs font-bold tracking-widest uppercase">
        Built for the Next Generation
      </div>

      <h1 className="mt-8 text-6xl md:text-8xl font-black tracking-tight leading-none">
        SPEAK{" "}
        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          FAST.
        </span>
        <br />
        THINK{" "}
        <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          GLOBAL.
        </span>
      </h1>

      <p className="mt-8 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
        Stop memorizing textbooks. Build confidence with AI-powered speaking,
        pronunciation analysis, grammar correction and personalized fluency coaching.
      </p>

      <div className="flex justify-center pt-10">
        <button className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-[0_20px_60px_rgba(16,185,129,0.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_25px_80px_rgba(16,185,129,0.35)]">
          JOIN THE LAB
        </button>
      </div>
    </motion.div>
  </section>

</main>
  );
}