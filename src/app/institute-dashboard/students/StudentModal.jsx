
"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { studentApi } from "@/services/student/studentApi";
import { studentFormSchemaAdd, studentFormSchemaEdit } from "@/app/schemas/student.schema";

export default function StudentModal({
  open,
  onClose,
  mode = "add",
  student = null,
  onSuccess,
  onShowStatus,
}) {
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

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && student) {
      setFormData({
        full_name: student.full_name || "",
        email: student.email || "",
        phone: student.phone || "",
        roll_no: student.roll_no || "",
        enrollment_no: student.enrollment_no || "",
        batch: student.batch || "",
        course: student.course || "",
        year: student.year || "",
        status: student?.is_active ? "active" : "inactive",
      });
    } else {
      setFormData(initialState);
      setStudentPhoto(null);
    }
  }, [open, mode, student]);

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
      const schema = mode === "add" ? studentFormSchemaAdd : studentFormSchemaEdit;
      // create a clean object without extra fields that might not be in schema
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
        })
      };
      
      await schema.validate(dataToValidate, { abortEarly: false });
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

        console.log("Institute ID:", instituteId);

        if (!instituteId) {
          throw new Error("Institute ID not found");
        }

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

        console.log("ADDING STUDENT");

        for (const pair of data.entries()) {
          console.log(pair[0], pair[1]);
        }

        await studentApi.createStudent(data);
      } else {
        console.log("EDIT STUDENT:", student);

        const studentId = student?._id || student?.id;

        if (!studentId) {
          throw new Error("Student ID missing");
        }

        const updatePayload = {
          full_name: formData.full_name,
          roll_no: formData.roll_no,
          batch: formData.batch,
          status: formData.status,
        };

        console.log("UPDATE ID:", studentId);
        console.log("UPDATE PAYLOAD:", updatePayload);

        await studentApi.updateStudent(
          studentId,
          updatePayload
        );
      }

      onShowStatus?.({
        open: true,
        type: "success",
        title:
          mode === "add"
            ? "Student Added"
            : "Student Updated",
        message:
          mode === "add"
            ? "Student added successfully."
            : "Student updated successfully.",
      });

      await onSuccess?.();

      onClose();
    } catch (error) {
  const message =
    error?.response?.data?.message ??
    error?.message ??
    "Something went wrong";

  onShowStatus?.({
    open: true,
    type: "error",
    title: "Operation Failed",
    message,
  });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/60 flex justify-center items-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl"
        >
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {mode === "add"
                ? "Add Student"
                : "Update Student"}
            </h2>

            <button
              onClick={onClose}
              className="text-xl"
            >
              ✕
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className={`border rounded-xl p-3 w-full ${
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
                type="text"
                maxLength={20}
                placeholder="Roll Number"
                value={formData.roll_no}
                onChange={(e) =>
                  handleChange(
                    "roll_no",
                    e.target.value
                  )
                }
                className={`border rounded-xl p-3 w-full ${
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
                  handleChange(
                    "enrollment_no",
                    e.target.value
                  )
                }
                disabled={mode === "edit"}
                className={`border rounded-xl p-3 w-full ${
                  errors.enrollment_no
                    ? "border-red-500"
                    : ""
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
                className={`border rounded-xl p-3 w-full ${
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
                    className={`border rounded-xl p-3 w-full ${
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
                    className={`border rounded-xl p-3 w-full ${
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
                    className={`border rounded-xl p-3 w-full ${
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
                    className={`border rounded-xl p-3 w-full ${
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
                    className="border rounded-xl p-3 w-full"
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
                  className="border rounded-xl p-3 w-full"
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

          <div className="border-t px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 border rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 bg-orange-500 text-white rounded-xl disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : mode === "add"
                  ? "Add Student"
                  : "Update Student"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
