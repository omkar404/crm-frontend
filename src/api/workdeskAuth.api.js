import workdeskAxios, {
  setWorkdeskAccessToken
} from "./workdeskAxios";

export const workdeskLoginApi = async (payload) => {
  const res = await workdeskAxios.post("/auth/login", payload);
  setWorkdeskAccessToken(res.data.accessToken);
  return {
    user: res.data.user,
    accessToken: res.data.accessToken,
  };
};

export const workdeskMeApi = async () => {
  const res = await workdeskAxios.get("/auth/me");
  return res.data.user;
};

export const createClient = (payload) => {
  return workdeskAxios.post("/clients", payload);
};

export const getClients = () => {
  return workdeskAxios.get("/clients?limit=1000");
};

export const workdeskRefreshTokenApi = async () => {
  const res = await workdeskAxios.post("/auth/refresh-token");
  setWorkdeskAccessToken(res.data.accessToken);
  return res.data.accessToken;
};

export const workdeskLogoutApi = async () => {
  await workdeskAxios.post("/auth/logout");
  setWorkdeskAccessToken(null);
};


