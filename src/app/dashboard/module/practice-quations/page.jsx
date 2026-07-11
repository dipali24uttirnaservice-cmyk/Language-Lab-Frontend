"use client";

import { useSearchParams,useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react";

export default function PracticeQuestionsPage() {
  const searchParams = useSearchParams();
 const router = useRouter();
  const moduleData = useMemo(() => {
    const data = searchParams.get("data");
    if (!data) return null;

    try {
      return JSON.parse(decodeURIComponent(data));
    } catch {
      return null;
    }
  }, [searchParams]);

  if (!moduleData) {
    return (
      <div className="p-10 text-center">
        No Practice Data Found
      </div>
    );
  }

  const questions = moduleData.questions || [];

  const [current, setCurrent] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [answers, setAnswers] = useState({});

  if (!questions.length) {
    return (
      <div className="p-10 text-center">
        No Questions Available
      </div>
    );
  }

  const question = questions[current];

  const options =
    question.question_type === "true_false"
      ? ["True", "False"]
      : question.question_type === "mcq"
      ? question.options.filter(Boolean)
      : [];

  const correctAnswer =
    ["A", "B", "C", "D", "a", "b", "c", "d"].includes(
      question.correct_answer
    )
      ? options[
          ["A", "B", "C", "D", "a", "b", "c", "d"].indexOf(
            question.correct_answer
          ) % 4
        ]
      : question.correct_answer;

  const isAnswered = !!answers[current];

 const submitAnswer = () => {
  if (answers[current]) return;

  const value = selectedOptions[current];

  if (!value) return;

  setAnswers((prev) => ({
    ...prev,
    [current]: {
      isCorrect:
        value.toString().trim().toLowerCase() ===
        correctAnswer.toString().trim().toLowerCase(),
    },
  }));
};

const allAttempted = Object.keys(answers).length === questions.length;

const resetPractice = () => {
  setCurrent(0);
  setSelectedOptions({});
  setAnswers({});
};

  return (
    <div className="flex h-screen bg-white">
      {/* Left Question List */}
    <div className="w-80 border-r p-4 overflow-auto bg-slate-50">
  <h2 className="font-bold text-xl mb-6 px-2 text-slate-800">
    Practice Questions
  </h2>

  {questions.map((q, index) => {
    const isCompleted = !!answers[index];
    const isActive = current === index;

    return (
      <button
        key={index}
        onClick={() => setCurrent(index)}
        className={`w-full p-4 rounded-2xl mb-3 text-left transition-all duration-300 transform border-2 ${
          isActive
            ? "bg-orange-500 text-white shadow-lg shadow-orange-200 border-orange-500 scale-[1.02]"
            : "bg-white hover:bg-orange-50 border-transparent hover:border-orange-100"
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className={`font-semibold text-sm ${isActive ? "text-orange-50" : "text-slate-500"}`}>
            Question {index + 1}
          </span>
          {isCompleted && (
            <div className={`p-1 rounded-full ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
              {answers[index].isCorrect ? (
                <CheckCircle2 size={14} className={isActive ? "text-white" : "text-green-500"} />
              ) : (
                <XCircle size={14} className={isActive ? "text-white" : "text-red-500"} />
              )}
            </div>
          )}
        </div>

        <div className={`text-sm truncate font-medium ${isActive ? "text-white" : "text-slate-700"}`}>
          {q.question_text}
        </div>
      </button>
    );
  })}
</div>

      {/* Right Question Container */}
<div className="flex-1 p-10 overflow-auto bg-slate-50">
  <button
  onClick={() => router.back()}
  className="flex items-center gap-2 text-slate-600 hover:text-orange-600 font-medium transition"
>
  <ArrowLeft size={20} />
  <span>Back</span>
</button>
<div className="max-w-2xl mx-auto relative overflow-hidden rounded-3xl border border-orange-200 bg-white p-8 shadow-[0_20px_60px_rgba(249,115,22,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-[0_25px_70px_rgba(249,115,22,0.25)]">
    {/* Question Header */}
    <div className="mb-8">
      <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
        Question {current + 1} of {questions.length}
      </span>
      <h1 className="text-2xl font-bold mt-2 text-slate-800">
        {question.question_text}
      </h1>
    </div>

    {/* Options Section */}
    <div className="space-y-3">
      {(question.question_type === "mcq" || question.question_type === "true_false") &&
        options.map((opt, i) => (
          <button
            key={i}
            disabled={isAnswered}
            onClick={() => setSelectedOptions((prev) => ({ ...prev, [current]: opt }))}
            className={`block w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedOptions[current] === opt
                ? "border-emerald-500 hover:border-emerald-500"
                : "border-orange-300 hover:border-orange-100 bg-white"
            }`}
          >
            {opt}
          </button>
        ))}

      {(question.question_type === "fill_blank" || question.question_type === "short_answer") && (
        <input
          type="text"
          disabled={isAnswered}
          value={selectedOptions[current] || ""}
          onChange={(e) =>
            setSelectedOptions((prev) => ({ ...prev, [current]: e.target.value }))}
          className="border-2 border-slate-200 rounded-xl p-4 w-full focus:border-orange-500 outline-none transition-colors"
          placeholder="Type your answer here..."
        />
      )}
    </div>

    {/* Feedback Section */}
    {isAnswered && (
      <div className={` mt-2 p-2 rounded-xl border ${answers[current].isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <h3 className={`font-bold mb-1 ${answers[current].isCorrect ? "text-green-700" : "text-red-700"}`}>
          {answers[current].isCorrect ? "Correct!" : "Incorrect"}
        </h3>
      </div>
    )}

 {/* Navigation Row */}
<div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-300 hover:border-orange-400">
  <button
    onClick={() => setCurrent((p) => p - 1)}
    disabled={current === 0}
    className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all font-medium"
  >
    <ChevronLeft size={20} />
    Previous
  </button>

  {/* Dynamic Button Area */}
  <div className="flex gap-2">
    {/* RED: Try Again Button (Shown only when incorrect) */}
    {isAnswered && !answers[current].isCorrect && (
      <button
        onClick={() => {
          setAnswers((prev) => {
            const newState = { ...prev };
            delete newState[current];
            return newState;
          });
          setSelectedOptions((prev) => ({ ...prev, [current]: "" }));
        }}
        className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-md hover:shadow-red-200"
      >
        Try Again
      </button>
    )}

    {/* ORANGE: Submit Button (Shown only when not answered) */}
    {!isAnswered && (
      <button
        onClick={submitAnswer}
        disabled={!selectedOptions[current]}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-500 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-md hover:shadow-orange-200"
      >
        Submit
      </button>
    )}
  </div>

  <button
    onClick={() => setCurrent((p) => p + 1)}
    disabled={current === questions.length - 1}
    className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all font-medium"
  >
    Next
    <ChevronRight size={20} />
  </button>
</div>
  </div>
</div>
    </div>
  );
}
