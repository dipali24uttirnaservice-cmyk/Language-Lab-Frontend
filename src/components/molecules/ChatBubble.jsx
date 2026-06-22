"use client";

import { motion } from "framer-motion";

export default function ChatBubble({ message, sender }) {
  const isUser = sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[80%] rounded-3xl px-6 py-4 text-sm font-medium shadow-sm transition-all
          ${isUser 
            ? "bg-slate-900 text-white rounded-tr-none" 
            : "bg-white/80 border border-slate-200 text-slate-800 rounded-tl-none backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
          }
        `}
      >
        {message}
      </div>
    </motion.div>
  );
}