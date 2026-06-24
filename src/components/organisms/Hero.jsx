"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AIAvatarCoach from "./AIAvatarCoach";

export default function Hero() {
  const router = useRouter();
  const mainVideoRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceAccent, setVoiceAccent] = useState("en-IN");
  const [voiceGender, setVoiceGender] = useState("female");
  const [mainVideoFinished, setMainVideoFinished] = useState(false);
  const [isPlayingMain, setIsPlayingMain] = useState(false);

  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 text-slate-900">
      {/* Background Refraction Masks */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/40 via-orange-50/20 to-slate-50 pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full flex flex-col justify-center pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Text Mechanics */}
          <div className="lg:col-span-5 space-y-6 text-left z-10 order-2 lg:order-1">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-amber-200 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm shadow-amber-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              New AI Testimonial Feature is live
            </div>

            {/* Header Title - Increased size to match navbar prominence */}
           {/* Hero Title Container */}
{/* Hero Title Container - Slightly smaller, more refined sizing */}
<div className="flex flex-col items-start text-left max-w-2xl">
  <div className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tighter text-slate-900">
    Your Personal <br />
    <span className="text-red-500">AI</span>{" "}
    <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 bg-clip-text text-transparent">
      English Coach
    </span>
  </div>
  
 
</div>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Master fluent English with real-time feedback, personalized AI tutoring, and interactive speech analysis.
            </p>

            {/* CTA Buttons */}
           <div className="grid grid-cols-3 gap-5 max-w-xl mt-8">
  {/* Learners */}
  <div
    className="
      relative overflow-hidden
      rounded-3xl
      border border-orange-200
      bg-gradient-to-br from-orange-50 via-white to-amber-100
      p-5
      shadow-[0_10px_30px_rgba(251,146,60,0.15)]
      hover:-translate-y-2
      hover:shadow-[0_20px_40px_rgba(251,146,60,0.25)]
      transition-all duration-300
    "
  >
    {/* Glow */}
    <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-orange-300/30 blur-2xl" />

    {/* Stripe Pattern */}
    <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(135deg,#f97316_0px,#f97316_1px,transparent_1px,transparent_12px)]" />

    <div className="relative z-10">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl shadow-inner">
        🎓
      </div>

      <h4 className="text-3xl font-black text-orange-600">
        10K+
      </h4>

      <p className="mt-1 text-sm font-medium text-slate-600">
        Active Learners
      </p>
    </div>
  </div>

  {/* Improvement */}
  <div
    className="
      relative overflow-hidden
      rounded-3xl
      border border-emerald-200
      bg-gradient-to-br from-emerald-50 via-white to-green-100
      p-5
      shadow-[0_10px_30px_rgba(16,185,129,0.15)]
      hover:-translate-y-2
      hover:shadow-[0_20px_40px_rgba(16,185,129,0.25)]
      transition-all duration-300
    "
  >
    <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-emerald-300/30 blur-2xl" />

    <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(135deg,#10b981_0px,#10b981_1px,transparent_1px,transparent_12px)]" />

    <div className="relative z-10">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl shadow-inner">
        📈
      </div>

      <h4 className="text-3xl font-black text-emerald-600">
        95%
      </h4>

      <p className="mt-1 text-sm font-medium text-slate-600">
        Improvement Rate
      </p>
    </div>
  </div>

  {/* AI Coach */}
  <div
    className="
      relative overflow-hidden
      rounded-3xl
      border border-indigo-200
      bg-gradient-to-br from-indigo-50 via-white to-violet-100
      p-5
      shadow-[0_10px_30px_rgba(99,102,241,0.15)]
      hover:-translate-y-2
      hover:shadow-[0_20px_40px_rgba(99,102,241,0.25)]
      transition-all duration-300
    "
  >
    <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-indigo-300/30 blur-2xl" />

    <div className="absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(135deg,#6366f1_0px,#6366f1_1px,transparent_1px,transparent_12px)]" />

    <div className="relative z-10">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-xl shadow-inner">
        🤖
      </div>

      <h4 className="text-3xl font-black text-indigo-600">
        24/7
      </h4>

      <p className="mt-1 text-sm font-medium text-slate-600">
        AI Coach Support
      </p>
    </div>
  </div>
</div>

            {/* Voice Settings Card */}
          {/* Voice Settings Card - Now larger and more prominent */}
<div className="relative mt-8 max-w-md">
  {/* Background glow effect to make the card "pop" */}
  <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-orange-200 rounded-2xl blur opacity-30"></div>
  
  <div className="relative p-6 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl shadow-orange-100/20">
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
        🎙️ Configure Coach Profile
      </span>
     
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Accent</label>
        <select 
          value={voiceAccent} 
          onChange={(e) => setVoiceAccent(e.target.value)} 
          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        >
          <option value="en-IN">🇮🇳 Indian English</option>
          <option value="en-US">🇺🇸 US English</option>
          <option value="en-GB">🇬🇧 UK English</option>
        </select>
      </div>
      
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">Voice</label>
        <select 
          value={voiceGender} 
          onChange={(e) => setVoiceGender(e.target.value)} 
          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
        >
          <option value="female">🙋‍♀️ Female Coach</option>
          <option value="male">🙋‍♂️ Male Coach</option>
        </select>
      </div>
    </div>
  </div>
</div>
          </div>

          {/* RIGHT COLUMN: Interactive Avatar */}
          <div className="lg:col-span-7 flex items-center justify-center order-1 lg:order-2">
            <div className="w-full max-w-lg transition-transform duration-500 hover:scale-[1.02]">
              <AIAvatarCoach
                voiceGender={voiceGender}
                voiceAccent={voiceAccent}
                isSpeaking={isSpeaking}
                mouseCoords={mouseCoords}
                isHovered={isHovered}
                setIsHovered={setIsHovered}
                setMouseCoords={setMouseCoords}
                mainVideoFinished={mainVideoFinished}
                setMainVideoFinished={setMainVideoFinished}
                isPlayingMain={isPlayingMain}
                setIsPlayingMain={setIsPlayingMain}
                mainVideoRef={mainVideoRef}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}