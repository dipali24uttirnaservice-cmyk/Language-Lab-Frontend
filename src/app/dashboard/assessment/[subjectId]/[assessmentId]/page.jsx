"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaArrowRight, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { FcAlarmClock } from "react-icons/fc";
import Swal from "sweetalert2";
import { studentAssessmentApi } from "@/services/assessment/studentAssessmentApi";

const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"];

// Ported from carrer-jupiter-frontend's TestComp/IQTest.jsx + TestClock.jsx —
// same timer bar, question navigator grid + legend, save-and-next flow,
// auto-submit-on-timeout — wired to this project's Assessment
// save-progress/resume/submit endpoints instead of IQTest's updateTestProgress.
export default function AssessmentAttemptPage() {
  const { subjectId, assessmentId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]); // given_answer text per question index
  const [timeLeft, setTimeLeft] = useState(null); // null = untimed
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProgressSaved, setIsProgressSaved] = useState(true);

  const hasSubmittedRef = useRef(false);
  const timeLeftRef = useRef(null);
  const answersRef = useRef([]);
  const progressIntervalRef = useRef(null);
  const startedAtRef = useRef(null);

  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { startedAtRef.current = Date.now(); }, []);

  // ── Load the assessment, resuming an in-progress attempt if one exists ──
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await studentAssessmentApi.getAssessment(assessmentId);
        const a = res.data?.data;
        setAssessment(a);

        let initialAnswers = (a.questions || []).map(() => "");
        // "0m 0s" (or unset) = untimed — no countdown shown to the student.
        const totalDurationSec = (a.duration?.minutes || 0) * 60 + (a.duration?.seconds || 0);
        let initialTime = totalDurationSec > 0 ? totalDurationSec : null;

        try {
          const resumeRes = await studentAssessmentApi.resume(assessmentId);
          const attempt = resumeRes.data?.data;
          if (attempt) {
            (attempt.answers || []).forEach((ans) => {
              if (initialAnswers[ans.question_index] !== undefined) {
                initialAnswers[ans.question_index] = ans.given_answer;
              }
            });
            if (totalDurationSec > 0) {
              initialTime = attempt.remaining_time_sec || totalDurationSec;
            }
          }
        } catch {
          // No in-progress attempt — start fresh.
        }

        setAnswers(initialAnswers);
        setTimeLeft(initialTime);
      } catch (err) {
        console.error("Failed to load assessment:", err);
        Swal.fire({ icon: "error", title: "Failed to load assessment" }).then(() =>
          router.push(`/dashboard/assessment/${subjectId}`),
        );
      } finally {
        setLoading(false);
      }
    };
    const run = async () => { if (assessmentId) await load(); };
    run();
  }, [assessmentId, router, subjectId]);

  const buildAnswersPayload = () =>
    answersRef.current
      .map((given_answer, question_index) => ({ question_index, given_answer }))
      .filter((a) => a.given_answer !== "");

  const saveProgress = async () => {
    if (hasSubmittedRef.current) return;
    try {
      await studentAssessmentApi.saveProgress(assessmentId, {
        answers: buildAnswersPayload(),
        remaining_time_sec: timeLeftRef.current ?? 0,
      });
      setIsProgressSaved(true);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  const handleOptionSelect = (value) => {
    if (hasSubmittedRef.current) return;
    const next = [...answers];
    next[currentQuestion] = value;
    setAnswers(next);
    answersRef.current = next;
    setIsProgressSaved(false);
    saveProgress();
  };

  const handleNextQuestion = () => {
    setCurrentQuestion((prev) => Math.min(prev + 1, (assessment?.questions?.length || 1) - 1));
  };

  const handleSubmit = async (auto = false) => {
    if (hasSubmittedRef.current) return;

    const allAnswered = answers.every((a) => a !== "");
    if (!auto && !allAnswered) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Test!",
        text: "You must answer all questions before submitting!",
        confirmButtonColor: "#f39c12",
      });
      return;
    }

    const doSubmit = async () => {
      hasSubmittedRef.current = true;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsSubmitted(true);

      const time_spent_sec = Math.round((Date.now() - startedAtRef.current) / 1000);
      try {
        await studentAssessmentApi.submit(assessmentId, {
          answers: buildAnswersPayload(),
          time_spent_sec,
        });
        await Swal.fire({
          icon: "success",
          title: "Test Submitted!",
          text: "Your test was submitted successfully!",
          confirmButtonColor: "#28a745",
        });
        router.push(`/dashboard/assessment/${subjectId}/${assessmentId}/result`);
      } catch (err) {
        hasSubmittedRef.current = false;
        setIsSubmitted(false);
        Swal.fire({
          icon: "error",
          title: "Submission Failed!",
          text: err?.response?.data?.message || "Unable to submit the test. Please try again.",
        });
      }
    };

    if (auto) {
      doSubmit();
      return;
    }

    Swal.fire({
      icon: "question",
      title: "Are you sure?",
      text: "Once submitted, you cannot change your answers.",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "No, Cancel",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
    }).then((result) => {
      if (result.isConfirmed) doSubmit();
    });
  };

  // ── Timer ─────────────────────────────────────────────────────────────
  const timedOut = timeLeft !== null && timeLeft <= 0;
  useEffect(() => {
    if (timeLeft === null || isSubmitted || timedOut) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft === null, isSubmitted, timedOut]);

  useEffect(() => {
    if (timedOut) handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut]);

  // ── Periodic autosave (every 10s), same cadence as IQTest.jsx ───────────
  useEffect(() => {
    if (isSubmitted || hasSubmittedRef.current) return;

    progressIntervalRef.current = setInterval(() => {
      if (hasSubmittedRef.current) return;
      saveProgress();
    }, 10000);

    return () => clearInterval(progressIntervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted]);

  if (loading || !assessment) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-t-emerald-500 border-slate-200" />
      </div>
    );
  }

  const questions = assessment.questions || [];
  const question = questions[currentQuestion];
  const totalDuration = (assessment.duration?.minutes || 0) * 60 + (assessment.duration?.seconds || 0) || 1;
  const progressWidth = timeLeft !== null ? (timeLeft / totalDuration) * 100 : 100;

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto p-2 sm:p-4">
      {timeLeft !== null && (
        <div className="w-full bg-gray-100 p-3 md:p-4 shadow-lg rounded-xl mb-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4">
            <div className="relative w-full sm:w-3/4 md:w-2/3 lg:w-1/2 flex flex-col justify-start">
              <h1 className="text-lg sm:text-xl md:text-xl font-bold mb-1 sm:mb-2">{assessment.title}</h1>
              <div
                className="absolute transition-all duration-300 z-10"
                style={{ left: `${progressWidth}%`, transform: "translate(-50%, 0)", top: "2.5rem" }}
              >
                <FcAlarmClock className="text-2xl mt-2 sm:mt-6 md:mt-3 sm:text-3xl" />
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3 sm:h-4 overflow-hidden mt-6 relative">
                <div
                  className="h-full rounded-full border transition-all duration-500"
                  style={{ width: `${progressWidth}%`, background: "linear-gradient(to right, red 0%, yellow 50%, green 100%)" }}
                />
              </div>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-semibold mt-2 sm:mt-0 whitespace-nowrap">
              Time: {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row p-2 sm:p-4 bg-gray-100 gap-4 rounded-xl">
        <div className="flex-1 w-full bg-white p-3 sm:p-6 rounded-lg shadow-md">
          <div className="h-auto min-h-[15vh] md:min-h-[20vh] w-full">
            <div className="flex items-center space-x-4">
              <div className="bg-[#2C4167] text-white w-10 h-10 flex items-center justify-center text-xl font-bold rounded-sm">
                {currentQuestion + 1}
              </div>
              <h1 className="text-xl font-bold">{assessment.title}</h1>
            </div>
            <div className="flex items-center w-full h-auto mb-4 mt-4">
              <h2 className="text-lg sm:text-xl font-medium text-[#2C4167]">{question?.question_text}</h2>
              <div className="ml-auto text-sm text-gray-500 whitespace-nowrap">
                <span className="inline-block w-2 h-2 bg-[#2C4167] rounded-full mr-2"></span>
                {question?.marks ?? 1} Mark{(question?.marks ?? 1) !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {OPTION_KEYS.map((key, i) => {
              const value = question?.[key];
              if (!value) return null;
              const letter = String.fromCharCode(65 + i);
              return (
                <label
                  key={key}
                  className="flex items-center p-2 rounded border border-gray-200 hover:border-[#2C4167] cursor-pointer text-sm sm:text-base transition-all duration-200"
                >
                  <input
                    type="radio"
                    name="option"
                    checked={answers[currentQuestion] === value}
                    onChange={() => handleOptionSelect(value)}
                    className="mr-2"
                  />
                  {letter}. {value}
                </label>
              );
            })}
          </div>

          <div className="flex justify-between mt-4 sm:mt-6">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              className="flex items-center bg-white border border-[#2C4167] text-[#2C4167] px-4 py-2 rounded hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft className="mr-1 sm:mr-2" /> Previous
            </button>

            {currentQuestion < questions.length - 1 ? (
              answers[currentQuestion] === "" ? (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-pointer hover:bg-gray-400 transition-colors"
                >
                  Next <FaArrowRight className="ml-1 sm:ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Save &amp; Next <FaArrowRight className="ml-1 sm:ml-2" />
                </button>
              )
            ) : (
              answers[currentQuestion] !== "" && (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={!isProgressSaved}
                  className={`flex items-center px-4 py-2 rounded transition-colors
                    ${isProgressSaved ? "bg-[#F7941D] text-white hover:bg-[#E88C19]" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
                >
                  Submit <FaCheckCircle className="ml-1 sm:ml-2" />
                </button>
              )
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/3 xl:w-1/4 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Questions</h2>
          <div className="flex flex-wrap gap-2 py-2 overflow-y-auto">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-7 h-7 flex items-center justify-center transition-all duration-300 border-2
                  ${currentQuestion === index
                    ? "bg-blue-500 text-white border-blue-900"
                    : answers[index]
                    ? "bg-cyan-800 text-white border-cyan-900"
                    : "bg-amber-400 text-black border-amber-600"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="mt-8">
            <h2 className="text-base sm:text-lg font-bold text-[#2C4167] mb-4">Legend</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-cyan-800 mr-3"></div>
                <span className="text-gray-700">Attempted</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                <span className="text-gray-700">Current Question</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-amber-400 mr-3"></div>
                <span className="text-gray-700">Unattempted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
