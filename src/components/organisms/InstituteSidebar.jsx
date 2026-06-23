"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  Building2,
  Settings,
  BadgeCheck,
  LogOut,
} from "lucide-react";
import { FaGraduationCap } from "react-icons/fa";
import LogoutModal from "@/components/molecules/LogoutModal";
import { logoutUser } from "@/services/auth/logoutApi";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    href: "/institute-dashboard",
    icon: LayoutDashboard,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Students",
    href: "/institute-dashboard/students",
    icon: GraduationCap,
    color: "from-amber-400 to-orange-500",
  },
  {
    title: "Analytics",
    href: "/institute-dashboard/analytics",
    icon: BarChart3,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Profile",
    href: "/institute-dashboard/profile",
    icon: Building2,
    color: "from-sky-400 to-blue-500",
  },

   {
  title: "License & Subscription",
  href: "/institute-dashboard/license",
  icon: BadgeCheck,
  color: "from-emerald-400 to-green-600",
},
{
  title: "Logout",
  action: "logout",
  icon: LogOut,
  color: "from-red-500 to-rose-600",
}
 
];

export default function InstituteSidebar({ isOpen }) {
  const pathname = usePathname();

 const [institute, setInstitute] = useState({});
const [mounted, setMounted] = useState(false);

const router = useRouter();

const [showLogoutModal, setShowLogoutModal] =
  useState(false);

useEffect(() => {
  setMounted(true);

  try {
    const userCookie = Cookies.get("userData");
    const parsedData = userCookie ? JSON.parse(userCookie) : {};
    setInstitute(parsedData?.institute || {});
  } catch (error) {
    console.error(error);
    setInstitute({});
  }
}, []);

  const instituteName =
    institute?.institute_name || "Institute";

  const instituteLogo =
    institute?.logo || "/default-logo.png";

    const handleLogout = async () => {
  try {
    await logoutUser();

    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("userData");

    setShowLogoutModal(false);

    router.replace("/login");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};
  return (
    <aside
      className={`relative overflow-hidden bg-white border-r border-slate-200/80 flex flex-col justify-between min-h-screen z-20 transition-all duration-300 ease-in-out
      ${isOpen ? "w-72 opacity-100 p-6" : "w-0 opacity-0 overflow-hidden p-0"}`}
    >
      {/* ==========================================
          PREMIUM ADMIN BACKGROUND
      ========================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Base Gradient */}
<div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200" />        {/* Top Orb */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 20, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/15 to-violet-500/10 blur-3xl"
        />

        {/* Bottom Orb */}
        <motion.div
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            rotate: [360, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-sky-400/15 to-blue-500/10 blur-3xl"
        />

        {/* Large Ring */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-36 -right-28 h-80 w-80 rounded-full border border-indigo-200/40"
        />

        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-48 -right-16 h-48 w-48 rounded-full border border-sky-200/30"
        />

        {/* Digital Grid */}
        <div
          className="
            absolute inset-0 opacity-[0.03]
            bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)]
            bg-[size:24px_24px]
          "
        />

        {/* Light Reflection */}
        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white/50 via-white/10 to-transparent blur-md" />

        {/* Accent Border */}
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-indigo-400/40 to-transparent" />
      </div>

      {/* ==========================================
          CONTENT
      ========================================== */}
      <div className={`relative z-10 ${!isOpen ? "hidden" : "block"}`}>
        {/* Brand */}

{/* Brand */}
<div className="flex items-center gap-3 px-2 py-1 mb-10">
  <div className="relative">
    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl" />

    <img
      src={instituteLogo}
      alt={instituteName}
      className="
        relative
        h-14
        w-14
        rounded-2xl
        object-cover
        border
        border-white
        shadow-lg
        bg-white
      "
    />
  </div>

  <div className="min-w-0">
    <h2 className="text-lg font-black text-slate-800 truncate">
      {instituteName}
    </h2>

    <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">
      Institute Portal
    </p>
  </div>
</div>

        {/* Menu */}
     <div className="space-y-2">
  {menuItems.map((item) => {
    const Icon = item.icon;
    const active = pathname === item.href;

    // Logout Menu
    if (item.action === "logout") {
      return (
        <motion.div
          key={item.title}
          whileHover={{ x: 4, scale: 1.02 }}
        >
          <button
            onClick={() => setShowLogoutModal(true)}
            className="relative flex items-center w-full p-3 rounded-xl transition-all group overflow-hidden cursor-pointer"
          >
            <div
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border mr-3 bg-gradient-to-br ${item.color} text-white border-transparent shadow-lg`}
            >
              <Icon size={16} />
            </div>

            <span className="relative z-10 text-sm font-bold text-slate-700">
              {item.title}
            </span>
          </button>
        </motion.div>
      );
    }

    // Normal Menu
    return (
      <motion.div
        key={item.title}
        whileHover={{ x: 4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={item.href}
          className="relative flex items-center w-full p-3 rounded-xl transition-all group overflow-hidden cursor-pointer"
        >
          {active && (
            <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600 z-20" />
          )}

          {active && (
            <motion.div
              layoutId="activeSidebarGlow"
              className="
                absolute inset-0 rounded-xl
                bg-gradient-to-r
                from-indigo-50
                via-blue-50
                to-violet-50
                border-2 border-indigo-500
                shadow-[0_0_25px_rgba(99,102,241,0.15)]
              "
            />
          )}

          <div
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border mr-3 transition-all duration-300 ${
              active
                ? `bg-gradient-to-br ${item.color} text-white border-transparent shadow-lg`
                : "bg-white text-slate-500 border-slate-200 group-hover:border-slate-300"
            }`}
          >
            <Icon size={16} />
          </div>

          <span
            className={`relative z-10 text-sm font-bold ${
              active
                ? "text-indigo-700 font-extrabold"
                : "text-slate-700 group-hover:text-slate-900"
            }`}
          >
            {item.title}
          </span>
        </Link>
      </motion.div>
    );
  })}
</div>
      </div>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <div
        className={`relative z-10 pt-5 border-t border-slate-100 flex items-center gap-3 px-2 ${
          !isOpen && "hidden"
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-md" />

         <img
  src={instituteLogo}
  alt={instituteName}
  className="
    relative
    h-10
    w-10
    rounded-full
    object-cover
    border
    border-white
    shadow-sm
  "
/>
        </div>

        <div>
          <p className="text-sm font-black text-slate-800">
  {instituteName}
</p>

          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
            System Active
          </p>
        </div>
      </div>
      <LogoutModal
  open={showLogoutModal}
  onClose={() => setShowLogoutModal(false)}
  onConfirm={handleLogout}
/>
    </aside>
  );
}