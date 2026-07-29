import * as Yup from "yup";

const REQUIRED = "This field is required.";


/**
 * Question Schema
 */
export const questionSchema = Yup.object({
  question_text: Yup.string()
    .trim()
    .required(REQUIRED),

  answer_key_html: Yup.string()
    .trim()
    .required(REQUIRED),

  answer_lines: Yup.number()
    .required(REQUIRED),
});


/**
 * Create Schema
 */
export const createPracticalManualSchema = Yup.object({

  title: Yup.string()
    .trim()
    .required(REQUIRED),

  course_id: Yup.string()
    .trim()
    .required(REQUIRED),

  topic_id: Yup.string()
    .trim()
    .nullable()
    .notRequired(),

  questions: Yup.array()
    .of(questionSchema)
    .min(1, REQUIRED)
    .required(REQUIRED),

});


/**
 * Update Schema
 */
export const updatePracticalManualSchema = Yup.object({

  title: Yup.string()
    .trim()
    .notRequired(),

  course_id: Yup.string()
    .trim()
    .notRequired(),

  topic_id: Yup.string()
    .trim()
    .nullable()
    .notRequired(),

  questions: Yup.array()
    .of(questionSchema)
    .min(1, REQUIRED)
    .notRequired(),

  remove_attachment: Yup.boolean()
    .notRequired(),

});