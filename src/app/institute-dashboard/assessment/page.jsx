"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  Plus,
  Search,
  Edit3,
  Eye,
  Trash2,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  X,
  FilePlus2,
  Upload,
  ArrowRight,
} from "lucide-react";

import { assessmentApi } from "@/services/assessment/assessmentApi";

import StatusModal from "@/components/molecules/StatusModal";
import ConfirmModal from "@/components/molecules/ConfirmModal";

export default function AssessmentPage() {
  const router = useRouter();

  // =====================================================
  // STATE
  // =====================================================

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add Assessment popup
  const [showAddModal, setShowAddModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete modal
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
  // GET ASSESSMENTS
  // =====================================================

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await assessmentApi.getAssessments();

      console.log("Assessment List Response:", response);

      const responseData = response?.data;

      const data = responseData?.data ?? responseData;

      let assessmentData = [];

      if (Array.isArray(data)) {
        assessmentData = data;
      } else if (Array.isArray(data?.assessments)) {
        assessmentData = data.assessments;
      } else if (Array.isArray(data?.data)) {
        assessmentData = data.data;
      }

      setAssessments(assessmentData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Fetch Assessment Error:", error);

      setAssessments([]);
      setCurrentPage(1);

      setStatusData({
        open: true,
        type: "error",
        title: "Failed",
        message:
          error?.response?.data?.message ||
          "Unable to fetch assessments.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredAssessments = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    if (!search) {
      return assessments;
    }

    return assessments.filter((assessment) => {
      const title =
        assessment?.title?.toLowerCase() || "";

      const description =
        assessment?.description?.toLowerCase() || "";

      const subjectTitle =
        assessment?.subject_id?.title?.toLowerCase() || "";

      const difficulty =
        assessment?.difficulty?.toLowerCase() || "";

      return (
        title.includes(search) ||
        description.includes(search) ||
        subjectTitle.includes(search) ||
        difficulty.includes(search)
      );
    });
  }, [assessments, searchQuery]);

  // =====================================================
  // RESET PAGE ON SEARCH
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalItems = filteredAssessments.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / itemsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex = Math.min(
    startIndex + itemsPerPage,
    totalItems
  );

  const currentAssessments =
    filteredAssessments.slice(
      startIndex,
      endIndex
    );

  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  // =====================================================
  // ADD ASSESSMENT
  // =====================================================

  const handleAdd = () => {
    setShowAddModal(true);
  };

  // =====================================================
  // SINGLE ASSESSMENT
  // =====================================================

  const handleSingleAssessment = () => {
    setShowAddModal(false);

    router.push(
      "/institute-dashboard/assessment/new"
    );
  };

  // =====================================================
  // BULK UPLOAD
  // =====================================================

  const handleBulkUpload = () => {
    setShowAddModal(false);

    router.push(
      "/institute-dashboard/assessment/bulk-upload"
    );
  };

  // =====================================================
  // VIEW
  // =====================================================

  const handleView = (id) => {
    if (!id) return;

    router.push(
      `/institute-dashboard/assessment/view/${id}`
    );
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (id) => {
    if (!id) return;

    router.push(
      `/institute-dashboard/assessment/${id}`
    );
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = (id) => {
    if (!id) return;

    setDeleteModal({
      open: true,
      id,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      id: null,
    });
  };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const confirmDelete = async () => {
    const id = deleteModal.id;

    if (!id) return;

    try {
      setLoading(true);

      await assessmentApi.deleteAssessment(id);

      closeDeleteModal();

      setStatusData({
        open: true,
        type: "success",
        title: "Deleted Successfully",
        message:
          "Assessment has been deleted successfully.",
      });

      await fetchAssessments();
    } catch (error) {
      console.error(
        "Delete Assessment Error:",
        error
      );

      closeDeleteModal();

      setStatusData({
        open: true,
        type: "error",
        title: "Delete Failed",
        message:
          error?.response?.data?.message ||
          "Unable to delete assessment.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATUS MODAL
  // =====================================================

  const closeStatusModal = () => {
    setStatusData({
      open: false,
      type: "",
      title: "",
      message: "",
    });
  };

  // =====================================================
  // DIFFICULTY
  // =====================================================

  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-emerald-50 text-emerald-600";

      case "medium":
        return "bg-amber-50 text-amber-600";

      case "hard":
        return "bg-rose-50 text-rose-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase">
            Academic Resources
          </span>

          <h1 className="text-3xl font-black text-slate-900 mt-2">
            Assessment{" "}
            <span className="text-orange-600">
              Management
            </span>
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Create, update and manage assessments.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/10 border-b-2 border-orange-700 flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Assessment
        </motion.button>
      </div>

      {/* ================================================= */}
      {/* SEARCH */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">

        <div className="relative flex-1 w-full">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search assessment, subject or difficulty..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm"
          />

        </div>

        <button
          type="button"
          onClick={fetchAssessments}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm flex items-center gap-2 justify-center"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>

      </div>

      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase text-xs font-bold tracking-wider">

              <tr>
                <th className="p-4 text-left pl-6">
                  Sr. No.
                </th>

                <th className="p-4 text-left">
                  Assessment
                </th>

                <th className="p-4 text-left">
                  Subject
                </th>

                <th className="p-4 text-left">
                  Questions
                </th>

                <th className="p-4 text-center">
                  Marks
                </th>

                <th className="p-4 text-center">
                  Difficulty
                </th>

                <th className="p-4 text-center">
                  Status
                </th>

                <th className="p-4 text-center pr-6">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">

              {loading ? (

                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16"
                  >
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />

                    <p className="text-slate-400 mt-3">
                      Loading assessments...
                    </p>
                  </td>
                </tr>

              ) : currentAssessments.length > 0 ? (

                currentAssessments.map(
                  (assessment, index) => (

                    <motion.tr
                      key={
                        assessment?._id || index
                      }
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/80 transition-colors"
                    >

                      {/* SR NO */}

                      <td className="p-4 pl-6 font-bold text-slate-400">
                        {startIndex + index + 1}
                      </td>

                      {/* ASSESSMENT */}

                      <td className="p-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                            <ClipboardList className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">

                            <div className="font-bold text-slate-900">
                              {assessment?.title || "-"}
                            </div>

                            <p
                              className="text-xs text-slate-400 max-w-[250px] truncate mt-0.5"
                              title={
                                assessment?.description || ""
                              }
                            >
                              {assessment?.description ||
                                "No description"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* SUBJECT */}

                      <td className="p-4">
                        <span className="font-semibold text-slate-700">
                          {assessment?.subject_id?.title ||
                            "-"}
                        </span>
                      </td>

                      {/* QUESTIONS */}

                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                          {assessment?.questions?.length ||
                            0}
                        </span>
                      </td>

                      {/* MARKS */}

                      <td className="p-4 text-center">
                        <span className="font-bold text-slate-700">
                          {assessment?.total_marks ?? 0}
                        </span>
                      </td>

                      {/* DIFFICULTY */}

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-xs capitalize ${getDifficultyClass(
                            assessment?.difficulty
                          )}`}
                        >
                          {assessment?.difficulty || "-"}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="p-4 text-center">

                        {assessment?.is_active ? (

                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-xs">
                            <XCircle className="w-3.5 h-3.5" />
                            Inactive
                          </span>

                        )}

                      </td>

                      {/* ACTIONS */}

                      <td className="p-4 pr-6">

                        <div className="flex items-center justify-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleView(
                                assessment?._id
                              )
                            }
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="View Assessment"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                assessment?._id
                              )
                            }
                            className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100"
                            title="Edit Assessment"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {assessment?.is_active && (

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  assessment?._id
                                )
                              }
                              className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                              title="Delete Assessment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          )}

                        </div>

                      </td>

                    </motion.tr>

                  )
                )

              ) : (

                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-20"
                  >

                    <div className="text-slate-400 font-medium">
                      {searchQuery
                        ? "No assessments found matching your search."
                        : "No assessments found."}
                    </div>

                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearchQuery("")
                        }
                        className="mt-3 text-orange-600 font-semibold hover:underline"
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

        {/* ================================================= */}
        {/* PAGINATION */}
        {/* ================================================= */}

        {!loading && totalItems > 0 && (

          <div className="border-t border-slate-100 px-5 py-4">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              <div className="text-sm text-slate-500">

                Showing{" "}
                <span className="font-bold text-slate-700">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-700">
                  {endIndex}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-700">
                  {totalItems}
                </span>{" "}
                assessments

              </div>

              {totalPages > 1 && (

                <div className="flex items-center gap-1">

                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.max(1, prev - 1)
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map(
                    (page, index) => {

                      if (page === "...") {
                        return (
                          <span
                            key={`dots-${index}`}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 font-bold"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() =>
                            setCurrentPage(page)
                          }
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold ${
                            currentPage === page
                              ? "bg-orange-500 text-white"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    type="button"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          totalPages,
                          prev + 1
                        )
                      )
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* ================================================= */}
      {/* ADD ASSESSMENT MODAL */}
      {/* ================================================= */}

    {/* ================================================= */}
{/* ADD ASSESSMENT OPTIONS MODAL */}
{/* ================================================= */}

<AnimatePresence>
  {showAddModal && (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        transition={{
          duration: 0.2,
        }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-6 text-white">

          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* HEADER CONTENT */}

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white">
              <ClipboardList className="w-7 h-7" />
            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Add Assessment
              </h2>

              <p className="mt-1 text-sm text-orange-100">
                Select how you'd like to create an assessment.
              </p>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}

        <div className="p-6 space-y-5">

          {/* ================================================= */}
          {/* SINGLE ASSESSMENT */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={handleSingleAssessment}
            className="group flex w-full items-center gap-5 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-100 hover:shadow-lg"
          >

            {/* ICON */}

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
              <FilePlus2 className="w-7 h-7" />
            </div>

            {/* CONTENT */}

            <div className="flex-1">

              <h3 className="text-lg font-semibold text-slate-800">
                New Assessment
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create one assessment manually using the assessment form.
              </p>

            </div>

            {/* ARROW */}

            <ArrowRight className="w-6 h-6 shrink-0 text-orange-500 group-hover:translate-x-1 transition-transform" />

          </button>

          {/* ================================================= */}
          {/* BULK UPLOAD */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={handleBulkUpload}
            className="group flex w-full items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:bg-orange-50 hover:shadow-lg"
          >

            {/* ICON */}

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Upload className="w-7 h-7" />
            </div>

            {/* CONTENT */}

            <div className="flex-1">

              <h3 className="text-lg font-semibold text-slate-800">
                Bulk Upload
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Upload an Excel file to add multiple assessments instantly.
              </p>

            </div>

            {/* ARROW */}

            <ArrowRight className="w-6 h-6 shrink-0 text-orange-500 group-hover:translate-x-1 transition-transform" />

          </button>

        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="flex justify-end border-t bg-slate-50 px-6 py-4">

          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            className="rounded-xl border border-slate-300 px-6 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>

        </div>

      </motion.div>

    </div>
  )}
</AnimatePresence>

      {/* ================================================= */}
      {/* STATUS MODAL */}
      {/* ================================================= */}

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={closeStatusModal}
      />

      {/* ================================================= */}
      {/* DELETE CONFIRM */}
      {/* ================================================= */}

      <ConfirmModal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment?"
        confirmText="Delete"
        cancelText="Cancel"
      />

    </div>
  );
}