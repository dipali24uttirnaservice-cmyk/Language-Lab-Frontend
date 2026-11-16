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
  Check,
  CheckCircle2,
  AudioWaveform,
  Award,
  Clock,
  BookOpen,
} from "lucide-react";

import { interactiveLearningApi } from "@/services/interactiveLearning/interactiveLearningApi";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";

export default function AssignInteractiveTaskPage() {
  const router = useRouter();
  const params = useParams();
  const { user: authUser, role: authRole } = useAuth();
  const currentRole = authRole || Cookies.get("role") || "institute";
  const isFaculty = currentRole === "faculty";

  const taskId = useMemo(() => {
    if (!params?.id) return "";
    return Array.isArray(params.id) ? params.id[0] || "" : String(params.id);
  }, [params]);

  const [task, setTask] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]); // Array of "${segment}___${year}"

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH TASK DETAILS
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

        const response = await interactiveLearningApi.getTaskById(taskId);
        const data = response?.data?.data || response?.data || response;
        setTask(data);
      } catch (err) {
        console.error("Fetch interactive task error:", err);
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load reading task details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // =========================================================
  // FETCH DEPARTMENTS
  // =========================================================
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await interactiveLearningApi.getDepartments();
        const data = response?.data?.data || response?.data || response;
        setDepartments(Array.isArray(data) ? data : []);
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
    if (Array.isArray(task?.assigned_batches) && task.assigned_batches.length > 0) {
      return task.assigned_batches;
    }
    if (task?.assigned_department) {
      return [
        {
          segment: task.assigned_department,
          year: task.assigned_batch || "All",
        },
      ];
    }
    return [];
  }, [task]);

  const isAlreadyAssigned = (segment, year) => {
    return alreadyAssignedBatches.some(
      (b) =>
        String(b.segment).toLowerCase() === String(segment).toLowerCase() &&
        (b.year === "All" || Number(b.year) === Number(year))
    );
  };

  // =========================================================
  // AVAILABLE BATCHES FOR SELECTED DEPARTMENTS
  // =========================================================
  const availableBatches = useMemo(() => {
    const list = [];
    departments.forEach((dept) => {
      const deptName = dept?.name || dept;
      if (selectedDepartments.includes(deptName)) {
        const batches = dept?.batches || [
          { year: 1, studentCount: null },
          { year: 2, studentCount: null },
          { year: 3, studentCount: null },
          { year: 4, studentCount: null },
        ];

        batches.forEach((b) => {
          const yearVal = typeof b === "object" ? b.year : b;
          const studentCount = typeof b === "object" ? b.studentCount : null;
          list.push({
            segment: deptName,
            year: yearVal,
            studentCount,
            key: `${deptName}___${yearVal}`,
            isAssigned: isAlreadyAssigned(deptName, yearVal),
          });
        });
      }
    });
    return list;
  }, [departments, selectedDepartments, alreadyAssignedBatches]);

  const isDeptSelected = selectedDepartments.length > 0;

  // =========================================================
  // DEPARTMENT HANDLERS
  // =========================================================
  const handleToggleDepartment = (deptName) => {
    setError("");
    setSelectedDepartments((prev) => {
      const exists = prev.includes(deptName);
      if (exists) {
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
    const all = departments.map((d) => d?.name || d).filter(Boolean);
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

  const handlePrevious = () => {
    router.push("/institute-dashboard/interactive-learning");
  };

  // =========================================================
  // SUBMIT ASSIGNMENT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
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

      await interactiveLearningApi.assignTask(taskId, {
        assignments,
        department: assignments[0]?.segment,
        batch: assignments.length === 1 ? assignments[0]?.year : null,
      });

      router.push("/institute-dashboard/interactive-learning");
    } catch (err) {
      console.error("Assign reading task error:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to assign interactive task."
      );
    } finally {
      setAssigning(false);
    }
  };

  // =========================================================
  // LOADING STATE
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
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
            Back to Interactive Learning
          </button>

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Unable to load reading task
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {error || "The requested interactive task could not be found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================
  const courseTitle =
    task.course_id?.course_name ||
    task.course_id?.title ||
    task.course_title ||
    "Course";
  const topicTitle =
    task.topic_id?.title || task.topic_title || "Topic";

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ================= TOP BACK BUTTON ================= */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={assigning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Interactive Tasks
          </button>
        </div>

        {/* ================= MAIN CARD CONTAINER ================= */}
        <div className="w-full rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header Banner */}
          <div className="flex items-center gap-3 px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
              <AudioWaveform className="w-6 h-6 text-orange-600" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Assign Reading Task
              </h1>
              <p className="text-sm text-slate-500">
                Configure departments and student batches for speech evaluation
              </p>
            </div>
          </div>

          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Step 1: Task Information Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-black">
                  1
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <BookOpen size={16} className="text-orange-600" />
                  <span>Speech Reading Task</span>
                </h3>
              </div>

              <div className="ml-8 mt-1 space-y-2">
                <p className="text-base font-bold text-slate-900">
                  {task?.title || "-"}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
                  <span className="font-semibold text-slate-700">{courseTitle}</span>
                  <span>•</span>
                  <span>{topicTitle}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    Min {task.min_accuracy || 75}%
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <Clock className="w-3.5 h-3.5" />
                    {task.target_wpm || 120} WPM
                  </span>
                </div>

                {task.paragraph && (
                  <p className="text-xs text-slate-600 italic line-clamp-2 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed font-serif">
                    "{task.paragraph}"
                  </p>
                )}

                {alreadyAssignedBatches.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-medium">Currently assigned:</span>
                    {alreadyAssignedBatches.map((b, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {b.segment} - {b.year === "All" ? "All Batches" : `Batch ${b.year}`}
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

            {/* Faculty Scope Alert */}
            {isFaculty && (
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  As faculty, you are authorized to assign tasks to branches and batches assigned to you.
                </span>
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
                Choose the departmental branches eligible for this speech task.
              </p>

              {departments.length === 0 ? (
                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800 font-medium">
                  No departments found for this institute. Ensure students have department assigned in the Students section.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {departments.map((dept) => {
                    const name = dept?.name || dept;
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
                    <span>Step 3: Select Batch(es) *</span>
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
                Select eligible student batches under the chosen department(s).
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

            {/* ================= BUTTONS ================= */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium">
                {selectedBatches.length > 0 ? (
                  <span>
                    Ready to assign <strong className="text-slate-800">{selectedBatches.length}</strong> batch{selectedBatches.length === 1 ? "" : "es"} across <strong className="text-slate-800">{selectedDepartments.length}</strong> department{selectedDepartments.length === 1 ? "" : "s"}.
                  </span>
                ) : (
                  <span>Select department and batch to proceed.</span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={assigning}
                  className="px-6 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-60 shadow-sm cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    selectedDepartments.length === 0 ||
                    selectedBatches.length === 0 ||
                    assigning
                  }
                  className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

