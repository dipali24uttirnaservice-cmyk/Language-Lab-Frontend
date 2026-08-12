import api from "../apiMethod/apiMethod";

// ==================== STUDENT LEARNING ACCESS ====================
// Institute-side: grants a course/topic/subtopics slice to a department
// (Student.segment) + batch (Student.year).

export const studentLearningAccessApi = {
  // Departments/batches actually present among this institute's students,
  // with live student counts — for the Department/Batch selects.
  getDepartments: () => api.get("/institute/student-learning-access/departments"),

  // Topics available for a course (scoped to what this institute downloaded).
  getTopicsByCourse: (courseId) =>
    api.get(`/institute/student-learning-access/courses/${courseId}/topics`),

  // Real video/audio/text/exercise/vocabulary lessons under a subtopic —
  // backs the "click a subtopic to see its lessons" popup.
  getSubtopicModules: (subtopicId) =>
    api.get(`/institute/student-learning-access/subtopics/${subtopicId}/modules`),

  // List configured access records, optionally filtered.
  getAll: (params = {}) => api.get("/institute/student-learning-access", { params }),

  getById: (id) => api.get(`/institute/student-learning-access/${id}`),

  create: (payload) => api.post("/institute/student-learning-access", payload),

  update: (id, payload) => api.put(`/institute/student-learning-access/${id}`, payload),

  remove: (id) => api.delete(`/institute/student-learning-access/${id}`),
};
