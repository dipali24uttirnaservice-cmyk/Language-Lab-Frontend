"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { taskApi } from "@/services/task/taskApi";

export default function StudentTaskAnswerViewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const taskId = params?.taskId;
  const submissionId = searchParams.get("submissionId");

  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId || !submissionId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [taskRes, subRes] = await Promise.all([
          taskApi.getTaskById(taskId),
          taskApi.getSubmissions(taskId),
        ]);

        const taskData = taskRes?.data || taskRes;
        setTask(taskData?.data || taskData);

        const subData = subRes?.data?.data || subRes?.data;
        const allSubmissions = subData?.submissions || [];
        
        const foundSubmission = allSubmissions.find(
          (item) => item._id === submissionId
        );
        
        setSubmission(foundSubmission || null);
      } catch (error) {
        console.error("Fetch answer view error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-6 w-full space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-600 hover:text-orange-600 transition-all"
      >
        <ArrowLeft size={16} />
        Back to Submissions
      </button>

      <div className="w-full space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-sm">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                Student Task Submission
              </span>

              <h1 className="mt-3 text-3xl font-black text-slate-900">
                {task?.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {task?.description}
              </p>
            </div>

            <div className="px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-bold flex items-center gap-1 shrink-0">
              <CheckCircle2 size={15} />
              {submission?.status || "Submitted"}
            </div>
          </div>

          {/* Student Info */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <InfoCard
              title="Student Name"
              value={submission?.student_id?.full_name}
            />
            <InfoCard
              title="Enrollment No"
              value={submission?.student_id?.enrollment_no}
            />
            <InfoCard
              title="Course"
              value={task?.course_id?.course_name}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-5">
            Submitted Answers
          </h2>

          <div className="space-y-5">
            {task?.questions?.map((question, index) => {
              const answer = submission?.answers?.find(
                (item) => item.question_index === index
              )?.given_answer;

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3"
                >
                  <p className="font-bold text-slate-800 text-sm">
                    {index + 1}. {question.question_text}
                  </p>

                  {question.options?.length > 0 && (
                    <div className="space-y-2">
                      {question.options.map((option, i) => (
                        <div
                          key={i}
                          className={`px-4 py-2 rounded-xl text-sm border ${
                            option === answer
                              ? "bg-orange-100 border-orange-300 text-orange-700 font-bold"
                              : "bg-white border-slate-200 text-slate-600"
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Student Answer
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {answer || "No answer submitted"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-xs font-bold text-slate-400 uppercase">
        {title}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}