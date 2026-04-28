import axios from "axios";

const fallbackApiBase =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const workdeskBaseUrl = (
  import.meta.env.VITE_WORKDESK_API_BASE?.replace(/\/+$/, "") ||
  `${fallbackApiBase}/workdesk`
);

const workdeskAxios = axios.create({
  baseURL: workdeskBaseUrl,
  withCredentials: true,
});

let accessToken = null;

export const setWorkdeskAccessToken = (token) => {
  accessToken = token;
};

workdeskAxios.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

workdeskAxios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {  
        const refreshRes = await axios.post(
          `${workdeskBaseUrl}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        setWorkdeskAccessToken(refreshRes.data.accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${refreshRes.data.accessToken}`;

        return workdeskAxios(originalRequest);
      } catch {
        window.location.href = "/workdesk-login";
      }
    }

    return Promise.reject(error);
  }
);

export default workdeskAxios;



// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_WORKDESK_API_BASE;

// const workdeskAxios = axios.create({
//   baseURL: `${BASE_URL}/workdesk`,
//   withCredentials: true,
// });

// const refreshAxios = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// });

// let accessToken = null;

// export const setWorkdeskAccessToken = (token) => {
//   accessToken = token;
// };

// workdeskAxios.interceptors.request.use((config) => {
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// workdeskAxios.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refreshRes = await refreshAxios.post(
//           "/auth/refresh-token"
//         );

//         setWorkdeskAccessToken(refreshRes.data.accessToken);

//         originalRequest.headers.Authorization =
//           `Bearer ${refreshRes.data.accessToken}`;

//         return workdeskAxios(originalRequest);
//       } catch {
//         window.location.href = "/workdesk-login";
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default workdeskAxios;
