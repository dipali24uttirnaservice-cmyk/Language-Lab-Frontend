"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-slate-50 overflow-hidden text-slate-900 selection:bg-amber-200 selection:text-amber-900">
      
      {/* =========================================================================
          DYNAMIC ZOOMING BACKGROUND: GRID CHECKS & PIPELINE 3D ENGINE
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        
        {/* Ambient Gradient Floor Map */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/70 to-amber-50/30" />

        {/* HIGH-CONTRAST TECH GRID CHECKS PATTERN */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />

        {/* --- Central Lens Matrix: Automatic Infinite Zoom Mechanics --- */}
        <motion.div 
          animate={{ 
            scale: [1, 1.06, 1],
            opacity: [0.4, 0.6, 0.4] 
          }}
          transition={{ 
            duration: 14, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] flex items-center justify-center"
        >
          <div className="w-full h-full rounded-full border-[8px] border-white/80 shadow-[inset_0_0_60px_rgba(255,255,255,0.6),0_30px_80px_rgba(0,0,0,0.04)] backdrop-blur-[3px] relative">
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-amber-400/20" />
            <div className="absolute inset-16 rounded-full border border-slate-200/50" />
          </div>
        </motion.div>

        {/* --- Upper Translucent Pipeline Tube --- */}
        <div className="absolute top-[28%] left-0 w-full h-8 bg-gradient-to-b from-white/50 via-white/90 to-white/30 border-y border-white shadow-[inset_0_1px_4px_rgba(255,255,255,0.9)] backdrop-blur-[4px] flex items-center">
          <motion.div 
            animate={{ x: ["-100%", "300%"] }}
            transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
            className="w-1/4 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px]"
          />
        </div>

        {/* --- Lower Translucent Pipeline Tube --- */}
        <div className="absolute bottom-[28%] left-0 w-full h-6 bg-gradient-to-b from-white/40 via-white/80 to-white/20 border-y border-white/90 shadow-2xs backdrop-blur-[2px] flex items-center">
          <motion.div 
            animate={{ x: ["300%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="w-1/5 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-[1px]"
          />
        </div>

        {/* Vibrant Accent Glow Nodes */}
        <div className="absolute bottom-0 left-[8%] h-72 w-72 rounded-full bg-amber-200/25 blur-[80px]" />
        <div className="absolute bottom-0 right-[12%] h-72 w-72 rounded-full bg-emerald-200/20 blur-[80px]" />
      </div>

      {/* =========================================================================
          FOREGROUND STRUCTURAL CONTENT CONTAINER (HIGH CARD SHOW EFFECT)
          ========================================================================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-12">
        
        {/* Four-Column Matrix Layout */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 items-stretch pb-16">

          {/* Column 1: Brand Card Module */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-3xl border-2 border-white bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.07)] transition-shadow duration-300 flex flex-col justify-between cursor-default"
          >
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                LanguageLab
              </h2>
              <p className="mt-3 text-xs font-semibold text-slate-500 leading-relaxed">
                An advanced, interactive language architecture built natively on generative artificial intelligence frameworks.
              </p>
            </div>
          </motion.div>

          {/* Column 2: Product Card Module */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-3xl border-2 border-white bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(245,158,11,0.05)] transition-shadow duration-300"
          >
            <h3 className="font-black text-slate-900 tracking-wider text-[11px] uppercase mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" /> Product
            </h3>
            <div className="space-y-3.5">
              <Link href="/" className="block text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors">
                Features Overview
              </Link>
              <Link href="/" className="block text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors">
                Pricing Engine
              </Link>
            </div>
          </motion.div>

          {/* Column 3: Company Card Module */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-3xl border-2 border-white bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(249,115,22,0.05)] transition-shadow duration-300"
          >
            <h3 className="font-black text-slate-900 tracking-wider text-[11px] uppercase mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" /> Company
            </h3>
            <div className="space-y-3.5">
              <Link href="/" className="block text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors">
                About Our Lab
              </Link>
              <Link href="/" className="block text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors">
                Contact Desk
              </Link>
            </div>
          </motion.div>

          {/* Column 4: Network Hub Module (VIBRANT NATIVE BRAND COLORS) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="rounded-3xl border-2 border-white bg-white/90 backdrop-blur-xl p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.05)] transition-shadow duration-300"
          >
            <h3 className="font-black text-slate-900 tracking-wider text-[11px] uppercase mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Network Hub
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <FaFacebookF />, url: "#", color: "text-white bg-[#1877F2] border-[#1877F2] shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:scale-110" },
                { icon: <FaTwitter />, url: "#", color: "text-white bg-[#1DA1F2] border-[#1DA1F2] shadow-[0_4px_12px_rgba(29,161,242,0.25)] hover:scale-110" },
                { icon: <FaInstagram />, url: "#", color: "text-white bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] border-[#ee2a7b] shadow-[0_4px_12px_rgba(238,42,123,0.25)] hover:scale-110" },
                { icon: <FaLinkedinIn />, url: "#", color: "text-white bg-[#0077B5] border-[#0077B5] shadow-[0_4px_12px_rgba(0,119,181,0.25)] hover:scale-110" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  whileTap={{ scale: 0.92 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border font-bold text-base transition-all duration-300 cursor-pointer ${social.color}`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Metadata System Floor Bar */}
        <div className="border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          <div>
            © 2026 LanguageLab. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}