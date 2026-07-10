"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { moduleApi } from "@/services/topic/topicApi";
import { activityApi } from "@/services/activity/activityApi";
import { ChevronRight, Award, Sparkles, CheckCircle2, XCircle,ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";


export default function ExercisePage() {
  const searchParams = useSearchParams();
  const subTopicId = searchParams.get("subTopicId");
  const topicId = searchParams.get("topicId");
const router = useRouter();
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
        const attempt = response.data.data.attempt;
        setResultData(attempt);
        setIsQuizActive(false);
        setShowResults(true);
        toast.success("Submitted successfully!");

        if (topicId && subTopicId) {
          activityApi.logActivity({
            topic_id: topicId,
            sub_topic_id: subTopicId,
            module_id: selectedExercise._id,
            module_type: "exercise",
            activity_type: "exercise_complete",
            score: attempt?.score,
            max_score: attempt?.max_score,
            accuracy: attempt?.accuracy,
            time_spent_sec: 10,
          }).catch((err) => console.error("Failed to log activity:", err));
        }
      } else {
  toast.error(error?.response?.data?.message || "Something went wrong.");
      }
    }catch (error) {
  toast.error(error?.response?.data?.message || "Submission failed.");
      
      }
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
        <button
  onClick={() => router.back()}
  className="flex items-center gap-2 text-slate-600 hover:text-orange-600 font-medium transition"
>
  <ArrowLeft size={20} />
  <span>Back</span>
</button>
      <div className="relative max-w-2xl mx-auto overflow-hidden rounded-3xl border border-orange-200 bg-white p-8 shadow-[0_20px_60px_rgba(249,115,22,0.15)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-[0_25px_70px_rgba(249,115,22,0.25)]">

  {/* Decorative Background */}
  <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-orange-100 opacity-60 blur-2xl"></div>
  <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-100 opacity-60 blur-2xl"></div>

  <div className="relative">
          {!isQuizActive && !showResults ? (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-slate-800">{selectedExercise.title}</h1>
<div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-6 shadow-sm">                <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2"><Sparkles size={18}/> Assessment Details</h4>
                <p className="text-sm text-orange-700">Total Questions: {selectedExercise.questions?.length}</p>
                <p className="text-sm text-orange-700">Time Limit: {selectedExercise.time_limit_sec}s</p>
              </div>
             <button
  onClick={() => {
    if (topicId && subTopicId) {
      activityApi.logActivity({
        topic_id: topicId,
        sub_topic_id: subTopicId,
        module_id: selectedExercise._id,
        module_type: "exercise",
        activity_type: "exercise_start",
      }).catch((err) => console.error("Failed to log activity:", err));
    }
    setIsQuizActive(true);
  }}
  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-orange-300"
>
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
  <div className="text-sm font-bold text-orange-500 uppercase">
    Question {currentQuestionIndex + 1}
  </div>

  <p className="text-2xl font-bold text-slate-800">
    {selectedExercise.questions[currentQuestionIndex].question_text}
  </p>

  {selectedExercise.questions[currentQuestionIndex].question_type === "mcq" ? (
    selectedExercise.questions[currentQuestionIndex].options.map((opt, i) => (
      <button
        key={i}
        onClick={() =>
          setUserAnswers({
            ...userAnswers,
            [currentQuestionIndex]: opt,
          })
        }
        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
          userAnswers[currentQuestionIndex] === opt
            ? "border-emerald-500 bg-emerald-50 hover:border-emerald-500 shadow-sm"
            : "border-orange-300 hover:border-orange-100 bg-white"
        }`}
      >
        {opt}
      </button>
    ))
  ) : (
   
   <input
  type="text"
  value={userAnswers[currentQuestionIndex] || ""}
  onChange={(e) =>
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: e.target.value,
    })
  }
  className="w-full p-4 rounded-xl border-2 border-orange-300 focus:border-orange-500 outline-none transition-all"
  placeholder="Type answer..."
/>
  )}

  <button
    onClick={() =>
      currentQuestionIndex < selectedExercise.questions.length - 1
        ? setCurrentQuestionIndex(currentQuestionIndex + 1)
        : handleSubmit()
    }
    disabled={!userAnswers[currentQuestionIndex]}
    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50"
  >
    {currentQuestionIndex === selectedExercise.questions.length - 1
      ? "Submit"
      : "Next Question"}
  </button>
</div>
          )}
        </div>
      </div>
    </div>
    </div>
    
  );
}