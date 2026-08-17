"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaBrain } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { studentAssessmentApi } from "@/services/assessment/studentAssessmentApi";

// Same "one card per test, badge shows attempt state" layout as
// carrer-jupiter-frontend's TestComp/TestCard.jsx, adapted to this
// project's Assessment (MCQ-only, optionA-D) + AssessmentAttempt backend.
export default function AssessmentListPage() {
  const { subjectId } = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [subjectRes, listRes] = await Promise.all([
        studentAssessmentApi.getSubject(subjectId),
        studentAssessmentApi.getAssessments(subjectId),
      ]);
      setSubject(subjectRes.data?.data || null);

      const list = listRes.data?.data || [];

      // Work out each card's state the same way TestCard.jsx does — but our
      // backend doesn't return "attempted" on the list itself, so resolve it
      // per-assessment: an in-progress attempt (save-progress/resume) wins,
      // otherwise fall back to the completed-attempt history.
      const withStatus = await Promise.all(
        list.map(async (a) => {
          const [resumeRes, attemptsRes] = await Promise.allSettled([
            studentAssessmentApi.resume(a._id),
            studentAssessmentApi.getAttempts(a._id),
          ]);

          const inProgress = resumeRes.status === "fulfilled";
          const attempts =
            attemptsRes.status === "fulfilled" ? attemptsRes.value.data?.data || [] : [];
          const lastAttempt = attempts[attempts.length - 1];

          // attempted: 0 = never started, 1 = has a completed attempt, -1 = in progress
          let attempted = 0;
          if (inProgress) attempted = -1;
          else if (lastAttempt) attempted = 1;

          return { ...a, attempted, attemptsCount: attempts.length, lastAttempt };
        }),
      );

      setAssessments(withStatus);
    } catch (err) {
      console.error("Failed to load assessments:", err);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => { if (subjectId) await load(); };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const startOrResume = (assessment) => {
    Swal.fire({
      title: `${assessment.attempted === -1 ? "Resume" : "Start"} ${assessment.title}?`,
      html: `
        <div class="text-left max-h-[60vh] overflow-y-auto">
          <div class="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 class="font-semibold text-blue-800 mb-2">General Guidelines:</h4>
            <ul class="space-y-2 list-disc pl-5 text-blue-700">
              <li>Total questions: ${assessment.questions?.length ?? "—"}</li>
              ${
                assessment.duration?.minutes || assessment.duration?.seconds
                  ? `<li>Time limit: ${assessment.duration.minutes || 0}m ${assessment.duration.seconds || 0}s</li>`
                  : ""
              }
              <li>Each question carries its own marks</li>
              <li>Attempts used: ${assessment.attemptsCount}/${assessment.max_attempts}</li>
            </ul>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg mb-4">
            <h4 class="font-semibold text-yellow-800 mb-2">During the Test:</h4>
            <ul class="space-y-2 list-disc pl-5 text-yellow-700">
              <li>Click an option to select your answer</li>
              <li>You can change answers before final submission</li>
              <li>Don't refresh the page during the test</li>
            </ul>
          </div>
          <div class="flex items-start mt-4">
            <input type="checkbox" id="agreeTerms" class="w-5 h-5 mt-1 mr-2 cursor-pointer">
            <label for="agreeTerms" class="text-gray-700 cursor-pointer">
              I confirm that I have read and understood all instructions
            </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: assessment.attempted === -1 ? "Resume Test" : "Start Test",
      cancelButtonText: "Cancel",
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        const checkbox = Swal.getPopup().querySelector("#agreeTerms");
        confirmBtn.disabled = true;
        checkbox.addEventListener("change", () => {
          confirmBtn.disabled = !checkbox.checked;
        });
      },
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`/dashboard/assessment/${subjectId}/${assessment._id}`);
      }
    });
  };

  const handleRetest = (assessment) => {
    if (assessment.attemptsCount >= assessment.max_attempts) {
      Swal.fire({
        icon: "warning",
        title: "No attempts left",
        text: `You've used all ${assessment.max_attempts} attempts for this assessment.`,
      });
      return;
    }
    startOrResume(assessment);
  };

  const handleViewResult = (assessment) => {
    router.push(`/dashboard/assessment/${subjectId}/${assessment._id}/result`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <button
        onClick={() => router.push("/dashboard/assessment")}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Subjects
      </button>

      <h1 className="text-2xl font-black text-slate-900 mb-1">{subject?.title || "Assessments"}</h1>
      {subject?.description && <p className="text-sm text-slate-500 mb-6">{subject.description}</p>}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-t-emerald-500 border-slate-200" />
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
          No assessments available for this subject yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
          {assessments.map((test) => (
            <div
              key={test._id}
              className={`relative p-4 rounded-lg shadow-lg border cursor-pointer transition-all duration-300 bg-white
                ${test.attempted === 1 ? "shadow-green-500 shadow-md" : ""}
                ${test.attempted === -1 ? "shadow-yellow-500 shadow-md" : ""}`}
              onClick={() => {
                if (test.attempted === 0 || test.attempted === -1) startOrResume(test);
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <FaBrain className="text-emerald-500 text-4xl" />
                <h2 className="text-xl font-semibold">{test.title || "N/A"}</h2>
              </div>
              <p>
                Difficulty: <span className="font-medium capitalize">{test.difficulty || "N/A"}</span>
              </p>
              <p>
                Questions: <span className="font-medium">{test.questions?.length ?? "N/A"}</span>
              </p>
              <p>
                Attempts: <span className="font-medium">{test.attemptsCount}/{test.max_attempts}</span>
              </p>

              {test.attempted === 1 && (
                <div className="flex gap-1 mt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewResult(test); }}
                    className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow"
                  >
                    View Result
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRetest(test); }}
                    className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow"
                  >
                    Re-Test
                  </button>
                </div>
              )}
              {test.attempted === -1 && (
                <button className="mt-3 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                  In-Progress — Click to Resume
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
