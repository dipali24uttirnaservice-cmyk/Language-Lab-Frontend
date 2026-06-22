import { postApi } from "../apiMethod/apiMethod";

export const studentLogin = async (payload) => {
  return await postApi("/api/student/login", payload);
};

export const instituteLogin = async (payload) => {
  return await postApi("/api/institute/login", payload);
};