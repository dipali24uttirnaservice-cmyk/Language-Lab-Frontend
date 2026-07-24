import api from "../apiMethod/apiMethod";

export const studentLogin = async (payload) => {
  return await api.post("/student/login", payload);
};

export const instituteLogin = async (payload) => {
  return await api.post("/institute/login", payload);
};

export const verifyInstituteCode = async (code) => {
  return await api.get(`/institute/verify-code/${code}`);
};

export const sendInstituteOtp = async (institute_code) => {
  return await api.post("/institute/send-otp", { institute_code });
};

export const verifyInstituteOtp = async (institute_code, otp) => {
  return await api.post("/institute/verify-otp", { institute_code, otp });
};

