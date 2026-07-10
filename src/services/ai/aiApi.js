import api from "../apiMethod/apiMethod";

export const aiApi = {
  getHistory: (params = {}) => api.get("/ai/history", { params }),
};
