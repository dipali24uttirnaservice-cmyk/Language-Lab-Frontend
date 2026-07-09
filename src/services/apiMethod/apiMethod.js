import axios from "axios";
import Cookies from "js-cookie";
import { clearAuthData } from "../../utils/cookie";

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const role = Cookies.get("role");
      clearAuthData();

      if (typeof window !== "undefined") {
        window.location.href = role === "institute" ? "/login" : "/student-login";
      }
    }

    return Promise.reject(error);
  }
);

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