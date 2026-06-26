"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  Video,
  Headphones,
  FileText,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react";

import { subtopicApi } from "@/services/topic/topicApi";

export default function SubtopicDetailsPage() {
  const { subtopicId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [subtopic, setSubtopic] = useState(null);

  useEffect(() => {
    fetchSubtopic();
  }, [subtopicId]);

  const fetchSubtopic = async () => {
    try {
      const res =
        await subtopicApi.getSubtopicById(
          subtopicId
        );

      setSubtopic(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      title: "Video Lessons",
      icon: Video,
      color:
        "from-blue-500 to-indigo-600",
      path: `/dashboard/module/video/${subtopicId}`,
      description:
        "Watch interactive lessons",
    },
    {
      title: "Audio Practice",
      icon: Headphones,
      color:
        "from-green-500 to-emerald-600",
      path: `/dashboard/module/audio/${subtopicId}`,
      description:
        "Improve listening skills",
    },
    {
      title: "Reading Text",
      icon: FileText,
      color:
        "from-orange-500 to-amber-600",
      path: `/dashboard/module/reading/${subtopicId}`,
      description:
        "Reading comprehension",
    },
    {
      title: "MCQ Quiz",
      icon: ClipboardCheck,
      color:
        "from-purple-500 to-violet-600",
      path: `/dashboard/module/mcq/${subtopicId}`,
      description:
        "Test your knowledge",
    },
  ];

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

 return (
  <div className="relative min-h-screen overflow-hidden">

    {/* Animated Background */}

    <div className="absolute inset-0 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50" />

      <motion.div
        animate={{
          x: [0, 120, 0],
          y: [0, -80, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          top-10
          left-10
          h-72
          w-72
          rounded-full
          bg-orange-300/20
          blur-3xl
        "
      />

      <motion.div
        animate={{
          x: [0, -120, 0],
          y: [0, 100, 0],
          rotate: [360, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          bottom-0
          right-0
          h-96
          w-96
          rounded-full
          bg-yellow-300/20
          blur-3xl
        "
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="
          absolute
          top-1/2
          left-1/2
          -translate-x-1/2
          -translate-y-1/2
          h-[500px]
          w-[500px]
          rounded-full
          bg-orange-200/10
          blur-3xl
        "
      />
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

      {/* Back Button */}

      <button
        onClick={() => router.back()}
        className="
          flex
          items-center
          gap-2
          rounded-2xl
          border
          border-white/40
          bg-white/80
          backdrop-blur-xl
          px-5
          py-3
          font-semibold
          text-slate-700
          shadow-lg
          hover:scale-105
          transition-all
          mb-8
        "
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Banner */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          relative
          overflow-hidden
          rounded-[36px]
          bg-gradient-to-r
          from-orange-100
          via-amber-50
          to-yellow-100
          border
          border-orange-200/40
          p-10
          shadow-xl
        "
      >
        <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-yellow-300/20 blur-3xl" />

        <div className="flex items-center gap-6">

          <div
            className="
              h-24
              w-24
              rounded-3xl
              bg-gradient-to-br
              from-orange-500
              to-amber-500
              text-white
              flex
              items-center
              justify-center
              shadow-xl
            "
          >
            <FileText size={42} />
          </div>

          <div>

            <h1 className="text-5xl font-black text-slate-900">
              {subtopic?.title}
            </h1>

            <p className="mt-3 text-lg text-slate-600">
              {subtopic?.description}
            </p>

            <div
              className="
                mt-5
                inline-flex
                rounded-2xl
                bg-white/70
                px-5
                py-3
                backdrop-blur-xl
                text-orange-600
                font-semibold
              "
            >
              Topic: {subtopic?.topic?.title}
            </div>

          </div>

        </div>
      </motion.div>

      {/* Modules */}

      <div className="mt-12">

        <h2 className="text-3xl font-black text-slate-900 mb-8">
          Learning Modules
        </h2>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {modules.map((module, index) => {
            const Icon = module.icon;

            return (
              <motion.div
                key={index}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  router.push(module.path)
                }
                className="
                  cursor-pointer
                  rounded-[30px]
                  border
                  border-white/50
                  bg-white/80
                  backdrop-blur-xl
                  p-7
                  shadow-lg
                  hover:shadow-2xl
                  transition-all
                "
              >

                <div
                  className={`
                    h-20
                    w-20
                    rounded-3xl
                    bg-gradient-to-br
                    ${module.color}
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-xl
                  `}
                >
                  <Icon size={34} />
                </div>

                <h3 className="mt-6 text-2xl font-black text-slate-900">
                  {module.title}
                </h3>

                <p className="mt-3 text-slate-500">
                  {module.description}
                </p>

                <motion.div
                  animate={{
                    x: [0, 6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="
                    mt-8
                    flex
                    justify-end
                    text-orange-500
                  "
                >
                  <ChevronRight size={28} />
                </motion.div>

              </motion.div>
            );
          })}

        </div>

      </div>

    </div>

  </div>
);
}