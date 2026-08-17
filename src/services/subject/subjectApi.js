import api from "../apiMethod/apiMethod";

export const subjectApi = {
  // GET /api/subject
  subjectList: () =>
    api.get("/subject"),

  // GET /api/subject/:id
  subjectDetail: (id) =>
    api.get(`/subject/${id}`),

  // POST /api/subject
  createSubject: (payload) =>
    api.post("/subject", payload),

  // PUT /api/subject/:id
  updateSubject: (id, payload) =>
    api.put(`/subject/${id}`, payload),

  // DELETE /api/subject/:id
  deleteSubject: (id) =>
    api.delete(`/subject/${id}`),
};