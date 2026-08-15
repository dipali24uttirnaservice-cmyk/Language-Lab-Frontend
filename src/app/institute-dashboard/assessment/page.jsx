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
  Users,
} from "lucide-react";

import {
  practicalManualList,
  practicalManualDetail,
  deletePracticalManual,
} from "@/services/practical-Manual/page.jsx";
import { courseApi } from "@/services/course/courseApi";
import { topicApi } from "@/services/topic/topicApi";
import ConfirmModal from "@/components/molecules/ConfirmModal";
import Pagination from "@/components/molecules/Pagination";

export default function AssessmentPage() {
  const router = useRouter();

  // =========================
  // STATES
  // =========================
  const [manuals, setManuals] = useState([]);
  const [selectedManual, setSelectedManual] = useState(null);
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
    limit: 10,
  });

  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);

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
  const fetchManuals = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filterCourseId) params.courseId = filterCourseId;
      if (filterTopicId) params.topicId = filterTopicId;

      const response = await practicalManualList(params);
      const result = response?.data || response;
      const data = result?.data || result;
      const list =
        data?.practicals ||
        data?.practicalManuals ||
        (Array.isArray(data) ? data : []);

      setManuals(list);
      setPagination({
        total: data?.total || list.length,
        page: data?.page || page,
        limit: data?.limit || limit,
      });
    } catch (error) {
      console.log("Fetch practical error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManuals();
  }, [page, limit]);

  // Course/Topic filter dropdowns — same source as the create/edit form.
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
      .then((res) =>
        setFilterTopics(res.data?.data?.topics || res.data?.data || []),
      )
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
      const response = await practicalManualDetail(id);
      const data = response?.data || response;
      setSelectedManual(data?.data || data);
      setShowViewModal(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManual = (id) => {
    setDeleteModal({
      open: true,
      id,
    });
  };

  const confirmDelete = async () => {
    try {
      await deletePracticalManual(deleteModal.id);

      setDeleteModal({
        open: false,
        id: null,
      });

      await fetchManuals();

      setStatusData({
        open: true,
        type: "success",
        title: "Deleted Successfully",
        message: "Practical manual deleted successfully.",
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
        message: "Failed to delete practical manual.",
      });
    }
  };

  const filteredManuals = manuals.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

const handleAssignManual = (id) => {
  router.push(`/institute-dashboard/practical-manual/assign/${id}`);
};

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase">
            Academic Resources
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">
            Assessment <span className="text-orange-600">Management</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage practical curriculum, modules, and assignment questions
            efficiently.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            router.push("/institute-dashboard/assessment/create")
          }
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/10 border-b-2 border-orange-700 active:scale-95 flex items-center gap-2 justify-center transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Assessment
        </motion.button>
      </div>

      {/* ================= SEARCH & FILTERS BAR ================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manual by title..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm"
          />
        </div>

        <select
          value={filterCourseId}
          onChange={(e) => handleFilterCourseChange(e.target.value)}
          className="px-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm min-w-42.5 cursor-pointer"
        >
          <option value="">All Courses</option>
          {filterCourses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.course_name}
            </option>
          ))}
        </select>

        <select
          value={filterTopicId}
          onChange={(e) => setFilterTopicId(e.target.value)}
          disabled={!filterCourseId || filterTopicsLoading}
          className="px-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm min-w-42.5 cursor-pointer disabled:opacity-60"
        >
          <option value="">
            {!filterCourseId
              ? "All Topics"
              : filterTopicsLoading
                ? "Loading..."
                : "All Topics"}
          </option>
          {filterTopics.map((t) => (
            <option key={t._id} value={t._id}>
              {t.title}
            </option>
          ))}
        </select>

        <button
          onClick={fetchManuals}
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
                <th className="p-4 text-left">Topic</th>
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
              ) : filteredManuals.length > 0 ? (
                filteredManuals.map((manual, index) => {
                  const courseName =
                    typeof manual.course_id === "object"
                      ? manual.course_id?.course_name
                      : manual.course_id;

                  const topicName =
                    typeof manual.topic_id === "object"
                      ? manual.topic_id?.title
                      : manual.topic_id;

                  return (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={manual._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4 pl-6 font-bold text-slate-400">
                        {index + 1}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {manual.title}
                        </div>
                        {manual.attachment_url && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                            <FileText className="w-3.5 h-3.5" />
                            File Attached
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-medium text-slate-600">
                        {courseName || "-"}
                      </td>

                      <td className="p-4 font-medium text-slate-600">
                        {topicName || "-"}
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-bold text-xs inline-block">
                          {manual.questions?.length || 0} Questions
                        </span>
                      </td>

                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                       <button
  type="button"
  onClick={() => handleAssignManual(manual._id)}
  className="p-2.5 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
  title="Assign Manual"
>
  <Users className="w-4 h-4" />
</button>
                          <button
                            onClick={() =>
                              router.push(
                                `/institute-dashboard/practical-manual/view/${manual._id}`,
                              )
                            }
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View Manual"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              router.push(
                                `/institute-dashboard/practical-manual/submissions/${manual._id}`,
                              )
                            }
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="View Submissions"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              router.push(
                                `/institute-dashboard/practical-manual/${manual._id}`,
                              )
                            }
                            className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                            title="Edit Manual"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteManual(manual._id)}
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Manual"
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
                  <td
                    colSpan="6"
                    className="text-center py-20 text-slate-400 font-medium"
                  >
                    No practical manuals found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-between px-2 py-4">
            <span className="text-sm text-slate-500">
              Showing {manuals.length ? (pagination.page - 1) * pagination.limit + 1 : 0}
              –{(pagination.page - 1) * pagination.limit + manuals.length} of {pagination.total}
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
          title="Delete Practical Manual"
          message="Are you sure you want to delete this practical manual?"
          confirmText="Delete"
          cancelText="Cancel"
        />

       
      </div>
    </div>
  );
}
