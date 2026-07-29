"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  CheckCircle2,
  Send,
  ClipboardList,
  Users,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  HelpCircle,
  ListChecks,
  PenLine,
  ToggleLeft,
  MessageSquare,
  Shuffle,
  Mic,
  Sparkles,
  Clock,
  Award,
  FileText,
  Link2,
  Video,
  Music,
  File,
  Info,
  Layers,
  UserCog,
} from "lucide-react";

import { taskApi } from "@/services/task/taskApi";
import { courseApi } from "@/services/course/courseApi";
import { studentApi } from "@/services/student/studentApi";
import { topicApi } from "@/services/topic/topicApi";
import StatusModal from "@/components/molecules/StatusModal";
import ConfirmModal from "@/components/molecules/ConfirmModal";
import RichTextEditor from "@/components/molecules/RichTextEditor";

const MEDIA_TYPES = ["audio", "video", "document"];
const CHECKPOINT_TYPES = ["audio", "video"];

// Icon + gradient per task type — mirrors the Admin Panel's module-row
// treatment (colored icon badge) used across its Text/Video/Audio lists.
const TASK_TYPE_META = {
  text: { label: "Text", Icon: FileText, gradient: "from-blue-500 to-blue-600" },
  link: { label: "Link", Icon: Link2, gradient: "from-slate-500 to-slate-600" },
  audio: { label: "Audio", Icon: Music, gradient: "from-teal-500 to-teal-600" },
  video: { label: "Video", Icon: Video, gradient: "from-purple-500 to-purple-600" },
  document: { label: "Document", Icon: File, gradient: "from-amber-500 to-amber-600" },
};

const STATUS_META = {
  published: { label: "Published", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  draft: { label: "Draft", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  closed: { label: "Closed", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

// Groups the Create Task form into labeled sections (Basic Info / Content /
// Assignment) so a long form reads as a sequence of clear steps.
function SectionDivider({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// Same question_type enum as the Task model's questionSchema.
const QUESTION_TYPES = [
  "mcq",
  "fill_blank",
  "true_false",
  "short_answer",
  "match",
  "recorder",
  "spell_word",
];
// These types answer via a list of options; "match" uses match_pairs instead,
// "short_answer" takes free text in Correct Answer only.
const OPTION_BASED_TYPES = ["mcq", "fill_blank", "true_false", "recorder", "spell_word"];

// Icon + accent per question_type — same palette family as the rest of the
// institute-dashboard (each module gets its own hue), scoped down to badges.
const QUESTION_TYPE_META = {
  mcq: { label: "Multiple Choice", Icon: ListChecks, color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
  fill_blank: { label: "Fill in the Blank", Icon: PenLine, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  true_false: { label: "True / False", Icon: ToggleLeft, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  short_answer: { label: "Short Answer", Icon: MessageSquare, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  match: { label: "Match the Pairs", Icon: Shuffle, color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200" },
  recorder: { label: "Recorder", Icon: Mic, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  spell_word: { label: "Spell the Word", Icon: Sparkles, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
};

const blankQuestion = () => ({
  question_text: "",
  question_type: QUESTION_TYPES[0],
  options: ["", ""],
  match_pairs: [],
  correct_answer: "",
  explanation: "",
  marks: 1,
  timestamp_sec: "",
});

export default function StudentTaskPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "create"

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [submissionsByTask, setSubmissionsByTask] = useState({});
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const [modal, setModal] = useState({ open: false, type: "success", title: "", message: "" });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  // Form state
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskInstructions, setTaskInstructions] = useState("");
  const [taskType, setTaskType] = useState("text");
  const [taskMediaFile, setTaskMediaFile] = useState(null);
  const [taskLinkUrl, setTaskLinkUrl] = useState("");
  const [taskTextContent, setTaskTextContent] = useState("");
  const [taskTarget, setTaskTarget] = useState("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskStatus, setTaskStatus] = useState("published");
  const [questions, setQuestions] = useState([]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskApi.getTasks();
      setTasks(res.data?.data?.tasks || []);
    } catch (error) {
      console.error("Get Tasks Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    courseApi
      .getCourses()
      .then((res) => setCourses(res.data?.data?.courses || []))
      .catch((error) => console.error("Get Courses Error:", error));

    studentApi
      .getStudents()
      .then((res) => setStudents(res.data?.data?.students || []))
      .catch((error) => console.error("Get Students Error:", error));
  }, []);

  // Topic dropdown depends on the chosen course — refetch whenever it changes.
  useEffect(() => {
    if (!courseId) {
      setTopics([]);
      setTopicId("");
      return;
    }
    setTopicsLoading(true);
    topicApi
      .getTopics(courseId)
      .then((res) => setTopics(res.data?.data?.topics || res.data?.data || []))
      .catch((error) => {
        console.error("Get Topics Error:", error);
        setTopics([]);
      })
      .finally(() => setTopicsLoading(false));
    setTopicId("");
  }, [courseId]);

  const resetForm = () => {
    setCourseId("");
    setTopicId("");
    setTaskTitle("");
    setTaskDescription("");
    setTaskInstructions("");
    setTaskType("text");
    setTaskMediaFile(null);
    setTaskLinkUrl("");
    setTaskTextContent("");
    setTaskTarget("all");
    setSelectedStudentIds([]);
    setTaskDueDate("");
    setTaskStatus("published");
    setQuestions([]);
  };

  /* ── question builder helpers ── */
  const addQuestion = () => setQuestions((prev) => [...prev, blankQuestion()]);
  const removeQuestion = (qi) => setQuestions((prev) => prev.filter((_, idx) => idx !== qi));
  const updateQuestion = (qi, key, value) =>
    setQuestions((prev) => prev.map((q, idx) => (idx === qi ? { ...q, [key]: value } : q)));

  const addOption = (qi) =>
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qi ? { ...q, options: [...q.options, ""] } : q)),
    );
  const removeOption = (qi, oi) =>
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi ? { ...q, options: q.options.filter((_, odx) => odx !== oi) } : q,
      ),
    );
  const updateOption = (qi, oi, value) =>
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.map((o, odx) => (odx === oi ? value : o)) }
          : q,
      ),
    );

  const addPair = (qi) =>
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qi ? { ...q, match_pairs: [...q.match_pairs, { left: "", right: "" }] } : q,
      ),
    );
  const removePair = (qi, pi) =>
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qi) return q;
        const pairs = q.match_pairs.filter((_, pdx) => pdx !== pi);
        return {
          ...q,
          match_pairs: pairs,
          correct_answer: pairs.map((p) => `${p.left}:${p.right}`).join("|"),
        };
      }),
    );
  const updatePair = (qi, pi, side, value) =>
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qi) return q;
        const pairs = (q.match_pairs.length ? q.match_pairs : [{ left: "", right: "" }]).map(
          (p, pdx) => (pdx === pi ? { ...p, [side]: value } : p),
        );
        return {
          ...q,
          match_pairs: pairs,
          correct_answer: pairs.map((p) => `${p.left}:${p.right}`).join("|"),
        };
      }),
    );

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !courseId) return;
    if (MEDIA_TYPES.includes(taskType) && !taskMediaFile) {
      setModal({
        open: true,
        type: "error",
        title: "File required",
        message: `Please attach a file — task type "${taskType}" requires a media upload.`,
      });
      return;
    }
    if (taskType === "text" && !taskTextContent.trim()) {
      setModal({
        open: true,
        type: "error",
        title: "Text content required",
        message: "Write the lesson text students will read before saving.",
      });
      return;
    }
    if (taskTarget === "selected" && selectedStudentIds.length === 0) {
      setModal({
        open: true,
        type: "error",
        title: "Select students",
        message: "Pick at least one student when target is \"Selected\".",
      });
      return;
    }
    const incompleteAt = questions.findIndex(
      (q) => !q.question_text.trim() || !q.correct_answer.trim(),
    );
    if (incompleteAt !== -1) {
      setModal({
        open: true,
        type: "error",
        title: "Incomplete question",
        message: `Question ${incompleteAt + 1} needs question text and a correct answer — or remove it.`,
      });
      return;
    }

    const formData = new FormData();
    formData.append("course_id", courseId);
    if (topicId) formData.append("topic_id", topicId);
    if (questions.length > 0) {
      formData.append(
        "questions",
        JSON.stringify(
          questions.map((q) => ({
            ...q,
            marks: Number(q.marks) || 1,
            timestamp_sec: q.timestamp_sec === "" ? undefined : Number(q.timestamp_sec),
          })),
        ),
      );
    }
    formData.append("title", taskTitle);
    if (taskDescription) formData.append("description", taskDescription);
    if (taskInstructions) formData.append("instructions", taskInstructions);
    formData.append("type", taskType);
    formData.append("target", taskTarget);
    if (taskDueDate) formData.append("due_date", taskDueDate);
    formData.append("status", taskStatus);

    if (taskType === "link") formData.append("link_url", taskLinkUrl);
    if (taskType === "text") formData.append("text_content", taskTextContent);
    if (MEDIA_TYPES.includes(taskType)) formData.append("taskMedia", taskMediaFile);
    if (taskTarget === "selected") {
      selectedStudentIds.forEach((id) => formData.append("student_ids", id));
    }

    try {
      setSaving(true);
      await taskApi.createTask(formData);
      setModal({
        open: true,
        type: "success",
        title: "Task created",
        message: `"${taskTitle}" has been published.`,
      });
      resetForm();
      setActiveTab("tasks");
      loadTasks();
    } catch (error) {
      console.error("Create Task Error:", error);
      setModal({
        open: true,
        type: "error",
        title: "Failed to create task",
        message: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteModal.id) return;
    try {
      await taskApi.deleteTask(deleteModal.id);
      setTasks((prev) => prev.filter((t) => t._id !== deleteModal.id));
    } catch (error) {
      console.error("Delete Task Error:", error);
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const toggleSubmissions = async (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      return;
    }
    setExpandedTaskId(taskId);
    if (submissionsByTask[taskId]) return;

    try {
      setSubmissionsLoading(true);
      const res = await taskApi.getSubmissions(taskId);
      setSubmissionsByTask((prev) => ({
        ...prev,
        [taskId]: res.data?.data?.submissions || [],
      }));
    } catch (error) {
      console.error("Get Submissions Error:", error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGrade = async (taskId, submissionId, grade, feedback) => {
    try {
      await taskApi.gradeSubmission(taskId, submissionId, {
        status: "reviewed",
        grade: grade === "" ? undefined : Number(grade),
        feedback,
      });
      const res = await taskApi.getSubmissions(taskId);
      setSubmissionsByTask((prev) => ({
        ...prev,
        [taskId]: res.data?.data?.submissions || [],
      }));
    } catch (error) {
      console.error("Grade Submission Error:", error);
    }
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.course_id?.course_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="relative min-h-screen p-8 space-y-8 overflow-hidden font-sans">

      {/* Background Theme Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/60 via-emerald-50/40 to-teal-100/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-teal-400/10 to-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-green-400/10 to-teal-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#0d9488_1px,transparent_1px),linear-gradient(to_bottom,#0d9488_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                Institute Management Portal
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Task Module Management
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              activeTab === "tasks"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-teal-500/25"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Active Tasks ({tasks.length})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeTab === "create"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-teal-500/25"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Plus className="w-4 h-4" /> Create Task
          </motion.button>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "tasks" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                Task Collection View
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200">
                        <th className="text-left px-6 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          Task
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          Due
                        </th>
                        <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="text-right px-6 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task) => {
                        const typeMeta = TASK_TYPE_META[task.type] || TASK_TYPE_META.text;
                        const statusMeta = STATUS_META[task.status] || STATUS_META.published;
                        const TypeIcon = typeMeta.Icon;
                        const isExpanded = expandedTaskId === task._id;
                        return (
                          <React.Fragment key={task._id}>
                            <tr className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeMeta.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}
                                  >
                                    <TypeIcon className="w-4.5 h-4.5" />
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate max-w-[220px]">
                                      {task.title}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate max-w-[220px] flex items-center gap-1">
                                      <Users className="w-3 h-3" /> {typeMeta.label} · {task.target}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-teal-200 whitespace-nowrap">
                                  {task.course_id?.course_name || "Course"}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                                >
                                  {statusMeta.label}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 whitespace-nowrap">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                                  <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                                  {task.assigned_count ?? 0} / {task.submitted_count ?? 0}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleSubmissions(task._id)}
                                    className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                                  >
                                    <Send className="w-3.5 h-3.5" /> Submissions
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDeleteModal({ open: true, id: task._id })}
                                    className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </tr>
                            <AnimatePresence>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={6} className="p-0 border-b border-slate-100">
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-6 py-4 bg-slate-50/50 space-y-2">
                                        {submissionsLoading && !submissionsByTask[task._id] ? (
                                          <div className="py-6 flex justify-center text-slate-400">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                          </div>
                                        ) : (submissionsByTask[task._id] || []).length === 0 ? (
                                          <p className="text-xs text-slate-400 py-3 text-center">
                                            No submissions yet.
                                          </p>
                                        ) : (
                                          (submissionsByTask[task._id] || []).map((sub) => (
                                            <SubmissionRow
                                              key={sub._id}
                                              submission={sub}
                                              onGrade={(grade, feedback) =>
                                                handleGrade(task._id, sub._id, grade, feedback)
                                              }
                                            />
                                          ))
                                        )}
                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400 text-sm font-semibold">No tasks found matching query parameters.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">Create Task</h2>
              <p className="text-xs text-slate-500 mt-0.5">Assign audio, video, document, link, or text tasks to a course or specific students.</p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <SectionDivider icon={Info} title="Basic Info" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Course</label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="" disabled>Select course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.course_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Topic (optional)</label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    disabled={!courseId || topicsLoading}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60"
                  >
                    <option value="">
                      {!courseId
                        ? "Select a course first"
                        : topicsLoading
                        ? "Loading topics..."
                        : "No specific topic"}
                    </option>
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Record a 2-minute self-introduction"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional description shown to students."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Optional step-by-step instructions."
                  value={taskInstructions}
                  onChange={(e) => setTaskInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="pt-2">
                <SectionDivider icon={Layers} title="Content" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="text">Text</option>
                    <option value="link">Link</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {taskType === "text" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Text Content <span className="text-teal-600">*</span>
                  </label>
                  <RichTextEditor
                    value={taskTextContent}
                    onChange={setTaskTextContent}
                    placeholder="Write the lesson text students will read…"
                    minHeight={220}
                  />
                </div>
              )}

              {taskType === "link" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Link URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={taskLinkUrl}
                    onChange={(e) => setTaskLinkUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              {MEDIA_TYPES.includes(taskType) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Upload {taskType} file
                  </label>
                  <input
                    type="file"
                    accept={
                      taskType === "audio" ? "audio/*" : taskType === "video" ? "video/*" : undefined
                    }
                    onChange={(e) => setTaskMediaFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 file:mr-3 file:px-3 file:py-1.5 file:rounded-xl file:border-0 file:bg-teal-600 file:text-white file:text-xs file:font-bold"
                  />
                </div>
              )}

              <div className="pt-2">
                <SectionDivider icon={UserCog} title="Assignment" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target</label>
                <select
                  value={taskTarget}
                  onChange={(e) => setTaskTarget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="all">All students enrolled in this course</option>
                  <option value="selected">Selected students</option>
                </select>
              </div>

              {taskTarget === "selected" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Students ({selectedStudentIds.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-2 space-y-1">
                    {students.length === 0 ? (
                      <p className="text-xs text-slate-400 p-2">No students found.</p>
                    ) : (
                      students.map((s) => (
                        <label
                          key={s._id}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(s._id)}
                            onChange={() => toggleStudentSelection(s._id)}
                            className="accent-teal-600"
                          />
                          <span className="font-medium text-slate-700">
                            {s.full_name}
                          </span>
                          <span className="text-xs text-slate-400">{s.enrollment_no}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-5 mt-2 border-t-2 border-dashed border-teal-100">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        Questions
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                          Optional
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Quiz-style checkpoints attached to this task
                        {CHECKPOINT_TYPES.includes(taskType)
                          ? " — set a timestamp to have one pop up at a point in the audio/video."
                          : "."}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-black shadow-md shadow-teal-500/20 hover:shadow-lg transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </motion.button>
                </div>

                {questions.length === 0 && (
                  <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-semibold text-slate-400">
                      No questions yet — students see just the task itself.
                    </p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {questions.map((q, qi) => (
                    <motion.div
                      key={qi}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <QuestionCard
                        index={qi}
                        question={q}
                        showTimestamp={CHECKPOINT_TYPES.includes(taskType)}
                        onRemove={() => removeQuestion(qi)}
                        onChange={(key, value) => updateQuestion(qi, key, value)}
                        onAddOption={() => addOption(qi)}
                        onRemoveOption={(oi) => removeOption(qi, oi)}
                        onUpdateOption={(oi, value) => updateOption(qi, oi, value)}
                        onAddPair={() => addPair(qi)}
                        onRemovePair={(pi) => removePair(qi, pi)}
                        onUpdatePair={(pi, side, value) => updatePair(qi, pi, side, value)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-sm shadow-lg shadow-teal-500/25 disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Publishing..." : "Save Task"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <StatusModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Delete this task?"
        message="This soft-deletes the task — past submissions stay on record."
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}

function QuestionCard({
  index,
  question,
  showTimestamp,
  onRemove,
  onChange,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onAddPair,
  onRemovePair,
  onUpdatePair,
}) {
  const inputCls =
    "w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors";
  const meta = QUESTION_TYPE_META[question.question_type] || QUESTION_TYPE_META.mcq;
  const { Icon: TypeIcon } = meta;

  return (
    <div
      className={`bg-white border rounded-2xl p-4 space-y-4 shadow-sm transition-colors ${meta.border}`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            {meta.label}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            <Award className="w-3.5 h-3.5" /> {question.marks || 0} mk
          </span>
          {showTimestamp && question.timestamp_sec !== "" && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" /> {question.timestamp_sec}s
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Question Text <span className="text-teal-600">*</span>
        </label>
        <textarea
          rows={2}
          className={`${inputCls} resize-none`}
          placeholder="Enter the question…"
          value={question.question_text}
          onChange={(e) => onChange("question_text", e.target.value)}
        />
      </div>

      <div className={`grid grid-cols-2 ${showTimestamp ? "sm:grid-cols-3" : ""} gap-3`}>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Type</label>
          <select
            className={`${inputCls} cursor-pointer`}
            value={question.question_type}
            onChange={(e) => onChange("question_type", e.target.value)}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {QUESTION_TYPE_META[t].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Award className="w-3 h-3 text-slate-400" /> Marks
          </label>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={question.marks}
            onChange={(e) => onChange("marks", e.target.value)}
          />
        </div>
        {showTimestamp && (
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Appears at (sec)
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 12"
              className={inputCls}
              value={question.timestamp_sec}
              onChange={(e) => onChange("timestamp_sec", e.target.value)}
            />
          </div>
        )}
      </div>

      {OPTION_BASED_TYPES.includes(question.question_type) && (
        <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Options</label>
          <div className="space-y-2">
            {question.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400 w-5 shrink-0">
                  {String.fromCharCode(65 + oi)}.
                </span>
                <input
                  className={inputCls}
                  placeholder={`Option ${oi + 1}`}
                  value={opt}
                  onChange={(e) => onUpdateOption(oi, e.target.value)}
                />
                {question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onRemoveOption(oi)}
                    className="text-red-400 hover:text-red-600 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAddOption}
            className="mt-2 text-xs text-teal-700 font-bold hover:underline"
          >
            + Add Option
          </button>
        </div>
      )}

      {question.question_type === "match" && (
        <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Match Pairs</label>
          <div className="space-y-2">
            {(question.match_pairs.length ? question.match_pairs : [{ left: "", right: "" }]).map(
              (p, pi) => (
                <div key={pi} className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    placeholder="Left (e.g. India)"
                    value={p.left}
                    onChange={(e) => onUpdatePair(pi, "left", e.target.value)}
                  />
                  <span className="text-teal-600 font-black shrink-0">→</span>
                  <input
                    className={inputCls}
                    placeholder="Right (e.g. Delhi)"
                    value={p.right}
                    onChange={(e) => onUpdatePair(pi, "right", e.target.value)}
                  />
                  {question.match_pairs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemovePair(pi)}
                      className="text-red-400 hover:text-red-600 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ),
            )}
          </div>
          <button
            type="button"
            onClick={onAddPair}
            className="mt-2 text-xs text-teal-700 font-bold hover:underline"
          >
            + Add Pair
          </button>
        </div>
      )}

      <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Correct Answer{" "}
          <span className="text-teal-600">*</span>
        </label>
        <input
          className={`${inputCls} ${question.question_type === "match" ? "bg-slate-50 text-slate-500" : ""}`}
          placeholder="Correct answer"
          value={question.correct_answer}
          readOnly={question.question_type === "match"}
          onChange={(e) => onChange("correct_answer", e.target.value)}
        />
        {question.question_type === "match" && (
          <p className="mt-1 text-xs text-slate-400">Auto-generated from Match Pairs above.</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Explanation (optional)
        </label>
        <RichTextEditor
          value={question.explanation}
          onChange={(val) => onChange("explanation", val)}
          placeholder="Explain the answer…"
          minHeight={120}
        />
      </div>
    </div>
  );
}

function SubmissionRow({ submission, onGrade }) {
  const [grade, setGrade] = useState(submission.grade ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");

  return (
    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">
          {submission.student_id?.full_name || "Unknown student"}
        </p>
        <p className="text-xs text-slate-400">
          {submission.student_id?.enrollment_no} ·{" "}
          <span className="font-semibold text-slate-500">{submission.status}</span>
        </p>
      </div>
      <input
        type="number"
        placeholder="Grade"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
      />
      <input
        type="text"
        placeholder="Feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
      />
      <button
        type="button"
        onClick={() => onGrade(grade, feedback)}
        className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center gap-1 shrink-0"
      >
        <CheckCircle2 className="w-3.5 h-3.5" /> Save
      </button>
    </div>
  );
}
