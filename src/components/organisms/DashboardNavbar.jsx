"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { FaBell, FaBars } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

import LogoutModal from "@/components/molecules/LogoutModal";
import { logoutStudent } from "@/services/auth/logoutApi";
import { studentApi } from "@/services/student/studentApi";
import Link from "next/link";

export default function DashboardNavbar({ isSidebarOpen, setIsOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [student, setStudent] = useState({});
  const [courses, setCourses] = useState([]);

  const searchParams = useSearchParams();
const courseId = searchParams.get("courseId");

const courseName = searchParams.get("courseName");
const type = searchParams.get("type");
const topicName = searchParams.get("topicName");
const subTopicName = searchParams.get("subTopicName");
const lessonName = searchParams.get("lessonName");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const studentCookie = Cookies.get("studentData");
      const parsedData = studentCookie ? JSON.parse(studentCookie) : {};
      setStudent(parsedData);
    } catch (error) {
      console.error("Error parsing student data:", error);
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await studentApi.getAvailableCourses();
        if (res.data.success) {
          setCourses(res.data.data?.purchased_courses?.courses || []);
        }
      } catch (err) {
        console.error("Error loading courses for navbar context:", err);
      }
    };
    fetchCourses();
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

  const studentName = student?.full_name || "Student";
  const instituteName = student?.institute_name || "Institute";
  const avatarLetter = studentName.charAt(0).toUpperCase();
  const profileImage = student?.profile_image || "/default-avatar.png";

  // =====================================================
  // FIXED LEARNING JOURNEY BREADCRUMB PARSER (Prevents 404)
  // =====================================================
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [];
    let accumulatedPath = "";

    let isInsideCourseModule = false;
    let dynamicStepIndex = 0;

    const stepLabels = ["Selected Type", "Selected Topic", "Selected Sub Topic", "Open Module"];

    segments.forEach((segment) => {
      accumulatedPath += `/${segment}`;
      
      const isMongoId = /^[a-f\d]{24}$/i.test(segment);
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment);

      // Base Dashboard
      if (segment.toLowerCase() === "dashboard") {
        crumbs.push({ label: "Dashboard", href: "/dashboard" });
        return;
      }
      
      // FIX: If the path builds to /dashboard/topics or /dashboard/course, force-point it to your learning dashboard view page
  if (
  ["topics", "course", "module"].includes(
    segment.toLowerCase()
  )
) {
  crumbs.push({
    label: "Learning Journey",
    href: "/dashboard/topics",
  });

 if (courseName && courseId) {
  crumbs.push({
    label: decodeURIComponent(courseName),
    href: `/dashboard/course/${courseId}?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`,
  });
}

if (type && courseId && courseName) {
  crumbs.push({
    label: type.charAt(0).toUpperCase() + type.slice(1),
    href: `/dashboard/course/${courseId}?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&type=${type}`,
  });
}

if (topicName) {
  crumbs.push({
    label: decodeURIComponent(topicName),
    href: null, // we'll update this after seeing your route
  });
}

if (subTopicName) {
  crumbs.push({
    label: decodeURIComponent(subTopicName),
    href: null,
  });
}

if (lessonName) {
  crumbs.push({
    label: decodeURIComponent(lessonName),
    href: null,
  });
}

  isInsideCourseModule = true;
  return;
}

      // Course IDs
     if (isInsideCourseModule && (isMongoId || isUUID)) {
  // Course name is already added from the query parameter.
  // Skip adding it again on /dashboard/course/[courseId].
  if (pathname.startsWith("/dashboard/course/")) {
    return;
  }

  const matchedCourse = courses.find((c) => c._id === segment);

  crumbs.push({
    label: matchedCourse ? matchedCourse.course_name : "lessons",
    href: accumulatedPath,
  });

  return;
}

      // Nested dynamic tracking parameters
     if (isInsideCourseModule) {
  // Don't add "video", "audio", etc. again.
  if (
    ["video", "audio", "text", "exercise", "vocabulary", "module"].includes(
      segment.toLowerCase()
    )
  ) {
    return;
  }

  if (isMongoId || isUUID) {
    return;
  }

  crumbs.push({
    label: segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: accumulatedPath,
  });

  return;
}

      // Normal generic fallback paths
      if (!isMongoId && !isUUID) {
        crumbs.push({
          label: segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          href: accumulatedPath,
        });
      }
    });

    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (!mounted) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-xl px-6 h-16 flex items-center justify-between">
        {/* Left Side */}
<div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={() => setIsOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            <FaBars size={18} />
          </button>

          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">
              {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
            </h1>

         <div className="max-w-[700px] overflow-x-auto scrollbar-thin scrollbar-hide">
  <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold text-slate-400 min-w-max">
    {breadcrumbs.map((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;

      return (
        <div
          key={`${crumb.href}-${index}`}
          className="flex items-center gap-1.5 flex-shrink-0"
        >
          {index > 0 && (
            <span className="text-slate-300 font-normal">/</span>
          )}

          {isLast || !crumb.href ? (
            <span className="text-orange-600 font-extrabold">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-orange-500 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      );
    })}
  </div>
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
              <p className="text-sm font-bold text-slate-800 leading-tight">{studentName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{instituteName}</p>
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}