"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";import { motion } from "framer-motion";
import {
  BookOpen,
  Layers,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";


import { topicApi } from "@/services/topic/topicApi";
export default function TopicDetailsPage() {
  const { topicId } = useParams();
const router = useRouter();

const searchParams = useSearchParams();

const courseId = searchParams.get("courseId");
const type = searchParams.get("type");

console.log("Topic ID:", topicId);
console.log("Course ID:", courseId);
console.log("Type:", type);

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const res = await topicApi.getTopicById(topicId);

      setTopic(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (

    
   <div className="relative min-h-screen overflow-hidden">
{/* ================================================= */}
{/* PREMIUM 3D ANIMATED BACKGROUND */}
{/* ================================================= */}

<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
  {/* Base Gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-100" />

  {/* Large Floating Cube */}
  <motion.div
    animate={{
      y: [0, -40, 0],
      rotate: [0, 20, 0],
      x: [0, 25, 0],
    }}
    transition={{
      duration: 12,
      repeat: Infinity,
    }}
    className="
      absolute
      top-20
      right-40
      h-28
      w-28
      rounded-[30px]
      bg-gradient-to-br
      from-orange-400/30
      to-amber-300/20
      backdrop-blur-xl
      border
      border-white/40
      shadow-2xl
    "
  />

  {/* Floating Sphere */}
  <motion.div
    animate={{
      y: [0, -35, 0],
      x: [0, 30, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 9,
      repeat: Infinity,
    }}
    className="
      absolute
      top-32
      left-24
      h-24
      w-24
      rounded-full
      bg-gradient-to-br
      from-orange-400
      to-amber-400
      opacity-30
      blur-sm
      shadow-2xl
    "
  />

  {/* Glass Ring */}
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
      right-10
      top-12
      h-52
      w-52
      rounded-full
      border-[18px]
      border-orange-300/30
    "
  />

  {/* Bottom Glow */}
  <motion.div
    animate={{
      x: [0, -40, 0],
      y: [0, 20, 0],
    }}
    transition={{
      duration: 14,
      repeat: Infinity,
    }}
    className="
      absolute
      -bottom-24
      -left-24
      h-[420px]
      w-[420px]
      rounded-full
      bg-gradient-to-br
      from-orange-300/30
      to-yellow-200/20
      blur-3xl
    "
  />

  {/* Top Glow */}
  <motion.div
    animate={{
      y: [0, -30, 0],
    }}
    transition={{
      duration: 10,
      repeat: Infinity,
    }}
    className="
      absolute
      -top-20
      left-1/2
      h-[300px]
      w-[300px]
      -translate-x-1/2
      rounded-full
      bg-orange-200/30
      blur-3xl
    "
  />

  {/* Floating Dots */}
  <motion.div
    animate={{
      y: [0, -15, 0],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
    }}
    className="
      absolute
      top-40
      right-72
      grid
      grid-cols-4
      gap-4
      opacity-30
    "
  >
    {Array.from({ length: 16 }).map((_, i) => (
      <div
        key={i}
        className="h-2.5 w-2.5 rounded-full bg-orange-400"
      />
    ))}
  </motion.div>

  {/* Curved Lines */}
  <div className="absolute -left-40 top-0 h-[700px] w-[700px] rounded-full border border-orange-200/40" />
  <div className="absolute -left-24 top-10 h-[650px] w-[650px] rounded-full border border-orange-200/20" />

</div>

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-6 py-6"
>
  {/* Left */}
  <div className="flex items-start gap-5">

    {/* Back Button */}
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => router.back()}
      className="
        h-14
        w-14
        rounded-2xl
        bg-white/80
        backdrop-blur-xl
        border
        border-orange-100
        flex
        items-center
        justify-center
        shadow-lg
        text-orange-600
      "
    >
      <ArrowLeft size={22} />
    </motion.button>

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
        <span className="text-lg">📚</span>

        <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
          Language Lab
        </span>
      </div>

      <h1 className="mt-4 text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
        {topic?.title}
      </h1>

      <p className="mt-3 max-w-2xl text-slate-500 leading-7">
        {topic?.description}
      </p>
    </div>

  </div>

 

  {/* Right Side */}

{/* Right Side - Compact Stats */}

{/* Right Side */}

<div className="flex flex-wrap justify-end gap-4">

  {/* Subtopics */}

  <motion.div
    whileHover={{ y: -5, scale: 1.05 }}
    className="
      relative
      overflow-hidden
      rounded-2xl
      border
      border-orange-100
      bg-white/80
      backdrop-blur-xl
      px-5
      py-4
      shadow-lg
      min-w-[130px]
    "
  >
    <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-orange-200/40 blur-xl" />

    <p className="text-xs uppercase tracking-wider text-slate-500">
      Subtopics
    </p>

    <div className="mt-2 flex items-center justify-between">
      <h3 className="text-3xl font-black text-orange-600">
        {topic?.subtopic_count || 0}
      </h3>

      <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
        📚
      </div>
    </div>
  </motion.div>

  {/* Order */}

  <motion.div
    whileHover={{ y: -5, scale: 1.05 }}
    className="
      relative
      overflow-hidden
      rounded-2xl
      border
      border-blue-100
      bg-white/80
      backdrop-blur-xl
      px-5
      py-4
      shadow-lg
      min-w-[130px]
    "
  >
    <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-blue-200/40 blur-xl" />

    <p className="text-xs uppercase tracking-wider text-slate-500">
      Order
    </p>

    <div className="mt-2 flex items-center justify-between">
      <h3 className="text-3xl font-black text-blue-600">
        #{topic?.order}
      </h3>

      <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
        🔖
      </div>
    </div>
  </motion.div>

  {/* Status */}

  <motion.div
    whileHover={{ y: -5, scale: 1.05 }}
    className="
      relative
      overflow-hidden
      rounded-2xl
      border
      border-emerald-100
      bg-white/80
      backdrop-blur-xl
      px-5
      py-4
      shadow-lg
      min-w-[130px]
    "
  >
    <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-emerald-200/40 blur-xl" />

    <p className="text-xs uppercase tracking-wider text-slate-500">
      Status
    </p>

    <div className="mt-2 flex items-center justify-between">
      <h3 className="text-lg font-black text-emerald-600">
        Active
      </h3>

      <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
        ✓
      </div>
    </div>
  </motion.div>

</div>

</motion.div>

 

  {/* SubTopics */}

  <div>


    <div className="space-y-6">

      {topic?.subtopics?.map((subtopic, index) => {

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
  key={subtopic._id}
  whileHover={{
    y: -6,
    scale: 1.01,
  }}
  transition={{ duration: 0.25 }}
onClick={() =>
  router.push(`/dashboard/module/${type}/${subtopic._id}`)
}  className="
    group
    relative
    overflow-hidden
    rounded-[30px]
    border
    border-white/70
    bg-white/80
    backdrop-blur-xl
    shadow-lg
    hover:shadow-2xl
    cursor-pointer
    p-6
  "
>
  {/* Glow */}
  <div
    className={`
      absolute
      -right-10
      -top-10
      h-40
      w-40
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
        <Layers size={34} />
      </motion.div>

      <div>

        <h2 className="text-2xl font-black text-slate-900">
          {subtopic.title}
        </h2>

        <div className="mt-2 flex flex-wrap gap-2">

          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
            Order #{subtopic.order}
          </span>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
            Ready
          </span>

        </div>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          {subtopic.description}
        </p>

      </div>

    </div>

    {/* Right */}
    <div className="lg:w-56">

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

      
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-gradient-to-r
          from-orange-500
          to-amber-500
          px-4
          py-2
          text-sm
          font-semibold
          text-white
          shadow-lg
          transition-all
          hover:scale-105
          hover:shadow-xl
        "
      >
        Open
        <ChevronRight
          size={16}
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