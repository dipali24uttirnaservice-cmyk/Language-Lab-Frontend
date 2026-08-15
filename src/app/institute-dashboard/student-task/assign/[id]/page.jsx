"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Users, Loader2, ChevronDown, ArrowLeft, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { taskApi } from "@/services/task/taskApi";

export default function AssignTaskPage() {
  const router = useRouter();
  const params = useParams();

  const taskId = useMemo(() => {
    if (!params?.id) return "";
    return Array.isArray(params.id) ? params.id[0] || "" : String(params.id);
  }, [params]);

  const [task, setTask] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // GET TASK
  // =========================================================

  useEffect(() => {
    if (!taskId) {
      setError("Task ID is missing.");
      setLoading(false);
      return;
    }

    const fetchTask = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await taskApi.getTaskById(taskId);
        const data = response?.data?.data || response?.data;

        setTask(data);
      } catch (err) {
        console.error("Task fetch error:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load task."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await taskApi.getDepartments();
        const data = response?.data?.data || response?.data;

        // [{ name, batches: [{ year, studentCount }] }] — segment
        // (department) + year (batch) pairs actually present among this
        // institute's students.
        setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Departments fetch error:", err);
      }
    };

    fetchDepartments();
  }, []);

  const selectedDepartment = departments.find(
    (department) => String(department?.name) === String(departmentId)
  );
  const batches = selectedDepartment?.batches || [];

  const handleDepartmentChange = (e) => {
    setDepartmentId(e.target.value);
    setBatchId("");
    setError("");
  };

  const handleBatchChange = (e) => {
    setBatchId(e.target.value);
    setError("");
  };

  const handlePrevious = () => {
    router.push("/institute-dashboard/student-task");
  };

  // =========================================================
  // ASSIGN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!departmentId) {
      setError("Please select a department.");
      return;
    }
    if (!batchId) {
      setError("Please select a batch.");
      return;
    }

    try {
      setAssigning(true);

      await taskApi.assignTask(taskId, {
        segment: departmentId,
        year: Number(batchId),
      });

      router.push("/institute-dashboard/student-task");
    } catch (err) {
      console.error("Assign task error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to assign task."
      );
    } finally {
      setAssigning(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <button
            type="button"
            onClick={handlePrevious}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load task
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {error || "Something went wrong."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ================= HEADER & BACK BUTTON ================= */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={assigning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* ================= MAIN CARD CONTAINER ================= */}
        <div className="w-full rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Top Title Banner */}
          <div className="flex items-center gap-3 px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shadow-inner">
              <Users className="w-6 h-6 text-violet-600" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Assign Task
              </h1>
              <p className="text-sm text-slate-500">
                Configure department and batch details to assign this task to students
              </p>
            </div>
          </div>

          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Task Information Card */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Student Task
              </p>

              <p className="text-base font-bold text-slate-900">
                {task?.title || "-"}
              </p>

              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                <span>{task?.questions?.length || 0} Questions</span>

                {task?.due_date && (
                  <>
                    <span>•</span>
                    <span>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* ================= DEPARTMENT ================= */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Department <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <select
                  value={departmentId}
                  onChange={handleDepartmentChange}
                  disabled={assigning}
                  className="appearance-none w-full px-4 py-3.5 pr-11 rounded-2xl border border-orange-300 bg-white text-slate-700 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-orange-100 focus:border-orange-500 disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  <option value="">Select Department/Branch</option>

                  {departments.map((department) => (
                    <option key={department.name} value={department.name}>
                      {department.name}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* ================= BATCH ================= */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Batch <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <select
                  value={batchId}
                  onChange={handleBatchChange}
                  disabled={!departmentId || assigning}
                  className="appearance-none w-full px-4 py-3.5 pr-11 rounded-2xl border border-orange-300 bg-white text-slate-700 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-orange-100 focus:border-orange-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  <option value="">
                    {!departmentId
                      ? "Select Department/Branch First"
                      : batches.length > 0
                        ? "Select Year/Batch"
                        : "No Batches Found"}
                  </option>

                  {batches.map((batch) => (
                    <option key={batch.year} value={batch.year}>
                      Year {batch.year}
                      {batch.studentCount != null
                        ? ` (${batch.studentCount} students)`
                        : ""}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    !departmentId ? "text-slate-300" : "text-slate-500"
                  }`}
                />
              </div>
            </div>

            {/* ================= BUTTONS ================= */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={assigning}
                className="px-6 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-60 shadow-sm cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!departmentId || !batchId || assigning}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Assign Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
