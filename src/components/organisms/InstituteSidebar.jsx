"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getInstituteLogoUrl } from "@/utils/media";
import {
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  Building2,
  BadgeCheck,
  Settings,
  LogOut,
  BookOpenCheck,
  ClipboardList,
  Activity,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/institute-dashboard",
    icon: LayoutDashboard,
    color: "from-blue-500 to-indigo-600",
    border: "border-blue-500",
    bg: "from-blue-50 to-indigo-50",
    text: "text-blue-700",
  },
  {
    title: "Students",
    href: "/institute-dashboard/students",
    icon: GraduationCap,
    color: "from-amber-400 to-orange-500",
    border: "border-orange-500",
    bg: "from-orange-50 via-amber-50 to-yellow-50",
    text: "text-orange-700",
  },
  {
    title: "Practical Manual",
    href: "/institute-dashboard/practical-manual",
    icon: BookOpenCheck,
    color: "from-amber-500 to-orange-600",
    border: "border-orange-600",
    bg: "from-amber-50 to-orange-50",
    text: "text-orange-800",
  },
  {
    title: "Task Management",
    href: "/institute-dashboard/student-task",
    icon: ClipboardList,
    color: "from-teal-500 to-emerald-600",
    border: "border-teal-500",
    bg: "from-teal-50 to-emerald-50",
    text: "text-teal-700",
  },
  {
    title: "Student Statistics",
    href: "/institute-dashboard/student-statistics",
    icon: BarChart3,
    color: "from-purple-500 to-indigo-600",
    border: "border-purple-500",
    bg: "from-purple-50 to-indigo-50",
    text: "text-purple-700",
  },
  {
    title: "Activity Log",
    href: "/institute-dashboard/activity-log",
    icon: Activity,
    color: "from-sky-500 to-indigo-600",
    border: "border-sky-500",
    bg: "from-sky-50 to-indigo-50",
    text: "text-sky-700",
  },
  {
    title: "License & Subscription",
    href: "/institute-dashboard/license",
    icon: BadgeCheck,
    color: "from-emerald-400 to-green-600",
    border: "border-emerald-500",
    bg: "from-emerald-50 to-green-50",
    text: "text-emerald-700",
  },
  {
    title: "Profile",
    href: "/institute-dashboard/profile",
    icon: Building2,
    color: "from-sky-400 to-blue-500",
    border: "border-sky-500",
    bg: "from-sky-50 to-blue-50",
    text: "text-sky-700",
  },
  {
    title: "Settings",
    href: "/institute-dashboard/settings",
    icon: Settings,
    color: "from-slate-500 to-slate-700",
    border: "border-slate-500",
    bg: "from-slate-50 to-slate-100",
    text: "text-slate-700",
  },
  {
    title: "Logout",
    action: "logout",
    icon: LogOut,
    color: "from-red-500 to-rose-600",
  },
];

export default function InstituteSidebar({ isOpen, setShowLogoutModal }) {
  const pathname = usePathname();
  const { user: institute } = useAuth();
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const instituteName = institute?.institute_name || "Institute";
  const instituteLogo = getInstituteLogoUrl(institute);

  return (
    <aside
      className={`relative overflow-hidden bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen z-20 transition-all duration-300
      ${isOpen ? "w-72 p-6" : "w-24 p-3"}`}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200" />

        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 20, 0], rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/15 to-violet-500/10 blur-3xl"
        />

        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -15, 0], rotate: [360, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-sky-400/15 to-blue-500/10 blur-3xl"
        />

        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white/50 via-white/10 to-transparent blur-md" />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-indigo-400/40 to-transparent" />
      </div>

      {/* Top Header Section */}
      <div className="relative z-10 shrink-0 pb-4">
        <div className={`flex items-center ${isOpen ? "gap-3 px-2" : "justify-center"}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl" />

            <div
              className={`relative rounded-2xl border border-white shadow-lg bg-white transition-all ${
                isOpen ? "h-14 w-14" : "h-11 w-11"
              }`}
            >
              <Image
                src={instituteLogo}
                alt={instituteName}
                fill
                sizes="56px"
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {isOpen && (
            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-800 truncate">
                {instituteName}
              </h2>

              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">
                Institute Portal
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clean Scrollable Navigation Area (Scrollbar completely hidden using modern CSS classes) */}
      <div className="relative z-10 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          const iconBox = (
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${item.color}
              ${active ? "ring-2 ring-offset-2 ring-offset-white ring-slate-300 shadow-lg scale-105" : ""}
              transition-all`}
            >
              <Icon size={16} />
            </div>
          );

          if (item.action === "logout") {
            return (
              <motion.div
                key={item.title}
                whileHover={{ x: isOpen ? 4 : 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setShowLogoutModal(true)}
                  title={!isOpen ? "Logout" : undefined}
                  aria-label="Logout"
                  className={`relative flex items-center w-full rounded-xl transition-all group overflow-hidden hover:bg-red-50
                  ${isOpen ? "px-3 py-3 gap-3" : "justify-center py-3"}`}
                >
                  {iconBox}
                  {isOpen && (
                    <span className="relative z-10 text-sm font-bold text-slate-700">
                      {item.title}
                    </span>
                  )}
                </button>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={item.title}
              className="relative"
              whileHover={{ x: isOpen ? 4 : 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => !isOpen && setHoveredMenu(item.title)}
              onMouseLeave={() => !isOpen && setHoveredMenu(null)}
            >
              <Link
                href={item.href}
                title={!isOpen ? item.title : undefined}
                className={`relative flex items-center rounded-xl transition-all overflow-hidden
                ${isOpen ? "px-3 py-3 gap-3" : "justify-center py-3"}`}
              >
                {active && (
                  <motion.div
                    layoutId="activeInstituteSidebarGlow"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.bg} border-2 ${item.border} shadow-lg`}
                  />
                )}

                {iconBox}

                {isOpen && (
                  <span
                    className={`relative z-10 text-sm font-bold ${
                      active ? item.text : "text-slate-700"
                    }`}
                  >
                    {item.title}
                  </span>
                )}
              </Link>

              <AnimatePresence>
                {!isOpen && hoveredMenu === item.title && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-lg bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 shadow-lg z-50"
                  >
                    {item.title}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Footer Section */}
      <div
        className={`relative z-10 pt-4 shrink-0 border-t border-slate-100 ${
          isOpen ? "flex items-center gap-3 px-2" : "flex justify-center"
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-md" />

          <div className="relative h-10 w-10">
            <Image
              src={instituteLogo}
              alt={instituteName}
              fill
              sizes="40px"
              className="rounded-full object-cover border border-white shadow-sm"
            />
          </div>
        </div>

        {isOpen && (
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-800 truncate">
              {instituteName}
            </p>

            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              System Active
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}