"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  BadgeCheck,
  LogOut,
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
    title: "Logout",
    action: "logout",
    icon: LogOut,
    color: "from-red-500 to-rose-600",
  },
];

export default function InstituteSidebar({ isOpen, setShowLogoutModal }) {
  const pathname = usePathname();
  const { user: institute } = useAuth();
  // tracks which collapsed icon is currently hovered, so we can show a flyout
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const instituteName = institute?.institute_name || "Institute";
  const instituteLogo = institute?.logo || "/collage-logo.png";

  return (
    <aside
      className={`relative overflow-hidden bg-white border-r border-slate-200/80 flex flex-col justify-between min-h-screen z-20 transition-all duration-300
      ${isOpen ? "w-72 p-6" : "w-24 p-3"}`}
    >
      {/* ==========================================
          PREMIUM ADMIN BACKGROUND
      ========================================== */}
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

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-36 -right-28 h-80 w-80 rounded-full border border-indigo-200/40"
        />

        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-48 -right-16 h-48 w-48 rounded-full border border-sky-200/30"
        />

        <div
          className="
            absolute inset-0 opacity-[0.03]
            bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)]
            bg-[size:24px_24px]
          "
        />

        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white/50 via-white/10 to-transparent blur-md" />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-indigo-400/40 to-transparent" />
      </div>

      {/* ==========================================
          CONTENT
      ========================================== */}
      <div className="relative z-10">
        {/* Brand */}
        <div className={`flex items-center ${isOpen ? "gap-3 px-2" : "justify-center"} mb-10`}>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl" />

            <img
              src={instituteLogo}
              alt={instituteName}
              className={`relative rounded-2xl object-cover border border-white shadow-lg bg-white transition-all ${
                isOpen ? "h-14 w-14" : "h-11 w-11"
              }`}
            />
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

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            // Icon box: ALWAYS colored (gradient bg + white icon).
            // Active state just adds a ring + slightly stronger shadow for emphasis.
            const iconBox = (
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${item.color}
                ${active ? "ring-2 ring-offset-2 ring-offset-white ring-slate-300 shadow-lg scale-105" : ""}
                transition-all`}
              >
                <Icon size={16} />
              </div>
            );

            // =========================
            // LOGOUT
            // =========================
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

            // =========================
            // NORMAL MENU
            // =========================
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

                {/* Simple tooltip flyout for collapsed state */}
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
      </div>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <div
        className={`relative z-10 pt-5 border-t border-slate-100 ${
          isOpen ? "flex items-center gap-3 px-2" : "flex justify-center"
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-md" />

          <img
            src={instituteLogo}
            alt={instituteName}
            className="relative h-10 w-10 rounded-full object-cover border border-white shadow-sm"
          />
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
