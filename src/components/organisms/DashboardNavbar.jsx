"use client";

import { useState,useEffect } from "react";
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
import { logoutStudent } from "@/services/auth/logoutApi";
import Link from "next/link";   

export default function DashboardNavbar({
  isSidebarOpen,
  setIsOpen,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);
const [mounted, setMounted] = useState(false);

const [user, setUser] = useState(null);
const [role, setRole] = useState(null);

useEffect(() => {
  setMounted(true);
}, []);

  const handleLogout = async () => {
    try {
      await logoutStudent();

      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("studentData");

      setShowLogoutModal(false);

      router.replace("/student-login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };


const [student, setStudent] = useState({});

useEffect(() => {
  try {
    const studentCookie = Cookies.get("studentData");

    console.log("Student Cookie:", studentCookie);

    const parsedData = studentCookie
      ? JSON.parse(studentCookie)
      : {};

    console.log("Parsed Student:", parsedData);

    setStudent(parsedData);
  } catch (error) {
    console.error(error);
  }
}, []);

const studentName =
  student?.full_name || "Student";

const instituteName =
  student?.institute_name || "Institute";

const avatarLetter =
  studentName.charAt(0).toUpperCase();

const profileImage =
  student?.profile_image ||
  "/default-avatar.png"; // optional

 


    const pathSegments = pathname.split("/").filter(Boolean);

const breadcrumbs = pathSegments
  .filter((segment, index) => {
    // Hide MongoDB ObjectId (24 hex characters)
    const isMongoId = /^[a-f\d]{24}$/i.test(segment);

    // You can also hide UUIDs if needed
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        segment
      );

    return !isMongoId && !isUUID;
  })
  .map((segment, index, arr) => ({
    label: segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + arr.slice(0, index + 1).join("/"),
  }));
  
if (!mounted) return null;

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
              <FaBars size={18} />
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
  {student?.profile_image ? (
    <div className="relative">
      <img
        src={profileImage}
        alt={studentName}
        className="h-10 w-10 rounded-xl object-cover border border-slate-200"
      />

      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
    </div>
  ) : (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 text-white font-bold border border-slate-200">
      {avatarLetter}

      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
    </div>
  )}

  <div className="hidden md:block">
    <p className="text-sm font-bold text-slate-800">
      {studentName}
    </p>

    <p className="text-xs text-slate-500">
      {instituteName}
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