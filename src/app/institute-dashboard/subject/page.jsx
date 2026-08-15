"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit3,
  Eye,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  BookOpen,
} from "lucide-react";

import { subjectApi } from "@/services/subject/subjectApi";

import StatusModal from "@/components/molecules/StatusModal";
import ConfirmModal from "@/components/molecules/ConfirmModal";

export default function SubjectPage() {
  const router = useRouter();

  // =====================================================
  // STATE
  // =====================================================

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // View modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
  });

  // Status modal
  const [statusData, setStatusData] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
  });

  // =====================================================
  // GET SUBJECT LIST
  // =====================================================

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subjectApi.subjectList();
      const responseData = response?.data;
      const data = responseData?.data ?? responseData;

      let subjectData = [];
      if (Array.isArray(data)) {
        subjectData = data;
      } else if (Array.isArray(data?.subjects)) {
        subjectData = data.subjects;
      } else if (Array.isArray(data?.data)) {
        subjectData = data.data;
      }

      setSubjects(subjectData);
    } catch (error) {
      console.error("Fetch Subject Error:", error);
      setSubjects([]);
      setStatusData({
        open: true,
        type: "error",
        title: "Failed",
        message:
          error?.response?.data?.message || "Unable to fetch subjects.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredSubjects = subjects.filter((subject) => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) return true;

    const title = subject?.title?.toLowerCase() || "";
    const description = subject?.description?.toLowerCase() || "";

    return title.includes(search) || description.includes(search);
  });

  // =====================================================
  // ACTIONS
  // =====================================================

  const handleAdd = () => {
    router.push("/institute-dashboard/subject/create");
  };

  const handleView = async (id) => {
    if (!id) return;
    try {
      setViewLoading(true);
      setSelectedSubject(null);
      setShowViewModal(true);

      const response = await subjectApi.subjectDetail(id);
      const responseData = response?.data;
      const data = responseData?.data ?? responseData;

      setSelectedSubject(data);
    } catch (error) {
      setShowViewModal(false);
      setSelectedSubject(null);
      setStatusData({
        open: true,
        type: "error",
        title: "Failed",
        message:
          error?.response?.data?.message || "Unable to fetch subject details.",
      });
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (id) => {
    if (!id) return;
    router.push(`/institute-dashboard/subject/${id}`);
  };

  const handleDelete = (id) => {
    if (!id) return;
    setDeleteModal({ open: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;

    try {
      setLoading(true);
      await subjectApi.deleteSubject(id);

      setDeleteModal({ open: false, id: null });
      setStatusData({
        open: true,
        type: "success",
        title: "Deleted Successfully",
        message: "Subject has been deleted successfully.",
      });

      await fetchSubjects();
    } catch (error) {
      setDeleteModal({ open: false, id: null });
      setStatusData({
        open: true,
        type: "error",
        title: "Delete Failed",
        message:
          error?.response?.data?.message || "Unable to delete subject.",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedSubject(null);
  };

  const closeStatusModal = () => {
    setStatusData({ open: false, type: "", title: "", message: "" });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            Academic Resources
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Subject <span className="text-orange-600">Management</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Create, update, and manage institute subjects efficiently.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 justify-center transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Subject
        </motion.button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-sm flex items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search subject by name..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 hover:border-orange-300 outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 text-left pl-6">Sr. No.</th>
                <th className="p-4 text-left">Subject</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                    <p className="text-slate-400 mt-3 font-medium text-sm">
                      Loading subjects...
                    </p>
                  </td>
                </tr>
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject, index) => (
                  <motion.tr
                    key={subject?._id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-orange-50/30 transition-colors group"
                  >
                    <td className="p-4 pl-6 font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        {subject?.title || "-"}
                      </div>
                    </td>
                    <td className="p-4 max-w-[400px]">
                      <p
                        className="font-medium text-slate-600 truncate"
                        title={subject?.description || ""}
                      >
                        {subject?.description || "No description"}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      {subject?.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-xs border border-rose-100">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(subject?._id)}
                          className="p-2.5 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors cursor-pointer"
                          title="View Subject"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(subject?._id)}
                          className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer"
                          title="Edit Subject"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(subject?._id)}
                          className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="text-slate-400 font-medium">
                      {searchQuery
                        ? "No subjects found matching your search."
                        : "No subjects found."}
                    </div>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="mt-3 text-orange-600 font-semibold hover:underline cursor-pointer text-sm"
                      >
                        Clear Search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW SUBJECT MODAL */}
      <AnimatePresence>
        {showViewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold tracking-wider text-orange-600 uppercase">
                    Academic Resource
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">
                    Subject Details
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {viewLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                    <p className="text-sm text-slate-400 mt-3 font-medium">
                      Loading subject...
                    </p>
                  </div>
                ) : selectedSubject ? (
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Subject Title
                      </label>
                      <div className="mt-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold">
                        {selectedSubject?.title || "-"}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Description
                      </label>
                      <div className="mt-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 min-h-[100px] whitespace-pre-wrap text-sm">
                        {selectedSubject?.description ||
                          "No description available."}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </label>
                      <div className="mt-2">
                        {selectedSubject?.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 font-bold text-xs border border-rose-100">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400">
                    Subject details not found.
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
               
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STATUS & DELETE MODALS */}
      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={closeStatusModal}
      />

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}