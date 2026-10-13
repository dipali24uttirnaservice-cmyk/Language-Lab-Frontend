"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, RotateCcw, Search, Loader2, Trash2 } from "lucide-react";

import { studentApi } from "@/services/student/studentApi";
import StatusModal from "@/components/molecules/StatusModal";
import ConfirmModal from "@/components/molecules/ConfirmModal";

export default function DangerZonePage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [restoreModal, setRestoreModal] = useState({ open: false, id: null });
  const [restoringId, setRestoringId] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [deletingId, setDeletingId] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [statusData, setStatusData] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const loadDeletedStudents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await studentApi.getDeletedStudents();

      setStudents(response?.data?.data?.students || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeletedStudents();
  }, [loadDeletedStudents]);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return students;

    return students.filter((student) =>
      [
        student.full_name,
        student.email,
        student.roll_no,
        student.enrollment_no,
        student.segment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [students, search]);

  // Selection can go stale when the list reloads (restore/delete removes
  // rows) — drop any selected id that no longer exists in the filtered set.
  useEffect(() => {
    setSelectedIds((previous) =>
      previous.filter((id) =>
        filteredStudents.some((student) => student._id === id),
      ),
    );
  }, [filteredStudents]);

  const allSelected =
    filteredStudents.length > 0 &&
    selectedIds.length === filteredStudents.length;

  const someSelected =
    selectedIds.length > 0 && selectedIds.length < filteredStudents.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(filteredStudents.map((student) => student._id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const handleRestore = (id) => {
    setRestoreModal({ open: true, id });
  };

  const confirmRestore = async () => {
    if (!restoreModal.id) return;

    setRestoringId(restoreModal.id);

    try {
      await studentApi.restoreStudent(restoreModal.id);

      setStatusData({
        open: true,
        type: "success",
        title: "Student Restored",
        message: "This student can access their account again.",
      });

      loadDeletedStudents();
    } catch (error) {
      setStatusData({
        open: true,
        type: "error",
        title: "Restore Failed",
        message:
          error?.response?.data?.message || "Failed to restore this student.",
      });
    } finally {
      setRestoringId(null);
      setRestoreModal({ open: false, id: null });
    }
  };

  const handlePermanentDelete = (id) => {
    setDeleteModal({ open: true, id });
  };

  const confirmPermanentDelete = async () => {
    if (!deleteModal.id) return;

    setDeletingId(deleteModal.id);

    try {
      await studentApi.permanentlyDeleteStudent(deleteModal.id);

      setStatusData({
        open: true,
        type: "success",
        title: "Student Permanently Deleted",
        message: "This student's record has been removed for good.",
      });

      loadDeletedStudents();
    } catch (error) {
      setStatusData({
        open: true,
        type: "error",
        title: "Delete Failed",
        message:
          error?.response?.data?.message ||
          "Failed to permanently delete this student.",
      });
    } finally {
      setDeletingId(null);
      setDeleteModal({ open: false, id: null });
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setBulkDeleting(true);

    try {
      const response =
        await studentApi.bulkPermanentlyDeleteStudents(selectedIds);

      const deletedCount =
        response?.data?.data?.deleted_count ?? selectedIds.length;

      setStatusData({
        open: true,
        type: "success",
        title: "Students Permanently Deleted",
        message: `${deletedCount} student record(s) have been removed for good.`,
      });

      setSelectedIds([]);
      loadDeletedStudents();
    } catch (error) {
      setStatusData({
        open: true,
        type: "error",
        title: "Delete Failed",
        message:
          error?.response?.data?.message ||
          "Failed to permanently delete the selected students.",
      });
    } finally {
      setBulkDeleting(false);
      setBulkDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md">
          <AlertTriangle size={20} />
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-rose-700">
            Danger Zone
          </h1>

          <p className="text-sm text-rose-600/80">
            Deleted students — they are hidden from the main list and can no
            longer log in until restored here.
          </p>
        </div>
      </div>

      {/* SEARCH + BULK ACTIONS */}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search deleted students..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />
        </div>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => setBulkDeleteModal(true)}
            disabled={bulkDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bulkDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                    disabled={filteredStudents.length === 0}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-400 disabled:cursor-not-allowed"
                  />
                </th>
                <th className="w-16 px-6 py-4">Sr. No.</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll No & Enrollment No</th>
                <th className="px-6 py-4">Department/Branch & Batch</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    <Loader2 size={18} className="mr-2 inline animate-spin" />
                    Loading deleted students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No deleted students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr
                    key={student._id}
                    className={`transition-colors hover:bg-rose-50/20 ${
                      selectedIds.includes(student._id) ? "bg-rose-50/40" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(student._id)}
                        onChange={() => toggleSelectOne(student._id)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                      />
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {student.full_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {student.email}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">
                        {student.roll_no}
                      </p>
                      <p className="text-xs text-slate-500">
                        {student.enrollment_no}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium">{student.segment}</p>
                      <p className="text-xs text-slate-500">
                        Batch {student.year}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title="Restore"
                          aria-label="Restore"
                          onClick={() => handleRestore(student._id)}
                          disabled={
                            restoringId === student._id ||
                            deletingId === student._id
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {restoringId === student._id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <RotateCcw size={15} />
                          )}
                        </button>

                        <button
                          type="button"
                          title="Delete Permanently"
                          aria-label="Delete Permanently"
                          onClick={() => handlePermanentDelete(student._id)}
                          disabled={
                            restoringId === student._id ||
                            deletingId === student._id
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === student._id ? (
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
      </div>

      <ConfirmModal
        open={restoreModal.open}
        onClose={() => setRestoreModal({ open: false, id: null })}
        onConfirm={confirmRestore}
        title="Restore Student"
        message="Restore this student's access? They will be able to log in again."
        confirmText="Restore"
        cancelText="Cancel"
      />

      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={confirmPermanentDelete}
        title="Delete Permanently"
        message="This cannot be undone. The student's record will be removed for good — there is no restoring it after this."
        confirmText="Delete Permanently"
        cancelText="Cancel"
      />

      <ConfirmModal
        open={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Permanently"
        message={`This cannot be undone. ${selectedIds.length} student record(s) will be removed for good — there is no restoring them after this.`}
        confirmText={`Delete ${selectedIds.length} Permanently`}
        cancelText="Cancel"
      />

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={() => setStatusData((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
