"use client";

import { FaPlus, FaComments, FaHistory } from "react-icons/fa";
import { motion } from "framer-motion";

const chats = [
  "English Grammar",
  "Spanish Practice",
  "French Conversation",
];

export default function ChatSidebar() {
  return (
    <aside className="w-80 border-r border-slate-200/60 bg-white/50 backdrop-blur-xl p-6 flex flex-col h-full">
      
      {/* New Chat Button */}
      <button className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
        <FaPlus />
         New Chat
      </button>

      {/* History Header */}
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <FaHistory /> Recent History
        </h3>
      </div>

      {/* Chat List */}
      <div className="space-y-2 overflow-y-auto">
        {chats.map((chat) => (
          <motion.div
            key={chat}
            whileHover={{ x: 4 }}
            className="group flex items-center gap-3 rounded-xl p-3.5 text-slate-600 hover:bg-white/70 hover:text-slate-900 border border-transparent hover:border-slate-200/60 cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            <div className="text-slate-400 group-hover:text-amber-500 transition-colors">
              <FaComments />
            </div>
            <span className="text-sm font-semibold tracking-wide">{chat}</span>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-6 border-t border-slate-200/50">
        <div className="bg-amber-100/50 rounded-2xl p-4 border border-amber-200/50">
          <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
            PRO TIP: Switch between your language sessions anytime. Your progress is saved automatically.
          </p>
        </div>
      </div>
    </aside>
  );
}