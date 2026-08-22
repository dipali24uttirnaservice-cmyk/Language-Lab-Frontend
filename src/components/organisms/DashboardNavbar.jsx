"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { FaBell, FaBars, FaChevronRight, FaHome, FaBookReader } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

import LogoutModal from "@/components/molecules/LogoutModal";
import { logoutStudent } from "@/services/auth/logoutApi";
import { studentApi } from "@/services/student/studentApi";
import { getStudentProfile } from "@/services/student/studentProfileApi";
import Link from "next/link";

export default function DashboardNavbar({ isSidebarOpen, setIsOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [student, setStudent] = useState({});
  const [courses, setCourses] = useState([]);

  // ─── Breadcrumb drag-to-scroll (native DOM — document-level move/up) ───────
  const breadcrumbRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    // setTimeout(0) is a macrotask — fires after React commits
    // the setMounted(true) re-render, so breadcrumbRef.current is real DOM
    let domCleanup = null;

    const timer = setTimeout(() => {
      const el = breadcrumbRef.current;
      if (!el) return;

      let isDown = false;
      let startX = 0;
      let scrollStart = 0;

      const onMouseDown = (e) => {
        isDown = true;
        isDraggingRef.current = false;
        startX = e.pageX - el.getBoundingClientRect().left;
        scrollStart = el.scrollLeft;
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        const x = e.pageX - el.getBoundingClientRect().left;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 3) isDraggingRef.current = true;
        el.scrollLeft = scrollStart - walk;
      };

      const onMouseUp = () => {
        isDown = false;
        el.style.cursor = "grab";
        el.style.userSelect = "";
        setTimeout(() => { isDraggingRef.current = false; }, 50);
      };

      const onWheel = (e) => {
        if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      };

      el.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      el.addEventListener("wheel", onWheel, { passive: false });

      domCleanup = () => {
        el.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        el.removeEventListener("wheel", onWheel);
      };
    }, 0);

    return () => {
      clearTimeout(timer);
      domCleanup?.();
    };
  }, []);

  // Query params can end up as the literal text "null"/"undefined" when a
  // caller interpolates a missing value into a URL template string — treat
  // those the same as an absent param so they never render as a crumb.
  const cleanParam = (value) =>
    value && value !== "null" && value !== "undefined" ? value : null;

  const searchParams = useSearchParams();
  const courseId = cleanParam(searchParams.get("courseId"));

  const courseName = cleanParam(searchParams.get("courseName"));
  const type = cleanParam(searchParams.get("type"));
  const topicName = cleanParam(searchParams.get("topicName"));
  const subTopicName = cleanParam(searchParams.get("subTopicName"));
  const subjectName = cleanParam(searchParams.get("subjectName"));
  const lessonName = cleanParam(searchParams.get("lessonName"));

  // ─── Mount guard (prevents hydration mismatch) ───────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Auto-close sidebar on content pages ─────────────────────────────────
useEffect(() => {
  const autoClose =
    pathname.startsWith("/dashboard/video") ||
    pathname.startsWith("/dashboard/audio") ||
    pathname.startsWith("/dashboard/text") ||
    pathname.startsWith("/dashboard/exercise") ||
    pathname.startsWith("/dashboard/vocabulary") ||
    pathname.startsWith("/dashboard/module") || // covers /dashboard/module/{type}/{subtopicId} lesson pages
    pathname.startsWith("/dashboard/topics");

  if (autoClose) {
    setIsOpen(false);
  }
}, [pathname, setIsOpen]);

  // ─── Auto-open sidebar on the course overview page ───────────────────────
  useEffect(() => {
    if (pathname.startsWith("/dashboard/course")) {
      setIsOpen(true);
    }
  }, [pathname, setIsOpen]);

  // ─── Load student data from cookie ───────────────────────────────────────
  useEffect(() => {
    try {
      const studentCookie = Cookies.get("studentData");
      const parsedData = studentCookie ? JSON.parse(studentCookie) : {};
      setStudent(parsedData);
    } catch (error) {
      console.error("Error parsing student data:", error);
    }
  }, []);

  // ─── Refresh from API (cookie is set at login and won't reflect a photo
  // uploaded later on the profile page) ─────────────────────────────────────
  useEffect(() => {
    getStudentProfile()
      .then((res) => {
        if (res.data.success) {
          setStudent((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch((error) => {
        console.error("Error fetching student profile:", error);
      });
  }, []);

  // ─── Load purchased courses (for future navbar context use) ──────────────
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



  // ─── Logout handler ───────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await logoutStudent();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("studentData");

      setShowLogoutModal(false);

      router.replace("/student-login");
      // or window.location.href = "/student-login";
    }
  };


  // ─── Derived student display values ──────────────────────────────────────
  const studentName = student?.full_name || "Student";
  const instituteName = student?.institute_name || "Institute";
  const avatarLetter = studentName.charAt(0).toUpperCase();
  const profileImage = student?.profilePhoto || "";

  // =====================================================
  // BREADCRUMB GENERATOR
  // Reads pathname + URL search params to build the trail.
  // Prevents 404s by constructing safe hrefs for every step.
  // =====================================================
  const generateBreadcrumbs = () => {
    const crumbs = [];

    // Step 1 — Learning Journey is always the root crumb (links back to student dashboard)
    crumbs.push({ label: "Learning Journey", href: "/dashboard" });

    // Step 2 — Detect if we are inside the learning journey
    const isLearningJourney =
      pathname.includes("/dashboard/learning-journey") ||
      pathname.includes("/dashboard/topics") ||
      pathname.includes("/dashboard/course") ||
      pathname.includes("/dashboard/module") ||
      pathname.includes("/dashboard/video") ||
      pathname.includes("/dashboard/audio") ||
      pathname.includes("/dashboard/text") ||
      pathname.includes("/dashboard/exercise") ||
      pathname.includes("/dashboard/vocabulary") ||
      pathname.includes("/dashboard/tasks");

    if (isLearningJourney) {
      // Step 3 — Current Course
      if (courseName && courseId) {
        crumbs.push({
          label: decodeURIComponent(courseName),
          href: `/dashboard/course/${courseId}?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`,
        });
      }

      // Step 4 — Content type (Video / Audio / Text / Practical Manual etc.)
      if (type && courseId && courseName) {
        const typeLabelOverrides = {
          practical_manual: "Practical Manual",
          task: "Tasks",
        };
        let typeLabel =
          typeLabelOverrides[type.toLowerCase()] ||
          type.charAt(0).toUpperCase() + type.slice(1);
        if (["video", "audio", "text"].includes(type.toLowerCase())) {
          typeLabel += " Lesson";
        }
        crumbs.push({
          label: typeLabel,
          href: `/dashboard/topics?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&type=${type}`,
        });
      }

      // Step 5 — Topic
      const topicId = searchParams.get("topicId");
      if (topicName) {
        crumbs.push({
          label: decodeURIComponent(topicName),
          href: topicId
            ? `/dashboard/topics/${topicId}?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&type=${type}&topicName=${encodeURIComponent(topicName)}`
            : null,
        });
      }

      // Step 6 — Sub-topic (clickable — takes back to lesson grid)
      const subTopicId = searchParams.get("subTopicId");
      if (subTopicName) {
        crumbs.push({
          label: decodeURIComponent(subTopicName),
          href: subTopicId && topicId
            ? `/dashboard/module/${type}/${subTopicId}?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&type=${type}&topicId=${topicId}&topicName=${encodeURIComponent(topicName)}&subTopicId=${subTopicId}&subTopicName=${encodeURIComponent(subTopicName)}`
            : null,
        });
      }

      // Step 7 — Lesson / Final page (you are here — not clickable)
      if (lessonName) {
        crumbs.push({
          label: decodeURIComponent(lessonName),
          href: null,
        });
      }
    } else if (pathname.startsWith("/dashboard/assessment")) {
      // /dashboard/assessment -> subject list -> assessment (take/result) —
      // subjectId in the URL is a Mongo id (filtered out by the generic
      // fallback below), so the subject's real title is threaded through as
      // a subjectName query param instead, same pattern as courseName above.
      // Deliberately stops at the subject — no assessment-title crumb.
      crumbs.push({ label: "Assessment", href: "/dashboard/assessment" });

      const segments = pathname.split("/").filter(Boolean); // ["dashboard","assessment", subjectId?, ...]
      const subjectId = segments[2];

      if (subjectId && subjectName) {
        crumbs.push({
          label: decodeURIComponent(subjectName),
          href: `/dashboard/assessment/${subjectId}?subjectName=${encodeURIComponent(subjectName)}`,
        });
      }
    } else {
      // Fallback — non-learning pages (Profile, Settings, etc.)
      const segments = pathname.split("/").filter(Boolean);
      for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];
        const isMongoId = /^[a-f\d]{24}$/i.test(segment);
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            segment
          );

        if (!isMongoId && !isUUID) {
          const builtPath = "/" + segments.slice(0, i + 1).join("/");
          crumbs.push({
            label: segment
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            href: builtPath,
          });
        }
      }
    }

    // Final guard — remove true duplicates only (same label AND same link).
    // Subtopic and lesson titles can legitimately share the same text
    // (both are independently required fields), so matching on label alone
    // would wrongly collapse two distinct hierarchy levels into one.
    const uniqueCrumbs = crumbs.filter(
      (crumb, index, self) =>
        index === self.findIndex((t) => t.label === crumb.label && t.href === crumb.href)
    );

    return uniqueCrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Prevent SSR/hydration flash
  if (!mounted) return null;

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-xl px-6 h-16 flex items-center justify-between">

        {/* ── Left: Hamburger + Breadcrumbs ── */}
        <div className="flex items-center gap-4 min-w-0 flex-1">

          {/* Sidebar toggle */}
          <button
            onClick={() => setIsOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            <FaBars size={18} />
          </button>

          <div>
            {/* Page title (last crumb label) */}
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">
              {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
            </h1>

            {/* Scrollable breadcrumb trail — drag or wheel to scroll, bar hidden */}
            <div
              ref={breadcrumbRef}
              className="max-w-[700px] overflow-x-auto no-scrollbar select-none"
              style={{ cursor: "grab" }}
            >
              <div
                className="flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-slate-400 min-w-max"
                onClick={(e) => { if (isDraggingRef.current) { e.preventDefault(); e.stopPropagation(); } }}
              >
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <div
                      key={`${crumb.href}-${index}`}
                      className="flex items-center gap-1.5 flex-shrink-0"
                    >
                      {/* Separator arrow */}
                      {index > 0 && (
                        <FaChevronRight className="text-slate-300 text-[10px] mx-0.5" />
                      )}

                      {/* Crumb item */}
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${isLast
                          ? "bg-orange-50 text-orange-600"            // current page — highlighted
                          : crumb.href
                            ? "hover:bg-slate-100 text-slate-500 cursor-pointer" // clickable link
                            : "text-slate-400 bg-slate-50"              // no link (e.g. subtopic)
                          }`}
                      >
                        {/* Icons for special crumbs */}
                        {crumb.label === "Learning Journey" && (
                          <FaBookReader className={isLast ? "text-orange-500" : "text-slate-400"} />
                        )}

                        {/* Render: last crumb (span), link crumb (Link), or plain span */}
                        {isLast ? (
                          <span
                            className="font-extrabold max-w-[200px] truncate block"
                            title={crumb.label}
                          >
                            {crumb.label}
                          </span>
                        ) : crumb.href ? (
                          <Link
                            href={crumb.href}
                            className="transition-colors font-semibold max-w-[120px] truncate block"
                            title={crumb.label}
                          >
                            {crumb.label === "Dashboard" ? (
                              <span className="hidden md:inline">{crumb.label}</span>
                            ) : (
                              crumb.label
                            )}
                          </Link>
                        ) : (
                          <span
                            className="font-semibold max-w-[120px] truncate block"
                            title={crumb.label}
                          >
                            {crumb.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Bell + Profile ── */}
        <div className="flex items-center gap-4">

          {/* Notification bell */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-500"
          >
            <FaBell className="text-sm" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
          </motion.button>

          {/* Vertical divider */}
          <div className="h-6 w-[1px] bg-slate-200" />

          {/* Profile avatar + name — click to open logout modal */}
          <div
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all"
          >
            {profileImage ? (
              <div className="relative h-10 w-10">
                <Image
                  src={profileImage}
                  alt={studentName}
                  fill
                  sizes="40px"
                  className="rounded-xl object-cover border border-slate-200"
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
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {studentName}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {instituteName}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      <LogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}