import InstituteDashboardLayoutClient from "./InstituteDashboardLayoutClient";

export const metadata = {
  title: {
    default: "Institute Dashboard",
    template: "%s | Institute Dashboard",
  },
  description: "Manage students, tasks, and practical manuals for your institute on Language Lab.",
};

export default function InstituteDashboardLayout({ children }) {
  return <InstituteDashboardLayoutClient>{children}</InstituteDashboardLayoutClient>;
}
