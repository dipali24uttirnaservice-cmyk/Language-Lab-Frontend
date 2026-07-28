import * as Yup from "yup";

export const studentLoginSchema = Yup.object({
  instituteId: Yup.string().required("Please select your institute"),
  enrollmentNo: Yup.string().trim().required("Enrollment Number is required"),
  password: Yup.string().required("Password is required"),
});

export const studentFormSchemaAdd = Yup.object({
  full_name: Yup.string().trim().required("Full Name is required"),

  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be 6 characters")
    .max(6, "Password must be 6 characters"),

  roll_no: Yup.string().trim().required("Roll Number is required"),

  enrollment_no: Yup.string().trim().required("Enrollment Number is required"),

  segment: Yup.string().trim().required("Segment is required"),

  year: Yup.string()
    .required("Year is required")
    .oneOf(["1", "2", "3", "4", "5", "6"], "Year must be between 1 and 6"),
});

export const studentFormSchemaEdit = Yup.object({
  full_name: Yup.string().trim().required("Full Name is required"),

  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .notRequired()
    .test(
      "password-length",
      "Password must be 6 characters",
      (value) => !value || value.length === 6,
    ),

  phone: Yup.string()
    .trim()
    .matches(/^\d{10}$/, "Phone Number must be exactly 10 digits")
    .required("Phone Number is required"),

  roll_no: Yup.string().trim().required("Roll Number is required"),

  enrollment_no: Yup.string().trim().required("Enrollment Number is required"),

  segment: Yup.string().trim().required("Segment is required"),

  year: Yup.string()
    .required("Year is required")
    .oneOf(["1", "2", "3", "4", "5", "6"], "Year must be between 1 and 6"),
});
