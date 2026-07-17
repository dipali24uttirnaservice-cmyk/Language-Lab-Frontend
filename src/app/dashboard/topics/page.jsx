"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  Layers3,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

import { topicApi } from "@/services/topic/topicApi";
import { progressApi } from "@/services/progress/progressApi";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function TopicPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = searchParams.get("courseId");
  const courseName = searchParams.get("courseName");
  const type = searchParams.get("type");

const topicName = searchParams.get("topicName");



 


  console.log(courseId);
  console.log(type);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [topicProgress, setTopicProgress] = useState({});
  const [courseProgress, setCourseProgress] = useState(0);





  useEffect(() => {
  if (!courseId) {
    setLoading(false);
    return;
  }

  fetchTopics();
  fetchCourseProgress();
}, [courseId]);

const fetchTopics = async () => {
  try {
    const response = await topicApi.getTopics(courseId);
    setTopics(response.data.data || []);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Each topic's card shows its real completion % (modules completed ÷ total
// modules in that topic), and the header tile shows the course-wide %  —
// both come from one call instead of the placeholder "0%" this page used to show.
const fetchCourseProgress = async () => {
  try {
    const res = await progressApi.getCourseProgress(courseId);
    const data = res?.data?.data;
    const map = {};
    (data?.topics || []).forEach((t) => {
      map[t.topic_id] = t.percentage;
    });
    setTopicProgress(map);
    setCourseProgress(data?.percentage ?? 0);
  } catch (error) {
    console.error("Failed to fetch course progress:", error);
  }
};

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
          <BookOpen size={28} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">No course selected</h2>
          <p className="text-sm text-slate-500 mt-1">
            Pick a course from your Learning Journey to see its topics.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:scale-105 transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

return (
  <div className="relative min-h-screen overflow-hidden p-2">


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

   

    <div className="relative z-10 space-y-8">

    
{/* Header Section */}
<div className="flex items-center justify-between mb-8">
  {/* Left: Back Button + Course Name */}
  <div className="flex items-center gap-4 min-w-0">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        // router.back() no-ops when this page was opened without a prior
        // client-side history entry (e.g. a fresh tab/reload), so navigate to
        // a deterministic destination instead of relying on browser history.
        if (courseId) {
          const params = new URLSearchParams();
          params.set("courseId", courseId);
          if (courseName) params.set("courseName", courseName);
          router.push(`/dashboard/course/${courseId}?${params.toString()}`);
        } else {
          router.push("/dashboard/learning-journey");
        }
      }}
      className="h-14 w-14 rounded-2xl bg-white/80 backdrop-blur-xl border border-orange-100 flex items-center justify-center shadow-lg text-orange-600 hover:bg-orange-50 transition-all shrink-0"
    >
      <ArrowLeft size={22} />
    </motion.button>

    <h1 className="text-lg md:text-xl font-black text-slate-800 truncate">
      {courseName || "Course Details"}
    </h1>
  </div>
  {/* Right: Compact Statistics Container */}
  <div className="flex items-center gap-3">
    {[
      { label: "Topics", value: topics.length, icon: <BookOpen size={16} /> },
      { label: "Subtopics", value: topics.reduce((acc, item) => acc + item.subtopic_count, 0), icon: <Layers3 size={16} /> },
      {
        label: "Progress",
        value: `${courseProgress}%`,
        icon: "📈",
      }
    ].map((stat, i) => (
      <div 
        key={i} 
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-xl border border-orange-100 shadow-md"
      >
        <span className="text-orange-500">{stat.icon}</span>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">{stat.label}</span>
          <span className="text-sm font-black text-slate-900 leading-none">{stat.value}</span>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* Topics */}
     <div className="space-y-5 p-0">

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
                h-10
                w-10
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
              <BookOpen size={20} />
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

              <span>{topicProgress[topic._id] ?? 0}%</span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">

              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${topicProgress[topic._id] ?? 0}%` }}
                className={`h-full bg-gradient-to-r ${color}`}
              />

            </div>

            <button
       onClick={() => {
  const params = new URLSearchParams(searchParams.toString());

  if (courseId) params.set("courseId", courseId);
  if (courseName) params.set("courseName", courseName);
  if (type) params.set("type", type);
  params.set("topicName", topic.title);

  router.push(`/dashboard/topics/${topic._id}?${params.toString()}`);
}}
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