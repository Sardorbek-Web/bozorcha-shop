import { create } from "zustand";

function loadFavorites() {
  try {
    const raw = localStorage.getItem("favorites");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("favorites load xato:", error);
    return [];
  }
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  } catch (error) {
    console.error("favorites save xato:", error);
  }
}

export const useFavoritesStore = create((set, get) => ({
  favorites: [],

  initFavorites: () => {
    const favorites = loadFavorites();
    set({ favorites });
  },

  toggleFavorite: (product) => {
    if (!product?.id) return;

    const current = Array.isArray(get().favorites) ? get().favorites : [];
    const exists = current.some((item) => item?.id === product.id);

    let updated = [];

    if (exists) {
      updated = current.filter((item) => item?.id !== product.id);
    } else {
      updated = [
        ...current,
        {
          id: product.id,
          name: product.name || "Mahsulot",
          price: Number(product.price || 0),
          image: product.image || "",
        },
      ];
    }

    saveFavorites(updated);
    set({ favorites: updated });
  },

  removeFavorite: (id) => {
    const current = Array.isArray(get().favorites) ? get().favorites : [];
    const updated = current.filter((item) => item?.id !== id);

    saveFavorites(updated);
    set({ favorites: updated });
  },

  clearFavorites: () => {
    saveFavorites([]);
    set({ favorites: [] });
  },
}));