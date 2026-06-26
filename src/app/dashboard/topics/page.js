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
      <div>

        <span
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-orange-100
            px-4
            py-2
            text-xs
            font-bold
            text-orange-700
          "
        >
          ✨ Language Lab Learning Hub
        </span>

        <h1 className="mt-5 text-5xl font-black text-slate-900">
          Learning Topics
        </h1>

        <p className="mt-3 text-lg text-slate-500">
          Explore, learn and master English with interactive lessons.
        </p>
      </div>

      {/* Statistics Card */}
      <div
        className="
          rounded-[32px]
          border
          border-white/40
          bg-white/80
          backdrop-blur-xl
          shadow-xl
          p-8
        "
      >
        <div className="grid gap-8 md:grid-cols-4">

          <div>
            <h3 className="text-4xl font-black text-slate-900">
              {topics.length}
            </h3>
            <p className="text-slate-500">
              Total Topics
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-black text-orange-500">
              {topics.reduce(
                (acc, item) => acc + item.subtopic_count,
                0
              )}
            </h3>
            <p className="text-slate-500">
              Total Subtopics
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-black text-emerald-500">
              0%
            </h3>
            <p className="text-slate-500">
              Overall Progress
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-black text-violet-500">
              A1
            </h3>
            <p className="text-slate-500">
              Current Level
            </p>
          </div>

        </div>
      </div>

      {/* Topics */}
      <div className="space-y-6">

        {topics.map((topic, index) => {

          const colors = [
            "from-emerald-500 to-teal-500",
            "from-orange-500 to-amber-500",
            "from-blue-500 to-indigo-500",
            "from-pink-500 to-rose-500",
            "from-cyan-500 to-sky-500",
            "from-violet-500 to-purple-500",
          ];

          const color =
            colors[index % colors.length];

          return (
            <motion.div
              key={topic._id}
              whileHover={{
                y: -5,
                scale: 1.01,
              }}
              className="
                rounded-[32px]
                border
                border-white/50
                bg-white/80
                backdrop-blur-xl
                shadow-lg
                p-6
              "
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                {/* Left */}
                <div className="flex items-center gap-5">

                  <div
                    className={`
                      h-20
                      w-20
                      rounded-3xl
                      bg-gradient-to-r
                      ${color}
                      text-white
                      flex
                      items-center
                      justify-center
                      shadow-lg
                    `}
                  >
                    <BookOpen size={34} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {topic.title}
                    </h2>

                    <p className="mt-1 text-orange-500 font-semibold">
                      {topic.subtopic_count} Subtopics
                    </p>

                    <p className="mt-2 text-slate-500">
                      {topic.description}
                    </p>
                  </div>

                </div>

                {/* Right */}
                <div className="w-full max-w-md">

                  <div className="mb-2 flex justify-between font-bold">
                    <span>Progress</span>
                    <span>0%</span>
                  </div>

                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "0%" }}
                      className={`h-full bg-gradient-to-r ${color}`}
                    />
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/topics/${topic._id}`
                      )
                    }
                    className="
                      mt-5
                      w-full
                      rounded-2xl
                      bg-slate-900
                      py-3
                      font-bold
                      text-white
                      transition-all
                      hover:bg-orange-500
                    "
                  >
                    Open Topic →
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