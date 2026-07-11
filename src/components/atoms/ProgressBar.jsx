"use client";

import { motion } from "framer-motion";

export default function ProgressBar({
  percentage = 0,
  color = "from-orange-500 to-amber-500",
  label = "Progress",
  showLabel = true,
}) {
  const clamped = Math.max(0, Math.min(100, percentage));

  return (
    <div>
      {showLabel && (
        <div className="mb-2 flex justify-between text-sm font-semibold text-slate-500">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}
