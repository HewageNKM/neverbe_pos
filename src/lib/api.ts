import axios from "axios";
import { auth } from "@/firebase/firebaseClient";

const API_BASE_URL = import.meta.env.PROD
  ? "https://api.neverbe.lk"
  : "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor — auto-inject Firebase auth token & set Content-Type
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser set the correct Content-Type for FormData (multipart/form-data with boundary)
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — unwrap data, handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Network error";
    console.error("[API Error]", message);
    return Promise.reject(new Error(message));
  },
);

export default api;
