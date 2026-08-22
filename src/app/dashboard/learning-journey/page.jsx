"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { studentApi } from "@/services/student/studentApi";
import {
  BookOpen,
  Play,
  Headphones,
  FileText,
  Award,
  ChevronRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";

export default function LearningJourneyPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await studentApi.getAvailableCourses();
        const data = res.data?.data?.purchased_courses?.courses || [];
        console.log(
          `[LearningJourney] GET /student/me/available-courses -> ${data.length} course(s)`,
          data,
        );
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const gradients = [
    {
      from: "from-blue-500",
      to: "to-indigo-600",
      shadow: "rgba(59,130,246,0.2)",
    },
    {
      from: "from-orange-500",
      to: "to-amber-500",
      shadow: "rgba(249,115,22,0.2)",
    },
    {
      from: "from-emerald-500",
      to: "to-teal-600",
      shadow: "rgba(16,185,129,0.2)",
    },
    {
      from: "from-purple-500",
      to: "to-violet-600",
      shadow: "rgba(139,92,246,0.2)",
    },
    {
      from: "from-pink-500",
      to: "to-rose-600",
      shadow: "rgba(236,72,153,0.2)",
    },
    { from: "from-cyan-500", to: "to-sky-600", shadow: "rgba(6,182,212,0.2)" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/50"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
                <Sparkles size={12} className="animate-pulse" />
                <span>Learning Journey</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
                Your Enrolled Courses
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {courses.length} course{courses.length !== 1 ? "s" : ""}{" "}
                assigned to you
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-slate-950/80 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-2xl">
            <span className="bg-gradient-to-r from-orange-400 via-amber-200 to-white bg-clip-text text-transparent text-xs font-black tracking-wide uppercase">
              Continue Learning Today
            </span>
          </div>
        </motion.div>

        {/* Course Cards */}
        {courses.length === 0 ? (
          <div className="text-center py-24 bg-white/40 rounded-3xl border border-dashed border-slate-300">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-semibold">
              No courses assigned yet.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Please contact your institute.
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {courses.map((course, index) => {
              const g = gradients[index % gradients.length];
              return (
                <motion.div
                  key={course._id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { type: "spring", stiffness: 100 },
                    },
                  }}
                  whileHover={{
                    y: -8,
                    boxShadow: `0 24px 40px -10px ${g.shadow}`,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    router.push(
                      `/dashboard/course/${course._id}?courseId=${course._id}&courseName=${encodeURIComponent(course.name || course.title || "")}`,
                    )
                  }
                  className="cursor-pointer rounded-3xl bg-white/80 backdrop-blur-md p-6 border border-slate-200/80 shadow-lg transition-all group flex flex-col justify-between min-h-[240px]"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${g.from} ${g.to} text-white flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300`}
                    >
                      <BookOpen size={24} />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-gradient-to-br ${g.from} ${g.to} text-white shadow-sm`}
                    >
                      Enrolled
                    </span>
                  </div>

                  {/* Info */}
                  <div className="mt-5">
                    <h3 className="text-lg font-black tracking-tight text-slate-800 group-hover:text-slate-900 transition-colors leading-snug">
                      {course.name || course.title || "Untitled Course"}
                    </h3>
                    {course.description && (
                      <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}

                    {/* Module type chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {["video", "audio", "text", "exercise"].map((t) => {
                        const icons = {
                          video: Play,
                          audio: Headphones,
                          text: FileText,
                          exercise: Award,
                        };
                        const Icon = icons[t];
                        return (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase"
                          >
                            <Icon size={9} />
                            {t}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-5 flex justify-end">
                    <div
                      className={`h-9 w-9 rounded-full bg-slate-50 group-hover:bg-gradient-to-br ${g.from} ${g.to} flex items-center justify-center text-slate-400 group-hover:text-white border border-slate-100 transition-all duration-300 shadow-sm`}
                    >
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
