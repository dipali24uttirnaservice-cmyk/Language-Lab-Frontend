"use client";

import Link from "next/link";

const categories = [
  { title: "📚 Grammar", questions: 50, color: "bg-blue-500", light: "bg-blue-50" },
  { title: "📝 Vocabulary", questions: 40, color: "bg-emerald-500", light: "bg-emerald-50" },
  { title: "🗣️ Speaking Skills", questions: 35, color: "bg-orange-500", light: "bg-orange-50" },
  { title: "📖 Reading Comprehension", questions: 60, color: "bg-violet-500", light: "bg-violet-50" },
  { title: "💼 Business English", questions: 25, color: "bg-cyan-500", light: "bg-cyan-50" },
  { title: "✈️ Travel English", questions: 20, color: "bg-pink-500", light: "bg-pink-50" },
];

export default function MCQs() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">MCQ Practice Center</h1>
        <p className="text-slate-500 font-medium mt-2">Sharpen your language proficiency with targeted quizzes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.title}
            className={`
              group relative overflow-hidden rounded-3xl p-8 border border-slate-100 
              ${category.light} transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
            `}
          >
            {/* Icon Box */}
            <div className={`h-16 w-16 rounded-2xl ${category.color} flex items-center justify-center text-white text-2xl shadow-lg shadow-black/10`}>
              {category.title.split(" ")[0]}
            </div>

            {/* Content */}
            <h3 className="mt-6 text-xl font-black text-slate-900">
              {category.title.split(" ").slice(1).join(" ")}
            </h3>
            <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
              {category.questions} Questions Available
            </p>

            {/* Action Link acting as a Button */}
            <Link
              href={`/dashboard/mcqs/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="mt-8 block w-full text-center rounded-xl bg-slate-900 px-6 py-3 text-xs font-black text-white hover:bg-slate-700 transition-colors"
            >
              START QUIZ
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}