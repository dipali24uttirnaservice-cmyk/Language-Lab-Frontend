import api from "../apiMethod/apiMethod";

export const facultyApi = {
  // Get all teachers for the logged-in institute
  getTeachers: (params = {}) => api.get("/institute/teachers", { params }),

  // Register a new teacher / faculty member
  registerTeacher: (data) => api.post("/institute/teachers", data),

  // Update teacher details & scope
  updateTeacher: (id, data) => api.put(`/institute/teachers/${id}`, data),

  // Delete teacher account
  deleteTeacher: (id) => api.delete(`/institute/teachers/${id}`),

  // Toggle teacher active status
  toggleStatus: (id) => api.patch(`/institute/teachers/${id}/toggle-status`),

  // Reset or regenerate teacher password
  resetPassword: (id, data) =>
    api.post(`/institute/teachers/${id}/reset-password`, data),
};
