"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Send, 
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  PenTool,
  Hash
} from "lucide-react";

export default function StudentPracticalManualPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManual, setSelectedManual] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [submittedStatus, setSubmittedStatus] = useState({});

  // Mock student practical manuals assigned to the student
  const [assignedManuals, setAssignedManuals] = useState([
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
      status: "Pending",
      questions: [
        { 
          id: 101, 
          title: "Implement custom useLocalStorage hook", 
          answer_html: "<p>Write clean functional code handling JSON serialization/deserialization safely with SSR checks.</p>",
          answer_lines: 6,
          marks: 10 
        },
        { 
          id: 102, 
          title: "Build global theme context provider", 
          answer_html: "<p>Setup Context, Provider wrapper component, and custom useContext consumer hook.</p>",
          answer_lines: 8,
          marks: 15 
        }
      ]
    },
    {
      id: 2,
      title: "Lab Manual 2: REST API Authentication Middleware",
      institute_id: "INST_99281",
      course_id: "64a2f129c8e4b1001c892102",
      topic_id: "64a2f13bc8e4b1001c892106",
      answer_lines: 5,
      attachment_url: "https://example.com/docs/lab2.pdf",
      attachment_type: "pdf",
      created_by: "INST_99281",
      createdAt: "July 22, 2026",
      status: "Pending",
      questions: [
        { 
          id: 201, 
          title: "Generate and verify JSON Web Tokens (JWT)", 
          answer_html: "<p>Implement token signing using a secret key and standard expiration timestamps.</p>",
          answer_lines: 5,
          marks: 20 
        }
      ]
    }
  ]);

  // Handle input change for specific question answer fields
  const handleAnswerChange = (questionId, text) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  // Submit practical manual response
  const handleSubmitManual = (e) => {
    e.preventDefault();
    if (!selectedManual) return;

    setSubmittedStatus(prev => ({
      ...prev,
      [selectedManual.id]: "Submitted"
    }));

    // Update manual status in state list
    setAssignedManuals(prev => prev.map(m => 
      m.id === selectedManual.id ? { ...m, status: "Submitted" } : m
    ));

    alert("Practical manual answers successfully submitted to instructor!");
    setSelectedManual(null);
  };

  const filteredManuals = assignedManuals.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.course_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen p-8 space-y-8 overflow-hidden font-sans">
      
      {/* Background Theme Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/60 via-slate-50/40 to-blue-200/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/10 to-blue-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                Student Portal • Practical Submissions
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              My Practical Manuals
            </h1>
          </div>
        </div>

        {selectedManual && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedManual(null)}
            className="px-4 py-2.5 rounded-2xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Manuals
          </motion.button>
        )}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!selectedManual ? (
          <motion.div 
            key="list-view"
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
                  placeholder="Search manuals by title or course reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                Active Queue: {assignedManuals.length} Manuals
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
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-xl border border-indigo-200 font-mono">
                          Course ID: {manual.course_id}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {manual.createdAt}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900">{manual.title}</h3>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 text-slate-600">
                        <div><strong className="text-slate-800">Institute ID:</strong> {manual.institute_id}</div>
                        <div><strong className="text-slate-800">Questions:</strong> {manual.questions.length} Assigned</div>
                      </div>

                      {manual.attachment_url && (
                        <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold bg-indigo-50/50 p-2 rounded-xl border border-indigo-100">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <a href={manual.attachment_url} target="_blank" rel="noreferrer" className="truncate hover:underline">
                            Reference Document ({manual.attachment_type.toUpperCase()})
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border ${
                        manual.status === "Submitted" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {manual.status === "Submitted" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {manual.status}
                      </span>

                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedManual(manual)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                      >
                        {manual.status === "Submitted" ? "View Submission" : "Start Practical"} <ChevronRight className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 py-16 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
                  <p className="text-slate-400 text-sm font-semibold">No practical manuals found matching your filter.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6"
          >
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-xl border border-indigo-200 font-mono">
                  Course ID: {selectedManual.course_id}
                </span>
                <span className="text-xs font-semibold text-slate-400">Created: {selectedManual.createdAt}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">{selectedManual.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-1">
                <span><strong>Institute ID:</strong> {selectedManual.institute_id}</span>
                <span>•</span>
                <span><strong>Topic ID:</strong> {selectedManual.topic_id || "N/A"}</span>
              </div>
            </div>

            {selectedManual.attachment_url && (
              <div className="flex items-center justify-between bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 text-xs font-bold text-indigo-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Reference Lab Guide Attached</span>
                </div>
                <a href={selectedManual.attachment_url} target="_blank" rel="noreferrer" className="underline hover:text-indigo-900 flex items-center gap-1">
                  Open Document <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <form onSubmit={handleSubmitManual} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Practical Questions & Response Worksheet</h3>
                
                {selectedManual.questions.map((q, index) => (
                  <div key={q.id} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Q{index + 1}. {q.title}
                      </span>
                      <span className="shrink-0 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
                        {q.marks} Marks
                      </span>
                    </div>

                    <div className="text-slate-600 text-xs bg-white p-3 rounded-xl border border-slate-200/60" dangerouslySetInnerHTML={{ __html: q.answer_html }} />

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span className="flex items-center gap-1 text-indigo-600">
                          <PenTool className="w-3.5 h-3.5" /> Your Code / Answer Workspace
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 font-mono">
                          <Hash className="w-3 h-3" /> Allocated Lines: {q.answer_lines}
                        </span>
                      </div>
                      
                      <textarea 
                        rows={q.answer_lines || 5}
                        required
                        disabled={selectedManual.status === "Submitted"}
                        placeholder="Write your functional solution or code snippet here..."
                        value={studentAnswers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setSelectedManual(null)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>

                {selectedManual.status !== "Submitted" && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Practical Manual
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}