"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaClock, FaStar, FaQuestionCircle } from "react-icons/fa";
import { ArrowLeft, History } from "lucide-react";
import { studentAssessmentApi } from "@/services/assessment/studentAssessmentApi";

// Simplified port of carrer-jupiter-frontend's TestComp/TestResult.jsx —
// score header, stat cards, pass/fail message. Certificate/report-PDF/
// WhatsApp-share/chart.js parts of the original aren't ported since this
// project's Assessment backend doesn't generate those.
export default function AssessmentResultPage() {
  const { subjectId, assessmentId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]); // full history, oldest first
  // Which attempt's score is shown in the top card — defaults to the latest
  // (same as `result`), but clicking a row in Attempt History below swaps
  // this to that attempt instead, all from data already fetched here.
  const [viewedAttempt, setViewedAttempt] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [resultRes, attemptsRes] = await Promise.allSettled([
          studentAssessmentApi.getResult(assessmentId),
          studentAssessmentApi.getAttempts(assessmentId),
        ]);
        const latest = resultRes.status === "fulfilled" ? resultRes.value.data?.data || null : null;
        setResult(latest);
        setViewedAttempt(latest);
        setAttempts(attemptsRes.status === "fulfilled" ? attemptsRes.value.data?.data || [] : []);
      } catch (err) {
        console.error("Failed to load result:", err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };
    if (assessmentId) load();
  }, [assessmentId]);

  const handleViewAttempt = (attempt) => {
    setViewedAttempt(attempt);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-t-emerald-500 border-slate-200" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20 text-slate-400 font-semibold">
        No result found for this assessment yet.
        <br />
        <button
          onClick={() => router.push(`/dashboard/assessment/${subjectId}`)}
          className="mt-4 text-emerald-600 font-bold hover:underline"
        >
          ← Back to Assessments
        </button>
      </div>
    );
  }

  const { score = 0, max_score = 0, accuracy = 0, is_passed, time_spent_sec = 0, attempt_number } = viewedAttempt || result;

  let passFailMessage = "Keep going! Every attempt helps you learn.";
  let resultIcon = <FaTimesCircle className="text-red-500 text-4xl sm:text-5xl" />;
  if (accuracy >= 75) {
    passFailMessage = "Excellent! You've mastered this assessment! 🏆";
    resultIcon = <FaTrophy className="text-amber-500 text-4xl sm:text-5xl" />;
  } else if (accuracy >= 50) {
    passFailMessage = "Well done! You're on the right track! 👍";
    resultIcon = <FaCheckCircle className="text-emerald-500 text-4xl sm:text-5xl" />;
  } else if (accuracy >= 25) {
    passFailMessage = "Good effort! Keep practicing to improve. 🔄";
    resultIcon = <FaQuestionCircle className="text-teal-500 text-4xl sm:text-5xl" />;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push(`/dashboard/assessment/${subjectId}`)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Assessments
      </button>

      <div className="bg-white shadow-sm border border-slate-200 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 sm:p-5 text-white">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <FaStar className="text-yellow-300 text-base sm:text-lg" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Assessment Results</h2>
            <FaStar className="text-yellow-300 text-base sm:text-lg" />
          </div>
          <div className="flex items-center justify-center mt-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold">
              {score}/{max_score}
            </div>
          </div>
          <p className="text-center text-sm text-white/80 mt-1">Attempt #{attempt_number}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 bg-slate-50">
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
            <div className="bg-teal-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
              <FaClock className="text-teal-600 text-lg sm:text-xl" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Time Spent</p>
              <p className="text-lg sm:text-xl font-bold text-slate-800">
                {Math.floor(time_spent_sec / 60)}m {time_spent_sec % 60}s
              </p>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
            <div className="bg-emerald-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
              <FaCheckCircle className="text-emerald-600 text-lg sm:text-xl" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Accuracy</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-600">{accuracy}%</p>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
            <div className={`p-2 sm:p-3 rounded-full mr-3 sm:mr-4 ${is_passed ? "bg-emerald-50" : "bg-red-50"}`}>
              {is_passed ? (
                <FaCheckCircle className="text-emerald-600 text-lg sm:text-xl" />
              ) : (
                <FaTimesCircle className="text-red-600 text-lg sm:text-xl" />
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">Status</p>
              <p className={`text-lg sm:text-xl font-bold ${is_passed ? "text-emerald-600" : "text-red-600"}`}>
                {is_passed ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-1 sm:pt-2 px-4 sm:px-5">
          <div className="w-full bg-slate-200 rounded-full h-2 sm:h-2.5 mt-1">
            <div
              className={`h-2 sm:h-2.5 rounded-full ${
                accuracy >= 75 ? "bg-amber-500" : accuracy >= 50 ? "bg-emerald-500" : accuracy >= 25 ? "bg-teal-500" : "bg-red-500"
              }`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        <div className={`p-3 sm:p-4 md:p-5 flex items-center justify-center flex-col gap-1 sm:gap-2 mt-3 ${is_passed ? "bg-emerald-50" : "bg-red-50"}`}>
          <div className="flex items-center gap-2">{resultIcon}</div>
          <p className={`text-center text-sm sm:text-base md:text-lg font-medium ${is_passed ? "text-emerald-700" : "text-red-700"}`}>
            {passFailMessage}
          </p>
        </div>
      </div>

      {/* Attempt history — every completed attempt for this assessment, so
          the student can see their trend across retakes, not just the latest. */}
      {attempts.length > 0 && (
        <div className="bg-white shadow-sm border border-slate-200 overflow-hidden rounded-2xl mt-6">
          <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <History size={18} className="text-emerald-600" />
            <h3 className="font-bold text-slate-800">Attempt History</h3>
            <span className="ml-auto text-xs font-bold text-slate-400">
              {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {attempts.map((a) => (
              <button
                key={a.attempt_number}
                type="button"
                onClick={() => handleViewAttempt(a)}
                className={`w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 text-left transition-colors hover:bg-emerald-50/40 cursor-pointer ${
                  a.attempt_number === attempt_number ? "bg-emerald-50/60" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                      a.is_passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    #{a.attempt_number}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">
                      {a.score}/{a.max_score}{" "}
                      <span className="text-xs font-medium text-slate-400">({a.accuracy}%)</span>
                      {a.attempt_number === attempt_number && (
                        <span className="ml-2 text-[10px] font-black uppercase tracking-wide text-emerald-600">
                          Viewing
                        </span>
                      )}
                    </p>
                    {a.submitted_at && (
                      <p className="text-xs text-slate-400">{new Date(a.submitted_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <span
                  className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                    a.is_passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {a.is_passed ? "Passed" : "Failed"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
