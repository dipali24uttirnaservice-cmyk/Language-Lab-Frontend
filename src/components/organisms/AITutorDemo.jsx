"use client";

import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import { HiUser } from "react-icons/hi";

export default function AITutorDemo() {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-100 via-orange-50/30 to-emerald-50/20">
      
      {/* =========================================================================
          DYNAMIC ANIMATED 3D GLASS & GOLDEN HOUR BACKDROP ENGINE
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        
        {/* Sky Ambient Horizon Glow */}
        <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-bl from-amber-200/40 via-orange-100/20 to-transparent blur-[120px]" />
        
        {/* Center Glass Ring Container with soft pulsing effect */}
        <motion.div 
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] flex items-center justify-center"
        >
          {/* Main Giant 3D Glass Ring */}
          <div className="w-full h-full rounded-full border-[14px] border-white/40 shadow-[inset_0_0_80px_rgba(255,255,255,0.6),0_20px_100px_rgba(217,119,6,0.15)] backdrop-blur-[6px] relative">
            {/* Golden Inner Reflection Rim */}
            <div className="absolute inset-1 rounded-full border-[2px] border-amber-300/30" />
          </div>
        </motion.div>

        {/* Left Side: Animated Vertical Structural Glass Column Stack */}
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute left-[-5%] top-[10%] w-[30%] h-[80%] flex gap-4 items-end opacity-90"
        >
          <div className="w-24 h-[90%] bg-gradient-to-b from-white/30 to-slate-200/40 border-r border-white/50 backdrop-blur-[8px] shadow-2xl skew-y-6" />
          <div className="w-32 h-[75%] bg-gradient-to-t from-amber-100/20 via-white/40 to-white/10 border border-white/60 backdrop-blur-[12px] shadow-xl -translate-x-8" />
          <div className="w-16 h-[50%] bg-white/20 border-l border-white/40 backdrop-blur-[4px]" />
        </motion.div>

        {/* Right Side: Architectural Glass Pillars & Warm Counter-Floating Sun Shard */}
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute right-[-2%] top-[5%] w-[25%] h-[90%] flex flex-col gap-6 items-start opacity-95"
        >
          <div className="w-full h-[45%] bg-gradient-to-br from-emerald-100/20 via-white/30 to-transparent border-l-[3px] border-white/70 backdrop-blur-[14px] shadow-lg" />
          <div className="w-[80%] h-[50%] bg-gradient-to-tr from-amber-400/10 via-orange-300/20 to-white/40 border border-white/50 backdrop-blur-[10px] shadow-2xl -translate-y-12 translate-x-4 rounded-sm" />
        </motion.div>

        {/* Foreground Glass Plate Overlay (Rotational subtle float effect) */}
        <motion.div 
          animate={{ rotate: [-3, -1, -3], y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute left-[8%] bottom-[15%] w-80 h-96 rounded-2xl border border-white/70 bg-gradient-to-br from-white/30 to-white/5 backdrop-blur-[16px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)]" />
      </div>

      {/* =========================================================================
          FOREGROUND INTERACTIVE CONTAINER
          ========================================================================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Main Interface Window */}
        <div
          className="
            max-w-4xl mx-auto
            rounded-[2.5rem]
            border border-white/80
            bg-white/45
            backdrop-blur-3xl
            -webkit-backdrop-blur-3xl
            p-8 sm:p-14
            shadow-[0_30px_70px_rgba(217,119,6,0.05),0_10px_30px_rgba(0,0,0,0.02)]
          "
        >
          {/* Header Typography Group inside the Glass Window */}
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
              Meet Your AI Tutor
            </h2>
            <p className="mt-3 text-base font-semibold text-slate-500/90">
              Get instant explanations, examples, and feedback.
            </p>
          </div>

          {/* Chat Stream View */}
          <div className="space-y-6 max-w-2xl mx-auto">
            
            {/* Student Message Block */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm">
                <HiUser className="text-xl text-slate-600" />
              </div>
              <div className="bg-[#1e1e38] text-white rounded-2xl px-5 py-3 text-sm font-semibold tracking-wide shadow-md">
                How do I use Present Perfect?
              </div>
            </motion.div>

            {/* AI Tutor Message Block */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-start gap-4 justify-end"
            >
              <div className="bg-[#064e3b] text-emerald-50 rounded-2xl p-6 text-sm leading-relaxed font-medium shadow-xl border border-emerald-800/20 w-full sm:max-w-xl">
                <p className="text-emerald-100/90">
                  Learn in context: Present Perfect explains how actions in the past connect to the present. The structure consists of <span className="text-amber-300 font-bold">have/has + past participle</span>. For example:
                </p>
                
                <div className="mt-4 space-y-2 text-xs font-bold text-emerald-200/90 pl-1">
                  <div className="flex items-center gap-2">
                    <span>✓</span> I have finished my homework.
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✓</span> She has visited London.
                  </div>
                </div>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 text-emerald-800 text-lg border-2 border-white shadow-md">
                <FaRobot />
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}