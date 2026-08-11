"use client";

import React, { useMemo, useState } from "react";
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
  PlayCircle,
  Headphones,
  FileText,
  CheckSquare,
  Plus,
  Edit3,
  Users,
  ArrowLeft,
  Eye,
  Send,
  Trash2,
} from "lucide-react";

/* =========================================================
   DUMMY COURSE & TOPIC DATA (Courses -> Topics -> Subtopics -> Modules)
========================================================= */

const courses = [
  {
    id: "course-1",
    name: "Foundation English & Communication",
    topics: [
      {
        id: "topic-1",
        name: "English Grammar",
        subtopics: [
          {
            id: "subtopic-1",
            name: "Tenses",
            modules: [
              { id: "module-1", title: "Introduction to Tenses", type: "video", lessons: 4 },
              { id: "module-2", title: "Tenses Explanation", type: "audio", lessons: 3 },
              { id: "module-3", title: "Tenses Notes", type: "text", lessons: 5 },
              { id: "module-4", title: "Tenses Practice", type: "exercise", lessons: 10 },
            ],
          },
          {
            id: "subtopic-2",
            name: "Articles",
            modules: [
              { id: "module-5", title: "Introduction to Articles", type: "video", lessons: 3 },
              { id: "module-6", title: "Articles Audio Lesson", type: "audio", lessons: 4 },
              { id: "module-7", title: "Articles Notes", type: "text", lessons: 3 },
              { id: "module-8", title: "Articles Practice", type: "exercise", lessons: 12 },
            ],
          },
        ],
      },
      {
        id: "topic-2",
        name: "Communication Skills",
        subtopics: [
          {
            id: "subtopic-4",
            name: "Speaking Skills",
            modules: [
              { id: "module-13", title: "Introduction to Speaking", type: "video", lessons: 5 },
              { id: "module-14", title: "Speaking Practice Audio", type: "audio", lessons: 6 },
              { id: "module-15", title: "Speaking Exercise", type: "exercise", lessons: 10 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-2",
    name: "Advanced Professional English",
    topics: [
      {
        id: "topic-3",
        name: "Vocabulary",
        subtopics: [
          {
            id: "subtopic-7",
            name: "Business Vocabulary",
            modules: [
              { id: "module-21", title: "Business Words", type: "video", lessons: 8 },
              { id: "module-22", title: "Business Vocabulary Practice", type: "exercise", lessons: 20 },
            ],
          },
        ],
      },
    ],
  },
];

/* =========================================================
   DUMMY DEPARTMENT & BATCH DATA
========================================================= */

const departments = [
  {
    id: "dept-1",
    name: "Computer Science",
    batches: [
      { id: "batch-1", name: "2026 - Batch A", studentCount: 64 },
      { id: "batch-2", name: "2026 - Batch B", studentCount: 58 },
      { id: "batch-3", name: "2025 - Batch A", studentCount: 50 },
    ],
  },
  {
    id: "dept-2",
    name: "Information Technology",
    batches: [
      { id: "batch-4", name: "2026 - Batch A", studentCount: 60 },
      { id: "batch-5", name: "2026 - Batch B", studentCount: 55 },
    ],
  },
  {
    id: "dept-3",
    name: "Electronics",
    batches: [
      { id: "batch-6", name: "2026 - Batch A", studentCount: 45 },
      { id: "batch-7", name: "2025 - Batch A", studentCount: 42 },
    ],
  },
];

/* =========================================================
   INITIAL CONFIGURED MODULES (Mock Database List)
========================================================= */

const initialConfiguredModules = [
  {
    id: "mod-config-1",
    course_id: "course-1",
    topic_id: "topic-1",
    subtopic_ids: ["subtopic-1", "subtopic-2"],
    department_id: "dept-1",
    batch_id: "batch-1",
  },
  {
    id: "mod-config-2",
    course_id: "course-2",
    topic_id: "topic-3",
    subtopic_ids: ["subtopic-7"],
    department_id: "dept-2",
    batch_id: "batch-4",
  },
];

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

function SelectField({ label, value, onChange, placeholder, options, disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="h-12 w-full appearance-none rounded-xl border border-orange-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* =========================================================
   PARENT COMPONENT: MODULE MANAGEMENT DASHBOARD & FORM
========================================================= */

export default function LearningModuleApp() {
  const [view, setView] = useState("list"); // "list" | "form"
  const [configuredModules, setConfiguredModules] = useState(initialConfiguredModules);
  const [editingModuleId, setEditingModuleId] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterTopic, setFilterTopic] = useState("");

  // Form states
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [selectedSubtopics, setSelectedSubtopics] = useState([]);
  const [subtopicSearch, setSubtopicSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSubtopicModal, setActiveSubtopicModal] = useState(null);
  const [viewingModule, setViewingModule] = useState(null); // For Eye click summary card

  const handleOpenCreateForm = () => {
    setEditingModuleId(null);
    setCourseId("");
    setTopicId("");
    setSelectedSubtopics([]);
    setSubtopicSearch("");
    setDepartmentId("");
    setSelectedBatchId("");
    setView("form");
  };

  const handleOpenEditForm = (mod) => {
    setEditingModuleId(mod.id);
    setCourseId(mod.course_id);
    setTopicId(mod.topic_id);
    setSelectedSubtopics(mod.subtopic_ids);
    setSubtopicSearch("");
    setDepartmentId(mod.department_id);
    setSelectedBatchId(mod.batch_id);
    setView("form");
  };

  const handleDeleteModule = (id) => {
    if (window.confirm("Are you sure you want to delete this module access?")) {
      setConfiguredModules((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const selectedCourse = courses.find((course) => course.id === courseId);
  const availableTopics = selectedCourse?.topics || [];

  const selectedTopic = availableTopics.find((topic) => topic.id === topicId);
  const availableSubtopics = selectedTopic?.subtopics || [];

  const filteredSubtopics = useMemo(() => {
    return availableSubtopics.filter((sub) =>
      sub.name.toLowerCase().includes(subtopicSearch.toLowerCase())
    );
  }, [availableSubtopics, subtopicSearch]);

  const selectedDepartment = departments.find((dept) => dept.id === departmentId);
  const availableBatches = selectedDepartment?.batches || [];

  const handleCourseChange = (value) => {
    setCourseId(value);
    setTopicId("");
    setSelectedSubtopics([]);
    setSubtopicSearch("");
  };

  const handleTopicChange = (value) => {
    setTopicId(value);
    setSelectedSubtopics([]);
    setSubtopicSearch("");
  };

  const handleDepartmentChange = (value) => {
    setDepartmentId(value);
    setSelectedBatchId("");
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
    setSelectedSubtopics(availableSubtopics.map((sub) => sub.id));
  };

  const handleReviewForm = (event) => {
    event.preventDefault();
    if (!courseId) return alert("Please select a course.");
    if (!topicId) return alert("Please select a topic.");
    if (selectedSubtopics.length === 0) return alert("Please select at least one subtopic.");
    if (!departmentId) return alert("Please select a department.");
    if (!selectedBatchId) return alert("Please select a batch.");

    setIsModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    const payload = {
      id: editingModuleId || `mod-config-${Date.now()}`,
      course_id: courseId,
      topic_id: topicId,
      subtopic_ids: selectedSubtopics,
      department_id: departmentId,
      batch_id: selectedBatchId,
    };

    if (editingModuleId) {
      setConfiguredModules((prev) =>
        prev.map((item) => (item.id === editingModuleId ? payload : item))
      );
      alert("Learning module updated successfully!");
    } else {
      setConfiguredModules((prev) => [payload, ...prev]);
      alert("Student learning access module configured successfully!");
    }

    setIsModalOpen(false);
    setView("list");
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
        return <BookOpen size={15} className="text-slate-500" />;
    }
  };

  const displayedModules = useMemo(() => {
    return configuredModules.filter((mod) => {
      const courseObj = courses.find((c) => c.id === mod.course_id);
      const topicObj = courseObj?.topics.find((t) => t.id === mod.topic_id);
      const deptObj = departments.find((d) => d.id === mod.department_id);
      const batchObj = deptObj?.batches.find((b) => b.id === mod.batch_id);

      const matchesSearch =
        !searchQuery ||
        courseObj?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topicObj?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deptObj?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batchObj?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourse = !filterCourse || mod.course_id === filterCourse;
      const matchesTopic = !filterTopic || mod.topic_id === filterTopic;

      return matchesSearch && matchesCourse && matchesTopic;
    });
  }, [configuredModules, searchQuery, filterCourse, filterTopic]);

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
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
              {courses.flatMap(c => c.topics).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
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
                {displayedModules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      No learning modules found matching your filters.
                    </td>
                  </tr>
                ) : (
                  displayedModules.map((mod, index) => {
                    const courseObj = courses.find((c) => c.id === mod.course_id);
                    const topicObj = courseObj?.topics.find((t) => t.id === mod.topic_id);
                    const deptObj = departments.find((d) => d.id === mod.department_id);
                    const batchObj = deptObj?.batches.find((b) => b.id === mod.batch_id);

                    return (
                      <tr key={mod.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-400">{index + 1}</td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{courseObj?.name || "-"}</td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{topicObj?.name || "-"}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                              <Building2 size={11} /> {deptObj?.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md">
                              <GraduationCap size={11} /> {batchObj?.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-bold text-orange-600">
                            {batchObj?.studentCount || 0} Students
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
                              onClick={() => handleDeleteModule(mod.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition shadow-2xs"
                              title="Delete Module"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* VIEW DETAILS MODAL (Summary Card) */}
        {viewingModule && (() => {
          const courseObj = courses.find((c) => c.id === viewingModule.course_id);
          const topicObj = courseObj?.topics.find((t) => t.id === viewingModule.topic_id);
          const subtopicsList = topicObj?.subtopics.filter((sub) => viewingModule.subtopic_ids.includes(sub.id)) || [];
          const deptObj = departments.find((d) => d.id === viewingModule.department_id);
          const batchObj = deptObj?.batches.find((b) => b.id === viewingModule.batch_id);

          return (
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
                      <p className="font-bold text-slate-800">{courseObj?.name}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Topic</span>
                      <p className="font-semibold text-slate-700">{topicObj?.name}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Selected Subtopics</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {subtopicsList.map((sub) => (
                        <span key={sub.id} className="rounded-lg bg-orange-100/60 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-orange-800">
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                      <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                        <Building2 size={12} /> Department
                      </span>
                      <p className="font-semibold text-slate-800 mt-1 text-xs">{deptObj?.name}</p>
                    </div>
                    <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3">
                      <span className="text-[11px] font-bold text-orange-800 uppercase flex items-center gap-1">
                        <GraduationCap size={12} /> Batch & Students
                      </span>
                      <p className="font-semibold text-slate-800 mt-1 text-xs">{batchObj?.name} ({batchObj?.studentCount} students)</p>
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
          );
        })()}
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
                setCourseId("");
                setTopicId("");
                setSelectedSubtopics([]);
                setSubtopicSearch("");
                setDepartmentId("");
                setSelectedBatchId("");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-orange-50/50 active:scale-95"
            >
              <RotateCcw size={13} className="text-orange-600" /> Reset Form
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-6 mt-6">
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
                placeholder="Select Course"
                options={courses.map((c) => ({ value: c.id, label: c.name }))}
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
                options={availableTopics.map((t) => ({ value: t.id, label: t.name }))}
                disabled={!courseId}
              />
            </div>
          </div>

          {topicId && (
            <div className="overflow-hidden rounded-2xl border border-orange-200/60 bg-white shadow-sm transition-all animate-fadeIn">
              <div className="flex flex-col gap-3 border-b border-orange-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-orange-50/30">
                <div>
                  <h2 className="font-bold text-slate-800 text-base">Step 3: Subtopics</h2>
                  <p className="text-xs text-slate-400">Click any subtopic row to view lessons, or use checkboxes</p>
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
                    const checked = selectedSubtopics.includes(subtopic.id);
                    const lessonCount = subtopic.modules.reduce((t, m) => t + m.lessons, 0);

                    return (
                      <div
                        key={subtopic.id}
                        onClick={() => setActiveSubtopicModal(subtopic)}
                        className={`flex items-center gap-4 px-6 py-3.5 transition cursor-pointer ${
                          checked ? "bg-orange-50/50" : "hover:bg-orange-50/20"
                        }`}
                      >
                        <Checkbox checked={checked} onChange={() => toggleSubtopic(subtopic.id)} />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 hover:text-orange-600 transition-colors">
                            {subtopic.name} <span className="text-[11px] font-normal text-slate-400 ml-1">(Click to view lessons)</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{subtopic.modules.length} learning modules available</p>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-orange-700">
                            {lessonCount} Lessons
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
                value={departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                placeholder={selectedSubtopics.length > 0 ? "Select Department" : "First select subtopics"}
                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                disabled={selectedSubtopics.length === 0}
              />
            </div>

            <div className={`rounded-2xl border border-orange-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-orange-300 ${!departmentId ? "opacity-55 pointer-events-none" : "animate-fadeIn"}`}>
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
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                placeholder={departmentId ? "Select Batch" : "First select department"}
                options={availableBatches.map((b) => ({ value: b.id, label: `${b.name} (${b.studentCount} students)` }))}
                disabled={!departmentId}
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
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-orange-100 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{activeSubtopicModal.name}</h3>
                <p className="text-xs text-slate-400">Included modules and lesson breakdown</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubtopicModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto">
              {activeSubtopicModal.modules.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/30 p-3">
                  <div className="flex items-center gap-2.5">
                    {getModuleTypeIcon(m.type)}
                    <span className="text-xs font-semibold text-slate-800">{m.title}</span>
                  </div>
                  <span className="text-[11px] font-bold text-orange-700 bg-orange-100/60 px-2 py-0.5 rounded-md">
                    {m.lessons} Lessons
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSubtopicModal(null)}
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition"
              >
                Done
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
                className="rounded-xl border border-orange-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-orange-50 transition"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}