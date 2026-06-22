"use client";

import { motion } from "framer-motion";

const items = [
  "🎤 Speaking Practice",
  "🤖 AI Tutor",
  "💬 Real Conversations",
  "📚 Vocabulary Builder",
  "🎓 Interview English",
  "🏆 Daily Challenges",
];

const dots = [
  { top: "8%", left: "12%" },
  { top: "15%", left: "78%" },
  { top: "22%", left: "45%" },
  { top: "30%", left: "90%" },
  { top: "35%", left: "18%" },
  { top: "42%", left: "65%" },
  { top: "48%", left: "28%" },
  { top: "55%", left: "82%" },
  { top: "62%", left: "10%" },
  { top: "68%", left: "52%" },
  { top: "74%", left: "38%" },
  { top: "80%", left: "92%" },
  { top: "12%", left: "58%" },
  { top: "26%", left: "5%" },
  { top: "39%", left: "75%" },
  { top: "51%", left: "48%" },
  { top: "64%", left: "88%" },
  { top: "72%", left: "22%" },
  { top: "85%", left: "60%" },
  { top: "92%", left: "35%" },
];

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#F8FAFC] pointer-events-none">
      {/* Main Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />

      {/* Orange Glow */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-orange-300/30 blur-[150px]" />

      {/* Amber Glow */}
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-amber-300/20 blur-[150px]" />

      {/* Center Glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/20 blur-[180px]" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148,163,184,.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,.08) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating Feature Cards */}
      {items.map((item, index) => (
        <motion.div
          key={item}
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4 + index,
          }}
          className="
            absolute
            rounded-2xl
            border border-white/60
            bg-white/50
            px-5 py-3
            backdrop-blur-xl
            shadow-lg
            text-slate-700
            font-medium
          "
          style={{
            top: `${12 + index * 12}%`,
            left: index % 2 ? "8%" : "75%",
          }}
        >
          {item}
        </motion.div>
      ))}

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-[18%] left-[40%] text-6xl"
      >
        🎓
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute top-[55%] left-[30%] text-6xl"
      >
        🎤
      </motion.div>

      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute top-[28%] right-[32%] text-6xl"
      >
        🤖
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute bottom-[20%] right-[25%] text-6xl"
      >
        💬
      </motion.div>

      {/* Floating Dots */}
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + (i % 4),
          }}
          className="absolute h-2 w-2 rounded-full bg-orange-300"
          style={{
            top: dot.top,
            left: dot.left,
          }}
        />
      ))}
    </div>
  );
}