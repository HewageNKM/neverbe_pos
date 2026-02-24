import axios from "axios";
import { auth } from "@/firebase/firebaseClient";

const API_BASE_URL = import.meta.env.PROD
  ? "https://api.neverbe.lk"
  : "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — auto-inject Firebase auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
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
