"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  CheckCircle2,
  Send,
  ClipboardList,
  Users,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { taskApi } from "@/services/task/taskApi";
import { courseApi } from "@/services/course/courseApi";
import { studentApi } from "@/services/student/studentApi";
import StatusModal from "@/components/molecules/StatusModal";
import ConfirmModal from "@/components/molecules/ConfirmModal";

const MEDIA_TYPES = ["audio", "video", "document"];

export default function StudentTaskPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "create"

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [submissionsByTask, setSubmissionsByTask] = useState({});
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const [modal, setModal] = useState({ open: false, type: "success", title: "", message: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  // Form state
  const [courseId, setCourseId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskInstructions, setTaskInstructions] = useState("");
  const [taskType, setTaskType] = useState("text");
  const [taskMediaFile, setTaskMediaFile] = useState(null);
  const [taskLinkUrl, setTaskLinkUrl] = useState("");
  const [taskTextContent, setTaskTextContent] = useState("");
  const [taskTarget, setTaskTarget] = useState("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskStatus, setTaskStatus] = useState("published");

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskApi.getTasks();
      setTasks(res.data?.data?.tasks || []);
    } catch (error) {
      console.error("Get Tasks Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    courseApi
      .getCourses()
      .then((res) => setCourses(res.data?.data?.courses || []))
      .catch((error) => console.error("Get Courses Error:", error));

    studentApi
      .getStudents()
      .then((res) => setStudents(res.data?.data?.students || []))
      .catch((error) => console.error("Get Students Error:", error));
  }, []);

  const resetForm = () => {
    setCourseId("");
    setTaskTitle("");
    setTaskDescription("");
    setTaskInstructions("");
    setTaskType("text");
    setTaskMediaFile(null);
    setTaskLinkUrl("");
    setTaskTextContent("");
    setTaskTarget("all");
    setSelectedStudentIds([]);
    setTaskDueDate("");
    setTaskStatus("published");
  };

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !courseId) return;
    if (MEDIA_TYPES.includes(taskType) && !taskMediaFile) {
      setModal({
        open: true,
        type: "error",
        title: "File required",
        message: `Please attach a file — task type "${taskType}" requires a media upload.`,
      });
      return;
    }
    if (taskTarget === "selected" && selectedStudentIds.length === 0) {
      setModal({
        open: true,
        type: "error",
        title: "Select students",
        message: "Pick at least one student when target is \"Selected\".",
      });
      return;
    }

    const formData = new FormData();
    formData.append("course_id", courseId);
    formData.append("title", taskTitle);
    if (taskDescription) formData.append("description", taskDescription);
    if (taskInstructions) formData.append("instructions", taskInstructions);
    formData.append("type", taskType);
    formData.append("target", taskTarget);
    if (taskDueDate) formData.append("due_date", taskDueDate);
    formData.append("status", taskStatus);

    if (taskType === "link") formData.append("link_url", taskLinkUrl);
    if (taskType === "text") formData.append("text_content", taskTextContent);
    if (MEDIA_TYPES.includes(taskType)) formData.append("taskMedia", taskMediaFile);
    if (taskTarget === "selected") {
      selectedStudentIds.forEach((id) => formData.append("student_ids", id));
    }

    try {
      setSaving(true);
      await taskApi.createTask(formData);
      setModal({
        open: true,
        type: "success",
        title: "Task created",
        message: `"${taskTitle}" has been published.`,
      });
      resetForm();
      setActiveTab("tasks");
      loadTasks();
    } catch (error) {
      console.error("Create Task Error:", error);
      setModal({
        open: true,
        type: "error",
        title: "Failed to create task",
        message: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteModal.id) return;
    try {
      await taskApi.deleteTask(deleteModal.id);
      setTasks((prev) => prev.filter((t) => t._id !== deleteModal.id));
    } catch (error) {
      console.error("Delete Task Error:", error);
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const toggleSubmissions = async (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      return;
    }
    setExpandedTaskId(taskId);
    if (submissionsByTask[taskId]) return;

    try {
      setSubmissionsLoading(true);
      const res = await taskApi.getSubmissions(taskId);
      setSubmissionsByTask((prev) => ({
        ...prev,
        [taskId]: res.data?.data?.submissions || [],
      }));
    } catch (error) {
      console.error("Get Submissions Error:", error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGrade = async (taskId, submissionId, grade, feedback) => {
    try {
      await taskApi.gradeSubmission(taskId, submissionId, {
        status: "reviewed",
        grade: grade === "" ? undefined : Number(grade),
        feedback,
      });
      const res = await taskApi.getSubmissions(taskId);
      setSubmissionsByTask((prev) => ({
        ...prev,
        [taskId]: res.data?.data?.submissions || [],
      }));
    } catch (error) {
      console.error("Grade Submission Error:", error);
    }
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.course_id?.course_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="relative min-h-screen p-8 space-y-8 overflow-hidden font-sans">

      {/* Background Theme Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/60 via-emerald-50/40 to-teal-100/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-teal-400/10 to-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-green-400/10 to-teal-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#0d9488_1px,transparent_1px),linear-gradient(to_bottom,#0d9488_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                Institute Management Portal
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Task Module Management
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              activeTab === "tasks"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-teal-500/25"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Active Tasks ({tasks.length})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeTab === "create"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-teal-500/25"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Plus className="w-4 h-4" /> Create Task
          </motion.button>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "tasks" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                Task Collection View
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <motion.div
                      key={task._id}
                      whileHover={{ y: -3 }}
                      className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-xl border border-teal-200">
                            {task.course_id?.course_name || "Course"}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />{" "}
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-slate-900">{task.title}</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <Users className="w-3.5 h-3.5 text-teal-600" /> Target: {task.target}
                        </div>

                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {task.description || "No description provided."}
                          </p>
                          <div className="text-[11px] text-teal-900 bg-teal-50/60 p-2 rounded-xl border border-teal-100 flex flex-col gap-1">
                            <span><strong>Type:</strong> {task.type}</span>
                            {task.type === "text" && <span><strong>Content:</strong> {task.text_content}</span>}
                            {task.type === "link" && (
                              <span className="truncate"><strong>Link:</strong> {task.link_url}</span>
                            )}
                            {MEDIA_TYPES.includes(task.type) && (
                              <span className="truncate"><strong>Media:</strong> {task.media_url}</span>
                            )}
                            <span><strong>Status:</strong> {task.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                          <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                          {task.assigned_count ?? 0} Assigned · {task.submitted_count ?? 0} Submitted
                        </span>

                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleSubmissions(task._id)}
                            className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" /> Submissions
                            {expandedTaskId === task._id ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteModal({ open: true, id: task._id })}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedTaskId === task._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 border-t border-slate-100 space-y-2">
                              {submissionsLoading && !submissionsByTask[task._id] ? (
                                <div className="py-6 flex justify-center text-slate-400">
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                              ) : (submissionsByTask[task._id] || []).length === 0 ? (
                                <p className="text-xs text-slate-400 py-3 text-center">
                                  No submissions yet.
                                </p>
                              ) : (
                                (submissionsByTask[task._id] || []).map((sub) => (
                                  <SubmissionRow
                                    key={sub._id}
                                    submission={sub}
                                    onGrade={(grade, feedback) =>
                                      handleGrade(task._id, sub._id, grade, feedback)
                                    }
                                  />
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 py-16 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
                    <p className="text-slate-400 text-sm font-semibold">No tasks found matching query parameters.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">Create Task</h2>
              <p className="text-xs text-slate-500 mt-0.5">Assign audio, video, document, link, or text tasks to a course or specific students.</p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Course</label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="" disabled>Select course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.course_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Record a 2-minute self-introduction"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional description shown to students."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Optional step-by-step instructions."
                  value={taskInstructions}
                  onChange={(e) => setTaskInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="text">Text</option>
                    <option value="link">Link</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {taskType === "text" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Text Content</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter text content..."
                    value={taskTextContent}
                    onChange={(e) => setTaskTextContent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              {taskType === "link" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Link URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={taskLinkUrl}
                    onChange={(e) => setTaskLinkUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              {MEDIA_TYPES.includes(taskType) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Upload {taskType} file
                  </label>
                  <input
                    type="file"
                    accept={
                      taskType === "audio" ? "audio/*" : taskType === "video" ? "video/*" : undefined
                    }
                    onChange={(e) => setTaskMediaFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 file:mr-3 file:px-3 file:py-1.5 file:rounded-xl file:border-0 file:bg-teal-600 file:text-white file:text-xs file:font-bold"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target</label>
                <select
                  value={taskTarget}
                  onChange={(e) => setTaskTarget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="all">All students enrolled in this course</option>
                  <option value="selected">Selected students</option>
                </select>
              </div>

              {taskTarget === "selected" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Students ({selectedStudentIds.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-2 space-y-1">
                    {students.length === 0 ? (
                      <p className="text-xs text-slate-400 p-2">No students found.</p>
                    ) : (
                      students.map((s) => (
                        <label
                          key={s._id}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(s._id)}
                            onChange={() => toggleStudentSelection(s._id)}
                            className="accent-teal-600"
                          />
                          <span className="font-medium text-slate-700">
                            {s.full_name}
                          </span>
                          <span className="text-xs text-slate-400">{s.enrollment_no}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-sm shadow-lg shadow-teal-500/25 disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Publishing..." : "Save Task"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <StatusModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Delete this task?"
        message="This soft-deletes the task — past submissions stay on record."
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}

function SubmissionRow({ submission, onGrade }) {
  const [grade, setGrade] = useState(submission.grade ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");

  return (
    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">
          {submission.student_id?.full_name || "Unknown student"}
        </p>
        <p className="text-xs text-slate-400">
          {submission.student_id?.enrollment_no} ·{" "}
          <span className="font-semibold text-slate-500">{submission.status}</span>
        </p>
      </div>
      <input
        type="number"
        placeholder="Grade"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
      />
      <input
        type="text"
        placeholder="Feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
      />
      <button
        type="button"
        onClick={() => onGrade(grade, feedback)}
        className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center gap-1 shrink-0"
      >
        <CheckCircle2 className="w-3.5 h-3.5" /> Save
      </button>
    </div>
  );
}
