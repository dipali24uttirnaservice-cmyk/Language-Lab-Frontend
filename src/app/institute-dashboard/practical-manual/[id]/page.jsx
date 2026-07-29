"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { Upload, AlertCircle, Loader2, ArrowLeft, Trash2 } from "lucide-react";

import {
  practicalManual,
  practicalManualDetail,
  updatePracticalManual
} from "@/services/practical-Manual/page.jsx";

import {
  createPracticalManualSchema,
  updatePracticalManualSchema
} from "@/app/schemas/practicalManual.schema";

export default function PracticalManualFormPage() {
  const router = useRouter();
  const params = useParams();
  
  // Handles standard [id] or optional catch-all [[...id]]
 const routeId = params?.id;

const editingManualId =
  routeId && routeId !== "create"
    ? Array.isArray(routeId)
      ? routeId[0]
      : routeId
    : null;

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formCourseId, setFormCourseId] = useState("");
  const [formTopicId, setFormTopicId] = useState("");
  const [practicalAttachment, setPracticalAttachment] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);

  const [questionList, setQuestionList] = useState([
    { question_text: "", answer_key_html: "", answer_lines: 5 }
  ]);

  const [formErrors, setFormErrors] = useState({});

  // Fetch data if ID exists (Edit Mode)
  useEffect(() => {
    if (editingManualId) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const response = await practicalManualDetail(editingManualId);
          const data = response?.data || response;
          const manual = data?.data || data;

          setFormTitle(manual.title || "");
          setFormCourseId(
            typeof manual.course_id === "object"
              ? manual.course_id?._id || ""
              : manual.course_id || ""
          );
          setFormTopicId(
            typeof manual.topic_id === "object"
              ? manual.topic_id?._id || ""
              : manual.topic_id || ""
          );
          setQuestionList(
            manual.questions?.map((q) => ({
              question_text: q.question_text || "",
              answer_key_html: q.answer_key_html || "",
              answer_lines: q.answer_lines || 5
            })) || []
          );
        } catch (error) {
          console.log("Error loading detail for edit", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [editingManualId]);

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("1. SUBMIT CLICKED");

  setFormErrors({});

  const payload = {
    title: formTitle,
    course_id: formCourseId,
    topic_id: formTopicId || undefined,
    questions: questionList
  };

  console.log("2. Payload", payload);


  try {

    const schema = editingManualId
      ? updatePracticalManualSchema
      : createPracticalManualSchema;


    console.log("3. Schema validation start");

    await schema.validate(payload, { abortEarly:false });


    console.log("4. Validation success");


    setSubmitting(true);


    const formData = new FormData();

    formData.append("title", formTitle);
    formData.append("course_id", formCourseId);

    if(formTopicId){
      formData.append("topic_id", formTopicId);
    }

    formData.append(
      "questions",
      JSON.stringify(questionList)
    );


    console.log(
      "5. FormData created",
      [...formData.entries()]
    );


    if(editingManualId){

      console.log(
        "6. Update API calling",
        editingManualId
      );

      await updatePracticalManual(
        editingManualId,
        formData
      );

    }
    else{

      console.log(
        "6. Create API calling"
      );

      await practicalManual(formData);

    }


    console.log("7. API SUCCESS");


    router.push(
      "/institute-dashboard/practical-manual"
    );


  } catch(error){

    console.log(
      "API ERROR",
      error
    );


    if(error.inner){

      const errors={};

      error.inner.forEach(err=>{
        errors[err.path]=err.message;
      });

      setFormErrors(errors);
    }

  }
  finally{

    setSubmitting(false);

  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase">
            Practical Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {editingManualId ? "Update Practical Manual" : "Create Practical Manual"}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Title
              </label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm transition-all"
                placeholder="Practical manual title"
              />
              {formErrors.title && (
                <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.title}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Course ID
              </label>
              <input
                value={formCourseId}
                onChange={(e) => setFormCourseId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm transition-all"
                placeholder="Enter Course ID"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Topic ID (Optional)
              </label>
              <input
                value={formTopicId}
                onChange={(e) => setFormTopicId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm transition-all"
                placeholder="Enter Topic ID"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attachment File
              </label>
              <div className="mt-2 border-2 border-dashed border-slate-200 rounded-2xl p-3 flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="text-orange-500 w-5 h-5 flex-shrink-0" />
                <input
                  type="file"
                  onChange={(e) => setPracticalAttachment(e.target.files[0])}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900">Questions Setup</h3>
              <button
                type="button"
                onClick={() =>
                  setQuestionList([
                    ...questionList,
                    { question_text: "", answer_key_html: "", answer_lines: 5 }
                  ])
                }
                className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold text-xs transition-colors"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questionList.map((q, index) => (
                <div key={index} className="bg-slate-50/75 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-500 uppercase">
                      Question #{index + 1}
                    </h4>
                    {questionList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionList(questionList.filter((_, i) => i !== index));
                        }}
                        className="text-rose-500 hover:text-rose-600 font-bold text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    value={q.question_text}
                    onChange={(e) => {
                      const arr = [...questionList];
                      arr[index].question_text = e.target.value;
                      setQuestionList(arr);
                    }}
                    placeholder="Type question text..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  />

                  <textarea
                    value={q.answer_key_html}
                    onChange={(e) => {
                      const arr = [...questionList];
                      arr[index].answer_key_html = e.target.value;
                      setQuestionList(arr);
                    }}
                    placeholder="Answer key description / HTML format"
                    rows="3"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <motion.button
  type="submit"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  disabled={submitting}
  className="px-7 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all"
>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingManualId ? "Update Manual" : "Create Manual"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}