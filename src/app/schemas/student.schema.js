import * as Yup from 'yup';

export const studentLoginSchema = Yup.object({
    enrollmentNo: Yup.string()
        .trim()
        .required('Enrollment Number is required'),
});

export const studentFormSchemaAdd = Yup.object({
  full_name: Yup.string().trim().required("Full Name is required"),
  roll_no: Yup.string()
    .trim()
    .required("Roll Number is required"),
  enrollment_no: Yup.string()
    .trim()
    .required("Enrollment Number is required"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phone: Yup.string()
    .trim()
    .required("Phone Number is required")
    .matches(/^\d{10}$/, "Phone Number must be exactly 10 digits"),
  course: Yup.string().trim().required("Course is required"),
  batch: Yup.string()
    .trim()
    .required("Batch is required")
    .matches(/^\d{4}-\d{4}$/, "Batch format should be like 2024-2026"),
  year: Yup.string()
    .required("Year is required")
    .oneOf(["1", "2", "3", "4", "5", "6"], "Year must be between 1 and 6"),
});

export const studentFormSchemaEdit = Yup.object({
  full_name: Yup.string().trim().required("Full Name is required"),
  roll_no: Yup.string()
    .trim()
    .required("Roll Number is required"),
  enrollment_no: Yup.string()
    .trim()
    .required("Enrollment Number is required"),
});