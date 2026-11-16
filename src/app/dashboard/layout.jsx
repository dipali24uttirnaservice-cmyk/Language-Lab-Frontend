import DashboardLayoutClient from "./DashboardLayoutClient";

export const metadata = {
  title: {
    default: "Student Dashboard",
    template: "%s | Student Dashboard",
  },
  description: "Track your courses, tasks, and learning progress on Language Lab.",
};

export default function DashboardLayout({ children }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
