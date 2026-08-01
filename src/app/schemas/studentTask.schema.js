// Create this file at: src/app/schemas/studentTask.schema.js

import * as yup from "yup";

// Questions are optional — matches the backend (taskValidation.js's
// createTaskSchema/updateTaskSchema never require them) and are managed on
// the separate Add Question page after the task itself is created.
export const createStudentTaskSchema = yup.object({
  title: yup.string().required("Title is required"),
  course_id: yup.string().required("Course is required"),
  topic_id: yup.string().nullable(),
});

export const updateStudentTaskSchema = createStudentTaskSchema;