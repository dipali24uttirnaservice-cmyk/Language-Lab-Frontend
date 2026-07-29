"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  FileText,
  Link2,
  Video,
  Music,
  File,
  Calendar,
  Clock,
  Loader2,
  Send,
  Upload,
  Award,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { studentTaskApi } from "@/services/task/studentTaskApi";

const TYPE_META = {
  text: { label: "Text", Icon: FileText, gradient: "from-blue-500 to-blue-600" },
  link: { label: "Link", Icon: Link2, gradient: "from-slate-500 to-slate-600" },
  audio: { label: "Audio", Icon: Music, gradient: "from-teal-500 to-teal-600" },
  video: { label: "Video", Icon: Video, gradient: "from-purple-500 to-purple-600" },
  document: { label: "Document", Icon: File, gradient: "from-amber-500 to-amber-600" },
};

const STATUS_META = {
  pending: { label: "Pending", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  submitted: { label: "Submitted", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  late: { label: "Late", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  reviewed: { label: "Reviewed", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  overdue: { label: "Overdue", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentTaskApi.getMine();
      setTasks(res.data?.data?.tasks || []);
    } catch (error) {
      console.error("Get My Tasks Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSubmitted = (taskId, submission) => {
    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId
          ? { ...t, my_submission: submission, overdue: false }
          : t,
      ),
    );
  };

  const pendingCount = tasks.filter((t) => !t.my_submission).length;

  return (
    <div className="relative min-h-screen p-6 md:p-8 space-y-8 overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-teal-50/40 to-emerald-100/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-500/10 blur-3xl" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Assignments
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">My Tasks</h1>
        </div>
        <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          {pendingCount} pending of {tasks.length}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-20 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-400 text-sm font-semibold">
            No tasks have been assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              expanded={expandedId === task._id}
              onToggle={() => setExpandedId((prev) => (prev === task._id ? null : task._id))}
              onSubmitted={(submission) => handleSubmitted(task._id, submission)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, expanded, onToggle, onSubmitted }) {
  const meta = TYPE_META[task.type] || TYPE_META.text;
  const TypeIcon = meta.Icon;
  const submission = task.my_submission;
  const statusKey = task.overdue && !submission ? "overdue" : submission?.status || "pending";
  const statusMeta = STATUS_META[statusKey];

  return (
    <motion.div
      layout
      className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/60 transition-colors"
      >
        <span
          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}
        >
          <TypeIcon className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 truncate">{task.title}</p>
          <p className="text-xs text-slate-400 truncate">
            {task.course_id?.course_name || "Course"} · {meta.label}
          </p>
        </div>
        {task.due_date && (
          <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-500 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
        >
          {statusMeta.label}
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
              {task.description && (
                <p className="text-sm text-slate-600">{task.description}</p>
              )}
              {task.instructions && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Instructions
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.instructions}</p>
                </div>
              )}

              {task.type === "text" && task.text_content && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                  {task.text_content}
                </div>
              )}
              {task.type === "link" && task.link_url && (
                <a
                  href={task.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <Link2 className="w-4 h-4" /> Open link
                </a>
              )}
              {["audio", "video", "document"].includes(task.type) && task.media_url && (
                <div className="space-y-2">
                  {task.type === "audio" && <audio controls src={task.media_url} className="w-full" />}
                  {task.type === "video" && (
                    <video controls src={task.media_url} className="w-full rounded-xl max-h-80" />
                  )}
                  {task.type === "document" && (
                    <a
                      href={task.media_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors"
                    >
                      <File className="w-4 h-4" /> View document
                    </a>
                  )}
                </div>
              )}

              {submission?.status === "reviewed" ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Reviewed
                    {submission.grade != null && ` — ${submission.grade} marks`}
                  </p>
                  {submission.feedback && (
                    <p className="text-sm text-emerald-800">{submission.feedback}</p>
                  )}
                </div>
              ) : (
                <SubmissionForm task={task} submission={submission} onSubmitted={onSubmitted} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SubmissionForm({ task, submission, onSubmitted }) {
  const [text, setText] = useState(submission?.submitted_text || "");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) {
      setError("Add a file or write a response before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("submitted_text", text.trim());
      if (file) formData.append("taskSubmissionMedia", file);
      const res = await studentTaskApi.submit(task._id, formData);
      onSubmitted(res.data?.data);
    } catch (err) {
      console.error("Submit Task Error:", err);
      setError(err?.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-1 border-t border-slate-100">
      {submission && (
        <p className="text-xs font-semibold text-sky-600 flex items-center gap-1.5 pt-3">
          <Send className="w-3.5 h-3.5" /> Already submitted — resubmitting will replace it.
        </p>
      )}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Written response (optional)
        </label>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your response here..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5" /> Attach a file (optional)
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-xs text-slate-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:text-xs file:font-bold"
        />
      </div>
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-60 flex items-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? "Submitting..." : submission ? "Resubmit" : "Submit Task"}
      </button>
    </form>
  );
}
