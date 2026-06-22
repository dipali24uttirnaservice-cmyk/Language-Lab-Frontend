"use client";

import { motion } from "framer-motion";

export default function RegisterBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />

      {/* Large Glow */}
      <div className="absolute top-0 left-0 h-[600px] w-[600px] rounded-full bg-orange-300/20 blur-[180px]" />

      <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-yellow-300/20 blur-[180px]" />

      {/* Learning Path */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M150 700 C300 550, 500 550, 650 400 S900 250, 1200 150"
          stroke="#FDBA74"
          strokeWidth="8"
          fill="none"
          strokeDasharray="20 15"
          opacity="0.4"
        />
      </svg>

      {/* Student Start */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute bottom-28 left-24 text-8xl"
      >
        👨‍🎓
      </motion.div>

      {/* Goal */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-24 right-24 text-8xl"
      >
        🏆
      </motion.div>

      {/* Progress Stops */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute left-[30%] bottom-[45%] text-6xl"
      >
        ⭐
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute left-[50%] bottom-[55%] text-6xl"
      >
        📚
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute left-[70%] bottom-[65%] text-6xl"
      >
        🎯
      </motion.div>

      {/* Floating Achievement Badges */}
      <motion.div
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-24 left-24 rounded-3xl bg-white/80 px-6 py-4 shadow-xl"
      >
        🥇 Top Performer
      </motion.div>

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute bottom-32 right-32 rounded-3xl bg-white/80 px-6 py-4 shadow-xl"
      >
        🎓 AI Certificate
      </motion.div>

      {/* Floating Particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -25, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + (i % 5),
          }}
          className="absolute h-2 w-2 rounded-full bg-orange-400"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}