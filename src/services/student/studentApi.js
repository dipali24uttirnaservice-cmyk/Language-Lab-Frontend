import api from "../apiMethod/apiMethod";

export const studentApi = {
  // ===========================
  // STUDENT CRUD
  // ===========================

  getStudents: () => api.get("/student"),

  // Deleted students are soft-deleted (status: "inactive") and excluded
  // from the default list — fetch them explicitly for the Danger Zone page.
  getDeletedStudents: () => api.get("/student", { params: { status: "inactive" } }),

  getStudentById: (id) => api.get(`/student/${id}`),

  restoreStudent: (id) => api.put(`/student/${id}/toggle-status`),

  // Irreversible — removes the student document entirely. Only usable from
  // the Danger Zone, where the student is already soft-deleted.
  permanentlyDeleteStudent: (id) => api.delete(`/student/${id}/permanent`),

  bulkPermanentlyDeleteStudents: (ids) =>
    api.delete("/student/bulk-permanent-delete", { data: { ids } }),

  createStudent: (formData) =>
    api.post("/student", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  updateStudent: (id, data) =>
  api.put(`/student/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),

  deleteStudent: (id) =>
    api.delete(`/student/${id}`),

  bulkUploadStudents: (formData) =>
    api.post("/student/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // ===========================
  // LEARNING JOURNEY
  // ===========================

  // Courses available to enroll
  getAvailableCourses: () =>
    api.get("/student/me/available-courses"),

  // Courses already enrolled
  getEnrolledCourses: () =>
    api.get("/student/me/courses"),

  // Enroll in a course
  purchaseCourse: (courseId) =>
    api.post("/student/me/purchase-course", {
      course_id: courseId,
    }),
};