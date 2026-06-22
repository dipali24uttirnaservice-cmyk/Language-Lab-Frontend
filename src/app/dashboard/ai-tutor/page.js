import AIChatWindow from "@/components/organisms/AIChatWindow";
import ChatSidebar from "@/components/organisms/ChatSidebar";

export default function AITutorPage() {
  return (
    <main className="flex h-screen w-full bg-slate-50 p-6 overflow-hidden">
      {/* Sidebar Container */}
      <div className="hidden lg:block">
        <ChatSidebar />
      </div>

      {/* Main Chat Area */}
      <section className="flex-1 h-full pl-6">
        <AIChatWindow />
      </section>
    </main>
  );
}