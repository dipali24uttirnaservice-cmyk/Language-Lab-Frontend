"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AudioWaveform,
  Plus,
  Search,
  Edit3,
  Eye,
  Trash2,
  Loader2,
  RefreshCw,
  Send,
  Calendar,
  AlertCircle,
  Users,
  Volume2,
  VolumeX,
  CheckCircle2,
  X,
  BookOpen,
  Layers,
  Award,
  Clock,
  Mic,
} from "lucide-react";

import { courseApi } from "@/services/course/courseApi";
import { topicApi } from "@/services/topic/topicApi";
import { interactiveLearningApi } from "@/services/interactiveLearning/interactiveLearningApi";
import StatusModal from "@/app/components/molecules/StatusModal";
import ConfirmModal from "@/app/components/molecules/ConfirmModal";
import Pagination from "@/app/components/molecules/Pagination";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";

export default function InteractiveLearningPage() {
  const router = useRouter();
  const { user: authUser, role: authRole } = useAuth();
  const currentRole = authRole || Cookies.get("role") || "institute";
  const isFaculty = currentRole === "faculty";

  // =========================
  // STATES
  // =========================
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterTopicId, setFilterTopicId] = useState("");
  const [filterCourses, setFilterCourses] = useState([]);
  const [filterTopics, setFilterTopics] = useState([]);
  const [filterTopicsLoading, setFilterTopicsLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });

  // Create / Edit Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formCourses, setFormCourses] = useState([]);
  const [formTopics, setFormTopics] = useState([]);
  const [formTopicsLoading, setFormTopicsLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    topic_id: "",
    title: "",
    paragraph: "",
    max_retries: 3,
    target_wpm: 120,
    min_accuracy: 75,
  });

  // TTS Preview State inside Form
  const [isSpeakingPreview, setIsSpeakingPreview] = useState(false);

  // View Task Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Assign Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTask, setAssigningTask] = useState(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [assignData, setAssignData] = useState({
    department: "",
    batch: "",
  });

  // Submissions Modal State
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissionsTask, setSubmissionsTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Delete & Status Modals
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
  });
  const [statusData, setStatusData] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
  });

  // =========================
  // FETCH TASKS LIST
  // =========================
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filterCourseId) params.courseId = filterCourseId;
      if (filterTopicId) params.topicId = filterTopicId;

      const response = await interactiveLearningApi.getTasks(params);
      const result = response?.data || response;
      const data = result?.data || result;
      const list = data?.tasks || (Array.isArray(data) ? data : []);

      setTasks(list);
      setPagination({
        total: data?.total || list.length,
        page: data?.page || page,
        limit: data?.limit || limit,
      });
    } catch (error) {
      console.log("[InteractiveTasks] Fetch error:", error);
      // Fallback empty list on error (e.g. before backend endpoint is connected)
      setTasks([]);
      setPagination({ total: 0, page: 1, limit });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, limit, filterCourseId, filterTopicId]);

  // =========================
  // FETCH COURSES (FOR FILTERS & FORM)
  // =========================
  useEffect(() => {
    courseApi
      .getCourses()
      .then((res) => {
        const allCourses = res.data?.data?.courses || [];
        const activeCourses = allCourses.filter((course) => course.is_downloaded);
        setFilterCourses(activeCourses);
        setFormCourses(activeCourses);
      })
      .catch((error) => console.error("Get Courses Error:", error));
  }, []);

  // Fetch topics for filter dropdown
  useEffect(() => {
    if (!filterCourseId) {
      setFilterTopics([]);
      setFilterTopicId("");
      return;
    }
    setFilterTopicsLoading(true);
    topicApi
      .getTopics(filterCourseId)
      .then((res) => {
        setFilterTopics(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Filter topics fetch error:", err);
        setFilterTopics([]);
      })
      .finally(() => setFilterTopicsLoading(false));
  }, [filterCourseId]);

  // Fetch topics for create/edit form
  useEffect(() => {
    if (!formData.course_id) {
      setFormTopics([]);
      return;
    }
    setFormTopicsLoading(true);
    topicApi
      .getTopics(formData.course_id)
      .then((res) => {
        setFormTopics(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Form topics fetch error:", err);
        setFormTopics([]);
      })
      .finally(() => setFormTopicsLoading(false));
  }, [formData.course_id]);

  // =========================
  // TTS PREVIEW (BROWSER SPEECH SYNTHESIS)
  // =========================
  const handleTogglePreviewTTS = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeakingPreview) {
      window.speechSynthesis.cancel();
      setIsSpeakingPreview(false);
      return;
    }

    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Clear speaking pace
    utterance.lang = "en-IN"; // English (Indian accent preference)

    utterance.onend = () => setIsSpeakingPreview(false);
    utterance.onerror = () => setIsSpeakingPreview(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeakingPreview(true);
  };

  // Stop TTS when closing modals
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // =========================
  // CREATE / EDIT HANDLER
  // =========================
  const handleOpenCreateModal = () => {
    router.push("/institute-dashboard/interactive-learning/create");
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      course_id: task.course_id?._id || task.course_id || "",
      topic_id: task.topic_id?._id || task.topic_id || "",
      title: task.title || "",
      paragraph: task.paragraph || "",
      max_retries: task.max_retries || 3,
      target_wpm: task.target_wpm || 120,
      min_accuracy: task.min_accuracy || 75,
    });
    setShowFormModal(true);
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setStatusData({
        open: true,
        type: "error",
        title: "Title Required",
        message: "Please enter a task title.",
      });
      return;
    }
    if (!formData.course_id) {
      setStatusData({
        open: true,
        type: "error",
        title: "Course Required",
        message: "Please select a course.",
      });
      return;
    }
    if (!formData.topic_id) {
      setStatusData({
        open: true,
        type: "error",
        title: "Topic Required",
        message: "Please select a topic.",
      });
      return;
    }
    if (!formData.paragraph.trim()) {
      setStatusData({
        open: true,
        type: "error",
        title: "Paragraph Required",
        message: "Please enter the target reading paragraph.",
      });
      return;
    }

    if (wordCount > 100) {
      setStatusData({
        open: true,
        type: "error",
        title: "Paragraph Word Limit Exceeded",
        message: `The paragraph cannot exceed 100 words. It currently contains ${wordCount} words. Please shorten it by ${wordCount - 100} word(s) before saving.`,
      });
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingTask?._id) {
        await interactiveLearningApi.updateTask(editingTask._id, formData);
        setStatusData({
          open: true,
          type: "success",
          title: "Task Updated",
          message: "Interactive learning task updated successfully.",
        });
      } else {
        await interactiveLearningApi.createTask(formData);
        setStatusData({
          open: true,
          type: "success",
          title: "Task Created",
          message: "New interactive speech task created successfully.",
        });
      }

      setShowFormModal(false);
      fetchTasks();
    } catch (error) {
      console.error("Save task error:", error);
      setStatusData({
        open: true,
        type: "error",
        title: "Save Failed",
        message:
          error?.response?.data?.message ||
          "Failed to save the interactive task. Please verify your connection.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // =========================
  // ASSIGN MODAL & HANDLERS
  // =========================
  const handleOpenAssignModal = async (task) => {
    setAssigningTask(task);
    setAssignData({ department: "", batch: "" });
    setShowAssignModal(true);
    try {
      setDepartmentsLoading(true);
      const res = await interactiveLearningApi.getDepartments();
      const list = res.data?.data || res.data || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch departments error:", err);
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!assignData.department) {
      setStatusData({
        open: true,
        type: "error",
        title: "Department Required",
        message: "Please select a target department.",
      });
      return;
    }

    try {
      setAssignSubmitting(true);
      await interactiveLearningApi.assignTask(assigningTask._id, {
        department: assignData.department,
        batch: assignData.batch ? Number(assignData.batch) : null,
      });

      setStatusData({
        open: true,
        type: "success",
        title: "Task Assigned",
        message: `Task successfully assigned to ${assignData.department}${assignData.batch ? ` (Year ${assignData.batch})` : ""
          }.`,
      });
      setShowAssignModal(false);
      fetchTasks();
    } catch (error) {
      console.error("Assign error:", error);
      setStatusData({
        open: true,
        type: "error",
        title: "Assignment Failed",
        message:
          error?.response?.data?.message ||
          "Could not assign task. Please verify faculty permissions.",
      });
    } finally {
      setAssignSubmitting(false);
    }
  };

  // =========================
  // SUBMISSIONS MODAL & HANDLERS
  // =========================
  const handleOpenSubmissionsModal = async (task) => {
    setSubmissionsTask(task);
    setShowSubmissionsModal(true);
    setSubmissionsLoading(true);
    try {
      const res = await interactiveLearningApi.getSubmissions(task._id);
      const list = res.data?.data?.submissions || res.data?.data || [];
      setSubmissions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Fetch submissions error:", error);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // =========================
  // DELETE HANDLER
  // =========================
  const handleDeleteTask = async () => {
    if (!deleteModal.id) return;
    try {
      await interactiveLearningApi.deleteTask(deleteModal.id);
      setDeleteModal({ open: false, id: null });
      setStatusData({
        open: true,
        type: "success",
        title: "Task Deleted",
        message: "Interactive learning task removed successfully.",
      });
      fetchTasks();
    } catch (error) {
      console.error("Delete task error:", error);
      setDeleteModal({ open: false, id: null });
      setStatusData({
        open: true,
        type: "error",
        title: "Delete Failed",
        message:
          error?.response?.data?.message ||
          "Could not delete this task. Please try again.",
      });
    }
  };

  // Word count & estimate for form
  const wordCount = useMemo(() => {
    if (!formData.paragraph) return 0;
    return formData.paragraph.trim().split(/\s+/).filter(Boolean).length;
  }, [formData.paragraph]);

  const estimatedReadingTime = useMemo(() => {
    if (wordCount === 0) return 0;
    const wpm = formData.target_wpm || 120;
    return Math.ceil((wordCount / wpm) * 60); // seconds
  }, [wordCount, formData.target_wpm]);

  // Filter tasks client-side by search query if any
  const filteredTasks = tasks.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(q);
    const paragraphMatch = item.paragraph?.toLowerCase().includes(q);
    const courseMatch = item.course_id?.title?.toLowerCase().includes(q);
    const topicMatch = item.topic_id?.title?.toLowerCase().includes(q);
    return titleMatch || paragraphMatch || courseMatch || topicMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase inline-flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-orange-600" />
            Speech & Pronunciation Lab
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">
            Interactive Learning{" "}
            <span className="text-orange-600">Management</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create, assign, and track speech-to-text reading paragraph tasks powered by Vosk.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/10 border-b-2 border-orange-700 active:scale-95 flex items-center gap-2 justify-center transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Reading Task
        </motion.button>
      </div>

      {/* ================= SEARCH & FILTERS BAR ================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex gap-4 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search task title, paragraph or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Filter Course */}
        <div className="min-w-[200px]">
          <select
            value={filterCourseId}
            onChange={(e) => {
              setFilterCourseId(e.target.value);
              setFilterTopicId("");
              setPage(1);
            }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-700"
          >
            <option value="">All Courses</option>
            {filterCourses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.course_name || c.title || c.name || "Course"}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Topic */}
        <div className="min-w-[200px]">
          <select
            value={filterTopicId}
            onChange={(e) => {
              setFilterTopicId(e.target.value);
              setPage(1);
            }}
            disabled={!filterCourseId || filterTopicsLoading}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {filterTopicsLoading
                ? "Loading topics..."
                : !filterCourseId
                  ? "Select a Course First"
                  : "All Topics"}
            </option>
            {filterTopics.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchTasks}
          title="Refresh List"
          className="p-2.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ================= DATA TABLE ================= */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
            <p className="text-sm font-bold text-slate-500">
              Loading interactive reading tasks...
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
              <AudioWaveform className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                No Interactive Tasks Found
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery || filterCourseId
                  ? "No tasks match your current filter settings."
                  : "Get started by creating your first paragraph reading task with speech-to-text evaluation."}
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Task Title & Details</th>
                  <th className="py-4 px-6">Course & Topic</th>
                  <th className="py-4 px-6">Paragraph Snippet</th>
                  <th className="py-4 px-6 text-center">Retries</th>
                  <th className="py-4 px-6 text-center">Assigned Scope</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {filteredTasks.map((task) => {
                  const courseTitle =
                    task.course_id?.course_name ||
                    task.course_id?.title ||
                    task.course_title ||
                    "Course";
                  const topicTitle =
                    task.topic_id?.title || task.topic_title || "Topic";
                  const snippet =
                    task.paragraph?.length > 80
                      ? task.paragraph.slice(0, 80) + "..."
                      : task.paragraph;

                  return (
                    <tr
                      key={task._id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Title & Stats */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                            <AudioWaveform className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                Min {task.min_accuracy || 75}%
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {task.target_wpm || 120} WPM
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Course & Topic */}
                      <td className="py-4 px-6">
                        <p className="text-slate-800 font-bold truncate max-w-[180px]">
                          {courseTitle}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold truncate max-w-[180px] mt-0.5">
                          {topicTitle}
                        </p>
                      </td>

                      {/* Paragraph Snippet */}
                      <td className="py-4 px-6 max-w-[280px]">
                        <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">
                          "{snippet}"
                        </p>
                      </td>

                      {/* Retries */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                          {task.max_retries || 3}
                        </span>
                      </td>

                      {/* Assigned Scope */}
                      <td className="py-4 px-6 text-center">
                        {task.assigned_department ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {task.assigned_department}
                            {task.assigned_batch
                              ? ` - Y${task.assigned_batch}`
                              : ""}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/institute-dashboard/interactive-learning/assign/${task._id}`
                              )
                            }
                            className="p-2.5 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors cursor-pointer"
                            title="Assign Task"
                            aria-label="Assign Task"
                          >
                            <Users className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowViewModal(true);
                            }}
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="View Task"
                            aria-label="View Task"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenSubmissionsModal(task)}
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="View Submissions"
                            aria-label="View Submissions"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer"
                            title="Edit Task"
                            aria-label="Edit Task"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              setDeleteModal({ open: true, id: task._id })
                            }
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Delete Task"
                            aria-label="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > limit && (
          <div className="p-4 border-t border-slate-100 flex justify-end">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(pagination.total / limit)}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* =========================================================
          CREATE / EDIT TASK MODAL
      ========================================================= */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {editingTask ? "Edit Reading Task" : "Add New Reading Task"}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Configure target paragraph, Vosk speech model, and retry rules.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-5">
                {/* Task Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Passage 1: Self Introduction & Fluency"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-800"
                  />
                </div>

                {/* Course & Topic Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Course *
                    </label>
                    <select
                      required
                      value={formData.course_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          course_id: e.target.value,
                          topic_id: "",
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-800 cursor-pointer"
                    >
                      <option value="">Select Course</option>
                      {formCourses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.course_name || c.title || c.name || "Course"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Topic *
                    </label>
                    <select
                      required
                      value={formData.topic_id}
                      onChange={(e) =>
                        setFormData({ ...formData, topic_id: e.target.value })
                      }
                      disabled={!formData.course_id || formTopicsLoading}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-800 cursor-pointer disabled:opacity-50"
                    >
                      <option value="">
                        {formTopicsLoading
                          ? "Loading topics..."
                          : !formData.course_id
                            ? "Choose Course First"
                            : "Select Topic"}
                      </option>
                      {formTopics.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Paragraph Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Target Reading Paragraph *
                      </label>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Max 100 words
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePreviewTTS(formData.paragraph)}
                      disabled={!formData.paragraph.trim()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60 disabled:opacity-50 cursor-pointer transition-all"
                    >
                      {isSpeakingPreview ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" /> Stop Voice
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" /> Listen Reference
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    required
                    rows={5}
                    placeholder="Enter or paste the paragraph text that the student will read into their microphone (maximum 100 words)..."
                    value={formData.paragraph}
                    onChange={(e) =>
                      setFormData({ ...formData, paragraph: e.target.value })
                    }
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800 leading-relaxed resize-none ${wordCount > 100
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/20"
                        : "border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      }`}
                  />

                  {/* Paragraph Stats Bar */}
                  <div className="flex flex-wrap items-center justify-between text-xs mt-1.5 px-1 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">
                        Word Count:{" "}
                        <strong
                          className={`font-black ${wordCount > 100
                              ? "text-rose-600"
                              : wordCount > 85
                                ? "text-amber-600"
                                : "text-slate-700"
                            }`}
                        >
                          {wordCount} / 100 words
                        </strong>
                      </span>
                      {wordCount > 100 && (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          Exceeds limit by {wordCount - 100} word{wordCount - 100 > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400">
                      Estimated Reading Time:{" "}
                      <strong className="text-slate-700 font-bold">
                        ~{estimatedReadingTime}s
                      </strong>{" "}
                      (@ {formData.target_wpm || 120} WPM)
                    </span>
                  </div>
                </div>

                {/* Retry Limits, Target WPM, Min Accuracy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Retry Limits Dropdown (1 to 5 options as requested) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Allowed Retries *
                    </label>
                    <select
                      value={formData.max_retries}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_retries: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                      <option value={1}>1 Attempt (No Retries)</option>
                      <option value={2}>2 Attempts (1 Retry)</option>
                      <option value={3}>3 Attempts (2 Retries)</option>
                      <option value={4}>4 Attempts (3 Retries)</option>
                      <option value={5}>5 Attempts (4 Retries)</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Options range from 1 to 5 attempts.
                    </p>
                  </div>

                  {/* Target WPM */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Target WPM
                    </label>
                    <input
                      type="number"
                      min={60}
                      max={250}
                      value={formData.target_wpm}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_wpm: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Ideal reading rate (default: 120).
                    </p>
                  </div>

                  {/* Min Passing Accuracy */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Passing Accuracy %
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={100}
                      value={formData.min_accuracy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_accuracy: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Target pronunciation score (default: 75%).
                    </p>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting || wordCount > 100}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formSubmitting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {formSubmitting
                      ? "Saving..."
                      : wordCount > 100
                        ? "Word Limit Exceeded (Max 100)"
                        : editingTask
                          ? "Update Task"
                          : "Save Reading Task"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          VIEW TASK DETAILS MODAL
      ========================================================= */}
      <AnimatePresence>
        {showViewModal && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-orange-600 uppercase">
                    Task Specification
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    {selectedTask.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Paragraph Display with Speaker Button */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Target Paragraph
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      handleTogglePreviewTTS(selectedTask.paragraph)
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg border border-orange-200 transition-all"
                  >
                    {isSpeakingPreview ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" /> Stop Audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" /> Listen Pronunciation
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-sm text-slate-800 leading-relaxed font-serif">
                  {selectedTask.paragraph}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    Allowed Retries
                  </p>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    {selectedTask.max_retries || 3}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    Target WPM
                  </p>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    {selectedTask.target_wpm || 120}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">
                    Passing Score
                  </p>
                  <p className="text-lg font-black text-orange-600 mt-1">
                    {selectedTask.min_accuracy || 75}%
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          ASSIGN TASK MODAL
      ========================================================= */}
      <AnimatePresence>
        {showAssignModal && assigningTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Assign Reading Task
                    </h3>
                    <p className="text-xs text-slate-400 font-medium truncate max-w-[280px]">
                      {assigningTask.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {departmentsLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
                  <p className="text-xs text-slate-500 font-bold">
                    Loading assigned branches & batches...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveAssign} className="space-y-4">
                  {/* Role Scope Notice */}
                  {isFaculty && (
                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        As faculty, you are only authorized to assign tasks to
                        branches and batches explicitly assigned to you.
                      </span>
                    </div>
                  )}

                  {/* Branch / Department Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Target Branch / Department *
                    </label>
                    <select
                      required
                      value={assignData.department}
                      onChange={(e) =>
                        setAssignData({
                          ...assignData,
                          department: e.target.value,
                          batch: "",
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option
                          key={dept.name || dept}
                          value={dept.name || dept}
                        >
                          {dept.name || dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Batch / Year Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Target Batch / Year (Optional)
                    </label>
                    <select
                      value={assignData.batch}
                      onChange={(e) =>
                        setAssignData({ ...assignData, batch: e.target.value })
                      }
                      disabled={!assignData.department}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="">All Batches / Years</option>
                      {(() => {
                        const selectedDept = departments.find(
                          (d) => (d.name || d) === assignData.department
                        );
                        const batches = selectedDept?.batches || [1, 2, 3, 4];
                        return batches.map((b) => {
                          const yearVal = typeof b === "object" ? b.year : b;
                          return (
                            <option key={yearVal} value={yearVal}>
                              Year / Batch {yearVal}
                            </option>
                          );
                        });
                      })()}
                    </select>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={assignSubmitting}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {assignSubmitting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Confirm Assignment
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          STUDENT SUBMISSIONS & RESULTS MODAL
      ========================================================= */}
      <AnimatePresence>
        {showSubmissionsModal && submissionsTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full border border-slate-100 shadow-2xl space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Student Speech Submissions
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Task: {submissionsTask.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubmissionsModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submissionsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
                  <p className="text-xs text-slate-500 font-bold">
                    Loading student voice attempts...
                  </p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-700">
                    No Submissions Yet
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Students enrolled in the assigned batch will appear here once
                    they complete and save their speech attempt.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4 text-center">Accuracy</th>
                        <th className="py-3 px-4 text-center">Reading WPM</th>
                        <th className="py-3 px-4 text-center">Attempts Used</th>
                        <th className="py-3 px-4">Audio Playback</th>
                        <th className="py-3 px-4 text-right">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submissions.map((sub, idx) => (
                        <tr key={sub._id || idx} className="hover:bg-slate-50">
                          {/* Student Name & Roll */}
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {sub.student_id?.name || "Student"}
                            <span className="block text-xs text-slate-400 font-normal">
                              {sub.student_id?.roll_no ||
                                sub.student_id?.enrollment_no ||
                                "PRN"}
                            </span>
                          </td>

                          {/* Accuracy Score */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold text-xs ${(sub.accuracy_score || 0) >=
                                  (submissionsTask.min_accuracy || 75)
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                                }`}
                            >
                              {sub.accuracy_score || 0}%
                            </span>
                          </td>

                          {/* WPM */}
                          <td className="py-3 px-4 text-center font-bold text-slate-700">
                            {sub.wpm || sub.reading_speed || "--"} WPM
                          </td>

                          {/* Attempts */}
                          <td className="py-3 px-4 text-center text-xs font-semibold text-slate-600">
                            {sub.attempts_count || 1} /{" "}
                            {submissionsTask.max_retries || 3}
                          </td>

                          {/* Audio Player */}
                          <td className="py-3 px-4">
                            {sub.audio_url ? (
                              <audio
                                controls
                                src={sub.audio_url}
                                className="h-8 w-44"
                              />
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                No audio recorded
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-right text-xs text-slate-400">
                            {sub.createdAt
                              ? new Date(sub.createdAt).toLocaleDateString()
                              : "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowSubmissionsModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          GLOBAL CONFIRM & STATUS MODALS
      ========================================================= */}
      <ConfirmModal
        open={deleteModal.open}
        title="Delete Reading Task"
        message="Are you sure you want to delete this interactive reading task? This action cannot be undone."
        onConfirm={handleDeleteTask}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={() =>
          setStatusData({ open: false, type: "", title: "", message: "" })
        }
      />
    </div>
  );
}
