"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaClock, FaStar, FaQuestionCircle } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await studentAssessmentApi.getResult(assessmentId);
        setResult(res.data?.data || null);
      } catch (err) {
        console.error("Failed to load result:", err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };
    if (assessmentId) load();
  }, [assessmentId]);

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

  const { score = 0, max_score = 0, accuracy = 0, is_passed, time_spent_sec = 0, attempt_number } = result;

  let passFailMessage = "Keep going! Every attempt helps you learn.";
  let resultIcon = <FaTimesCircle className="text-red-500 text-4xl sm:text-5xl" />;
  let resultEmoji = "📚";
  if (accuracy >= 75) {
    passFailMessage = "Excellent! You've mastered this test!";
    resultIcon = <FaTrophy className="text-amber-500 text-4xl sm:text-5xl" />;
    resultEmoji = "🏆";
  } else if (accuracy >= 50) {
    passFailMessage = "Well done! You're on the right track!";
    resultIcon = <FaCheckCircle className="text-blue-500 text-4xl sm:text-5xl" />;
    resultEmoji = "👍";
  } else if (accuracy >= 25) {
    passFailMessage = "Good effort! Keep practicing to improve.";
    resultIcon = <FaQuestionCircle className="text-blue-400 text-4xl sm:text-5xl" />;
    resultEmoji = "🔄";
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push(`/dashboard/assessment/${subjectId}`)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Assessments
      </button>

      <div className="bg-white shadow-md overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-300 p-4 sm:p-5 text-white">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <FaStar className="text-yellow-300 text-base sm:text-lg" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Test Results</h2>
            <FaStar className="text-yellow-300 text-base sm:text-lg" />
          </div>
          <div className="flex items-center justify-center mt-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold">
              {score}/{max_score}
            </div>
          </div>
          <p className="text-center text-sm text-white/80 mt-1">Attempt #{attempt_number}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
              <FaClock className="text-blue-600 text-lg sm:text-xl" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Time Spent</p>
              <p className="text-lg sm:text-xl font-bold text-gray-800">
                {Math.floor(time_spent_sec / 60)}m {time_spent_sec % 60}s
              </p>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className="bg-green-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
              <FaCheckCircle className="text-green-600 text-lg sm:text-xl" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Accuracy</p>
              <p className="text-lg sm:text-xl font-bold text-green-600">{accuracy}%</p>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className={`p-2 sm:p-3 rounded-full mr-3 sm:mr-4 ${is_passed ? "bg-green-100" : "bg-red-100"}`}>
              {is_passed ? (
                <FaCheckCircle className="text-green-600 text-lg sm:text-xl" />
              ) : (
                <FaTimesCircle className="text-red-600 text-lg sm:text-xl" />
              )}
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Status</p>
              <p className={`text-lg sm:text-xl font-bold ${is_passed ? "text-green-600" : "text-red-600"}`}>
                {is_passed ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-1 sm:pt-2 px-4 sm:px-5">
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mt-1">
            <div
              className={`h-2 sm:h-2.5 rounded-full ${
                accuracy >= 75 ? "bg-green-600" : accuracy >= 50 ? "bg-blue-600" : accuracy >= 25 ? "bg-amber-500" : "bg-red-600"
              }`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        <div className={`p-3 sm:p-4 md:p-5 flex items-center justify-center flex-col gap-1 sm:gap-2 mt-3 ${is_passed ? "bg-green-50" : "bg-red-50"}`}>
          <div className="flex items-center gap-2">{resultIcon}</div>
          <p className={`text-center text-sm sm:text-base md:text-lg font-medium ${is_passed ? "text-green-700" : "text-red-700"}`}>
            {passFailMessage} {resultEmoji}
          </p>
        </div>
      </div>
    </div>
  );
}
