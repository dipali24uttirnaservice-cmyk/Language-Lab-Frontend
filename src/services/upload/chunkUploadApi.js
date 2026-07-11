import api from "../apiMethod/apiMethod";

export const chunkUploadApi = {
  init: (payload) => api.post("/upload/chunk/init", payload),

  uploadChunk: (uploadId, chunkIndex, blob, { signal, onUploadProgress } = {}) => {
    const formData = new FormData();
    formData.append("chunk", blob);
    return api.post(`/upload/chunk/${uploadId}/${chunkIndex}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
      onUploadProgress,
    });
  },

  getStatus: (uploadId) => api.get(`/upload/chunk/${uploadId}/status`),

  complete: (uploadId) => api.post(`/upload/chunk/${uploadId}/complete`),
};
