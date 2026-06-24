"use client";

import { motion } from "framer-motion";

const particles = [
  { top: "10%", left: "15%" },
  { top: "18%", left: "82%" },
  { top: "28%", left: "35%" },
  { top: "38%", left: "72%" },
  { top: "48%", left: "12%" },
  { top: "58%", left: "55%" },
  { top: "68%", left: "28%" },
  { top: "78%", left: "88%" },
  { top: "88%", left: "45%" },
  { top: "15%", left: "60%" },
  { top: "25%", left: "10%" },
  { top: "35%", left: "90%" },
  { top: "45%", left: "75%" },
  { top: "55%", left: "20%" },
  { top: "65%", left: "65%" },
  { top: "75%", left: "40%" },
  { top: "85%", left: "80%" },
  { top: "20%", left: "50%" },
  { top: "30%", left: "25%" },
  { top: "40%", left: "58%" },
  { top: "50%", left: "92%" },
  { top: "60%", left: "8%" },
  { top: "70%", left: "52%" },
  { top: "80%", left: "32%" },
  { top: "90%", left: "70%" },
];

export default function RegisterBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />

      {/* Glow Effects */}
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

      {/* Student */}
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

      {/* Achievement Cards */}
      <motion.div
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-24 left-24 rounded-3xl bg-white/80 px-6 py-4 shadow-xl backdrop-blur-md"
      >
        🥇 Top Performer
      </motion.div>

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute bottom-32 right-32 rounded-3xl bg-white/80 px-6 py-4 shadow-xl backdrop-blur-md"
      >
        🎓 AI Certificate
      </motion.div>

      {/* Floating Particles */}
      {particles.map((particle, i) => (
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
            top: particle.top,
            left: particle.left,
          }}
        />
      ))}
    </div>
  );
}