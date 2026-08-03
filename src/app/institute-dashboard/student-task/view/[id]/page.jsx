"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Calendar, CheckCircle2, Award } from "lucide-react";
import { taskApi } from "@/services/task/taskApi";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export default function ViewStudentTaskPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await taskApi.getTaskById(id);
        const data = response?.data || response;
        setTask(data?.data || data);
      } catch (error) {
        console.error("Failed to fetch task details:", error);
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

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-medium border border-slate-100 shadow-sm">
          Task not found.
        </div>
      </div>
    );
  }

  const courseName =
    typeof task.course_id === "object"
      ? task.course_id?.course_name
      : task.course_id;

  const topicName =
    typeof task.topic_id === "object"
      ? task.topic_id?.title
      : task.topic_id;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6 w-full">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold text-sm transition-all bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Tasks
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-100/80 p-6 md:p-10 space-y-8">
        {/* Header Section */}
        <div className="border-b border-orange-50 pb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200/50 shadow-sm">
              Task Details
            </span>
            <span className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full uppercase ${
              task.status === "published" 
                ? "bg-green-50 text-green-600 border border-green-200/50" 
                : "bg-amber-50 text-amber-600 border border-amber-200/50"
            }`}>
              {task.status || "Draft"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {task.title}
          </h1>
          <p className="text-xs text-slate-400 font-medium">Detailed view of task specs, due dates, and questions</p>
        </div>

        {/* Meta Info Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-50 to-orange-50/20 rounded-2xl p-4 border border-orange-100/50 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">Course</span>
            <p className="font-bold text-slate-800 text-sm">{courseName || "-"}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-orange-50/20 rounded-2xl p-4 border border-orange-100/50 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">Topic</span>
            <p className="font-bold text-slate-800 text-sm">{topicName || "-"}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-orange-50/20 rounded-2xl p-4 border border-orange-100/50 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">Due Date</span>
            <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-orange-50/20 rounded-2xl p-4 border border-orange-100/50 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">Questions</span>
            <p className="font-black text-orange-600 text-base">{task.questions?.length || 0}</p>
          </div>
        </div>

        {/* Description & Instructions Section */}
        {(task.description || task.instructions) && (
          <div className="grid md:grid-cols-2 gap-4">
            {task.description && (
              <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-100 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Description</h4>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{task.description}</p>
              </div>
            )}
            {task.instructions && (
              <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-100 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Instructions</h4>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{task.instructions}</p>
              </div>
            )}
          </div>
        )}

        {/* Text Content (HTML) Section */}
        {task.text_content && (
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Content</h4>
            <div
              className="text-sm text-slate-700 bg-slate-50/60 p-5 rounded-2xl border border-slate-100 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(task.text_content) }}
            />
          </div>
        )}

        {/* Attachment Link */}
        {task.attachment_url && (
          <a
            href={task.attachment_url}
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
        {task.questions && task.questions.length > 0 && (
          <div className="space-y-4 pt-2">
            <h3 className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              Questions List
            </h3>

            <div className="space-y-4">
              {task.questions.map((q, index) => (
                <div
                  key={index}
                  className="border border-orange-100/60 rounded-2xl p-5 md:p-6 bg-gradient-to-br from-slate-50/80 to-white space-y-4 shadow-sm hover:border-orange-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-bold text-slate-900 text-sm md:text-base flex items-start gap-2">
                      <span className="text-orange-600 font-black shrink-0">{index + 1}.</span>
                      <span>{q.question_text}</span>
                    </p>
                    {q.marks !== undefined && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/50 shrink-0">
                        <Award className="w-3.5 h-3.5" />
                        {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      {q.options.map((option, optIdx) => {
                        const isCorrect = option === q.correct_answer;
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                              isCorrect
                                ? "bg-green-50/80 border-green-200 text-green-800"
                                : "bg-white border-slate-200 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold ${
                                isCorrect ? "bg-green-200 text-green-800" : "bg-slate-100 text-slate-600"
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{option}</span>
                            </div>
                            {isCorrect && (
                              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100/60 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fallback Answer View if options aren't structured */}
                  {(!q.options || q.options.length === 0) && q.correct_answer && (
                    <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                      <span className="font-bold text-slate-700">Correct Answer:</span>
                      <span className="text-green-600 font-semibold">{q.correct_answer}</span>
                    </div>
                  )}

                  {/* Answer Key HTML if available */}
                  {q.answer_key_html && (
                    <div
                      className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100 shadow-inner leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(q.answer_key_html) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}