import api from "../apiMethod/apiMethod";

export const dashboardApi = {
  // GET Institute Dashboard summary (stats, growth chart, status breakdown, recent activity)
  getDashboard: () => api.get("/institute/me/dashboard"),
};
