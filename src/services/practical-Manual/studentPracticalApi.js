import api from "../apiMethod/apiMethod";

export const studentPracticalApi = {
  getMine: (params = {}) => api.get("/practical/mine", { params }),

  getOneMine: (id) => api.get(`/practical/mine/${id}`),

  submit: (id, formData) =>
    api.post(`/practical/mine/${id}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
