"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { Upload, AlertCircle, Loader2, ArrowLeft, Trash2 } from "lucide-react";

import {
  practicalManual,
  practicalManualDetail,
  updatePracticalManual
} from "@/services/practical-Manual/page.jsx";

import {
  createPracticalManualSchema,
  updatePracticalManualSchema
} from "@/app/schemas/practicalManual.schema";
import { courseApi } from "@/services/course/courseApi";
import { topicApi } from "@/services/topic/topicApi";
import RichTextEditor from "@/components/molecules/RichTextEditor";

export default function PracticalManualFormPage() {
  const router = useRouter();
  const params = useParams();

  // Handles standard [id] or optional catch-all [[...id]]
  const routeId = params?.id;

  const editingManualId =
    routeId && routeId !== "create"
      ? Array.isArray(routeId)
        ? routeId[0]
        : routeId
      : null;

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [formTopicId, setFormTopicId] = useState("");
  const [practicalAttachment, setPracticalAttachment] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const [questionList, setQuestionList] = useState([
    { question_text: "", answer_key_html: "", answer_lines: 5 }
  ]);

  const [formErrors, setFormErrors] = useState({});

  // Course dropdown — same source as every other institute-dashboard form.
  useEffect(() => {
    courseApi
      .getCourses()
      .then((res) => setCourses(res.data?.data?.courses || []))
      .catch((error) => console.error("Get Courses Error:", error));
  }, []);

  // Topic dropdown depends on the chosen course. Only fetches — never clears
  // formTopicId itself, so the edit-mode preload above isn't clobbered the
  // moment this effect re-runs for the manual's existing course.
  useEffect(() => {
    if (!formCourseId) {
      setTopics([]);
      return;
    }
    setTopicsLoading(true);
    topicApi
      .getTopics(formCourseId)
      .then((res) => setTopics(res.data?.data?.topics || res.data?.data || []))
      .catch((error) => {
        console.error("Get Topics Error:", error);
        setTopics([]);
      })
      .finally(() => setTopicsLoading(false));
  }, [formCourseId]);

  // Explicit user-driven course change — clears the now-stale topic.
  const handleCourseChange = (id) => {
    setFormCourseId(id);
    setFormTopicId("");
  };

  // Fetch data if ID exists (Edit Mode)
  useEffect(() => {
    if (editingManualId) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const response = await practicalManualDetail(editingManualId);
          const data = response?.data || response;
          const manual = data?.data || data;

          setFormTitle(manual.title || "");
          setFormCourseId(
            typeof manual.course_id === "object"
              ? manual.course_id?._id || ""
              : manual.course_id || ""
          );
          setFormTopicId(
            typeof manual.topic_id === "object"
              ? manual.topic_id?._id || ""
              : manual.topic_id || ""
          );
          setQuestionList(
            manual.questions?.map((q) => ({
              question_text: q.question_text || "",
              answer_key_html: q.answer_key_html || "",
              answer_lines: q.answer_lines || 5
            })) || []
          );
        } catch (error) {
          console.error("Error loading detail for edit", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [editingManualId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormErrors({});

    const payload = {
      title: formTitle,
      course_id: formCourseId,
      topic_id: formTopicId || undefined,
      questions: questionList,
      ...(editingManualId && removeAttachment && { remove_attachment: true }),
    };

    try {
      const schema = editingManualId
        ? updatePracticalManualSchema
        : createPracticalManualSchema;

      await schema.validate(payload, { abortEarly: false });

      setSubmitting(true);

      const formData = new FormData();

      formData.append("title", formTitle);
      formData.append("course_id", formCourseId);

      if (formTopicId) {
        formData.append("topic_id", formTopicId);
      }

      formData.append("questions", JSON.stringify(questionList));

      if (practicalAttachment) {
        formData.append("practicalAttachment", practicalAttachment);
      }
      if (editingManualId && removeAttachment) {
        formData.append("remove_attachment", "true");
      }

      if (editingManualId) {
        await updatePracticalManual(editingManualId, formData);
      } else {
        await practicalManual(formData);
      }

      router.push("/institute-dashboard/practical-manual");
    } catch (error) {
      console.error("Practical manual submit error", error);

      if (error.inner) {
        const errors = {};

        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });

        setFormErrors(errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase">
            Practical Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {editingManualId ? "Update Practical Manual" : "Create Practical Manual"}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Title
              </label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-orange-300 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm"
                placeholder="Practical manual title"
              />
              {formErrors.title && (
                <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.title}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Course
              </label>
              <select
                value={formCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="mt-2 w-full rounded-xl border border-orange-300 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm cursor-pointer"
              >
                <option value="" disabled>Select course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.course_name}</option>
                ))}
              </select>
              {formErrors.course_id && (
                <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.course_id}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Topic (Optional)
              </label>
              <select
                value={formTopicId}
                onChange={(e) => setFormTopicId(e.target.value)}
                disabled={!formCourseId || topicsLoading}
                className="mt-2 w-full rounded-xl border border-orange-300 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm cursor-pointer disabled:opacity-60"
              >
                <option value="">
                  {!formCourseId
                    ? "Select a course first"
                    : topicsLoading
                    ? "Loading topics..."
                    : "No specific topic"}
                </option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attachment File
              </label>
              <div className="mt-2 border-2 border-dashed border-slate-200 rounded-2xl p-3 flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="text-orange-500 w-5 h-5 flex-shrink-0" />
                <input
                  type="file"
                  onChange={(e) => setPracticalAttachment(e.target.files[0] || null)}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
              </div>
              {editingManualId && (
                <label className="flex items-center gap-2 text-xs font-bold text-rose-600 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeAttachment}
                    onChange={(e) => setRemoveAttachment(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  Remove existing attachment
                </label>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900">Questions Setup</h3>
              <button
                type="button"
                onClick={() =>
                  setQuestionList([
                    ...questionList,
                    { question_text: "", answer_key_html: "", answer_lines: 5 }
                  ])
                }
                className="px-4 py-2 rounded-xl bg-white text-orange-600 border border-orange-300 hover:bg-orange-50 active:scale-95 font-bold text-xs transition-all"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questionList.map((q, index) => (
                <div key={index} className="bg-slate-50/75 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-500 uppercase">
                      Question #{index + 1}
                    </h4>
                    {questionList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionList(questionList.filter((_, i) => i !== index));
                        }}
                        className="text-rose-500 hover:text-rose-600 font-bold text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    value={q.question_text}
                    onChange={(e) => {
                      const arr = [...questionList];
                      arr[index].question_text = e.target.value;
                      setQuestionList(arr);
                    }}
                    placeholder="Type question text..."
                    className="w-full rounded-xl border border-orange-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                  />

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Answer Key
                    </label>
                    <RichTextEditor
                      value={q.answer_key_html}
                      onChange={(html) => {
                        const arr = [...questionList];
                        arr[index].answer_key_html = html;
                        setQuestionList(arr);
                      }}
                      placeholder="Model answer for this question…"
                      minHeight={120}
                    />
                  </div>

                  <div className="max-w-40">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Answer Lines
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={q.answer_lines}
                      onChange={(e) => {
                        const arr = [...questionList];
                        arr[index].answer_lines = Number(e.target.value);
                        setQuestionList(arr);
                      }}
                      className="w-full rounded-xl border border-orange-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-orange-300 text-orange-600 bg-white font-bold text-sm hover:bg-orange-50 active:scale-95 transition-all"
            >
              Cancel
            </button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-orange-500/10 border-b-2 border-orange-700 disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-2 transition-all"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingManualId ? "Update Manual" : "Create Manual"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}