"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import StatusModal from "@/components/molecules/StatusModal";
import {
  Plus,
  Search,
  Edit3,
  Eye,
  Trash2,
  Loader2,
  FileText,
  RefreshCw,
  Send,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { taskApi } from "@/services/task/taskApi";
import { courseApi } from "@/services/course/courseApi";
import { topicApi } from "@/services/topic/topicApi";
import ConfirmModal from "@/components/molecules/ConfirmModal";
import Pagination from "@/components/molecules/Pagination";

export default function StudentTaskPage() {
  const router = useRouter();

  // =========================
  // STATES
  // =========================
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

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
    limit: 10
  });

  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);

  // Submissions Modal State
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissionsTask, setSubmissionsTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  
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
  // FETCH LIST
  // =========================
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filterCourseId) params.courseId = filterCourseId;
      if (filterTopicId) params.topicId = filterTopicId;

      const response = await taskApi.getTasks(params);
      const result = response?.data || response;
      const data = result?.data || result;
      const list =
        data?.tasks ||
        data?.practicals ||
        data?.practicalManuals ||
        (Array.isArray(data) ? data : []);

      setTasks(list);
      setPagination({
        total: data?.total || list.length,
        page: data?.page || page,
        limit: data?.limit || limit
      });
    } catch (error) {
      console.log("Fetch tasks error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, limit, filterCourseId, filterTopicId]);

  // Course/Topic filter dropdowns
  useEffect(() => {
    courseApi
      .getCourses()
      .then((res) => {
        const allCourses = res.data?.data?.courses || [];
        setFilterCourses(allCourses.filter((course) => course.is_downloaded));
      })
      .catch((error) => console.error("Get Courses Error:", error));
  }, []);

  useEffect(() => {
    if (!filterCourseId) {
      setFilterTopics([]);
      return;
    }
    setFilterTopicsLoading(true);
    topicApi
      .getTopics(filterCourseId)
      .then((res) => setFilterTopics(res.data?.data?.topics || res.data?.data || []))
      .catch((error) => {
        console.error("Get Topics Error:", error);
        setFilterTopics([]);
      })
      .finally(() => setFilterTopicsLoading(false));
  }, [filterCourseId]);

  const handleFilterCourseChange = (id) => {
    setFilterCourseId(id);
    setFilterTopicId("");
  };

  const openViewModal = async (id) => {
    try {
      setLoading(true);
      const response = await taskApi.getTaskById(id);
      const data = response?.data || response;
      setSelectedTask(data?.data || data);
      setShowViewModal(true);
    } catch (error) {
      console.log(error);
      setStatusData({
        open: true,
        type: "error",
        title: "Error 404",
        message: "The requested task could not be found or does not exist.",
      });
    } finally {
      setLoading(false);
    }
  };

  const openSubmissionsModal = async (task) => {
    setSubmissionsTask(task);
    setShowSubmissionsModal(true);
    setSubmissionsLoading(true);
    try {
      const response = await taskApi.getSubmissions(task._id);
      const data = response?.data?.data || response?.data;
      setSubmissions(data?.submissions || []);
    } catch (error) {
      console.error("Get Task Submissions Error:", error);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId, marks, feedback) => {
    if (!submissionsTask) return;
    try {
      await taskApi.gradeSubmission(submissionsTask._id, submissionId, {
        marks: marks === "" ? undefined : Number(marks),
        feedback,
      });
      const response = await taskApi.getSubmissions(submissionsTask._id);
      const data = response?.data?.data || response?.data;
      setSubmissions(data?.submissions || []);
    } catch (error) {
      console.error("Grade Task Submission Error:", error);
    }
  };

  const handleDeleteTask = (id) => {
    setDeleteModal({
      open: true,
      id,
    });
  };

  const confirmDelete = async () => {
    try {
      await taskApi.deleteTask(deleteModal.id);

      setDeleteModal({
        open: false,
        id: null,
      });

      await fetchTasks();

      setStatusData({
        open: true,
        type: "success",
        title: "Deleted Successfully",
        message: "Task deleted successfully.",
      });

    } catch (error) {
      console.log(error);

      setDeleteModal({
        open: false,
        id: null,
      });

      setStatusData({
        open: true,
        type: "error",
        title: "Delete Failed",
        message: "Failed to delete task.",
      });
    }
  };

  const filteredTasks = tasks.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase">
            Academic Resources
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">
            Task <span className="text-orange-600">Management</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage task curriculum, modules, and assignment questions efficiently.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/institute-dashboard/student-task/create")}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/10 border-b-2 border-orange-700 active:scale-95 flex items-center gap-2 justify-center transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </motion.button>
      </div>

      {/* ================= SEARCH & FILTERS BAR ================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search task by title..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm"
          />
        </div>

        <select
          value={filterCourseId}
          onChange={(e) => handleFilterCourseChange(e.target.value)}
          className="px-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm min-w-[170px] cursor-pointer"
        >
          <option value="">All Courses</option>
          {filterCourses.map((c) => (
            <option key={c._id} value={c._id}>{c.course_name}</option>
          ))}
        </select>

        <select
          value={filterTopicId}
          onChange={(e) => setFilterTopicId(e.target.value)}
          disabled={!filterCourseId || filterTopicsLoading}
          className="px-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm min-w-[170px] cursor-pointer disabled:opacity-60"
        >
          <option value="">
            {!filterCourseId ? "Select Course First" : filterTopicsLoading ? "Loading..." : "All Topics"}
          </option>
          {filterTopics.map((t) => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>

        <button
          onClick={fetchTasks}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all active:scale-95 shadow-md shadow-slate-900/10 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Apply
        </button>
      </div>

      {/* ================= TABLE CONTAINER ================= */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 text-left pl-6">Sr. No.</th>
                <th className="p-4 text-left">Title & Attachment</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Due Date & Status</th>
                <th className="p-4 text-center">Questions</th>
                <th className="p-4 text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                  </td>
                </tr>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => {
                  const courseName =
                    typeof task.course_id === "object"
                      ? task.course_id?.course_name
                      : task.course_id;

                  return (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={task._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4 pl-6 font-bold text-slate-400">
                        {index + 1}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {task.title}
                        </div>
                        {task.attachment_url && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                            <FileText className="w-3.5 h-3.5" />
                            File Attached
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-medium text-slate-600">
                        {courseName || "-"}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md uppercase ${
                            task.status === "published" 
                              ? "bg-green-50 text-green-600" 
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {task.status || "Draft"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-bold text-xs inline-block">
                            {task.questions?.length || 0} Questions
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => router.push(`/institute-dashboard/student-task/${task._id}/add-question?mode=new`)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-[11px] font-bold"
                            >
                              + Add Q
                            </button>
                            <button
                              onClick={() => router.push(`/institute-dashboard/student-task/${task._id}/add-question`)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-[11px] font-bold"
                            >
                              Edit Q
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/institute-dashboard/student-task/view/${task._id}`)}
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View Task"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              router.push(`/institute-dashboard/student-task/submissions/${task._id}`);
                            }}
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="View Submissions"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => router.push(`/institute-dashboard/student-task/${task._id}`)}
                            className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                            title="Edit Task"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-20">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-orange-400" />
                      <p className="text-slate-600 font-semibold text-base">No tasks available for the selected course or filter criteria.</p>
                      <p className="text-slate-400 text-xs">Try selecting a different course/topic or clearing your search filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-between px-2 py-4">
            <span className="text-sm text-slate-500">
              Showing {tasks.length ? (pagination.page - 1) * pagination.limit + 1 : 0}
              –{(pagination.page - 1) * pagination.limit + tasks.length} of {pagination.total}
            </span>
            <Pagination
              page={pagination.page}
              totalPages={Math.max(1, Math.ceil(pagination.total / pagination.limit))}
              setPage={setPage}
            />
          </div>
        )}

        <StatusModal
          open={statusData.open}
          type={statusData.type}
          title={statusData.title}
          message={statusData.message}
          onClose={() =>
            setStatusData({
              open: false,
              type: "",
              title: "",
              message: "",
            })
          }
        />

        <ConfirmModal
          open={deleteModal.open}
          onClose={() =>
            setDeleteModal({
              open: false,
              id: null,
            })
          }
          onConfirm={confirmDelete}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}