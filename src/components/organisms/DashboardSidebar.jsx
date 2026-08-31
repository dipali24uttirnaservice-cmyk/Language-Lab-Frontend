"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { studentApi } from "@/services/student/studentApi";
import { getStudentProfile } from "@/services/student/studentProfileApi";
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
  FaClipboardList,
} from "react-icons/fa";

const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: FaHome,
    color: "from-blue-500 to-indigo-600",
    border: "border-blue-500",
    bg: "from-blue-50 to-indigo-50",
    text: "text-blue-700",
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
    name: "Assessment",
    href: "/dashboard/assessment",
    icon: FaClipboardList,
    color: "from-emerald-500 to-teal-600",
    border: "border-emerald-500",
    bg: "from-emerald-50 to-teal-50",
    text: "text-emerald-700",
  },
  {
    name: "Student Profile",
    href: "/dashboard/student-profile",
    icon: FaUserCircle,
    color: "from-violet-500 to-purple-600",
    border: "border-violet-500",
    bg: "from-violet-50 to-purple-50",
    text: "text-violet-700",
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

export default function DashboardSidebar({ isOpen, setShowLogoutModal }) {
  const pathname = usePathname();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [openLearning, setOpenLearning] = useState(false);
  // tracks which collapsed icon is currently hovered, so we can show a flyout
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    getStudentProfile()
      .then((res) => {
        if (res.data.success) {
          setStudent(res.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching student profile:", error);
      });
  }, []);

  const studentName = student?.full_name || "Student";

  // Auto-expand "Learning Journey" whenever we're anywhere inside it,
  // so the current course stays visible/highlighted in the accordion.
  useEffect(() => {
    const insideLearningJourney =
      pathname.startsWith("/dashboard/course") ||
      pathname.startsWith("/dashboard/topics") ||
      pathname.startsWith("/dashboard/module") ||
      pathname.startsWith("/dashboard/video") ||
      pathname.startsWith("/dashboard/audio") ||
      pathname.startsWith("/dashboard/text") ||
      pathname.startsWith("/dashboard/exercise") ||
      pathname.startsWith("/dashboard/vocabulary");

    if (insideLearningJourney) {
      setOpenLearning(true);
    }
  }, [pathname]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);

      const res = await studentApi.getAvailableCourses();

      if (res.data.success) {
        setCourses(res.data.data?.purchased_courses?.courses || []);
      }
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const goToFirstCourseOrTopics = async () => {
    // Courses may not have finished loading yet if this is clicked right
    // after mount, so don't trust possibly-stale state — fetch fresh data
    // to decide where to go.
    let availableCourses = courses;
    if (loadingCourses || availableCourses.length === 0) {
      try {
        const res = await studentApi.getAvailableCourses();
        if (res.data.success) {
          availableCourses = res.data.data?.purchased_courses?.courses || [];
          setCourses(availableCourses);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (availableCourses.length > 0) {
      const firstCourse = availableCourses[0];
      router.push(
        `/dashboard/course/${firstCourse._id}?courseId=${firstCourse._id}&courseName=${encodeURIComponent(
          firstCourse.course_name
        )}`
      );
    } else {
      router.push("/dashboard/topics");
    }
  };

  return (
    <aside
      className={`relative overflow-hidden bg-white border-r border-slate-200 flex flex-col justify-between min-h-screen z-20 transition-all duration-300
      ${isOpen ? "w-72 p-6" : "w-24 p-3"}`}
    >
      {/* =====================================================
          PREMIUM 3D ANIMATED BACKGROUND
      ===================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />

        <motion.div
          animate={{ y: [0, -25, 0], x: [0, 15, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-amber-300/20 to-orange-400/10 blur-3xl"
        />

        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -20, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 -left-20 h-52 w-52 rounded-full bg-gradient-to-br from-emerald-300/20 to-teal-400/10 blur-3xl"
        />

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 -right-24 h-72 w-72 rounded-full border border-amber-200/30"
        />

        <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white/50 via-white/10 to-transparent blur-md" />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-300/40 to-transparent" />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className="relative z-10">
        {/* Brand Header */}
        <div className={`flex items-center ${isOpen ? "gap-3 px-2" : "justify-center"} mb-10`}>
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 rounded-xl text-white shadow-lg shadow-amber-500/20">
            <FaGraduationCap />
          </div>

          {isOpen && (
            <div>
              <h2 className="text-xl font-black text-slate-800">Uttirna DigiLabs</h2>
              <p className="text-xs uppercase font-bold text-slate-400">AI Learning Platform</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menus.map((item) => {
            const Icon = item.icon;

            const active =
              item.name === "Dashboard"
                ? pathname === "/dashboard"
                : item.name === "Assessment"
                ? pathname.startsWith("/dashboard/assessment")
                : pathname === item.href;

            // Icon box: ALWAYS colored (gradient bg + white icon).
            // Active state just adds a ring + slightly stronger shadow for emphasis.
            const iconBox = (
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${item.color}
                ${active ? "ring-2 ring-offset-2 ring-offset-white ring-slate-300 shadow-lg scale-105" : ""}
                transition-all`}
              >
                <Icon className="text-base" />
              </div>
            );

            // =========================
            // LOGOUT
            // =========================
            if (item.action === "logout") {
              return (
                <motion.div key={item.name} whileHover={{ x: isOpen ? 4 : 0, scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    title={!isOpen ? "Logout" : undefined}
                    className={`relative flex items-center w-full rounded-xl transition-all group overflow-hidden hover:bg-red-50
                    ${isOpen ? "px-3 py-3 gap-3" : "justify-center py-3"}`}
                  >
                    {iconBox}
                    {isOpen && <span className="relative z-10 text-sm font-bold text-slate-700">Logout</span>}
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
                pathname.startsWith("/dashboard/topics") ||
                pathname.startsWith("/dashboard/module") ||
                pathname.startsWith("/dashboard/video") ||
                pathname.startsWith("/dashboard/audio") ||
                pathname.startsWith("/dashboard/text") ||
                pathname.startsWith("/dashboard/exercise") ||
                pathname.startsWith("/dashboard/vocabulary");

              const learningIconBox = (
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${item.color}
                  ${learningActive ? "ring-2 ring-offset-2 ring-offset-white ring-orange-200 shadow-lg scale-105" : ""}
                  transition-all`}
                >
                  <Icon className="text-base" />
                </div>
              );

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => !isOpen && setHoveredMenu("Learning Journey")}
                  onMouseLeave={() => !isOpen && setHoveredMenu(null)}
                >
                  <button
                    onClick={() => {
                      if (!isOpen) {
                        goToFirstCourseOrTopics();
                        return;
                      }
                      setOpenLearning(!openLearning);
                    }}
                    title={!isOpen ? "Learning Journey" : undefined}
                    className={`relative flex items-center w-full rounded-xl hover:bg-orange-50 transition-all
                    ${isOpen ? "px-3 py-3 gap-3" : "justify-center py-3"}`}
                  >
                    {learningActive && isOpen && (
                      <motion.div
                        layoutId="activeSidebarGlow"
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.bg} border-2 ${item.border} shadow-lg`}
                      />
                    )}

                    {learningIconBox}

                    {isOpen && (
                      <>
                        <span className="relative z-10 flex-1 text-left text-sm font-bold text-slate-700">
                          Learning Journey
                        </span>
                        <span className="relative z-10 text-xs text-slate-400">{openLearning ? "▲" : "▼"}</span>
                      </>
                    )}
                  </button>

                  {/* Expanded accordion (sidebar open) */}
                  <AnimatePresence>
                    {isOpen && openLearning && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-14 mt-2 space-y-1 overflow-hidden"
                      >
                        {loadingCourses ? (
                          <p className="text-xs text-gray-500 px-3 py-2">Loading...</p>
                        ) : courses.length === 0 ? (
                          <p className="text-xs text-gray-400 px-3 py-2">No courses yet</p>
                        ) : (
                          courses.map((course) => (
                            <Link
                              key={course._id}
                              href={`/dashboard/course/${course._id}?courseName=${encodeURIComponent(course.course_name)}`}
                              className={`block rounded-lg px-3 py-2 text-sm transition ${
                                pathname === `/dashboard/course/${course._id}`
                                  ? "bg-orange-100 text-orange-700 font-semibold"
                                  : "hover:bg-orange-50 text-slate-600"
                              }`}
                            >
                              {course.course_name}
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Flyout panel (sidebar collapsed, on hover) */}
                  <AnimatePresence>
                    {!isOpen && hoveredMenu === "Learning Journey" && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-full top-0 ml-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2 z-50"
                      >
                        <p className="px-2 py-1 text-xs font-bold text-orange-600 uppercase tracking-wide">
                          Learning Journey
                        </p>
                        <div className="mt-1 space-y-1 max-h-64 overflow-y-auto">
                          {loadingCourses ? (
                            <p className="text-xs text-gray-500 px-2 py-2">Loading...</p>
                          ) : courses.length === 0 ? (
                            <Link
                              href="/dashboard/topics"
                              className="block rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-orange-50"
                            >
                              Browse Topics
                            </Link>
                          ) : (
                            courses.map((course) => (
                              <Link
                                key={course._id}
                                href={`/dashboard/course/${course._id}?courseName=${encodeURIComponent(course.course_name)}`}
                                className={`block rounded-lg px-2 py-2 text-sm transition ${
                                  pathname === `/dashboard/course/${course._id}`
                                    ? "bg-orange-100 text-orange-700 font-semibold"
                                    : "hover:bg-orange-50 text-slate-600"
                                }`}
                              >
                                {course.course_name}
                              </Link>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // =========================
            // NORMAL MENU (Dashboard, Student Profile)
            // =========================
            return (
              <motion.div
                key={item.name}
                className="relative"
                whileHover={{ x: isOpen ? 4 : 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => !isOpen && setHoveredMenu(item.name)}
                onMouseLeave={() => !isOpen && setHoveredMenu(null)}
              >
                <Link
                  href={item.href}
                  title={!isOpen ? item.name : undefined}
                  className={`relative flex items-center rounded-xl transition-all overflow-hidden
                  ${isOpen ? "px-3 py-3 gap-3" : "justify-center py-3"}`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeSidebarGlow"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.bg || "from-blue-50 to-indigo-50"} border-2 ${
                        item.border || "border-blue-500"
                      } shadow-lg`}
                    />
                  )}

                  {iconBox}

                  {isOpen && (
                    <span className={`relative z-10 text-sm font-bold ${active ? item.text || "text-blue-700" : "text-slate-700"}`}>
                      {item.name}
                    </span>
                  )}
                </Link>

                {/* Simple tooltip flyout for collapsed state */}
                <AnimatePresence>
                  {!isOpen && hoveredMenu === item.name && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-lg bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 shadow-lg z-50"
                    >
                      {item.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          FOOTER PROFILE
      ===================================================== */}
      <div
        className={`relative z-10 pt-5 border-t border-slate-100 ${
          isOpen ? "flex items-center gap-3 px-2" : "flex justify-center"
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md" />
          {student?.profilePhoto ? (
            <div className="relative h-10 w-10">
              <Image
                src={student.profilePhoto}
                alt={studentName}
                fill
                sizes="40px"
                className="rounded-full object-cover border border-white shadow-sm"
              />
            </div>
          ) : (
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-white shadow-sm">
              <FaUserCircle className="text-slate-500 text-lg" />
            </div>
          )}
        </div>

        {isOpen && (
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-800 truncate">{studentName}</p>
            <p className="text-xs text-amber-600 uppercase">Premium Member</p>
          </div>
        )}
      </div>
    </aside>
  );
}
