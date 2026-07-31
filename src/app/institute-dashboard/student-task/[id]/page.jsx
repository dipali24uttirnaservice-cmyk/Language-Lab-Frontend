"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  Trash2, 
  Info, 
  Layers, 
  UserCog, 
  HelpCircle, 
  Plus 
} from "lucide-react";

import { taskApi } from "@/services/task/taskApi";
import {
  createStudentTaskSchema,
  updateStudentTaskSchema
} from "@/app/schemas/studentTask.schema";
import { courseApi } from "@/services/course/courseApi";
import { topicApi } from "@/services/topic/topicApi";
import RichTextEditor from "@/components/molecules/RichTextEditor";
import StatusModal from "@/components/molecules/StatusModal";

const SectionDivider = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
    <Icon className="w-4 h-4 text-orange-500" />
    <span className="text-xs font-black uppercase tracking-wider text-slate-800">{title}</span>
  </div>
);

const MEDIA_TYPES = ["audio", "video", "document"];

export default function StudentTaskFormPage() {
  const router = useRouter();
  const params = useParams();

  const routeId = params?.id;
  const editingManualId =
    routeId && routeId !== "create"
      ? Array.isArray(routeId)
        ? routeId[0]
        : routeId
      : null;

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Field States
  const [formTitle, setFormTitle] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [formTopicId, setFormTopicId] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskInstructions, setTaskInstructions] = useState("");
  const [taskType, setTaskType] = useState("text");
  const [taskStatus, setTaskStatus] = useState("published");
  const [taskTextContent, setTaskTextContent] = useState("");
  const [taskLinkUrl, setTaskLinkUrl] = useState("");
  const [taskMediaFile, setTaskMediaFile] = useState(null);
  const [taskTarget, setTaskTarget] = useState("all");
  const [studentIds, setStudentIds] = useState([]);

  // Data Lists & Dropdowns
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Status Modal State
  const [statusData, setStatusData] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // Questions Setup State
  const [questions, setQuestions] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    courseApi
      .getCourses()
      .then((res) => setCourses(res.data?.data?.courses || []))
      .catch((error) => console.error("Get Courses Error:", error));
  }, []);

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

  const handleCourseChange = (id) => {
    setFormCourseId(id);
    setFormTopicId("");
    setStudentIds([]);
  };

  const toggleStudentSelection = (studentId) => {
    setStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        answer_key_html: "",
        correct_answer: "",
        answer_lines: 5,
        timestamp: 0,
        options: [],
        pairs: [],
      },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, key, value) => {
    setQuestions((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], [key]: value };
      return arr;
    });
  };

  useEffect(() => {
    if (editingManualId) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const response = await taskApi.getTaskById(editingManualId);
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
          setTaskDueDate(manual.due_date ? manual.due_date.split("T")[0] : "");
          setTaskDescription(manual.description || "");
          setTaskInstructions(manual.instructions || "");
          setTaskType(manual.type || "text");
          setTaskStatus(manual.status || "published");
          setTaskTextContent(manual.text_content || "");
          setTaskLinkUrl(manual.link_url || "");
          setTaskTarget(manual.target || "all");
          setStudentIds(manual.student_ids || manual.selected_student_ids || []);

          setQuestions(
            manual.questions?.map((q) => ({
              question_text: q.question_text || "",
              answer_key_html: q.answer_key_html || "",
              correct_answer: q.correct_answer || "",
              answer_lines: q.answer_lines || 5,
              timestamp: q.timestamp || 0,
              options: q.options || [],
              pairs: q.pairs || [],
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
      due_date: taskDueDate,
      description: taskDescription,
      instructions: taskInstructions,
      type: taskType,
      status: taskStatus,
      text_content: taskTextContent,
      link_url: taskLinkUrl,
      target: taskTarget,
      student_ids: studentIds,
      questions,
    };

    try {
      const schema = editingManualId
        ? updateStudentTaskSchema
        : createStudentTaskSchema;

      if (schema) {
        await schema.validate(payload, { abortEarly: false });
      }

      setSubmitting(true);

      if (!taskMediaFile) {
        if (editingManualId) {
          await taskApi.updateTask(editingManualId, payload);
        } else {
          await taskApi.createTask(payload);
        }
      } else {
        const formData = new FormData();
        formData.append("title", formTitle);
        formData.append("course_id", formCourseId);
        if (formTopicId) formData.append("topic_id", formTopicId);
        if (taskDueDate) formData.append("due_date", taskDueDate);
        formData.append("description", taskDescription);
        formData.append("instructions", taskInstructions);
        formData.append("type", taskType);
        formData.append("status", taskStatus);
        formData.append("text_content", taskTextContent);
        formData.append("link_url", taskLinkUrl);
        formData.append("target", taskTarget);
        
        studentIds.forEach((id) => formData.append("student_ids[]", id));
        questions.forEach((q, index) => {
          formData.append(`questions[${index}][question_text]`, q.question_text);
          formData.append(`questions[${index}][correct_answer]`, q.correct_answer);
          formData.append(`questions[${index}][answer_key_html]`, q.answer_key_html || "");
        });

        formData.append("media_file", taskMediaFile);

        if (editingManualId) {
          await taskApi.updateTask(editingManualId, formData);
        } else {
          await taskApi.createTask(formData);
        }
      }

      // Turn off submitting loader first
      setSubmitting(false);
      
      // Give React one tick to breathe, then trigger the modal reliably
      setTimeout(() => {
       setStatusData({
  open: true,
  type: "success",
  title: "Success",
  message: editingManualId
    ? "Task updated successfully."
    : "Task created successfully.",
});
      }, 50);

    } catch (error) {
      setSubmitting(false);

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

      console.error("API Error during submit:", error);
      
      // Also wrap error state update in a timeout for consistency
      setTimeout(() => {
        setStatusData({
          open: true,
          type: "error",
          title: "Error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong. Please try again.",
        });
      }, 50);
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
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/institute-dashboard/student-task")}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-orange-50/50 text-slate-600 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-orange-500" />
        </button>
        <div>
          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase border border-orange-200">
            Task Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {editingManualId ? "Update Task" : "Create Task"}
          </h1>
        </div>
      </div>

      {/* Main Form Card Container */}
      <motion.div
        key="create"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className="w-full bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
      >
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black text-slate-900">Task Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign audio, video, document, link, or text tasks to a course or specific students.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionDivider icon={Info} title="Basic Info" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Course Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              >
                <option value="" disabled>Select course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.course_name}</option>
                ))}
              </select>
              {formErrors.course_id && (
                <p className="text-xs mt-1 text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.course_id}
                </p>
              )}
            </div>

            {/* Topic Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Topic (optional)
              </label>
              <select
                value={formTopicId}
                onChange={(e) => setFormTopicId(e.target.value)}
                disabled={!formCourseId || topicsLoading}
                className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 disabled:opacity-60"
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
                <p className="text-xs mt-1 text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.topic_id}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Practical manual title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
            />
            {formErrors.title && (
              <p className="text-xs mt-1 text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {formErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
            <textarea
              rows={2}
              placeholder="Optional description shown to students."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Instructions</label>
            <textarea
              rows={2}
              placeholder="Optional step-by-step instructions."
              value={taskInstructions}
              onChange={(e) => setTaskInstructions(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
            />
          </div>

          <div className="pt-2">
            <SectionDivider icon={Layers} title="Content Configuration" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              >
                <option value="text">Text</option>
                <option value="link">Link</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Conditional Input for Text Type */}
          {taskType === "text" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Text Content <span className="text-orange-500">*</span>
              </label>
              <RichTextEditor
                value={taskTextContent}
                onChange={setTaskTextContent}
                placeholder="Write the lesson text students will read…"
                minHeight={220}
              />
            </div>
          )}

          {/* Conditional Input for Link Type */}
          {taskType === "link" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Link URL</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={taskLinkUrl}
                onChange={(e) => setTaskLinkUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              />
            </div>
          )}

          {/* Conditional Input for Media / Document Types */}
          {MEDIA_TYPES.includes(taskType) && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Upload {taskType} file
              </label>
              <input
                type="file"
                accept={
                  taskType === "audio"
                    ? "audio/*"
                    : taskType === "video"
                    ? "video/*"
                    : undefined
                }
                onChange={(e) => setTaskMediaFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-xl file:border-0 file:bg-orange-500 file:text-white file:text-xs file:font-bold"
              />
            </div>
          )}

          <div className="pt-2">
            <SectionDivider icon={UserCog} title="Assignment Target" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Target</label>
            <select
              value={taskTarget}
              onChange={(e) => setTaskTarget(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
            >
              <option value="all">All students enrolled in this course</option>
              <option value="selected">Selected students</option>
            </select>
          </div>

          {taskTarget === "selected" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Students ({studentIds.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-2 space-y-1">
                {students.length === 0 ? (
                  <p className="text-xs text-slate-400 p-2">No students found or loaded.</p>
                ) : (
                  students.map((s) => (
                    <label
                      key={s._id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={studentIds.includes(s._id)}
                        onChange={() => toggleStudentSelection(s._id)}
                        className="accent-orange-500"
                      />
                      <span className="font-medium text-slate-700">{s.full_name}</span>
                      <span className="text-xs text-slate-400">{s.enrollment_no}</span>
                    </label>
                  ))
                )}
              </div>
              {formErrors.student_ids && (
                <p className="text-xs mt-1 text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.student_ids}
                </p>
              )}
            </div>
          )}

          {/* Questions Setup Section */}
          <div className="space-y-4 pt-5 mt-2 border-t-2 border-dashed border-orange-100">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Questions Setup
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Quiz-style checkpoints attached to this task.
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-black shadow-md shadow-orange-500/20 border-b-2 border-orange-700 hover:shadow-lg active:scale-95 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </motion.button>
            </div>

            {questions.length === 0 && (
              <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-semibold text-slate-400">
                  No questions yet — students see just the task itself.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="bg-slate-50/75 rounded-2xl p-5 border border-slate-100 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-500 uppercase">
                      Question #{index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-rose-500 hover:text-rose-600 font-bold text-xs p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Text Field */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={q.question_text}
                      onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                      placeholder="Type question text..."
                      className="w-full rounded-xl border border-orange-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                    />
                    {formErrors[`questions[${index}].question_text`] && (
                      <p className="text-xs mt-1.5 text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors[`questions[${index}].question_text`]}
                      </p>
                    )}
                  </div>

                  {/* Correct Answer Field */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                      Correct Answer <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={q.correct_answer}
                      onChange={(e) => updateQuestion(index, "correct_answer", e.target.value)}
                      placeholder="Enter the correct answer..."
                      className="w-full rounded-xl border border-orange-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                    />
                    {formErrors[`questions[${index}].correct_answer`] && (
                      <p className="text-xs mt-1.5 text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors[`questions[${index}].correct_answer`]}
                      </p>
                    )}
                  </div>

                  {/* Solution / Answer Key Field */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                      Solution
                    </label>
                    <RichTextEditor
                      value={q.answer_key_html}
                      onChange={(html) => updateQuestion(index, "answer_key_html", html)}
                      placeholder="Model answer for this question…"
                      minHeight={120}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/student-task")}
              className="px-5 py-2.5 rounded-xl border border-orange-300 text-orange-700 bg-white font-bold text-sm hover:bg-orange-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
          <motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  type="submit"
  disabled={submitting}
  className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm shadow-lg shadow-orange-500/25 border-b-2 border-orange-700 disabled:opacity-60 disabled:pointer-events-none active:scale-95 flex items-center gap-2 transition-all"
>
  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
  {submitting
    ? editingManualId
      ? "Updating..."
      : "Creating..."
    : editingManualId
    ? "Update Task"
    : "Create Task"}
</motion.button>
          </div>
        </form>
      </motion.div>

      {/* Status Modal Component */}
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
  setTimeout(() => {
    router.push("/institute-dashboard/student-task");
  }, 100);
}
  }}
/>
    </div>
  );
}