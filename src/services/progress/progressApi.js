import api from "../apiMethod/apiMethod";

export const progressApi = {
  getMyProgress: () => api.get("/progress/me"),
  getDashboardKPI: () => api.get("/progress/dashboard-kpi"),
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
  getTopicProgress: (topicId) => api.get(`/progress/topic/${topicId}`),
};
