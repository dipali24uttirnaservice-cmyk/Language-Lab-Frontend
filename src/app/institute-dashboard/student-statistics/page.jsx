"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpenCheck, 
  Dumbbell, 
  FileText, 
  CheckSquare, 
  Search,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Sparkles,
  Layers,
  Award
} from "lucide-react";

export default function StudentStatisticsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); 

  const reportData = {
    topics: [
      { id: 1, name: "Rahul Sharma", email: "rahul@example.com", item: "React Hooks & State", course: "Frontend Dev", unit: "Unit 3", status: "Completed", date: "Today, 2:00 PM" },
      { id: 2, name: "Priya Patel", email: "priya@example.com", item: "Database Indexing", course: "Backend Engineering", unit: "Unit 2", status: "In Progress", date: "Yesterday" },
      { id: 3, name: "Amit Kumar", email: "amit@example.com", item: "REST API Design", course: "Backend Engineering", unit: "Unit 1", status: "Completed", date: "3 days ago" },
    ],
    exercises: [
      { id: 1, name: "Rahul Sharma", email: "rahul@example.com", item: "Build a Todo App", score: "95/100", status: "Submitted", date: "Today" },
      { id: 2, name: "Priya Patel", email: "priya@example.com", item: "SQL Joins Query Practice", score: "88/100", status: "Evaluated", date: "Yesterday" },
      { id: 3, name: "Neha Singh", email: "neha@example.com", item: "Authentication Flow", score: "98/100", status: "Evaluated", date: "2 days ago" },
    ],
    practical: [
      { id: 1, name: "Rahul Sharma", email: "rahul@example.com", item: "Lab Manual 1: Setup Environment", file: "rahul_lab1.pdf", status: "Approved", date: "2 days ago" },
      { id: 2, name: "Vikram Verma", email: "vikram@example.com", item: "Lab Manual 2: Networking", file: "vikram_net.pdf", status: "Pending Review", date: "Today" },
    ],
    tasks: [
      { id: 1, name: "Rahul Sharma", email: "rahul@example.com", item: "Course -> React -> Unit 2 -> Component Lifecycle", progress: "100%", status: "Done", date: "Today" },
      { id: 2, name: "Amit Kumar", email: "amit@example.com", item: "Course -> Node -> Unit 1 -> Streams", progress: "60%", status: "In Progress", date: "Yesterday" },
    ]
  };

  const getActiveDataset = () => {
    let data = [];
    if (activeTab === "topics") data = reportData.topics;
    else if (activeTab === "exercises") data = reportData.exercises;
    else if (activeTab === "practical") data = reportData.practical;
    else if (activeTab === "tasks") data = reportData.tasks;

    if (!searchQuery) return data;
    return data.filter(row => 
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="relative min-h-screen p-8 space-y-8 overflow-hidden font-sans">
      
      {/* Background Theme Glow Elements (Matching your dashboard theme) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/60 via-orange-50/40 to-amber-200/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-400/10 to-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ea580c_1px,transparent_1px),linear-gradient(to_bottom,#ea580c_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          {activeTab !== "overview" && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("overview")}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md hover:shadow-orange-500/25 transition-all"
              title="Back to Overview"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                {activeTab === "overview" ? "Institute Intelligence Module" : "Granular Filter Mode"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {activeTab === "overview" && "Student Statistics & Performance Reports"}
              {activeTab === "topics" && "Topic Details Report"}
              {activeTab === "exercises" && "Exercise Submission Report"}
              {activeTab === "practical" && "Practical Manual Submissions"}
              {activeTab === "tasks" && "Student Task & Hierarchy Report"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 rounded-2xl border border-orange-200/60 shadow-sm text-sm font-bold text-orange-800">
          <Calendar className="w-4 h-4 text-orange-600" />
          <span>Real-time Analytics Active</span>
        </div>
      </div>

      {/* Interactive Metric Cards (Click to switch view instantly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Topic Details */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("topics")}
          className={`relative bg-white/90 backdrop-blur-sm p-6 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-xl group overflow-hidden ${
            activeTab === "topics" 
              ? "border-blue-500 ring-4 ring-blue-500/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50" 
              : "border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Topic Details</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">1,450</h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 mt-3 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
                <Sparkles className="w-3 h-3" /> Inspect logs →
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <BookOpenCheck className="w-7 h-7" />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Exercise Report */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("exercises")}
          className={`relative bg-white/90 backdrop-blur-sm p-6 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-xl group overflow-hidden ${
            activeTab === "exercises" 
              ? "border-purple-500 ring-4 ring-purple-500/20 bg-gradient-to-br from-purple-50/50 to-indigo-50/50" 
              : "border-slate-200 hover:border-purple-300"
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Exercise Report</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">3,820</h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 mt-3 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100">
                <Sparkles className="w-3 h-3" /> View submissions →
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-7 h-7" />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Practical Manual Submissions */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("practical")}
          className={`relative bg-white/90 backdrop-blur-sm p-6 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-xl group overflow-hidden ${
            activeTab === "practical" 
              ? "border-amber-500 ring-4 ring-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50" 
              : "border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-amber-600 transition-colors">Practical Manuals</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">412</h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-3 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                <Sparkles className="w-3 h-3" /> Inspect files →
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
          </div>
        </motion.div>

        {/* Card 4: Student Task Report */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("tasks")}
          className={`relative bg-white/90 backdrop-blur-sm p-6 rounded-3xl border transition-all cursor-pointer shadow-sm hover:shadow-xl group overflow-hidden ${
            activeTab === "tasks" 
              ? "border-emerald-500 ring-4 ring-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-teal-50/50" 
              : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Student Task Report</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">89%</h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-3 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                <Sparkles className="w-3 h-3" /> Course tree →
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-7 h-7" />
            </div>
          </div>
        </motion.div>

      </div>

      {/* Conditional Workspace Area */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-3 relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-xl border border-amber-500/30">
                <Layers className="w-4 h-4" /> Interactive Statistics Hub
              </div>
              <h2 className="text-3xl font-black tracking-tight">Select any report category above</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Seamlessly inspect student progress by clicking on <strong>Topic Details</strong>, <strong>Exercise Report</strong>, <strong>Practical Manuals</strong>, or <strong>Student Task Report</strong> to load granular course hierarchies and records instantly.
              </p>
            </div>

            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("topics")}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black transition-all shadow-lg shadow-orange-500/25 shrink-0 relative z-10"
            >
              Explore Topic Details Now
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            key="table"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Table Header & Search */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 capitalize">{activeTab} Granular Analysis</h3>
                <p className="text-xs text-slate-500 mt-0.5">Showing live filtered student submissions and records</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search student or record..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Table Data */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-6">Student Information</th>
                    <th className="py-4 px-6">
                      {activeTab === "topics" && "Topic / Course Unit"}
                      {activeTab === "exercises" && "Exercise Title"}
                      {activeTab === "practical" && "Manual File Name"}
                      {activeTab === "tasks" && "Course -> Unit => Topic Structure"}
                    </th>
                    <th className="py-4 px-6">
                      {activeTab === "topics" && "Status"}
                      {activeTab === "exercises" && "Score / Status"}
                      {activeTab === "practical" && "Submission Status"}
                      {activeTab === "tasks" && "Progress Status"}
                    </th>
                    <th className="py-4 px-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {getActiveDataset().length > 0 ? (
                    getActiveDataset().map((row) => (
                      <tr key={row.id} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{row.name}</div>
                          <div className="text-xs text-slate-500 font-normal">{row.email}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-800">
                          {row.item || row.file || row.progress}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 text-xs shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {row.status || row.score}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs font-semibold">
                          {row.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 text-sm font-semibold">
                        No matching records found for your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}