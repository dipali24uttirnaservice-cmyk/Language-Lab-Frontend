import api from "../apiMethod/apiMethod";

export const getStudentProfile = () => {
  return api.get("/student/me");
};

export const updateStudentProfile = (data) => {
  return api.put("/student/me", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};