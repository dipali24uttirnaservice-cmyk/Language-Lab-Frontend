"use client";
import { motion } from "framer-motion";
import { FaPlay, FaEllipsisV } from "react-icons/fa";

export default function YouTubeVideoCard({ thumbnail, title, channel, views, uploaded, duration }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group flex flex-col cursor-pointer bg-white rounded-3xl border border-slate-200 p-2 shadow-sm hover:shadow-2xl transition-all duration-300"
    >
      {/* Thumbnail with Gradient Glow */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-200">
        <div className="aspect-video w-full overflow-hidden">
          <img src={thumbnail} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/20">
            <FaPlay className="text-white" />
          </div>
        </div>

        <span className="absolute bottom-3 right-3 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          {duration}
        </span>
      </div>

      {/* Details Section */}
      <div className="mt-4 px-2 pb-2 flex gap-3">
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs shrink-0 border-2 border-white shadow-inner">
          AI
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-slate-400">{channel} • {views} views</p>
        </div>
        <button className="text-slate-300 hover:text-slate-900 self-start">
          <FaEllipsisV size={14} />
        </button>
      </div>
    </motion.div>
  );
}