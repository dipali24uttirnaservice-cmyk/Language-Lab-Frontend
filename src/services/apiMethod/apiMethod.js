import axios from "axios";
import Cookies from "js-cookie";
import { usePopupStore } from "@/store/usePopupStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
const masterApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MASTER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
// Separate cookie from the local "token" — master and the local backend sign
// with different JWT_SECRETs, so sending the local token here fails master's
// signature check ("invalid signature"). See instituteConfigLogin, which sets
// "masterToken" from master's own login response.
masterApi.interceptors.request.use((config) => {
  const token = Cookies.get("masterToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor
masterApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Deliberately NO "Connection Error" popup here for master's network
    // errors (unlike the local `api` instance below) — master being
    // unreachable is now an EXPECTED, handled condition in the offline-first
    // design (see courseApi.js's masterWithLocalFallback, instituteConfigLogin,
    // etc.), not a fatal one. Showing a blocking popup on every master call
    // that fails while offline would defeat the whole point of falling back
    // to the local backend's cached data silently. The caller's own
    // try/catch still sees this rejection and decides what to do with it.
    if (error.response?.status === 401) {
      // ---> SESSION EXPIRED ERROR <---
      usePopupStore
        .getState()
        .showPopup(
          "Session Expired",
          "Your session has expired. Please log in again.",
          {
            sessionExpired: true,
            onConfirm: () => {
              Cookies.remove("token");
              window.location.href = "/login";
            },
          },
        );
    }

    return Promise.reject(error);
  },
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // ---> CONNECTION ERROR <---
      usePopupStore
        .getState()
        .showPopup(
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
            },
          },
        );
    } else if (error.response.status === 401) {
      // ---> SESSION EXPIRED ERROR <---
      usePopupStore
        .getState()
        .showPopup(
          "Session Expired",
          "Your session has expired. Please log in again.",
          {
            sessionExpired: true,
            onConfirm: () => {
              Cookies.remove("token");
              window.location.href = "/login";
            },
          },
        );
    }

    return Promise.reject(error);
  },
);

export const getApi = (url, params = {}) => api.get(url, { params });

export const postApi = (url, data = {}) => api.post(url, data);

export const putApi = (url, data = {}) => api.put(url, data);

export const patchApi = (url, data = {}) => api.patch(url, data);

export const deleteApi = (url) => api.delete(url);

export const masterGetApi = (url, params = {}) =>
  masterApi.get(url, { params });

export const masterPostApi = (url, data = {}) => masterApi.post(url, data);

export const masterPutApi = (url, data = {}) => masterApi.put(url, data);

export const masterPatchApi = (url, data = {}) => masterApi.patch(url, data);

export const masterDeleteApi = (url) => masterApi.delete(url);
export const masterApiInstance = masterApi;




const getMediaUrl = (localUrl) => {
  if (!localUrl) return undefined;

  if (
    localUrl.startsWith("http://") ||
    localUrl.startsWith("https://")
  ) {
    return localUrl;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "");

  return `${baseUrl}${localUrl}`;
};
export default api;
