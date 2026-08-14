import api from "../apiMethod/apiMethod";

export const taskApi = {
  getTasks: (params = {}) => api.get("/task", { params }),

  getTaskById: (id) => api.get(`/task/${id}`),

  // Task media (audio/video/document) now rides along in the same request
  // as a `taskMedia` multipart field — the backend saves it to its own disk
  // instead of AWS (see taskController.js) — so `payload` is a FormData
  // built by the caller, not a plain JSON object.
  createTask: (payload) =>
    api.post("/task", payload, { headers: { "Content-Type": "multipart/form-data" } }),

  updateTask: (id, payload) =>
    api.put(`/task/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } }),

  deleteTask: (id) => api.delete(`/task/${id}`),

  getSubmissions: (id) => api.get(`/task/${id}/submissions`),

  gradeSubmission: (taskId, submissionId, data) =>
    api.put(`/task/${taskId}/submissions/${submissionId}`, data),

  // Department (segment) + batch (year) combinations actually present among
  // this institute's students, with live student counts — backs the
  // Department/Batch selects on the Assign Task form. Same shape as
  // practicalManualDepartments: [{ name, batches: [{ year, studentCount }] }].
  getDepartments: () => api.get("/task/departments"),

  // Assigns a task to one department (segment) + batch (year) pair.
  assignTask: (id, payload) => api.put(`/task/${id}/assign`, payload),
};
