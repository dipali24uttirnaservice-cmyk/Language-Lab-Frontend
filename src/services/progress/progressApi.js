import api from "../apiMethod/apiMethod";

export const progressApi = {
  getMyProgress: () => api.get("/progress/me"),
};
