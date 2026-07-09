"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { moduleApi } from "@/services/topic/topicApi";
import { ChevronRight, Award, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ExercisePage() {
  const searchParams = useSearchParams();
  const subTopicId = searchParams.get("subTopicId");

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);

  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [resultData, setResultData] = useState(null);

  useEffect(() => { fetchExercise(); }, [subTopicId]);

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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.keys(userAnswers).map((index) => ({
      question_index: Number(index),
      given_answer: userAnswers[index],
    }));

    try {
      const response = await moduleApi.submitExercise(selectedExercise._id, { answers: formattedAnswers, time_spent_sec: 10 });
      if (response?.data?.success) {
        setResultData(response.data.data.attempt);
        setIsQuizActive(false);
        setShowResults(true);
        toast.success("Submitted successfully!");
      } else {
        toast.error(response?.data?.message || "Something went wrong.");
      }
    } catch (error) { toast.error("Submission failed."); }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Loading...</div>;
  if (!selectedExercise) return <div className="p-10 text-center">No exercises found.</div>;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Structured like PracticeQuestionsPage */}
      <div className="w-80 border-r p-4 overflow-auto bg-slate-50">
        <h2 className="font-bold text-xl mb-6 px-2 text-slate-800">Exercises</h2>
        {exercises.map((item) => (
          <button 
            key={item._id} 
            onClick={() => setSelectedExercise(item)} 
            className={`w-full p-4 rounded-2xl mb-3 text-left transition-all border-2 ${
              selectedExercise?._id === item._id 
                ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200" 
                : "bg-white hover:bg-orange-50 border-transparent"
            }`}
          >
            <div className="font-medium text-sm truncate">{item.title}</div>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 overflow-auto bg-slate-50">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border-2 border-orange-200">
          
          {!isQuizActive && !showResults ? (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-slate-800">{selectedExercise.title}</h1>
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2"><Sparkles size={18}/> Assessment Details</h4>
                <p className="text-sm text-orange-700">Total Questions: {selectedExercise.questions?.length}</p>
                <p className="text-sm text-orange-700">Time Limit: {selectedExercise.time_limit_sec}s</p>
              </div>
              <button onClick={() => setIsQuizActive(true)} className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition">
                Start Assessment
              </button>
            </div>
          ) : showResults ? (
            <div className="text-center py-10">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${resultData?.is_passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                <Award size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-900">{resultData?.is_passed ? "Passed!" : "Complete"}</h3>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl"><p className="text-xs text-slate-400 uppercase">Score</p><p className="text-2xl font-bold">{resultData?.score}/{resultData?.max_score}</p></div>
                <div className="p-4 bg-slate-50 rounded-xl"><p className="text-xs text-slate-400 uppercase">Accuracy</p><p className="text-2xl font-bold">{resultData?.accuracy}%</p></div>
              </div>
              <button onClick={() => { setShowResults(false); setIsQuizActive(false); }} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Back to Exercises</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-sm font-bold text-orange-500 uppercase">Question {currentQuestionIndex + 1}</div>
              <p className="text-2xl font-bold text-slate-800">{selectedExercise.questions[currentQuestionIndex].question_text}</p>
              {selectedExercise.questions[currentQuestionIndex].question_type === "mcq" ? (
                selectedExercise.questions[currentQuestionIndex].options.map((opt, i) => (
                  <button key={i} onClick={() => setUserAnswers({...userAnswers, [currentQuestionIndex]: opt})} className={`w-full text-left p-4 rounded-xl border-2 ${userAnswers[currentQuestionIndex] === opt ? "border-orange-500 bg-orange-50" : "border-slate-100 hover:border-orange-100"}`}>{opt}</button>
                ))
              ) : (
                <input type="text" onChange={(e) => setUserAnswers({...userAnswers, [currentQuestionIndex]: e.target.value})} className="w-full p-4 rounded-xl border-2 border-slate-200" placeholder="Type answer..." />
              )}
              <button onClick={() => currentQuestionIndex < selectedExercise.questions.length - 1 ? setCurrentQuestionIndex(currentQuestionIndex + 1) : handleSubmit()} disabled={!userAnswers[currentQuestionIndex]} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50">
                {currentQuestionIndex === selectedExercise.questions.length - 1 ? "Submit" : "Next Question"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}