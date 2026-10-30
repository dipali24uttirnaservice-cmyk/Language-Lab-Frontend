import StudentNotificationsView from "@/app/components/organisms/StudentNotificationsView";

export const metadata = {
  title: "Notifications",
  description: "View and manage your student notifications, tasks, and alerts.",
};

export default function NotificationsPage() {
  return <StudentNotificationsView />;
}
