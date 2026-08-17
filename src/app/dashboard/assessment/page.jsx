"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, ClipboardList } from "lucide-react";
import { studentAssessmentApi } from "@/services/assessment/studentAssessmentApi";

export default function AssessmentSubjectsPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await studentAssessmentApi.getSubjects();
        setSubjects(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load subjects:", err);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
          <ClipboardList size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Assessments</h1>
          <p className="text-sm text-slate-500">Pick a subject to see its assessments.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-t-emerald-500 border-slate-200" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
          No subjects available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => (
            <button
              key={subject._id}
              onClick={() => router.push(`/dashboard/assessment/${subject._id}`)}
              className="text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mb-4">
                  <BookOpen size={20} />
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-lg font-black text-slate-900">{subject.title}</h3>
              {subject.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{subject.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
