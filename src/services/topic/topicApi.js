import api from "../apiMethod/apiMethod";

// ==================== TOPIC ====================

export const topicApi = {
  // Get All Topics
  getTopics: () => api.get("/topic"),

  // Get Single Topic
  getTopicById: (topicId) =>
    api.get(`/topic/${topicId}`),
};

// ==================== SUBTOPIC ====================

export const subtopicApi = {
  // Get Subtopics By Topic
  getSubtopicsByTopic: (topicId) =>
    api.get(`/subtopic/topic/${topicId}`),

  // Get Single Subtopic
  getSubtopicById: (subtopicId) =>
    api.get(`/subtopic/${subtopicId}`),
};

// ==================== MODULE ====================

// ==================== MODULE ====================

export const moduleApi = {
  // Get Modules By Subtopic
  getModulesBySubtopic: (type, subtopicId) =>
    api.get(`/module/${type}?subtopic_id=${subtopicId}`),

  // Get Single Module
  getModuleById: (type, moduleId) =>
    api.get(`/module/${type}/${moduleId}`),

  // --- Exercise Specific Endpoints ---

  // Submit Exercise Answers
  submitExercise: (exerciseId, payload) =>
    api.post(`/module/exercise/${exerciseId}/submit`, payload),

  // Get Latest Attempt Result
  getExerciseResult: (exerciseId) =>
    api.get(`/module/exercise/${exerciseId}/result`),

  // Get All Attempt History
  getExerciseAttempts: (exerciseId) =>
    api.get(`/module/exercise/${exerciseId}/attempts`),
};