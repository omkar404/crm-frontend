import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
<<<<<<< HEAD
  // baseURL: "https://api.eximinq.co.in/",
  baseURL: "http://localhost:5000",
  // withCredentials: true,
=======
  // baseURL: "https://crm-backend-6aw1.onrender.com/",
  // baseURL: "https://api.eximinq.co.in/",
  baseURL: "http://localhost:5000/",
  withCredentials: false,
>>>>>>> 1067af153db8b8b566fd192c9a2e3aba0308253c
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;