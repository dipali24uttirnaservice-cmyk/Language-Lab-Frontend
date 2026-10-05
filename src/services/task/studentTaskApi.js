import api from "../apiMethod/apiMethod";

export const studentTaskApi = {
  getMine: (params = {}) => api.get("/task/mine", { params }),

  getOneMine: (id) => api.get(`/task/mine/${id}`),

  // Remove the manual headers override so the browser can set the boundary automatically
  submit: (id, formData) => api.post(`/task/mine/${id}/submit`, formData),
};