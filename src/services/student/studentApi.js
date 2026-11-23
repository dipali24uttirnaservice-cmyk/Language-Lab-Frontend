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

  // ===========================
  // CONVERSATION LAB (1-ON-1 PEER SESSION)
  // ===========================
  getBatchmates: () =>
    api.get("/student/me/batchmates"),

  getActiveConversationSession: () =>
    api.get("/student/me/conversation-session/active"),

  startConversationSession: (partner_id) =>
    api.post("/student/me/conversation-session/start", { partner_id }),

  endConversationSession: (session_id) =>
    api.post("/student/me/conversation-session/end", { session_id }),

  sendMessage: (receiver_id, message, session_id) =>
    api.post("/student/me/messages", { receiver_id, message, session_id }),

  getMessages: (partnerId, sessionId) =>
    api.get(`/student/me/messages/${partnerId}`, {
      params: sessionId ? { sessionId } : {},
    }),
};