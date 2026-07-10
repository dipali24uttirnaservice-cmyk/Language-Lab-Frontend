import api from "../apiMethod/apiMethod";

export const activityApi = {
  getMyActivity: () => api.get("/activity/me"),
  logActivity: (payload) => api.post("/activity", payload),
};
