"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { practicalManualDetail } from "@/services/practical-Manual/page.jsx";

export default function ViewPracticalManualPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [manual, setManual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await practicalManualDetail(id);
        const data = response?.data || response;
        setManual(data?.data || data);
      } catch (error) {
        console.error("Failed to fetch manual details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!manual) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-medium border border-slate-100 shadow-sm">
          Manual not found.
        </div>
      </div>
    );
  }

  const courseName =
    typeof manual.course_id === "object"
      ? manual.course_id?.course_name
      : manual.course_id;

  const topicName =
    typeof manual.topic_id === "object"
      ? manual.topic_id?.title
      : manual.topic_id;

  return (
<div className="min-h-screen bg-slate-50/50 p-6 space-y-6 w-full">      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Manuals
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-100/80 p-6 md:p-10 space-y-8">
        {/* Header Section */}
        <div className="border-b border-orange-50 pb-6 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200/50 shadow-sm">
            Practical Manual Details
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {manual.title}
          </h1>
          <p className="text-xs text-slate-400 font-medium">Detailed view of curriculum specs and questions</p>
        </div>

        {/* Meta Info Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-50 to-orange-50/20 rounded-2xl p-4 border border-orange-100/50 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">Course</span>
            <p className="font-bold text-slate-800 text-sm">{courseName || "-"}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-orange-50/20 rounded-2xl p-4 border border-orange-100/50 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">Topic</span>
            <p className="font-bold text-slate-800 text-sm">{topicName || "-"}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-orange-50/20 rounded-2xl p-4 border border-orange-100/50 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">Questions</span>
            <p className="font-black text-orange-600 text-base">{manual.questions?.length || 0}</p>
          </div>
        </div>

        {/* Attachment Link */}
        {manual.attachment_url && (
          <a
            href={manual.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-2xl font-bold hover:opacity-95 transition-all shadow-md shadow-orange-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm">Download / View Attachment File</span>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-xl group-hover:translate-x-1 transition-transform">
              Open ↗
            </span>
          </a>
        )}

        {/* Questions List Section */}
        <div className="space-y-4 pt-2">
          <h3 className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            Questions List
          </h3>

          <div className="space-y-3">
            {manual.questions?.map((q, index) => (
              <div
                key={index}
                className="border border-orange-100/60 rounded-2xl p-5 bg-gradient-to-br from-slate-50/80 to-white space-y-3 shadow-sm hover:border-orange-200 transition-all"
              >
                <p className="font-bold text-slate-900 text-sm md:text-base flex items-start gap-2">
                  <span className="text-orange-600 font-black shrink-0">{index + 1}.</span>
                  <span>{q.question_text}</span>
                </p>
                <div
                  className="text-sm text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-inner leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: q.answer_key_html }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}