import api from "../apiMethod/apiMethod";

export const interactiveLearningApi = {
  // ── Institute / Faculty APIs ───────────────────────────────────────────────
  getTasks: (params = {}) => api.get("/interactive-task", { params }),

  getTaskById: (id) => api.get(`/interactive-task/${id}`),

  createTask: (payload) => api.post("/interactive-task", payload),

  updateTask: (id, payload) => api.put(`/interactive-task/${id}`, payload),

  deleteTask: (id) => api.delete(`/interactive-task/${id}`),

  getDepartments: () => api.get("/task/departments"),

  assignTask: (id, payload) =>
    api.put(`/interactive-task/${id}/assign`, payload),

  getSubmissions: (id) => api.get(`/interactive-task/${id}/submissions`),

  // ── Student APIs ───────────────────────────────────────────────────────────
  getStudentTasks: (courseId, params = {}) =>
    api.get(`/interactive-task/student/course/${courseId}`, { params }),

  getStudentTaskById: (id) =>
    api.get(`/interactive-task/student/${id}`),

  evaluateSpeech: (id, formData) =>
    api.post(`/interactive-task/student/${id}/evaluate`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  submitSpeech: (id, payload) =>
    api.post(`/interactive-task/student/${id}/submit`, payload),
};
