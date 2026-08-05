import axios from "axios";
import Cookies from "js-cookie";
import { usePopupStore } from "@/store/usePopupStore";

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

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // ---> CONNECTION ERROR <---
      usePopupStore.getState().showPopup(
        "Connection Error",
        "Network error. Please check your internet connection.",
        {
          onConfirm: () => {
            // Check if navigator is explicitly offline, or try reloading.
            // If you want a safeguard: if navigator is offline, or if you want to route to login after a retry attempt:
            if (!navigator.onLine) {
              Cookies.remove("token");
              window.location.href = "/login";
            } else {
              // Reload page to retry the connection
              window.location.reload();
            }
          }
        }
      );
    } else if (error.response.status === 401) {
      // ---> SESSION EXPIRED ERROR <---
      usePopupStore.getState().showPopup(
        "Session Expired",
        "Your session has expired. Please log in again.",
        { 
          sessionExpired: true,
          onConfirm: () => {
            Cookies.remove("token");
            window.location.href = "/login";
          }
        }
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