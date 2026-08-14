"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FaBell,
  FaGraduationCap,
  FaBars,
  FaTimes,
   LogOut,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

import { logoutUser } from "@/services/auth/logoutApi";
import { taskApi } from "@/services/task/taskApi";
import { practicalManualDetail } from "@/services/practical-Manual/page.jsx";
import { courseApi } from "@/services/course/courseApi";
import { useInstituteLogoSrc } from "@/utils/media";

const MONGO_ID = /^[a-f\d]{24}$/i;

// Maps a path segment to the API call that resolves a Mongo ID appearing
// right after it into a human-readable title, and where on the response
// that title lives — so the breadcrumb never shows a raw ObjectId for
// these detail routes.
const ID_RESOLVERS = {
  "student-task": {
    fetch: (id) => taskApi.getTaskById(id),
    getTitle: (res) => (res.data?.data || res.data)?.title,
  },
  "practical-manual": {
    fetch: (id) => practicalManualDetail(id),
    getTitle: (res) => (res.data?.data || res.data)?.title,
  },
  // No get-course-by-id endpoint for the institute role — reuse the
  // already-fetched "my courses" list and pick the matching one out of it.
  "video-progress": {
    fetch: () => courseApi.getCourses(),
    getTitle: (res, id) =>
      (res.data?.data?.courses || []).find((c) => c._id === id)?.course_name,
  },
  "course-content": {
    fetch: () => courseApi.getCourses(),
    getTitle: (res, id) =>
      (res.data?.data?.courses || []).find((c) => c._id === id)?.course_name,
  },
};

export default function InstituteNavbar({
 isSidebarOpen,
  setIsOpen,
  showLogoutModal,
  setShowLogoutModal,
}) {
const router = useRouter();
  const pathname = usePathname();

  const { user: institute } = useAuth();


  const { src: instituteLogo, onError: handleLogoError } = useInstituteLogoSrc(institute);


  const instituteName =
    institute?.institute_name || "Institute";


  const avatarLetter =
    instituteName
      ?.charAt(0)
      ?.toUpperCase() || "I";


  // Resolves a Mongo ID segment to its item's real title, so the breadcrumb
  // reads "Vocabulary Practice" instead of a raw ObjectId — keyed by
  // pathname so it refetches on navigation. Covers both the direct
  // /student-task/{id} route and sub-routes like /student-task/view/{id} or
  // /student-task/submissions/{id} — anything where a resolver key
  // (student-task, practical-manual, …) appears earlier in the path, not
  // just immediately before the ID.
  const findResolverFor = (segments, idIndex) => {
    for (let i = idIndex - 1; i >= 0; i--) {
      if (ID_RESOLVERS[segments[i]]) return ID_RESOLVERS[segments[i]];
      if (MONGO_ID.test(segments[i])) return null; // hit a different ID first
    }
    return null;
  };

  const [resolvedTitle, setResolvedTitle] = useState(null);
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const idIndex = segments.findIndex((seg) => MONGO_ID.test(seg));
    const resolver = idIndex >= 0 ? findResolverFor(segments, idIndex) : null;

    if (resolver) {
      const id = segments[idIndex];
      resolver
        .fetch(id)
        .then((res) => setResolvedTitle(resolver.getTitle(res, id) || null))
        .catch(() => setResolvedTitle(null));
    } else {
      setResolvedTitle(null);
    }
  }, [pathname]);

  const breadcrumbs = pathname
  .split("/")
  .filter(Boolean)
  .map((item, index, arr) => {
    const isResolvableId = MONGO_ID.test(item) && !!findResolverFor(arr, index);
    return {
      label: isResolvableId
        ? resolvedTitle || "…"
        : item.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      href: "/" + arr.slice(0, index + 1).join("/"),
    };
  });



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
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
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
            aria-label="Notifications"
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
            <div className="relative h-10 w-10">
  <Image
    src={instituteLogo}
    alt={instituteName}
    fill
    sizes="40px"
    className="rounded-xl object-cover border border-slate-200"
    onError={handleLogoError}
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