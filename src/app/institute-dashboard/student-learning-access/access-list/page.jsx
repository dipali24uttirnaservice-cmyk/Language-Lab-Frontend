"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Building2,
  Search,
  Eye,
  Edit3,
  Trash2,
  Plus,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import StatusModal from "@/components/molecules/StatusModal";
import ConfirmModal from "@/components/molecules/ConfirmModal";

import { studentLearningAccessApi } from "@/services/studentLearningAccess/studentLearningAccessApi";

export default function StudentLearningAccessListPage() {
  const router = useRouter();

  const [configuredModules, setConfiguredModules] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterTopic, setFilterTopic] = useState("");

  const [viewingModule, setViewingModule] = useState(null);

  /* =========================================================
     DELETE STATES
  ========================================================= */

  const [deletingId, setDeletingId] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
  });

  /* =========================================================
     STATUS MODAL
  ========================================================= */

  const [statusData, setStatusData] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  /* =========================================================
     PAGINATION
  ========================================================= */

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  /* =========================================================
     FETCH LIST API
  ========================================================= */

  const fetchList = useCallback(async () => {
    setListLoading(true);
    setListError("");

    try {
      const res = await studentLearningAccessApi.getAll();

      const records = res?.data?.data?.records ?? [];

      setConfiguredModules(Array.isArray(records) ? records : []);
    } catch (err) {
      setListError(
        err?.response?.data?.message ||
          "Failed to load learning access modules.",
      );
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /* =========================================================
     ADD
  ========================================================= */

  const handleAdd = () => {
    router.push("/institute-dashboard/student-learning-access");
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (id) => {
    const editUrl = "/institute-dashboard/student-learning-access?id=" + id;

    router.push(editUrl);
  };

  /* =========================================================
     DELETE - OPEN CONFIRM MODAL
  ========================================================= */

  const handleDeleteModule = (id) => {
    setDeleteModal({
      open: true,
      id,
    });
  };

  /* =========================================================
     DELETE - CONFIRM
  ========================================================= */

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    const id = deleteModal.id;

    setDeletingId(id);

    try {
      await studentLearningAccessApi.remove(id);

      setConfiguredModules((prev) =>
        prev.filter((module) => module._id !== id),
      );

      setDeleteModal({
        open: false,
        id: null,
      });

      setStatusData({
        open: true,
        type: "success",
        title: "Deleted Successfully",
        message: "Learning access module deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to delete learning access:", err);

      setDeleteModal({
        open: false,
        id: null,
      });

      setStatusData({
        open: true,
        type: "error",
        title: "Delete Failed",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete this module access.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const filterCourseOptions = useMemo(() => {
    const seen = new Map();

    configuredModules.forEach((mod) => {
      if (mod.course_id && !seen.has(mod.course_id)) {
        seen.set(mod.course_id, mod.course?.course_name || "Untitled Course");
      }
    });

    return Array.from(seen, ([value, label]) => ({
      value,
      label,
    }));
  }, [configuredModules]);

  const filterTopicOptions = useMemo(() => {
    const seen = new Map();

    configuredModules.forEach((mod) => {
      if (mod.topic_id && !seen.has(mod.topic_id)) {
        seen.set(mod.topic_id, mod.topic?.title || "Untitled Topic");
      }
    });

    return Array.from(seen, ([value, label]) => ({
      value,
      label,
    }));
  }, [configuredModules]);

  /* =========================================================
     FILTERED LIST
  ========================================================= */

  const displayedModules = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return configuredModules.filter((mod) => {
      const courseName = mod.course?.course_name?.toLowerCase() || "";

      const topicName = mod.topic?.title?.toLowerCase() || "";

      const departmentName = mod.segment?.toLowerCase() || "";

      const year = String(mod.year || "").toLowerCase();

      const matchesSearch =
        !query ||
        courseName.includes(query) ||
        topicName.includes(query) ||
        departmentName.includes(query) ||
        year.includes(query);

      const matchesCourse = !filterCourse || mod.course_id === filterCourse;

      const matchesTopic = !filterTopic || mod.topic_id === filterTopic;

      return matchesSearch && matchesCourse && matchesTopic;
    });
  }, [configuredModules, searchQuery, filterCourse, filterTopic]);

  /* =========================================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCourse, filterTopic, itemsPerPage]);

  /* =========================================================
     PAGINATION CALCULATIONS
  ========================================================= */

  const totalItems = displayedModules.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedModules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    const endIndex = startIndex + itemsPerPage;

    return displayedModules.slice(startIndex, endIndex);
  }, [displayedModules, currentPage, itemsPerPage]);

  /* =========================================================
     KEEP CURRENT PAGE VALID
  ========================================================= */

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =========================================================
     PAGINATION HANDLERS
  ========================================================= */

  const handlePreviousPage = () => {
    setCurrentPage((previous) => Math.max(previous - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((previous) => Math.min(previous + 1, totalPages));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /* =========================================================
     PAGE NUMBERS
  ========================================================= */

  const pageNumbers = useMemo(() => {
    const pages = [];

    if (totalPages <= 5) {
      for (let page = 1; page <= totalPages; page++) {
        pages.push(page);
      }

      return pages;
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
  }, [currentPage, totalPages]);

  /* =========================================================
     PAGINATION INFO
  ========================================================= */

  const showingFrom =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const showingTo = Math.min(currentPage * itemsPerPage, totalItems);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-orange-500">
            Academic Resources
          </p>

          <h1 className="text-2xl font-extrabold text-slate-900">
            Learning Modules
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage curriculum modules, departmental batch allocations, and
            student access efficiently.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-amber-600 hover:shadow-xl active:scale-95 md:self-auto"
        >
          <Plus size={18} />
          Add Module
        </button>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-orange-200/60 bg-white p-4 shadow-sm md:flex-row">
        {/* SEARCH */}

        <div className="relative w-full flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search module by title, department or batch..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-12 w-full rounded-xl border border-orange-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* COURSE FILTER */}

        <div className="w-full md:w-64">
          <select
            value={filterCourse}
            onChange={(event) => setFilterCourse(event.target.value)}
            className="h-12 w-full cursor-pointer rounded-xl border border-orange-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">All Courses</option>

            {filterCourseOptions.map((course) => (
              <option key={course.value} value={course.value}>
                {course.label}
              </option>
            ))}
          </select>
        </div>

        {/* TOPIC FILTER */}

        <div className="w-full md:w-64">
          <select
            value={filterTopic}
            onChange={(event) => setFilterTopic(event.target.value)}
            className="h-12 w-full cursor-pointer rounded-xl border border-orange-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">All Topics</option>

            {filterTopicOptions.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-orange-200/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-orange-100 bg-orange-50/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="w-16 px-6 py-4">Sr. No.</th>

                <th className="px-6 py-4">Course</th>

                <th className="px-6 py-4">Topic</th>

                <th className="px-6 py-4">Department & Batch</th>

                <th className="px-6 py-4 text-center">Student Count</th>

                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-orange-50 text-sm text-slate-700">
              {/* LOADING */}

              {listLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    <Loader2 size={18} className="mr-2 inline animate-spin" />
                    Loading learning modules...
                  </td>
                </tr>
              ) : listError ? (
                /* ERROR */

                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-rose-500"
                  >
                    {listError}
                  </td>
                </tr>
              ) : paginatedModules.length === 0 ? (
                /* EMPTY */

                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No learning modules found matching your filters.
                  </td>
                </tr>
              ) : (
                /* DATA */

                paginatedModules.map((mod, index) => (
                  <tr
                    key={mod._id}
                    className="transition-colors hover:bg-orange-50/20"
                  >
                    {/* SR NO */}

                    <td className="px-6 py-4 font-semibold text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* COURSE */}

                    <td className="px-6 py-4 font-medium text-slate-600">
                      {mod.course?.course_name || "-"}
                    </td>

                    {/* TOPIC */}

                    <td className="px-6 py-4 font-medium text-slate-600">
                      {mod.topic?.title || "-"}
                    </td>

                    {/* DEPARTMENT + BATCH */}

                    <td className="px-6 py-4">
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          <Building2 size={11} />

                          {mod.segment || "-"}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-800">
                          <GraduationCap size={11} />

                          {mod.year || "-"}
                        </span>
                      </div>
                    </td>

                    {/* STUDENT COUNT */}

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                        {mod.student_count ?? 0} Students
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() => setViewingModule(mod)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-2xs transition hover:bg-blue-100"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() => handleEdit(mod._id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-2xs transition hover:bg-amber-100"
                          title="Edit Module"
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mod._id)}
                          disabled={deletingId === mod._id}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-2xs transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete Module"
                        >
                          {deletingId === mod._id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===================================================
            PAGINATION
        =================================================== */}

        {!listLoading && !listError && totalItems > 0 && (
          <div className="flex flex-col gap-4 border-t border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* LEFT */}

            <div className="flex items-center gap-3">
              <p className="text-xs font-medium text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-800">{showingFrom}</span>{" "}
                to <span className="font-bold text-slate-800">{showingTo}</span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">{totalItems}</span>
              </p>

              <select
                value={itemsPerPage}
                onChange={(event) => {
                  setItemsPerPage(Number(event.target.value));
                }}
                className="h-8 rounded-lg border border-orange-200 bg-white px-2 text-xs font-semibold text-slate-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <option value={5}>5 / page</option>

                <option value={6}>6 / page</option>

                <option value={10}>10 / page</option>

                <option value={20}>20 / page</option>

                <option value={50}>50 / page</option>
              </select>
            </div>

            {/* RIGHT */}

            <div className="flex items-center justify-end gap-1">
              {/* PREVIOUS */}

              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 bg-white text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {/* PAGE NUMBERS */}

              {pageNumbers.map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-9 w-9 items-center justify-center text-xs font-semibold text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                        : "border border-orange-200 bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              {/* NEXT */}

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 bg-white text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          VIEW DETAILS MODAL
      ===================================================== */}

      {viewingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg animate-fadeIn rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600">
                  <BookOpen size={20} />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Module Access Summary
                  </h3>

                  <p className="text-xs text-slate-400">
                    Detailed overview of configured learning access
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingModule(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="mt-5 space-y-4 text-sm">
              <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Course
                  </span>

                  <p className="font-bold text-slate-800">
                    {viewingModule.course?.course_name || "-"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Topic
                  </span>

                  <p className="font-semibold text-slate-700">
                    {viewingModule.topic?.title || "-"}
                  </p>
                </div>
              </div>

              {/* SUBTOPICS */}

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">
                  Selected Subtopics
                </span>

                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {viewingModule.subtopics?.length > 0 ? (
                    viewingModule.subtopics.map((subtopic) => (
                      <span
                        key={subtopic._id}
                        className="rounded-lg border border-orange-200 bg-orange-100/60 px-2.5 py-1 text-xs font-semibold text-orange-800"
                      >
                        {subtopic.title}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      No subtopics selected
                    </span>
                  )}
                </div>
              </div>

              {/* DEPARTMENT + BATCH */}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-amber-800">
                    <Building2 size={12} />
                    Department
                  </span>

                  <p className="mt-1 text-xs font-semibold text-slate-800">
                    {viewingModule.segment || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-orange-800">
                    <GraduationCap size={12} />
                    Batch & Students
                  </span>

                  <p className="mt-1 text-xs font-semibold text-slate-800">
                    {viewingModule.year || "-"} (
                    {viewingModule.student_count ?? 0} students)
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-orange-100">
              <span className="text-xs text-slate-500 font-medium">
                Total Lessons:{" "}
                <strong className="text-slate-800">
                  {subtopicLessons.length}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setViewingModule(null)}
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-orange-700"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRM DELETE MODAL
      ===================================================== */}

      <ConfirmModal
        open={deleteModal.open}
        onClose={() =>
          setDeleteModal({
            open: false,
            id: null,
          })
        }
        onConfirm={confirmDelete}
        title="Delete Learning Access"
        message="Are you sure you want to delete this module access?"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={() =>
          setStatusData((previous) => ({
            ...previous,
            open: false,
          }))
        }
      />
    </div>
  );
}
