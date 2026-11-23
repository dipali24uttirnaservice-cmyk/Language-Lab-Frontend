"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Users,
  AlertCircle,
  Building2,
  GraduationCap,
  FileText,
  Check,
  CheckCircle2,
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
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]); // Array of "${segment}___${year}"

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

        const depts = Array.isArray(data) ? data : [];
        setDepartments(depts);
      } catch (err) {
        console.error("Departments fetch error:", err);
      }
    };

    fetchDepartments();
  }, []);

  // =========================================================
  // ALREADY ASSIGNED BATCHES
  // =========================================================

  const alreadyAssignedBatches = useMemo(() => {
    return Array.isArray(manual?.assigned_batches) ? manual.assigned_batches : [];
  }, [manual]);

  const isAlreadyAssigned = (segment, year) => {
    return alreadyAssignedBatches.some(
      (b) => String(b.segment) === String(segment) && Number(b.year) === Number(year)
    );
  };

  // =========================================================
  // AVAILABLE BATCHES FOR SELECTED DEPARTMENTS
  // =========================================================

  const availableBatches = useMemo(() => {
    const list = [];
    departments.forEach((dept) => {
      if (selectedDepartments.includes(dept?.name)) {
        (dept?.batches || []).forEach((b) => {
          list.push({
            segment: dept.name,
            year: b.year,
            studentCount: b.studentCount,
            key: `${dept.name}___${b.year}`,
            isAssigned: isAlreadyAssigned(dept.name, b.year),
          });
        });
      }
    });
    return list;
  }, [departments, selectedDepartments, alreadyAssignedBatches]);

  const isDeptSelected = selectedDepartments.length > 0;

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
  // DEPARTMENT HANDLERS
  // =========================================================

  const handleToggleDepartment = (deptName) => {
    setError("");
    setSelectedDepartments((prev) => {
      const exists = prev.includes(deptName);
      if (exists) {
        // Deselect department and clean up its batches
        setSelectedBatches((bPrev) =>
          bPrev.filter((k) => !k.startsWith(`${deptName}___`))
        );
        return prev.filter((d) => d !== deptName);
      } else {
        return [...prev, deptName];
      }
    });
  };

  const handleSelectAllDepartments = () => {
    setError("");
    const all = departments.map((d) => d?.name).filter(Boolean);
    setSelectedDepartments(all);
  };

  const handleClearDepartments = () => {
    setError("");
    setSelectedDepartments([]);
    setSelectedBatches([]);
  };

  // =========================================================
  // BATCH HANDLERS
  // =========================================================

  const handleToggleBatch = (key) => {
    setError("");
    setSelectedBatches((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllBatches = () => {
    setError("");
    const allKeys = availableBatches.map((b) => b.key);
    setSelectedBatches(allKeys);
  };

  const handleClearBatches = () => {
    setError("");
    setSelectedBatches([]);
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

    if (selectedDepartments.length === 0) {
      setError("Please select at least one department.");
      return;
    }

    if (selectedBatches.length === 0) {
      setError("Please select at least one batch.");
      return;
    }

    try {
      setAssigning(true);

      const assignments = selectedBatches.map((key) => {
        const [segment, yearStr] = key.split("___");
        return {
          segment,
          year: Number(yearStr),
        };
      });

      // Try bulk assignment first; fall back to sequential if legacy backend
      try {
        await practicalManualAssign(manualId, {
          assignments,
          ...(assignments.length === 1 ? assignments[0] : {}),
        });
      } catch (bulkErr) {
        if (assignments.length > 1) {
          for (const item of assignments) {
            await practicalManualAssign(manualId, {
              segment: item.segment,
              year: item.year,
            });
          }
        } else {
          throw bulkErr;
        }
      }

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
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600 cursor-pointer"
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
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600 disabled:opacity-50 cursor-pointer"
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Step 1: Practical Manual Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-black">
                  1
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <FileText size={16} className="text-orange-600" />
                  <span>Practical Manual</span>
                </h3>
              </div>

              <div className="ml-8 mt-1">
                <p className="text-base font-bold text-slate-900">
                  {manualTitle}
                </p>

                {alreadyAssignedBatches.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-medium">Currently assigned:</span>
                    {alreadyAssignedBatches.map((b, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {b.segment} - Batch {b.year}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* ── STEP 2: SELECT DEPARTMENT(S) ───── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-black">
                    2
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Building2 size={16} className="text-indigo-600" />
                    <span>Step 2: Select Department(s) *</span>
                  </h3>
                </div>

                {departments.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllDepartments}
                      disabled={assigning}
                      className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer disabled:opacity-50"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearDepartments}
                      disabled={assigning || selectedDepartments.length === 0}
                      className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer disabled:opacity-50"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Choose the departmental branches for this course.
              </p>

              {departments.length === 0 ? (
                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800 font-medium">
                  No departments found for this institute. Please ensure students have a department/segment assigned in the Students section.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {departments.map((dept) => {
                    const name = dept?.name || "Unnamed Department";
                    const isSelected = selectedDepartments.includes(name);

                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleToggleDepartment(name)}
                        disabled={assigning}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/50"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                        }`}
                      >
                        <span>{name}</span>
                        {isSelected && <Check size={14} className="stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── STEP 3: SELECT BATCH ───── */}
            <div
              className={`space-y-3 transition-opacity duration-300 ${
                isDeptSelected ? "opacity-100" : "opacity-40 pointer-events-none"
              }`}
            >
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                    3
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <GraduationCap size={16} className="text-emerald-600" />
                    <span>Step 3: Select Batch *</span>
                  </h3>
                </div>

                {isDeptSelected && availableBatches.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllBatches}
                      disabled={assigning}
                      className="text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer disabled:opacity-50"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearBatches}
                      disabled={assigning || selectedBatches.length === 0}
                      className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer disabled:opacity-50"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Dynamic student batches eligible to access this course under this faculty member.
              </p>

              {!isDeptSelected ? (
                <div className="p-3 bg-indigo-50/60 border border-indigo-200/60 rounded-xl text-xs text-indigo-800 font-medium flex items-center gap-2">
                  <span>👈 Please select at least one department in Step 2 first.</span>
                </div>
              ) : availableBatches.length === 0 ? (
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-800 font-semibold flex items-center gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <span>No batch available for the selected department(s).</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {availableBatches.map((item) => {
                    const isSelected = selectedBatches.includes(item.key);

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleToggleBatch(item.key)}
                        disabled={assigning}
                        className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/50"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={isSelected ? "text-white" : "text-slate-800"}>
                            Batch {item.year}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              isSelected ? "text-emerald-100" : "text-slate-500"
                            }`}
                          >
                            ({item.segment})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.studentCount != null && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                isSelected
                                  ? "bg-emerald-700 text-emerald-100"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {item.studentCount} student{item.studentCount === 1 ? "" : "s"}
                            </span>
                          )}
                          {isSelected && <Check size={14} className="stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <div className="text-xs text-slate-500 font-medium">
                {selectedBatches.length > 0 ? (
                  <span>
                    Ready to assign <strong className="text-slate-800">{selectedBatches.length}</strong> batch{selectedBatches.length === 1 ? "" : "es"} across <strong className="text-slate-800">{selectedDepartments.length}</strong> department{selectedDepartments.length === 1 ? "" : "s"}.
                  </span>
                ) : (
                  <span>Select at least one department and batch to proceed.</span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={assigning}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>

                <button
                  type="submit"
                  disabled={
                    selectedDepartments.length === 0 ||
                    selectedBatches.length === 0 ||
                    assigning
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-orange-600 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
