"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  Layers,
  Link as LinkIcon,
  Upload,
  Loader2,
  Edit3,
  Eye,
  X,
  FileText,
  AlertCircle
} from "lucide-react";
import { 
  practicalManual, 
  practicalManualList, 
  practicalManualDetail, 
  updatePracticalManual, 
  deletePracticalManual 
} from "@/services/practical-Manual/page.jsx";
import { 
  createPracticalManualSchema, 
  updatePracticalManualSchema 
} from "@/app/schemas/practicalManual.schema";

export default function PracticalManualPage() {
  const [activeTab, setActiveTab] = useState("manuals");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side Validation Errors State
  const [formErrors, setFormErrors] = useState({});

  // Filters for GET /practical
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterTopicId, setFilterTopicId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // API Data States
  const [manuals, setManuals] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, page: 1, limit: 20 });
  const [selectedManual, setSelectedManual] = useState(null);
  const [editingManualId, setEditingManualId] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [formTopicId, setFormTopicId] = useState("");
  const [practicalAttachment, setPracticalAttachment] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  // Dynamic question list
  const [questionList, setQuestionList] = useState([
    { question_text: "", answer_key_html: "", answer_lines: 5 }
  ]);

  // Fetch Manuals List
  const fetchManuals = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterCourseId) params.courseId = filterCourseId;
      if (filterTopicId) params.topicId = filterTopicId;
      params.page = page;
      params.limit = limit;

      const response = await practicalManualList(params);
      const resData = response?.data || response;
      
      const container = resData?.data || resData;
      const list = container?.practicals || container?.practicalManuals || (Array.isArray(container) ? container : []);
      
      setManuals(list);
      setPaginationInfo({
        total: container?.total || list.length,
        page: container?.page || page,
        limit: container?.limit || limit
      });
    } catch (error) {
      console.error("Failed to fetch practical manuals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "manuals") {
      fetchManuals();
    }
  }, [activeTab, filterCourseId, filterTopicId, page, limit]);

  // Fetch Single Manual Details
  const fetchManualDetails = async (id) => {
    setIsLoading(true);
    try {
      const response = await practicalManualDetail(id);
      const resData = response?.data || response;
      setSelectedManual(resData?.data || resData);
      setActiveTab("detail");
    } catch (error) {
      console.error("Failed to fetch manual details:", error);
      alert("Could not load manual details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Manual
  const handleDeleteManual = async (id) => {
    if (!confirm("Are you sure you want to delete this practical manual?")) return;
    try {
      await deletePracticalManual(id);
      alert("Practical manual deleted successfully!");
      fetchManuals();
      if (activeTab === "detail") setActiveTab("manuals");
    } catch (error) {
      console.error("Failed to delete practical manual:", error);
      alert("Error deleting manual.");
    }
  };

  // Prepare Edit Form
  const handleOpenEdit = (manual) => {
    setEditingManualId(manual._id);
    setFormTitle(manual.title || "");
    setFormCourseId(typeof manual.course_id === 'object' ? manual.course_id?._id || "" : manual.course_id || "");
    setFormTopicId(typeof manual.topic_id === 'object' ? manual.topic_id?._id || "" : manual.topic_id || "");
    setQuestionList(manual.questions ? manual.questions.map(q => ({
      question_text: q.question_text || "",
      answer_key_html: q.answer_key_html || "",
      answer_lines: q.answer_lines || 5
    })) : []);
    setPracticalAttachment(null);
    setRemoveAttachment(false);
    setFormErrors({});
    setActiveTab("edit");
  };

  const handleOpenCreate = () => {
    setEditingManualId(null);
    setFormTitle("");
    setFormCourseId("");
    setFormTopicId("");
    setQuestionList([
      { question_text: "", answer_key_html: "", answer_lines: 5 }
    ]);
    setPracticalAttachment(null);
    setRemoveAttachment(false);
    setFormErrors({});
    setActiveTab("create");
  };

  // Question handlers
  const addQuestionField = () => {
    setQuestionList([...questionList, { question_text: "", answer_key_html: "", answer_lines: 5 }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questionList];
    updated[index][field] = value;
    setQuestionList(updated);
  };

  const removeQuestionField = (index) => {
    setQuestionList(questionList.filter((_, i) => i !== index));
  };

  // Yup-integrated Submit Form Handler
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      title: formTitle,
      course_id: formCourseId,
      topic_id: formTopicId || undefined,
      questions: questionList,
    };

    if (editingManualId && removeAttachment) {
      payload.remove_attachment = removeAttachment;
    }

    const schemaToValidate = editingManualId ? updatePracticalManualSchema : createPracticalManualSchema;

    try {
      // Execute Yup validation (abortEarly: false collects all errors)
      await schemaToValidate.validate(payload, { abortEarly: false });
    } catch (err) {
  const formattedErrors = {};

  if (err.inner?.length) {
    err.inner.forEach((error) => {

      // Keep first error only
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = error.message;
      }

    });
  }

  setFormErrors(formattedErrors);

  return;
}

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("course_id", formCourseId);
      if (formTopicId) {
        formData.append("topic_id", formTopicId);
      }
      formData.append("questions", JSON.stringify(questionList));

      if (practicalAttachment) {
        formData.append("practicalAttachment", practicalAttachment);
      }

      if (editingManualId) {
        if (removeAttachment) {
          formData.append("remove_attachment", "true");
        }
        await updatePracticalManual(editingManualId, formData);
        alert("Practical manual updated successfully!");
      } else {
        await practicalManual(formData);
        alert("Practical manual created successfully!");
      }

      setActiveTab("manuals");
      fetchManuals();
    } catch (error) {
      console.error("Failed to submit practical manual:", error);
      alert("Error processing request. Please verify inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredManuals = manuals.filter(m => 
    (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="relative min-h-screen p-8 space-y-8 overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/60 via-orange-50/40 to-amber-200/50" />
        <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-400/10 to-amber-500/10 blur-3xl" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Institute Panel • Yup Validated Practical Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Practical Manual Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
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
            All Manuals ({paginationInfo.total})
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreate}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
              activeTab === "create" || activeTab === "edit"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-orange-500/25" 
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Plus className="w-4 h-4" /> Create Manual
          </motion.button>
        </div>
      </div>

      {/* Main Container View Switcher */}
      <AnimatePresence mode="wait">
        {activeTab === "manuals" ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Filter & Search Bar */}
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter manuals by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input 
                  type="text"
                  placeholder="Course ID (24 hex)..."
                  value={filterCourseId}
                  onChange={(e) => setFilterCourseId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono w-48 placeholder:text-slate-400"
                />
                <input 
                  type="text"
                  placeholder="Topic ID (optional)..."
                  value={filterTopicId}
                  onChange={(e) => setFilterTopicId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono w-48 placeholder:text-slate-400"
                />
                <button 
                  onClick={fetchManuals}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shrink-0"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply Filter"}
                </button>
              </div>
            </div>

            {/* Manual Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="col-span-2 py-20 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-500">Fetching practical manuals...</p>
                </div>
              ) : filteredManuals.length > 0 ? (
                filteredManuals.map((manual, index) => {
                  const courseName = typeof manual.course_id === 'object' ? manual.course_id?.course_name : manual.course_id;
                  const topicName = typeof manual.topic_id === 'object' ? manual.topic_id?.title : manual.topic_id;

                  return (
                    <motion.div 
                      key={manual._id || index}
                      whileHover={{ y: -3 }}
                      className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-xl border border-orange-200 font-mono truncate max-w-[200px]">
                            Course: {courseName || "N/A"}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {manual.createdAt ? new Date(manual.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-slate-900">{manual.title}</h3>
                        
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 text-slate-600">
                          <div><strong className="text-slate-800">Topic:</strong> {topicName || "None"}</div>
                          <div><strong className="text-slate-800">Questions:</strong> {manual.questions?.length || 0} items</div>
                        </div>

                        {manual.attachment_url && (
                          <div className="flex items-center gap-2 text-xs text-orange-600 font-bold bg-orange-50/50 p-2 rounded-xl border border-orange-100">
                            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                            <a href={manual.attachment_url} target="_blank" rel="noreferrer" className="truncate hover:underline">
                              View Attachment File
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                        </span>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => fetchManualDetails(manual._id)}
                            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(manual)}
                            className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteManual(manual._id)}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-2 py-16 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
                  <p className="text-slate-400 text-sm font-semibold">No practical manuals found.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === "detail" ? (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-orange-600 uppercase">GET /practical/:id (Fully Populated)</span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedManual?.title}</h2>
              </div>
              <button 
                onClick={() => setActiveTab("manuals")}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-700" />
              </button>
            </div>

            {selectedManual && (
              <div className="space-y-6 text-xs text-slate-700">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div><strong>ID:</strong> <span className="font-mono text-[10px]">{selectedManual._id}</span></div>
                  <div><strong>Course:</strong> <span className="font-semibold">{typeof selectedManual.course_id === 'object' ? selectedManual.course_id?.course_name : selectedManual.course_id}</span></div>
                  <div><strong>Topic:</strong> <span className="font-semibold">{typeof selectedManual.topic_id === 'object' ? selectedManual.topic_id?.title : selectedManual.topic_id || "None"}</span></div>
                  <div><strong>Created:</strong> {selectedManual.createdAt ? new Date(selectedManual.createdAt).toLocaleString() : "N/A"}</div>
                </div>

                {selectedManual.attachment_url && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
                    <span className="font-bold text-orange-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Attachment Available
                    </span>
                    <a href={selectedManual.attachment_url} target="_blank" rel="noreferrer" className="text-orange-600 underline font-bold">
                      Download File
                    </a>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">Questions Breakdown</h4>
                  <div className="space-y-3">
                    {selectedManual.questions?.map((q, idx) => (
                      <div key={q._id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-900">{q.question_text}</div>
                        {q.answer_key_html && (
                          <div className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200" dangerouslySetInnerHTML={{ __html: q.answer_key_html }} />
                        )}
                        <div className="text-[10px] text-orange-600 font-bold">Answer Lines: {q.answer_lines}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    onClick={() => handleOpenEdit(selectedManual)}
                    className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md"
                  >
                    Edit Manual
                  </button>
                  <button 
                    onClick={() => handleDeleteManual(selectedManual._id)}
                    className="px-5 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-xl border border-rose-200"
                  >
                    Delete Manual
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">
                {editingManualId ? "Update Practical Manual (Yup Validated)" : "Create Practical Manual (Yup Validated)"}
              </h2>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Title</label>
                <input 
                  type="text"
                  placeholder="e.g., Introduction to Circuit Design"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/25 placeholder:text-slate-400 ${
                    formErrors.title ? "border-rose-500 bg-rose-50/20" : "border-slate-200"
                  }`}
                />
                {formErrors.title && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.title}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Course ID (24 Hex ObjectId)</label>
                  <input 
                    type="text"
                    placeholder="e.g., 6a61e8eb900bc07bc83e54a2"
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl text-xs font-mono focus:outline-none placeholder:text-slate-400 ${
                      formErrors.course_id ? "border-rose-500 bg-rose-50/20" : "border-slate-200"
                    }`}
                  />
                  {formErrors.course_id && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.course_id}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Topic ID (Optional ObjectId)</label>
                  <input 
                    type="text"
                    placeholder="e.g., 6a509d7875de4d60103689dc"
                    value={formTopicId}
                    onChange={(e) => setFormTopicId(e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl text-xs font-mono focus:outline-none placeholder:text-slate-400 ${
                      formErrors.topic_id ? "border-rose-500 bg-rose-50/20" : "border-slate-200"
                    }`}
                  />
                  {formErrors.topic_id && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.topic_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Attachment File Input */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Practical Attachment (Optional)</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <Upload className="w-5 h-5 text-orange-500 shrink-0" />
                  <input 
                    type="file"
                    onChange={(e) => setPracticalAttachment(e.target.files[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                  />
                </div>
                {editingManualId && (
                  <label className="flex items-center gap-2 text-xs font-bold text-rose-600 pt-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={removeAttachment}
                      onChange={(e) => setRemoveAttachment(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    Remove existing attachment (remove_attachment: true)
                  </label>
                )}
              </div>

              {/* Dynamic Questions Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Questions Array Schema Verification</label>
                  <button 
                    type="button"
                    onClick={addQuestionField}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                {formErrors.questions && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.questions}
                  </p>
                )}

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
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Question Text (Min 3 chars)</label>
                        <input 
                          type="text"
                          placeholder="e.g., What is Ohm's Law?"
                          value={q.question_text}
                          onChange={(e) => handleQuestionChange(index, "question_text", e.target.value)}
                          className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium focus:outline-none placeholder:text-slate-400 ${
                            formErrors[`questions[${index}].question_text`] ? "border-rose-500 bg-rose-50/20" : "border-slate-200"
                          }`}
                        />
                        {formErrors[`questions[${index}].question_text`] && (
                          <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                            {formErrors[`questions[${index}].question_text`]}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Answer Lines (1-50)</label>
                        <input 
                          type="number"
                          min="1"
                          max="50"
                          value={q.answer_lines}
                          onChange={(e) => handleQuestionChange(index, "answer_lines", Number(e.target.value))}
                          className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium text-center focus:outline-none ${
                            formErrors[`questions[${index}].answer_lines`] ? "border-rose-500 bg-rose-50/20" : "border-slate-200"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Answer Key HTML</label>
                      <textarea 
                        rows="2"
                        placeholder="<p>Voltage equals current times resistance...</p>"
                        value={q.answer_key_html}
                        onChange={(e) => handleQuestionChange(index, "answer_key_html", e.target.value)}
                        className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-mono focus:outline-none placeholder:text-slate-400 ${
                          formErrors[`questions[${index}].answer_key_html`] ? "border-rose-500 bg-rose-50/20" : "border-slate-200"
                        }`}
                      />
                      {formErrors[`questions[${index}].answer_key_html`] && (
                        <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                          {formErrors[`questions[${index}].answer_key_html`]}
                        </span>
                      )}
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
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Validating..." : editingManualId ? "Update Manual (Yup Checked)" : "Create Manual (Yup Checked)"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}