import axios from "axios";
import Cookies from "js-cookie";

const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const api = axios.create({
  withCredentials: false,
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
