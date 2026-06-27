"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Building2,
} from "lucide-react";

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

         

          {/* Right Actions Block */}
        <div className="flex items-center gap-3">
  {/* Student Login */}
  <button
  onClick={() => router.push("/student-login")}  
    className="
      flex items-center gap-2
      px-5 py-2.5
      rounded-xl
      bg-gradient-to-r
      from-amber-500
      to-orange-500
      text-white
      font-semibold
      shadow-lg
      hover:shadow-xl
      hover:scale-[1.02]
      transition-all duration-300
    "
  >
    <GraduationCap size={16} />
    Student Login
  </button>

  {/* Institute Login */}
 <button
  onClick={() => router.push("/login")}
  className="
    relative overflow-hidden
    flex items-center gap-2
    px-5 py-2.5
    rounded-xl
    bg-gradient-to-br
    from-slate-700
    via-slate-800
    to-black
    text-white
    font-semibold
    border border-slate-500/70
    shadow-lg
    hover:shadow-2xl
    hover:-translate-y-0.5
    transition-all duration-300
  "
>
  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent" />

  <Building2 size={16} className="relative z-10 text-slate-200" />
  <span className="relative z-10">
    Institute Login
  </span>
</button>
</div>
        </div>
      </div>
    </header>
  );
}