import api from "../apiMethod/apiMethod";

export const activityLogApi = {
  getActivityLog: (params = {}) => api.get("/institute/activity-log", { params }),

  exportActivityLog: (params = {}) =>
    api.get("/institute/activity-log/export", { params, responseType: "blob" }),

  // Powers the dashboard's "Active Now" tile — counts students whose
  // heartbeat landed in the last 5 minutes.
  getActiveCount: () => api.get("/institute/active-students-count"),
};
