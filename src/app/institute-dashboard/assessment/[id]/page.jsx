"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Trash2,
} from "lucide-react";

import { assessmentApi } from "@/services/assessment/assessmentApi";
import { subjectApi } from "@/services/subject/subjectApi";

import StatusModal from "@/components/molecules/StatusModal";

// =====================================================
// DEFAULT QUESTION
// =====================================================

const createEmptyQuestion = () => ({
  question_text: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correct_answer: "",
  explanation: "",
  hint: "",
  marks: 1,
  negative_marks: 0,
});

// =====================================================
// DEFAULT FORM
// =====================================================

const createDefaultForm = () => ({
  subject_id: "",
  title: "",
  description: "",
  order: 0,
  difficulty: "easy",

  max_attempts: 5,
  total_marks: 0,
  duration_minutes: "",
  duration_seconds: "",

  shuffle_questions: true,
  shuffle_options: true,
  show_explanation: true,

  // ================================================
  // 0 = Hidden
  // 1 = Show
  // ================================================
  exercise_type: 0,

  // Mongoose schema field
  // 0 = Hidden
  // 1 = Show
  userType: "0",
});

// =====================================================
// PAGE
// =====================================================

export default function AssessmentFormPage() {
  const router = useRouter();
  const params = useParams();

  // =====================================================
  // ROUTE / MODE
  // =====================================================

  const routeId = params?.id;

  const normalizedRouteId = Array.isArray(routeId)
    ? routeId[0]
    : routeId;

  /*
    Create:
      /assessment/new
      /assessment/create

    Update:
      /assessment/:id
  */

  const assessmentId =
    normalizedRouteId &&
    normalizedRouteId !== "new" &&
    normalizedRouteId !== "create"
      ? normalizedRouteId
      : null;

  const isEditMode = Boolean(assessmentId);

  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Subjects
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] =
    useState(false);

  // Form
  const [form, setForm] = useState(
    createDefaultForm()
  );

  // Questions
  const [questions, setQuestions] = useState([
    createEmptyQuestion(),
  ]);

  // Validation
  const [formErrors, setFormErrors] = useState({});

  // Status modal
  const [statusData, setStatusData] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================================
  // LOAD SUBJECTS
  // =====================================================

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setSubjectsLoading(true);

        const response =
          await subjectApi.subjectList();

        console.log(
          "Subject List Response:",
          response
        );

        const responseData = response?.data;

        const data =
          responseData?.data ??
          responseData;

        let subjectData = [];

        if (Array.isArray(data)) {
          subjectData = data;
        } else if (
          Array.isArray(data?.subjects)
        ) {
          subjectData = data.subjects;
        } else if (
          Array.isArray(data?.data)
        ) {
          subjectData = data.data;
        }

        console.log(
          "Normalized Subjects:",
          subjectData
        );

        setSubjects(subjectData);
      } catch (error) {
        console.error(
          "Get Subjects Error:",
          error
        );

        setSubjects([]);

        setStatusData({
          open: true,
          type: "error",
          title: "Failed",
          message:
            error?.response?.data?.message ||
            "Unable to fetch subjects.",
        });
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // =====================================================
  // LOAD ASSESSMENT FOR UPDATE
  // =====================================================

  useEffect(() => {
    if (!assessmentId) {
      return;
    }

    const fetchAssessment = async () => {
      try {
        setLoading(true);

        console.log(
          "Fetching Assessment ID:",
          assessmentId
        );

        const response =
          await assessmentApi.getAssessment(
            assessmentId
          );

        console.log(
          "Assessment Detail Response:",
          response
        );

        const responseData = response?.data;

        const assessment =
          responseData?.data ??
          responseData;

        if (!assessment) {
          throw new Error(
            "Assessment data not found."
          );
        }

        // =================================================
        // SUBJECT
        // =================================================

        let subjectId = "";

        if (
          assessment?.subject_id &&
          typeof assessment.subject_id ===
            "object"
        ) {
          subjectId =
            assessment.subject_id?._id || "";
        } else {
          subjectId =
            assessment?.subject_id || "";
        }

        // =================================================
        // EXERCISE TYPE
        // =================================================

        /*
          Priority:

          1. exercise_type
          2. userType

          Backend values:
            0 = Hidden
            1 = Show

          Default:
            0
        */

        const exerciseType =
          Number(
            assessment?.exercise_type ??
              assessment?.userType ??
              0
          ) === 1
            ? 1
            : 0;

        // =================================================
        // FORM
        // =================================================

        setForm({
          subject_id: subjectId,

          title:
            assessment?.title || "",

          description:
            assessment?.description || "",

          order:
            assessment?.order ?? 0,

          difficulty:
            assessment?.difficulty || "easy",

          max_attempts:
            assessment?.max_attempts ?? 5,

          total_marks:
            assessment?.total_marks ?? 0,

          duration_minutes:
            assessment?.duration?.minutes ?? "",

          duration_seconds:
            assessment?.duration?.seconds ?? "",

          shuffle_questions:
            assessment?.shuffle_questions ??
            true,

          shuffle_options:
            assessment?.shuffle_options ??
            true,

          show_explanation:
            assessment?.show_explanation ??
            true,

          // 0 / 1
          exercise_type: exerciseType,

          // Schema field
          userType: String(exerciseType),
        });

        // =================================================
        // QUESTIONS
        // =================================================

        if (
          Array.isArray(
            assessment?.questions
          ) &&
          assessment.questions.length > 0
        ) {
          setQuestions(
            assessment.questions.map(
              (question) => ({
                question_text:
                  question?.question_text ||
                  "",

                optionA:
                  question?.optionA || "",

                optionB:
                  question?.optionB || "",

                optionC:
                  question?.optionC || "",

                optionD:
                  question?.optionD || "",

                correct_answer:
                  question?.correct_answer ||
                  "",

                explanation:
                  question?.explanation ||
                  "",

                hint:
                  question?.hint || "",

                marks:
                  question?.marks ?? 1,

                negative_marks:
                  question?.negative_marks ??
                  0,
              })
            )
          );
        } else {
          setQuestions([
            createEmptyQuestion(),
          ]);
        }
      } catch (error) {
        console.error(
          "Get Assessment Detail Error:",
          error
        );

        setStatusData({
          open: true,
          type: "error",
          title: "Failed",
          message:
            error?.response?.data?.message ||
            "Unable to fetch assessment.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // =====================================================
  // QUESTION CHANGE
  // =====================================================

  const handleQuestionChange = (
    index,
    field,
    value
  ) => {
    setQuestions((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });

    setFormErrors((prev) => ({
      ...prev,
      [`questions.${index}.${field}`]:
        "",
    }));
  };

  // =====================================================
  // ADD QUESTION
  // =====================================================

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      createEmptyQuestion(),
    ]);
  };

  // =====================================================
  // REMOVE QUESTION
  // =====================================================

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      return;
    }

    setQuestions((prev) =>
      prev.filter(
        (_, questionIndex) =>
          questionIndex !== index
      )
    );
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const errors = {};

    // Subject
    if (!form.subject_id) {
      errors.subject_id =
        "Please select a subject.";
    }

    // Title
    if (!form.title.trim()) {
      errors.title =
        "Assessment title is required.";
    }

    // Questions
    if (!questions.length) {
      errors.questions =
        "At least one question is required.";
    }

    questions.forEach(
      (question, index) => {
        if (
          !question.question_text?.trim()
        ) {
          errors[
            `questions.${index}.question_text`
          ] = "Question is required.";
        }

        if (!question.optionA?.trim()) {
          errors[
            `questions.${index}.optionA`
          ] = "Option A is required.";
        }

        if (!question.optionB?.trim()) {
          errors[
            `questions.${index}.optionB`
          ] = "Option B is required.";
        }

        if (!question.correct_answer?.trim()) {
          errors[
            `questions.${index}.correct_answer`
          ] =
            "Correct answer is required.";
        }
      }
    );

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormErrors({});

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);

      // =================================================
      // EXERCISE TYPE
      // =================================================

      /*
        UI:
          Hidden = 0
          Show   = 1

        Always send Number.
      */

      const exerciseType =
        Number(form.exercise_type) === 1
          ? 1
          : 0;

      // =================================================
      // PAYLOAD
      // =================================================

      const payload = {
        subject_id:
          form.subject_id,

        title:
          form.title.trim(),

        description:
          form.description.trim(),

        order:
          Number(form.order) || 0,

        difficulty:
          form.difficulty,

        max_attempts:
          Number(form.max_attempts) || 1,

        total_marks:
          Number(form.total_marks) || 0,

        shuffle_questions:
          Boolean(form.shuffle_questions),

        shuffle_options:
          Boolean(form.shuffle_options),

        show_explanation:
          Boolean(form.show_explanation),

        // ===============================================
        // IMPORTANT
        // ===============================================

        // Required by current API validation
        exercise_type: exerciseType,

        // Present in your Mongoose schema
        userType: String(exerciseType),

        // ===============================================
        // QUESTIONS
        // ===============================================

        questions:
          questions.map(
            (question) => ({
              question_text:
                question.question_text
                  ?.trim() || "",

              optionA:
                question.optionA
                  ?.trim() || "",

              optionB:
                question.optionB
                  ?.trim() || "",

              optionC:
                question.optionC
                  ?.trim() || "",

              optionD:
                question.optionD
                  ?.trim() || "",

              correct_answer:
                question.correct_answer
                  ?.trim() || "",

              explanation:
                question.explanation
                  ?.trim() || "",

              hint:
                question.hint
                  ?.trim() || "",

              marks:
                Number(question.marks) || 1,

              negative_marks:
                Number(
                  question.negative_marks
                ) || 0,
            })
          ),
      };

      // =================================================
      // DURATION (minutes + seconds)
      // =================================================

      if (
        (form.duration_minutes !== "" &&
          form.duration_minutes !== null &&
          form.duration_minutes !== undefined) ||
        (form.duration_seconds !== "" &&
          form.duration_seconds !== null &&
          form.duration_seconds !== undefined)
      ) {
        payload.duration = {
          minutes: Number(form.duration_minutes) || 0,
          seconds: Number(form.duration_seconds) || 0,
        };
      }

      console.log(
        "Assessment Payload:",
        payload
      );

      // =================================================
      // UPDATE
      // =================================================

      if (isEditMode) {
        console.log(
          "Updating Assessment:",
          assessmentId
        );

        await assessmentApi.updateAssessment(
          assessmentId,
          payload
        );

        setStatusData({
          open: true,
          type: "success",
          title: "Success",
          message:
            "Assessment updated successfully.",
        });
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        console.log(
          "Creating New Assessment:",
          payload
        );

        await assessmentApi.createAssessment(
          payload
        );

        setStatusData({
          open: true,
          type: "success",
          title: "Success",
          message:
            "Assessment created successfully.",
        });
      }
    } catch (error) {
      console.error(
        "Assessment Submit Error:",
        error
      );

      console.error(
        "Backend Error:",
        error?.response?.data
      );

      setStatusData({
        open: true,
        type: "error",
        title: "Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // STATUS MODAL CLOSE
  // =====================================================

  const handleStatusClose = () => {
    const wasSuccess =
      statusData.type === "success";

    setStatusData((prev) => ({
      ...prev,
      open: false,
    }));

    if (wasSuccess) {
      router.push(
        "/institute-dashboard/assessment"
      );
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    router.push(
      "/institute-dashboard/assessment"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">

          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />

          <p className="text-sm text-slate-400 mt-3">
            Loading assessment...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6 w-full">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex items-center gap-4">

        <button
          type="button"
          onClick={handleBack}
          className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>

          <span className="text-xs font-bold tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase">
            Assessment Management
          </span>

          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {isEditMode
              ? "Update Assessment"
              : "Create Assessment"}
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            {isEditMode
              ? "Update assessment details and questions."
              : "Create a new assessment with questions."}
          </p>

        </div>

      </div>

      {/* ================================================= */}
      {/* FORM */}
      {/* ================================================= */}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ================================================= */}
          {/* BASIC INFORMATION */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

            {/* SUBJECT */}

            <div className="md:col-span-6">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Subject
              </label>

              <select
                value={form.subject_id}
                onChange={(e) =>
                  handleChange(
                    "subject_id",
                    e.target.value
                  )
                }
                disabled={subjectsLoading}
                className="mt-2 w-full rounded-xl border border-orange-300 bg-white px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm disabled:opacity-60"
              >

                <option value="">
                  {subjectsLoading
                    ? "Loading subjects..."
                    : "Select subject"}
                </option>

                {subjects.map(
                  (subject) => (
                    <option
                      key={subject?._id}
                      value={subject?._id}
                    >
                      {subject?.title ||
                        subject?.name ||
                        "Unnamed Subject"}
                    </option>
                  )
                )}

              </select>

              {formErrors.subject_id && (
                <ErrorText
                  message={
                    formErrors.subject_id
                  }
                />
              )}

            </div>

            {/* TITLE */}

            <div className="md:col-span-6">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assessment Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  handleChange(
                    "title",
                    e.target.value
                  )
                }
                placeholder="Enter assessment title"
                className="mt-2 w-full rounded-xl border border-orange-300 bg-white px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm"
              />

              {formErrors.title && (
                <ErrorText
                  message={
                    formErrors.title
                  }
                />
              )}

            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-12">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  handleChange(
                    "description",
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Enter assessment description"
                className="mt-2 w-full rounded-xl border border-orange-300 bg-white px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 text-sm resize-none"
              />

            </div>

            {/* ORDER */}

            <div className="md:col-span-3">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Order
              </label>

              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) =>
                  handleChange(
                    "order",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              />

            </div>

            {/* DIFFICULTY */}

            <div className="md:col-span-3">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Difficulty
              </label>

              <select
                value={form.difficulty}
                onChange={(e) =>
                  handleChange(
                    "difficulty",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              >

                <option value="easy">
                  Easy
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="hard">
                  Hard
                </option>

              </select>

            </div>

            {/* MAX ATTEMPTS */}

            <div className="md:col-span-3">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Max Attempts
              </label>

              <input
                type="number"
                min={1}
                value={form.max_attempts}
                onChange={(e) =>
                  handleChange(
                    "max_attempts",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              />

            </div>

            {/* TOTAL MARKS */}

            <div className="md:col-span-3">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Marks
              </label>

              <input
                type="number"
                min={0}
                value={form.total_marks}
                onChange={(e) =>
                  handleChange(
                    "total_marks",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              />

            </div>

            {/* DURATION — MINUTES */}

            <div className="md:col-span-4">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Duration (Minutes)
              </label>

              <input
                type="number"
                min={0}
                value={form.duration_minutes}
                onChange={(e) =>
                  handleChange(
                    "duration_minutes",
                    e.target.value
                  )
                }
                placeholder="Optional — untimed if blank"
                className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              />

            </div>

            {/* DURATION — SECONDS */}

            <div className="md:col-span-4">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Duration (Seconds)
              </label>

              <input
                type="number"
                min={0}
                max={59}
                value={form.duration_seconds}
                onChange={(e) =>
                  handleChange(
                    "duration_seconds",
                    e.target.value
                  )
                }
                placeholder="0-59"
                className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              />

            </div>

            {/* ================================================= */}
            {/* EXERCISE TYPE */}
            {/* ================================================= */}

            <div className="md:col-span-4">

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Exercise Type
              </label>

              <select
                value={form.exercise_type}
                onChange={(e) =>
                  handleChange(
                    "exercise_type",
                    Number(e.target.value)
                  )
                }
                className="mt-2 w-full rounded-xl border border-orange-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              >

                {/* Backend = 0 */}
                <option value={0}>
                  Hidden
                </option>

                {/* Backend = 1 */}
                <option value={1}>
                  Show
                </option>

              </select>

            </div>

          </div>

          {/* ================================================= */}
          {/* OPTIONS */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">

            <CheckboxField
              label="Shuffle Questions"
              checked={
                form.shuffle_questions
              }
              onChange={(value) =>
                handleChange(
                  "shuffle_questions",
                  value
                )
              }
            />

            <CheckboxField
              label="Shuffle Options"
              checked={
                form.shuffle_options
              }
              onChange={(value) =>
                handleChange(
                  "shuffle_options",
                  value
                )
              }
            />

            <CheckboxField
              label="Show Explanation"
              checked={
                form.show_explanation
              }
              onChange={(value) =>
                handleChange(
                  "show_explanation",
                  value
                )
              }
            />

          </div>

          {/* ================================================= */}
          {/* QUESTIONS */}
          {/* ================================================= */}

          <div className="border-t border-slate-100 pt-6 space-y-4">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>

                <h3 className="text-base font-black text-slate-900">
                  Questions
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Add multiple choice questions
                  for this assessment.
                </p>

              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 rounded-xl bg-white text-orange-600 border border-orange-300 hover:bg-orange-50 font-bold text-xs transition-colors"
              >
                + Add Question
              </button>

            </div>

            {formErrors.questions && (
              <ErrorText
                message={
                  formErrors.questions
                }
              />
            )}

            {/* QUESTION LIST */}

            <div className="space-y-4">

              {questions.map(
                (question, index) => (

                  <div
                    key={index}
                    className="bg-slate-50/75 rounded-2xl p-5 border border-slate-100 space-y-4"
                  >

                    {/* QUESTION HEADER */}

                    <div className="flex justify-between items-center">

                      <h4 className="font-bold text-xs text-slate-500 uppercase">
                        Question #{index + 1}
                      </h4>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeQuestion(
                              index
                            )
                          }
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Remove Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                    </div>

                    {/* QUESTION TEXT */}

                    <div>

                      <input
                        type="text"
                        value={
                          question.question_text
                        }
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            "question_text",
                            e.target.value
                          )
                        }
                        placeholder="Question text"
                        className="w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                      />

                      {formErrors[
                        `questions.${index}.question_text`
                      ] && (
                        <ErrorText
                          message={
                            formErrors[
                              `questions.${index}.question_text`
                            ]
                          }
                        />
                      )}

                    </div>

                    {/* OPTIONS */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      {[
                        ["optionA", "Option A"],
                        ["optionB", "Option B"],
                        ["optionC", "Option C"],
                        ["optionD", "Option D"],
                      ].map(
                        ([field, label]) => (

                          <div key={field}>

                            <input
                              type="text"
                              value={
                                question[field]
                              }
                              onChange={(e) =>
                                handleQuestionChange(
                                  index,
                                  field,
                                  e.target.value
                                )
                              }
                              placeholder={label}
                              className="w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                            />

                            {formErrors[
                              `questions.${index}.${field}`
                            ] && (
                              <ErrorText
                                message={
                                  formErrors[
                                    `questions.${index}.${field}`
                                  ]
                                }
                              />
                            )}

                          </div>

                        )
                      )}

                    </div>

                    {/* CORRECT ANSWER */}

                    <div>

                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Correct Answer
                      </label>

                      <select
                        value={
                          question.correct_answer
                        }
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            "correct_answer",
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 bg-white"
                      >

                        <option value="">
                          Select correct answer
                        </option>

                        {[
                          "optionA",
                          "optionB",
                          "optionC",
                          "optionD",
                        ].map((field) => {

                          const value =
                            question[field];

                          if (
                            !value?.trim()
                          ) {
                            return null;
                          }

                          return (
                            <option
                              key={field}
                              value={value}
                            >
                              {field.replace(
                                "option",
                                "Option "
                              )}{" "}
                              - {value}
                            </option>
                          );
                        })}

                      </select>

                      {formErrors[
                        `questions.${index}.correct_answer`
                      ] && (
                        <ErrorText
                          message={
                            formErrors[
                              `questions.${index}.correct_answer`
                            ]
                          }
                        />
                      )}

                    </div>

                    {/* MARKS */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      <div>

                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Marks
                        </label>

                        <input
                          type="number"
                          min={0}
                          value={
                            question.marks
                          }
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "marks",
                              e.target.value
                            )
                          }
                          placeholder="Marks"
                          className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                        />

                      </div>

                      <div>

                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Negative Marks
                        </label>

                        <input
                          type="number"
                          min={0}
                          value={
                            question.negative_marks
                          }
                          onChange={(e) =>
                            handleQuestionChange(
                              index,
                              "negative_marks",
                              e.target.value
                            )
                          }
                          placeholder="Negative Marks"
                          className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                        />

                      </div>

                    </div>

                    {/* EXPLANATION */}

                    <div>

                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Explanation
                      </label>

                      <textarea
                        value={
                          question.explanation
                        }
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            "explanation",
                            e.target.value
                          )
                        }
                        placeholder="Explanation (optional)"
                        rows={2}
                        className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                      />

                    </div>

                    {/* HINT */}

                    <div>

                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Hint
                      </label>

                      <input
                        type="text"
                        value={
                          question.hint
                        }
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            "hint",
                            e.target.value
                          )
                        }
                        placeholder="Hint (optional)"
                        className="mt-2 w-full rounded-xl border border-orange-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                      />

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* BUTTONS */}
          {/* ================================================= */}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-6 py-3 rounded-xl border border-orange-300 text-orange-600 bg-white font-bold text-sm hover:bg-orange-50 active:scale-95 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>

            <motion.button
              type="submit"
              whileHover={{
                scale: submitting
                  ? 1
                  : 1.02,
              }}
              whileTap={{
                scale: submitting
                  ? 1
                  : 0.98,
              }}
              disabled={submitting}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >

              {submitting && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}

              {isEditMode
                ? "Update Assessment"
                : "Create Assessment"}

            </motion.button>

          </div>

        </form>

      </div>

      {/* ================================================= */}
      {/* STATUS MODAL */}
      {/* ================================================= */}

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={handleStatusClose}
      />

    </div>
  );
}

// =====================================================
// ERROR TEXT
// =====================================================

function ErrorText({ message }) {
  return (
    <p className="text-xs mt-1 flex items-center gap-1 font-semibold text-red-600">

      <AlertCircle className="w-3.5 h-3.5" />

      {message}

    </p>
  );
}

// =====================================================
// CHECKBOX
// =====================================================

function CheckboxField({
  label,
  checked,
  onChange,
}) {
  return (
    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">

      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="w-4 h-4 accent-orange-500"
      />

      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>

    </label>
  );
}