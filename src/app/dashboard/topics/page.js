"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  Layers3,
  ChevronRight,
} from "lucide-react";

import { topicApi } from "@/services/topic/topicApi";

export default function TopicPage() {
    const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await topicApi.getTopics();

      setTopics(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

return (
  <div className="relative min-h-screen overflow-hidden">

    {/* ================================================= */}
    {/* PREMIUM ANIMATED BACKGROUND */}
    {/* ================================================= */}

    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />

      {/* Top Left Orb */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="
          absolute
          -top-32
          -left-32
          h-[350px]
          w-[350px]
          rounded-full
          bg-gradient-to-br
          from-orange-400/30
          to-amber-300/20
          blur-3xl
        "
      />

      {/* Bottom Right Orb */}
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
        className="
          absolute
          bottom-0
          right-0
          h-[400px]
          w-[400px]
          rounded-full
          bg-gradient-to-br
          from-orange-300/20
          to-yellow-300/20
          blur-3xl
        "
      />

      {/* Floating Sphere */}
      <motion.div
        animate={{
          y: [0, -25, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          top-20
          right-44
          h-16
          w-16
          rounded-full
          bg-gradient-to-br
          from-orange-500
          to-amber-400
          shadow-xl
        "
      />

      {/* Rotating Ring */}
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          top-10
          right-10
          h-48
          w-48
          rounded-full
          border-[16px]
          border-orange-300/50
        "
      />

      {/* Decorative Grid */}
      <div
        className="
          absolute
          top-32
          right-80
          h-24
          w-24
          opacity-30
          bg-[radial-gradient(circle,_#f97316_2px,_transparent_2px)]
          [background-size:16px_16px]
        "
      />

      {/* Curved Lines */}
      <div className="absolute left-0 top-0 w-[500px] h-[500px] rounded-full border border-orange-200/40" />
      <div className="absolute left-10 top-10 w-[520px] h-[520px] rounded-full border border-orange-200/20" />
    </div>

    {/* ================================================= */}
    {/* PAGE CONTENT */}
    {/* ================================================= */}

    <div className="relative z-10 space-y-8">

    {/* Header */}

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
>
  {/* Left */}

  <div>

    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-orange-200
        bg-white/80
        backdrop-blur-xl
        px-4
        py-2
        shadow-md
      "
    >
      <span className="text-lg">✨</span>

      <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
        Language Lab
      </span>
    </div>

    <h1 className="mt-4 text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
      Learning Topics
    </h1>

   

  </div>

  {/* Right Badge */}

  <motion.div
    whileHover={{
      scale: 1.05,
      rotate: -2,
    }}
    className="
      self-start
      rounded-3xl
      border
      border-orange-100
      bg-white/80
      backdrop-blur-xl
      px-6
      py-4
      shadow-lg
    "
  >
    <p className="text-xs uppercase tracking-widest text-slate-500">
      Welcome Back
    </p>

    <h3 className="mt-1 text-lg font-black text-orange-600">
      Continue Learning 🚀
    </h3>
  </motion.div>

</motion.div>
     {/* Premium Statistics */}

<div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

  {/* Total Topics */}

  <motion.div
    whileHover={{ y: -5 }}
    className="
      relative
      overflow-hidden
      rounded-3xl
      bg-white/80
      backdrop-blur-xl
      border
      border-orange-100
      p-5
      shadow-lg
    "
  >
    <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-orange-200/30 blur-2xl" />

    <div className="relative flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-500 font-medium">
          Total Topics
        </p>

        <h2 className="mt-2 text-4xl font-black text-slate-900">
          {topics.length}
        </h2>
      </div>

      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
        <BookOpen size={26} />
      </div>

    </div>
  </motion.div>

  {/* Total Subtopics */}

  <motion.div
    whileHover={{ y: -5 }}
    className="
      relative
      overflow-hidden
      rounded-3xl
      bg-white/80
      backdrop-blur-xl
      border
      border-emerald-100
      p-5
      shadow-lg
    "
  >
    <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-emerald-200/30 blur-2xl" />

    <div className="relative flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-500 font-medium">
          Total Subtopics
        </p>

        <h2 className="mt-2 text-4xl font-black text-emerald-600">
          {topics.reduce(
            (acc, item) => acc + item.subtopic_count,
            0
          )}
        </h2>
      </div>

      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white shadow-lg">
        <Layers3 size={26} />
      </div>

    </div>
  </motion.div>

  {/* Progress */}

  <motion.div
    whileHover={{ y: -5 }}
    className="
      relative
      overflow-hidden
      rounded-3xl
      bg-white/80
      backdrop-blur-xl
      border
      border-violet-100
      p-5
      shadow-lg
    "
  >
    <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-violet-200/30 blur-2xl" />

    <div className="relative flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-500 font-medium">
          Progress
        </p>

        <h2 className="mt-2 text-4xl font-black text-violet-600">
          0%
        </h2>
      </div>

      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
        📈
      </div>

    </div>
  </motion.div>

  {/* Level */}

  <motion.div
    whileHover={{ y: -5 }}
    className="
      relative
      overflow-hidden
      rounded-3xl
      bg-white/80
      backdrop-blur-xl
      border
      border-blue-100
      p-5
      shadow-lg
    "
  >
    <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-blue-200/30 blur-2xl" />

    <div className="relative flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-500 font-medium">
          Current Level
        </p>

        <h2 className="mt-2 text-4xl font-black text-blue-600">
          A1
        </h2>
      </div>

      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
        🎯
      </div>

    </div>
  </motion.div>

</div>

      {/* Topics */}
     <div className="space-y-5">

  {topics.map((topic, index) => {

    const colors = [
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-amber-500",
      "from-blue-500 to-indigo-500",
      "from-pink-500 to-rose-500",
      "from-cyan-500 to-sky-500",
      "from-violet-500 to-purple-500",
    ];

    const color = colors[index % colors.length];

    return (
      <motion.div
        key={topic._id}
        whileHover={{
          y: -6,
          scale: 1.01,
        }}
        transition={{ duration: 0.25 }}
        className="
          group
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-white/70
          bg-white/80
          backdrop-blur-xl
          shadow-lg
          hover:shadow-2xl
          p-6
        "
      >

        {/* Background Glow */}

        <div
          className={`
            absolute
            -right-12
            -top-12
            h-44
            w-44
            rounded-full
            bg-gradient-to-br
            ${color}
            opacity-10
            blur-3xl
            transition-all
            duration-700
            group-hover:scale-125
          `}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          {/* Left */}

          <div className="flex items-center gap-5">

            <motion.div
              whileHover={{
                rotate: -8,
                scale: 1.08,
              }}
              className={`
                h-20
                w-20
                rounded-3xl
                bg-gradient-to-br
                ${color}
                flex
                items-center
                justify-center
                text-white
                shadow-xl
              `}
            >
              <BookOpen size={34} />
            </motion.div>

            <div>

              <h2 className="text-2xl font-black text-slate-900">
                {topic.title}
              </h2>

              <div className="mt-2 flex items-center gap-3">

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                  {topic.subtopic_count} Subtopics
                </span>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
                  Beginner
                </span>

              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                {topic.description}
              </p>

            </div>

          </div>

          {/* Right */}

          <div className="lg:w-64">

            <div className="mb-2 flex justify-between text-sm font-semibold text-slate-500">

              <span>Progress</span>

              <span>0%</span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">

              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "0%" }}
                className={`h-full bg-gradient-to-r ${color}`}
              />

            </div>

            <button
              onClick={() =>
                router.push(`/dashboard/topics/${topic._id}`)
              }
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-orange-500
                to-amber-500
                px-5
                py-2.5
                text-sm
                font-bold
                text-white
                shadow-lg
                transition-all
                hover:scale-105
                hover:shadow-xl
              "
            >
              Explore

              <ChevronRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />

            </button>

          </div>

        </div>

      </motion.div>
    );
  })}

</div>
    </div>
  </div>
);
}