import { postApi } from "../apiMethod/apiMethod";

export const studentLogin = async (payload) => {
  return await postApi("/student/login", payload);
};

export const instituteLogin = async (payload) => {
  return await postApi("/institute/login", payload);
};