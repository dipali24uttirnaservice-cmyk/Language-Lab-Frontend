import api from "../apiMethod/apiMethod";

export const studentLogin = async (payload) => {
  return await api.post("/student/login", payload);
};

export const instituteLogin = async (payload) => {
  return await api.post("/institute/login", payload);
};

