import api from "../apiMethod/apiMethod";

export const taskApi = {
  getTasks: (params = {}) => api.get("/task", { params }),

  getTaskById: (id) => api.get(`/task/${id}`),

  createTask: (formData) =>
    api.post("/task", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteTask: (id) => api.delete(`/task/${id}`),

  getSubmissions: (id) => api.get(`/task/${id}/submissions`),

  gradeSubmission: (taskId, submissionId, data) =>
    api.put(`/task/${taskId}/submissions/${submissionId}`, data),
};
