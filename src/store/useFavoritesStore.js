import { create } from "zustand";

export const useFavoritesStore = create((set) => ({
  favoriteIds: [],
  setFavoriteIds: (favoriteIds) => set({ favoriteIds }),
}));