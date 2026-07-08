"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { moduleApi } from "@/services/topic/topicApi";
import { Clock, BarChart3, ChevronRight, BookOpen, Award, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast"; // or your preferred library

export default function ExercisePage() {
  const searchParams = useSearchParams();
  const subTopicId = searchParams.get("subTopicId");

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);

  // New Quiz States
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    fetchExercise();
  }, [subTopicId]);

  // Reset quiz state when switching exercises
  useEffect(() => {
    setIsQuizActive(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
  }, [selectedExercise]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      const res = await moduleApi.getModulesBySubtopic("exercise", subTopicId);
      const data = res.data?.data || [];
      setExercises(data);
      if (data.length) setSelectedExercise(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };




const handleSubmit = async () => {
  const formattedAnswers = Object.keys(userAnswers).map((index) => ({
    question_index: Number(index),
    given_answer: userAnswers[index],
  }));

  const payload = {
    answers: formattedAnswers,
    time_spent_sec: 10,
  };

  try {
    const response = await moduleApi.submitExercise(selectedExercise._id, payload);
    
    // Check if the API returned a success status
    if (response?.data?.success) {
      const attempt = response.data.data.attempt;
      setResultData({
        score: attempt.score,
        max_score: attempt.max_score,
        accuracy: attempt.accuracy,
        is_passed: attempt.is_passed,
      });
      setIsQuizActive(false);
      setShowResults(true);
      toast.success("Exercise submitted successfully!");
    } else {
      // Handle business logic errors (like max attempts reached)
      toast.error(response?.data?.message || "Something went wrong.");
    }
  } catch (error) {
    // Handle network or unexpected errors
    const errorMessage = error?.response?.data?.message || "Submission failed. Please try again.";
    toast.error(errorMessage);
    console.error("Submission failed:", error);
  }
};



  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Loading your exercise...</div>;
  if (!selectedExercise) return <div className="p-10 text-center text-slate-500">No exercises found.</div>;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Same as before */}
     <div className="w-80 border-r bg-slate-50 overflow-y-auto h-screen">
  <div className="p-6 border-b bg-white">
    <h2 className="font-bold text-lg text-slate-800">Course Exercises</h2>
  </div>

  {Object.values(exercises.reduce((acc, item) => {
    const id = item.topic_id._id;
    if (!acc[id]) acc[id] = { ...item.topic_id, exercises: [] };
    acc[id].exercises.push(item);
    return acc;
  }, {})).map((topic) => (
    <div key={topic._id} className="border-b border-slate-200">
      {/* Topic Header */}
      <button 
        onClick={() => setExpandedTopic(expandedTopic === topic._id ? null : topic._id)} 
        className="w-full flex justify-between items-center px-6 py-5 hover:bg-white transition-colors group"
      >
        <span className="font-bold text-slate-700 group-hover:text-orange-600 transition-colors">
          {topic.title}
        </span>
        <ChevronRight 
          className={`text-slate-400 transition-transform duration-300 ${expandedTopic === topic._id ? "rotate-90 text-orange-600" : ""}`} 
          size={18} 
        />
      </button>

      {/* Exercise List */}
      {expandedTopic === topic._id && (
        <div className="pb-3 px-3 space-y-1">
          {topic.exercises.map((item) => (
            <button 
              key={item._id} 
              onClick={() => setSelectedExercise(item)} 
              className={`w-full text-left px-4 py-3 text-sm rounded-lg flex items-center gap-3 transition-all ${
                selectedExercise?._id === item._id 
                  ? "bg-white text-orange-600 shadow-sm border border-orange-100 font-semibold" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${selectedExercise?._id === item._id ? "bg-orange-500" : "bg-slate-300"}`} />
              {item.title}
            </button>
          ))}
        </div>
      )}
    </div>
  ))}
</div>

     {/* Main Content Area */}
{/* Main Content Area */}
<div className="flex-1 overflow-y-auto p-8">
  <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
    {/* Inside your Pre-Assessment View */}
<div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-orange-700 text-sm font-semibold">
  You have used all {selectedExercise.max_attempts} attempts for this module.
</div>
    {/* Header Area */}
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Award size={100} />
      </div>
      <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm inline-flex items-center gap-1.5 mb-3">
        <Award size={12} /> {isQuizActive ? "Challenge Activity" : "Assessment Info"}
      </span>
      <h2 className="text-2xl font-black tracking-tight">{selectedExercise.title}</h2>
    </div>

    {/* Body Content */}
    <div className="p-6">
      {!isQuizActive && !showResults ? (
        // Pre-Assessment View
        <div className="space-y-6">
          <div className="bg-orange-500/[0.02] border border-orange-500/10 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="text-orange-500" size={14} /> Evaluation Rules
            </h4>
            <ul className="text-xs text-slate-500 space-y-1 pl-1 list-inside list-disc">
              <li>Questions provided: {selectedExercise.questions?.length}</li>
              <li>Time Limit: {selectedExercise.time_limit_sec} seconds</li>
            </ul>
          </div>
          <button onClick={() => setIsQuizActive(true)} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold rounded-xl transition-all shadow-md">
            Start Assessment Activity Now &rarr;
          </button>
        </div>
      ) : showResults ? (
        // Results View
        <div className="text-center py-10 animate-fade-in">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${resultData?.is_passed ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
            <Award size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {resultData?.is_passed ? "Assessment Passed!" : "Assessment Complete!"}
          </h3>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
              <p className="font-black text-slate-800 text-2xl">{resultData?.score} / {resultData?.max_score}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
              <p className="font-black text-slate-800 text-2xl">{resultData?.accuracy}%</p>
            </div>
          </div>
          <button onClick={() => { setShowResults(false); setIsQuizActive(false); setUserAnswers({}); setCurrentQuestionIndex(0); }} className="mt-8 px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition">
            Back to Exercises
          </button>
        </div>
      ) : (
        // Active Quiz View - One by one
        <div className="space-y-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Question {currentQuestionIndex + 1} of {selectedExercise.questions.length}
          </div>
          <p className="text-xl font-bold text-slate-800">
            {selectedExercise.questions[currentQuestionIndex].question_text}
          </p>
          <div className="space-y-3">
            {selectedExercise.questions[currentQuestionIndex].question_type === "mcq" ? (
              selectedExercise.questions[currentQuestionIndex].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setUserAnswers({ ...userAnswers, [currentQuestionIndex]: opt })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    userAnswers[currentQuestionIndex] === opt ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <input
                type="text"
                placeholder="Type your answer..."
                value={userAnswers[currentQuestionIndex] || ""}
                onChange={(e) => setUserAnswers({ ...userAnswers, [currentQuestionIndex]: e.target.value })}
                className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-orange-500 outline-none"
              />
            )}
          </div>
          <button
            onClick={() => {
              if (currentQuestionIndex < selectedExercise.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={!userAnswers[currentQuestionIndex]}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl disabled:opacity-50 transition-opacity"
          >
            {currentQuestionIndex === selectedExercise.questions.length - 1 ? "Submit All Answers" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  </div>
</div>
    </div>
  );
}