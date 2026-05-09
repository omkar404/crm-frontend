import axios from "axios";

const fallbackApiBase =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const workdeskBaseUrl =
  import.meta.env.VITE_WORKDESK_API_BASE?.replace(/\/+$/, "") ||
  `${fallbackApiBase}/workdesk`;

const workdeskClient = axios.create({
  baseURL: workdeskBaseUrl,
  withCredentials: true,
});

let accessToken = null;
let refreshPromise = null;

export const setWorkdeskAccessToken = (token) => {
  accessToken = token;
};

workdeskClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

workdeskClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(
              `${workdeskBaseUrl}/auth/refresh-token`,
              {},
              { withCredentials: true }
            )
            .finally(() => {
              refreshPromise = null;
            });
        }

        const refreshResponse = await refreshPromise;

        setWorkdeskAccessToken(refreshResponse.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;

        return workdeskClient(originalRequest);
      } catch {
        window.location.href = "/workdesk-login";
      }
    }

    return Promise.reject(error);
  }
);

export default workdeskClient;
