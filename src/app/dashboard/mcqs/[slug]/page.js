"use client";

import { useState } from "react";

export default function QuizPage({ params }) {
  // Mock data - in a real app, you would fetch this based on the 'slug'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const questions = [
    { id: 1, text: "Which sentence is grammatically correct?", options: ["He go to school.", "He goes to school.", "He going to school."], correct: 1 },
    // ... add more questions
  ];

  return (
    <div className="max-w-3xl mx-auto p-10">
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-10">
        <div className="bg-emerald-500 h-2 rounded-full w-[20%]" />
      </div>

      {/* Question Card */}
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 mb-8">
          {questions[currentQuestion].text}
        </h2>

        <div className="space-y-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className="w-full text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-slate-700"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-8 flex justify-between">
        <button className="text-slate-400 font-bold hover:text-slate-900">PREVIOUS</button>
        <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black">NEXT QUESTION</button>
      </div>
    </div>
  );
}