"use client";

import { useRouter,useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Video,
  Headphones,
  FileText,
  ClipboardCheck,
  BookOpen,
  ChevronRight,
} from "lucide-react";


export default function LearningModules({ courseId, courseName }) {
  const router = useRouter();






  const modules = [
    {
      title: "Video",
      type: "video",
      icon: Video,
      color: "from-blue-500 to-indigo-600",
      description: "Watch interactive video lessons",
    },
    {
      title: "Audio",
      type: "audio",
      icon: Headphones,
      color: "from-green-500 to-emerald-600",
      description: "Improve listening skills",
    },
    {
      title: "Text",
      type: "text",
      icon: FileText,
      color: "from-orange-500 to-amber-600",
      description: "Read learning materials",
    },
    {
      title: "Exercise",
      type: "exercise",
      icon: ClipboardCheck,
      color: "from-purple-500 to-violet-600",
      description: "Practice exercises",
    },
    {
      title: "Vocabulary",
      type: "vocabulary",
      icon: BookOpen,
      color: "from-pink-500 to-rose-600",
      description: "Learn new words",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">

      <div className="max-w-7xl mx-auto px-6 py-10">

       

        {/* Cards */}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <motion.div
                key={module.type}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
           onClick={() => {
  const params = new URLSearchParams();


params.set("courseId", courseId);
params.set("courseName", courseName);
params.set("type", module.type);

router.push(`/dashboard/topics?${params.toString()}`);
}}

                className="cursor-pointer rounded-3xl bg-white p-6 shadow-lg border hover:shadow-2xl transition"
              >
                <div
                  className={`h-16 w-16 rounded-3xl bg-gradient-to-br ${module.color} text-white flex items-center justify-center`}
                >
                  <Icon size={28} />
                </div>

                <h3 className="mt-6 text-xl font-black">
                  {module.title}
                </h3>

                <p className="mt-3 text-sm text-slate-500">
                  {module.description}
                </p>

                <div className="mt-5 flex justify-end text-orange-500">
                  <ChevronRight />
                </div>
              </motion.div>
            );
          })}

        </div>

      </div>

    </div>
  );
}