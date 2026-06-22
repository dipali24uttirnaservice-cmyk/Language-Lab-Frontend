"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaVideo,
  FaHeadphones,
  FaFileAlt,
  FaCheckDouble,
  FaGraduationCap,
  FaUserCircle,
  FaHome,
} from "react-icons/fa";

const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: FaHome,
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Video Lessons",
    href: "/dashboard/video",
    icon: FaVideo,
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Audio Practice",
    href: "/dashboard/audio",
    icon: FaHeadphones,
    color: "from-amber-400 to-orange-500",
  },
  {
    name: "Reading Text",
    href: "/dashboard/reading",
    icon: FaFileAlt,
    color: "from-emerald-400 to-teal-500",
  },
  {
    name: "Daily MCQs",
    href: "/dashboard/mcqs",
    icon: FaCheckDouble,
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Curriculum",
    href: "/dashboard/lessons",
    icon: FaGraduationCap,
    color: "from-violet-500 to-purple-600",
  },
];

export default function DashboardSidebar({ isOpen }) {
  const pathname = usePathname();

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
            const active = pathname === item.href;

            return (
              <motion.div
                key={item.name}
                whileHover={{
                  x: 4,
                  scale: 1.02,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <Link
                  href={item.href}
                  className="relative flex items-center p-3 rounded-xl transition-all group overflow-hidden"
                >
                  {/* Active Background */}
                  {active && (
                    <motion.div
                      layoutId="activeSidebarGlow"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      className="
                        absolute inset-0 rounded-xl
                        bg-gradient-to-r
                        from-amber-50
                        via-orange-50
                        to-emerald-50
                        border border-amber-200/50
                        shadow-[0_0_25px_rgba(251,191,36,0.15)]
                        -z-10
                      "
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border mr-3 transition-all duration-300
                    ${
                      active
                        ? `bg-gradient-to-br ${item.color} text-white border-transparent shadow-lg`
                        : "bg-white text-slate-500 border-slate-200 group-hover:border-slate-300"
                    }`}
                  >
                    <Icon className="text-sm" />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm font-bold transition-colors duration-300
                    ${
                      active
                        ? "text-slate-900"
                        : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Hover Accent Dot */}
                  <div
                    className={`ml-auto h-2 w-2 rounded-full transition-all duration-300
                    ${
                      active
                        ? "bg-amber-500"
                        : "bg-transparent group-hover:bg-slate-300"
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