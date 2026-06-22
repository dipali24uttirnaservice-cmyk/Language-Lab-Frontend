"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/organisms/DashboardSidebar";
import DashboardNavbar from "@/components/organisms/DashboardNavbar";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">

      {/* Fixed Sidebar */}
      <div className="h-screen shrink-0">
        <DashboardSidebar isOpen={isSidebarOpen} />
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Fixed Navbar */}
        <DashboardNavbar
          isSidebarOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Scrollable Content Only */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}