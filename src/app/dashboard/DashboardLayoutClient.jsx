
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
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

export default function DashboardLayoutClient({ children }) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SidebarProvider>
  );
}

function DashboardLayoutInner({ children }) {
    const router = useRouter();
const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen, isChromeHidden } = useSidebar();
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
// <video>/<audio> element's play() without ever attaching a .catch() to the
// promise it returns. Two known-benign cases then reject that promise —
// AbortError (source swapped/removed mid-playback while switching lessons
// or navigating away) and NotSupportedError (called play() on a video that
// has no playable source, e.g. a dead/empty URL) — and because nothing
// consumed the rejection, the browser fires 'unhandledrejection', which
// Next's dev overlay reports as a crash even though every video-rendering
// component here already shows its own fallback UI on failure
// (VideoPlayer/VideoCard/RelatedVideoThumb onError handlers).
//
// A window 'unhandledrejection' listener calling preventDefault() is the
// textbook fix, but it's a race against Next's own listener (registered
// during its early bootstrap, so it can run first) — whether preventDefault
// actually suppresses the overlay ends up depending on exactly when in the
// microtask queue each listener runs. Patching play() itself sidesteps that
// race entirely: attaching *any* .catch() before the promise settles means
// it is never "unhandled" in the first place, so this event never fires
// for these two cases regardless of listener ordering.
useEffect(() => {
  if (typeof HTMLMediaElement === "undefined") return;
  if (HTMLMediaElement.prototype.play.__patchedForBenignRejections) return;

  const originalPlay = HTMLMediaElement.prototype.play;
  const patchedPlay = function (...args) {
    const result = originalPlay.apply(this, args);
    if (result?.catch) {
      result.catch((err) => {
        const benign =
          err?.name === "AbortError" || err?.name === "NotSupportedError";
        if (!benign) throw err; // let anything else still surface normally
      });
    }
    return result;
  };
  patchedPlay.__patchedForBenignRejections = true;
  HTMLMediaElement.prototype.play = patchedPlay;

  return () => {
    if (HTMLMediaElement.prototype.play === patchedPlay) {
      HTMLMediaElement.prototype.play = originalPlay;
    }
  };
}, []);

// Same story for <video>/<audio> elements whose src briefly points at a
// video that's still downloading locally (or a dead link) — the browser's
// native "error" event on the media element surfaces to Next's dev overlay
// as "NotSupportedError: The element has no supported sources", even though
// every video-rendering component here already shows its own fallback UI
// (see VideoPlayer/VideoCard/RelatedVideoThumb onError handlers). Next
// decides whether to show its overlay based on event.defaultPrevented, so
// preventDefault() here suppresses just the overlay, not our own handling.
useEffect(() => {
  const handleMediaError = (event) => {
    const tag = event.target?.tagName;
    if (tag === "VIDEO" || tag === "AUDIO") {
      event.preventDefault();
    }
  };
  window.addEventListener("error", handleMediaError, true);
  return () => window.removeEventListener("error", handleMediaError, true);
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

      {/* Fixed Sidebar — fully hidden (not just collapsed) in exam-mode */}
      {!isChromeHidden && (
        <div className="h-screen shrink-0">
          <DashboardSidebar
           isOpen={isSidebarOpen}
            setShowLogoutModal={setShowLogoutModal}
            />
        </div>
      )}

      {/* Right Side */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Fixed Navbar — same exam-mode hide */}
      {/* Fixed Sidebar */}
{!showLogoutModal && !isChromeHidden && (
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