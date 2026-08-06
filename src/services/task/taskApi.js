import api from "../apiMethod/apiMethod";

export const taskApi = {
  getTasks: (params = {}) => api.get("/task", { params }),

  getTaskById: (id) => api.get(`/task/${id}`),

  // Task media (audio/video/document) is uploaded separately via the
  // chunked-upload endpoints; /task itself only ever receives JSON, with
  // the resulting file URL passed as `media_url`.
  createTask: (payload) => api.post("/task", payload),

  updateTask: (id, payload) => api.put(`/task/${id}`, payload),

  deleteTask: (id) => api.delete(`/task/${id}`),

  getSubmissions: (id) => api.get(`/task/${id}/submissions`),

  gradeSubmission: (taskId, submissionId, data) =>
    api.put(`/task/${taskId}/submissions/${submissionId}`, data),
};
