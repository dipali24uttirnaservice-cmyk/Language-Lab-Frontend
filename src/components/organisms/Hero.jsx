
"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Smile, Compass, Sparkles, Volume2, ArrowRight } from 'lucide-react';

const cefrTracks = [
  { id: 'a1', label: 'BEGIN A1', color: 'border-emerald-400 text-emerald-600 bg-emerald-50/50 shadow-emerald-200 glow-emerald' },
  { id: 'b2', label: 'CONTINUE B2', color: 'border-pink-400 text-pink-600 bg-pink-50/50 shadow-pink-200 glow-pink' },
  { id: 'speaking', label: 'SPEAKING MODULE', color: 'border-cyan-400 text-cyan-600 bg-cyan-50/50 shadow-cyan-200 glow-cyan' },
  { id: 'reading', label: 'READING TRACK', color: 'border-rose-400 text-rose-600 bg-rose-50/50 shadow-rose-200 glow-rose' },
];

export default function Hero() {
  const [activeTrack, setActiveTrack] = useState('a1');
  const [score, setScore] = useState(74);

  return (
    <section className="relative w-full overflow-hidden bg-slate-50 py-20 text-slate-800 font-sans">
      
      {/* 3D Grid Blueprint Floor Mat */}
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:3rem_3rem]" />

     

      <div className="container relative mx-auto max-w-6xl px-4 mt-8">
        
      

        {/* The 3D Console Box Deck */}
        <div className="relative mx-auto max-w-4xl bg-white border-4 border-slate-200/80 rounded-[36px] shadow-[0_20px_0_0_#f97316] p-6 md:p-10 transition-all">
          
          {/* Inner Content Grid */}
          <div className="grid gap-8 md:grid-cols-12 items-center">
            
            {/* Left Box: Virtual Assistant & Audio Cue */}
            <div className="md:col-span-4 flex flex-col items-center text-center p-4 bg-indigo-50/40 border-2 border-dashed border-indigo-200 rounded-2xl relative">
              <span className="absolute top-3 left-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              
              {/* Animated Audio/Language visual ring simulation */}
              <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center border-4 border-indigo-400 shadow-[0_6px_0_0_#818cf8] mb-4">
                <Smile className="w-14 h-14 text-indigo-600 stroke-[2.5]" />
                <div className="absolute -right-2 top-2 bg-amber-400 p-1.5 rounded-full text-white shadow">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                </div>
              </div>
              <h4 className="text-sm font-black text-indigo-950 uppercase tracking-wide">Lab Assistant</h4>
              <p className="text-xs font-bold text-slate-400 mt-1">Click a track layout below to dynamically adjust your laboratory pathing metrics.</p>
            </div>

            {/* Right Box: Integrated Institute Stats */}
            <div className="md:col-span-8 grid gap-4 sm:grid-cols-2">
              
              {/* Enrolled Students 3D Tile */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 shadow-[0_8px_0_0_#e2e8f0] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Enrolled Students</p>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mt-1">482+</h3>
                  </div>
                  <div className="bg-indigo-500 text-white p-3 rounded-2xl shadow-[0_4px_0_0_#3730a3]">
                    <GraduationCap className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-600 uppercase">
                  <span>Check CEFR Level</span> <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Active Teachers 3D Tile */}
              <div className="bg-amber-50/40 border-2 border-amber-200/70 rounded-3xl p-6 shadow-[0_8px_0_0_#fef3c7] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-wider text-amber-700/70 uppercase">Active Teachers</p>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mt-1">24</h3>
                  </div>
                  <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-[0_4px_0_0_#b45309]">
                    <Users className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>
                <div className="mt-4 text-[10px] font-extrabold text-amber-600 uppercase tracking-wide">
                  Top 5% Certified Profiles
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Base Tray Controls */}
          <div className="mt-10 pt-8 border-t-4 border-slate-100 grid gap-6 items-center md:grid-cols-12">
            
            {/* Multi-Colored Track Pills */}
            <div className="md:col-span-8 flex flex-wrap gap-3">
              {cefrTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setActiveTrack(track.id);
                    setScore(Math.floor(Math.random() * (95 - 60 + 1)) + 60);
                  }}
                  className={`border-2 rounded-2xl px-4 py-2.5 text-xs font-black tracking-wider uppercase transition-all duration-150 transform active:translate-y-1 active:shadow-none ${track.color} ${
                    activeTrack === track.id 
                      ? 'shadow-inner scale-95 border-slate-800 text-slate-900 bg-slate-200' 
                      : 'shadow-[0_5px_0_0_rgba(0,0,0,0.06)]'
                  }`}
                >
                  {track.label}
                </button>
              ))}
            </div>

            {/* Campus Target Gauge Indicator */}
            <div className="md:col-span-4 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 shadow-[0_4px_0_0_#e2e8f0]">
              <div className="flex justify-between items-center text-[10px] font-black tracking-wider text-slate-500 uppercase mb-2">
                <span>Campus Goal</span>
                <span className="text-indigo-600">{score}%</span>
              </div>
              <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden p-0.5 border border-slate-300">
                <motion.div 
                  animate={{ width: `${score}%` }}
                  transition={{ type: "spring", stiffness: 60 }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-emerald-400"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Floating Background Sparkle Bits */}
        <div className="absolute top-1/4 right-8 text-amber-400 animate-pulse hidden lg:block"><Sparkles className="w-8 h-8" /></div>
        <div className="absolute bottom-12 left-12 text-indigo-400 animate-spin hidden lg:block"><Compass className="w-6 h-6" /></div>

      </div>
    </section>
  );
}