import { create } from "zustand";

export const useUserStore = create((set) => ({
  telegramUser: null,
  profile: null,
  setTelegramUser: (telegramUser) => set({ telegramUser }),
  setProfile: (profile) => set({ profile }),
  clearUser: () => set({ telegramUser: null, profile: null }),
}));