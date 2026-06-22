"use client";

import { motion } from "framer-motion";

export default function DashboardCard({
  title,
  value,
  icon,
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      className="
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        p-6
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h3>
        </div>

        <div className="text-3xl text-violet-400">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}