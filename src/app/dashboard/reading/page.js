"use client";
import { useRouter } from "next/navigation"; // 1. Import router
const categories = [
  { title: "🌱 Beginner English", count: "25 Lessons", color: "bg-emerald-500", light: "bg-emerald-50" },
  { title: "🗣️ Conversation English", count: "30 Lessons", color: "bg-orange-500", light: "bg-orange-50" },
  { title: "💼 Business English", count: "20 Lessons", color: "bg-blue-600", light: "bg-blue-50" },
  { title: "✈️ Travel English", count: "15 Lessons", count: "15 Lessons", color: "bg-rose-500", light: "bg-rose-50" },
  { title: "🎓 Academic English", count: "18 Lessons", color: "bg-violet-600", light: "bg-violet-50" },
];

export default function ReadingText() {

  const router = useRouter(); // 2. Initialize router
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black text-slate-900 mb-2">Reading Library</h1>
      <p className="text-slate-500 mb-10 font-medium">Select a path to enhance your comprehension.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((item) => (
          <div
            key={item.title}
            className={`
              group relative overflow-hidden rounded-3xl p-8 
              border border-slate-100 ${item.light} 
              transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
            `}
          >
            {/* Icon Container */}
            <div className={`h-16 w-16 rounded-2xl ${item.color} flex items-center justify-center text-white text-2xl shadow-lg shadow-black/10`}>
              {item.title.split(" ")[0]}
            </div>

            {/* Content */}
            <h3 className="mt-6 text-2xl font-black text-slate-900">
              {item.title.split(" ").slice(1).join(" ")}
            </h3>
            <p className="mt-1 text-sm font-bold text-slate-500 uppercase tracking-wider">
              {item.count}
            </p>

            {/* Button */}
        
<button onClick={() => router.push(`/dashboard/reading/${item.title.toLowerCase().replace(/\s+/g, '-')}`)}
  className="mt-6 w-full rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-black text-white hover:bg-emerald-600 transition-colors flex items-center justify-center"
>
  START READING
</button>
          </div>
        ))}
      </div>
    </div>
  );
}