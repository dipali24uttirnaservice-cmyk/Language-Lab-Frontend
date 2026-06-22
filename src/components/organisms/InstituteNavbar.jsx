"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaBell,
  FaGraduationCap,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import LogoutModal from "@/components/molecules/LogoutModal";
import { logoutUser } from "@/services/auth/logoutApi";

export default function InstituteNavbar({
  isSidebarOpen,
  setIsOpen,
}) {
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

const userCookie =
  Cookies.get("userData");

let institute = {};

try {
  const parsedData = userCookie
    ? JSON.parse(userCookie)
    : {};

  institute =
    parsedData?.institute || {};
} catch (error) {
  console.error(
    "Invalid User Cookie",
    error
  );
}

const instituteLogo =
  institute?.logo || "/default-logo.png";

const instituteName =
  institute?.institute_name ||
  "Institute";

  const avatarLetter =
    instituteName
      ?.charAt(0)
      ?.toUpperCase() || "I";

  const handleLogout = async () => {
    try {
      await logoutUser();

      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("userData");

      setShowLogoutModal(false);

      router.replace("/login");
    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-xl px-6 h-16 flex items-center justify-between">
        
        {/* Left */}
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

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xs">
              <FaGraduationCap className="text-sm" />
            </div>

            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-wider uppercase">
                Workspace
              </h1>

              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase -mt-0.5">
                Institute Portal
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
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
          <div
            onClick={() =>
              setShowLogoutModal(true)
            }
            className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all"
          >
            <div className="relative">
  <img
    src={instituteLogo}
    alt={instituteName}
    className="h-10 w-10 rounded-xl object-cover border border-slate-200"
  />

  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
</div>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-800">
                {instituteName}
              </p>

              <p className="text-xs text-slate-500">
                Institute Admin
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