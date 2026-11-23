import api from "../apiMethod/apiMethod";

export const activityApi = {
  getMyActivity: () => api.get("/activity/me"),
  logActivity: (payload) => api.post("/activity", payload),
  // Pinged every ~60s while a student tab is open; institute's "Active Now"
  // tile reads students whose heartbeat landed in the last 5 minutes.
  heartbeat: () => api.post("/activity/heartbeat"),
};
