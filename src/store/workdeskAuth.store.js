import { create } from "zustand";
import {
  workdeskLoginApi,
  workdeskMeApi,
  workdeskLogoutApi,
  workdeskRefreshTokenApi
} from "../api/workdeskAuth.api";

export const useWorkdeskAuthStore = create((set) => ({
  user: null,
  loading: true,

  login: async (data) => {
    const user = await workdeskLoginApi(data);
    set({ user, loading: false });
  },

  fetchMe: async () => {
    try {
      await workdeskRefreshTokenApi();
      const user = await workdeskMeApi();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  logout: async () => {
    await workdeskLogoutApi();
    set({ user: null });
  }
}));
