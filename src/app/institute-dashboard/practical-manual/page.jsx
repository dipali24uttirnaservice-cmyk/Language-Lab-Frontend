"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit3,
  Eye,
  Trash2,
  Loader2,
  FileText,
  RefreshCw,
  Send,
  CheckCircle2,
} from "lucide-react";

import {
  practicalManualList,
  practicalManualDetail,
  deletePracticalManual,
  getPracticalSubmissions,
  gradePracticalSubmission,
} from "@/services/practical-Manual/page.jsx";
import { courseApi } from "@/services/course/courseApi";
import { topicApi } from "@/services/topic/topicApi";

export default function PracticalManualPage() {
  const router = useRouter();

  // =========================
  // STATES
  // =========================
  const [manuals, setManuals] = useState([]);
  const [selectedManual, setSelectedManual] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterTopicId, setFilterTopicId] = useState("");
  const [filterCourses, setFilterCourses] = useState([]);
  const [filterTopics, setFilterTopics] = useState([]);
  const [filterTopicsLoading, setFilterTopicsLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10
  });

  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);

  // Submissions Modal State
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissionsManual, setSubmissionsManual] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // =========================
  // FETCH LIST
  // =========================
  const fetchManuals = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filterCourseId) params.courseId = filterCourseId;
      if (filterTopicId) params.topicId = filterTopicId;

      const response = await practicalManualList(params);
      const result = response?.data || response;
      const data = result?.data || result;
      const list =
        data?.practicals ||
        data?.practicalManuals ||
        (Array.isArray(data) ? data : []);

      setManuals(list);
      setPagination({
        total: data?.total || list.length,
        page: data?.page || page,
        limit: data?.limit || limit
      });
    } catch (error) {
      console.log("Fetch practical error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManuals();
  }, [page, limit]);

  // Course/Topic filter dropdowns — same source as the create/edit form.
  useEffect(() => {
    courseApi
      .getCourses()
      .then((res) => setFilterCourses(res.data?.data?.courses || []))
      .catch((error) => console.error("Get Courses Error:", error));
  }, []);

  useEffect(() => {
    if (!filterCourseId) {
      setFilterTopics([]);
      return;
    }
    setFilterTopicsLoading(true);
    topicApi
      .getTopics(filterCourseId)
      .then((res) => setFilterTopics(res.data?.data?.topics || res.data?.data || []))
      .catch((error) => {
        console.error("Get Topics Error:", error);
        setFilterTopics([]);
      })
      .finally(() => setFilterTopicsLoading(false));
  }, [filterCourseId]);

  const handleFilterCourseChange = (id) => {
    setFilterCourseId(id);
    setFilterTopicId("");
  };

  const openViewModal = async (id) => {
    try {
      setLoading(true);
      const response = await practicalManualDetail(id);
      const data = response?.data || response;
      setSelectedManual(data?.data || data);
      setShowViewModal(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const openSubmissionsModal = async (manual) => {
    setSubmissionsManual(manual);
    setShowSubmissionsModal(true);
    setSubmissionsLoading(true);
    try {
      const response = await getPracticalSubmissions(manual._id);
      const data = response?.data?.data || response?.data;
      setSubmissions(data?.submissions || []);
    } catch (error) {
      console.error("Get Practical Submissions Error:", error);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId, marks, feedback) => {
    try {
      await gradePracticalSubmission(submissionsManual._id, submissionId, {
        marks: marks === "" ? undefined : Number(marks),
        feedback,
      });
      const response = await getPracticalSubmissions(submissionsManual._id);
      const data = response?.data?.data || response?.data;
      setSubmissions(data?.submissions || []);
    } catch (error) {
      console.error("Grade Practical Submission Error:", error);
    }
  };

  const handleDeleteManual = async (id) => {
    if (!confirm("Are you sure you want to delete this practical manual?")) return;
    try {
      await deletePracticalManual(id);
      fetchManuals();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredManuals = manuals.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase">
            Academic Resources
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">
            Practical <span className="text-orange-600">Manuals</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage practical curriculum, modules, and assignment questions efficiently.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/institute-dashboard/practical-manual/create")}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/10 border-b-2 border-orange-700 active:scale-95 flex items-center gap-2 justify-center transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Manual
        </motion.button>
      </div>

      {/* ================= SEARCH & FILTERS BAR ================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manual by title..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm"
          />
        </div>

        <select
          value={filterCourseId}
          onChange={(e) => handleFilterCourseChange(e.target.value)}
          className="px-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm min-w-42.5 cursor-pointer"
        >
          <option value="">All Courses</option>
          {filterCourses.map((c) => (
            <option key={c._id} value={c._id}>{c.course_name}</option>
          ))}
        </select>

        <select
          value={filterTopicId}
          onChange={(e) => setFilterTopicId(e.target.value)}
          disabled={!filterCourseId || filterTopicsLoading}
          className="px-4 py-3 rounded-xl border border-orange-300 bg-white text-gray-700 placeholder:text-gray-400 hover:border-orange-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm min-w-42.5 cursor-pointer disabled:opacity-60"
        >
          <option value="">
            {!filterCourseId ? "All Topics" : filterTopicsLoading ? "Loading..." : "All Topics"}
          </option>
          {filterTopics.map((t) => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>

        <button
          onClick={fetchManuals}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all active:scale-95 shadow-md shadow-slate-900/10 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Apply
        </button>
      </div>

      {/* ================= TABLE CONTAINER ================= */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-4 text-left pl-6">Sr. No.</th>
                <th className="p-4 text-left">Title & Attachment</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Topic</th>
                <th className="p-4 text-center">Questions</th>
                <th className="p-4 text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                  </td>
                </tr>
              ) : filteredManuals.length > 0 ? (
                filteredManuals.map((manual, index) => {
                  const courseName =
                    typeof manual.course_id === "object"
                      ? manual.course_id?.course_name
                      : manual.course_id;

                  const topicName =
                    typeof manual.topic_id === "object"
                      ? manual.topic_id?.title
                      : manual.topic_id;

                  return (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={manual._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4 pl-6 font-bold text-slate-400">
                        {index + 1}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {manual.title}
                        </div>
                        {manual.attachment_url && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                            <FileText className="w-3.5 h-3.5" />
                            File Attached
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-medium text-slate-600">
                        {courseName || "-"}
                      </td>

                      <td className="p-4 font-medium text-slate-600">
                        {topicName || "-"}
                      </td>

                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-bold text-xs inline-block">
                          {manual.questions?.length || 0} Questions
                        </span>
                      </td>

                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openViewModal(manual._id)}
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View Manual"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openSubmissionsModal(manual)}
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="View Submissions"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => router.push(`/institute-dashboard/practical-manual/${manual._id}`)}
                            className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                            title="Edit Manual"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteManual(manual._id)}
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Manual"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-20 text-slate-400 font-medium">
                    No practical manuals found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= VIEW MODAL (Optional preview popup) ================= */}
      {showViewModal && selectedManual && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            onClick={() => setShowViewModal(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col relative z-10">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {selectedManual.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Detailed view of practical manual</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Course</span>
                  <p className="font-bold text-slate-800 mt-1">
                    {typeof selectedManual.course_id === "object"
                      ? selectedManual.course_id?.course_name
                      : selectedManual.course_id}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Topic</span>
                  <p className="font-bold text-slate-800 mt-1">
                    {typeof selectedManual.topic_id === "object"
                      ? selectedManual.topic_id?.title
                      : selectedManual.topic_id || "-"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Questions</span>
                  <p className="font-bold text-orange-600 mt-1">
                    {selectedManual.questions?.length || 0}
                  </p>
                </div>
              </div>

              {selectedManual.attachment_url && (
                <a
                  href={selectedManual.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl font-bold hover:bg-emerald-100 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>Download / View Attachment File</span>
                </a>
              )}

              <div className="space-y-4">
                <h3 className="font-black text-lg text-slate-900">Questions List</h3>
                <div className="space-y-3">
                  {selectedManual.questions?.map((q, index) => (
                    <div key={index} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-2">
                      <p className="font-bold text-slate-900">
                        {index + 1}. {q.question_text}
                      </p>
                      <div
                        className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100"
                        dangerouslySetInnerHTML={{ __html: q.answer_key_html }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBMISSIONS MODAL ================= */}
      {showSubmissionsModal && submissionsManual && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            onClick={() => setShowSubmissionsModal(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col relative z-10">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {submissionsManual.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {submissions.length} student submission{submissions.length === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {submissionsLoading ? (
                <div className="py-16 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : submissions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-12">
                  No submissions yet.
                </p>
              ) : (
                submissions.map((sub) => (
                  <PracticalSubmissionRow
                    key={sub._id}
                    submission={sub}
                    questions={submissionsManual.questions || []}
                    onGrade={(marks, feedback) => handleGradeSubmission(sub._id, marks, feedback)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PracticalSubmissionRow({ submission, questions, onGrade }) {
  const [marks, setMarks] = useState(submission.marks ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [expanded, setExpanded] = useState(false);

  const answerByQuestionId = {};
  (submission.answers || []).forEach((a) => {
    answerByQuestionId[a.question_id] = a.answer_html;
  });

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">
            {submission.student_id?.full_name || "Unknown student"}
          </p>
          <p className="text-xs text-slate-400">
            {submission.student_id?.enrollment_no} ·{" "}
            <span className="font-semibold text-slate-500">{submission.status}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs font-bold text-orange-600 hover:underline shrink-0 self-start sm:self-auto"
        >
          {expanded ? "Hide answers" : "View answers"}
        </button>
      </div>

      {expanded && (
        <div className="space-y-2 pt-1">
          {questions.map((q, idx) => (
            <div key={q._id} className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-1">
                {idx + 1}. {q.question_text}
              </p>
              <div
                className="text-xs text-slate-600"
                dangerouslySetInnerHTML={{
                  __html: answerByQuestionId[q._id] || "<em>No answer given.</em>",
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="number"
          placeholder="Marks"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          className="w-full sm:w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
        />
        <input
          type="text"
          placeholder="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
        />
        <button
          type="button"
          onClick={() => onGrade(marks, feedback)}
          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Save
        </button>
      </div>
    </div>
  );
}