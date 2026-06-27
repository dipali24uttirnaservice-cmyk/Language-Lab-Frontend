
"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import DashboardSidebar from "@/components/organisms/DashboardSidebar";
import DashboardNavbar from "@/components/organisms/DashboardNavbar";
import LogoutModal from "@/components/molecules/LogoutModal";
import { logoutStudent } from "@/services/auth/logoutApi";

export default function DashboardLayout({ children }) {
    const router = useRouter();
const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const [role, setRole] = useState("");

useEffect(() => {
  setRole(Cookies.get("role"));
}, []);

const handleLogout = async () => {
  try {
    await logoutStudent();

    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("studentData");

    window.location.href = "/student-login";
  } catch (error) {
    console.error(error);
  }
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
  <DashboardNavbar
    isSidebarOpen={isSidebarOpen}
    setIsOpen={setIsSidebarOpen}
  />
)}

        {/* Scrollable Content Only */}
    <main className="flex-1 overflow-y-auto p-2">
  {children}
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