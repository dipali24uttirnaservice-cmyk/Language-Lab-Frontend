import api from "../apiMethod/apiMethod";

export const practicalManual = async (payload) => {
  return await api.post("/practical", payload);
};

export const practicalManualList = async (params) => {
  return await api.get("/practical", { params });
};

export const practicalManualDetail = async (id) => {
  return await api.get(`/practical/${id}`);
};

export const updatePracticalManual = async (id, payload) => {
  return await api.put(`/practical/${id}`, payload);
};

export const deletePracticalManual = async (id) => {
  return await api.delete(`/practical/${id}`);
};

export const getPracticalSubmissions = async (id) => {
  return await api.get(`/practical/${id}/submissions`);
};

export const gradePracticalSubmission = async (id, submissionId, payload) => {
  return await api.put(`/practical/${id}/submissions/${submissionId}`, payload);
};