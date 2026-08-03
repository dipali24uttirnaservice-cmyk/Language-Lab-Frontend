
"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import DashboardSidebar from "@/components/organisms/DashboardSidebar";
import DashboardNavbar from "@/components/organisms/DashboardNavbar";
import LogoutModal from "@/components/molecules/LogoutModal";
import { logoutStudent } from "@/services/auth/logoutApi";
import { activityApi } from "@/services/activity/activityApi";
import { Toaster } from "react-hot-toast";

export default function DashboardLayoutClient({ children }) {
    const router = useRouter();
const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const [role, setRole] = useState("");

useEffect(() => {
  setRole(Cookies.get("role"));
}, []);

// Institute's "Active Now" tile reads students whose heartbeat landed in
// the last 5 minutes — ping while this tab is open, ~every 60s.
useEffect(() => {
  activityApi.heartbeat().catch(() => {});
  const interval = setInterval(() => {
    activityApi.heartbeat().catch(() => {});
  }, 60000);
  return () => clearInterval(interval);
}, []);

// react-player (used by the video lesson player) calls the underlying
// <video>/<audio> element's play() without catching its promise, so
// swapping/removing the source mid-playback (switching lessons, navigating
// away) throws an unhandled "AbortError: play() request was interrupted" —
// a normal, benign browser quirk, not an app bug. Silence only that one
// well-known case so real unhandled rejections still surface.
useEffect(() => {
  const handleRejection = (event) => {
    if (
      event.reason?.name === "AbortError" &&
      /play\(\)/.test(event.reason?.message || "")
    ) {
      event.preventDefault();
    }
  };
  window.addEventListener("unhandledrejection", handleRejection);
  return () => window.removeEventListener("unhandledrejection", handleRejection);
}, []);

const handleLogout = async () => {
  try {
    await logoutStudent();
  } catch (error) {
    console.error(error);
  }

  Cookies.remove("token");
  Cookies.remove("role");
  Cookies.remove("studentData");

  router.replace("/student-login");
};


  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">

      {/* Fixed Sidebar */}
      <div className="h-screen shrink-0">
        <DashboardSidebar
         isOpen={isSidebarOpen}
          setShowLogoutModal={setShowLogoutModal}
          />
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Fixed Navbar */}
      {/* Fixed Sidebar */}
{!showLogoutModal && (
  <Suspense fallback={<div className="h-16 shrink-0" />}>
    <DashboardNavbar
      isSidebarOpen={isSidebarOpen}
      setIsOpen={setIsSidebarOpen}
    />
  </Suspense>
)}

        {/* Scrollable Content Only */}
    <main className="flex-1 overflow-y-auto focus:outline-none">
  {children}
 <Toaster 
          position="top-right"
          toastOptions={{
            error: {
              style: {
                background: '#fee2e2', // Light red background
                color: '#991b1b',      // Dark red text
                border: '1px solid #f87171',
              },
              iconTheme: {
                primary: '#dc2626',    // Red icon
                secondary: '#fee2e2',
              },
            },
            success: {
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #86efac',
              },
            },
          }}
        />
</main>
      </div>
  <LogoutModal
  open={showLogoutModal}
  onClose={() => setShowLogoutModal(false)}
  onConfirm={handleLogout}
/>
    </div>
  );
}