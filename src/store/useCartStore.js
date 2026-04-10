import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [],

  addToCart: (product) => {
    const items = get().items;

    const existing = items.find((item) => item.id === product.id);

    if (existing) {
      set({
        items: items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            ...product,
            quantity: 1,
          },
        ],
      });
    }
  },

  removeFromCart: (id) => {
    set({
      items: get().items.filter((item) => item.id !== id),
    });
  },

  increase: (id) => {
    set({
      items: get().items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    });
  },

  decrease: (id) => {
    set({
      items: get()
        .items.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    return get().items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
  },

  getCount: () => {
    return get().items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );
  },
}));