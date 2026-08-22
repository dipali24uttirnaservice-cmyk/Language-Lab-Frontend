import api from "../apiMethod/apiMethod";

// Student-facing Assessment flow — mirrors carrer-jupiter-frontend's IQ Test
// flow (TestCard.jsx / IQTest.jsx / TestResult.jsx) but wired to this
// project's Subject → Assessment → AssessmentAttempt backend
// (src/routes/assessmentRoutes.js).
export const studentAssessmentApi = {
  // Subjects (list all subjects → step 1 of the sidebar flow)
  getSubjects: () => api.get("/subject"),
  getSubject: (id) => api.get(`/subject/${id}`),

  // Assessments under a subject (step 2 — the "test list" grid)
  getAssessments: (subjectId) => api.get("/assessment", { params: { subject_id: subjectId } }),
  getAssessment: (id) => api.get(`/assessment/${id}`),

  // Attempt flow (step 3 — the actual test-taking screen)
  saveProgress: (id, payload) => api.post(`/assessment/${id}/save-progress`, payload),
  resume: (id) => api.get(`/assessment/${id}/resume`),
  submit: (id, payload) => api.post(`/assessment/${id}/submit`, payload),
  getResult: (id) => api.get(`/assessment/${id}/result`),
  getAttempts: (id) => api.get(`/assessment/${id}/attempts`),
};
