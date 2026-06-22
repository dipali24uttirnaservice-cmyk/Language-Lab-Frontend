"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import DashboardStats from "@/components/organisms/DashboardStats";
import RecentActivity from "@/components/organisms/RecentActivity";

export default function DashboardPage() {


 

  return (
    <div className="relative min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900 overflow-hidden">

     

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] opacity-80" />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -top-20
            right-[10%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-gradient-to-br
            from-amber-300/15
            via-orange-200/10
            to-transparent
            blur-[100px]
          "
        />

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="
            absolute
            bottom-20
            -left-20
            h-[450px]
            w-[450px]
            rounded-full
            bg-gradient-to-tr
            from-emerald-300/10
            via-teal-200/10
            to-transparent
            blur-[90px]
          "
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 shadow-sm mb-2">
              ✦ English Learning Dashboard
            </span>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
              Welcome Back,
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
                {" "}English Learner 👋
              </span>
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Continue your English learning journey today.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/80 p-2 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase">
              AI Coach Online
            </span>
          </div>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Main Layout */}
        <div className="grid gap-8 lg:grid-cols-3 items-start">

          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          {/* Progress Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="
              rounded-3xl
              border
              border-slate-200/80
              bg-white
              p-6
              shadow-sm
            "
          >
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
              🏆 Weekly Goal
            </h3>

            <p className="mb-4 text-xs text-slate-400">
              Reach Intermediate Speaking Level
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Progress</span>
                <span className="text-orange-500">74%</span>
              </div>

              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "74%" }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 border-t pt-4 space-y-3">

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Daily XP
                </span>

                <span className="font-bold">
                  370 / 500
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Vocabulary Learned
                </span>

                <span className="font-bold">
                  125 Words
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Speaking Score
                </span>

                <span className="font-bold text-emerald-600">
                  8.2 / 10
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}