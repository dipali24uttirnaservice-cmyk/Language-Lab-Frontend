import api from "../apiMethod/apiMethod";

export const studentTaskApi = {
  getMine: (params = {}) => api.get("/task/mine", { params }),

  getOneMine: (id) => api.get(`/task/mine/${id}`),

  submit: (id, formData) =>
    api.post(`/task/mine/${id}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
