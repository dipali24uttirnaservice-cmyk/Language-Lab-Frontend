import api from "../apiMethod/apiMethod";

export const profileApi = {
  // GET Institute Profile
  getProfile: () => api.get("/institute/me"),

  // UPDATE Institute Profile
  updateProfile: (data) =>
    api.put("/institute/me", data),
};