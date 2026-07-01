"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { studentApi } from "@/services/student/studentApi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import {
  FaVideo,
  FaHeadphones,
  FaFileAlt,
  FaCheckDouble,
  FaGraduationCap,
  FaUserCircle,
  FaHome,
  FaBookOpen,
  FaSignOutAlt,
} from "react-icons/fa";

const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: FaHome,
    color: "from-blue-500 to-indigo-600",
  },
   {
  name: "Learning Journey",
  href: "/dashboard/topics",
  icon: FaBookOpen,
  color: "from-amber-500 to-orange-600",
  border: "border-orange-500",
  bg: "from-orange-50 via-amber-50 to-yellow-50",
  text: "text-orange-700",
  dot: "bg-orange-500",
},
{
    name: "Student Profile",
    href: "/dashboard/student-profile",
    icon: FaUserCircle,
    color: "from-violet-500 to-purple-600",
  },
   {
    name: "Logout",
    action: "logout",
    icon: FaSignOutAlt,
    color: "from-red-500 to-rose-600",
  },
 
  // {
  //   name: "Video Lessons",
  //   href: "/dashboard/lessons",
  //   icon: FaVideo,
  //   color: "from-blue-500 to-indigo-600",
  // },
  // {
  //   name: "Audio Practice",
  //   href: "/dashboard/audio",
  //   icon: FaHeadphones,
  //   color: "from-amber-400 to-orange-500",
  // },
  // {
  //   name: "Reading Text",
  //   href: "/dashboard/reading",
  //   icon: FaFileAlt,
  //   color: "from-emerald-400 to-teal-500",
  // },
  // {
  //   name: "Daily MCQs",
  //   href: "/dashboard/mcqs",
  //   icon: FaCheckDouble,
  //   color: "from-pink-500 to-rose-500",
  // },
  
];



const getAvailableCourses = async () => {
  try {
    setLoadingCourses(true);

    const token = Cookies.get("token");

    const res = await studentApi.get(
      "/student/me/available-courses",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data.success) {
      setCourses(res.data.data);
    }
  } catch (err) {
    console.log(err);
  } finally {
    setLoadingCourses(false);
  }
};

export default function DashboardSidebar({  isOpen,
  setShowLogoutModal, }) {
const pathname = usePathname();
const [courses, setCourses] = useState([]);
const [loadingCourses, setLoadingCourses] = useState(false);
const [openLearning, setOpenLearning] = useState(false);



useEffect(() => {
  fetchCourses();
}, []);

const fetchCourses = async () => {
  try {
    setLoadingCourses(true);

    const res = await studentApi.getAvailableCourses();

    if (res.data.success) {
      setCourses(
        res.data.data?.purchased_courses?.courses || []
      );
    }
  } catch (err) {
    console.error(err);
    setCourses([]);
  } finally {
    setLoadingCourses(false);
  }
};
  return (
    <aside
      className={`relative overflow-hidden bg-white border-r border-slate-200/80 flex flex-col justify-between min-h-screen z-20 transition-all duration-300 ease-in-out
      ${isOpen ? "w-72 opacity-100 p-6" : "w-0 opacity-0 overflow-hidden p-0"}`}
    >
      {/* =====================================================
          PREMIUM 3D ANIMATED BACKGROUND
      ===================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />

        {/* Top Floating Orb */}
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-amber-300/20 to-orange-400/10 blur-3xl"
        />

        {/* Bottom Floating Orb */}
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -20, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 -left-20 h-52 w-52 rounded-full bg-gradient-to-br from-emerald-300/20 to-teal-400/10 blur-3xl"
        />

        {/* Rotating Ring */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-40 -right-24 h-72 w-72 rounded-full border border-amber-200/30"
        />

        {/* Glass Reflection */}
        <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-white/50 via-white/10 to-transparent blur-md" />

        {/* Vertical Accent Line */}
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-300/40 to-transparent" />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className={`relative z-10 ${!isOpen ? "hidden" : "block"}`}>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1 mb-10">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 rounded-xl text-white shadow-lg shadow-amber-500/20">
            <FaGraduationCap />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              English Lab
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              AI Learning Platform
            </p>
          </div>
        </div>

        {/* Menu */}
       <div className="space-y-2">
  {menus.map((item) => {
    const Icon = item.icon;

    const active =
      item.name === "Dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href;

    // =========================
    // LOGOUT
    // =========================
    if (item.action === "logout") {
      return (
        <motion.div
          key={item.name}
          whileHover={{ x: 4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => setShowLogoutModal(true)}
            className="relative flex items-center w-full p-3 rounded-xl transition-all group overflow-hidden"
          >
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border mr-3 bg-white text-red-500 border-slate-200">
              <Icon className="text-sm" />
            </div>

            <span className="relative z-10 text-sm font-bold text-slate-700">
              Logout
            </span>
          </button>
        </motion.div>
      );
    }

    // =========================
    // LEARNING JOURNEY
    // =========================
    if (item.name === "Learning Journey") {
const learningActive =
  pathname.startsWith("/dashboard/course") ||
  pathname.startsWith("/dashboard/topics");
      return (
        <div key={item.name}>
          <button
            onClick={() => setOpenLearning(!openLearning)}
            className="relative flex items-center w-full p-3 rounded-xl hover:bg-orange-50 transition-all"
          >
            {learningActive && (
              <motion.div
                layoutId="activeSidebarGlow"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-500 shadow-lg"
              />
            )}

            <div
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border mr-3 ${
                learningActive
                  ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white border-transparent"
                  : "bg-white text-orange-500 border-slate-200"
              }`}
            >
              <Icon />
            </div>

            <span
              className={`relative z-10 flex-1 text-left text-sm font-bold ${
                learningActive
                  ? "text-orange-700"
                  : "text-slate-700"
              }`}
            >
              Learning Journey
            </span>

            <span className="relative z-10">
              {openLearning ? "▲" : "▼"}
            </span>
          </button>

          {openLearning && (
            <div className="ml-14 mt-2 space-y-1">
              {loadingCourses ? (
                <p className="text-xs text-gray-500 px-3 py-2">
                  Loading...
                </p>
              ) : (
                courses.map((course) => {
                 const courseActive = pathname.startsWith(
  `/dashboard/course/${course._id}`
);

                  return (
                  <Link
  key={course._id}
  href={`/dashboard/course/${course._id}`}
  className={`block rounded-lg px-3 py-2 text-sm transition ${
    pathname === `/dashboard/course/${course._id}`
      ? "bg-orange-100 text-orange-700 font-semibold"
      : "hover:bg-orange-50 text-slate-600"
  }`}
>
  {course.course_name}
</Link>
                  );
                })
              )}
            </div>
          )}
        </div>
      );
    }

    // =========================
    // NORMAL MENU
    // =========================
    return (
      <motion.div
        key={item.name}
        whileHover={{ x: 4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={item.href}
          className="relative flex items-center w-full p-3 rounded-xl transition-all group overflow-hidden"
        >
          {active && (
            <motion.div
              layoutId="activeSidebarGlow"
              className={`absolute inset-0 rounded-xl bg-gradient-to-r ${
                item.bg || "from-blue-50 to-indigo-50"
              } border-2 ${item.border || "border-blue-500"} shadow-lg`}
            />
          )}

          <div
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border mr-3 ${
              active
                ? `bg-gradient-to-br ${item.color} text-white border-transparent`
                : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            <Icon />
          </div>

          <span
            className={`relative z-10 text-sm font-bold ${
              active
                ? item.text || "text-blue-700"
                : "text-slate-700"
            }`}
          >
            {item.name}
          </span>

          <div
            className={`relative z-10 ml-auto h-2 w-2 rounded-full ${
              active
                ? item.dot || "bg-blue-500"
                : "bg-transparent"
            }`}
          />
        </Link>
      </motion.div>
    );
  })}
</div>
      </div>

      {/* =====================================================
          FOOTER PROFILE
      ===================================================== */}
      <div
        className={`relative z-10 pt-5 border-t border-slate-100 flex items-center gap-3 px-2 ${
          !isOpen && "hidden"
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md" />
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-white shadow-sm">
            <FaUserCircle className="text-slate-500 text-lg" />
          </div>
        </div>

        <div>
          <p className="text-sm font-black text-slate-800">
            Student Name
          </p>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            Premium Member
          </p>
        </div>
      </div>
    </aside>
  );
}