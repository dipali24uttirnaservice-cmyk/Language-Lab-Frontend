import axios from "axios";
import Cookies from "js-cookie";
import { usePopupStore } from "@/store/usePopupStore"; // <-- 1. Import your popup store

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---> 2. ADD THIS RESPONSE INTERCEPTOR <---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is a network connection failure (offline / no internet)
    if (!error.response) {
      usePopupStore.getState().showPopup(
        "Connection Error",
        "Network error. Please check your internet connection."
      );
    } else if (error.response.status === 401) {
      // Optional: Handle token expiration globally if needed
      usePopupStore.getState().showPopup(
        "Session Expired",
        "Your session has expired. Please log in again."
      );
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