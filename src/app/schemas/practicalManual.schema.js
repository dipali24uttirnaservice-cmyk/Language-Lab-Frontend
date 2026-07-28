import * as Yup from "yup";

const REQUIRED = "This field is required.";
const INVALID = "Enter valid inputs.";

/**
 * MongoDB ObjectId
 */
const objectIdSchema = Yup.string()
  .trim()
  .required(REQUIRED)
  .test("objectId", INVALID, (value) => {
    if (!value) return true;
    return /^[0-9a-fA-F]{24}$/.test(value);
  });

/**
 * Question Schema
 */
export const questionSchema = Yup.object({
  question_text: Yup.string()
    .trim()
    .required(REQUIRED)
    .min(3, INVALID)
    .max(1000, INVALID),

  answer_key_html: Yup.string()
    .trim()
    .required(REQUIRED),

  answer_lines: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .typeError(INVALID)
    .required(REQUIRED)
    .integer(INVALID)
    .min(1, INVALID)
    .max(50, INVALID),
});

/**
 * Create Schema
 */
export const createPracticalManualSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required(REQUIRED)
    .min(3, INVALID)
    .max(150, INVALID),

  course_id: objectIdSchema,

  topic_id: Yup.string()
    .trim()
    .test("topicId", INVALID, (value) => {
      if (!value) return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
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
    .min(3, INVALID)
    .max(150, INVALID)
    .notRequired(),

  course_id: Yup.string()
    .trim()
    .test("courseId", INVALID, (value) => {
      if (!value) return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .notRequired(),

  topic_id: Yup.string()
    .trim()
    .test("topicId", INVALID, (value) => {
      if (!value) return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .nullable()
    .notRequired(),

  questions: Yup.array()
    .of(questionSchema)
    .min(1, REQUIRED)
    .notRequired(),

  remove_attachment: Yup.boolean()
    .transform((value, originalValue) => {
      if (originalValue === "true") return true;
      if (originalValue === "false") return false;
      return value;
    })
    .notRequired(),
});

/**
 * Query Schema
 */
export const practicalQuerySchema = Yup.object({
  courseId: Yup.string()
    .trim()
    .test("courseId", INVALID, (value) => {
      if (!value) return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    }),

  topicId: Yup.string()
    .trim()
    .test("topicId", INVALID, (value) => {
      if (!value) return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    }),

  page: Yup.number()
    .integer(INVALID)
    .positive(INVALID)
    .default(1),

  limit: Yup.number()
    .integer(INVALID)
    .positive(INVALID)
    .max(100, INVALID)
    .default(20),
});

/**
 * Route Params
 */
export const practicalParamSchema = Yup.object({
  id: objectIdSchema,
});