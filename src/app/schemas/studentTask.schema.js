// Create this file at: src/app/schemas/studentTask.schema.js

import * as yup from "yup";

const questionSchema = yup.object({
  question_text: yup.string().required("Question text is required"),
  answer_key_html: yup.string().required("Solution is required"),
  answer_lines: yup
    .number()
    .typeError("Must be a number")
    .min(1, "Minimum 1 line")
    .max(50, "Maximum 50 lines")
    .required("Answer lines is required"),
});

export const createStudentTaskSchema = yup.object({
  title: yup.string().required("Title is required"),
  course_id: yup.string().required("Course is required"),
  topic_id: yup.string().nullable(),
  questions: yup
    .array()
    .of(questionSchema)
    .min(1, "At least one question is required"),
});

export const updateStudentTaskSchema = createStudentTaskSchema;