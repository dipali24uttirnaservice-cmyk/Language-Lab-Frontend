import api from "../apiMethod/apiMethod";

export const reportApi = {
  getTopicDetails: (studentId, courseId) =>
    api.get(`/institute/students/${studentId}/topic-details`, {
      params: courseId ? { courseId } : {},
    }),

  getExerciseReport: (studentId, courseId) =>
    api.get(`/institute/students/${studentId}/exercise-report`, {
      params: courseId ? { courseId } : {},
    }),

  getPracticalReport: (studentId, courseId) =>
    api.get(`/institute/students/${studentId}/practical-report`, {
      params: courseId ? { courseId } : {},
    }),

  getTaskReport: (studentId, courseId) =>
    api.get(`/institute/students/${studentId}/task-report`, {
      params: courseId ? { courseId } : {},
    }),

  getProgressReport: (studentId, courseId) =>
    api.get(`/institute/students/${studentId}/progress-report`, {
      params: courseId ? { courseId } : {},
    }),

  getActivitySummary: (studentId) =>
    api.get(`/institute/students/${studentId}/activity-summary`),

  getActivityHistory: (studentId, params = {}) =>
    api.get(`/institute/students/${studentId}/activity-history`, { params }),
};
