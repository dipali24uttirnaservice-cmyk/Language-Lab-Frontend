"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, Loader2, ArrowLeft, Trash2 } from "lucide-react";

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
import StatusModal from "@/components/molecules/StatusModal";

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

  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const [statusData, setStatusData] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

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
      topic_id: formTopicId,
      questions: questionList,
    };

    try {
      const schema = editingManualId
        ? updatePracticalManualSchema
        : createPracticalManualSchema;

      await schema.validate(payload, {
        abortEarly: false,
      });

      setSubmitting(true);

      const formData = new FormData();

      formData.append("title", formTitle);
      formData.append("course_id", formCourseId);

      if (formTopicId) {
        formData.append("topic_id", formTopicId);
      }

      formData.append("questions", JSON.stringify(questionList));

      if (editingManualId) {
        await updatePracticalManual(editingManualId, formData);

        setStatusData({
          open: true,
          type: "success",
          title: "Success",
          message: "Practical manual updated successfully.",
        });
      } else {
        await practicalManual(formData);

        setStatusData({
          open: true,
          type: "success",
          title: "Success",
          message: "Practical manual created successfully.",
        });
      }
    } catch (error) {
      // Handle Yup Validation Errors
      if (error.name === "ValidationError") {
        const validationErrors = {};

        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });

        setFormErrors(validationErrors);
        return;
      }

      // Handle API Errors
      console.error(error);

      setStatusData({
        open: true,
        type: "error",
        title: "Error",
        message:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
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
<div className="min-h-screen bg-slate-50/50 p-6 space-y-6 w-full">
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-12">
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
                <p className="text-xs mt-1.5 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 !text-red-600" />
                  <span className="!text-red-600">
                    {formErrors.title}
                  </span>
                </p>
              )}
            </div>

            <div className="md:col-span-6">
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
                <p className="text-xs mt-1.5 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 !text-red-600" />
                  <span className="!text-red-600">
                    {formErrors.course_id}
                  </span>
                </p>
              )}
            </div>

            <div className="md:col-span-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Topic 
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
              {formErrors.topic_id && (
                <p className="text-xs mt-1.5 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 !text-red-600" />
                  <span className="!text-red-600">
                    {formErrors.topic_id}
                  </span>
                </p>
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

                  <div>
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

                    {formErrors[`questions[${index}].question_text`] && (
                      <p className="text-xs mt-1.5 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 !text-red-600" />
                        <span className="!text-red-600">
                          {formErrors[`questions[${index}].question_text`]}
                        </span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Solution
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

                    {formErrors[`questions[${index}].answer_key_html`] && (
                      <p className="text-xs mt-1.5 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 !text-red-600" />
                        <span className="!text-red-600">
                          {formErrors[`questions[${index}].answer_key_html`]}
                        </span>
                      </p>
                    )}
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

                    {formErrors[`questions[${index}].answer_lines`] && (
                      <p className="text-xs mt-1.5 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 !text-red-600" />
                        <span className="!text-red-600">
                          {formErrors[`questions[${index}].answer_lines`]}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
           <button
  type="button"
  onClick={() => router.push("/institute-dashboard/practical-manual")}
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

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={() => {
          const isSuccess = statusData.type === "success";

          setStatusData((prev) => ({
            ...prev,
            open: false,
          }));

          if (isSuccess) {
            router.push("/institute-dashboard/practical-manual");
          }
        }}
      />
    </div>
  );
}