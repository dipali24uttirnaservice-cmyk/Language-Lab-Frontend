"use client";

import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Mic,
  GraduationCap,
  Briefcase,
  MessageCircle,
  PenTool,
  Users,
  Clock,
  Star,
} from "lucide-react";

const categories = [
  {
    title: "Spoken English",
    icon: Mic,
    lessons: "48 Lessons",
  },
  {
    title: "Grammar Mastery",
    icon: PenTool,
    lessons: "36 Lessons",
  },
  {
    title: "Vocabulary Builder",
    icon: BookOpen,
    lessons: "52 Lessons",
  },
  {
    title: "Communication Skills",
    icon: MessageCircle,
    lessons: "40 Lessons",
  },
  {
    title: "Interview Preparation",
    icon: GraduationCap,
    lessons: "25 Lessons",
  },
  {
    title: "Business English",
    icon: Briefcase,
    lessons: "32 Lessons",
  },
];

const featuredCourses = [
  {
    title: "AI Spoken English Pro",
    level: "Beginner → Advanced",
    duration: "12 Weeks",
    students: "12,000+",
    rating: "4.9",
  },
  {
    title: "Grammar Excellence",
    level: "Intermediate",
    duration: "8 Weeks",
    students: "8,500+",
    rating: "4.8",
  },
  {
    title: "Professional Communication",
    level: "Advanced",
    duration: "10 Weeks",
    students: "5,400+",
    rating: "4.9",
  },
];

export default function CoursesPage() {
  return (
    <main className="relative overflow-hidden bg-slate-50">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-200/30 blur-[120px]" />

        <div className="absolute bottom-0 right-1/4 h-[450px] w-[450px] rounded-full bg-emerald-200/30 blur-[120px]" />

        <div
          className="
            absolute inset-0
            bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)]
            bg-[size:60px_60px]
          "
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 py-28">

        <div className="max-w-7xl mx-auto px-6 text-center">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black leading-[1.15]"
          >
            Master Languages

            <span className="block pb-2 bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
              With AI Courses
            </span>
          </motion.h1>

          <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-600">
            Structured learning paths designed for speaking,
            grammar, vocabulary, communication and career growth.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mt-10">

            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-3 flex items-center gap-3 shadow-lg">

              <Search className="text-slate-400" />

              <input
                type="text"
                placeholder="Search courses..."
                className="flex-1 bg-transparent outline-none"
              />

              <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-white font-semibold">
                Search
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* Categories */}
      <section className="relative z-10 py-10">

        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-4xl font-black text-center mb-14">
            Course Categories
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {categories.map((item, index) => (
              <motion.div
                whileHover={{ y: -8 }}
                key={index}
                className="
                  rounded-3xl
                  border border-white/60
                  bg-white/60
                  backdrop-blur-xl
                  p-8
                  shadow-lg
                "
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-100 to-emerald-100 flex items-center justify-center">

                  <item.icon className="text-amber-600" />

                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-2 text-slate-500">
                  {item.lessons}
                </p>

              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* Featured Courses */}
      <section className="relative z-10 py-24">

        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-4xl font-black text-center mb-14">
            Featured Courses
          </h2>

        <div className="grid lg:grid-cols-3 gap-8">

  {featuredCourses.map((course, index) => (
    <motion.div
      whileHover={{ y: -10 }}
      key={index}
      className="
        group
        rounded-[32px]
        bg-white/80
        backdrop-blur-2xl
        border border-white
        shadow-lg
        hover:shadow-2xl
        transition-all
        duration-500
        overflow-hidden
      "
    >

      {/* Course Preview */}
      <div className="relative h-52 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-emerald-50" />

        <div className="absolute top-6 left-6 h-24 w-24 rounded-full bg-amber-300/30 blur-3xl" />

        <div className="absolute bottom-6 right-6 h-24 w-24 rounded-full bg-emerald-300/30 blur-3xl" />

        <div
          className="
            absolute inset-0
            bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]
            bg-[size:30px_30px]
          "
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">

          <BookOpen
            size={60}
            className="text-amber-600 mb-3"
          />

          <span className="text-sm font-semibold text-slate-600">
            AI Learning Course
          </span>

        </div>

      </div>

      {/* Content */}
      <div className="p-8">

        <span
          className="
            inline-flex
            rounded-full
            bg-amber-100
            px-3
            py-1
            text-xs
            font-semibold
            text-amber-700
          "
        >
          Most Popular
        </span>

        <h3 className="mt-4 text-2xl font-bold text-slate-900">
          {course.title}
        </h3>

        <div className="mt-5 space-y-3">

          <div className="flex items-center gap-3 text-slate-600">
            <GraduationCap size={18} />
            {course.level}
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <Clock size={18} />
            {course.duration}
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <Users size={18} />
            {course.students}
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <Star
              size={18}
              className="text-amber-500 fill-amber-500"
            />
            {course.rating}
          </div>

        </div>

 <button
  className="
    w-full
    mt-8
    py-4
    rounded-2xl
    font-semibold
    text-amber-700
    bg-amber-50
    border
    border-amber-200
    hover:bg-amber-100
    transition-all
    duration-300
  "
>
  Enroll Now
</button>

      </div>

    </motion.div>
  ))}

</div>
        </div>

      </section>
    </main>
  );
}