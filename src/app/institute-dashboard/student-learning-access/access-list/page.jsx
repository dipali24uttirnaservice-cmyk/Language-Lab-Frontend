"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  BookOpen,
  ChevronDown,
  Check,
  GraduationCap,
  Building2,
  Layers3,
  Save,
  Search,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  BookMarked,
  X,
  Plus,
  Edit3,
  ArrowLeft,
  Eye,
  Trash2,
  Loader2,
  PlayCircle,
  Headphones,
  FileText,
  CheckSquare,
} from "lucide-react";

import { courseApi } from "@/services/course/courseApi";
import { studentLearningAccessApi } from "@/services/institute/studentLearningAccessApi";

/* =========================================================
   CHECKBOX & SELECT COMPONENTS
========================================================= */

function Checkbox({ checked, indeterminate = false, onChange }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className="flex-shrink-0 focus:outline-none transition-transform active:scale-95"
      aria-label="checkbox"
    >
      {checked ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-orange-600 text-white shadow-md shadow-orange-200 transition-all">
          <Check size={13} strokeWidth={3} />
        </span>
      ) : indeterminate ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-lg border-2 border-orange-600 bg-orange-50 transition-all">
          <span className="h-0.5 w-2.5 rounded-full bg-orange-600" />
        </span>
      ) : (
        <span className="block h-5 w-5 rounded-lg border-2 border-amber-200 bg-white transition-all hover:border-orange-400 hover:bg-orange-50/30" />
      )}
    </button>
  );
}

function SelectField({ label, value, onChange, placeholder, options, disabled = false, loading = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled || loading}
          className="h-12 w-full appearance-none rounded-xl border border-orange-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
        >
          <option value="" disabled>
            {loading ? "Loading..." : placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {loading ? (
          <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 animate-spin pointer-events-none" />
        ) : (
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PARENT COMPONENT: MODULE MANAGEMENT DASHBOARD & FORM
========================================================= */

export default function LearningModuleApp() {
  const [view, setView] = useState("list"); // "list" | "form"
  const [editingModuleId, setEditingModuleId] = useState(null);

  // ── List data ─────────────────────────────────────────
  const [configuredModules, setConfiguredModules] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterTopic, setFilterTopic] = useState("");

  // ── Reference data (courses, topics-for-course, departments) ──
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [topics, setTopics] = useState([]); // topics of the currently selected course, each with embedded subtopics
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [departments, setDepartments] = useState([]); // [{ name, batches: [{ year, studentCount }] }]
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  // Form states
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [subtopicSearch, setSubtopicSearch] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingModule, setViewingModule] = useState(null); // For Eye click summary card
  const [deletingId, setDeletingId] = useState(null);
  const [activeSubtopicModal, setActiveSubtopicModal] = useState(null); // subtopic clicked in Step 3
  const [subtopicLessons, setSubtopicLessons] = useState([]);
  const [subtopicLessonsLoading, setSubtopicLessonsLoading] = useState(false);

  /* =======================================================
     DATA FETCHING
  ======================================================= */

  const fetchList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await studentLearningAccessApi.getAll();
      setConfiguredModules(res?.data?.data?.records ?? []);
    } catch (err) {
      setListError(
        err?.response?.data?.message || "Failed to load learning access modules.",
      );
    } finally {
      setListLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await courseApi.getCourses();
      const allCourses = res?.data?.data?.courses ?? [];
      setCourses(allCourses.filter((c) => c.is_downloaded));
    } catch {
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    setDepartmentsLoading(true);
    try {
      const res = await studentLearningAccessApi.getDepartments();
      setDepartments(res?.data?.data ?? []);
    } catch {
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  }, []);

  const fetchTopicsForCourse = useCallback(async (selectedCourseId) => {
    if (!selectedCourseId) {
      setTopics([]);
      return [];
    }
    setTopicsLoading(true);
    try {
      const res = await studentLearningAccessApi.getTopicsByCourse(selectedCourseId);
      const fetchedTopics = res?.data?.data ?? [];
      setTopics(fetchedTopics);
      return fetchedTopics;
    } catch {
      setTopics([]);
      return [];
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
    fetchCourses();
    fetchDepartments();
  }, [fetchList, fetchCourses, fetchDepartments]);

  /* =======================================================
     FORM HANDLERS
  ======================================================= */

  const resetFormState = () => {
    setEditingModuleId(null);
    setCourseId("");
    setTopicId("");
    setSelectedSubtopics([]);
    setSubtopicSearch("");
    setDepartmentName("");
    setSelectedYear("");
    setTopics([]);
    setFormError("");
  };

  const handleOpenCreateForm = () => {
    resetFormState();
    setView("form");
  };

  const handleOpenEditForm = async (mod) => {
    setFormError("");
    setEditingModuleId(mod._id);
    setCourseId(mod.course_id);
    setDepartmentName(mod.segment);
    setSelectedYear(String(mod.year));
    setSubtopicSearch("");
    setView("form");

    // The record's department/batch may no longer have any active students
    // (e.g. batch graduated) — keep it selectable in the form regardless,
    // since it's still the value actually saved on this record.
    setDepartments((prev) => {
      const existingDept = prev.find((d) => d.name === mod.segment);
      if (existingDept?.batches.some((b) => b.year === mod.year)) return prev;
      if (existingDept) {
        return prev.map((d) =>
          d.name === mod.segment
            ? { ...d, batches: [...d.batches, { year: mod.year, studentCount: mod.student_count ?? 0 }] }
            : d,
        );
      }
      return [...prev, { name: mod.segment, batches: [{ year: mod.year, studentCount: mod.student_count ?? 0 }] }];
    });

    const fetchedTopics = await fetchTopicsForCourse(mod.course_id);
    setTopicId(mod.topic_id);
    const matchingTopic = fetchedTopics.find((t) => t._id === mod.topic_id);
    const validSubtopicIds = new Set((matchingTopic?.subtopics ?? []).map((s) => s._id));
    setSelectedSubtopics((mod.subtopic_ids ?? []).filter((id) => validSubtopicIds.has(id)));
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this module access?")) return;
    setDeletingId(id);
    try {
      await studentLearningAccessApi.remove(id);
      setConfiguredModules((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete this module access.");
    } finally {
      setDeletingId(null);
    }
  };

  const getModuleTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <PlayCircle size={15} className="text-orange-500" />;
      case "audio":
        return <Headphones size={15} className="text-amber-500" />;
      case "text":
        return <FileText size={15} className="text-blue-500" />;
      case "exercise":
        return <CheckSquare size={15} className="text-emerald-500" />;
      default:
        return <BookMarked size={15} className="text-purple-500" />;
    }
  };

  const handleOpenSubtopicModal = async (subtopic) => {
    setActiveSubtopicModal(subtopic);
    setSubtopicLessons([]);
    setSubtopicLessonsLoading(true);
    try {
      const res = await studentLearningAccessApi.getSubtopicModules(subtopic._id);
      setSubtopicLessons(res?.data?.data?.modules ?? []);
    } catch {
      setSubtopicLessons([]);
    } finally {
      setSubtopicLessonsLoading(false);
    }
  };

  const selectedTopic = topics.find((topic) => topic._id === topicId);
  const availableSubtopics = selectedTopic?.subtopics || [];

  const filteredSubtopics = useMemo(() => {
    return availableSubtopics.filter((sub) =>
      sub.title.toLowerCase().includes(subtopicSearch.toLowerCase()),
    );
  }, [availableSubtopics, subtopicSearch]);

  const selectedDepartment = departments.find((dept) => dept.name === departmentName);
  const availableBatches = selectedDepartment?.batches || [];

  const handleCourseChange = (value) => {
    setCourseId(value);
    setTopicId("");
    setSelectedSubtopics([]);
    setSubtopicSearch("");
    fetchTopicsForCourse(value);
  };

  const handleTopicChange = (value) => {
    setTopicId(value);
    setSelectedSubtopics([]);
    setSubtopicSearch("");
  };

  const handleDepartmentChange = (value) => {
    setDepartmentName(value);
    setSelectedYear("");
  };

  const toggleSubtopic = (subtopicId) => {
    if (selectedSubtopics.includes(subtopicId)) {
      setSelectedSubtopics((prev) => prev.filter((id) => id !== subtopicId));
      return;
    }
    setSelectedSubtopics((prev) => [...prev, subtopicId]);
  };

  const allSubtopicsSelected =
    availableSubtopics.length > 0 &&
    selectedSubtopics.length === availableSubtopics.length;
  const someSubtopicsSelected =
    selectedSubtopics.length > 0 && selectedSubtopics.length < availableSubtopics.length;

  const toggleAllSubtopics = () => {
    if (allSubtopicsSelected) {
      setSelectedSubtopics([]);
      return;
    }
    setSelectedSubtopics(availableSubtopics.map((sub) => sub._id));
  };

  const handleReviewForm = (event) => {
    event.preventDefault();
    setFormError("");
    if (!courseId) return setFormError("Please select a course.");
    if (!topicId) return setFormError("Please select a topic.");
    if (selectedSubtopics.length === 0) return setFormError("Please select at least one subtopic.");
    if (!departmentName) return setFormError("Please select a department.");
    if (!selectedYear) return setFormError("Please select a batch.");

    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    const payload = {
      course_id: courseId,
      topic_id: topicId,
      subtopic_ids: selectedSubtopics,
      segment: departmentName,
      year: Number(selectedYear),
    };

    setSubmitting(true);
    setFormError("");
    try {
      if (editingModuleId) {
        await studentLearningAccessApi.update(editingModuleId, payload);
      } else {
        await studentLearningAccessApi.create(payload);
      }
      setIsModalOpen(false);
      setView("list");
      await fetchList();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to save this configuration.");
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const displayedModules = useMemo(() => {
    return configuredModules.filter((mod) => {
      const matchesSearch =
        !searchQuery ||
        mod.course?.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.topic?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.segment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(mod.year).includes(searchQuery.toLowerCase());

      const matchesCourse = !filterCourse || mod.course_id === filterCourse;
      const matchesTopic = !filterTopic || mod.topic_id === filterTopic;

      return matchesSearch && matchesCourse && matchesTopic;
    });
  }, [configuredModules, searchQuery, filterCourse, filterTopic]);

  // Distinct course/topic options for the list's filter dropdowns, derived
  // from whatever's actually in the fetched list (works even before the
  // course/topic reference data below has loaded).
  const filterCourseOptions = useMemo(() => {
    const seen = new Map();
    configuredModules.forEach((m) => {
      if (m.course_id && !seen.has(m.course_id)) seen.set(m.course_id, m.course?.course_name);
    });
    return Array.from(seen, ([value, label]) => ({ value, label: label || "Untitled Course" }));
  }, [configuredModules]);

  const filterTopicOptions = useMemo(() => {
    const seen = new Map();
    configuredModules.forEach((m) => {
      if (m.topic_id && !seen.has(m.topic_id)) seen.set(m.topic_id, m.topic?.title);
    });
    return Array.from(seen, ([value, label]) => ({ value, label: label || "Untitled Topic" }));
  }, [configuredModules]);

  /* =======================================================
     RENDER VIEW: LIST
  ================================================ ======= */
  if (view === "list") {
    return (
      <div className="min-h-screen bg-[#FFFDF9] px-8 py-8 font-sans">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/60 px-2.5 py-1 rounded-md">
              Academic Resources
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
              Learning <span className="text-orange-600">Modules</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage curriculum modules, departmental batch allocations, and student access efficiently.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:shadow-xl hover:from-orange-600 hover:to-amber-600 active:scale-95 self-start md:self-auto"
          >
            <Plus size={18} /> Add Module
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-orange-200/60 bg-white p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search module by title, department or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-orange-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="h-12 w-full rounded-xl border border-orange-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 cursor-pointer"
            >
              <option value="">All Courses</option>
              {filterCourseOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-64">
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="h-12 w-full rounded-xl border border-orange-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 cursor-pointer"
            >
              <option value="">All Topics</option>
              {filterTopicOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-200/60 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-orange-100 bg-orange-50/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6 w-16">Sr. No.</th>
                  <th className="py-4 px-6">Course</th>
                  <th className="py-4 px-6">Topic</th>
                  <th className="py-4 px-6">Department & Batch</th>
                  <th className="py-4 px-6 text-center">Student Count</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50 text-sm text-slate-700">
                {listLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      <Loader2 size={18} className="inline animate-spin mr-2" /> Loading learning modules...
                    </td>
                  </tr>
                ) : listError ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-rose-500">
                      {listError}
                    </td>
                  </tr>
                ) : displayedModules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      No learning modules found matching your filters.
                    </td>
                  </tr>
                ) : (
                  displayedModules.map((mod, index) => (
                    <tr key={mod._id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-400">{index + 1}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{mod.course?.course_name || "-"}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{mod.topic?.title || "-"}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Building2 size={11} /> {mod.segment}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md">
                            <GraduationCap size={11} /> {mod.year}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-bold text-orange-600">
                          {mod.student_count ?? 0} Students
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingModule(mod)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition shadow-2xs"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(mod)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition shadow-2xs"
                            title="Edit Module"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(mod._id)}
                            disabled={deletingId === mod._id}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition shadow-2xs disabled:opacity-50"
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
        </div>

        {/* VIEW DETAILS MODAL (Summary Card) */}
        {viewingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-orange-100 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-orange-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 border border-orange-200">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Module Access Summary</h3>
                    <p className="text-xs text-slate-400">Detailed overview of configured learning access</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingModule(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-2xl bg-orange-50/40 border border-orange-100 p-4 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Course</span>
                    <p className="font-bold text-slate-800">{viewingModule.course?.course_name}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Topic</span>
                    <p className="font-semibold text-slate-700">{viewingModule.topic?.title}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Selected Subtopics</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(viewingModule.subtopics ?? []).map((sub) => (
                      <span key={sub._id} className="rounded-lg bg-orange-100/60 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-orange-800">
                        {sub.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                    <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                      <Building2 size={12} /> Department
                    </span>
                    <p className="font-semibold text-slate-800 mt-1 text-xs">{viewingModule.segment}</p>
                  </div>
                  <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3">
                    <span className="text-[11px] font-bold text-orange-800 uppercase flex items-center gap-1">
                      <GraduationCap size={12} /> Batch & Students
                    </span>
                    <p className="font-semibold text-slate-800 mt-1 text-xs">
                      {viewingModule.year} ({viewingModule.student_count ?? 0} students)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingModule(null)}
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =======================================================
     RENDER VIEW: FORM
  ================================================ ======= */
  return (
    <div className="min-h-screen bg-[#FFFDF9] pb-16 font-sans">
      <div className="backdrop-blur-md sticky top-0 z-30 shadow-xs bg-white/80">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setView("list")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 bg-white text-slate-600 shadow-xs hover:bg-orange-50 transition"
              aria-label="Back to List"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {editingModuleId ? "Edit Student Learning Access" : "Create Student Learning Access"}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
                  <Sparkles size={11} /> StudentLearningAccessPage
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure curriculum content courses, topics, and target batches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const currentCourseId = courseId;
                setTopicId("");
                setSelectedSubtopics([]);
                setSubtopicSearch("");
                setDepartmentName("");
                setSelectedYear("");
                setFormError("");
                if (currentCourseId) fetchTopicsForCourse(currentCourseId);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-orange-50/50 active:scale-95"
            >
              <RotateCcw size={13} className="text-orange-600" /> Reset Form
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-6 mt-6">
        {formError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
            {formError}
          </div>
        )}

        <form onSubmit={handleReviewForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-orange-300">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                  <BookMarked size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">Step 1: Course Selection</h2>
                  <p className="text-[11px] text-slate-400">Select curriculum course</p>
                </div>
              </div>

              <SelectField
                label="Course"
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                placeholder={courses.length ? "Select Course" : "No downloaded courses available"}
                options={courses.map((c) => ({ value: c._id, label: c.course_name }))}
                loading={coursesLoading}
              />
            </div>

            <div className={`rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-orange-300 ${!courseId ? "opacity-55 pointer-events-none" : "animate-fadeIn"}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                  <Layers3 size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">Step 2: Core Topic</h2>
                  <p className="text-[11px] text-slate-400">Select topic from the chosen course</p>
                </div>
              </div>

              <SelectField
                label="Topic Selection"
                value={topicId}
                onChange={(e) => handleTopicChange(e.target.value)}
                placeholder={courseId ? "Select Topic" : "First select a course"}
                options={topics.map((t) => ({ value: t._id, label: t.title }))}
                disabled={!courseId}
                loading={topicsLoading}
              />
            </div>
          </div>

          {topicId && (
            <div className="overflow-hidden rounded-2xl border border-orange-200/60 bg-white shadow-sm transition-all animate-fadeIn">
              <div className="flex flex-col gap-3 border-b border-orange-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-orange-50/30">
                <div>
                  <h2 className="font-bold text-slate-800 text-base">Step 3: Subtopics</h2>
                  <p className="text-xs text-slate-400">Select the subtopics students should get access to</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                    <input
                      type="text"
                      placeholder="Search subtopics..."
                      value={subtopicSearch}
                      onChange={(e) => setSubtopicSearch(e.target.value)}
                      className="h-9 w-48 rounded-xl border border-orange-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <span className="rounded-xl bg-orange-100/70 border border-orange-200 px-3 py-1.5 text-xs font-bold text-orange-700">
                    {selectedSubtopics.length} / {availableSubtopics.length} Selected
                  </span>
                </div>
              </div>

              <div className="border-b border-orange-100/55 bg-orange-50/10 px-6 py-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={allSubtopicsSelected}
                    indeterminate={someSubtopicsSelected}
                    onChange={toggleAllSubtopics}
                  />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Select All Subtopics
                  </span>
                </div>
              </div>

              <div className="divide-y divide-orange-50 max-h-80 overflow-y-auto">
                {filteredSubtopics.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No subtopics found matching your search.</div>
                ) : (
                  filteredSubtopics.map((subtopic) => {
                    const checked = selectedSubtopics.includes(subtopic._id);

                    return (
                      <div
                        key={subtopic._id}
                        onClick={() => handleOpenSubtopicModal(subtopic)}
                        className={`flex items-center gap-4 px-6 py-3.5 transition cursor-pointer ${
                          checked ? "bg-orange-50/50" : "hover:bg-orange-50/20"
                        }`}
                      >
                        <Checkbox checked={checked} onChange={() => toggleSubtopic(subtopic._id)} />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 hover:text-orange-600 transition-colors">
                            {subtopic.title}{" "}
                            <span className="text-[11px] font-normal text-slate-400 ml-1">(Click to view lessons)</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-orange-700">
                            {subtopic.lesson_count ?? 0} Lessons
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-orange-300 ${selectedSubtopics.length === 0 ? "opacity-55 pointer-events-none" : "animate-fadeIn"}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">Step 4: Department Selection</h2>
                  <p className="text-[11px] text-slate-400">Select target academic department</p>
                </div>
              </div>

              <SelectField
                label="Department"
                value={departmentName}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                placeholder={
                  departments.length
                    ? selectedSubtopics.length > 0
                      ? "Select Department"
                      : "First select subtopics"
                    : "No students found for this institute"
                }
                options={departments.map((d) => ({ value: d.name, label: d.name }))}
                disabled={selectedSubtopics.length === 0}
                loading={departmentsLoading}
              />
            </div>

            <div className={`rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-orange-300 ${!departmentName ? "opacity-55 pointer-events-none" : "animate-fadeIn"}`}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">Step 5: Batch Selection</h2>
                  <p className="text-[11px] text-slate-400">Select target batch</p>
                </div>
              </div>

              <SelectField
                label="Batch"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                placeholder={departmentName ? "Select Batch" : "First select department"}
                options={availableBatches.map((b) => ({
                  value: String(b.year),
                  label: `${b.year} (${b.studentCount} students)`,
                }))}
                disabled={!departmentName}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setView("list")}
              className="rounded-xl border border-orange-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 hover:bg-orange-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-amber-600 transition"
            >
              <Save size={16} /> Save & Review Configuration
            </button>
          </div>
        </form>
      </div>

      {/* SUBTOPIC LESSONS MODAL */}
      {activeSubtopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-orange-100 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 border border-orange-200">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{activeSubtopicModal.title}</h3>
                  <p className="text-xs text-slate-400">Subtopic lesson modules overview</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubtopicModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Included Lessons & Modules</p>
              {subtopicLessonsLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Loader2 size={18} className="inline animate-spin mr-2" /> Loading lessons...
                </div>
              ) : subtopicLessons.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No lessons have been added to this subtopic yet.</div>
              ) : (
                subtopicLessons.map((lesson) => (
                  <div key={lesson._id} className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/30 p-3">
                    <div className="flex items-center gap-2.5">
                      {getModuleTypeIcon(lesson.type)}
                      <span className="text-xs font-semibold text-slate-800">{lesson.title}</span>
                    </div>
                    <span className="text-[11px] font-bold text-orange-700 bg-orange-100/60 px-2 py-0.5 rounded-md capitalize">
                      {lesson.type}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-orange-100">
              <span className="text-xs text-slate-500 font-medium">
                Total Lessons: <strong className="text-slate-800">{subtopicLessons.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  toggleSubtopic(activeSubtopicModal._id);
                  setActiveSubtopicModal(null);
                }}
                className={`rounded-xl px-5 py-2 text-xs font-semibold transition shadow-xs ${
                  selectedSubtopics.includes(activeSubtopicModal._id)
                    ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                {selectedSubtopics.includes(activeSubtopicModal._id) ? "Deselect Subtopic" : "Select Subtopic"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMISSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-orange-100 animate-fadeIn text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Confirm Module Access Setup</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are about to configure learning resource access for the selected department and batch.
            </p>

            <div className="mt-6 flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="rounded-xl border border-orange-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-orange-50 transition disabled:opacity-50"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition disabled:opacity-60"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
