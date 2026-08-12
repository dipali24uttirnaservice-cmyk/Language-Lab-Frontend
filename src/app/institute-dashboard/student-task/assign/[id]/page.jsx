"use client";

import React, { useState } from "react";
import { Users, Loader2, ChevronDown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssignTaskPage({
  task,
  departments = [],
  onSubmit,
  loading = false,
}) {
  const router = useRouter();
  const [departmentId, setDepartmentId] = useState("");
  const [batchId, setBatchId] = useState("");

  const selectedDepartment = departments.find(
    (department) => department._id === departmentId
  );

  const batches = selectedDepartment?.batches || [];

  const handleDepartmentChange = (e) => {
    setDepartmentId(e.target.value);
    setBatchId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departmentId || !batchId) return;

    await onSubmit({
      taskId: task?._id,
      departmentId,
      batchId,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ================= HEADER & BACK BUTTON ================= */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/institute-dashboard/student-task")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
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

            {/* ================= DEPARTMENT ================= */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Department <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <select
                  value={departmentId}
                  onChange={handleDepartmentChange}
                  disabled={loading}
                  className="appearance-none w-full px-4 py-3.5 pr-11 rounded-2xl border border-orange-300 bg-white text-slate-700 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-orange-100 focus:border-orange-500 disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  <option value="">Select Department</option>

                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name || department.department_name}
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
                  onChange={(e) => setBatchId(e.target.value)}
                  disabled={!departmentId || loading}
                  className="appearance-none w-full px-4 py-3.5 pr-11 rounded-2xl border border-orange-300 bg-white text-slate-700 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-orange-100 focus:border-orange-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  <option value="">
                    {!departmentId
                      ? "Select Department First"
                      : batches.length > 0
                      ? "Select Batch"
                      : "No Batches Found"}
                  </option>

                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name || batch.batch_name}
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
                onClick={() => router.push("/institute-dashboard/student-task")}
                disabled={loading}
                className="px-6 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-60 shadow-sm cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!departmentId || !batchId || loading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
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