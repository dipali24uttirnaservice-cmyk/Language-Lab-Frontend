"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/molecules/StatCard";

const stats = [
  {
    value: "50+",
    label: "Languages",
  },
  {
    value: "10K+",
    label: "Students",
  },
  {
    value: "1M+",
    label: "Lessons Completed",
  },
  {
    value: "95%",
    label: "Success Rate",
  },
];

export default function StatsSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100/50 to-orange-50/10">
      
      {/* =========================================================================
          STRUCTURAL RADIANTS BACKDROP (MATCHES THE 3D GLASS ENVIRONMENT)
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Soft, Sunset Horizon Glows */}
        <div className="absolute top-1/2 left-1/4 h-[500px] w-[500px] rounded-full bg-orange-200/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] h-[450px] w-[450px] rounded-full bg-amber-200/20 blur-[100px]" />

        {/* Clean Architectural Layer Separator Beam */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
            Trusted by Learners{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-500">
            Thousands of global students leverage LanguageLab to break down communication friction.
          </p>
        </div>

        {/* 4-Column Metric Grid System */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <StatCard
              key={index}
              value={item.value}
              label={item.label}
              index={index}
            />
          ))}
        </div>

      </div>
    </section>
  );
}