"use client";

import { createContext, useContext, useState } from "react";

// Lets a page deep in the tree (e.g. the assessment-taking screen going
// exam-mode fullscreen) collapse/restore the dashboard sidebar without
// prop-drilling through DashboardLayoutClient — same isSidebarOpen state
// that used to live only there, just exposed via context too.
const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Exam-mode: fully hides BOTH the sidebar and the top navbar/breadcrumb
  // bar (not just collapsing the sidebar to icon-only width) — set by the
  // assessment-taking page while it's mounted.
  const [isChromeHidden, setIsChromeHidden] = useState(false);
  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen, isChromeHidden, setIsChromeHidden }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}
