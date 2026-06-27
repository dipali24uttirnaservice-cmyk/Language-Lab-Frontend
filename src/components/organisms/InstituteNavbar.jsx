"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  FaBell,
  FaGraduationCap,
  FaBars,
  FaTimes,
   LogOut,
} from "react-icons/fa";
import Link from "next/link";

import LogoutModal from "@/components/molecules/LogoutModal";
import { logoutUser } from "@/services/auth/logoutApi";

export default function InstituteNavbar({
 isSidebarOpen,
  setIsOpen,
  showLogoutModal,
  setShowLogoutModal,
}) {
  const router = useRouter();
const pathname = usePathname();

    const [institute, setInstitute] = useState(null);

useEffect(() => {
  try {
    const userCookie = Cookies.get("userData");

    const parsedData = userCookie
      ? JSON.parse(userCookie)
      : {};

    setInstitute(parsedData?.institute || {});
  } catch (error) {
    console.error(error);
    setInstitute({});
  }
}, []);

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
<header
  className="
    sticky top-0 z-30 w-full h-16
    flex items-center justify-between
    px-6
    border-b border-orange-400/20
    bg-gradient-to-r
    from-amber-600
    via-orange-500
    to-amber-600
    shadow-[0_8px_30px_rgba(245,158,11,0.25)]
  "
>
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-transparent to-amber-50/50" />

  <div className="absolute -top-10 left-1/4 h-32 w-32 rounded-full bg-indigo-300/10 blur-3xl" />

  <div className="absolute -top-8 right-1/4 h-28 w-28 rounded-full bg-amber-300/10 blur-3xl" />

  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
</div>   
        {/* Left */}
<div className="relative z-10 flex items-center gap-4">          <button
            onClick={() =>
              setIsOpen(!isSidebarOpen)
            }
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            {isSidebarOpen ? (
              <FaBars size={18} />
            ) : (
              <FaBars size={18} />
            )}
          </button>

       <div>
 <h1 className="text-lg font-bold text-black">
  {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
</h1>

<div className="flex items-center gap-2 text-xs">
  {breadcrumbs.map((crumb, index) => (
    <div
      key={crumb.href}
      className="flex items-center gap-2"
    >
      {index > 0 && (
        <span className="text-black/40">/</span>
      )}

      <Link
        href={crumb.href}
        className={`transition-colors ${
          index === breadcrumbs.length - 1
            ? "font-semibold text-black"
            : "text-black/70 hover:text-black"
        }`}
      >
        {crumb.label}
      </Link>
    </div>
  ))}
</div>
</div>
        </div>

        {/* Right */}
<div className="relative z-10 flex items-center gap-4">        
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
  <p className="text-sm font-bold text-black">
    {instituteName}
  </p>

  <p className="text-xs text-black/70">
    Institute Admin
  </p>
</div>
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
      </header>

    
    </>
  );
}