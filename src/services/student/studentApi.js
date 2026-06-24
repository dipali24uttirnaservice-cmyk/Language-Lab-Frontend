import api from "../apiMethod/apiMethod";

export const studentApi = {
  // GET all students
  getStudents: () => api.get("/student"),

  // GET single student by ID (for Edit)
  getStudentById: (id) => api.get(`/student/${id}`),

  // CREATE: Uses FormData for Multer (File Upload)
  createStudent: (formData) =>
    api.post("/student", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // UPDATE: Uses JSON for specific fields
  updateStudent: (id, data) => api.put(`/student/${id}`, data),

  // DELETE
  deleteStudent: (id) => api.delete(`/student/${id}`),
  
bulkUploadStudents: (formData) =>
    api.post("/student/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};