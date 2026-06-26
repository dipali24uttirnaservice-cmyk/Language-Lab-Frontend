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
    title: "📹 Video",
    type: "video",
    icon: Video,
    color: "from-blue-500 to-indigo-600",
    path: `/dashboard/module/video/${subtopicId}`,
    description: "Watch interactive video lessons",
  },
  {
    title: "🎧 Audio",
    type: "audio",
    icon: Headphones,
    color: "from-green-500 to-emerald-600",
    path: `/dashboard/module/audio/${subtopicId}`,
    description: "Improve listening skills",
  },
  {
    title: "📄 Text",
    type: "text",
    icon: FileText,
    color: "from-orange-500 to-amber-600",
    path: `/dashboard/module/text/${subtopicId}`,
    description: "Read learning materials",
  },
  {
    title: "📝 Exercise",
    type: "exercise",
    icon: ClipboardCheck,
    color: "from-purple-500 to-violet-600",
    path: `/dashboard/module/exercise/${subtopicId}`,
    description: "Practice with exercises",
  },
  {
    title: "📚 Vocabulary",
    type: "vocabulary",
    icon: FileText,
    color: "from-pink-500 to-rose-600",
    path: `/dashboard/module/vocabulary/${subtopicId}`,
    description: "Learn and revise vocabulary",
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
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="
    relative
    overflow-hidden
    rounded-[30px]
    bg-gradient-to-r
    from-orange-100
    via-amber-50
    to-yellow-100
    border
    border-orange-200/40
    px-8
    py-6
    shadow-xl
    mb-10
  "
>
  <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-orange-300/20 blur-3xl" />

  <div className="flex items-center gap-5">

  {/* Back Button */}

  <button
    onClick={() => router.back()}
    title="Go Back"
    className="
      flex
      h-14
      w-14
      items-center
      justify-center
      rounded-2xl
      bg-white
      border
      border-orange-200
      text-orange-600
      shadow-md
      transition-all
      duration-300
      hover:bg-orange-500
      hover:text-white
      hover:scale-105
      hover:shadow-xl
    "
  >
    <ArrowLeft size={24} />
  </button>

  {/* Module Icon */}

  <div
    className="
      h-16
      w-16
      rounded-2xl
      bg-gradient-to-br
      from-orange-500
      to-amber-500
      text-white
      flex
      items-center
      justify-center
      shadow-lg
    "
  >
    <FileText size={30} />
  </div>

  {/* Title */}

  <div className="flex-1">

    <h1 className="text-3xl font-black">
      {subtopic?.title}
    </h1>

    <p className="mt-1 text-slate-600">
      {subtopic?.description}
    </p>

  </div>

  {/* Topic */}

  <div
    className="
      rounded-2xl
      bg-white/80
      backdrop-blur
      border
      border-orange-100
      px-5
      py-3
      shadow-md
    "
  >
    <p className="text-xs text-slate-500 uppercase tracking-wider">
      Topic
    </p>

    <p className="font-bold text-orange-600">
      {subtopic?.topic?.title}
    </p>
  </div>

</div>

</motion.div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">

 
      {/* Modules */}

      <div className="mt-2">

       <h1 className="text-2xl font-black text-slate-900 mb-6">
         Learning Modules
        </h1>

<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                 p-5
                  shadow-lg
                  hover:shadow-2xl
                  transition-all
                "
              >

                <div
                  className={`
                   h-16 w-16
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
                <Icon size={28}/>
                </div>

                <h3 className="mt-6 text-xl font-black text-slate-900">
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
                  mt-5
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
  </div>
);
}