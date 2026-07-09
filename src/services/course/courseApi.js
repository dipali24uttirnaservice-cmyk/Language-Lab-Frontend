import api from "../apiMethod/apiMethod";

export const courseApi = {
  getCourses: () => api.get("/institute/me/courses"),

  bulkAssignCourses: (data) =>
    api.post("/student/bulk-assign-courses", data),

  getModuleCount: (courseId) =>
    api.get(`/module/course/${courseId}/count`),
};