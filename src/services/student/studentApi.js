import api from "../apiMethod/apiMethod";

export const studentApi = {
  // ===========================
  // STUDENT CRUD
  // ===========================

  getStudents: () => api.get("/student"),

  getStudentById: (id) => api.get(`/student/${id}`),

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