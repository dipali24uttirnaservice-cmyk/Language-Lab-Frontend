"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LogoutModal from "@/components/molecules/LogoutModal";
import InstituteSidebar from "@/components/organisms/InstituteSidebar";
import InstituteNavbar from "@/components/organisms/InstituteNavbar";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logoutUser } from "@/services/auth/logoutApi";
export default function InstituteDashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

   const router = useRouter();

  useEffect(() => {
    const role =
      Cookies.get("role");

    if (
      role !== "institute"
    ) {
      router.replace(
        "/student-login"
      );
    }
  }, []);
  
  const handleLogout = async () => {
  try {
    await logoutUser();

    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("userData");

    window.location.href = "/login";
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 relative">
      {/* Fixed Sidebar */}
      <div className="h-screen shrink-0 z-20">
        <InstituteSidebar
          isOpen={isSidebarOpen}
          setShowLogoutModal={setShowLogoutModal}
          
        />
      </div>


      {/* Right Side */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Fixed Navbar */}
          {!showLogoutModal && (
  <div className="z-20">
    <InstituteNavbar
      isSidebarOpen={isSidebarOpen}
      setIsOpen={setIsSidebarOpen}
      setShowLogoutModal={setShowLogoutModal}
    />
  </div>
)}

        {/* Scrollable Content with Background */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Background Grid & Blurs - Identical to Student Dashboard */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] opacity-80" />
            
            <motion.div
              animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-300/15 via-orange-200/10 to-transparent blur-[100px]"
            />
            
            <motion.div
              animate={{ scale: [1, 1.15, 1], x: [0, 15, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 -left-20 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-emerald-300/10 via-teal-200/10 to-transparent blur-[90px]"
            />
          </div>

          {/* Children Content Layer */}
      <div className="relative z-10 px-6 md:px-8 pt-2 pb-6">
  {children}
</div>
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