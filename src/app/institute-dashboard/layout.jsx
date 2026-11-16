import { cookies } from "next/headers";
import InstituteDashboardLayoutClient from "./InstituteDashboardLayoutClient";

export const metadata = {
  title: {
    default: "Institute Dashboard",
    template: "%s | Institute Dashboard",
  },
  description: "Manage students, tasks, and practical manuals for your institute on Language Lab.",
};

export default async function InstituteDashboardLayout({ children }) {
  const cookieStore = await cookies();
  const initialRole = cookieStore.get("role")?.value || "institute";
  let initialUserData = null;

  try {
    const raw = cookieStore.get("userData")?.value;
    if (raw) {
      const decoded = raw.startsWith("%") ? decodeURIComponent(raw) : raw;
      initialUserData = JSON.parse(decoded);
    }
  } catch {
    try {
      initialUserData = JSON.parse(cookieStore.get("userData")?.value || "");
    } catch {}
  }

  const cachedUser =
    initialRole === "faculty"
      ? initialUserData?.faculty || initialUserData?.user || initialUserData
      : initialUserData?.institute || initialUserData?.user || initialUserData;

  return (
    <InstituteDashboardLayoutClient
      initialRole={initialRole}
      initialUser={cachedUser || null}
    >
      {children}
    </InstituteDashboardLayoutClient>
  );
}
