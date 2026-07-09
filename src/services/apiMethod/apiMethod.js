import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getApi = (url, params = {}) =>
  api.get(url, { params });

export const postApi = (url, data = {}) =>
  api.post(url, data);

export const putApi = (url, data = {}) =>
  api.put(url, data);

export const patchApi = (url, data = {}) =>
  api.patch(url, data);

export const deleteApi = (url) =>
  api.delete(url);

export default api;