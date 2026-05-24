import { create } from "zustand";
import {
  workdeskLoginApi,
  workdeskMeApi,
  workdeskLogoutApi,
  workdeskRefreshTokenApi
} from "../api/workdeskAuth.api";
import { setWorkdeskAccessToken } from "../api/workdeskAxios";

const WORKDESK_AUTH_STORAGE_KEY = "workdesk_auth_session";

const readStoredSession = () => {
  if (typeof window === "undefined") {
    return { user: null, accessToken: null };
  }

  try {
    const rawValue = window.localStorage.getItem(WORKDESK_AUTH_STORAGE_KEY);
    if (!rawValue) {
      return { user: null, accessToken: null };
    }

    const parsed = JSON.parse(rawValue);
    return {
      user: parsed?.user || null,
      accessToken: parsed?.accessToken || null,
    };
  } catch {
    return { user: null, accessToken: null };
  }
};

const persistStoredSession = (user, accessToken) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!user || !accessToken) {
    window.localStorage.removeItem(WORKDESK_AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    WORKDESK_AUTH_STORAGE_KEY,
    JSON.stringify({ user, accessToken })
  );
};

const initialSession = readStoredSession();
if (initialSession.accessToken) {
  setWorkdeskAccessToken(initialSession.accessToken);
}

export const useWorkdeskAuthStore = create((set) => ({
  user: initialSession.user,
  loading: !initialSession.user,

  login: async (data) => {
    const { user, accessToken } = await workdeskLoginApi(data);
    persistStoredSession(user, accessToken);
    set({ user, loading: false });
  },

  fetchMe: async () => {
    try {
      const accessToken = await workdeskRefreshTokenApi();
      const user = await workdeskMeApi();
      persistStoredSession(user, accessToken);
      set({ user, loading: false });
    } catch {
      persistStoredSession(null, null);
      setWorkdeskAccessToken(null);
      set({ user: null, loading: false });
    }
  },

  logout: async () => {
    await workdeskLogoutApi();
    persistStoredSession(null, null);
    set({ user: null });
  }
}));
