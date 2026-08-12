"use client";

import React, { useEffect, useState } from "react";
import {
X,
Users,
Loader2,
ChevronDown,
} from "lucide-react";

export default function AssignTaskModal({
open,
onClose,
task,
departments = [],
onSubmit,
loading = false,
}) {
const [departmentId, setDepartmentId] = useState("");
const [batchId, setBatchId] = useState("");

const selectedDepartment = departments.find(
(department) => department._id === departmentId,
);

const batches = selectedDepartment?.batches || [];

useEffect(() => {
if (!open) {
setDepartmentId("");
setBatchId("");
}
}, [open]);

const handleDepartmentChange = (e) => {
setDepartmentId(e.target.value);
setBatchId("");
};

const handleSubmit = async (e) => {
e.preventDefault();

```
if (!departmentId || !batchId) return;

await onSubmit({
  taskId: task?._id,
  departmentId,
  batchId,
});
```

};

if (!open) return null;

return ( <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"> <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
{/* ================= HEADER ================= */} <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100"> <div className="flex items-center gap-3"> <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center"> <Users className="w-5 h-5 text-violet-600" /> </div>

```
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Assign Task
          </h2>

          <p className="text-sm text-slate-500">
            Assign this task to students
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* ================= FORM ================= */}
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {/* Task Information */}
      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          Student Task
        </p>

        <p className="font-bold text-slate-900">
          {task?.title || "-"}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span>
            {task?.questions?.length || 0} Questions
          </span>

          {task?.due_date && (
            <>
              <span>•</span>

              <span>
                Due:{" "}
                {new Date(
                  task.due_date,
                ).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ================= DEPARTMENT ================= */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Department{" "}
          <span className="text-rose-500">*</span>
        </label>

        <div className="relative">
          <select
            value={departmentId}
            onChange={handleDepartmentChange}
            disabled={loading}
            className="appearance-none w-full px-4 py-3 pr-11 rounded-xl border border-orange-300 bg-white text-slate-700 outline-none transition-all focus:ring-2 focus:ring-orange-200 focus:border-orange-500 disabled:opacity-60 cursor-pointer"
          >
            <option value="">
              Select Department
            </option>

            {departments.map((department) => (
              <option
                key={department._id}
                value={department._id}
              >
                {department.name ||
                  department.department_name}
              </option>
            ))}
          </select>

          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
          />
        </div>
      </div>

      {/* ================= BATCH ================= */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Batch{" "}
          <span className="text-rose-500">*</span>
        </label>

        <div className="relative">
          <select
            value={batchId}
            onChange={(e) =>
              setBatchId(e.target.value)
            }
            disabled={!departmentId || loading}
            className="appearance-none w-full px-4 py-3 pr-11 rounded-xl border border-orange-300 bg-white text-slate-700 outline-none transition-all focus:ring-2 focus:ring-orange-200 focus:border-orange-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">
              {!departmentId
                ? "Select Department First"
                : batches.length > 0
                  ? "Select Batch"
                  : "No Batches Found"}
            </option>

            {batches.map((batch) => (
              <option
                key={batch._id}
                value={batch._id}
              >
                {batch.name ||
                  batch.batch_name}
              </option>
            ))}
          </select>

          <ChevronDown
            className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              !departmentId
                ? "text-slate-300"
                : "text-slate-500"
            }`}
          />
        </div>
      </div>

      {/* ================= BUTTONS ================= */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            !departmentId ||
            !batchId ||
            loading
          }
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-orange-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

);
}
