"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  Send,
  ClipboardList,
  Users
} from "lucide-react";

export default function StudentTaskPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "create"

  // State for Student Tasks Module updated to match the Mongoose Task schema
  const [studentTasks, setStudentTasks] = useState([
    {
      id: 301,
      institute_id: "60d0fe4f5311236168a109ca",
      course_id: "60d0fe4f5311236168a109cb",
      title: "Build REST API Authentication Middleware",
      description: "Implement JWT token validation and role-based access control middleware for the departmental server.",
      instructions: "Ensure error handling covers expired tokens and unauthorized payloads.",
      type: "text",
      text_content: "Implement JWT validation middleware with refresh tokens.",
      target: "selected",
      student_ids: ["60d0fe4f5311236168a109cc", "60d0fe4f5311236168a109cd"],
      due_date: "2026-08-05",
      status: "published",
      created_by: "60d0fe4f5311236168a109ca",
      is_deleted: false,
      batch: "Batch A - CSE 2026",
      assignedCount: 45,
      subject: "Backend Security"
    },
    {
      id: 302,
      institute_id: "60d0fe4f5311236168a109ca",
      course_id: "60d0fe4f5311236168a109ce",
      title: "Responsive Dashboard Layout using Tailwind CSS",
      description: "Create a fully mobile-responsive student performance analytics dashboard utilizing modern CSS grid and flexbox utility frameworks.",
      instructions: "Follow mobile-first design principles.",
      type: "link",
      link_url: "https://figma.com/sample-dashboard-spec",
      target: "all",
      student_ids: [],
      due_date: "2026-08-10",
      status: "published",
      created_by: "60d0fe4f5311236168a109ca",
      is_deleted: false,
      batch: "Batch B - IT 2026",
      assignedCount: 38,
      subject: "UI/UX Engineering"
    }
  ]);

  // Form State mapped directly to the Mongoose Task schema fields
  const [instituteId, setInstituteId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskInstructions, setTaskInstructions] = useState("");
  const [taskType, setTaskType] = useState("text");
  const [taskMediaUrl, setTaskMediaUrl] = useState("");
  const [taskLinkUrl, setTaskLinkUrl] = useState("");
  const [taskTextContent, setTaskTextContent] = useState("");
  const [taskTarget, setTaskTarget] = useState("all");
  const [taskStudentIds, setTaskStudentIds] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskStatus, setTaskStatus] = useState("published");
  const [taskCreatedBy, setTaskCreatedBy] = useState("");
  const [taskBatch, setTaskBatch] = useState("");
  const [taskSubject, setTaskSubject] = useState("");

  // Handle Task Assignment Creation following schema structure
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle || !courseId || !instituteId || !taskCreatedBy) return;

    const newTaskEntry = {
      id: Date.now(),
      institute_id: instituteId,
      course_id: courseId,
      title: taskTitle,
      description: taskDescription || "No description provided.",
      instructions: taskInstructions,
      type: taskType,
      media_url: ["audio", "video", "document"].includes(taskType) ? taskMediaUrl : undefined,
      link_url: taskType === "link" ? taskLinkUrl : undefined,
      text_content: taskType === "text" ? taskTextContent : undefined,
      target: taskTarget,
      student_ids: taskTarget === "selected" ? taskStudentIds.split(",").map(s => s.trim()).filter(Boolean) : [],
      due_date: taskDueDate || "TBD",
      status: taskStatus,
      created_by: taskCreatedBy,
      is_deleted: false,
      batch: taskBatch || "General Cohort",
      subject: taskSubject || "General Module",
      assignedCount: taskTarget === "all" ? 40 : taskStudentIds.split(",").length
    };

    setStudentTasks([newTaskEntry, ...studentTasks]);
    setInstituteId("");
    setCourseId("");
    setTaskTitle("");
    setTaskDescription("");
    setTaskInstructions("");
    setTaskType("text");
    setTaskMediaUrl("");
    setTaskLinkUrl("");
    setTaskTextContent("");
    setTaskTarget("all");
    setTaskStudentIds("");
    setTaskDueDate("");
    setTaskStatus("published");
    setTaskCreatedBy("");
    setTaskBatch("");
    setTaskSubject("");
    setActiveTab("tasks");
  };

  const filteredTasks = studentTasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.course_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.batch.toLowerCase().includes(searchQuery.toLowerCase())
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
            Active Tasks ({studentTasks.length})
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
            <Plus className="w-4 h-4" /> Create Task Document
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
                  placeholder="Search by title, course ID, or batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                Task Collection View
              </span>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <motion.div 
                    key={task.id}
                    whileHover={{ y: -3 }}
                    className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-xl border border-teal-200">
                          Course ID: {task.course_id}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Due: {task.due_date}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900">{task.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5 text-teal-600" /> Target: {task.target} ({task.batch})
                      </div>

                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {task.description}
                        </p>
                        <div className="text-[11px] text-teal-900 bg-teal-50/60 p-2 rounded-xl border border-teal-100 flex flex-col gap-1">
                          <span><strong>Type:</strong> {task.type}</span>
                          {task.type === "text" && <span><strong>Content:</strong> {task.text_content}</span>}
                          {task.type === "link" && <span className="truncate"><strong>Link:</strong> {task.link_url}</span>}
                          {["audio", "video", "document"].includes(task.type) && <span className="truncate"><strong>Media:</strong> {task.media_url}</span>}
                          <span><strong>Status:</strong> {task.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                        <ClipboardList className="w-3.5 h-3.5 text-slate-500" /> {task.assignedCount} Students Assigned
                      </span>

                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert(`Task document synchronized for ID: ${task.course_id}`)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Sync Document
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 py-16 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
                  <p className="text-slate-400 text-sm font-semibold">No tasks found matching query parameters.</p>
                </div>
              )}
            </div>
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
              <h2 className="text-xl font-black text-slate-900">Create Task Document</h2>
              <p className="text-xs text-slate-500 mt-0.5">Populate fields for institute references, course associations, and media properties.</p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Institute ID</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., 60d0fe4f5311236168a109ca"
                    value={instituteId}
                    onChange={(e) => setInstituteId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Course ID</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., 60d0fe4f5311236168a109cb"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Task Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Implement OAuth2 Login Flow"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target</label>
                  <select 
                    value={taskTarget}
                    onChange={(e) => setTaskTarget(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="all">All</option>
                    <option value="selected">Selected</option>
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

              {/* Conditional schema field rendering based on task type */}
              {taskType === "text" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Text Content</label>
                  <textarea 
                    rows={2}
                    placeholder="Enter text content..."
                    value={taskTextContent}
                    onChange={(e) => setTaskTextContent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              {taskType === "link" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Link URL</label>
                  <input 
                    type="text"
                    placeholder="https://schema-resource.url"
                    value={taskLinkUrl}
                    onChange={(e) => setTaskLinkUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              {["audio", "video", "document"].includes(taskType) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Media URL</label>
                  <input 
                    type="text"
                    placeholder="https://cdn.institute.com/media-file"
                    value={taskMediaUrl}
                    onChange={(e) => setTaskMediaUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              {taskTarget === "selected" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Student IDs (comma separated)</label>
                  <input 
                    type="text"
                    placeholder="60d0fe..., 60d0fe..."
                    value={taskStudentIds}
                    onChange={(e) => setTaskStudentIds(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-sm shadow-lg shadow-teal-500/25"
                >
                  Save Task Document
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}