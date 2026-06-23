"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FaBookOpen,
  FaComments,
  FaPenNib,
  FaMicrophone,
  FaBriefcase,
  FaGraduationCap,
} from "react-icons/fa";

const curriculum = [
  {
    id: 1,
    icon: <FaBookOpen />,
    title: "English Foundations",
    lessons: 12,
    progress: 100,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: 2,
    icon: <FaComments />,
    title: "Daily Conversations",
    lessons: 18,
    progress: 70,
    color: "from-orange-500 to-amber-500",
  },
  {
    id: 3,
    icon: <FaPenNib />,
    title: "Grammar Essentials",
    lessons: 25,
    progress: 45,
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: 4,
    icon: <FaMicrophone />,
    title: "Speaking Practice",
    lessons: 20,
    progress: 20,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: 5,
    icon: <FaBriefcase />,
    title: "Business English",
    lessons: 15,
    progress: 0,
    color: "from-cyan-500 to-sky-500",
  },
  {
    id: 6,
    icon: <FaGraduationCap />,
    title: "Advanced English",
    lessons: 22,
    progress: 0,
    color: "from-violet-500 to-purple-500",
  },
];

export default function Sublessons() {
  const router = useRouter();
  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-10">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
          English Learning Roadmap
        </span>

        <h1 className="mt-4 text-4xl font-black text-slate-900">
          Curriculum
        </h1>

        <p className="mt-2 text-slate-500">
          Follow the complete English mastery journey from beginner to advanced.
        </p>
      </div>

      {/* Overview Card */}
      <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-4">

          <div>
            <h3 className="text-3xl font-black text-slate-900">
              112
            </h3>
            <p className="text-sm text-slate-500">
              Total Lessons
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-black text-orange-500">
              6
            </h3>
            <p className="text-sm text-slate-500">
              Learning Modules
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-black text-emerald-500">
              47%
            </h3>
            <p className="text-sm text-slate-500">
              Course Progress
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-black text-indigo-500">
              B1
            </h3>
            <p className="text-sm text-slate-500">
              Current Level
            </p>
          </div>

        </div>
      </div>

      {/* Curriculum Cards */}
      <div className="space-y-6">

        {curriculum.map((module) => (
          <motion.div
            key={module.id}
            whileHover={{ y: -3 }}
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              {/* Left */}
              <div className="flex items-center gap-5">

                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${module.color} text-2xl text-white shadow-md`}
                >
                  {module.icon}
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {module.title}
                  </h2>

                  <p className="text-sm text-slate-500">
                    {module.lessons} Lessons
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="w-full max-w-md">

                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>Progress</span>
                  <span>{module.progress}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${module.progress}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className={`h-full bg-gradient-to-r ${module.color}`}
                  />
                </div>

                <button
   onClick={() => router.push("/dashboard/video")}

                  className="
                    mt-4
                    rounded-xl
                    bg-slate-900
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition-all
                    hover:bg-orange-500
                  "
                >
                  Continue Module
                </button>

              </div>

            </div>
          </motion.div>
        ))}

      </div>
    </div>
  );
}