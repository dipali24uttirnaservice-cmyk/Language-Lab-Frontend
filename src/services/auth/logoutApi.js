import api from "../apiMethod/apiMethod";

export const logoutUser = async () => {
  return api.post("/institute/logout");
};