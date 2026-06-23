"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  FaBell,
  FaGraduationCap,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import LogoutModal from "@/components/molecules/LogoutModal";
import { logoutUser } from "@/services/auth/logoutApi";
import Link from "next/link";   

export default function DashboardNavbar({
  isSidebarOpen,
  setIsOpen,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();

      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("user");

      setShowLogoutModal(false);

      router.replace("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

 const user =
  Cookies.get("user")
    ? JSON.parse(Cookies.get("user"))
    : null;

const role = Cookies.get("role");

  const avatarLetter =
    role === "student"
      ? user?.name?.charAt(0)?.toUpperCase() ||
        "S"
      : user?.institute_name
          ?.charAt(0)
          ?.toUpperCase() || "I";



          const breadcrumbs = pathname
  .split("/")
  .filter(Boolean)
  .map((item, index, arr) => ({
    label: item
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + arr.slice(0, index + 1).join("/"),
  }));

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-xl px-6 h-16 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              setIsOpen(!isSidebarOpen)
            }
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            {isSidebarOpen ? (
              <FaTimes size={18} />
            ) : (
              <FaBars size={18} />
            )}
          </button>

         <div>
  <h1 className="text-lg font-bold text-slate-900">
    {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
  </h1>

  <div className="flex items-center gap-2 text-xs text-slate-500">
    {breadcrumbs.map((crumb, index) => (
      <div
        key={crumb.href}
        className="flex items-center gap-2"
      >
        {index > 0 && (
          <span className="text-slate-300">/</span>
        )}

        <Link
          href={crumb.href}
          className={`hover:text-indigo-600 ${
            index === breadcrumbs.length - 1
              ? "font-semibold text-slate-700"
              : ""
          }`}
        >
          {crumb.label}
        </Link>
      </div>
    ))}
  </div>
</div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-500"
          >
            <FaBell className="text-sm" />

            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
          </motion.button>

          <div className="h-6 w-[1px] bg-slate-200" />

          {/* Profile */}
      {/* Profile */}
<div
  onClick={() => setShowLogoutModal(true)}
  className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all"
>
  <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 text-white font-black text-xs shadow-xs">
    {role === "student"
      ? user?.name?.charAt(0)?.toUpperCase() || "S"
      : user?.institute_name
          ?.charAt(0)
          ?.toUpperCase() || "I"}

    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
  </div>

  <div className="hidden md:block">
    <p className="text-sm font-semibold text-slate-800">
      {role === "student"
        ? user?.name ||
          user?.student_name ||
          "Student"
        : user?.institute_name ||
          "Institute"}
    </p>

    <p className="text-xs text-slate-500 capitalize">
      {role}
    </p>
  </div>
</div>
        </div>
      </header>

      <LogoutModal
        open={showLogoutModal}
        onClose={() =>
          setShowLogoutModal(false)
        }
        onConfirm={handleLogout}
      />
    </>
  );
}