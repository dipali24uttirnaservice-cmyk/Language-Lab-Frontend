"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { ArrowLeft, Plus, Trash2, X, Loader2, HelpCircle } from "lucide-react";

import { taskApi } from "@/services/task/taskApi";
import RichTextEditor from "@/components/molecules/RichTextEditor";

// Matches Task.questions[].question_type exactly (Task.js model / taskValidation.js)
const Q_TYPES = [
  "mcq",
  "fill_blank",
  "true_false",
  "short_answer",
  "match",
  "recorder",
  "spell_word",
];

const inp =
  "w-full px-4 py-2.5 rounded-xl border border-orange-300 bg-white text-gray-800 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400 transition-all";

const blankQuestion = () => ({
  question_text: "",
  question_type: Q_TYPES[0],
  options: ["", ""],
  match_pairs: [],
  correct_answer: "",
  explanation: "",
  marks: 1,
});

function AddTaskQuestionPageContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  // "+ Add Q" links here with ?mode=new so the form always starts blank;
  // otherwise ("View Q") this page loads existing questions for editing.
  const isNewMode = searchParams.get("mode") === "new";

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([blankQuestion()]);
  // In "new" mode the form only holds the question(s) being added, so the
  // task's existing questions (kept here, not in `questions`) must be
  // re-attached on submit instead of being overwritten.
  const [existingQuestions, setExistingQuestions] = useState([]);

  useEffect(() => {
    taskApi
      .getTaskById(id)
      .then((res) => {
        const data = res.data?.data || res.data;
        setTask(data);
        if (isNewMode) {
          setExistingQuestions(data?.questions || []);
          setQuestions([blankQuestion()]);
        } else {
          // Pre-load existing questions so they can be edited/deleted here too,
          // not just appended to — this page is the full question manager.
          setQuestions(data?.questions?.length ? data.questions : [blankQuestion()]);
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Failed to load task",
          text: err?.response?.data?.message || err.message,
          confirmButtonColor: "#f97316",
        });
        router.push(`/institute-dashboard/student-task/${id}`);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  /* ── question helpers ── */
  const addQ = () => setQuestions((p) => [...p, blankQuestion()]);
  const removeQ = (i) => setQuestions((p) => p.filter((_, idx) => idx !== i));
  const updQ = (i, k, v) =>
    setQuestions((p) => p.map((q, idx) => (idx === i ? { ...q, [k]: v } : q)));
  const addOpt = (qi) =>
    setQuestions((p) =>
      p.map((q, idx) => (idx === qi ? { ...q, options: [...q.options, ""] } : q)),
    );
  const removeOpt = (qi, oi) =>
    setQuestions((p) =>
      p.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.filter((_, odx) => odx !== oi) }
          : q,
      ),
    );
  const updOpt = (qi, oi, v) =>
    setQuestions((p) =>
      p.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.map((o, odx) => (odx === oi ? v : o)) }
          : q,
      ),
    );
  // Only complete pairs (both sides filled) count toward the answer —
  // otherwise a half-filled pair like "banana:" would still produce a
  // non-empty correct_answer and slip past the save validation below.
  const buildMatchAnswer = (pairs) =>
    pairs
      .filter((pr) => pr.left.trim() && pr.right.trim())
      .map((pr) => `${pr.left}:${pr.right}`)
      .join("|");

  const updPair = (qi, pi, side, v) =>
    setQuestions((p) =>
      p.map((q, idx) => {
        if (idx !== qi) return q;
        const pairs = (q.match_pairs?.length ? q.match_pairs : [{ left: "", right: "" }]).map(
          (pr, pdx) => (pdx === pi ? { ...pr, [side]: v } : pr),
        );
        return {
          ...q,
          match_pairs: pairs,
          correct_answer: buildMatchAnswer(pairs),
        };
      }),
    );
  const addPair = (qi) =>
    setQuestions((p) =>
      p.map((q, idx) =>
        idx === qi
          ? { ...q, match_pairs: [...(q.match_pairs || []), { left: "", right: "" }] }
          : q,
      ),
    );
  const removePair = (qi, pi) =>
    setQuestions((p) =>
      p.map((q, idx) => {
        if (idx !== qi) return q;
        const pairs = (q.match_pairs || []).filter((_, pdx) => pdx !== pi);
        return {
          ...q,
          match_pairs: pairs,
          correct_answer: buildMatchAnswer(pairs),
        };
      }),
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = questions.filter(
      (q) => q.question_text.trim() && q.correct_answer.trim(),
    );
    // A deliberately empty list (all rows removed) clears the task's
    // questions entirely — only block save when a row was left half-filled.
    if (!valid.length && questions.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Complete each question, or remove it, before saving",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      const toSave = isNewMode ? [...existingQuestions, ...valid] : valid;
      formData.append("questions", JSON.stringify(toSave));
      await taskApi.updateTask(id, formData);
      Swal.fire({
        icon: "success",
        title: "Questions Saved",
        text: `${valid.length} question${valid.length > 1 ? "s" : ""} saved.`,
        timer: 1200,
        showConfirmButton: false,
      });
      router.push(`/institute-dashboard/student-task/${id}`);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.response?.data?.message || err.message,
        confirmButtonColor: "#f97316",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6 w-full">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push(`/institute-dashboard/student-task/${id}`)}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-orange-50/50 text-slate-600 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-orange-500" />
        </button>
        <div>
          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase border border-orange-200">
            Task Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Manage Questions</h1>
          <p className="text-xs text-slate-500 mt-0.5">{task?.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6 w-full bg-white p-6 md:p-8 rounded-3xl border border-orange-500/20 shadow-sm">
          <div className="flex items-center justify-between border-b border-orange-500/10 pb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              <h3 className="text-lg font-black text-slate-900">Questions</h3>
            </div>
            <button
              type="button"
              onClick={addQ}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm font-black hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
            >
              <Plus size={14} strokeWidth={2.5} /> Add Question
            </button>
          </div>

          {questions.map((q, i) => (
            <div
              key={i}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4"
            >
              {/* Question header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                  Question {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQ(i)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Question text */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Question Text <span className="text-orange-500">*</span>
                </label>
                <textarea
                  className={`${inp} resize-none`}
                  rows={2}
                  placeholder="Enter your question here…"
                  value={q.question_text}
                  onChange={(e) => updQ(i, "question_text", e.target.value)}
                />
              </div>

              {/* Type + Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Question Type
                  </label>
                  <select
                    className={`${inp} cursor-pointer`}
                    value={q.question_type}
                    onChange={(e) => updQ(i, "question_type", e.target.value)}
                  >
                    {Q_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Marks</label>
                  <input
                    type="number"
                    min={0}
                    className={inp}
                    value={q.marks}
                    onChange={(e) => updQ(i, "marks", +e.target.value)}
                  />
                </div>
              </div>

              {/* Options — MCQ / fill_blank / true_false / recorder / spell_word */}
              {["mcq", "fill_blank", "true_false", "recorder", "spell_word"].includes(
                q.question_type,
              ) && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Options
                    {q.question_type === "recorder" && (
                      <span className="font-normal text-slate-400">
                        {" "}
                        (shuffled items — enter the correct sequence below, comma-separated)
                      </span>
                    )}
                    {q.question_type === "spell_word" && (
                      <span className="font-normal text-slate-400"> (candidate spellings)</span>
                    )}
                  </label>
                  <div className="space-y-2">
                    {q.options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 w-5 shrink-0">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        <input
                          className={inp}
                          placeholder={`Option ${oi + 1}`}
                          value={o}
                          onChange={(e) => updOpt(i, oi, e.target.value)}
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOpt(i, oi)}
                            className="text-red-400 hover:text-red-600 shrink-0"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addOpt(i)}
                    className="mt-2 text-xs text-orange-600 font-bold hover:underline"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {/* Match Pairs */}
              {q.question_type === "match" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Match Pairs
                  </label>
                  <div className="space-y-2">
                    {(q.match_pairs?.length ? q.match_pairs : [{ left: "", right: "" }]).map(
                      (p, pi) => (
                        <div key={pi} className="flex items-center gap-2">
                          <input
                            className={inp}
                            placeholder="Left (e.g. India)"
                            value={p.left}
                            onChange={(e) => updPair(i, pi, "left", e.target.value)}
                          />
                          <span className="text-orange-500 font-black shrink-0">→</span>
                          <input
                            className={inp}
                            placeholder="Right (e.g. Delhi)"
                            value={p.right}
                            onChange={(e) => updPair(i, pi, "right", e.target.value)}
                          />
                          {(q.match_pairs?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() => removePair(i, pi)}
                              className="text-red-400 hover:text-red-600 shrink-0"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => addPair(i)}
                    className="mt-2 text-xs text-orange-600 font-bold hover:underline"
                  >
                    + Add Pair
                  </button>
                </div>
              )}

              {/* Correct answer */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Correct Answer <span className="text-orange-500">*</span>
                </label>
                <input
                  className={inp}
                  placeholder="Correct answer"
                  value={q.correct_answer}
                  readOnly={q.question_type === "match"}
                  onChange={(e) => updQ(i, "correct_answer", e.target.value)}
                />
                {q.question_type === "match" && (
                  <p className="mt-1 text-xs text-slate-400">
                    Auto-generated from Match Pairs above
                  </p>
                )}
              </div>

              {/* Explanation — rich text */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Explanation (optional)
                </label>
                <RichTextEditor
                  value={q.explanation || ""}
                  onChange={(val) => updQ(i, "explanation", val)}
                  placeholder="Explain the answer…"
                  minHeight={120}
                />
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-4 border-t border-orange-500/10">
            <button
              type="button"
              onClick={() => router.push(`/institute-dashboard/student-task/${id}`)}
              className="px-5 py-2.5 rounded-xl border border-orange-300 text-orange-700 bg-white font-bold text-sm hover:bg-orange-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm shadow-lg shadow-orange-500/25 border-b-2 border-orange-700 disabled:opacity-60 disabled:pointer-events-none active:scale-95 flex items-center gap-2 transition-all"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving
                ? "Saving…"
                : `Save Questions (${questions.length})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AddTaskQuestionPage() {
  return (
    <Suspense fallback={null}>
      <AddTaskQuestionPageContent />
    </Suspense>
  );
}
