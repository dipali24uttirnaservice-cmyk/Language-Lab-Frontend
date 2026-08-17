"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Users,
  AlertCircle,
} from "lucide-react";

import {
  practicalManualDetail,
  practicalManualDepartments,
  practicalManualAssign,
} from "@/services/practical-Manual/page.jsx";

export default function AssignManualPage() {
  const router = useRouter();
  const params = useParams();

  const manualId = useMemo(() => {
    if (!params?.id) return "";

    if (Array.isArray(params.id)) {
      return params.id[0] || "";
    }

    return String(params.id);
  }, [params]);

  const [manual, setManual] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // GET MANUAL
  // =========================================================

  useEffect(() => {
    if (!manualId) {
      setError("Practical manual ID is missing.");
      setLoading(false);
      return;
    }

    const fetchManual = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await practicalManualDetail(manualId);

        let data = response;

        if (data?.data !== undefined) {
          data = data.data;
        }

        if (data?.data !== undefined) {
          data = data.data;
        }

        if (data?.manual !== undefined) {
          data = data.manual;
        }

        if (data?.practicalManual !== undefined) {
          data = data.practicalManual;
        }

        if (data?.practical_manual !== undefined) {
          data = data.practical_manual;
        }

        setManual(data);
      } catch (err) {
        console.error("Practical manual fetch error:", err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load practical manual."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchManual();
  }, [manualId]);

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await practicalManualDepartments();

        let data = response?.data ?? response;

        if (data?.data !== undefined) {
          data = data.data;
        }

        // [{ name, batches: [{ year, studentCount }] }] — segment (department)
        // + year (batch) pairs actually present among this institute's
        // students, from Student records. No department/batch has its own
        // _id here since these aren't separate collections.
        setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Departments fetch error:", err);
      }
    };

    fetchDepartments();
  }, []);

  // =========================================================
  // SELECTED DEPARTMENT
  // =========================================================

  const selectedDepartment = useMemo(() => {
    return departments.find(
      (department) => String(department?.name) === String(departmentId)
    );
  }, [departments, departmentId]);

  // =========================================================
  // BATCHES
  // =========================================================

  const batches = useMemo(() => {
    return selectedDepartment?.batches || [];
  }, [selectedDepartment]);

  // =========================================================
  // MANUAL TITLE
  // =========================================================

  const manualTitle =
    manual?.title ||
    manual?.manual_title ||
    manual?.manualName ||
    manual?.name ||
    "Practical Manual";

  // =========================================================
  // DEPARTMENT CHANGE
  // =========================================================

  const handleDepartmentChange = (event) => {
    setDepartmentId(event.target.value);
    setBatchId("");
    setError("");
  };

  // =========================================================
  // BATCH CHANGE
  // =========================================================

  const handleBatchChange = (event) => {
    setBatchId(event.target.value);
    setError("");
  };

  // =========================================================
  // PREVIOUS
  // =========================================================

  const handlePrevious = () => {
    router.push("/institute-dashboard/practical-manual");
  };

  // =========================================================
  // ASSIGN
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

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

      // departmentId holds the department name (Student.segment), batchId
      // holds the batch/year of study (Student.year) as a string from the
      // <select> — the backend's assignPracticalSchema expects a number.
      await practicalManualAssign(manualId, {
        segment: departmentId,
        year: Number(batchId),
      });

      router.push("/institute-dashboard/practical-manual");
    } catch (err) {
      console.error("Assign manual error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to assign practical manual."
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
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (!manual) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={handlePrevious}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load practical manual
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        {/* Previous */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={assigning}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                <Users className="h-5 w-5 text-orange-600" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Assign Practical Manual
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Assign the practical manual to a department and batch.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Manual */}
            <div className="mb-6 rounded-xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Practical Manual
              </p>

              <p className="mt-1 text-base font-bold text-slate-900">
                {manualTitle}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />

                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Department */}
            <div className="mb-5">
              <label
                htmlFor="department"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Department
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  id="department"
                  value={departmentId}
                  onChange={handleDepartmentChange}
                  disabled={assigning}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Select Department</option>

                  {departments.map((department) => {
                    const name = department?.name || "Unnamed Department";

                    return (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    );
                  })}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Batch */}
            <div className="mb-6">
              <label
                htmlFor="batch"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Batch
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  id="batch"
                  value={batchId}
                  onChange={handleBatchChange}
                  disabled={!departmentId || assigning}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">
                    {!departmentId
                      ? "Select Department First"
                      : batches.length === 0
                        ? "No Batch Available"
                        : "Select Batch"}
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

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={assigning}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="submit"
                disabled={
                  !departmentId ||
                  !batchId ||
                  assigning
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:from-orange-600 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Assign Practical Manual
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