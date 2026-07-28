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
  BookMarked,
  Layers,
  Hash,
  Link as LinkIcon
} from "lucide-react";

export default function PracticalManualPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("manuals"); // "manuals" | "create" | "assign-task"

  // State for Practical Manuals aligned with MongoDB structure
  const [manuals, setManuals] = useState([
    {
      id: 1,
      title: "Lab Manual 1: Advanced React Hooks & Context",
      institute_id: "INST_99281",
      course_id: "64a2f129c8e4b1001c892101",
      topic_id: "64a2f13bc8e4b1001c892105",
      answer_lines: 5,
      attachment_url: "https://example.com/docs/lab1.pdf",
      attachment_type: "pdf",
      created_by: "INST_99281",
      createdAt: "July 20, 2026",
      status: "Active",
      questions: [
        { 
          id: 101, 
          title: "Implement custom useLocalStorage hook", 
          answer_html: "<p>Write clean functional code handling JSON serialization/deserialization safely with SSR checks.</p>",
          answer_lines: 12,
          marks: 10 
        },
        { 
          id: 102, 
          title: "Build global theme context provider", 
          answer_html: "<p>Setup Context, Provider wrapper component, and custom useContext consumer hook.</p>",
          answer_lines: 15,
          marks: 15 
        }
      ]
    }
  ]);

  // State for Student Tasks Module
  const [studentTasks, setStudentTasks] = useState([
    {
      id: 301,
      title: "Build REST API Authentication Middleware",
      batch: "Batch A - CSE 2026",
      subject: "Backend Security",
      dueDate: "2026-08-05",
      assignedCount: 45,
      status: "Assigned"
    }
  ]);

  // Form State for Creating New Practical Manual
  const [newTitle, setNewTitle] = useState("");
  const [newInstituteId, setNewInstituteId] = useState("");
  const [newCourseId, setNewCourseId] = useState("");
  const [newTopicId, setNewTopicId] = useState("");
  const [newAnswerLines, setNewAnswerLines] = useState(5);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [newAttachmentType, setNewAttachmentType] = useState("pdf");
  const [newCreatedBy, setNewCreatedBy] = useState("");
  
  // Dynamic question list matching MongoDB fields
  const [questionList, setQuestionList] = useState([
    { title: "", answer_html: "", answer_lines: 8, marks: 10 }
  ]);

  // Form State for Assigning Student Task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskBatch, setTaskBatch] = useState("");
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Add question input row
  const addQuestionField = () => {
    setQuestionList([...questionList, { title: "", answer_html: "", answer_lines: 8, marks: 10 }]);
  };

  // Update specific question field
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questionList];
    updated[index][field] = value;
    setQuestionList(updated);
  };

  // Remove question input row
  const removeQuestionField = (index) => {
    setQuestionList(questionList.filter((_, i) => i !== index));
  };

  // Handle Manual Creation
  const handleCreateManual = (e) => {
    e.preventDefault();
    if (!newTitle || !newCourseId) return;

    const newEntry = {
      id: Date.now(),
      title: newTitle,
      institute_id: newInstituteId || "INST_DEFAULT",
      course_id: newCourseId,
      topic_id: newTopicId || "",
      answer_lines: Number(newAnswerLines),
      attachment_url: newAttachmentUrl || "",
      attachment_type: newAttachmentType,
      created_by: newCreatedBy || "INST_DEFAULT",
      createdAt: "Today",
      status: "Active",
      questions: questionList.map((q, idx) => ({
        id: Date.now() + idx,
        title: q.title,
        answer_html: q.answer_html,
        answer_lines: Number(q.answer_lines),
        marks: Number(q.marks)
      }))
    };

    setManuals([newEntry, ...manuals]);
    setNewTitle("");
    setNewInstituteId("");
    setNewCourseId("");
    setNewTopicId("");
    setNewAnswerLines(5);
    setNewAttachmentUrl("");
    setNewAttachmentType("pdf");
    setNewCreatedBy("");
    setQuestionList([{ title: "", answer_html: "", answer_lines: 8, marks: 10 }]);
    setActiveTab("manuals");
  };

  // Handle Task Assignment Creation
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle || !taskBatch) return;

    const newTaskEntry = {
      id: Date.now(),
      title: taskTitle,
      batch: taskBatch,
      subject: taskSubject || "General Module",
      dueDate: taskDueDate || "TBD",
      assignedCount: 40,
      status: "Assigned"
    };

    setStudentTasks([newTaskEntry, ...studentTasks]);
    setTaskTitle("");
    setTaskBatch("");
    setTaskSubject("");
    setTaskDueDate("");
    setActiveTab("manuals");
  };

  const filteredManuals = manuals.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.course_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen p-8 space-y-8 overflow-hidden font-sans">
      
      {/* Background Theme Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/60 via-orange-50/40 to-amber-200/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-400/10 to-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ea580c_1px,transparent_1px),linear-gradient(to_bottom,#ea580c_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                Institute Panel • Practical Manuals & Tasks
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Practical Manual 
            </h1>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("manuals")}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              activeTab === "manuals" 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-orange-500/25" 
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Manuals ({manuals.length})
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeTab === "create" 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-orange-500/25" 
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Plus className="w-4 h-4" /> Create Manual
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("assign-task")}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeTab === "assign-task" 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-orange-500/25" 
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <BookMarked className="w-4 h-4" /> Assign Student Task
          </motion.button>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "manuals" ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Search Bar */}
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by manual title or course ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                Backend Model: Practical Active
              </span>
            </div>

            {/* Manual Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredManuals.length > 0 ? (
                filteredManuals.map((manual) => (
                  <motion.div 
                    key={manual.id}
                    whileHover={{ y: -3 }}
                    className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-xl border border-orange-200">
                          Course ID: {manual.course_id}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {manual.createdAt}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900">{manual.title}</h3>
                      
                      {/* Document References & Identifiers */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 text-slate-600">
                        <div><strong className="text-slate-800">Institute ID:</strong> {manual.institute_id}</div>
                        <div><strong className="text-slate-800">Topic ID:</strong> {manual.topic_id || "N/A"}</div>
                        <div><strong className="text-slate-800">Default Lines:</strong> {manual.answer_lines}</div>
                        <div><strong className="text-slate-800">Created By:</strong> {manual.created_by}</div>
                      </div>

                      {manual.attachment_url && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 font-bold bg-orange-50/50 p-2 rounded-xl border border-orange-100">
                          <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                          <a href={manual.attachment_url} target="_blank" rel="noreferrer" className="truncate hover:underline">
                            Attachment ({manual.attachment_type.toUpperCase()}): {manual.attachment_url}
                          </a>
                        </div>
                      )}

                      {/* Question Preview Box */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 mt-2">
                        <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Configured Practical Questions:</p>
                        <ul className="space-y-2">
                          {manual.questions.map((q, i) => (
                            <li key={q.id} className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                              <div className="flex items-start justify-between gap-2 font-bold text-slate-800">
                                <span>{i + 1}. {q.title}</span>
                                <span className="shrink-0 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                  {q.marks} Marks
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] line-clamp-1" dangerouslySetInnerHTML={{ __html: q.answer_html }} />
                              <div className="flex items-center gap-2 pt-1 text-[10px] text-orange-600 font-semibold">
                                <Hash className="w-3 h-3" /> Answer Lines allocated: {q.answer_lines} lines
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {manual.status}
                      </span>

                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => alert(`Broadcasting "${manual.title}" to student batch portal!`)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Broadcast to Students
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 py-16 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
                  <p className="text-slate-400 text-sm font-semibold">No practical manuals found.</p>
                </div>
              )}
            </div>

            {/* Student Tasks Section */}
            <div className="space-y-4 pt-6 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Student Tasks Module</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Monitor standalone practical assignments pushed to student dashboards.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("assign-task")}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  + Add New Task
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentTasks.map((task) => (
                  <div key={task.id} className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 uppercase tracking-wider">
                          {task.subject}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">Due: {task.dueDate}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{task.title}</h4>
                      <p className="text-xs font-bold text-slate-500">Target Batch: {task.batch}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                        {task.assignedCount} Students Enrolled
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : activeTab === "create" ? (
          <motion.div 
            key="create"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">Create Practical Manual</h2>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Manual Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Lab Manual 3: Advanced APIs"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Backend Fields: institute_id, course_id, topic_id */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Institute ID</label>
                  <input 
                    type="text"
                    required
                    placeholder="ObjectId string"
                    value={newInstituteId}
                    onChange={(e) => setNewInstituteId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Course ID</label>
                  <input 
                    type="text"
                    required
                    placeholder="Course reference ID"
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Topic ID</label>
                  <input 
                    type="text"
                    placeholder="Topic reference ID"
                    value={newTopicId}
                    onChange={(e) => setNewTopicId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Answer Lines</label>
                  <input 
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newAnswerLines}
                    onChange={(e) => setNewAnswerLines(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attachment Type</label>
                  <select 
                    value={newAttachmentType}
                    onChange={(e) => setNewAttachmentType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="image">Image Asset</option>
                  </select>
                </div>

                
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attachment URL</label>
                <input 
                  type="url"
                  placeholder="https://..."
                  value={newAttachmentUrl}
                  onChange={(e) => setNewAttachmentUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Dynamic Questions Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Practical Manual Questions </label>
                  <button 
                    type="button"
                    onClick={addQuestionField}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question Block
                  </button>
                </div>

                {questionList.map((q, index) => (
                  <div key={index} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-orange-500" /> Question #{index + 1}
                      </span>
                      {questionList.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeQuestionField(index)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Question Title</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g., Implement custom JWT hook"
                          value={q.title}
                          onChange={(e) => handleQuestionChange(index, "title", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Ruled Lines</label>
                        <input 
                          type="number"
                          min="1"
                          max="50"
                          required
                          value={q.answer_lines}
                          onChange={(e) => handleQuestionChange(index, "answer_lines", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-center"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Answer HTML</label>
                      <textarea 
                        rows="2"
                        required
                        placeholder="<p>Enter default student answer structure or instructions...</p>"
                        value={q.answer_html}
                        onChange={(e) => handleQuestionChange(index, "answer_html", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setActiveTab("manuals")}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/25"
                >
                  Save & Publish Manual
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="assign-task"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">Assign Student Task Module</h2>
              <p className="text-xs text-slate-500 mt-0.5">Broadcast practical tasks directly to targeted batches and cohorts.</p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Task Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g., Implement OAuth2 Login Flow"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Student Batch</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Batch A - CSE 2026"
                    value={taskBatch}
                    onChange={(e) => setTaskBatch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subject / Module</label>
                  <input 
                    type="text"
                    placeholder="e.g., Advanced Web Security"
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Submission Due Date</label>
                <input 
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setActiveTab("manuals")}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/25"
                >
                  Broadcast Task to Students
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}