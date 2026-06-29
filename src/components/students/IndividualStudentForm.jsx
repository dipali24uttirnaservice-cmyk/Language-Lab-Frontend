
"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { studentApi } from "@/services/student/studentApi";
import { studentFormSchemaAdd, studentFormSchemaEdit } from "@/app/schemas/student.schema";
import { useRouter } from "next/navigation";
import StatusModal from "@/components/molecules/StatusModal";

export default function IndividualStudentForm({
   studentId,

}) {

   const router = useRouter();

  const mode = studentId ? "edit" : "add";
  const [loading, setLoading] = useState(false);
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [errors, setErrors] = useState({});

  const initialState = {
    full_name: "",
    email: "",
    phone: "",
    roll_no: "",
    enrollment_no: "",
    batch: "",
    course: "",
    year: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialState);

  const [statusData, setStatusData] = useState({
  open: false,
  type: "success",
  title: "",
  message: "",
});

 useEffect(() => {
  if (!studentId) return;

  async function loadStudent() {
    try {
      setLoading(true);

      const response =
        await studentApi.getStudentById(studentId);

      const student = response.data.data;

      setFormData({
        full_name: student.full_name || "",
        email: student.email || "",
        phone: student.phone || "",
        roll_no: student.roll_no || "",
        enrollment_no: student.enrollment_no || "",
        batch: student.batch || "",
        course: student.course || "",
        year: student.year || "",
        status: student.is_active
          ? "active"
          : "inactive",
      });
    } finally {
      setLoading(false);
    }
  }

  loadStudent();
}, [studentId]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

 const handleSubmit = async () => {
  try {
    const schema =
      mode === "add"
        ? studentFormSchemaAdd
        : studentFormSchemaEdit;

    const dataToValidate = {
      full_name: formData.full_name,
      roll_no: formData.roll_no,
      enrollment_no: formData.enrollment_no,
      ...(mode === "add" && {
        email: formData.email,
        phone: formData.phone,
        course: formData.course,
        batch: formData.batch,
        year: String(formData.year),
      }),
    };

    await schema.validate(dataToValidate, {
      abortEarly: false,
    });

    setErrors({});
  } catch (err) {
    if (err.inner) {
      const newErrors = {};

      err.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });

      setErrors(newErrors);
    }

    return;
  }

  try {
    setLoading(true);

    if (mode === "add") {
      const userDataRaw = Cookies.get("userData");

      if (!userDataRaw) {
        throw new Error("Login session expired");
      }

      const userData = JSON.parse(userDataRaw);

      const instituteId =
        userData?.institute?.id ||
        userData?.institute?._id ||
        userData?.institute_id;

      if (!instituteId) {
        throw new Error("Institute ID not found");
      }

      const data = new FormData();

      data.append("full_name", formData.full_name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("roll_no", formData.roll_no);
      data.append("enrollment_no", formData.enrollment_no);
      data.append("batch", formData.batch);
      data.append("course", formData.course);
      data.append("year", formData.year);
      data.append("institute_id", instituteId);

      if (studentPhoto) {
        data.append("studentPhoto", studentPhoto);
      }

      await studentApi.createStudent(data);

      setStatusData({
        open: true,
        type: "success",
        title: "Student Added",
        message: "Student added successfully.",
      });

      setTimeout(() => {
        router.push("/institute-dashboard/students");
      }, 1500);
    } else {
      const updatePayload = {
        full_name: formData.full_name,
        roll_no: formData.roll_no,
        batch: formData.batch,
        status: formData.status,
      };

      await studentApi.updateStudent(
        studentId,
        updatePayload
      );

      setStatusData({
        open: true,
        type: "success",
        title: "Student Updated",
        message: "Student updated successfully.",
      });

      setTimeout(() => {
        router.push("/institute-dashboard/students");
      }, 1500);
    }
  } catch (error) {
    setStatusData({
      open: true,
      type: "error",
      title: mode === "add" ? "Add Failed" : "Update Failed",
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong.",
    });
  } finally {
    setLoading(false);
  }
};


 return (
  <div className="max-w-6xl mx-auto px-6 py-8">
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

      {/* Header */}
      <div className="border-b px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {mode === "add" ? "Add Student" : "Edit Student"}
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            {mode === "add"
              ? "Fill the information below to create a student."
              : "Update the student's information."}
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full hover:bg-slate-100 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter Full Name"
                value={formData.full_name}
                onChange={(e) =>
                  handleChange(
                    "full_name",
                    e.target.value
                  )
                }
                className={`border rounded-xl p-3 sm:p-3.5 w-full text-sm sm:text-base ${
                  errors.full_name
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errors.full_name && <div className="text-red-500 text-sm mt-1">{errors.full_name}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Roll Number</label>
              <input
                type="number"
                maxLength={20}
                placeholder="Roll Number"
                value={formData.roll_no}
                onChange={(e) =>
                  handleChange(
                    "roll_no",
                    e.target.value
                  )
                }
                className={`border rounded-xl p-3 sm:p-3.5 w-full text-sm sm:text-base ${
                  errors.roll_no
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errors.roll_no && <div className="text-red-500 text-sm mt-1">{errors.roll_no}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Enrollment Number</label>

              
           <input
  type="text"
  maxLength={20}
  placeholder="Enrollment Number"
  value={formData.enrollment_no}
  onChange={(e) =>
    handleChange("enrollment_no", e.target.value)
  }
  disabled={mode === "edit"}
  className={`w-full rounded-xl border p-3 sm:p-3.5 text-sm sm:text-base
    ${
      errors.enrollment_no
        ? "border-red-500"
        : "border-gray-300"
    }
    ${
      mode === "edit"
        ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-100"
        : "bg-white"
    }`}
 />
              {errors.enrollment_no && <div className="text-red-500 text-sm mt-1">{errors.enrollment_no}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Batch</label>
              <input
                type="text"
                placeholder="2024-2026"
                value={formData.batch}
                onChange={(e) =>
                  handleChange(
                    "batch",
                    e.target.value
                  )
                }
                className={`border rounded-xl p-3 sm:p-3.5 w-full text-sm sm:text-base ${
                  errors.batch
                    ? "border-red-500"
                    : ""
                }`}
              />
              {errors.batch && <div className="text-red-500 text-sm mt-1">{errors.batch}</div>}
            </div>

            {mode === "add" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="student@gmail.com"
                    value={formData.email}
                    onChange={(e) =>
                      handleChange(
                        "email",
                        e.target.value
                      )
                    }
                    className={`border rounded-xl p-3 sm:p-3.5 w-full text-sm sm:text-base ${
                      errors.email
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10 Digit Mobile Number"
                    value={formData.phone}
                    onChange={(e) =>
                      handleChange(
                        "phone",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    className={`border rounded-xl p-3 sm:p-3.5 w-full text-sm sm:text-base ${
                      errors.phone
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Course Name</label>
                  <input
                    type="text"
                    placeholder="Enter Course Name"
                    value={formData.course}
                    onChange={(e) =>
                      handleChange(
                        "course",
                        e.target.value
                      )
                    }
                    className={`border rounded-xl p-3 sm:p-3.5 w-full text-sm sm:text-base ${
                      errors.course
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {errors.course && <div className="text-red-500 text-sm mt-1">{errors.course}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">College Year</label>
                  <input
                    type="number"
                    placeholder="College Year (1-6)"
                    value={formData.year}
                    onChange={(e) =>
                      handleChange(
                        "year",
                        e.target.value
                      )
                    }
                    className={`border rounded-xl p-3 sm:p-3.5 w-full text-sm sm:text-base ${
                      errors.year
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {errors.year && <div className="text-red-500 text-sm mt-1">{errors.year}</div>}
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Student Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setStudentPhoto(
                        e.target.files?.[0]
                      )
                    }
                    className="border rounded-xl p-3 sm:p-3.5 w-full text-sm sm:text-base"
                  />
                </div>
              </>
            )}

            {mode === "edit" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleChange(
                      "status",
                      e.target.value
                    )
                  }
                  className="border rounded-xl p-3 sm:p-3.5 w-full text-sm sm:text-base"
                >
                  <option value="active">
                    Active
                  </option>
                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            )}
          </div>
      {/* Footer */}
      <div className="border-t px-6 py-5 flex justify-end gap-3">

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : mode === "add"
            ? "Add Student"
            : "Update Student"}
        </button>

      </div>
    </div>
    <StatusModal
      open={statusData.open}
      type={statusData.type}
      title={statusData.title}
      message={statusData.message}
      onClose={() =>
        setStatusData((prev) => ({
          ...prev,
          open: false,
        }))
      }
    />
  </div>
);
}
