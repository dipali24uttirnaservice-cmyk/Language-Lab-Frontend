import api from "../apiMethod/apiMethod";

export const courseApi = {
  getCourses: () => api.get("/institute/me/courses"),

  bulkAssignCourses: (data) =>
    api.put("/student/bulk-assign-courses", data),

  getModuleCount: (courseId) =>
    api.get(`/module/course/${courseId}/count`),

  downloadCourse: (courseId) =>
    api.get(`/institute/me/courses/${courseId}/download`),

  getCourseLastUpdated: (courseId) =>
    api.get(`/institute/me/courses/${courseId}/last-updated`),

  // Poll target while the backend finishes caching this course's videos to
  // local disk in the background (kicked off by downloadCourse above).
  getCourseDownloadStatus: (courseId) =>
    api.get(`/institute/me/courses/${courseId}/download-status`),
};