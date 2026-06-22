"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState({ code: "EN", flag: "🇺🇸" });

  const languages = [
    { name: "English", code: "EN", flag: "🇺🇸" },
    { name: "Spanish", code: "ES", flag: "🇪🇸" },
    { name: "Japanese", code: "JA", flag: "🇯🇵" },
    { name: "French", code: "FR", flag: "🇫🇷" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-4 flex h-16 items-center justify-between rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl px-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          
          {/* Brand Logo - Font size increased to text-2xl/3xl */}
          <Link href="/">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-slate-900 cursor-pointer">
              Language<span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Lab</span>
            </h2>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {["Home", "Courses", "Pricing", "Contact"].map((item) => (
              <Link 
                key={item} 
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="relative py-1 transition-colors hover:text-slate-900 group"
              >
                {item}
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Actions Block */}
          <div className="flex items-center gap-4">
            
            {/* Interactive Language Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-500 transition-colors"
              >
                <span>{currentLang.flag}</span>
                {currentLang.code}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-32 rounded-xl border border-slate-100 bg-white p-1 shadow-xl"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setCurrentLang(lang); setIsOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {lang.flag} {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA Get Started Button */}
            <motion.button
              whileHover={{ scale: 1.02, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/login")}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}