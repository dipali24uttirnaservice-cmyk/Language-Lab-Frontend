import {
  getApi,
  postApi,
  putApi,
  deleteApi,
} from "../apiMethod/apiMethod";

const STUDENT_BASE = "/students";

export const studentApi = {
  getStudents: (params) =>
    getApi(STUDENT_BASE, params),

  getStudentById: (id) =>
    getApi(`${STUDENT_BASE}/${id}`),

  createStudent: (data) =>
    postApi(STUDENT_BASE, data),

  updateStudent: (id, data) =>
    putApi(`${STUDENT_BASE}/${id}`, data),

  deleteStudent: (id) =>
    deleteApi(`${STUDENT_BASE}/${id}`),
};