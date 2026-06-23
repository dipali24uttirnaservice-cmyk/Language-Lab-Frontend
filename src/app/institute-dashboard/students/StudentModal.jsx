
"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { studentApi } from "@/services/student/studentApi";

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
  };

  const handleSubmit = async () => {
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
      console.error("STUDENT API ERROR:", error);

      onShowStatus?.({
        open: true,
        type: "error",
        title: "Operation Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
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
            <input
              type="text"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={(e) =>
                handleChange(
                  "full_name",
                  e.target.value
                )
              }
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Roll No"
              value={formData.roll_no}
              onChange={(e) =>
                handleChange(
                  "roll_no",
                  e.target.value
                )
              }
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Enrollment No"
              value={formData.enrollment_no}
              onChange={(e) =>
                handleChange(
                  "enrollment_no",
                  e.target.value
                )
              }
              disabled={mode === "edit"}
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Batch"
              value={formData.batch}
              onChange={(e) =>
                handleChange(
                  "batch",
                  e.target.value
                )
              }
              className="border rounded-xl p-3"
            />

            {mode === "add" && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    handleChange(
                      "email",
                      e.target.value
                    )
                  }
                  className="border rounded-xl p-3"
                />

                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    handleChange(
                      "phone",
                      e.target.value
                    )
                  }
                  className="border rounded-xl p-3"
                />

                <input
                  type="text"
                  placeholder="Course"
                  value={formData.course}
                  onChange={(e) =>
                    handleChange(
                      "course",
                      e.target.value
                    )
                  }
                  className="border rounded-xl p-3"
                />

                <input
                  type="number"
                  placeholder="Year"
                  value={formData.year}
                  onChange={(e) =>
                    handleChange(
                      "year",
                      e.target.value
                    )
                  }
                  className="border rounded-xl p-3"
                />

                <div className="col-span-full">
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
              <select
                value={formData.status}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value
                  )
                }
                className="border rounded-xl p-3"
              >
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
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
