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
            <div className="flex gap-4 pt-2">
              <button onClick={() => setShowLoginModal(true)} className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95">
                Get Started
              </button>
              <button onClick={() => router.push("/teacher")} className="px-8 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all active:scale-95">
                Teacher Console
              </button>
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