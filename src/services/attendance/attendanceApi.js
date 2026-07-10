import api from "../apiMethod/apiMethod";

export const attendanceApi = {
  getMyAttendance: (params = {}) => api.get("/attendance/me", { params }),
};
