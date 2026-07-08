import * as Yup from "yup";

export const studentLoginSchema = Yup.object({
  enrollmentNo: Yup.string()
    .trim()
    .required("Enrollment Number is required"),
});

export const studentFormSchemaAdd = Yup.object({
  full_name: Yup.string()
    .trim()
    .required("Full Name is required"),

  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),

 password: Yup.string()
  .trim()
  .min(6, "Password must be at least 6 characters")
  .notRequired(),

  phone: Yup.string()
    .trim()
    .matches(/^\+?\d{10,15}$/, "Please enter a valid phone number")
    .required("Phone Number is required"),

  roll_no: Yup.string()
    .trim()
    .required("Roll Number is required"),

  enrollment_no: Yup.string()
    .trim()
    .required("Enrollment Number is required"),

  segment: Yup.string()
    .trim()
    .required("Segment is required"),

  year: Yup.string()
    .required("Year is required")
    .oneOf(["1", "2", "3", "4", "5", "6"], "Year must be between 1 and 6"),
});

export const studentFormSchemaEdit = Yup.object({
  full_name: Yup.string()
    .trim()
    .required("Full Name is required"),

  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),

  phone: Yup.string()
    .trim()
    .matches(/^\+?\d{10,15}$/, "Please enter a valid phone number")
    .required("Phone Number is required"),

  roll_no: Yup.string()
    .trim()
    .required("Roll Number is required"),

  enrollment_no: Yup.string()
    .trim()
    .required("Enrollment Number is required"),

  segment: Yup.string()
    .trim()
    .required("Segment is required"),

  year: Yup.string()
    .required("Year is required")
    .oneOf(["1", "2", "3", "4", "5", "6"], "Year must be between 1 and 6"),
});