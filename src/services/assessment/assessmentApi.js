import api from "../apiMethod/apiMethod";

export const assessmentApi = {
  // GET /api/assessment
  // Optional: ?subject_id=xxx
  getAssessments: (params = {}) =>
    api.get("/assessment", { params }),

  // GET /api/assessment/:id
  getAssessment: (id) =>
    api.get(`/assessment/${id}`),

  // POST /api/assessment
  createAssessment: (payload) =>
    api.post("/assessment", payload),

  // PUT /api/assessment/:id
  updateAssessment: (id, payload) =>
    api.put(`/assessment/${id}`, payload),

  // DELETE /api/assessment/:id
  deleteAssessment: (id) =>
    api.delete(`/assessment/${id}`),

  // POST /api/assessment/bulk-upload
  bulkUploadAssessments: (formData) =>
    api.post("/assessment/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default assessmentApi;